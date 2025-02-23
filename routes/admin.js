const express = require('express');
const crypto = require('crypto');
const qrcode = require('qrcode');
const {isAdmin, limiter, db } = require('../js/middleware.js');
const {parseGender,parseName,logger,clients,adminClients} = require('../js/utility.js');
const q = require('../js/adminQuery.js');
const app = express.Router();

app.get('/',(req,res,next) => {
	if (/Mobile|Android|iP(hone|ad)/.test(req.headers['user-agent']) || typeof req.session.authenticated !== 'undefined' || req.session.authenticated === true) {
		return next('router'); // goes to 404 page
	}
	if (typeof req.session.isAdmin === 'undefined' || req.session.isAdmin === false) {
		return res.sendFile('views/admin/login.html',{root:'./'});
	}
	if (typeof req.query.account !== 'undefined') {
		return res.redirect('/admin/accounts');
	} // else
	res.redirect('/admin/panel');
})

app.post('/login', limiter(10,1),(req,res) => {
	if (crypto.createHash('sha256').update(req.body.password).digest('hex') != process.env.adminPassword) { // if hash dont match
		return res.status(401).json({message: "no."});
	}
	req.session.cookie.maxAge = 50400000; // 14 hours
	req.session.isAdmin = true;
	logger(1,`[${req.sessionID.substring(0,6)}] [${req.headers['user-agent']}] Logged in as admin.`);
	res.status(200).json({message:'success'});
})

//* requires 'isAdmin'

//
const isInvalidParams = (str) => !(/^\d+$/.test(str) && Number(str) >= 0);

app.get('/qr-image-create/:id',isAdmin,(req,res) => {
	const data = req.params.id
	if (isInvalidParams(data)) {return res.status(404).json({message: "not valid"});}
	db.query(q.GET_QRID, [data], async (err,result) => {
		if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/getQrImage] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
		if (!result || result.length == 0) {return res.status(404).json({message: "qr id not found for user"});}
		try {
			const qrImage = await qrcode.toString(JSON.stringify(result[0]), {type:'svg',width:10,margin:2,scale:1});
			const matches = [...qrImage.matchAll(/<path[^>]*d="([^"]*)"/g)];
			db.query(q.ADD_QRCACHE, [matches[1][1], data], (err) => {
				if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/getQrImage] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
				logger(1, `[${req.sessionID.substring(0,6)}] made qr image for ${data}`)
			})
			res.set('Content-Type', 'image/svg+xml');
			res.status(201).send(qrImage);
		} catch (err) {logger(3,err); return res.status(500).send('Internal Server Error');}
	})
})

app.get('/qr-image/:id',isAdmin,(req,res) => {
	const data = req.params.id
	if (isInvalidParams(data)) {return res.status(404).json({message: "not valid"});}
	db.query(q.GET_QRCACHE, [data], (err,result) => {
		if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/qr-image/:id] [SQL] ${JSON.stringify(err)}`); return res.status(500).josn({message: 'Internal Server Error'});}
		if (result.length !== 1) {return res.json({message:'not found'})}
		if (result[0].qrCache === null) {return res.json({message:'no qr image for user'})}
		res.set('Content-Type', 'image/svg+xml');
		return res.render('qr' , { path: result[0].qrCache })
	})
})

app.get('/info/:userId',isAdmin,(req,res) => {
	const userId = req.params.userId;
	if (isInvalidParams(data)) {return res.status(404).json({message: "not valid"});}
	if (typeof req.query.qr == 'undefined') {
		db.query(q.GET_INFO, [userId], (err,result) => {
			if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/getInfo] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
			if (result.length == 0) {return res.status(404).json({message: "user not found"});}
			result[0].sex = parseGender(result[0].sex);
			return res.json(result[0]);
		})
	} else {
		db.query(q.GET_INFO_WITH_QR, [userId], (err,result) => {
			if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/getInfo] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
			if (result.length == 0) {return res.status(404).json({message: "user not found"});}
			result[0].sex = parseGender(result[0].sex);
			res.json(result[0]);
		})
	}
})

app.get('/messages/:userId',isAdmin,(req,res) => {
	const data = req.query;
	if (isInvalidParams(data)) {return res.status(404).json({message: "not valid"});}
	if (!data.limit || typeof data.offset !== 'string' || data.offset <= -1 || data.limit > 25 || data.limit <= -1) {return res.status(400).send("bad data (server)")}
	db.query(q.GET_MESSAGE, [req.params.userId, +data.limit, +data.offset], (err, result) => {
		if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/getMessage] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
		if (result.length === 0) {
			res.status(404).json({message: "No more messages found"});
		} else {
			res.json(result);
		}
	})
})

//
app.use('/',isAdmin,express.static('node_modules/qr-scanner'));
if (process.env.NODE_ENV === 'production') {
	app.use('/assets',isAdmin,express.static('views/admin/assetsMinified'));
}
app.use('/',isAdmin,express.static('views/admin',{extensions:'html'}));

app.get('/logs',isAdmin,(req,res) => {
	res.render('admin/logs');
})

//
app.post('/send', isAdmin, (req,res) => {
	const data = req.body;
	if (!data || typeof data.qrId === 'undefined'|| typeof data.isIn !== 'boolean' || data.qrId == "") {return res.status(400).json({message:"bad data"});}

	db.query(q.GET_ID_VIA_QRID, [data.qrId], (err,result) => {
		if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/send] [SQL] ${JSON.stringify(err)}`); return res.status(500).json({message:'Internal Server Error'});}
		if (result.length == 0) {return res.status(404).json({message:"no Qr data found"})}
		const userId = result[0].id;
		db.query(q.PROCESS_MESSAGE, [userId,data.isIn,new Date().toISOString().slice(0, 19),userId],(err,result) => {
			if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/send/] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
			result[3][0].sex = parseGender(result[3][0].sex);
			result[3][0].name = parseName(result[3][0]);
			res.status(201).json(result[3][0]);
			broadcastWebsocketAdmin();
			const ws = clients.get(userId);
			if (!ws || ws.readyState !== 1) {return};
			ws.send(JSON.stringify(result[2][0]));
		})
	})
})

