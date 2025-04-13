async function submitLogin(event) {
	event.preventDefault();
	try {
		const data = Object.fromEntries(new FormData(event.target).entries());

		if (typeof data.password === "undefined") {return;}

		const response = await fetch("/admin/login", {
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded"},
			body: new URLSearchParams(data),
		});

		if (!response.ok) {return console.log("sumting wong");}
		location.reload();
	} catch (error) {console.error(console.error(error));}
}