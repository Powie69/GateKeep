
-- @block
CREATE TABLE userLogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT,
	isIn BOOLEAN,
	time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- @block
SELECT * FROM userLogs

-- @block
DROP TABLE userlogs;

-- @block
DELETE FROM userlogs;

-- @block
INSERT INTO userlogs (userId, isIn, time)
VALUES ('2', true, CURRENT_TIMESTAMP);