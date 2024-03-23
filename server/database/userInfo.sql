
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

-- @block
SELECT * FROM userInfo;

-- @block
SELECT * FROM userInfo WHERE userId = 1;

-- @block
INSERT INTO userInfo (userId, lrn)
VALUES (8, 123456789011);

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
-- DROP TABLE userInfo;

