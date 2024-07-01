const data = [/* insert json here */
	
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
		},
		
	

]

function renameKey(obj, oldKey, newKey) {
    if (!obj.hasOwnProperty(oldKey)) {
        console.error(`Key '${oldKey}' does not exist in the object.`);
    }
	if (oldKey !== newKey) {
		Object.defineProperty(obj, newKey, Object.getOwnPropertyDescriptor(obj, oldKey));
		delete obj[oldKey];
	}
    return obj;
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

console.log(data);
console.log(JSON.stringify(data));