const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// fuck cors
app.use(cors({ origin: '*' }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/ds', (req, res) => {
	console.log(req.body)
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