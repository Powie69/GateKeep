async function loginSubmit(event) {
	event.preventDefault();
	const data = Object.fromEntries(new FormData(event.target).entries());
	if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username) || /^09\d{9}$/.test(data.username)) || !/^[1-6]\d{11}$/.test(data.lrn) || !data.password) {
		console.log("Invalid login data (client)");
	}
	console.log("Valid login data (client)");
	try {
		const response = await fetch("profile/login", {
			method: "POST",
			headers: {
				"Content-Type": "application",
			},
			body: JSON.stringify(data),
		});

		const respond = await response.json();

		if (!response.ok) {
			document.querySelector(".main-form-message").innerText = respond.message;
			document.querySelector(".main-form-message").classList.remove("_noDisplay");
			return;
		} else {
			document.querySelector(".main-form-message").classList.add("_noDisplay");
			location.reload();
			return;
		}
	} catch (error) {console.error(error);}
}