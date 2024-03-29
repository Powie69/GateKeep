const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const q = require('./commands.js');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// *middleware stuff
require('dotenv').config()

app.use(cors({ origin: process.env.corsOrigin.split(','), credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.cookieSecret,
	resave: false,
	cookie: {
		maxAge: 3600000,
		// secure: true,
		// sameSite: 'none',
		partitioned: true,
	},
	saveUninitialized: false,
}));

const db = mysql.createConnection({
    host: process.env.dbHost,
    user: process.env.dbUser,
    password: process.env.dbPassword,
    database: process.env.dbName
});

db.connect((err) => {
    if (err) { console.error(err); return; }
    console.log('Connected to MySQL');
});

const isAuthenticated = (req, res, next) => {
	if (req.session.authenticated) {
		next();
	} else {
		console.log(`profile: ${req.sessionID}`)
		res.status(418).json({ message: "Unauthorized access" });
	}
};

// **routes //

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
		if (err) {
            console.error('check SQL:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

		if (result.length > 0) {
            if (result.length > 0) {
				const existingData = result[0];
				if (existingData.phoneNumber === data.phoneNumber) {
					return res.status(409).json({ message: "Phone number already exists", field: "phoneNumber" });
				} else if (existingData.lrn === data.lrn) {
					return res.status(409).json({ message: "LRN already exists", field: "lrn" });
				}
			}
        }
		
		db.query(q.SIGNUP, [data.email, data.phoneNumber, data.fullName, data.lrn, data.password], (err,result) => {
			if (err) {
				console.error('insert SQL:', err);
				res.status(500).send('Internal Server Error');
				return;
			}

			req.session.authenticated = true;
        	req.session.user = result.insertId;

			db.query(q.INIT_INFO, [result.insertId, data.lrn], (err, result) => {
				if (err) {console.error('insert SQL:', err); res.status(500).send('Internal Server Error'); return;}
				console.log(`INIT_INFO: ${result.insertId}`)
			});

        	res.json({ message: "signup successful", result});
			console.log(req.sessionID);
		});
	});
});

app.post('/login', (req, res) => {
	console.log(req.body)
	const data = req.body;

	if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username) || /^09\d{9}$/.test(data.username)) || !/^[1-6]\d{11}$/.test(data.lrn) || !data.password) {
        return res.status(400).json({ message: "Email or Phone number, LRN, and password are required" });
    }

	db.query(q.LOGIN, [data.username, data.username, data.lrn, data.password], (err, result) => {
        if (err) {console.error('login SQL:', err); return res.status(500).send('Internal Server Error');}

        if (result.length === 0) { return res.status(401).json({ message: "Invalid email/phone, LRN, or password" }); }

        const user = result[0];
		
		req.session.authenticated = true;
		req.session.user = user.id;

        res.json({ message: "Login successful", user});
		console.log(req.sessionID);
    });
});

app.post('/profile', isAuthenticated, (req, res) => {
	console.log(req.session.user)
    res.json({ message: "You are authenticated", user: req.session.user });
});

app.post('/profile/getData', isAuthenticated, (req,res) => {
	db.query(q.GET_INFO, [req.session.user], (err, result) => {
        if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		res.json(result[0]);
	})
});

app.post('/profile/getMessage', isAuthenticated, (req,res) => {
	const data = req.body;
	// console.log(data.limit);
	if (!data.limit || data.offset === undefined || data.limit >= 25 || data.offset <= -1) {return res.status(400).send("bad data (server)")}
	db.query(q.GET_MESSAGE, [req.session.user, data.limit, data.offset], (err, result) => {
		if (err) {console.error('SQL:', err); return res.status(500).send('Internal Server Error');}
		res.json(result);
		console.log(result);
	})
});

// sanity check
app.post('/ping', (req, res) => {
	console.log("pong")
});
// **end of routes** //

app.listen(process.env.serverPort, () => {
	console.log(`Server is running on http://localhost:${process.env.serverPort}`);
});