
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
SELECT * FROM userLogs WHERE userId = 1 ORDER BY time DESC LIMIT 5 OFFSET -2;

-- @block
-- DROP TABLE userlogs;

-- @block
-- DELETE FROM userlogs;
