module.exports = {
	LOGIN: 'SELECT users.id, userInfo.firstName FROM users JOIN userInfo ON users.id = userInfo.userId WHERE ( users.email = ? OR users.phoneNumber = ? ) AND users.lrn = ? AND users.password = ?;',
	//
	GET_QRCACHE: 'SELECT qrCache FROM users WHERE id = ?',
	GET_INFO_FOR_PRINT: 'SELECT firstName, middleName, lastName, lrn, gradeLevel, section FROM userInfo WHERE userId = ?;',
	//
	GET_INFO: 'SELECT userInfo.*, users.email, users.phoneNumber, users.password FROM userInfo LEFT JOIN users ON userInfo.userId = users.id WHERE userInfo.userId = ?;',
	GET_MESSAGE: `SELECT isIn, CONVERT_TZ(time, '+00:00', '+08:00') AS time FROM userLogs WHERE userId = ? ORDER BY time DESC LIMIT ? OFFSET ?;`,
}