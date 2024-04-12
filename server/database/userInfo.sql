
-- @block
CREATE TABLE userInfo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT UNIQUE,
	lastName VARCHAR(255),
	firstName VARCHAR(255),
	middleName VARCHAR(255),
	lrn char(12),
	age INT DEFAULT 0,
	sex BOOLEAN,
	houseNo INT,
	street VARCHAR(255),
	zip INT,
	barangay VARCHAR(255),
	city VARCHAR(255),
	province VARCHAR(255),
    FOREIGN KEY (lrn) REFERENCES users(lrn),
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- @block
SELECT * FROM userInfo;

-- @block
SELECT * FROM userInfo WHERE userId = 1;

-- @block
SELECT lastName, firstName, middleName, lrn, age, sex, houseNo, street, zip, barangay, city, province FROM userinfo WHERE userId = 1;

-- @block
INSERT INTO userInfo (userId, lrn)
VALUES (1, 123456789011);

-- @block
UPDATE userinfo
SET
	lastName = "garfil",
	firstName = "godwin",
	middleName = "p",
	age = 16,
	sex = true
WHERE id = 1;

-- @block
-- @block
DROP TABLE userInfo;

