const scanner = QrScanner; // for the sake of intellisense
const statusText = document.querySelector(".info-header-text");
const scanSound = new Audio('/admin/assets/scan.ogg');
let scanDebounce = false;
let lastScanned = undefined;
let camerasFetched = false;
let isInMode = true;
let cameraList = []
let scannerConfig = {
	highlightScanRegion: true,
	highlightCodeOutline: true,
	maxScansPerSecond: 1,
}

async function sendData(qrId,isInMode) {
	try {
		const response = await fetch('/admin/send', {
			method: 'post',
			headers: {'Content-Type': 'application/json'},
			body: `{"qrId": "${qrId}", "isIn": ${isInMode}}`
		})
		const respond = await response.json();
		if (!response.ok) {
			console.log(respond);
			setMessage(respond.message,'error')
			return;
		}
		scanSound.play();
		for (let i in respond) {
			if (['lastName', 'firstName', 'middleName'].includes(i)) {continue}
			if (typeof respond[i] !== 'undefined') {document.querySelector(`.info-${i} span`).innerText = respond[i]}
		}
		setMessage("scanned success", "good")
	} catch (err) {console.error(err);}
}

const qrScanner = new scanner(document.querySelector("#scanner-video"), async result => {
	const qrId = JSON.parse(result.data).qrId;
	if (lastScanned == qrId) { setMessage("Already scanned", "error"); return;}
	if (scanDebounce) {setMessage("Wait", "error"); return;}
	scanDebounce = true;
	lastScanned = qrId;
	setTimeout(() => {
		scanDebounce = false;
	}, 1000);
	setTimeout(() => {
		lastScanned = null;
		clearInfo()
		setMessage("","clear")
	}, 9000);
	setMessage("processing...", "good")
	sendData(qrId,isInMode)
}, scannerConfig);

// TODO: fix this mess
function setMessage(msg,status) {
	console.log(msg);
	if (status === "clear") {
		statusText.innerText = null;
		document.querySelector('.scan-region-highlight svg').style.stroke = '#e9b213'
		statusText.classList.remove("info-header_error")
		statusText.style.visibility = "hidden";
	} else if (status === "error") {
		statusText.innerText = msg;
		statusText.classList.add("info-header_error")
		statusText.style.visibility = "visible";
		document.querySelector('.scan-region-highlight svg').style.stroke = '#A30000'
		setTimeout(() => {
			setMessage("","clear");
		}, 3000);
	} else {
		statusText.innerText = msg;
		document.querySelector('.scan-region-highlight svg').style.stroke = '#00A300'
		statusText.style.visibility = "visible";
		statusText.classList.remove("info-header_error")
	}
}

function clearInfo() {
	const infoField = document.querySelectorAll(".info-contain fieldset label span");
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
	if (typeof data !== "string" || data >= 30 || data <= 0) { console.warn("bad fps data"); return }
	scannerConfig.maxScansPerSecond = data;
}

function flash(value) {
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
	document.querySelector('#scanner-video').classList.toggle('_notMirror')
}

function changeIsIn(value) {
	if (value.checked) {
		isInMode = true;
	} else if (!value.checked) {
		isInMode = false;
	}
	console.log(isInMode);
}