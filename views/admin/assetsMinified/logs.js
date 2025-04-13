const dialogElements=document.querySelectorAll(".userInfoDialog");let messageCount=0,getMessageDebounce=!0;const ws=new WebSocket("ws://localhost:3000/wsAdmin");function fetchMessages(e,t){if(!e||void 0==t||e>40||t<=-1){console.log("bad data (client)");return;}return fetch("/admin/logs/data",{method:"POST",headers:{"Content-Type":"application/json"},body:`{"limit": ${e}, "offset": ${t}}`}).then(e=>{if(!(e.status>=400))return e.json();console.warn("fetchMessage");}).then(e=>e).catch(e=>{console.error(e);});}async function fetchInfo(e,t){return 0===e.length&&console.log("bad data (client)"),await fetch(`/admin/info/${e}${t?"?qr":""}`,{headers:{"Content-Type":"application/json"}}).then(e=>{if(!(e.status>=400))return e.json();console.warn("something wrong");}).then(e=>e).catch(e=>{console.error(e);});}function updateMessage(e){if(e)for(let t=0;t<e.length;t++){let n=document.importNode(document.querySelector(".logs-item_template").content,!0).querySelector(".logs-item");n.setAttribute("userId",e[t].userId),n.querySelector(".logs-item-text-name").innerText=e[t].name,n.querySelector(".logs-item-text-verb").innerText=e[t].isIn?"arrived":"left",n.querySelector(".logs-item-text-time").innerText=new Date(e[t].time).toLocaleTimeString("en-US",{timeZone:"Asia/Manila",hour12:!0,hour:"numeric",minute:"2-digit"}),n.querySelector(".logs-item-text-grade").innerText=e[t].gradeLevel+" "+e[t].section,n.querySelector(".logs-item-text-date").innerText=new Date(e[t].time).toLocaleDateString("en-US",{month:"long",day:"numeric"}),e[t].isIn&&n.querySelector(".logs-item-button-img").classList.add("isIn"),document.querySelector(".logs-container").appendChild(n),messageCount++;}}async function openInfoDialog(e){document.querySelector(".userInfoDialog").showModal();let t=await fetchInfo(e.parentElement.getAttribute("userId"),!0);updateInfo(t),console.log(t);}function updateInfo(e){if(e){for(let t in e){let n=document.querySelector(`#userInfo-${t}`);if(n){if("userInfo-qrId"==n.id&&e[t]){n.innerText=`{"qrId":"${e[t]}"}`,n.classList.remove("_nullItems");continue;}e[t]&&(n.innerText=e[t],n.classList.remove("_nullItems"));}}document.querySelector("#userInfo-qrImage").src=`/admin/qr-image/${e.userId}`;}}fetchMessages(40,messageCount).then(e=>{updateMessage(e);}),document.querySelector(".logs-container").addEventListener("scrollend",function(){getMessageDebounce&&this.clientHeight+this.scrollTop>=this.scrollHeight-60&&(fetchMessages(5,messageCount).then(e=>{updateMessage(e);}),getMessageDebounce=!1,setTimeout(function(){getMessageDebounce=!0;},500));}),document.querySelector(".userInfoDialog").addEventListener("close",()=>{document.querySelector("#userInfo-qrId + img").src="",document.querySelectorAll(".userInfoDialog-container > span span").forEach(e=>{e.classList.add("_nullItems"),e.innerText="";});}),dialogElements.forEach(e=>{e.addEventListener("click",t=>{if("SELECT"===t.target.tagName||t.target.closest("select"))return;let n=e.getBoundingClientRect();(t.clientX<n.left||t.clientX>n.right||t.clientY<n.top||t.clientY>n.bottom)&&e.close();});}),ws.onmessage=e=>{let t;try{t=JSON.parse(e.data);}catch(n){return console.error(n);}if(!t)return;console.log(e);let r=document.importNode(document.querySelector(".logs-item_template").content,!0).querySelector(".logs-item");r.setAttribute("userId",t.userId),r.querySelector(".logs-item-text-name").innerText=t.name,r.querySelector(".logs-item-text-verb").innerText=t.isIn?"arrived":"left",r.querySelector(".logs-item-text-time").innerText=new Date(t.time).toLocaleTimeString("en-US",{timeZone:"Asia/Manila",hour12:!0,hour:"numeric",minute:"2-digit"}),r.querySelector(".logs-item-text-grade").innerText=t.gradeLevel+" "+t.section,r.querySelector(".logs-item-text-date").innerText=new Date(t.time).toLocaleDateString("en-US",{month:"long",day:"numeric"}),t.isIn&&r.querySelector(".logs-item-button-img").classList.add("isIn"),document.querySelector(".logs-container").insertBefore(r,document.querySelector(".logs-container").firstChild),messageCount++;},ws.onerror=e=>{console.error(e);};