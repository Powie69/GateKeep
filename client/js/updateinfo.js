function updateCancel() {
	window.location.href = "../html/dashBoard.html"
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
        const data = Object.fromEntries(new FormData(document.getElementById("form-update")).entries());

		if (data.age != undefined && data.age <= -1 || data.age > 99) {document.querySelector(".update .update-header p").innerText = "bad data"; return console.log("bad data (cleint)");}
		if (data.sex != undefined && !(data.sex == 0 || data.sex == 1)) {return console.log("bad data (client)");}

        const response = await fetch('http://localhost:3000/profile/updateData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data),
			credentials: 'include',
        });

        if (!response.ok) { console.log(response); return;}

        const respond = await response.json();
        console.log(respond);
    } catch (error) {
        console.error(error);
    }
	window.location.href = "../html/dashBoard.html"
}