import mysql from 'mysql2';
import crypto from 'crypto';

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
	const hash = crypto.createHash('sha256').update(data[i].lrn + process.env.qrIdSecret).digest('hex').substring(0,25);
	console.log(hash);
	db.query('UPDATE users SET qrId = ? WHERE id = ?;', [hash,data[i].id], (err,result) => {
		if (err) {return console.error(err);}
		console.log(result);
	})
}