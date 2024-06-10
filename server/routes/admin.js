const express = require('express');
const fetch = require('node-fetch');
const crypto = require('crypto');
const { isAdmin, db } = require('../js/middleware.js');
const {parseGender} = require('../js/utility.js')
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

app.post('/create', /*isAdmin*/ (req,res,next) => {
	const data = req.body;

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !/^09\d{9}$/.test(data.phoneNumber) || !data.password ||!/^[1-6]\d{11}$/.test(data.lrn) || !data.lastName || !data.firstName) {return res.status(400).json({message: "bad data"})}
	console.log(data);

	db.query(q.CHECK_ACCOUNT, [data.lrn], (err,result) => {
		if (err) { console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (result.length != 0) {return res.status(409).json({message: 'user with LRN already exist.'});}

		// console.log(db.format(q.ADD_ACCOUNT, [data.email,data.phoneNumber,data.password,data.lrn,data.lastName,data.lastName,data.lastName,data.firstName,data.firstName,data.firstName,data.middleName,data.middleName,data.middleName,data.lrn,data.lrn,data.lrn,data.gradeLevel,data.gradeLevel,data.gradeLevel,data.section,data.section,data.section,data.age,data.age,data.age,data.sex,data.sex,data.sex,data.houseNo,data.houseNo,data.houseNo,data.street,data.street,data.street,data.zip,data.zip,data.zip,data.barangay,data.barangay,data.barangay,data.city,data.city,data.city,data.province,data.province,data.province]));
		db.query(q.ADD_ACCOUNT, [data.email,data.phoneNumber,data.password,data.lrn,data.lastName,data.lastName,data.lastName,data.firstName,data.firstName,data.firstName,data.middleName,data.middleName,data.middleName,data.lrn,data.lrn,data.lrn,data.gradeLevel,data.gradeLevel,data.gradeLevel,data.section,data.section,data.section,data.age,data.age,data.age,data.sex,data.sex,data.sex,data.houseNo,data.houseNo,data.houseNo,data.street,data.street,data.street,data.zip,data.zip,data.zip,data.barangay,data.barangay,data.barangay,data.city,data.city,data.city,data.province,data.province,data.province], (err,result) => {
			if (err) { console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
			const hash = crypto.createHash('sha256').update(result[1].insertId.toString() + process.env.qrIdSecret.toString()).digest('hex').substring(0,80)
			db.query(q.ADD_ACCOUNT_QRID, [hash,result[1].insertId], (err,result) => {
				if (err) { console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
				console.log('letssgooo');
				console.log(result);
			})
		})
		res.status(201).json({message: "all goods"})
	})
})

app.post('/updateInfo', /*isAdmin*/ (req,res) => {
	const data = req.body;
	console.log(req.body);

	if (data.age != undefined && data.age <= -1 || data.age > 99) {return res.status(400).json({message: "bad data"});}
	if (data.sex != undefined && !(data.sex == 0 || data.sex == 1)) {return res.status(400).json({message: "bad data"});}
	for (const i in data) {if (data[i] != undefined && data[i].length > 60) {return res.status(400).json({message: "bad data"})}}

	db.query(q.UPDATE_INFO, [...new Array(2).fill(data.lastName), ...new Array(2).fill(data.firstName), ...new Array(2).fill(data.middleName), ...new Array(2).fill(data.lrn), ...new Array(2).fill(data.gradeLevel), ...new Array(2).fill(data.section), ...new Array(2).fill(data.age), ...new Array(2).fill(data.sex), ...new Array(2).fill(data.houseNo), ...new Array(2).fill(data.street), ...new Array(2).fill(data.zip), ...new Array(2).fill(data.barangay), ...new Array(2).fill(data.city), ...new Array(2).fill(data.province), data.userId], (err,result) => {
        if (err) {console.error('SQL:', err); return res.status(500).json({message: "Internal Server Error"});}
		console.log(result)
	})
	res.status(200).json({message: "ok"});
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
	const data = req.body
	if (!data || data.userId == undefined || data.withQrId == undefined) {return res.status(400).send("bad data (server)")}
	if (data.withQrId) {
		db.query(q.GET_INFO_WITH_QRID, [data.userId], (err,result) => {
			if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
			if (result.length == 0) {return res.status(404).json({message: "user not found"});}
			for (const i in result[0]) {
				if (i == 'sex') {result[0].sex = parseGender(result[0][i]);}
			}
			res.json(result[0]);
		})
		return;
	}
	db.query(q.GET_INFO, [data.userId], (err,result) => {
		if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (result.length == 0) {return res.status(404).json({message: "user not found"});}
		for (const i in result[0]) {
			if (i == 'sex') {result[0].sex = parseGender(result[0][i]);}
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
			res.set('Content-Type', 'image/png')
			return res.send(result[0].qrCache)
		}
		db.query(q.GET_QRID, [data.userId], async (err,result) => {
			if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
			try {
				const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=10&data=${JSON.stringify(result[0])}`)
				if (!response.ok) {console.log(error); return res.status(500).send('Internal Server Error');}
				const qrImage = await response.buffer()
				db.query(q.ADD_QRCACHE, [qrImage, data.userId], (err,result) => {
					if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
				})
				res.set('Content-Type', 'image/png')
				res.status(201).send(qrImage)
			} catch (err) {console.log(err); return res.status(500).send('Internal Server Error');}
		})
	})
})

module.exports = app