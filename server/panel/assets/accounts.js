
async function submitQuery(type) {
	event.preventDefault()
	try {
		const response = await fetch('http://localhost:3000/ping', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(Object.fromEntries(new FormData(document.querySelector(".search")).entries())),
			credentials: 'include',
		});
		
		console.log(response);
	} catch (error) {console.error(console.error());}
}