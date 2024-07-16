module.exports = {
	LOGIN: 'SELECT id FROM users WHERE (email = ? OR phoneNumber = ?) AND lrn = ? AND password = ?;',
	//
	GET_QRCACHE: 'SELECT qrCache FROM users WHERE id = ?',
	//
	GET_INFO: 'SELECT lastName, firstName, middleName, lrn, gradeLevel, section, age, sex, houseNo, street, zip, barangay, city, province FROM userinfo WHERE userId = ?;',
	GET_MESSAGE: `SELECT id, isIn, CONVERT_TZ(time, '+00:00', '+08:00') AS time FROM userLogs WHERE userId = ? ORDER BY time DESC LIMIT ? OFFSET ?;`,
}