app.post('/logs/data',isAdmin,(req,res) => {
	const data = req.body;
	if (!data.limit || data.offset == undefined || data.limit > 40 || data.offset <= -1) {return res.status(400).send("bad data (server)")}
	db.query(q.GET_LOGS, [data.limit, data.offset], (err, result) => {
		if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/getMessage] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
		if (result.length === 0) {
			return res.status(404).json({message: "No more messages found"});
		}
		for (let i = 0; i < result.length; i++) {
			result[i].name = parseName(result[i]).slice(0,30);
			delete result[i].firstName;
			delete result[i].lastName;
			delete result[i].middleName;
		}
		res.json(result);
	})
})

app.post('/query', isAdmin, (req,res) => {
	const data = req.body;
	if (data.query.length == 0 && data.searchLevel == undefined && data.searchSection == undefined) {return res.status(400).send('Bad data')}
	db.query(q.GET_QUERY, [...new Array(10).fill(data.query), ...new Array(3).fill(data.searchLevel), ...new Array(3).fill(data.searchSection)], (err,result) => {
		if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/query] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
		if (result.length == 0) {return res.status(404).json({message: "no result for query"});}
		for (let i = 0; i < result.length; i++) {
			result[i].sex  = parseGender(result[i].sex)
		}
		res.json(result)
	})
})

