const scanner = QrScanner; // for the sake of intellisense
let fpss = 3;
let camerasFetched = false;

let cameraList = []

let scannerconfig = {
	highlightScanRegion: true,
	highlightCodeOutline: true,
	maxScansPerSecond: fpss,
}

console.log(scanner);

const qrScanner = new scanner(document.querySelector("#scanner-video"), result => { 
	console.log(result);
	
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