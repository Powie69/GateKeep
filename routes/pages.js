import express from "express";

import db from "../js/db.js";
import q from "../js/profileQuery.js";
import { adminClients, clients, parseGender, parseName } from "../js/utility.js";
const app = express.Router();

app.get("/", async (req,res) => {
	if (typeof req.session.authenticated === "undefined" || req.session.authenticated === false || typeof req.session.user === "undefined") return res.sendFile("views/home.html",{root:"./"});

	try {
		const [rows] = await db.query(q.GET_INFO, [req.session.user]);
		if (rows.length !== 1) return res.sendStatus(500);
		const data = rows[0];
		res.render("dashBoard", {
			displayName: req.session.displayName,
			name: parseName(data),
			gradeLevel: data.gradeLevel,
			section: data.section,
			lrn: data.lrn,
			address: `${data.houseNo} ${data.street}, ${data.barangay}, ${data.city}`,
			// viewDialog
			firstName: data.firstName,
			lastName: data.lastName,
			middleName: data.middleName,
			age: data.age,
			sex: parseGender(data.sex),
			barangay: data.barangay,
			city: data.city,
			province: data.province,
			zip: data.zip,
			street: data.street,
			houseNo: data.houseNo,
			phoneNumber: data.phoneNumber,
			email: data.email
		});
	} catch (err) {
		console.error(err);
		return res.status(500).send("Internal Server Error");
	}
});

app.get("/qr", async (req,res,next) => {
	if (typeof req.session.authenticated === "undefined" || req.session.authenticated === false || typeof req.session.user === "undefined") return next("route"); // goes to 404

	try {
		const [rows] = await db.query(q.GET_QRCACHE, [req.session.user]);
		if (rows.length !== 1 || rows[0].qrCache === null) return res.sendStatus(404);
		res.type("image/svg+xml").render("qr", { path: rows[0].qrCache });
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

app.ws("/ws",(ws,req) => {
	if (!req.session.authenticated) {
		return ws.close();
	}
	clients.set(req.session.user, ws);

	ws.on("close", () => {
		clients.delete(req.session.user);
	});
});

app.ws("/wsAdmin", (ws,req) => {
	if (!req.session.isAdmin) {
		return ws.close();
	}
	adminClients.set(req.session.user, ws);

	ws.on("close", () => {
		clients.delete(req.session.user);
	});
});

app.get("/about",(req,res) => {
	return res.render("about",{
		displayName: req.session.displayName || "No user",
	});
});

app.get("/help",(req,res) => {
	return res.render("help",{
		displayName: req.session.displaysName || "No user",
	});
});

app.get("/print", async (req,res) => {
	if (typeof req.session.authenticated === "undefined" || req.session.authenticated === false || typeof req.session.user === "undefined") {
		return res.render("noUser", {message: "Cannot print because you are not logged in", displayName: "no user"});
	}
	try {
		const [rows] = await db.query(q.GET_INFO_FOR_PRINT, [req.session.user]);
		if (rows.length !== 1) return res.sendStatus(500);
		console.log(rows);

		res.render("print", {
			displayName: req.session.displayName,
			name: parseName(rows[0]),
			gradeLevel: rows[0].gradeLevel || "NO GRADE LEVEL!",
			section: rows[0].section || "NO SECTION!",
		});
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

export default app;