module.exports = {
    SIGNUP: 'INSERT INTO users (email, phoneNumber, fullName, lrn, password) VALUES (?, ?, ?, ?, ?)',
	SIGNUP_CHECK: 'SELECT phoneNumber, lrn FROM users WHERE phoneNumber = ? OR lrn = ?',
	LOGIN: 'SELECT id FROM users WHERE (email = ? OR phoneNumber = ?) AND lrn = ? AND password = ?;',
	INIT_INFO: 'INSERT INTO userInfo (userId) VALUES (?);',
	GET_INFO: 'SELECT * FROM userInfo WHERE userId = ?',
};