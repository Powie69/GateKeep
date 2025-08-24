// todo: loading animation

async function loginSubmit(event) {
	event.preventDefault();
	const data = Object.fromEntries(new FormData(event.target));

	// todo: update validation; display what is wrong
	if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username) || /^09\d{9}$/.test(data.username)) || !/^[1-6]\d{11}$/.test(data.lrn) || !data.password) {
		console.log("Invalid login data (client)");
		return;
	}

	try {
		const response = await fetch("/profile/login", {
			method: "POST",
			headers: { "Content-Type": "application/json", },
			body: JSON.stringify(data),
		});

		const respond = await response.json();

		if (!response.ok) {
			document.querySelector(".form-message").innerText = respond.message;
			document.querySelector(".form-message").classList.remove("_hidden");
		} else {
			document.querySelector(".form-message").classList.add("_hidden");
			location.reload();
		}
	} catch (err) { console.error(err); }
}