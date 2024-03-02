module.exports = {
    SIGNUP: 'INSERT INTO users (email, phoneNumber, fullName, lrn, password) VALUES (?, ?, ?, ?, ?)',
	LOGIN: 'SELECT * FROM users WHERE (email = ? OR phoneNumber = ?) AND lrn = ? AND password = ?;',
	CHECK: 'SELECT phoneNumber, lrn FROM users WHERE phoneNumber = ? OR lrn = ?'
};