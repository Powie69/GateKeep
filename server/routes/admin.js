const express = require('express');
const { isAdmin, db } = require('../js/middleware.js');
const q = require('../js/commands.js')
const app = express.Router();

app.post('/admin/login', (req,res) => {
	if (req.body.login != process.env.adminPassword) { res.send("big fail"); return; }
	console.log("big success");
	req.session.isAdmin = true
	res.json("big success")
})

app.post('/admin/check', isAdmin, (req,res) => {
	res.send("nice")
})

app.post('/admin/send', isAdmin, (req,res) => {
	const data = req.body;
	if (!data || data.qrId == undefined|| data.isIn == undefined || data.qrId == ""|| data.isIn == "" ||!(data.isIn >= 0 && data.isIn <= 1)) {return res.status(400).send("bad data");}

	db.query(q.FIND_QR, [data.qrId], (err,result) => {
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

module.exports = app