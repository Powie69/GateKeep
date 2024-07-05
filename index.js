const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const session = require('express-session');
const cors = require('cors');
const app = express();

// *middleware stuff
require('dotenv').config();

app.use(cors({ origin: process.env.corsOrigin.split(','), credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.cookieSecret,
	saveUninitialized: false,
	resave: false,
	unset: 'destroy',
	cookie: {
		maxAge: 3600000,
		// httpOnly: false,
		// secure: true,
		sameSite: 'none',
		partitioned: process.env.cookiePartitioned,
	},
}));

// *static files //
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
app.use(express.static('public',{extensions:'html'}));
// ** //

// **routes //
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