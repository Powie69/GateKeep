module.exports = {
	LOGIN: 'SELECT id FROM users WHERE (email = ? OR phoneNumber = ?) AND lrn = ? AND password = ?;',
	//
	GET_QRCACHE: 'SELECT qrCache FROM users WHERE id = ?',
	GET_INFO_FOR_PRINT: 'SELECT firstName, middleName, lastName, lrn, gradeLevel, section FROM userinfo WHERE id = ?;',
	//
	GET_INFO: 'SELECT userInfo.*, users.email, users.phoneNumber FROM userInfo LEFT JOIN users ON userInfo.userId = users.id WHERE userInfo.userId = ?;',
	GET_MESSAGE: `SELECT id, isIn, CONVERT_TZ(time, '+00:00', '+08:00') AS time FROM userLogs WHERE userId = ? ORDER BY time DESC LIMIT ? OFFSET ?;`,
}