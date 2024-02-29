module.exports = {
    INSERT: 'INSERT INTO users (email, phoneNumber, fullName, lrn, password) VALUES (?, ?, ?, ?, ?)',
	CHECK: 'SELECT phoneNumber, lrn FROM users WHERE phoneNumber = ? OR lrn = ?'
};