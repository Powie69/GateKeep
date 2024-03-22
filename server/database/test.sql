
-- @block
SELECT * FROM users
-- @block
SELECT id FROM users WHERE (email = 'godwin@gmail.com' OR phoneNumber = 'godwin@gmail.com') AND lrn = 123456789011 AND password = 123;

-- *userLogs
-- @block
SELECT * FROM userLogs


-- @block
DROP TABLE userlogs;

-- @block
DELETE FROM userlogs;

-- @block
INSERT INTO userlogs (userId, isIn, time)
VALUES ('2', true, CURRENT_TIMESTAMP);

-- 
-- @block
INSERT INTO users (email, phoneNumber, fullName, lrn, password) 
VALUES ('godwin@gmail.com', '09118881234', 'godwin', '123456789011', '123');
-- @block
-- DELETE FROM users;
-- @block
DROP TABLE users;