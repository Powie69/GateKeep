async function submitLogin(event) {
	event.preventDefault();
	try {
		const data = Object.fromEntries(new FormData(event.target));

		if (typeof data.password === "undefined") return;

		const response = await fetch("/admin/login", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(data)
		});

		if (!response.ok) return console.log("sumting wong");
		location.reload();
	} catch (error) {console.error(console.error(error));}
}