import express from "express";
import { db } from "../js/middleware.js";
import { parseGender, parseName, logger, clients, adminClients } from "../js/utility.js";
import q from "../js/profileQuery.js";
const app = express.Router();

app.get("/",(req,res) => {
	if (typeof req.session.authenticated === "undefined" || req.session.authenticated === false || typeof req.session.user === "undefined") {
		return res.sendFile("views/home.html",{root:"./"});
	}
	db.query(q.GET_INFO, [req.session.user], (err,result) => {
		if (err) {console.error("SQL:", err); return res.status(500).send("Internal Server Error");}
		if (result.length !== 1) {return res.status(500).send("Internal Server Error");}
		const data = result[0];
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
			gradeLevel: data.gradeLevel,
			section: data.section,
			barangay: data.barangay,
			city: data.city,
			province: data.province,
			zip: data.zip,
			street: data.street,
			houseNo: data.houseNo,
			phoneNumber: data.phoneNumber,
			email: data.email
		});
	});
});

app.get("/qr", (req,res,next) => {
	if (typeof req.session.authenticated === "undefined" || req.session.authenticated === false || typeof req.session.user === "undefined") {
		return next("route"); // goes to 404
	}
	db.query(q.GET_QRCACHE,[req.session.user],(err,result) => {
		if (err) {console.error("SQL:", err); return res.status(500).send("Internal Server Error");}
		if (result.length !== 1) {return res.status(404).send("Internal Server Error");}
		res.setHeader("Content-Type", "image/svg+xml");
		res.render("qr", { path: result[0].qrCache });
	});
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
		displayName: req.session.displayName || "No user",
	});
});

app.get("/print",(req,res) => {
	if (typeof req.session.authenticated === "undefined" || req.session.authenticated === false || typeof req.session.user === "undefined") {
		return res.render("noUser", {message: "Cannot print because you are not logged in", displayName: "no user"});
	}
	db.query(q.GET_INFO_FOR_PRINT, [req.session.user],(err,result) => {
		if (err) {console.error("SQL:", err); return res.status(500).send("Internal Server Error");}
		if (result.length !== 1) {logger(3,`[${req.sessionID.substring(0,6)}] [${req.headers["user-agent"]}] PRINT ERROR`);}
		result = result[0];
		res.render("print", {
			displayName: req.session.displayName,
			name: parseName(result),
			gradeLevel: result.gradeLevel || "NO GRADE LEVEL!",
			section: result.section || "NO SECTION!",
		});
	});
});

export default app;