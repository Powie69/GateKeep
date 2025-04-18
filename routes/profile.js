import express from "express";

import db from "../js/db.js";
import {isAuthenticated, limiter } from "../js/middleware.js";
import q from "../js/profileQuery.js";
import { logger } from "../js/utility.js";
const app = express.Router();

app.post("/login", limiter(30, 5), async (req, res) => {
	const data = req.body;

	if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username) || /^09\d{9}$/.test(data.username)) || !/^[1-6]\d{11}$/.test(data.lrn) || !data.password) {
		return res.status(400).json({ message: "Email or Phone number, LRN, and password are required" });
	}
	if (typeof req.session.authenticated !== "undefined" || req.session.authenticated === true || typeof req.session.user !== "undefined") {
		return res.status(400).json({message:"already auth"});
	}

	try {
		const [rows] = db.query(q.LOGIN, [data.username, data.username, data.lrn, data.password]);
		if (result.length !== 1) return res.status(401).json({ message: "Invalid email/phone, LRN, or password" });
		req.session.authenticated = true;
		req.session.user = rows[0].id;
		req.session.displayName = rows[0].firstName;
		req.session.ua = req.headers["user-agent"];
		res.json({ message: "Login successful"});
		logger(1,`[${req.sessionID.substring(0,6)}] [${req.headers["user-agent"]}] Logged in`);
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

// requires 'isAuthenticated'

app.post("/logout", isAuthenticated, (req,res) => {
	req.session.destroy((err) => {
		if (err) return res.status(500).json({ message: "Internal Server Error"});
		res.json({ message: "logout successful"});
		logger(1,`[${req.sessionID.substring(0,6)}] [${req.headers["user-agent"]}] Logged out.`);
	});
});

app.post("/getMessage", isAuthenticated, limiter(200,10), async (req,res) => {
	const data = req.body;
	if (!data.limit || data.offset == undefined || data.limit >= 25 || data.offset <= -1) {return res.status(400).send("bad data (server)");}

	try {
		const [rows] = await db.query(q.GET_MESSAGE, [req.session.user, data.limit, data.offset]);
		if (rows.length === 0) return res.sendStatus(404);
		res.json(rows);
	} catch (err) {
		console.error(err);
		return res.sendStatus(500);
	}
});

export default app;