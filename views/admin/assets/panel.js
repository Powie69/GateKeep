const scanner = QrScanner; // for the sake of intellisense
const statusText = document.querySelector(".info-header-text")
let fpss = 1;
let scanDebounce = false;
let lastScanned = undefined;
let camerasFetched = false;
let isInMode = 1;
let cameraList = []
let scannerconfig = {
	highlightScanRegion: true,
	highlightCodeOutline: true,
	maxScansPerSecond: fpss,
}

console.log(scanner);

const qrScanner = new scanner(document.querySelector("#scanner-video"), async result => {
	const qrId = JSON.parse(result.data).qrId;
	if (lastScanned == qrId) { setMessage("Already scanned", "error"); return;}
	if (scanDebounce) {setMessage("wait bro", "error"); return;}
	scanDebounce = true;
	lastScannedDebounce = true;
	lastScanned = qrId;
	setTimeout(() => {
		scanDebounce = false;
	}, 1000);
	setTimeout(() => {
		lastScannedDebounce = false;
		lastScanned = null;
		clearInfo()
		setMessage("","clear")
	}, 9000);
	setMessage("processing...", "good")
	
	await fetch('http://localhost:3000/admin/send', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
	body: `{"qrId": "${qrId}", "isIn": "${isInMode}"}`
	})
	.then(response => {if (response.status >= 400) {
		if (response.status == 404) {setMessage("Qr code not found", "error");} else {setMessage("Something went wrong", "error")}
		clearInfo();
		throw new Error("Internal Server Error On Scan");
	} else {return response.json()}})
	.then(data => {
		console.log(data);
		for (var i in data) {
			if (data[i] != undefined && i == "sex") {
				if (data[i] == 1) {
					document.querySelector('.info-sex p').innerText = "Male"
				} else { document.querySelector('.info-sex p').innertext = "Female" }
				continue;
			}
			if (data[i] != undefined) {document.querySelector(`.info-${i} p`).innerText = data[i]}
		}
		setMessage("scanned success", "good")
	})
	.catch(error => { console.error(error); });
}, scannerconfig);

// TODO: fix this mess
function setMessage(msg,status) {
	console.log(msg);
	if (status === "clear") {
		statusText.innerText = null;
		statusText.classList.remove("info-header_error")
		statusText.style.visibility = "hidden";
	} else if (status === "error") {
		statusText.innerText = msg;
		statusText.classList.add("info-header_error")
		statusText.style.visibility = "visible";
		setTimeout(() => {
			statusText.innerText = null;
			statusText.style.visibility = "hidden";
		}, 3000);
	} else {
		statusText.innerText = msg;
		statusText.style.visibility = "visible";
		statusText.classList.remove("info-header_error")
	}
}

function clearInfo() {
	const infoField = document.querySelectorAll(".info-contain fieldset label p");
	for (let i = 0; i < infoField.length; i++) {
		infoField[i].innerText = null;
	}
}

async function scannerStart(value) {
	if (!value.checked) { qrScanner.stop(); return }
	qrScanner.start();
	if (!camerasFetched) {
		getCameras(await scanner.listCameras(true))
		camerasFetched = true;
	}
}

function fps(value) {
	const data = value.value
	if (data >= 30 || data <= 0) { console.warn("bad fps data"); return }
	fpss = data;
}

function flash(value) {
	console.log(value);
	if (!qrScanner.hasFlash()) { console.warn("no flash found"); return; }
	if (value.checked && qrScanner.isFlashOn()) {
		qrScanner.turnFlashOn();
	} else if (!value.checked && !qrScanner.isFlashOn()) {
		qrScanner.turnFlashOff();
	} else {
		console.warn("flash button is not sync");
	}
}

function getCameras(data) {
	console.log(data);
	for (let i = 0; i < data.length; i++) {
		cameraList.push(data[i].id)
		let element = document.querySelector(".cameraList .cameraList_original").cloneNode()
		element.innerText = data[i].label;
		element.setAttribute("value", i)
		element.removeAttribute("hidden")
		document.querySelector(".cameraList").appendChild(element)
	}
	document.querySelector(".cameraList_original").remove()
}

function changeCamera(value) {
	qrScanner.setCamera(cameraList[value.value]);
}

function mirror(value) {
	if (value.checked) {
		document.querySelector("#scanner-video").classList.remove("_notMirror")
	} else {
		document.querySelector("#scanner-video").classList.add("_notMirror")
	}
}

function changeIsIn(value) {
	if (value.checked) {
		isInMode = 1;
	} else if (!value.checked) {
		isInMode = 0;
	}
	console.log(isInMode);
}

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