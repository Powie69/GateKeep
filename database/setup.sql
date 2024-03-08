
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
DELETE FROM users;
-- @block
DROP TABLE users;

-- @block

-- @block
SELECT * FROM users WHERE (email = 'godwin@gmail.com' OR phoneNumber = 'godwin@gmail.com') AND lrn = 123456789011 AND password = 123;