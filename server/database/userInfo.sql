
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

