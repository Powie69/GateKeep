const scanner = QrScanner; // for the sake of intellisense
let fpss = 3;
let scanDebounce = false;
let camerasFetched = false;
let isInMode = true;
let cameraList = []
let scannerconfig = {
	highlightScanRegion: true,
	highlightCodeOutline: true,
	maxScansPerSecond: fpss,
}

console.log(scanner);

const qrScanner = new scanner(document.querySelector("#scanner-video"), result => { 
	if (scanDebounce) {return;}
	console.log(result);
	fetch('http://localhost:3000/login', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
	body: `{}`
	})
	.then(response => {if (response.status >= 400) {console.warn("wong (client)"); return;} else { return response.json() }})
	.then(data => {

	})
	.catch(error => { console.error(error); });
	scanDebounce = true;
	console.log(scanDebounce);
	setTimeout(function() {
        scanDebounce = false;
    }, 9000);
}, scannerconfig);

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

function changeIsIn(value) {
	isInMode = value.checked;
}

function adminLogin() {
	fetch('http://localhost:3000/admin/login', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
	body: '{"login": "123" }'
	})
	.then(response => {
		if (response.status >= 400) {console.warn("wong (client)"); return;} else { return response.json() }
	})
	.then(data => { console.log(data);})
	.catch(error => { console.error(error); });
}