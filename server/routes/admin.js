const express = require('express');
const fetch = require('node-fetch');
const crypto = require('crypto');
const { isAdmin, db } = require('../js/middleware.js');
const {parseGender} = require('../js/utility.js');
const q = require('../js/adminQuery.js');
const app = express.Router();
require('dotenv').config();

app.post('/login', (req,res) => {
	if (req.body.password != process.env.adminPassword) {res.status(401).json({message: "big fail"}); return; }
	console.log("big success");
	req.session.isAdmin = true;
})

app.post('/check', isAdmin, (req,res) => {
	res.send("nice")
})

app.post('/send', isAdmin, (req,res) => {
	const data = req.body;
	if (!data || data.qrId == undefined|| data.isIn == undefined || data.qrId == ""|| data.isIn == "" ||!(data.isIn >= 0 && data.isIn <= 1)) {return res.status(400).send("bad data");}

	db.query(q.GET_ID_VIA_QRID, [data.qrId], (err,result) => {
		if (err) { console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (result.length == 0) {return res.status(404).send("no Qr data found")}

		try {
			db.query(q.ADD_MESSAGE, [result[0].id, data.isIn, new Date().toISOString().slice(0, 19)], (err,result) => {
				if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
				console.log(result);
			})
			db.query(q.GET_INFO, [result[0].id], (err,result) => {
				if (err) { console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
				res.json(result[0])
			})
		} catch (error) { console.log(error); return res.status(500).send('Internal Server Error'); }
	})
})

app.post('/query', /*isAdmin,*/ (req,res) => {
	// console.log(req.body);
	const data = req.body;
	if (data.query.length == 0 && data.searchLevel == undefined && data.searchSection == undefined) {return res.status(400).send('Bad data')}
	db.query(q.GET_QUERY, [...new Array(10).fill(data.query), ...new Array(3).fill(data.searchLevel), ...new Array(3).fill(data.searchSection)], (err,result) => {
		if (err) { console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (result.length == 0) {return res.status(404).json({message: "user not found"});}
		for (let i = 0; i < result.length; i++) {
			for (const i1 in result[i]) {
				if (i1 == 'sex') {result[i].sex = parseGender(result[i][i1]);}
			}
		}
		res.json(result)
	})
})

app.post('/create', /*isAdmin*/ (req,res) => {
	const data = req.body;
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !/^09\d{9}$/.test(data.phoneNumber) || !data.password ||!/^[1-6]\d{5}(0\d|1\d|2[0-5])\d{4}$/.test(data.lrn) || !data.lastName || data.lastName.length === 0 || !data.firstName || data.firstName.length === 0 || (typeof data.gradeLevel != undefined && data.gradeLevel.length != 0 && (data.gradeLevel < 7 || data.gradeLevel > 12)) || (typeof data.zip !== undefined && data.gradeLevel.length != 0 && !/^(0[4-9]|[1-9]\d)\d{2}/.test(data.zip))) {return res.status(401).json({message: "bad data"});}
	console.log(data);
	
	// const hash = crypto.createHash('sha256').update(data.lrn + process.env.qrIdSecret).digest('hex').substring(0,25)
	// console.log(db.format(q.ADD_ACCOUNT, [data.email,data.phoneNumber,data.password,data.lrn,hash,data.lastName,data.lastName,data.lastName,data.firstName,data.firstName,data.firstName,data.middleName,data.middleName,data.middleName,data.lrn,data.lrn,data.lrn,data.gradeLevel,data.gradeLevel,data.gradeLevel,data.section,data.section,data.section,data.age,data.age,data.age,data.sex,data.sex,data.sex,data.houseNo,data.houseNo,data.houseNo,data.street,data.street,data.street,data.zip,data.zip,data.zip,data.barangay,data.barangay,data.barangay,data.city,data.city,data.city,data.province,data.province,data.province]));
	db.query(q.CHECK_ACCOUNT, [data.lrn], (err,result) => {
		if (err) { console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (result.length != 0) {return res.status(409).json({message: 'user with LRN already exist.'});}
		const hash = crypto.createHash('sha256').update(data.lrn + process.env.qrIdSecret).digest('hex').substring(0,25);
		db.query(q.ADD_ACCOUNT, [data.email,data.phoneNumber,data.password,data.lrn,hash,data.lastName,data.lastName,data.lastName,data.firstName,data.firstName,data.firstName,data.middleName,data.middleName,data.middleName,data.lrn,data.lrn,data.lrn,data.gradeLevel,data.gradeLevel,data.gradeLevel,data.section,data.section,data.section,data.age,data.age,data.age,data.sex,data.sex,data.sex,data.houseNo,data.houseNo,data.houseNo,data.street,data.street,data.street,data.zip,data.zip,data.zip,data.barangay,data.barangay,data.barangay,data.city,data.city,data.city,data.province,data.province,data.province], (err,result) => {
			if (err) { console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
			console.log(result);
			res.status(201).json({message: "all goods"})
		})
	})
})

app.post('/updateInfo', /*isAdmin*/ (req,res) => {
	const data = req.body;
	console.log(req.body);

	if ((typeof data.email != undefined && data.email.length != 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) || (typeof data.phoneNumber != undefined && data.phoneNumber.length != 0 && !/^09\d{9}$/.test(data.phoneNumber)) || (typeof data.password != undefined && data.password.length != 0) || (typeof data.lrn != undefined && data.lrn.length != 0 && !/^[1-6]\d{5}(0\d|1\d|2[0-5])\d{4}$/.test(data.lrn)) || (typeof data.gradeLevel != undefined && data.gradeLevel.length != 0 && (data.gradeLevel < 7 || data.gradeLevel > 12)) || (typeof data.zip !== undefined && data.zip.length != 0 && !/^(0[4-9]|[1-9]\d)\d{2}$/.test(data.zip))) {return res.status(400).json({message: "bad data"})}
	for (const i in data) {if (typeof data[i] !== undefined && data[i].length !== 0 && data[i].length >= 255) {return res.status(400).json({message: "bad data"})}}

	// console.log(db.format(q.UPDATE_INFO, [data.email, data.email, data.email, data.phoneNumber, data.phoneNumber, data.phoneNumber, data.lrn, data.lrn, data.lrn, data.password, data.password, data.password, data.userId, data.lastName, data.lastName, data.lastName, data.firstName, data.firstName, data.firstName, data.middleName, data.middleName, data.middleName, data.gradeLevel, data.gradeLevel, data.gradeLevel, data.section, data.section, data.section, data.age, data.age, data.age, data.sex, data.sex, data.sex, data.houseNo, data.houseNo, data.houseNo, data.street, data.street, data.street, data.zip, data.zip, data.zip, data.barangay, data.barangay, data.barangay, data.city, data.city, data.city, data.province, data.province, data.province, data.userId]))

	db.query(q.UPDATE_INFO, [data.email, data.email, data.email, data.phoneNumber, data.phoneNumber, data.phoneNumber, data.lrn, data.lrn, data.lrn, data.password, data.password, data.password, data.userId, data.lastName, data.lastName, data.lastName, data.firstName, data.firstName, data.firstName, data.middleName, data.middleName, data.middleName, data.gradeLevel, data.gradeLevel, data.gradeLevel, data.section, data.section, data.section, data.age, data.age, data.age, data.sex, data.sex, data.sex, data.houseNo, data.houseNo, data.houseNo, data.street, data.street, data.street, data.zip, data.zip, data.zip, data.barangay, data.barangay, data.barangay, data.city, data.city, data.city, data.province, data.province, data.province, data.userId], (err,result) => {
        if (err) {console.error('SQL:', err); return res.status(500).json({message: "Internal Server Error"});}
		console.log(result)
		res.status(200).json({message: "ok"});
	})
})

app.post('/getMessage', /*isAdmin,*/ (req,res) => {
	const data = req.body;
	if (!data.limit || data.offset == undefined || data.limit >= 25 || data.offset <= -1) {return res.status(400).send("bad data (server)")}
	db.query(q.GET_MESSAGE, [data.userId, data.limit, data.offset], (err, result) => {
		if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (result.length == 0) {
			res.status(404).json({message: "No more messages found"})
		} else {
			res.json(result);
		}
	})
});

app.post('/getInfo', /*isAdmin,*/ (req,res) => {
	const data = req.body;
	if (!data || data.userId == undefined || data.withQrId == undefined) {return res.status(400).send("bad data (server)")}
	if (data.withQrId) {
		db.query(q.GET_INFO_WITH_QRID, [data.userId], (err,result) => {
			if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
			if (result.length == 0) {return res.status(404).json({message: "user not found"});}
			for (const i in result[0]) {
				if (i == 'sex') {result[0].sex = parseGender(result[0].sex);}
			}
			res.json(result[0]);
		})
		return;
	}
	db.query(q.GET_INFO, [data.userId], (err,result) => {
		if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (result.length == 0) {return res.status(404).json({message: "user not found"});}
		for (let i in result[0]) {
			if (i == 'sex') {result[0].sex = parseGender(result[0].sex);}
		}
		return res.json(result[0]);
	})
})

app.post('/getQrImage', /*isAdmin*/ (req,res) => {
	const data = req.body
	if (!data || data.userId == undefined) {return res.status(400).send("bad data (server)")}
	db.query(q.GET_QRCACHE, [data.userId], (err,result) => {
		if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (!result || result.length == 0) {return res.status(404).json({message: "user not found"});}
		if (result[0].qrCache != null) {
			res.set('Content-Type', 'image/svg+xml');
			return res.send(result[0].qrCache);
		}
		db.query(q.GET_QRID, [data.userId], async (err,result) => {
			if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
			if (!result || result.length == 0) {return res.status(404).json({message: "qr id not found for user"});}
			try {
				const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=25x25&qzone=2&format=svg&data=${JSON.stringify(result[0])}`, {
					method: 'GET',
				});
				if (!response.ok) {console.log(error); return res.status(500).send('Internal Server Error');}
				const qrImage = await response.buffer();
				db.query(q.ADD_QRCACHE, [qrImage, data.userId], (err) => {
					if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
				})
				res.set('Content-Type', 'image/svg+xml');
				res.status(201).send(qrImage)
			} catch (err) {console.log(err); return res.status(500).send('Internal Server Error');}
		})
	})
})

module.exports = app;
