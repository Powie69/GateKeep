function done() {
	window.location.href = "./dashBoard.html"
}

function getInfo() {
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

function viewShow() {
	if (window.innerWidth <= 600) {
		window.location.href = "./viewInfo.html"
	} else {
		document.querySelector(".view").showModal()
		getInfo()
		.then(data => { updateViewDialog(data) })
	}
}

function updateViewDialog(data) {
	for (var i in data) {
		if (data[i] != undefined && i == "sex") {
			if (data[i] == 1) {
				document.querySelector('.view-sex p').innerText = "Male"
			} else { document.querySelector('.view-sex p').innertext = "Female" }
			continue;
		}
		if (data[i] != undefined) {document.querySelector(`.view-${i} p`).innerText = data[i]}
	}
}

getInfo()
.then(data => {
	updateViewDialog(data)
})