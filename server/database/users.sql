
-- @block
CREATE TABLE users(
	id INT PRIMARY KEY AUTO_INCREMENT,
	email VARCHAR(255) NOT NULL,
	phoneNumber CHAR(11) NOT NULL,
	lrn CHAR(12) NOT NULL UNIQUE,
	password VARCHAR(255),
	qrId VARCHAR(255) UNIQUE
);

-- @block
SELECT * FROM users;

-- 


-- @block
SELECT NULL FROM users WHERE lrn = ?;

-- @block
INSERT INTO users (email, phoneNumber, fullName, lrn, password)
VALUES ('godwin@gmail.com', '', 'godwin', '113456789000', '123');

-- @block
INSERT INTO users (email,phoneNumber,password,lrn) VALUES (?,?,?,?); INSERT INTO userInfo (userId,lastname,firstName,middleName,lrn,gradeLevel,section,age,sex,houseNo,street,zip,barangay,city,province) SELECT @LAST_INSERT_ID ,?,?,?,?,?,?,?,?,?,?,?,?,?,?;




-- ruh row
-- @block
-- DELETE FROM users;
-- @block
DROP TABLE users;