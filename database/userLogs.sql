
-- @block
CREATE TABLE userLogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
	isIn BOOLEAN,
	time TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- @block
INSERT INTO userlogs (userId, isIn, time)
VALUES ('1', true, CURRENT_TIMESTAMP);

-- @block
SELECT * FROM userLogs

-- @block
SELECT * FROM userLogs WHERE id = "187"

-- @block
SELECT id, isIn, time FROM userLogs WHERE userId = 1 ORDER BY time DESC LIMIT 5 OFFSET 0;

-- @block
SELECT id, isIn, CONVERT_TZ(time, '+00:00', '-00:00') AS time FROM userLogs WHERE userId = 1 ORDER BY time DESC LIMIT 5 OFFSET 0;

-- @block
SELECT @@global.time_zone;

-- 


-- @block

INSERT INTO userlogs (userId, isIn, time) VALUES (?, ?, ?);


-- @block
SELECT userInfo.userId, userInfo.lastName, userInfo.firstName, userInfo.middleName, userInfo.lrn, userInfo.gradeLevel, userInfo.section, userInfo.age, userInfo.sex, userInfo.houseNo, userInfo.street, userInfo.zip, userInfo.barangay, userInfo.city, userInfo.province, users.phoneNumber FROM userInfo JOIN users ON userInfo.userId = users.id WHERE users.id = ?;


-- 
-- @block
-- DROP TABLE userlogs;

-- @block
-- DELETE FROM userlogs;
