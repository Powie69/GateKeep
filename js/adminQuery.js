export default {
	ADD_ACCOUNT: "START TRANSACTION; INSERT INTO users (email,phoneNumber,password,lrn,qrId) VALUES (?,?,?,?,?); INSERT INTO userInfo (userId,lastname,firstName,middleName,lrn,gradeLevel,section,age,sex,houseNo,street,zip,barangay,city,province) SELECT LAST_INSERT_ID(),CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END; COMMIT;",
	CHECK_ACCOUNT: "SELECT NULL FROM users WHERE lrn = ?;",
	REMOVE_ACCOUNT_CHECK: "SELECT userInfo.lastName, userInfo.firstName, userInfo.middleName, users.lrn FROM users RIGHT JOIN userInfo ON userInfo.userId = users.id WHERE users.id = ?;",
	REMOVE_ACCOUNT_CONFIRM: "START TRANSACTION; DELETE FROM userInfo WHERE userId = ? AND lrn = ?; DELETE FROM userLogs WHERE userId = ?; DELETE FROM users WHERE id = ? AND lrn = ?; COMMIT;",
	UPDATE_INFO: "START TRANSACTION; UPDATE users SET email = CASE WHEN ? IS NULL OR ? = '' THEN email ELSE ? END, phoneNumber = CASE WHEN ? IS NULL OR ? = '' THEN phoneNumber ELSE ? END, lrn = CASE WHEN ? IS NULL OR ? = '' THEN lrn ELSE ? END, password = CASE WHEN ? IS NULL OR ? = '' THEN password ELSE ? END WHERE id = ?; UPDATE userInfo SET lastName = CASE WHEN ? IS NULL OR ? = '' THEN lastName ELSE ? END, firstName = CASE WHEN ? IS NULL OR ? = '' THEN firstName ELSE ? END, middleName = CASE WHEN ? IS NULL OR ? = '' THEN middleName ELSE ? END, gradeLevel = CASE WHEN ? IS NULL OR ? = '' THEN gradeLevel ELSE ? END, section = CASE WHEN ? IS NULL OR ? = '' THEN section ELSE ? END, age = CASE WHEN ? IS NULL OR ? = '' THEN age ELSE ? END, sex = CASE WHEN ? IS NULL OR ? = '' THEN sex ELSE ? END, houseNo = CASE WHEN ? IS NULL OR ? = '' THEN houseNo ELSE ? END, street = CASE WHEN ? IS NULL OR ? = '' THEN street ELSE ? END, zip = CASE WHEN ? IS NULL OR ? = '' THEN zip ELSE ? END, barangay = CASE WHEN ? IS NULL OR ? = '' THEN barangay ELSE ? END, city = CASE WHEN ? IS NULL OR ? = '' THEN city ELSE ? END, province = CASE WHEN ? IS NULL OR ? = '' THEN province ELSE ? END WHERE userId = ?; COMMIT;",
	GET_INFO_WITH_QR: "SELECT userInfo.*, users.email, users.phoneNumber, users.qrId FROM userInfo JOIN users ON userInfo.userId = users.id WHERE users.id = ?;",
	GET_QRCACHE: "SELECT qrCache FROM users WHERE id = ?;",
	GET_ID_VIA_QRID: "SELECT id FROM users WHERE qrId = ?;",
	GET_QRID: "SELECT qrId FROM users WHERE id = ?;",
	ADD_QRCACHE: "UPDATE users SET qrCache = ? WHERE id = ?;",
	GET_INFO: "SELECT userInfo.*, users.email, users.phoneNumber FROM userInfo LEFT JOIN users ON userInfo.userId = users.id WHERE userInfo.userId = ?;",
	PROCESS_MESSAGE: "START TRANSACTION; INSERT INTO userLogs (userId, isIn, time) VALUES (?, ?, ?); SELECT isIn,CONVERT_TZ(time, '+00:00', '+08:00') as time FROM userlogs WHERE id = LAST_INSERT_ID(); SELECT userInfo.lastName, userInfo.firstName, userInfo.middleName, userInfo.lrn, userInfo.gradeLevel, userInfo.section, userInfo.age, userInfo.sex, userInfo.houseNo, userInfo.street, userInfo.zip, userInfo.barangay, userInfo.city, userInfo.province, users.phoneNumber FROM userInfo JOIN users ON userInfo.userId = users.id WHERE users.id = ?; COMMIT;",
	ADD_MESSAGE: "INSERT INTO userLogs (userId, isIn, time) VALUES (?, ?, ?);",
	GET_MESSAGE: "SELECT isIn, CONVERT_TZ(time, '+00:00', '+08:00') AS time FROM userLogs WHERE userId = ? ORDER BY time DESC LIMIT ? OFFSET ?;",
	GET_LATEST_MESSAGE: "SELECT userLogs.userId, userLogs.isIn, userLogs.time, userInfo.firstName, userInfo.middleName, userInfo.lastName, userInfo.gradeLevel, userInfo.section FROM userLogs JOIN userInfo ON userLogs.userId = userInfo.userId ORDER BY userLogs.time DESC LIMIT 1;",
	GET_LOGS: "SELECT userLogs.userId, userLogs.isIn, CONVERT_TZ(userLogs.time, '+00:00', '+08:00') AS time, userInfo.firstName, userInfo.middleName, userInfo.lastName, userInfo.gradeLevel, userInfo.section FROM userLogs JOIN userInfo ON userLogs.userId = userInfo.userId ORDER BY userLogs.time DESC LIMIT ? OFFSET ?;",
	GET_QUERY: "SELECT userInfo.*, users.email, users.phoneNumber FROM userInfo JOIN users ON userInfo.userId = users.id WHERE ((? = '' OR userInfo.lastName LIKE CONCAT('%', ?, '%')) OR (? = '' OR userInfo.firstName LIKE CONCAT('%', ?, '%')) OR (? = '' OR userInfo.middleName LIKE CONCAT('%', ?, '%')) OR (? = '' OR userInfo.lrn LIKE CONCAT('%', ?, '%')) OR (? = '' OR userInfo.barangay LIKE CONCAT('%', ?, '%'))) AND ((? IS NULL OR ? = '' OR userInfo.gradeLevel = ?) AND (? IS NULL OR ? = '' OR userInfo.section = ?));",
};