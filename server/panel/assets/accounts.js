const sections = {
	"7": ["love", "kindness", "hope", "faith"],
	"8": ["matthew", "jeremiah", "psalm", "john"],
	"9": ["thomas", "joseph", "james", "paul"],
	"10": ["zeus", "aphrodite", "athena", "poseidon"],
	"11": ["",""],
	"12": ["",""],
}
const dialogElements = document.querySelectorAll(".logsDialog, .infoDialog");
let getMessageDebounce = true;
let messageCount = 0;

async function submitQuery(type) {
	event.preventDefault()
	try {
		const data = Object.fromEntries(new FormData(document.querySelector(".search")).entries())

		if (data.query.length == 0 && data.searchLevel == undefined && data.searchSection == undefined) {return console.log('bad data (client)');}

		const response = await fetch('http://localhost:3000/admin/query', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(data),
			credentials: 'include',
		});

		if (!response.ok) { return console.log("sumting wong"); }

		const respond = await response.json();
        console.log(respond);
		displayData(respond)

	} catch (error) {console.error(console.error(error));}
}

function displayData(data) {
	document.querySelectorAll(".main-table-contain > div.main-table-contain-item").forEach(element => {
		document.querySelector(".main-table-contain").removeChild(element);
	});
	for (let i = 0; i < data.length; i++) {
		const element = document.importNode(document.querySelector(".main-table-contain_template").content, true).querySelector(".main-table-contain-item")
		if (!data) {return}
		for (let i1 in data[i]) {
			const elementItem = element.querySelector(`#item-${i1}`);
			if (elementItem == null) {continue;}
			if (data[i][i1]) {elementItem.innerText = data[i][i1]; elementItem.classList.remove('_nullItems');}
		}
		element.querySelector('.main-table-contain-item-buttons').setAttribute("userId", data[i].userId);
		document.querySelector(".main-table-contain").appendChild(element);
	}
}

function getSection(value) {
	document.querySelectorAll('.search-section-item').forEach((element, i) => {
		if (!value) {
			element.setAttribute("hidden","");
			element.innerHTML = "";
			document.querySelector('.search-section-text').selected = true;
			document.querySelector('.search-section-none').removeAttribute("hidden");
			document.querySelector('.search-section-any').setAttribute("hidden","");
			return;
		}
		if (!sections[value][i]) {element.setAttribute("hidden",""); return;}
		element.innerHTML = sections[value][i];
		element.value = sections[value][i];
		document.querySelector('.search-section-none').setAttribute("hidden","");
		document.querySelector('.search-section-any').removeAttribute("hidden");
		document.querySelector('.search-section-text').selected = true;
		element.removeAttribute("hidden");
	})
}

async function fetchMessages(limit,offset,userId) {
	if (!limit || offset == undefined || limit >= 25 || offset <= -1) { console.log("bad data (client)"); return;}
	return await fetch('http://localhost:3000/admin/getMessage', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
	body: `{"limit": ${limit}, "offset": ${offset}, "userId": ${userId}}`
	})
	.then(response => {
		if (response.status >= 400) {
			console.warn("wong (client)"); return;
		} else {
			return response.json();
		}
	})
	.then(data => {return data;})
	.catch(error => { console.error(error); });
}

async function fetchInfo(userId) {
	if (userId == undefined) {console.log("bad data (client)");}
	return await fetch('http://localhost:3000/admin/getInfo', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
	body: `{"userId": ${userId}}`
	})
	.then(response => {
		if (response.status >= 400) {
			console.warn("wong (client)"); return;
		} else {
			return response.json();
		}
	})
	.then(data => {return data;})
	.catch(error => { console.error(error); });
}

async function fetchQrcache(userId) {
	if (userId == undefined) {console.log("bad data (client)");}
	return await fetch('http://localhost:3000/admin/getQrImage', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
	body: `{"userId": ${userId}}`
	})
	.then(response => {
		if (response.status >= 400) {
			console.warn("wong (client)"); return;
		} else {
			return response.blob();
		}
	})
	.then(data => {return data;})
	.catch(error => {console.error(error);});
}

async function openLogsDialog(value) {
	document.querySelector('.logsDialog').showModal();
	document.querySelector('.logsDialog').setAttribute("userId",value.parentElement.getAttribute('userId'));
	document.querySelector('.logsDialog').setAttribute("userName",value.parentElement.parentElement.querySelector('#item-firstName').innerText);
	const data = await fetchMessages(15,messageCount,value.parentElement.getAttribute('userId'));
	console.log(data);
	updateMessage(data);
}

