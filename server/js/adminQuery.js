module.exports = {
	GET_INFO: 'SELECT * FROM userinfo WHERE userId = ?;',
	UPDATE_INFO: `UPDATE userInfo SET lastName = CASE WHEN ? = '' THEN lastName ELSE IFNULL(?, lastName) END, firstName = CASE WHEN ? = '' THEN firstName ELSE IFNULL(?, firstName) END, middleName = CASE WHEN ? = '' THEN middleName ELSE IFNULL(?, middleName) END, lrn = CASE WHEN ? = '' THEN lrn ELSE IFNULL(?, lrn) END, gradeLevel = CASE WHEN ? = '' THEN gradeLevel ELSE IFNULL(?, gradeLevel) END, section = CASE WHEN ? = '' THEN section ELSE IFNULL(?, section) END, age = CASE WHEN ? = '' THEN age ELSE IFNULL(?, age) END, sex = CASE WHEN ? = '' THEN sex ELSE IFNULL(?, sex) END, houseNo = CASE WHEN ? = '' THEN houseNo ELSE IFNULL(?, houseNo) END, street = CASE WHEN ? = '' THEN street ELSE IFNULL(?, street) END, zip = CASE WHEN ? = '' THEN zip ELSE IFNULL(?, zip) END, barangay = CASE WHEN ? = '' THEN barangay ELSE IFNULL(?, barangay) END, city = CASE WHEN ? = '' THEN city ELSE IFNULL(?, city) END, province = CASE WHEN ? = '' THEN province ELSE IFNULL(?, province) END WHERE userId = ?;`,
	GET_INFO_WITH_QRID: 'SELECT userInfo.*, users.qrId FROM userInfo LEFT JOIN users ON userInfo.userId = users.id WHERE userInfo.userId = ?;',
	GET_QRCACHE: 'SELECT qrCache FROM users WHERE id = ?;',
	GET_ID_VIA_QRID: 'SELECT id FROM users WHERE qrId = ?;',
	GET_QRID: 'SELECT qrId FROM users WHERE id = ?;',
	ADD_QRCACHE: 'UPDATE users SET qrCache = ? WHERE id = ?;',
	ADD_MESSAGE: 'INSERT INTO userlogs (userId, isIn, time) VALUES (?, ?, ?);',
	GET_MESSAGE: `SELECT id, isIn, CONVERT_TZ(time, '+00:00', '+08:00') AS time FROM userLogs WHERE userId = ? ORDER BY time DESC LIMIT ? OFFSET ?;`,
	GET_QUERY: `SELECT * FROM userInfo WHERE ((? = '' OR lastName LIKE CONCAT('%', ?, '%')) OR (? = '' OR firstName LIKE CONCAT('%', ?, '%')) OR (? = '' OR middleName LIKE CONCAT('%', ?, '%')) OR (? = '' OR lrn LIKE CONCAT('%', ?, '%')) OR (? = '' OR barangay LIKE CONCAT('%', ?, '%'))) AND ((? IS NULL OR ? = '' OR gradeLevel = ?) AND (? is NULL OR ? = '' OR section = ?));`,
}