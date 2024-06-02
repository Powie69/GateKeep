
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
SELECT * FROM userInfo WHERE lastName LIKE '%%' OR WHERE firstName LIKE '%%' OR WHERE middleName LIKE '%%' OR WHERE lrn LIKE 'lrn' OR WHERE barangay LIKE '%%';

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

-- @block
SELECT * 
FROM userInfo 
WHERE 
    (
		(? = '' OR lastName LIKE CONCAT('%', ?, '%')) OR 
    	(? = '' OR firstName LIKE CONCAT('%', ?, '%')) OR 
    	(? = '' OR middleName LIKE CONCAT('%', ?, '%')) OR 
    	(? = '' OR lrn LIKE CONCAT('%', ?, '%')) OR 
    	(? = '' OR barangay LIKE CONCAT('%', ?, '%'))
	) 
	AND 
	(
		(? IS NULL OR ? = '' OR gradeLevel = ?) AND
		(? is NULL OR ? = '' OR section = ?)
	);

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

