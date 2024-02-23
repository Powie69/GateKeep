async function signupSubmit() {
	event.preventDefault()
	try {
		const formData = new FormData(document.getElementById("form-signup"));
		
		const jsonObject = Object.fromEntries(formData.entries());
		console.log(jsonObject)

		const response = await fetch('http://localhost:3000/ds', {
			method: 'POST',
			// headers: {
			// 'Content-Type': 'application/json', // Set content type to JSON
			// },
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(formData),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const respond = await response.json();
		console.log(respond)
	} catch (error) {
		console.error(':', error);
	}
}