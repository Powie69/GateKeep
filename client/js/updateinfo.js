function updateCancel() {
	window.location.href = "./dashBoard.html"
}

async function updateSubmit() {
    event.preventDefault();
    try {
        const formData = new FormData(document.getElementById("form-update"));
        const data = Object.fromEntries(formData.entries());

        // client-side check, server-side will still check

        const response = await fetch('http://localhost:3000/profile/updateData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data),
			credentials: 'include',
        });

        const respond = await response.json();

        if (!response.ok) {
			console.log(response);
			return;
        } 
        console.log(respond);
    } catch (error) {
        console.error(error);
    }
	window.location.href = "./dashBoard.html"
}