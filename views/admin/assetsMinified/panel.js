const scanner=QrScanner,statusText=document.querySelector(".info-header-text"),scanSound=new Audio("/admin/assets/scan.ogg");let scanDebounce=!1,lastScanned,camerasFetched=!1,isInMode=!0,cameraList=[],scannerConfig={highlightScanRegion:!0,highlightCodeOutline:!0,maxScansPerSecond:1};async function sendData(e,n){try{let s=await fetch("/admin/send",{method:"post",headers:{"Content-Type":"application/json"},body:`{"qrId": "${e}", "isIn": ${n}}`}),t=await s.json();if(!s.ok){console.log(t),setMessage(t.message,"error");return}for(let a in scanSound.play(),t)!["lastName","firstName","middleName"].includes(a)&&void 0!==t[a]&&(document.querySelector(`.info-${a} span`).innerText=t[a]);setMessage("scanned success","good")}catch(r){console.error(r)}}const qrScanner=new scanner(document.querySelector("#scanner-video"),async e=>{if(scanDebounce){setMessage("Wait","error");return}let n;try{n=JSON.parse(e.data).qrId}catch(s){return console.error(s),setMessage("JSON Parse failed","error")}if(lastScanned==n){setMessage("Already scanned","error");return}scanDebounce=!0,lastScanned=n,setTimeout(()=>{scanDebounce=!1},1e3),setTimeout(()=>{lastScanned=null,clearInfo(),setMessage("","clear")},9e3),setMessage("processing...","good"),sendData(n,isInMode)},scannerConfig);function setMessage(e,n){console.log(e),"clear"===n?(statusText.innerText=null,document.querySelector(".scan-region-highlight svg").style.stroke="#e9b213",statusText.classList.remove("info-header_error"),statusText.style.visibility="hidden"):"error"===n?(statusText.innerText=e,statusText.classList.add("info-header_error"),statusText.style.visibility="visible",document.querySelector(".scan-region-highlight svg").style.stroke="#A30000",setTimeout(()=>{setMessage("","clear")},3e3)):(statusText.innerText=e,document.querySelector(".scan-region-highlight svg").style.stroke="#00A300",statusText.style.visibility="visible",statusText.classList.remove("info-header_error"))}function clearInfo(){let e=document.querySelectorAll(".info-contain fieldset label span");for(let n=0;n<e.length;n++)e[n].innerText=null}async function scannerStart(e){if(!e.checked){qrScanner.stop();return}qrScanner.start(),camerasFetched||(getCameras(await scanner.listCameras(!0)),camerasFetched=!0)}function fps(e){let n=e;if("string"!=typeof n||n>=30||n<=0){console.warn("bad fps data");return}scannerConfig.maxScansPerSecond=n}function flash(e){if(!qrScanner.hasFlash()){console.warn("no flash found");return}e.checked&&qrScanner.isFlashOn()?qrScanner.turnFlashOn():e.checked||qrScanner.isFlashOn()?console.warn("flash button is not sync"):qrScanner.turnFlashOff()}function getCameras(e){console.log(e);for(let n=0;n<e.length;n++){cameraList.push(e[n].id);let s=document.querySelector(".cameraList .cameraList_original").cloneNode();s.innerText=e[n].label,s.setAttribute("value",n),s.removeAttribute("hidden"),document.querySelector(".cameraList").appendChild(s)}document.querySelector(".cameraList_original").remove()}function changeCamera(e){qrScanner.setCamera(cameraList[e])}function mirror(){document.querySelector("#scanner-video").classList.toggle("_notMirror")}function changeIsIn(e){e.checked?isInMode=!0:e.checked||(isInMode=!1),console.log(isInMode)}