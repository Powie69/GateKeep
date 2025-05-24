import db from "./db.js";

export const clients = new Map();
export const adminClients = new Map();

export async function withTransaction(callback) {
	const connection = await db.getConnection();
	try {
		await connection.beginTransaction();
		const result = await callback(connection);
		await connection.commit();
		return result;
	} catch (err) {
		await connection.rollback();
		throw err;
	} finally {
		connection.release();
	}
}

/**
 * 0 - Female
 * 1 - Male
 *
 * @param {number} data - The numeric representation of gender (1 for Male, 0 for Female).
 * @returns {string|undefined} - Returns "Male" if data is 1, "Female" if data is 0, or undefined if input is invalid.
 */
export function parseGender(data) {
	if (typeof data !== "number" || data.length === 0) return;
	if (Number(data) === 1) {
		return "Male";
	} else if (Number(data) === 0) {
		return "Female";
	}
}

/**
 * Formats a name object into a string.
 *
 * @param {{firstName: string, middleName: string, lastName: string}} data - The name object.
 * @returns {string|undefined} - The formatted name string, or undefined if input is invalid.
 *
 * @example
 * parseName({firstName: "John", middleName: "Doe", lastName: "Smith"}) // returns "John D. Smith"
 * parseName({firstName: "John", lastName: "Smith"}) // returns "John Smith"
 */
export function parseName(data) {
	if (!data ||typeof data.firstName !== "string" || typeof data.firstName !== "string" ) return;
	if (typeof data.middleName !== "string" || data.middleName.length === 0) return `${data.firstName} ${data.lastName}`; // if fatherless
	return `${data.firstName} ${data.middleName.charAt(0).toUpperCase()}. ${data.lastName}`;
}

/**
 * @param {string} email The email to be checked.
 * @returns {boolean} True if the string is a valid email, false if not.
 */
export function isValidEmail(email) {
	if (!email || typeof email !== "string" || email.length === 0) return false;
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * @param {string} lrn The LRN to be checked.
 * @returns {boolean} True if the string is a valid LRN, false if not.
 */
export function isValidLrn(lrn) {
	if (!lrn || typeof lrn !== "string" || lrn.length !== 11) return false;
	return /^[1-6]\d{5}(0\d|1\d|2[0-5])\d{4}$/.test(lrn);
}

export function isValidPassword(password) {
	// todo: make password standard
}

/**
 * @param {string} phoneNumber The phone number to be checked
 * @returns {boolean} True if the string is a valid phone number, false if not
 */
export function isValidPhoneNumber(phoneNumber) {
	if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.length !== 11) return false;
	return /^09\d{9}$/.test(phoneNumber);
}

/**
 * @param {string} zip The zip code to be checked
 * @returns {boolean} True if the string is a valid zip code, false if not
 */
export function isValidZip(zip) {
	if (!zip || typeof zip !== "string" || zip.length === 0) return false;
	return /^(0[4-9]|[1-9]\d)\d{2}$/.test(zip); // what is this regex? how did i come up with this? I forgot.
}

// 1:-info,  2:-warning,  3:-error
export function logger(type,message) {
	switch (type) {
	case 1:
		type = "INFO";
		break;
	case 2: // warning
		type = "\u001b[33mWARNING\u001b[0m";
		break;
	case 3: // error
		type = "\u001b[31mERROR\u001b[0m";
		break;
	default:
		type = "INFO";
		break;
	}
	console.log(`[${type}][${new Date().toLocaleDateString("en-PH", { month: "2-digit" , day: "2-digit" ,year: "2-digit" })}\u001b[1m ${new Date().toLocaleTimeString("en-PH", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit"})}\u001b[0m] ${message}`);
}