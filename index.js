import "dotenv/config";

import compression from "compression";
import express from "express";
import MySQLStore from "express-mysql-session";
import session from "express-session";
import expressWs from "express-ws";
import path from "path";

const app = express();
expressWs(app);
// *
app.disable("x-powered-by");
app.set("view engine","ejs");
app.use(compression());

const sessionStore = new (MySQLStore(session))({
	host: process.env.dbHost,
	user: process.env.dbUser,
	password: process.env.dbPassword,
	database: process.env.dbName,
	clearExpired: true,
	checkExpirationInterval: 1209600000, // 2 weeks
	expiration: 2419200000, // 4 weeks
	createDatabaseTable: false
});

app.use(session({
	secret: process.env.cookieSecret,
	saveUninitialized: false,
	resave: false,
	unset: "destroy",
	store: sessionStore,
	cookie: {
		maxAge: 2419200000, // 4 weeks
		httpOnly: true,
		// secure: process.env.cookieSecure,
		sameSite: "strict"
	},
}));

// static files
if (process.env.NODE_ENV === "production") {
	app.use("/css",express.static(path.join(__dirname, "public", "cssMinified")));
	app.use("/js",express.static(path.join(__dirname, "public", "jsMinified")));
}
app.use(express.static("public"));
//

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", (await import("./routes/pages.js")).default);

app.use("/profile", (await import("./routes/profile.js")).default);
app.use("/admin", (await import("./routes/admin.js")).default);

// ** //

// **404 handler //
app.use((req,res) => {
	res.status(404);
	if (req.accepts("html")) {
		return res.render("404", {
			displayName: req.session.displayName || "No user",
			path: req.path
		});
	}
	if (req.accepts("json")) {
		return res.json({message:"not found"});
	}
	res.type("txt").send("not found");
});
// ** //

app.listen(process.env.serverPort, () => {
	process.title = `Gatekeep Server | ${process.env.serverPort}`;
	console.log(`Server is running on http://localhost:${process.env.serverPort} || ${process.env.NODE_ENV}`);
});