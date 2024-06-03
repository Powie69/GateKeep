module.exports = {
	GET_INFO: 'SELECT lastName, firstName, middleName, lrn, age, sex, houseNo, street, zip, barangay, city, province FROM userinfo WHERE userId = ?;',
	GET_ID_VIA_QRID: 'SELECT id FROM users WHERE qrId = ?',
	ADD_MESSAGE: 'INSERT INTO userlogs (userId, isIn, time) VALUES (?, ?, ?);',
	GET_MESSAGE: `SELECT id, isIn, CONVERT_TZ(time, '+00:00', '+08:00') AS time FROM userLogs WHERE userId = ? ORDER BY time DESC LIMIT ? OFFSET ?;`,
	GET_QUERY: `SELECT * FROM userInfo WHERE ((? = '' OR lastName LIKE CONCAT('%', ?, '%')) OR (? = '' OR firstName LIKE CONCAT('%', ?, '%')) OR (? = '' OR middleName LIKE CONCAT('%', ?, '%')) OR (? = '' OR lrn LIKE CONCAT('%', ?, '%')) OR (? = '' OR barangay LIKE CONCAT('%', ?, '%'))) AND ((? IS NULL OR ? = '' OR gradeLevel = ?) AND (? is NULL OR ? = '' OR section = ?));`,
}