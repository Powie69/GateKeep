import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function renameKey(obj, oldKey, newKey) {
    if (!obj.hasOwnProperty(oldKey)) {
        console.error(`Key '${oldKey}' does not exist in the object.`);
    }
	if (oldKey !== newKey) {
		Object.defineProperty(obj, newKey, Object.getOwnPropertyDescriptor(obj, oldKey));
		delete obj[oldKey];
	}
}

rl.question(`\x1b[36mEnter json string:\n\x1b[0m`, data => {
	console.log(data);
	try {
		data = JSON.parse(data);
	} catch (err) {
		console.log(err.message);
		return rl.close();
	}

	for (let i = 0; i < data.length; i++) {
		renameKey(data[i],'emailAddress','email')
		renameKey(data[i],'zipCode','zip')
		renameKey(data[i],'streetName','street')
		if (data[i].sex == 'Male') {
			data[i].sex = 1
		} else {
			data[i].sex = 0
		}
	}

	console.log(`\n(●'◡'●)\nResults:`);
	console.log(`\x1b[33m${JSON.stringify(data)}\x1b[0m`);
	console.log('\n');

	rl.close();
});

/*
[
	{
        "timestamp": "2024-07-01T09:59:53.164Z",
        "emailAddress": "kdso@gmaji.com",
        "firstName": "kir",
        "lastName": "dfkdsfk",
        "age": 32,
        "sex": "Male",
        "lrn": 400650150053,
        "zipCode": 3008,
        "streetName": "obloc",
        "phoneNumber": "09123546432",
        "password": "banans"
    }
]
*/
