module.exports = {
    SIGNUP: 'INSERT INTO users (email, phoneNumber, fullName, lrn, password) VALUES (?, ?, ?, ?, ?)',
	SIGNUP_CHECK: 'SELECT phoneNumber, lrn FROM users WHERE phoneNumber = ? OR lrn = ?',
	ADD_QRID: 'UPDATE users SET qrId = ? WHERE id = ?',
	ADD_QRCACHE: 'UPDATE users SET qrCache = ? WHERE id = ?',
	GET_QRID: 'SELECT qrId FROM users WHERE id = ?',
	GET_QRCACHE: 'SELECT qrCache FROM users WHERE id = ?',
	FIND_QR: 'SELECT id FROM users WHERE qrId = ?',
	LOGIN: 'SELECT id FROM users WHERE (email = ? OR phoneNumber = ?) AND lrn = ? AND password = ?;',
	INIT_INFO: 'INSERT INTO userInfo (userId, lrn) VALUES (?, ?);',
	GET_INFO: 'SELECT lastName, firstName, middleName, lrn, age, sex, houseNo, street, zip, barangay, city, province FROM userinfo WHERE userId = ?;',
	UPDATE_INFO: `UPDATE userInfo SET lastName = CASE WHEN ? = '' THEN lastName ELSE IFNULL(?, lastName) END, firstName = CASE WHEN ? = '' THEN firstName ELSE IFNULL(?, firstName) END, middleName = CASE WHEN ? = '' THEN middleName ELSE IFNULL(?, middleName) END, age = CASE WHEN ? = '' THEN age ELSE IFNULL(?, age) END, sex = CASE WHEN ? = '' THEN sex ELSE IFNULL(?, sex) END, houseNo = CASE WHEN ? = '' THEN houseNo ELSE IFNULL(?, houseNo) END, street = CASE WHEN ? = '' THEN street ELSE IFNULL(?, street) END, zip = CASE WHEN ? = '' THEN zip ELSE IFNULL(?, zip) END, barangay = CASE WHEN ? = '' THEN barangay ELSE IFNULL(?, barangay) END, city = CASE WHEN ? = '' THEN city ELSE IFNULL(?, city) END, province = CASE WHEN ? = '' THEN province ELSE IFNULL(?, province) END WHERE userId = ?;`,
	GET_MESSAGE: 'SELECT * FROM userLogs WHERE userId = ? ORDER BY time DESC LIMIT ? OFFSET ?;',
	ADD_LOG: 'INSERT INTO userlogs (userId, isIn, time) VALUES (?, ?, ?);'
};