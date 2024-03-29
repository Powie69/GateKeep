module.exports = {
    SIGNUP: 'INSERT INTO users (email, phoneNumber, fullName, lrn, password) VALUES (?, ?, ?, ?, ?)',
	SIGNUP_CHECK: 'SELECT phoneNumber, lrn FROM users WHERE phoneNumber = ? OR lrn = ?',
	LOGIN: 'SELECT id FROM users WHERE (email = ? OR phoneNumber = ?) AND lrn = ? AND password = ?;',
	INIT_INFO: 'INSERT INTO userInfo (userId, lrn) VALUES (?, ?);',
	GET_INFO: 'SELECT * FROM userInfo WHERE userId = ?;',
	UPDATE_INFO: 'UPDATE userInfo SET lastName = ?, firstName = ?, middleName = ?, age = ?, sex = ?, houseNo = ?, street = ?, zip = ?, barangay = ?, city = ?, province = ? WHERE userId = ?;',
	GET_MESSAGE: 'SELECT * FROM userLogs WHERE userId = ? ORDER BY time DESC LIMIT ? OFFSET ?;',
};