app.post('/updateInfo', isAdmin, (req,res) => {
	const data = req.body;
	console.log(req.body);

	if ((typeof data.email != 'undefined' && data.email.length !== 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) || (typeof data.phoneNumber != 'undefined' && data.phoneNumber.length !== 0 && !/^09\d{9}$/.test(data.phoneNumber)) || (typeof data.lrn != 'undefined' && data.lrn.length !== 0 && !/^[1-6]\d{5}(0\d|1\d|2[0-5])\d{4}$/.test(data.lrn)) || (typeof data.gradeLevel != 'undefined' && data.gradeLevel.length !== 0 && (data.gradeLevel < 7 || data.gradeLevel > 12)) || (typeof data.zip !== 'undefined' && data.zip.length !== 0 && !/^(0[4-9]|[1-9]\d)\d{2}$/.test(data.zip))) {return res.status(400).json({message: "bad data"})}
	for (const i in data) {if (typeof data[i] !== undefined && data[i].length !== 0 && data[i].length >= 255) {return res.status(400).json({message: "bad data"})}}

	// console.log(db.format(q.UPDATE_INFO, [data.email, data.email, data.email, data.phoneNumber, data.phoneNumber, data.phoneNumber, data.lrn, data.lrn, data.lrn, data.password, data.password, data.password, data.userId, data.lastName, data.lastName, data.lastName, data.firstName, data.firstName, data.firstName, data.middleName, data.middleName, data.middleName, data.gradeLevel, data.gradeLevel, data.gradeLevel, data.section, data.section, data.section, data.age, data.age, data.age, data.sex, data.sex, data.sex, data.houseNo, data.houseNo, data.houseNo, data.street, data.street, data.street, data.zip, data.zip, data.zip, data.barangay, data.barangay, data.barangay, data.city, data.city, data.city, data.province, data.province, data.province, data.userId]))

	db.query(q.UPDATE_INFO, [data.email, data.email, data.email, data.phoneNumber, data.phoneNumber, data.phoneNumber, data.lrn, data.lrn, data.lrn, data.password, data.password, data.password, data.userId, data.lastName, data.lastName, data.lastName, data.firstName, data.firstName, data.firstName, data.middleName, data.middleName, data.middleName, data.gradeLevel, data.gradeLevel, data.gradeLevel, data.section, data.section, data.section, data.age, data.age, data.age, data.sex, data.sex, data.sex, data.houseNo, data.houseNo, data.houseNo, data.street, data.street, data.street, data.zip, data.zip, data.zip, data.barangay, data.barangay, data.barangay, data.city, data.city, data.city, data.province, data.province, data.province, data.userId], (err,result) => {
        if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/updateInfo] [SQL] ${JSON.stringify(err)}`); return res.status(500).json({message: "Internal Server Error"});}
		// console.log(result)
		res.status(200).json({message: "ok"});
	})
})

app.post('/create', isAdmin, (req,res) => {
	const data = req.body;
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !/^09\d{9}$/.test(data.phoneNumber) || !data.password ||!/^[1-6]\d{5}(0\d|1\d|2[0-5])\d{4}$/.test(data.lrn) || !data.lastName || data.lastName.length === 0 || !data.firstName || data.firstName.length === 0 || (typeof data.gradeLevel != undefined && data.gradeLevel.length != 0 && (data.gradeLevel < 7 || data.gradeLevel > 12)) || (typeof data.zip !== undefined && data.zip.length != 0 && !/^(0[4-9]|[1-9]\d)\d{2}$/.test(data.zip))) {return res.status(401).json({message: "bad data"});}
	console.log(data);

	// const hash = crypto.createHash('sha256').update(data.lrn + process.env.qrIdSecret).digest('hex').substring(0,25)
	// console.log(db.format(q.ADD_ACCOUNT, [data.email,data.phoneNumber,data.password,data.lrn,hash,data.lastName,data.lastName,data.lastName,data.firstName,data.firstName,data.firstName,data.middleName,data.middleName,data.middleName,data.lrn,data.lrn,data.lrn,data.gradeLevel,data.gradeLevel,data.gradeLevel,data.section,data.section,data.section,data.age,data.age,data.age,data.sex,data.sex,data.sex,data.houseNo,data.houseNo,data.houseNo,data.street,data.street,data.street,data.zip,data.zip,data.zip,data.barangay,data.barangay,data.barangay,data.city,data.city,data.city,data.province,data.province,data.province]));
	db.query(q.CHECK_ACCOUNT, [data.lrn], (err,result) => {
		if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/send] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
		if (result.length != 0) {return res.status(409).json({message: 'user with LRN already exist.'});}
		const hash = crypto.createHash('sha256').update(data.lrn + process.env.qrIdSecret).digest('hex').substring(0,25);
		db.query(q.ADD_ACCOUNT, [data.email,data.phoneNumber,data.password,data.lrn,hash,data.lastName,data.lastName,data.lastName,data.firstName,data.firstName,data.firstName,data.middleName,data.middleName,data.middleName,data.lrn,data.lrn,data.lrn,data.gradeLevel,data.gradeLevel,data.gradeLevel,data.section,data.section,data.section,data.age,data.age,data.age,data.sex,data.sex,data.sex,data.houseNo,data.houseNo,data.houseNo,data.street,data.street,data.street,data.zip,data.zip,data.zip,data.barangay,data.barangay,data.barangay,data.city,data.city,data.city,data.province,data.province,data.province], (err,result) => {
			if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/create] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
			logger(1, JSON.stringify(result))
			res.status(201).json({message: "all goods"})
		})
	})
})

app.post('/bulkCreate', isAdmin, async (req,res) => {
	let data = req.body.jsonData;
	if (typeof data !== 'string' || data.length === 0) {return res.status(400).json();}
	try {
		data = JSON.parse(data);
	} catch (err) {
		console.log(err);
		return res.status(400).json({message:err.message});
	}
	if (typeof data !== 'object' || data.length === 0) {return res.status(400).json({message:'No accounts in json'});}
	const lrn = new Set()
	for (let i = 0; i < data.length; i++) {
		if (lrn.has(data[i].lrn)) {
			return res.status(409).json({message:'accounts with same lrn found in data'});
		}
		if (typeof data[i].email === 'undefined' || data[i].email.length === 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[i].email) || typeof data[i].phoneNumber === 'undefined' || data[i].phoneNumber.length === 0 || !/^09\d{9}$/.test(data[i].phoneNumber) || typeof data[i].password === 'undefined' || data[i].password.length === 0 || typeof data[i].lrn === 'undefined' || data[i].lrn.length === 0 || !/^[1-6]\d{5}(0\d|1\d|2[0-5])\d{4}$/.test(data[i].lrn) || typeof data[i].lastName === 'undefined'  || data[i].lastName.length === 0 || typeof data[i].firstName === 'undefined' || data[i].firstName.length === 0 || (typeof data[i].gradeLevel != 'undefined' && data[i].gradeLevel.length != 0 && (data[i].gradeLevel < 7 || data[i].gradeLevel > 12)) || (typeof data[i].zip !== undefined && data[i].zip.length != 0 && !/^(0[4-9]|[1-9]\d)\d{2}/.test(data[i].zip))) {
			return res.status(400).json({message:'accounts have invalid values'});
		}
		lrn.add(data[i].lrn);
	}
	try {
		for (let i = 0; i < data.length; i++) {
			await new Promise((resolve,reject) => {
				db.query(q.CHECK_ACCOUNT, [data[i].lrn], (err,result) => {
					if (err) {console.error('SQL:', err); return reject({status:500,message:'Internal server error'})}
					if (result.length !== 0) {return reject({status:409,message:'user with LRN already exist.'});}
					resolve();
				})
			});
		}
	} catch (err) {
		console.log(err);
		res.status(err.status).json({message:err.message});
		return;
	}
	try {
		for (let i = 0; i < data.length; i++) {
			const account = data[i];
			const hash = crypto.createHash('sha256').update(account.lrn + process.env.qrIdSecret).digest('hex').substring(0,25);
			await new Promise((resolve,reject) => {
				db.query(q.ADD_ACCOUNT, [account.email,account.phoneNumber,account.password,account.lrn,hash,account.lastName,account.lastName,account.lastName,account.firstName,account.firstName,account.firstName,account.middleName,account.middleName,account.middleName,account.lrn,account.lrn,account.lrn,account.gradeLevel,account.gradeLevel,account.gradeLevel,account.section,account.section,account.section,account.age,account.age,account.age,account.sex,account.sex,account.sex,account.houseNo,account.houseNo,account.houseNo,account.street,account.street,account.street,account.zip,account.zip,account.zip,account.barangay,account.barangay,account.barangay,account.city,account.city,account.city,account.province,account.province,account.province], (err,result) => {
					if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/admin/BulkCreate] [SQL] ${JSON.stringify(err)}`); return reject({status:500,message:'Internal server error'})}
					resolve();
				})
			})
		}
	} catch (err) {
		console.log(err);
		res.status(err.status).json({message:err.message});
		return;
	}
	res.status(201).json({message: "all goods"})
})

