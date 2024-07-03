const mysql = require('mysql2')
const crypto = require('crypto')

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}

const db = mysql.createConnection({
	multipleStatements: true,
    host: 'localhost',
    user: 'root',
    password: 'bananas',
    database: 'gatekeep'
});

db.connect((err) => {
    if (err) { console.error(err); return; }
    console.log('Connected to MySQL');
});

sleep(500)

const data = [
		// insert data here
]

for (let i = 0; i < data.length; i++) {
	const hash = crypto.createHash('sha256').update(data[i].lrn + 'cbef7ed5be0c68cb2a1a1d1e3adc00fb42de9e2ada455cc86fc1ff3dcda9b0cf').digest('hex').substring(0,25);
	console.log(hash);
	db.query('UPDATE users SET qrId = ? WHERE id = ?;', [hash,data[i].id], (err,result) => {
		if (err) {return console.error(err);}
		console.log(result);
	})
}