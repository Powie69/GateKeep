const clients = new Map(); // Store WebSocket connections
const adminClients = new Map();

function parseGender(data) {
	if (typeof data === 'undefined' ||data === null|| data.length === 0) {return}
	if (Number(data) === 1) {
		return "Male";
	} else if (Number(data) === 0) {
		return "Female";
	}
}

function parseName(data) {
	if (!data ||typeof data.firstName !== 'string' || typeof data.firstName !== 'string' ) {return}
	if (typeof data.middleName !== 'string' || data.middleName.length === 0) { // if fatherless
		return `${data.firstName} ${data.lastName}`;
	}
	return `${data.firstName} ${data.middleName.charAt(0).toUpperCase()}. ${data.lastName}`;
}

// 1:-info,  2:-warning,  3:-error
function logger(type,message) {
	switch (type) {
		case 1:
			type = 'INFO';
			break;
		case 2: // warning
			type = '\u001b[33mWARNING\u001b[0m';
			break;
		case 3: // error
			type = '\u001b[31mERROR\u001b[0m';
			break
		default:
			type = 'INFO'
			break;
	}
	console.log(`[${type}][${new Date().toLocaleDateString('en-PH', { month: '2-digit' , day: '2-digit' ,year: '2-digit' })}\u001b[1m ${new Date().toLocaleTimeString('en-PH', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'})}\u001b[0m] ${message}`)
}

module.exports = {parseGender,parseName,logger,clients,adminClients}