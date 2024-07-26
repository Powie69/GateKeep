const mysql = require('mysql2');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = mysql.createConnection({
	multipleStatements: true,
    host: process.env.dbHost,
    user: process.env.dbUser,
    password: process.env.dbPassword,
    database: process.env.dbName
});

db.connect((err) => {
    if (err) { console.error(err); return; }
    console.log('Connected to MySQL');
});

const rateLimitHandler = (errMessage = "rate limit timeout") => {
	return (req,res) => {
		console.log("rate limit reached: ", req.sessionID);
		return res.status(429).json({message: errMessage});
	}
}

const limiter = (maxReq,windowMinute,errMessage) => {
	return rateLimit({
		windowMs: windowMinute * 60 * 1000, // 10 minutes
    	max: maxReq, // Limit each IP to maxRequests per windowMs
		handler: rateLimitHandler(errMessage),
		standardHeaders: true,
    	legacyHeaders: false,
	})
}

const isAuthenticated = (req, res, next) => {
	if (!req.session.authenticated) {
		console.log("not auth");
		return res.status(401).json({ message: "Unauthorized access" });
	}
	next();
};

const isAdmin = (req, res, next) => {
	if (!req.session.isAdmin) {
		if (req.accepts('html')) {
			return res.render('404', {
				displayName: req.session.displayName || 'No user',
				path: req.path
			})
		}
		if (req.accepts('json')) {
			return res.json({message:'not found'});
		}
		res.type('txt').send('not found');
	}
	next();
};

module.exports = {limiter,isAuthenticated, isAdmin, db }