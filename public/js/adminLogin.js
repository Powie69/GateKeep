async function submitLogin(event) {
	event.preventDefault();
	try {
		const data = Object.fromEntries(new FormData(event.target));

		if (typeof data.password !== "string") return;

		const response = await fetch("/admin/login", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(data)
		});

		if (!response.ok) return;
		location.reload();
	} catch (err) {console.error(err);}
}