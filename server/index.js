const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const q = require('./commands');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// *middleware stuff
app.use(cors({ origin: 'http://127.0.0.1:5500', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'uwu',
	resave: false,
    cookie: { 
		maxAge: 3600000 ,
		sameSite: 'None',
		// secure: true
		Partitioned: true,
	},
	saveUninitialized: false,
}));

app.use((req, res, next) => {
    if (!req.session.authenticated) {
        req.session.authenticated = false;
    }
    next();
});

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'bananas',
    database: 'gatekeep'
});

db.connect((err) => {
    if (err) { console.error(':', err); return; }
    console.log('Connected to MySQL');
});

// *routes
app.post('/signup', (req, res) => {
	console.log(req.body)
	const data = req.body;

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !/^09\d{9}$/.test(data.phoneNumber) || !data.fullName || !/^[1-6]\d{11}$/.test(data.lrn)) {
		console.log("valid'nt signup (server)");
		res.status(400).json({ message: "Invalid input data" });
		return;
	}
	console.log("valid signup data (server)");

	db.query(q.CHECK, [data.phoneNumber, data.lrn], (err, result) => {
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
			console.log('insert suc:', result);
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
		console.log(result)

        if (result.length === 0) {
            return res.status(401).json({ message: "Invalid email/phone, LRN, or password" });
        }

        const user = result[0];
		
		req.session.authenticated = true;
        req.session.user = user;

		// console.log(req.session.authenticated);
		
        res.json({ message: "Login successful", user});
		// res.json(req.session.user);
    });
});

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
		next();
	} else {
		console.log(`profile: ${req.sessionID}`)
        res.status(418).json({ message: "Unauthorized access" });

	}

	// if (req.session.authenticated) {
    //     next();
    // } else {
	// 	console.log(`profile: ${req.sessionID}`)
    //     res.status(418).json({ message: "Unauthorized access" });
    // }
};

// Example route that requires authentication
app.get('/profile', isAuthenticated, (req, res) => {
    // This code will only execute if the user is authenticated
	
	console.log(`profile: ${req.session.user}`)
	console.log(`profile: ${req.sessionID}`)
    res.json({ message: "You are authenticated", user: req.session.user });
});

// app.get('/profile', (req, res) => {
// 	console.log(req.session.authenticated);
//     if (req.session && req.session.authenticated) {
//         // User is authenticated, you can proceed with accessing protected resources
//         const user = req.session.user;
//         res.json({ message: "User is authenticated", user });
//     } else {
//         // User is not authenticated, return an error response
//         res.status(401).json({ message: "Unauthorized access" });
//     }
// });

// sanity check
app.post('/ping', (req, res) => {
	console.log("pong")
	req.session.views++	
	console.log(req.session.views);
	// res.send("yo")
});

// Start the server
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`);
});