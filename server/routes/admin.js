const express = require('express');
// const path = require('path')
const { isAdmin, db } = require('../js/middleware.js');
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
			db.query(q.ADD_LOG, [result[0].id, data.isIn, new Date().toISOString().slice(0, 19)], (err,result) => {
				if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
				console.log(result);
			})
			db.query(q.GET_INFO, [result[0].id], (err,result) => {
				if (err) { console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
				// if success do something here
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
		// console.log(result);
		res.json(result)
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

module.exports = app