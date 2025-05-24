import crypto from "crypto";
import express from "express";
import qrcode from "qrcode";

import q from "../js/adminQuery.js";
import db from "../js/db.js";
import {isAdmin, limiter }  from "../js/middleware.js";
import { adminClients, clients, isValidEmail, isValidLrn, isValidPhoneNumber, logger, parseGender, parseName } from "../js/utility.js";
const app = express.Router();

app.get("/",(req,res,next) => {
	if (/Mobile|Android|iP(hone|ad)/.test(req.headers["user-agent"]) || typeof req.session.authenticated !== "undefined" || req.session.authenticated === true) {
		return next("router"); // goes to 404 page
	}
	if (typeof req.session.isAdmin === "undefined" || req.session.isAdmin === false) {
		return res.sendFile("views/admin/login.html",{root:"./"});
	}
	if (typeof req.query.account !== "undefined") {
		return res.redirect("/admin/accounts");
	} // else
	res.redirect("/admin/panel");
});

app.post("/login", limiter(10,1), (req,res) => {
	if (crypto.createHash("sha256").update(req.body.password).digest("hex") !== process.env.adminPassword) return res.sendStatus(401);
	req.session.cookie.maxAge = 50400000; // 14 hours
	req.session.isAdmin = true;
	logger(1,`[${req.sessionID.substring(0,6)}] [${req.headers["user-agent"]}] Logged in as admin.`);
	res.redirect("/");
});

//* requires 'isAdmin'

//
const isInvalidParams = (str) => !(/^\d+$/.test(str) && Number(str) >= 0);

