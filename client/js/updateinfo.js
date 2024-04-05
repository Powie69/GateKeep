function updateCancel() {
	window.location.href = "./dashBoard.html"
}

function fetchInfo() {
	return fetch('http://localhost:3000/profile/getData', {
		method: 'post',
		credentials: 'include'
	})
	.then(response => {
		if (response.status >= 400) {
			console.warn("wong (client)"); return;
		} else { 
			return response.json() 
		}
	})
	.then(data => { return data; })
  	.catch(error => { console.error(error) });
}

fetchInfo()
.then(data => {
	for (var i in data) {
		if (i == "lrn" || i == "sex") {continue}
		if (data[i] != undefined) {document.querySelector(`#form-update label input[name=${i}]`).setAttribute("placeholder", data[i])}
	}
})

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