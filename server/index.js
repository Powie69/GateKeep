const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000; //

app.use(cors());


// Define a route
app.post('', (req, res) => {
	console.log(req.body)

});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});