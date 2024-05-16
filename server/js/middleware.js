const mysql = require('mysql2');
require('dotenv').config();

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
	if (!req.session.authenticated) {
		console.log("not auth");
		return res.status(401).json({ message: "Unauthorized access" });
	}
	next();
};

const isAdmin = (req, res, next) => {
	if (!req.session.isAdmin) {
		console.log(`profile: ${req.sessionID}`)
		return res.status(418).json({ message: "Unauthorized access" });
	}
	next();
};

module.exports = { isAuthenticated, isAdmin, db }