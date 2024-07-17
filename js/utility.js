// account maangement will have create account function
// when creating the account it will generate a qr image
// make 'generate qr image' a function
// since it might be used for redundancy and stuff

// tl;dr: generate qr image function here


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
		return`${data.firstName} ${data.lastName}`;
	}
	return `${data.firstName} ${data.middleName.charAt(0).toUpperCase()}. ${data.lastName}`;
}

module.exports = {parseGender,parseName}