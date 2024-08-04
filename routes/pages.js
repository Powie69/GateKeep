const express = require('express');
const {db, isAuthenticated} = require('../js/middleware.js');
const {parseGender,parseName,clients} = require('../js/utility.js');
const compression = require('compression');
const q = require('../js/profileQuery.js');
const expressWs = require('express-ws');
const app = express.Router();

const browsersRegex = [
	/Edg/,
	/Chrome/,
	/Firefox/,
]

app.get('/',(req,res) => {
	if (typeof req.session.authenticated === 'undefined' || req.session.authenticated === false || typeof req.session.user === 'undefined') {
		if (req.accepts('html')) {
			return res.sendFile('views/home.html',{root:'./'});
		}
	}
	db.query(q.GET_INFO, [req.session.user], (err,result) => {
        if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (result.length !== 1) {return res.status(500).send('Internal Server Error');}
		const data = result[0];
		res.render('dashBoard', {
			displayName: req.session.displayName,
			name: parseName(data),
			gradeLevel: data.gradeLevel,
			section: data.section,
			lrn: data.lrn,
			address: `${data.houseNo} ${data.street}, ${data.barangay}, ${data.city}`,
			// viewDialog
			firstName: data.firstName,
			lastName: data.lastName,
			middleName: data.middleName,
			age: data.age,
			sex: parseGender(data.sex),
			lrn: data.lrn,
			gradeLevel: data.gradeLevel,
			section: data.section,
			barangay: data.barangay,
			city: data.city,
			province: data.province,
			zip: data.zip,
			street: data.street,
			houseNo: data.houseNo,
			phoneNumber: data.phoneNumber,
			email: data.email
		})
	})
})

app.get('/qr', (req,res,next) => {
	if (typeof req.session.authenticated === 'undefined' || req.session.authenticated === false || typeof req.session.user === 'undefined') {
		return next('route'); // goes to 404
	}
	db.query(q.GET_QRCACHE,[req.session.user],(err,result) => {
        if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (result.length !== 1) {return res.status(500).send('Internal Server Error');}
		res.setHeader('Content-Type', 'image/svg+xml');
		res.send(result[0].qrCache);
	})
})

app.ws('/ws',(ws,req) => {
	if (!req.session.authenticated) {
		console.log("not auth");
		return ws.close();
	}
	clients.set(req.session.user, ws);

	ws.on('close', () => {
    	clients.delete(req.session.user);
	});	
})

app.get('/about',(req,res) => {
	return res.render('about',{
		displayName: req.session.displayName || 'No user',
	})
})

app.get('/help',(req,res) => {
	return res.render('help',{
		displayName: req.session.displayName || 'No user',
	})
})

app.get('/print',(req,res) => {
	if (typeof req.session.authenticated === 'undefined' || req.session.authenticated === false || typeof req.session.user === 'undefined') {
		return res.render('noUser', {message: 'Cannot print beacase you are not logged in'});
	}
	const ua = req.headers['user-agent'];
	let browser = 'Chrome'; // Default value
	for (const i of browsersRegex) {
		const match = ua.match(i);
		if (match) {
			if (match[0] === 'Edg') {
				browser = "Edge"; break;
			}
			browser = match[0]; break;
		}
	}
	db.query(q.GET_INFO_FOR_PRINT, [req.session.user],(err,result) => {
		if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		result = result[0]
		result.name = parseName(result)
		res.render('print', {
			displayName: req.session.displayName,
			name: result.name,
			gradeLevel: result.gradeLevel,
			section: result.section,
			browser: browser,
			// link: process.env[`printBrowser${browser}`]
		})
	})
})

module.exports = app;