async function openInfoDialog(value) {
	document.querySelector('.infoDialog').showModal()
	const data = await fetchInfo(value.parentElement.getAttribute('userId'))
	const qrData = await fetchQrcache(value.parentElement.getAttribute('userId'))
	console.log(data);
	updateInfo(data)
	updateInfoQr(qrData)
}

function updateMessage(data) {
	if (!data) {return;}
	for (let i = 0; i < data.length; i++) {
		const element = document.importNode(document.querySelector(".logsDialog-container-item_template").content, true).querySelector(".logsDialog-container-item")
		element.querySelector(".logsDialog-container-item-desc_name").innerText = document.querySelector('.logsDialog').getAttribute('userName')
		element.querySelector(".logsDialog-container-item-desc_time").innerText = new Date(data[i].time).toLocaleTimeString('en-US', {timeZone: "Asia/Manila", hour12: true, hour: "numeric", minute: "2-digit"})
		element.querySelector(".logsDialog-container-item-desc_date").innerText = new Date(data[i].time).toLocaleDateString('en-US', { month: 'long', day: 'numeric'})
		if (data[i].isIn == 1) {
			element.querySelector(".logsDialog-container-item-title span").innerText = "IN";
			element.querySelector(".logsDialog-container-item-title i").innerText = "Login";
			element.querySelector(".logsDialog-container-item-desc_isIn").innerText = "arrived";
		} else {
			element.querySelector(".logsDialog-container-item-title span").innerText = "OUT";
			element.querySelector(".logsDialog-container-item-title i").innerText = "Logout";
			element.querySelector(".logsDialog-container-item-desc_isIn").innerText = "left";
		}
		document.querySelector(".logsDialog-container").appendChild(element);
		messageCount++;
	}
};

function updateInfo(data) {
	if (!data) {return}
	for (const i in data) {
		const element = document.querySelector(`#info-${i}`)
		if (!element) {continue;}
		if (element.id == "info-qrId") {
			element.innerText = `{"qrId": "${data[i]}"}`;
			element.classList.remove('_nullItems');
			continue;
		}
		if (data[i]) {element.innerText = data[i]; element.classList.remove('_nullItems')}
	}
}

function updateInfoQr(data) {
	if (!data) {return}
	document.querySelector('#info-qrId + img').src = URL.createObjectURL(data);
}

document.querySelector(".logsDialog-container").addEventListener('scrollend', function(){
	if (getMessageDebounce && (this.clientHeight + this.scrollTop >= this.scrollHeight - 60)) {
		// When scrolled to the bottom of the container
		fetchMessages(5, messageCount, document.querySelector('.logsDialog').getAttribute('userId'))
		.then(data => {updateMessage(data)})
		getMessageDebounce = false;
		setTimeout(function() {
            getMessageDebounce = true;
        }, 500);
	}
})

dialogElements.forEach(element => {
	element.addEventListener("click", e => {
		const dialogDimensions = element.getBoundingClientRect()
		if (e.clientX < dialogDimensions.left ||e.clientX > dialogDimensions.right ||e.clientY < dialogDimensions.top ||e.clientY > dialogDimensions.bottom) {element.close()}
	})
});

document.querySelector(".logsDialog").addEventListener('close', () => {
	messageCount = 0;
	document.querySelector('.logsDialog').setAttribute('userId','');
	document.querySelector('.logsDialog').setAttribute('userName','');
	document.querySelectorAll(".logsDialog-container > div.logsDialog-container-item").forEach(element => {
		document.querySelector(".logsDialog-container").removeChild(element);
	});
})

document.querySelector(".infoDialog").addEventListener('close', () => {
	document.querySelector('#info-qrId + img').src = '';
	document.querySelectorAll('.infoDialog-container > span span').forEach(element => {
		element.classList.add("_nullItems");
		element.innerText = '';
	});
})

function adminLogin() {
	fetch('http://localhost:3000/admin/login', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
	body: '{"password": "123" }'
	})
	.then(response => {
		if (response.status >= 400) {console.warn("wong (client)"); return;} else { return response.json() }
	})
	.then(data => { console.log(data);})
	.catch(error => { console.error(error); });
}