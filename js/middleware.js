import rateLimit from "express-rate-limit";

export const rateLimitHandler = (errMessage = "rate limit timeout") => {
	return (req,res) => {
		console.log("rate limit reached: ", req.sessionID);
		return res.status(429).json({message: errMessage});
	};
};

export const limiter = (maxReq,windowMinute,errMessage) => {
	return rateLimit({
		windowMs: windowMinute * 60 * 1000, // 10 minutes
    	max: maxReq, // Limit each IP to maxRequests per windowMs
		handler: rateLimitHandler(errMessage),
		standardHeaders: true,
    	legacyHeaders: false,
	});
};

export const isAuthenticated = (req, res, next) => {
	if (!req.session.authenticated) {
		console.log("not auth");
		return res.status(401).json({ message: "Unauthorized access" });
	}
	next();
};

export const isAdmin = (req, res, next) => {
	if (!req.session.isAdmin || typeof req.session.authenticated !== "undefined" || req.session.authenticated === true) {
		if (req.accepts("html")) {
			return res.render("404", {
				path: "/admin" + req.path
			});
		}
		if (req.accepts("json")) {
			return res.json({message:"not found"});
		}
		return res.type("txt").send("not found");
	}
	next();
};