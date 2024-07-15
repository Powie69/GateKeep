const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const session = require('express-session');
const cors = require('cors');
const MySQLStore = require('express-mysql-session')(session);
const app = express();

// *middleware stuff
require('dotenv').config();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.corsOrigin.split(','), /*credentials: true*/ }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sessionStore = new MySQLStore({
	host: process.env.dbHost,
    user: process.env.dbUser,
    password: process.env.dbPassword,
    database: process.env.dbName,
	clearExpired: true,
	checkExpirationInterval: 1209600000, // 2 wekks
	expiration: 2419200000, // 4 weeks
	createDatabaseTable: false
});

app.use(session({
    secret: process.env.cookieSecret,
	saveUninitialized: false,
	resave: false,
	unset: 'destroy',
	store: sessionStore,
	cookie: {
		maxAge: 2419200000, // 4 weeks
		// httpOnly: false,
		// secure: true,
		sameSite: 'strict'
		// partitioned: process.env.cookiePartitioned,
	},
}));

// **routes //
app.get('/',(req,res) => {
	if (typeof req.session.authenticated === 'undefined' || req.session.authenticated === false || typeof req.session.user === 'undefined') {
		return res.sendFile('views/home.html',{root: __dirname });
	} else if (typeof req.session.authenticated !== 'undefined' || req.session.authenticated === true || typeof req.session.user !== 'undefined') {
		return res.sendFile('views/dashBoard.html',{root: __dirname });
	}
})

if (process.env.NODE_ENV === 'production') {
	app.use('/css',express.static(path.join(__dirname, 'public', 'cssMinified')))
	app.use('/js',express.static(path.join(__dirname, 'public', 'jsMinified')))
}
// static files
app.use(express.static('public',{extensions:'html'}));

app.use('/profile', require('./routes/profile.js'))
app.use('/admin', require('./routes/admin.js'))

// ** //

// **404 handler //
app.use((req,res) => {
	console.log('404!',req.originalUrl);
	if (req.accepts('html')) {
		return res.sendFile('views/404.html',{root:__dirname});
	}
	if (req.accepts('json')) {
		return res.json({message:'not found'});
	}
	res.type('txt').send('not found');
})
// ** //

app.listen(process.env.serverPort, () => {
	process.title = `Gatekeep Server | ${process.env.serverPort}`
	console.log(`Server is running on http://localhost:${process.env.serverPort} || ${process.env.NODE_ENV}`);
});