app.get("/qr-image-create/:id",isAdmin, async(req,res) => {
	const data = req.params.id;
	if (isInvalidParams(data)) return res.sendStatus(400);
	try {
		const [rows] = await db.query(q.GET_QRID, [data]);
		if (rows.length === 0) return res.status(404).json({message: "QR id not found for user"});
		const qrImage = await qrcode.toString(JSON.stringify(rows[0]), {type:"svg",width:10,margin:2,scale:1});
		const matches = [...qrImage.matchAll(/<path[^>]*d="([^"]*)"/g)];
		await db.query(q.ADD_QRCACHE, [matches[1][1], data]);
		return res.type("image/svg+xml").status(201).send(qrImage);
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

app.get("/qr-image/:id",isAdmin, async (req,res) => {
	const data = req.params.id;
	if (isInvalidParams(data)) {return res.status(404).json({message: "not valid"});}
	try {
		const [rows] = await db.query(q.GET_QRCACHE, [data]);
		if (rows.length !== 1 || rows[0].qrCache === null) return res.sendStatus(404);
		res.set("Content-Type", "image/svg+xml");
		return res.render("qr" , { path: rows[0].qrCache });
	} catch (err) {
		console.log(err);
		return res.sendStatus(500);
	}
});

app.get("/info/:userId",isAdmin, async (req,res) => {
	const userId = req.params.userId;
	if (isInvalidParams(userId)) return res.sendStatus(400);
	try {
		const [rows] = await db.query(q.GET_INFO, [userId]);
		if (rows.length === 0) return res.sendStatus(404);
		rows[0].sex = parseGender(rows[0].sex);
		return res.json(rows[0]);
	} catch (err) {
		console.log(err);
		return res.sendStatus(500);
	}
});

app.get("/messages/:userId",isAdmin, async (req,res) => {
	const data = req.query;
	console.log(data);
	if (isInvalidParams(req.params.userId)) return res.sendStatus(400);
	if (!data || typeof data.offset !== "string" || typeof data.offset !== "string" ||data.offset <= -1 || data.limit > 25 || data.limit <= -1) return res.sendStatus(400);
	try {
		const [rows] = await db.query(q.GET_MESSAGE, [req.params.userId, +data.limit, +data.offset]);
		if (rows.length === 0) return res.status(404).json({message: "No more messages found"});
		res.json(rows);
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

//
app.use("/",isAdmin,express.static("node_modules/qr-scanner"));
if (process.env.NODE_ENV === "production") {
	app.use("/assets",isAdmin,express.static("views/admin/assetsMinified"));
}
app.use("/",isAdmin,express.static("views/admin",{extensions:"html"}));

app.get("/logs",isAdmin,(req,res) => {
	res.render("admin/logs");
});

//
app.post("/send", isAdmin, async (req,res) => { // todo: test
	const data = req.body;
	if (!data || typeof data.qrId === "undefined"|| typeof data.isIn !== "boolean" || data.qrId == "") return res.sendStatus(400);

	try {
		const [rows] = await db.query(q.GET_INFO_VIA_QRID, [data.qrId]);
		if (rows.length === 0) return res.status(404).json({message:"no Qr data found"});
		const userId = rows[0].id;
		const [rows2] = await withTransaction(async (connection) => {
			return await connection.query(q.ADD_MESSAGE, [userId,data.isIn,new Date().toISOString().slice(0, 19),userId]);
		});

		const result = rows2[1][0];

		result.sex = parseGender(result.sex);
		result.name = parseName(result);
		delete result.firstName;
		delete result.lastName;
		delete result.middleName;
		res.status(201).json(...result, rows[0]);
		broadcastWebsocketAdmin([...result]);
		const ws = clients.get(userId);
		if (!ws || ws.readyState !== 1) return;
		ws.send(JSON.stringify(rows2[2][0]));
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

app.post("/logs/data",isAdmin, async (req,res) => {
	const data = req.body;
	if (!data || data.limit == undefined || data.offset == undefined || data.limit > 40 || data.offset <= -1) return res.sendStatus(400);
	try {
		const [rows] = await db.query(q.GET_LOGS, [data.limit, data.offset]);
		if (rows.length === 0) return res.sendStatus(404);
		for (const index in rows) {
			rows[index].name = parseName(rows[index]).slice(0,30);
			delete rows[index].firstName;
			delete rows[index].lastName;
			delete rows[index].middleName;
		}
		res.json(rows);
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

app.post("/query", isAdmin, async (req,res) => {
	const data = req.body;
	if (data.query.length == 0 && data.searchLevel == undefined && data.searchSection == undefined) return res.sendStatus(400);
	try {
		const [rows] = await db.query(q.GET_QUERY, [...new Array(10).fill(data.query), ...new Array(3).fill(data.searchLevel), ...new Array(3).fill(data.searchSection)]);
		if (rows.length === 0) return res.status(404).json({message: "No result for query"});
		for (const index in rows) {
			rows[index].sex = parseGender(rows[index].sex);
		}
		res.json(rows);
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

app.post("/updateInfo", isAdmin, async (req,res) => {
	const data = req.body;
	console.log(req.body);

	if ((typeof data.email != "undefined" && data.email.length !== 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) || (typeof data.phoneNumber != "undefined" && data.phoneNumber.length !== 0 && !/^09\d{9}$/.test(data.phoneNumber)) || (typeof data.lrn != "undefined" && data.lrn.length !== 0 && !/^[1-6]\d{5}(0\d|1\d|2[0-5])\d{4}$/.test(data.lrn)) || (typeof data.gradeLevel != "undefined" && data.gradeLevel.length !== 0 && (data.gradeLevel < 7 || data.gradeLevel > 12)) || (typeof data.zip !== "undefined" && data.zip.length !== 0 && !/^(0[4-9]|[1-9]\d)\d{2}$/.test(data.zip))) return res.sendStatus(400);
	for (const i in data) {
		if (typeof data[i] !== undefined && data[i].length !== 0 && data[i].length >= 255) return res.sendStatus(400);
	}

	// console.log(db.format(q.UPDATE_INFO, [data.email, data.email, data.email, data.phoneNumber, data.phoneNumber, data.phoneNumber, data.lrn, data.lrn, data.lrn, data.password, data.password, data.password, data.userId, data.lastName, data.lastName, data.lastName, data.firstName, data.firstName, data.firstName, data.middleName, data.middleName, data.middleName, data.gradeLevel, data.gradeLevel, data.gradeLevel, data.section, data.section, data.section, data.age, data.age, data.age, data.sex, data.sex, data.sex, data.houseNo, data.houseNo, data.houseNo, data.street, data.street, data.street, data.zip, data.zip, data.zip, data.barangay, data.barangay, data.barangay, data.city, data.city, data.city, data.province, data.province, data.province, data.userId]))

	try {
		await db.query(q.UPDATE_INFO, [data.email, data.email, data.email, data.phoneNumber, data.phoneNumber, data.phoneNumber, data.lrn, data.lrn, data.lrn, data.password, data.password, data.password, data.userId, data.lastName, data.lastName, data.lastName, data.firstName, data.firstName, data.firstName, data.middleName, data.middleName, data.middleName, data.gradeLevel, data.gradeLevel, data.gradeLevel, data.section, data.section, data.section, data.age, data.age, data.age, data.sex, data.sex, data.sex, data.houseNo, data.houseNo, data.houseNo, data.street, data.street, data.street, data.zip, data.zip, data.zip, data.barangay, data.barangay, data.barangay, data.city, data.city, data.city, data.province, data.province, data.province, data.userId]);
		res.sendStatus(201);
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

app.post("/create", isAdmin, async (req,res) => {
	const data = req.body;
	if (!isValidEmail(data.email) || !isValidPhoneNumber(data.phoneNumber) || !data.password || !isValidLrn(data.lrn) || !data.lastName || data.lastName.length === 0 || !data.firstName || data.firstName.length === 0 || (typeof data.gradeLevel != undefined && data.gradeLevel.length != 0 && (data.gradeLevel < 7 || data.gradeLevel > 12)) || (typeof data.zip !== undefined && data.zip.length != 0 && !/^(0[4-9]|[1-9]\d)\d{2}$/.test(data.zip))) return res.sendStatus(400);
	console.log(data);

	// const hash = crypto.createHash('sha256').update(data.lrn + process.env.qrIdSecret).digest('hex').substring(0,25)
	// console.log(db.format(q.ADD_ACCOUNT, [data.email,data.phoneNumber,data.password,data.lrn,hash,data.lastName,data.lastName,data.lastName,data.firstName,data.firstName,data.firstName,data.middleName,data.middleName,data.middleName,data.lrn,data.lrn,data.lrn,data.gradeLevel,data.gradeLevel,data.gradeLevel,data.section,data.section,data.section,data.age,data.age,data.age,data.sex,data.sex,data.sex,data.houseNo,data.houseNo,data.houseNo,data.street,data.street,data.street,data.zip,data.zip,data.zip,data.barangay,data.barangay,data.barangay,data.city,data.city,data.city,data.province,data.province,data.province]));

	// todo: fix query
	try {
		const [rows] = await db.query(q.CHECK_ACCOUNT, [data.lrn]);
		if (rows.length !== 0) return res.sendStatus(409);
		const hash = crypto.createHash("sha256").update(data.lrn + process.env.qrIdSecret).digest("hex").substring(0,25);
		const [rows2] = await db.query(q.ADD_ACCOUNT, [data.email,data.phoneNumber,data.password,data.lrn,hash,data.lastName,data.lastName,data.lastName,data.firstName,data.firstName,data.firstName,data.middleName,data.middleName,data.middleName,data.lrn,data.lrn,data.lrn,data.gradeLevel,data.gradeLevel,data.gradeLevel,data.section,data.section,data.section,data.age,data.age,data.age,data.sex,data.sex,data.sex,data.houseNo,data.houseNo,data.houseNo,data.street,data.street,data.street,data.zip,data.zip,data.zip,data.barangay,data.barangay,data.barangay,data.city,data.city,data.city,data.province,data.province,data.province]);
		logger(1, JSON.stringify(rows2));
		res.sendStatus(201);
	} catch (err) {
		console.error(err);
		res.sendStatus(500);
	}
});

app.post("/bulkCreate", isAdmin, async (req,res) => {
	let data = req.body.jsonData;
	if (typeof data !== "string" || data.length === 0) return res.sendStatus(400);
	try {
		data = JSON.parse(data);
	} catch (err) {
		console.log(err);
		return res.status(400).json({message:err.message});
	}
	if (typeof data !== "object" || data.length === 0) return res.status(400).json({message:"No accounts in json"});
	const lrn = new Set();
	for (const i in data) {
		if (lrn.has(data[i].lrn)) return res.status(409).json({message:"accounts with same lrn found in data"});
		if (!isValidEmail(data[i].email)|| typeof data[i].phoneNumber === "undefined" || data[i].phoneNumber.length === 0 || !/^09\d{9}$/.test(data[i].phoneNumber) || typeof data[i].password === "undefined" || data[i].password.length === 0 || typeof data[i].lrn === "undefined" || data[i].lrn.length === 0 || !/^[1-6]\d{5}(0\d|1\d|2[0-5])\d{4}$/.test(data[i].lrn) || typeof data[i].lastName === "undefined"  || data[i].lastName.length === 0 || typeof data[i].firstName === "undefined" || data[i].firstName.length === 0 || (typeof data[i].gradeLevel != "undefined" && data[i].gradeLevel.length != 0 && (data[i].gradeLevel < 7 || data[i].gradeLevel > 12)) || (typeof data[i].zip !== undefined && data[i].zip.length != 0 && !/^(0[4-9]|[1-9]\d)\d{2}/.test(data[i].zip))) {
			return res.status(400).json({message:"accounts have invalid values"});
		}
		lrn.add(data[i].lrn);
	}
	try {
		const [rows] = await db.query(q.CHECK_ACCOUNT, [data[0].lrn]);
		if (rows.length !== 0) return res.status(409).json({message:"accounts with same lrn found in database"});
		console.log(rows);
		for (const i in data) {
			const account = data[i];
			const hash = crypto.createHash("sha256").update(account.lrn + process.env.qrIdSecret).digest("hex").substring(0,25);
			await db.query(q.ADD_ACCOUNT, [account.email,account.phoneNumber,account.password,account.lrn,hash,account.lastName,account.lastName,account.lastName,account.firstName,account.firstName,account.firstName,account.middleName,account.middleName,account.middleName,account.lrn,account.lrn,account.lrn,account.gradeLevel,account.gradeLevel,account.gradeLevel,account.section,account.section,account.section,account.age,account.age,account.age,account.sex,account.sex,account.sex,account.houseNo,account.houseNo,account.houseNo,account.street,account.street,account.street,account.zip,account.zip,account.zip,account.barangay,account.barangay,account.barangay,account.city,account.city,account.city,account.province,account.province,account.province]);
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({message:err.message});
		return;
	}
	res.status(201).json({message: "all goods"});
});

app.post("/remove/check", isAdmin, limiter(10,1), async (req,res) => {
	const data = req.body;
	if (typeof data === "undefined" || typeof data.id === "undefined" || data.id == "") return res.sendStatus(400);
	try {
		const [rows] = await db.query(q.REMOVE_ACCOUNT_CHECK, [data.id]);
		rows[0].name = parseName(rows[0]);
		delete rows[0].firstName;
		delete rows[0].lastName;
		delete rows[0].middleName;
		res.json(rows[0]);
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

app.delete("/remove/confirm", isAdmin, limiter(10,1), async (req,res) => {
	const data = req.body;
	if (!data || typeof data.id === "undefined" || typeof data.lrn === "undefined" || !/^[1-6]\d{5}(0\d|1\d|2[0-5])\d{4}$/.test(data.lrn) || data.lrn.length !== 12) return res.sendStatus(400);

	try {
		await db.query(q.REMOVE_ACCOUNT_CONFIRM, [data.id,data.lrn,data.id,data.id,data.lrn]);
		logger(1,`removed ${data.lrn}`);
		res.json({message: "massive success"});
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

function broadcastWebsocketAdmin() {
	try {
		const [rows] = db.query(q.GET_LATEST_MESSAGE);
		rows[0].name = parseName(rows[0]).slice(0,30);
		delete rows[0].firstName;
		delete rows[0].lastName;
		delete rows[0].middleName;
		adminClients.forEach((ws) => {
			if (!ws || ws.readyState !== 1) return;
			ws.send(JSON.stringify(rows[0]));
		});
	} catch (err) {
		console.error(err);
		// return res.sendStatus(500);
	}
}

export default app;