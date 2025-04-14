const dialogElements = document.querySelectorAll(".userInfoDialog");
let messageCount = 0;
let getMessageDebounce = true;
const ws = new WebSocket("ws://localhost:3000/wsAdmin"); //change in prod

function fetchMessages(limit, offset) {
	if (!limit || offset == undefined || limit > 40 || offset <= -1) { console.log("bad data (client)"); return;}
	return fetch("/admin/logs/data", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: `{"limit": ${limit}, "offset": ${offset}}`
	})
		.then(response => {
			if (response.status >= 400) {
				console.warn("fetchMessage"); return;
			} else {
				return response.json();
			}
		})
		.then(data => {return data;})
		.catch(error => { console.error(error); });
}

async function fetchInfo(userId, withQrId) {
	if (typeof userId === undefined || userId.length === 0) {console.log("bad data (client)");}
	const qrQuery = withQrId ? "?qr" : "";
	return await fetch(`/admin/info/${userId}${qrQuery}`, {
		headers: {"Content-Type": "application/json"}
	})
		.then(response => {
			if (response.status >= 400) {
				console.warn("something wrong"); return;
			} else {
				return response.json();
			}
		})
		.then(data => {return data;})
		.catch(error => {console.error(error);});
}

function updateMessage(data) {
	if (!data) {return;}
	for (let i = 0; i < data.length; i++) {
		const element = document.importNode(document.querySelector(".logs-item_template").content, true).querySelector(".logs-item");
		element.setAttribute("userId", data[i].userId);
		element.querySelector(".logs-item-text-name").innerText = data[i].name;
		element.querySelector(".logs-item-text-verb").innerText = data[i].isIn ? "arrived" : "left";
		element.querySelector(".logs-item-text-time").innerText = new Date(data[i].time).toLocaleTimeString("en-US", {timeZone: "Asia/Manila", hour12: true, hour: "numeric", minute: "2-digit"});
		element.querySelector(".logs-item-text-grade").innerText = data[i].gradeLevel + " " + data[i].section;
		element.querySelector(".logs-item-text-date").innerText = new Date(data[i].time).toLocaleDateString("en-US", { month: "long", day: "numeric"});
		if (data[i].isIn) {element.querySelector(".logs-item-button-img").classList.add("isIn"); }
		document.querySelector(".logs-container").appendChild(element);
		messageCount++;
	}
}

async function openInfoDialog(value) {
	document.querySelector(".userInfoDialog").showModal();
	const data = await fetchInfo(value.parentElement.getAttribute("userId"), true);
	updateInfo(data);
	console.log(data);
}

function updateInfo(data) {
	if (!data) {return;}
	for (const i in data) {
		const element = document.querySelector(`#userInfo-${i}`);
		if (!element) {continue;}
		if (element.id == "userInfo-qrId" && data[i]) {
			element.innerText = `{"qrId":"${data[i]}"}`;
			element.classList.remove("_nullItems");
			continue;
		}
		if (data[i]) {element.innerText = data[i]; element.classList.remove("_nullItems");}
	}
	document.querySelector("#userInfo-qrImage").src = `/admin/qr-image/${data.userId}`;
}

fetchMessages(40, messageCount)
	.then(data => { updateMessage(data);});

document.querySelector(".logs-container").addEventListener("scrollend", function(){
	if (getMessageDebounce && (this.clientHeight + this.scrollTop >= this.scrollHeight - 60)) {
		fetchMessages(5, messageCount)
			.then(data => {updateMessage(data);});
		getMessageDebounce = false;
		setTimeout(function() {
			getMessageDebounce = true;
		}, 500);
	}
});

document.querySelector(".userInfoDialog").addEventListener("close", () => {
	document.querySelector("#userInfo-qrId + img").src = "";
	document.querySelectorAll(".userInfoDialog-container > span span").forEach(element => {
		element.classList.add("_nullItems");
		element.innerText = "";
	});
});

dialogElements.forEach(element => {
	element.addEventListener("click", e => {
		if (e.target.tagName === "SELECT" || e.target.closest("select")) {return;}
		const dialogDimensions = element.getBoundingClientRect();
		if (e.clientX < dialogDimensions.left ||e.clientX > dialogDimensions.right ||e.clientY < dialogDimensions.top ||e.clientY > dialogDimensions.bottom) {element.close();}
	});
});

ws.onmessage = (event) => {
	let data;
	try {
		data = JSON.parse(event.data);
	} catch (err) {return console.error(err);}
	if (!data) {return;}
	console.log(event);
	const element = document.importNode(document.querySelector(".logs-item_template").content, true).querySelector(".logs-item");
	element.setAttribute("userId", data.userId);
	element.querySelector(".logs-item-text-name").innerText = data.name;
	element.querySelector(".logs-item-text-verb").innerText = data.isIn ? "arrived" : "left";
	element.querySelector(".logs-item-text-time").innerText = new Date(data.time).toLocaleTimeString("en-US", {timeZone: "Asia/Manila", hour12: true, hour: "numeric", minute: "2-digit"});
	element.querySelector(".logs-item-text-grade").innerText = data.gradeLevel + " " + data.section;
	element.querySelector(".logs-item-text-date").innerText = new Date(data.time).toLocaleDateString("en-US", { month: "long", day: "numeric"});
	if (data.isIn) {element.querySelector(".logs-item-button-img").classList.add("isIn"); }
	document.querySelector(".logs-container").insertBefore(element,document.querySelector(".logs-container").firstChild);
	messageCount++;
};

ws.onerror = (error) => {console.error(error);};