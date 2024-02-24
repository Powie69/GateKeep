const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const Papa = require('papaparse');
const app = express();
const port = 3000;

// fuck cors
app.use(cors({ origin: '*' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/ds', async (req, res) => {
	console.log(req.body)
	const data = req.body;
	
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) && /^09\d{9}$/.test(data.phoneNumber) && data.fullName && /^[1-6]\d{11}$/.test(data.lrn)) {
		console.log("Email, phonenumber, name, and LRN are all valid");
	} else {
		res.status(400).json({ message: "Invalid input data" });
	}
	


	fs.readFile('../database/accounts.csv', 'utf8', (err, csvData) => {
		if (err) {
		  console.error('Error reading file:', err);
		  return res.status(500).json({ message: 'Internal Server Error' });
		}

		
		
		try {
			const updatedCsv = Papa.unparse([...(Papa.parse(csvData, { header: true }).data || []), { ...data }], { header: true });
			fs.writeFile('../database/accounts.csv', updatedCsv, 'utf8', (err) => {
			  if (err) {
				console.error('Error writing file:', err);
				return res.status(500).json({ message: 'Internal Server Error' });
			  }
			  console.log('Data has been appended to');
			  res.json({ message: "Data has been appended to the CSV file" });
			});
		  } catch (error) {
			console.error('Error parsing CSV data:', error);
			res.status(500).json({ message: 'Internal Server Error' });
		  }
	});


	res.json({ message: "yo we good" });
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