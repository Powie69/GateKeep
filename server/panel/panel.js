// for the sake of intellisense
const scanner = QrScanner

console.log(scanner);

const qrScanner = new scanner(document.querySelector("#scanner-video"), result => { 
	console.log(result);

},
	{highlightScanRegion: true, highlightCodeOutline:true},
);
