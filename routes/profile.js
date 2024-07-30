const express = require('express');
const {limiter ,isAuthenticated, db} = require('../js/middleware.js');
const {logger} = require('../js/utility.js')
const q = require('../js/profileQuery.js')
const app = express.Router();

app.post('/login', limiter(30, 5),(req, res) => {
	const data = req.body;
	
	if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username) || /^09\d{9}$/.test(data.username)) || !/^[1-6]\d{11}$/.test(data.lrn) || !data.password) {
        return res.status(400).json({ message: "Email or Phone number, LRN, and password are required" });
    }

	if (typeof req.session.authenticated !== 'undefined' || req.session.authenticated === true || typeof req.session.user !== 'undefined') {
		return res.status(400).json({message:'already auth'})
	}
	
	db.query(q.LOGIN, [data.username, data.username, data.lrn, data.password], (err, result) => {
        if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/profile/login] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
        if (result.length !== 1) {return res.status(401).json({ message: "Invalid email/phone, LRN, or password" });}
		req.session.authenticated = true;
		req.session.user = result[0].id;
		req.session.displayName = result[0].firstName;
		req.session.ua = req.headers['user-agent'];

        res.json({ message: "Login successful"});
		logger(1,`[${req.sessionID.substring(0,6)}] [${req.headers['user-agent']}] Logged in`)
    });
});

// requires 'isAuthenticated'

app.post('/logout', isAuthenticated, (req,res) => {
	req.session.destroy((err) => {
		if (err) {return res.status(500).json({ message: "Internal Server Error"})}
		res.json({ message: "logout successful"});
		logger(1,`[${req.sessionID.substring(0,6)}] [${req.headers['user-agent']}] Logged out.`)
	})
})

app.post('/getMessage', isAuthenticated, limiter(200,10), (req,res) => {
	const data = req.body;
	if (!data.limit || data.offset == undefined || data.limit >= 25 || data.offset <= -1) {return res.status(400).send("bad data (server)")}
	db.query(q.GET_MESSAGE, [req.session.user, data.limit, data.offset], (err, result) => {
		if (err) {logger(3,`[${req.sessionID.substring(0,6)}] [/profile/getMessage] [SQL] ${JSON.stringify(err)}`); return res.status(500).send('Internal Server Error');}
		if (result.length == 0) {
			return res.status(404).json({message: "No more messages found"});
		}
			res.json(result);
	})
});

module.exports = app;