app.post('/remove/check', isAdmin, limiter(10,1), (req,res) => {
	const data = req.body;
	if (typeof data === undefined || typeof data.id === undefined || data.id == '') {return res.status(400).json({message: 'bad data'});}
	db.query(q.REMOVE_ACCOUNT_CHECK, [data.id], (err,result) => {
		if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (result.length === 0) {return res.status(404).json({message: 'user not found'})}
		result = result[0];
		result.name = parseName(result)
		delete result.firstName;
		delete result.lastName;
		delete result.middleName;
		res.json(result)
	})
})

app.delete('/remove/confirm', isAdmin, limiter(10,1), (req,res) => {
	const data = req.body;
	if (typeof data.id === undefined || typeof data.id === '' || typeof data.lrn === undefined || data.lrn.length !== 12) {return res.status(400).json({message: 'bad data'});}
	db.query(q.REMOVE_ACCOUNT_CONFIRM, [data.id,data.lrn,data.id,data.id,data.lrn], (err,result) => {
		if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		logger(1,`removed ${data.lrn}`)
		res.json({message: "massive success"})
	})
})

function broadcastWebsocketAdmin() {
	db.query(q.GET_LATEST_MESSAGE, [], (err,result) => {
		if (err) {logger(3,`[broadcastWebsocketAdmin] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
		result = result[0]
		result.name = parseName(result).slice(0,30);
		delete result.firstName;
		delete result.lastName;
		delete result.middleName;
		adminClients.forEach((ws) => {
			if (!ws || ws.readyState !== 1) {return};
			ws.send(JSON.stringify(result));
		})
	})

}

module.exports = app;