
-- @block
CREATE TABLE users(
	id INT PRIMARY KEY AUTO_INCREMENT,
	email varchar(255) NOT NULL,
	phoneNumber char(11) NOT NULL UNIQUE,
	fullName varchar(255),
	lrn char(12) NOT NULL UNIQUE,
	password varchar(255)
);
-- @block
SELECT * FROM users
-- @block
INSERT INTO users (email, phoneNumber, fullName, lrn, password) 
VALUES ('godwin@gmail.com', '09118881234', 'godwin', '123456789011', '123');
-- @block
-- DELETE FROM users;
-- @block
-- DROP TABLE users;

