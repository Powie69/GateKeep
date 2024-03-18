
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
CREATE TABLE userLogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
	isIn BOOLEAN,
	time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- @block
CREATE TABLE userInfo (
    id INT PRIMARY KEY,
    userId INT UNIQUE,
	firstName varchar(255),
	middleName varchar(255),
	lastName varchar(255),
	age INT,
	sex BOOLEAN,
    FOREIGN KEY (userId) REFERENCES users(id)
);
