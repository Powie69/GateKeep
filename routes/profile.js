const express = require('express');
// const fetch = require('node-fetch');
const crypto = require('crypto');
const {limiter ,isAuthenticated, db} = require('../js/middleware.js');
const q = require('../js/profileQuery.js')
const app = express.Router();

app.post('/login', limiter(30, 5),(req, res) => {
	const data = req.body;
	
	if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username) || /^09\d{9}$/.test(data.username)) || !/^[1-6]\d{11}$/.test(data.lrn) || !data.password) {
        return res.status(400).json({ message: "Email or Phone number, LRN, and password are required" });
    }

	db.query(q.LOGIN, [data.username, data.username, data.lrn, data.password], (err, result) => {
        if (err) {console.error('login SQL:', err); return res.status(500).send('Internal Server Error');}
        if (result.length === 0) {return res.status(401).json({ message: "Invalid email/phone, LRN, or password" });}

		req.session.authenticated = true;
		req.session.user = result[0].id;

        res.json({ message: "Login successful"});
		console.log(result[0]);
    });
});

app.post('/signup', (req, res) => {
	console.log(req.body)
	const data = req.body;

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !/^09\d{9}$/.test(data.phoneNumber) || !data.fullName || !/^[1-6]\d{11}$/.test(data.lrn)) {
		console.log("valid'nt signup (server)");
		res.status(400).json({ message: "Invalid input data" });
		return;
	}
	console.log("valid signup data (server)");

	db.query(q.SIGNUP_CHECK, [data.phoneNumber, data.lrn], (err, result) => {
		if (err) { console.error('SQL:', err); res.status(500).send('Internal Server Error'); return; }

		if (result.length > 0) {
			const existingData = result[0];
			if (existingData.phoneNumber === data.phoneNumber) {
				return res.status(409).json({ message: "Phone number already exists", field: "phoneNumber" });
			} else if (existingData.lrn === data.lrn) {
				return res.status(409).json({ message: "LRN already exists", field: "lrn" });
			}
		}

		try {
			db.query(q.SIGNUP, [data.email, data.phoneNumber, data.fullName, data.lrn, data.password,], (err,result) => {
				if (err) { console.error('SQL:', err); res.status(500).send('Internal Server Error'); return; }

				const hash = crypto.createHash('sha256').update(result.insertId.toString() + process.env.qrIdSecret.toString()).digest('hex').substring(0,80)

				db.query(q.ADD_QRID, [hash, result.insertId], (err, result) => {
					if (err) { console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
					console.log(result);
					console.log(`ADD_QR: ${hash}`);
				});
				db.query(q.INIT_INFO, [result.insertId, data.lrn], (err, result) => {
					if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
					console.log(`INIT_INFO: ${result.insertId}`)
				});

				req.session.authenticated = true;
				req.session.user = result.insertId;

				res.json({ message: "signup successful"});
			});
		} catch (error) {res.status(500).send('Internal Server Error'); console.error('Error:', error);}
	});
});

// requires 'isAuthenticated'

app.post('/', isAuthenticated, (req,res) => {
	console.log(req.session.user)
	res.json({ message: "You are authenticated"});
});

app.post('/logout', isAuthenticated, (req,res) => {
	console.log("user logout: " + req.session.user);
	req.session.destroy((err) => {
		if (err) {return res.status(500).json({ message: "Internal Server Error"})}
	})
	res.json({ message: "logout successful"});
})

app.post('/getData', isAuthenticated, (req,res) => {
	db.query(q.GET_INFO, [req.session.user], (err, result) => {
        if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		res.json(result[0]);
	})
});

app.post('/updateData', isAuthenticated, limiter(5,10),(req,res) => {
	const data = req.body;
	console.log(req.body);

	if (data.age != undefined && data.age <= -1 || data.age > 99) {return res.status(400).json({message: "bad data"});}
	if (data.sex != undefined && !(data.sex == 0 || data.sex == 1)) {return res.status(400).json({message: "bad data"});}
	for (const i in data) {if (data[i] != undefined && data[i].length > 60) {return res.status(400).json({message: "bad data"})}}

	db.query(q.UPDATE_INFO, [data.lastName, data.lastName, data.firstName, data.firstName, data.middleName, data.middleName, data.age, data.age, data.sex, data.sex, data.houseNo, data.houseNo, data.street, data.street, data.zip, data.zip, data.barangay, data.barangay, data.city, data.city, data.province, data.province, req.session.user], (err,result) => {
        if (err) {console.error('SQL:', err); return res.status(500).json({message: "Internal Server Error"});}
		console.log(result)
	})
	res.status(200).send();
});

app.post('/getMessage', isAuthenticated, limiter(200,10), (req,res) => {
	const data = req.body;
	if (!data.limit || data.offset == undefined || data.limit >= 25 || data.offset <= -1) {return res.status(400).send("bad data (server)")}
	db.query(q.GET_MESSAGE, [req.session.user, data.limit, data.offset], (err, result) => {
		if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (result.length == 0) {
			res.status(404).json({message: "No more messages found"})
		} else {
			res.json(result);
		}
	})
});

app.post('/getQrcode', isAuthenticated, (req,res) => {
	db.query(q.GET_QRCACHE, [req.session.user], (err,result) => {
		if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		if (!result || result.length == 0) {return res.status(418).send('something is very wrong...');}
		if (result[0].qrCache != null) {
			console.log("found qr cache: ", req.session.user);
			res.set('Content-Type', 'image/png')
			res.send(result[0].qrCache)
		} else {
			db.query(q.GET_QRID, [req.session.user], async (err,result) => {
				if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
				try {
					const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=10&data=${JSON.stringify(result[0])}`)
					if (!response.ok) {console.log(error); return res.status(500).send('Internal Server Error');}

					const qrImage = await response.buffer()
					db.query(q.ADD_QRCACHE, [qrImage, req.session.user], (err,result) => {
						if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
						console.log("qr add to cache: ", req.session.user);
					})
					res.set('Content-Type', 'image/png')
					res.status(201).send(qrImage)
				} catch (err) {console.log(err); return res.status(500).send('Internal Server Error');}
			})
		}
	})
});

module.exports = app;