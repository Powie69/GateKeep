import mysql from "mysql2";

const pool = mysql.createPool({
	host: process.env.dbHost,
	user: process.env.dbUser,
	password: process.env.dbPassword,
	database: process.env.dbName,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 25,
	idleTimeout: 60000,
	multipleStatements: true
});

export default pool.promise();