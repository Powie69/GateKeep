
-- @block
CREATE TABLE userInfo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT UNIQUE,
	lastName VARCHAR(255),
	firstName VARCHAR(255),
	middleName VARCHAR(255),
	lrn char(12),
	gradeLevel VARCHAR(2),
	section VARCHAR(255),
	age INT DEFAULT NULL,
	sex BOOLEAN,
	houseNo INT DEFAULT NULL,
	street VARCHAR(255),
	zip INT(4),
	barangay VARCHAR(255),
	city VARCHAR(255),
	province VARCHAR(255),
    FOREIGN KEY (lrn) REFERENCES users(lrn) ON UPDATE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- @block
SELECT * FROM userInfo;

-- @block
SELECT userInfo.*, users.qrId
FROM userInfo
LEFT JOIN users ON userInfo.userId = users.id
WHERE userInfo.userId = 1;

-- @block
SELECT userInfo.*, users.email, users.phoneNumber, users.password FROM userInfo LEFT JOIN users ON userInfo.userId = users.id WHERE userInfo.userId = ?;

-- @block
ALTER TABLE userinfo
DROP FOREIGN KEY `userinfo_ibfk_1`;

-- @block
SHOW CREATE TABLE userinfo;
-- @block
SELECT lastName, firstName, middleName, lrn, age, sex, houseNo, street, zip, barangay, city, province FROM userinfo WHERE userId = 1;

-- @block
UPDATE userInfo SET
lastName = CASE WHEN '' = '' THEN lastName ELSE IFNULL('', lastName) END,
firstName = CASE WHEN '' = '' THEN firstName ELSE IFNULL('', firstName) END,
middleName = CASE WHEN '' = '' THEN middleName ELSE IFNULL('', middleName) END,
lrn = CASE WHEN '' = '' THEN lrn ELSE IFNULL('', lrn) END,
gradeLevel = CASE WHEN '' = '' THEN gradeLevel ELSE IFNULL('', gradeLevel) END,
section = CASE WHEN '' = '' THEN section ELSE IFNULL('', section) END,
age = CASE WHEN '' = '' THEN age ELSE IFNULL('', age) END,
sex = CASE WHEN '' = '' THEN sex ELSE IFNULL('', sex) END,
houseNo = CASE WHEN '' = '' THEN houseNo ELSE IFNULL('', houseNo) END,
street = CASE WHEN '' = '' THEN street ELSE IFNULL('', street) END,
zip = CASE WHEN '' = '' THEN zip ELSE IFNULL('', zip) END,
barangay = CASE WHEN '' = '' THEN barangay ELSE IFNULL('', barangay) END,
city = CASE WHEN '' = '' THEN city ELSE IFNULL('', city) END,
province = CASE WHEN '' = '' THEN province ELSE IFNULL('', province) END
WHERE userId = 1;

-- @block
SELECT *
FROM userInfo
WHERE
    (
		('' = '' OR lastName LIKE CONCAT('%', '', '%')) OR
    	('' = '' OR firstName LIKE CONCAT('%', '', '%')) OR
    	('' = '' OR middleName LIKE CONCAT('%', '', '%')) OR
    	('' = '' OR lrn LIKE CONCAT('%', '', '%')) OR
    	('' = '' OR barangay LIKE CONCAT('%', '', '%'))
	)
	AND
	(
		('' IS NULL OR '' = '' OR gradeLevel = '') AND
		('' is NULL OR '' = '' OR section = '')
	);


-- 

-- @block
START TRANSACTION; INSERT INTO users (email,phoneNumber,password,lrn,qrId) VALUES (?,?,?,?,?); INSERT INTO userInfo (userId,lastname,firstName,middleName,lrn,gradeLevel,section,age,sex,houseNo,street,zip,barangay,city,province) SELECT LAST_INSERT_ID(),CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,CASE WHEN ? IS NULL OR ? = '' THEN NULL ELSE ? END,; COMMIT;


-- @block
UPDATE userinfo
SET
	lastName = "garfil",
	firstName = "godwin",
	middleName = "p",
	age = 16,
	sex = true,
	gradeLevel = 10,
	section = "zeus"
WHERE id = 1;


-- @block
-- @block
-- DROP TABLE userInfo;
