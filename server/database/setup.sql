
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
CREATE TABLE userLogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
	isIn BOOLEAN,
	time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- @block
CREATE TABLE userInfo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT UNIQUE,
	lastName varchar(255),
	firstName varchar(255),
	middleName varchar(255),
	lrn char(12),
	age INT,
	sex BOOLEAN,
    FOREIGN KEY (lrn) REFERENCES users(lrn),
    FOREIGN KEY (userId) REFERENCES users(id)
);
