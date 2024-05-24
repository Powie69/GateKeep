const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const q = require('./js/commands.js');
const cors = require('cors');
const app = express();

// *middleware stuff
require('dotenv').config();

app.use(cors({ origin: process.env.corsOrigin.split(','), credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'))

app.use(session({
    secret: process.env.cookieSecret,
	saveUninitialized: false,
	resave: false,
	cookie: {
		maxAge: 3600000,
		httpOnly: false,
		// secure: true,
		// sameSite: 'none',
		// partitioned: process.env.cookiePartitioned,
	},
}));
	
// **routes //
app.use('/profile', require('./routes/profile.js'))
app.use('/admin', require('./routes/admin.js'))

app.post('/ping', (req, res) => {
	console.log(req.body);
	res.send("pong")
});
// **end of routes** //

app.listen(process.env.serverPort, () => {
	console.log(`Server is running on http://localhost:${process.env.serverPort}`);
});