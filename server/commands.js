module.exports = {
    SIGNUP: 'INSERT INTO users (email, phoneNumber, fullName, lrn, password) VALUES (?, ?, ?, ?, ?)',
	SIGNUP_CHECK: 'SELECT phoneNumber, lrn FROM users WHERE phoneNumber = ? OR lrn = ?',
	LOGIN: 'SELECT id FROM users WHERE (email = ? OR phoneNumber = ?) AND lrn = ? AND password = ?;',
	INIT_INFO: 'INSERT INTO userInfo (userId, lrn) VALUES (?, ?);',
	GET_INFO: 'SELECT * FROM userInfo WHERE userId = ?;',
	UPDATE_INFO: `UPDATE userInfo SET lastName = CASE WHEN ? = '' THEN lastName ELSE IFNULL(?, lastName) END, firstName = CASE WHEN ? = '' THEN firstName ELSE IFNULL(?, firstName) END, middleName = CASE WHEN ? = '' THEN middleName ELSE IFNULL(?, middleName) END, age = CASE WHEN ? = '' THEN age ELSE IFNULL(?, age) END, sex = CASE WHEN ? = '' THEN sex ELSE IFNULL(?, sex) END, houseNo = CASE WHEN ? = '' THEN houseNo ELSE IFNULL(?, houseNo) END, street = CASE WHEN ? = '' THEN street ELSE IFNULL(?, street) END, zip = CASE WHEN ? = '' THEN zip ELSE IFNULL(?, zip) END, barangay = CASE WHEN ? = '' THEN barangay ELSE IFNULL(?, barangay) END, city = CASE WHEN ? = '' THEN city ELSE IFNULL(?, city) END, province = CASE WHEN ? = '' THEN province ELSE IFNULL(?, province) END WHERE userId = ?;`,
	// UPDATE_INFO: "UPDATE userInfo SET ${columnsToUpdate.join(', ')} WHERE userId = ?;",
	GET_MESSAGE: 'SELECT * FROM userLogs WHERE userId = ? ORDER BY time DESC LIMIT ? OFFSET ?;',
};