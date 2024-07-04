// account maangement will have create account function
// when creating the account it will generate a qr image
// make 'generate qr image' a function
// since it might be used for redundancy and stuff

// tl;dr: generate qr image function here


function parseGender(data) {
	if (data === undefined || data === null || data.length === 0) {return}
	if (Number(data) === 1) {
		return "Male";
	} else if (Number(data) === 0) {
		return "Female";
	}
}

module.exports = {parseGender}