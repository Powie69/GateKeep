module.exports = {
	ADD_ACCOUNT: `START TRANSACTION; INSERT INTO users (email,phoneNumber,password,lrn,qrId) VALUES (?,?,?,?,?); INSERT INTO userInfo (userId,lastname,firstName,middleName,lrn,gradeLevel,section,age,sex,houseNo,street,zip,barangay,city,province) SELECT LAST_INSERT_ID(),CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END; COMMIT;`,
	ADD_ACCOUNT_QRID: 'UPDATE users SET qrId = ? WHERE id = ?;',
	CHECK_ACCOUNT: 'SELECT NULL FROM users WHERE lrn = ?;',
	UPDATE_INFO: "START TRANSACTION; UPDATE users SET email = CASE WHEN ? IS NULL OR ? = '' THEN email ELSE ? END, phoneNumber = CASE WHEN ? IS NULL OR ? = '' THEN phoneNumber ELSE ? END, lrn = CASE WHEN ? IS NULL OR ? = '' THEN lrn ELSE ? END, `password` = CASE WHEN ? IS NULL OR ? = '' THEN `password` ELSE ? END, WHERE id = ?; UPDATE userInfo SET lastName = CASE WHEN ? IS NULL OR ? = '' THEN lastName ELSE ? END, firstName = CASE WHEN ? IS NULL OR ? = '' THEN firstName ELSE ? END, middleName = CASE WHEN ? IS NULL OR ? = '' THEN middleName ELSE ? END, lrn = CASE WHEN ? IS NULL OR ? = '' THEN lrn ELSE ? END, gradeLevel = CASE WHEN ? IS NULL OR ? = '' THEN gradeLevel ELSE ? END, section = CASE WHEN ? IS NULL OR ? = '' THEN section ELSE ? END, age = CASE WHEN ? IS NULL OR ? = '' THEN age ELSE ? END, sex = CASE WHEN ? IS NULL OR ? = '' THEN sex ELSE ? END, houseNo = CASE WHEN ? IS NULL OR ? = '' THEN houseNo ELSE ? END, street = CASE WHEN ? IS NULL OR ? = '' THEN street ELSE ? END, zip = CASE WHEN ? IS NULL OR ? = '' THEN zip ELSE ? END, barangay = CASE WHEN ? IS NULL OR ? = '' THEN barangay ELSE ? END, city = CASE WHEN ? IS NULL OR ? = '' THEN city ELSE ? END, province = CASE WHEN ? IS NULL OR ? = '' THEN province ELSE ? END WHERE userId = ?; COMMIT;",
	GET_INFO_WITH_QRID: 'SELECT userInfo.*, users.qrId FROM userInfo LEFT JOIN users ON userInfo.userId = users.id WHERE userInfo.userId = ?;',
	GET_QRCACHE: 'SELECT qrCache FROM users WHERE id = ?;',
	GET_ID_VIA_QRID: 'SELECT id FROM users WHERE qrId = ?;',
	GET_QRID: 'SELECT qrId FROM users WHERE id = ?;',
	ADD_QRCACHE: 'UPDATE users SET qrCache = ? WHERE id = ?;',
	GET_INFO: 'SELECT userInfo.*, users.email, users.phoneNumber FROM userInfo LEFT JOIN users ON userInfo.userId = users.id WHERE userInfo.userId = ?;',
	ADD_MESSAGE: 'INSERT INTO userlogs (userId, isIn, time) VALUES (?, ?, ?);',
	GET_MESSAGE: `SELECT id, isIn, CONVERT_TZ(time, '+00:00', '+08:00') AS time FROM userLogs WHERE userId = ? ORDER BY time DESC LIMIT ? OFFSET ?;`,
	GET_QUERY: `SELECT * FROM userInfo WHERE ((? = '' OR lastName LIKE CONCAT('%', ?, '%')) OR (? = '' OR firstName LIKE CONCAT('%', ?, '%')) OR (? = '' OR middleName LIKE CONCAT('%', ?, '%')) OR (? = '' OR lrn LIKE CONCAT('%', ?, '%')) OR (? = '' OR barangay LIKE CONCAT('%', ?, '%'))) AND ((? IS NULL OR ? = '' OR gradeLevel = ?) AND (? is NULL OR ? = '' OR section = ?));`,
}