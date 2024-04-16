var messageCount = 0;
let getMessageDebounce = true;
const msgElement = document.querySelector(".logs-item_template");

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

function fetchMessages(limit, offset) {
	if (!limit || offset == undefined || limit >= 25 || offset <= -1) { console.log("bad data (client)"); return;}
	return fetch('http://localhost:3000/profile/getMessage', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
	body: `{"limit": ${limit}, "offset": ${offset}}`
	})
	.then(response => {
		if (response.status >= 400) {
			console.warn("wong (client)"); return;
		} else {
			return response.json()
		}
	})
	.then(data => {return data;})
	.catch(error => { console.error(error); });
}

function fetchQrcode() {
	fetch('http://localhost:3000/profile/getQrcode', {
		method: 'post',
		credentials: 'include',
	})
	.then(response => {
		if (response.status >= 400) {
			console.warn("wong (client)"); return;
		} else {
			return response.blob()
		}
	})
	.then( data => {
		document.querySelector(".qr-img").src = URL.createObjectURL(data);
	})
	.catch(error => { console.error(error); });
}

// fetchQrcode()

function updateMessage(data) {
	if (!data) {return;}
	for (let i = 0; i < data.length; i++) {
		const element = document.importNode(msgElement.content, true).querySelector(".logs-item")
		element.querySelector(".logs-item-desc ._time").innerText = new Date(data[i].time).toLocaleTimeString('en-US', {timeZone: "Asia/Manila", hour12: true})
		element.querySelector(".logs-item-desc ._date").innerText = new Date(data[i].time).toLocaleDateString('en-US', { month: 'long', day: 'numeric'})
		if (data[i].isIn == 1) {
			element.querySelector(".logs-item-title span").innerText = "IN"
			element.querySelector(".logs-item-title i").innerText = "Login"
			element.querySelector(".logs-item-desc ._isIn").innerText = "arrived"
		} else {
			element.querySelector(".logs-item-title span").innerText = "OUT"
			element.querySelector(".logs-item-title i").innerText = "Logout"
			element.querySelector(".logs-item-desc ._isIn").innerText = "left"
			
		}
		document.querySelector(".logs-container").appendChild(element);
		messageCount++;
	}
}

function updateInfo() {
	fetchInfo()
	.then(data => {
		if (!data) {return}
		if (data.lastName) {document.querySelector(".lastName p").innerText = data.lastName;}
		if (data.firstName) {document.querySelector(".firstName p").innerText = data.firstName; msgElement.content.querySelector("._name").innerText = data.firstName}
		if (data.middleName) {document.querySelector(".middleName p").innerText = data.middleName;}
		if (data.lrn) {document.querySelector(".lrn p").innerText = data.lrn;}
		if (data.age) {document.querySelector(".age p").innerText = data.age;}
		if (data.sex) {
			if (data.sex == 1) {
				document.querySelector(".sex p").innerText = "Male";
			} else {document.querySelector(".sex p").innerText = "Female";}
		}
	})  
}

// this one is for the 'update' dialog
function updateInfoDialog(data) {
	for (var i in data) {
		if (i == "lrn" || i == "sex") {continue}
		if (data[i] != undefined) {document.querySelector(`#form-update label input[name=${i}]`).setAttribute("placeholder", data[i])}
	}
}

// for the 'view' dialog
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

document.querySelector(".update").addEventListener("click", e => {
	const dialogDimensions = document.querySelector(".update").getBoundingClientRect()
	if (e.clientX < dialogDimensions.left ||e.clientX > dialogDimensions.right ||e.clientY < dialogDimensions.top ||e.clientY > dialogDimensions.bottom) {document.querySelector(".update").close()}
})

function updateShow() {
	if (window.innerWidth <= 600) {
		window.location.href = "./updateInfo.html"
	} else {
		document.querySelector(".update").showModal()
		fetchInfo()
		.then(data => { updateInfoDialog(data) })	
	}
}

function viewShow() {
	if (window.innerWidth <= 600) {
		window.location.href = "./viewInfo.html"
	} else {
		document.querySelector(".view").showModal()
		fetchInfo()
		.then(data => { updateViewDialog(data) })
	}
}

updateInfo()

fetchMessages(5, messageCount)
.then(data => { updateMessage(data)})

document.querySelector(".logs-container").addEventListener('scrollend', function(scroll){
	if (getMessageDebounce && (this.clientHeight + this.scrollTop >= this.scrollHeight - 10)) {
		// When scrolled to the bottom of the container
		fetchMessages(5, messageCount)
		.then(data => {updateMessage(data)})
		getMessageDebounce = false;
		setTimeout(function() {
            getMessageDebounce = true;
        }, 1000);
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
			console.log(`server: ${response}`);
			document.querySelector(".update").close();
			return;
        }

        console.log(respond);
		// location.reload()
		updateInfo()
    } catch (error) {
		document.querySelector(".update").close();
    }
	document.querySelector(".update").close();
}