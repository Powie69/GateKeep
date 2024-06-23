const sections = {
	"7": ["love", "kindness", "hope", "faith"],
	"8": ["matthew", "jeremiah", "psalm", "john"],
	"9": ["thomas", "joseph", "james", "paul"],
	"10": ["zeus", "aphrodite", "athena", "poseidon"],
	"11": ["",""],
	"12": ["",""],
};
const dialogElements = document.querySelectorAll(".logsDialog, .infoDialog, .editDialog, .addDialog");
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

async function submitEditInfo(event) {
	event.preventDefault()
	try {
		const data = Object.fromEntries(new FormData(document.querySelector(".editDialog-form")).entries());
		if ((typeof data.email != undefined && data.email.length != 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) || (typeof data.phoneNumber != undefined && data.phoneNumber.length != 0 && !/^09\d{9}$/.test(data.phoneNumber)) || (typeof data.password != undefined && data.password.length != 0) || (typeof data.lrn != undefined && data.lrn.length != 0 && !/^[1-6]\d{5}(0\d|1\d|2[0-5])\d{4}$/.test(data.lrn)) || (typeof data.gradeLevel != undefined && data.gradeLevel.length != 0 && (data.gradeLevel < 7 || data.gradeLevel > 12)) || (typeof data.zip !== undefined && data.zip.length != 0 && !/^(0[4-9]|[1-9]\d)\d{2}$/.test(data.zip))) {console.log('bad data'); return submitEditOnErr('client', 'bad data')}
		for (const i in data) {if (typeof data[i] !== undefined && data[i].length !== 0 && data[i].length >= 255) {return submitEditOnErr('client', 'bad data')}}

		data.userId = document.querySelector('.editDialog').getAttribute('userId');

		const response = await fetch('http://localhost:3000/admin/updateInfo', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(data),
			credentials: 'include',
		});

		const respond = await response.json();
		if (!response.ok) {return submitEditOnErr(response.status,respond.message);}

		console.log(respond);
		document.querySelector('.editDialog').close();
		alert('big success')
	} catch (error) {console.error(error);}
}

async function submitAddAccount() {
	event.preventDefault()
	try {
		const data = Object.fromEntries(new FormData(document.querySelector(".addDialog-form")).entries())
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !/^09\d{9}$/.test(data.phoneNumber) || !data.password ||!/^[1-6]\d{5}(0\d|1\d|2[0-5])\d{4}$/.test(data.lrn) || !data.lastName || data.lastName.length === 0 || !data.firstName || data.firstName.length === 0 || (typeof data.gradeLevel != undefined && data.gradeLevel.length != 0 && (data.gradeLevel < 7 || data.gradeLevel > 12)) || (typeof data.zip !== undefined && data.gradeLevel.length != 0 && !/^(0[4-9]|[1-9]\d)\d{2}/.test(data.zip))) {return console.log('bad data');}

		const response = await fetch('http://localhost:3000/admin/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(data),
			credentials: 'include',
		});

		const respond = await response.json();
		if (!response.ok) {return addAccountOnErr(response.status,respond.message);}
		addAccountOnSuccess(respond);

	} catch (error) {console.error(error);}
}

function displayData(data) {
	document.querySelectorAll(".main-table-contain > div.main-table-contain-item").forEach(element => {
		document.querySelector(".main-table-contain").removeChild(element);
	});
	for (let i = 0; i < data.length; i++) {
		const element = document.importNode(document.querySelector(".main-table-contain_template").content, true).querySelector(".main-table-contain-item")
		if (data == undefined) {return}
		for (let i1 in data[i]) {
			const elementItem = element.querySelector(`#item-${i1}`);
			if (elementItem == null) {continue;}
			if (data[i][i1] != undefined) {elementItem.innerText = data[i][i1]; elementItem.classList.remove('_nullItems');}
		}
		element.querySelector('.main-table-contain-item-buttons').setAttribute("userId", data[i].userId);
		document.querySelector(".main-table-contain").appendChild(element);
	}
	document.querySelector('.main-title_number').innerText = data.length;
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
// start of fetch
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
	.catch(error => {console.error(error);});
}

async function fetchInfo(userId, withQrId) {
	if (typeof userId === undefined || userId.length === 0) {console.log("bad data (client)");}
	return await fetch('http://localhost:3000/admin/getInfo', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
	body: `{"userId": ${userId}, "withQrId": ${withQrId}}`
	})
	.then(response => {
		if (response.status >= 400) {
			console.warn("wong (client)"); return;
		} else {
			return response.json();
		}
	})
	.then(data => {return data;})
	.catch(error => {console.error(error);});
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

// start of dialog
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
	const data = await fetchInfo(value.parentElement.getAttribute('userId'), true)
	const qrData = await fetchQrcache(value.parentElement.getAttribute('userId'))
	console.log(data);
	updateInfo(data)
	updateInfoQr(qrData)
}

async function openEditDialog(value) {
	document.querySelector('.editDialog').showModal();
	document.querySelector('.editDialog').setAttribute('userId',value.parentElement.getAttribute('userId'));
	const data = await fetchInfo(value.parentElement.getAttribute('userId'), false);
	updatePlaceholderInfo(data);
}

function openAddDialog() {
	document.querySelector('.addDialog').showModal()
}

// handlers

function submitEditPress(event) {
	if (event.key === "Enter" && event.keyCode === 13) {
		submitEditInfo(event)
	}
}

function submitEditOnErr(status,respond) {
	document.querySelector('.editDialog header p').innerText = status + ': ' + respond;
	document.querySelector('.editDialog header p').style.removeProperty('visibility');
	setTimeout(() => {
		document.querySelector('.editDialog header p').style.visibility = 'hidden';
		document.querySelector('.editDialog header p').innerText = '';
	}, 10000);
}

function addAccountOnSuccess(respond) {
	document.querySelector('.addDialog').close();
	alert(respond.message);
}

function addAccountOnErr(status,respond) {	
	document.querySelector('.addDialog header p').innerText = status + ': ' + respond;
	document.querySelector('.addDialog header p').style.removeProperty('visibility');
	setTimeout(() => {
		document.querySelector('.addDialog header p').style.visibility = 'hidden';
		document.querySelector('.addDialog header p').innerText = '';
	}, 10000);
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
}

function updateInfo(data) {
	if (!data) {return}
	for (const i in data) {
		const element = document.querySelector(`#info-${i}`)
		if (!element) {continue;}
		if (element.id == "info-qrId" && data[i]) {
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

function updatePlaceholderInfo(data) {
	if (!data) {return}
	console.log(data);
	for (const i in data) {
		const element = document.querySelector(`.editDialog-form-${i}`)
		if (!element) {continue;}
		if (element.tagName == "SELECT" && data[i]) {
			document.querySelector(`.editDialog-form-${i}_placeholder`).innerHTML = data[i];
			continue;
		}
		if (data[i]) {element.placeholder = data[i]}
	}
}

// events
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
		if (e.target.tagName === 'SELECT' || e.target.closest('select')) {return;}
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

document.querySelector('.editDialog').addEventListener('close', () => {
	document.querySelectorAll('.editDialog-form input').forEach(element => {
		element.placeholder = '';
	})
	document.querySelectorAll('.editDialog-form select').forEach(element => {
		element.children[0].innerText = '';
	})
	document.querySelector('.editDialog-form').reset();
})

document.querySelector('.addDialog').addEventListener('close', () => {
	document.querySelector('.addDialog-form').reset();
	document.querySelector('.addDialog header p').style.visibility = 'hidden';
	document.querySelector('.addDialog header p').innerText = '';
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