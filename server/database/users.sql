
-- @block
CREATE TABLE users(
	id INT PRIMARY KEY AUTO_INCREMENT,
	email VARCHAR(255) NOT NULL,
	phoneNumber CHAR(11) NOT NULL UNIQUE,
	fullName VARCHAR(255),
	lrn CHAR(12) NOT NULL UNIQUE,
	password VARCHAR(255)
);

-- @block
SELECT * FROM users
-- @block
SELECT id FROM users WHERE (email = 'godwin@gmail.com' OR phoneNumber = 'godwin@gmail.com') AND lrn = 123456789011 AND password = 123;

-- @block
INSERT INTO users (email, phoneNumber, fullName, lrn, password) 
VALUES ('godwin@gmail.com', '09118881234', 'godwin', '123456789011', '123');
-- @block
-- DELETE FROM users;
-- @block
-- DROP TABLE users;