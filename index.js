const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const app = express();

// *
require('dotenv').config();
app.disable('x-powered-by');
app.set('view engine','ejs');

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
		httpOnly: true,
		// secure: true,
		sameSite: 'strict'
	},
}));

// static files
if (process.env.NODE_ENV === 'production') {
	app.use('/css',express.static(path.join(__dirname, 'public', 'cssMinified')))
	app.use('/js',express.static(path.join(__dirname, 'public', 'jsMinified')))
}
app.use(express.static('public'));
//

app.use('/', require('./routes/pages.js'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/profile', require('./routes/profile.js'));
app.use('/admin', require('./routes/admin.js'));

// ** //

// **404 handler //
app.use((req,res) => {
	// console.log('404!',req.originalUrl);
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
})
// ** //

app.listen(process.env.serverPort, () => {
	process.title = `Gatekeep Server | ${process.env.serverPort}`
	console.log(`Server is running on http://localhost:${process.env.serverPort} || ${process.env.NODE_ENV}`);
});