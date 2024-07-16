const express = require('express');
const {db} = require('../js/middleware.js');
const q = require('../js/profileQuery.js')
const app = express.Router();

app.get('/',(req,res) => {
	if (typeof req.session.authenticated === 'undefined' || req.session.authenticated === false || typeof req.session.user === 'undefined') {
		return res.sendFile('views/home.html',{root: './' });
	}
	db.query(q.GET_INFO, [req.session.user], (err,result) => {
        if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (result.length !== 1) {return res.status(500).send('Internal Server Error');}
		const data = result[0];
		if (typeof data.middleName === 'undefined' || !data.middleName) { // if fatherless
			data.name = `${data.firstName} ${data.lastName}`;
		} else {
			data.name = `${data.firstName} ${data.middleName.charAt(0).toUpperCase()}. ${data.lastName}`;
		}
		res.render('dashboard', {
			displayName: data.firstName,
			name: data.name,
			gradeLevel: data.gradeLevel,
			section: data.section,
			lrn: data.lrn,
			address: `${data.houseNo} ${data.street}, ${data.barangay}, ${data.city}`
		})
	})
})

module.exports = app;