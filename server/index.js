const bodyParser = require('body-parser');
const express = require('express');
const q = require('./commands')
const mysql = require('mysql2')
const cors = require('cors');
const app = express();
const port = 3000;

// fuck cors
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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


app.post('/ds', async (req, res) => {
	console.log(req.body)
	const data = req.body;
	
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) && /^09\d{9}$/.test(data.phoneNumber) && data.fullName && /^[1-6]\d{11}$/.test(data.lrn)) {
		console.log("all valid");
	} else {
		res.status(400).json({ message: "Invalid input data" });
	}
	
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
		
		db.query(q.INSERT, [data.email, data.phoneNumber, data.fullName, data.lrn, data.password], (err,result) => {
			if (err) {
				console.error('insert SQL:', err);
				res.status(500).send('Internal Server Error');
				return;
			}
			console.log(' insert suc:', result);
		});
	
	});

	


	// res.json({ message: "yo we good" });
});

// sanity check
app.get('/ping', (req, res) => {
	console.log("pong")
	res.send("yo")
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});