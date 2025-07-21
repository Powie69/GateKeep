let messageCount = 0;
let getMessageDebounce = true;
const displayName = document.querySelector("main").getAttribute("data-displayName");
const msgElement = document.querySelector(".logs-container-item_template");
console.log(msgElement);
const dialogElements = document.querySelectorAll(".viewDialog");
const ws = new WebSocket("ws://localhost:3000/ws"); //change in prod

function fetchMessages(limit, offset) {
	if (!limit || offset == undefined || limit >= 25 || offset <= -1) { console.log("bad data (client)"); return;}
	return fetch("profile/getMessage", {
		method: "post",
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

function updateMessage(data) {
	if (!data) return;
	for (let i = 0; i < data.length; i++) {
		const element = document.importNode(msgElement.content, true).querySelector(".logs-container-item");
		element.querySelector(".logs-container-item-text-date").innerText = formateDate(data[i].time);
		element.querySelector(".logs-container-item-text-time").innerText = `${displayName} ${data[i].isIn ? "arrived" : "left"} at ${new Date(data[i].time).toLocaleTimeString("en-US", {timeZone: "Asia/Manila", hour12: true, hour: "numeric", minute: "2-digit"})}`;
		element.querySelector(".logs-container-item-img").innerText = data[i].isIn ? "Login" : "Logout";
		document.querySelector(".logs-container").appendChild(element);
		messageCount++;
	}
}

function formateDate(isoString) {
	const date = new Date(isoString);

	const options = {
		weekday: "long",
		month: "long",
		day: "numeric"
	};

	if (date.getFullYear() !== new Date().getFullYear()) options.year = "numeric";

	return date.toLocaleDateString("en-US", options).replace(",", " •");
}

function handleDropdown(element) {
	if (element.attributes.isDropdownOpen.value === "false") {
		element.setAttribute("isDropdownOpen", "true");
		element.nextElementSibling.querySelector("menu").style.display = "inline";
	} else if (element.attributes.isDropdownOpen.value === "true") {
		element.setAttribute("isDropdownOpen", "false");
		element.nextElementSibling.querySelector("menu").style.removeProperty("display");
	}
}

function collapseSection(section,button) {
	section.classList.toggle("collapse");
	button.classList.toggle("up");
	// setTimeout(() => {
	// section.classList.toggle('_noDisplay')
	// }, 500);
}

function sendNotification(title, options) {
	if (!("Notification" in window)) {return;}

	if (Notification.permission === "denied" || Notification.permission === "default") {
		Notification.requestPermission().then(permission => {
			if (permission !== "granted") {return;}
			new Notification(title, options);
		});
		return;
	}
	new Notification(title, options);
}

fetchMessages(20, messageCount)
	.then(data => { updateMessage(data);});

if (Notification.permission !== "denied" || Notification.permission === "default") {
	setTimeout(() => {
		Notification.requestPermission();
	}, 120000); // 2 minutes
}

// closes dropdown when clicked outside of container
document.addEventListener("click",event => {
	if (event.target.closest(".dropdown-contain") || event.target.closest(".dropdown-button")) {return;}
	document.querySelectorAll(".dropdown").forEach(element => {
		element.querySelector(".dropdown-contain menu").style.removeProperty("display");
		element.querySelector(".dropdown-button").setAttribute("isDropdownOpen", "false");
	});
});

// get messages when scrolling
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

dialogElements.forEach(element => {
	element.addEventListener("click", e => {
		const dialogDimensions = element.getBoundingClientRect();
		if (e.clientX < dialogDimensions.left ||e.clientX > dialogDimensions.right ||e.clientY < dialogDimensions.top ||e.clientY > dialogDimensions.bottom) element.close();
	});
});

ws.onmessage = (event) => {
	let data;
	try {
		data = JSON.parse(event.data);
	} catch (err) {return console.error(err);}
	const element = document.importNode(msgElement.content, true).querySelector(".logs-container-item");
	element.querySelector(".logs-container-item-text-date").innerText = formateDate(data[i].time);
	element.querySelector(".logs-container-item-text-time").innerText = `${displayName} ${data[i].isIn ? "arrived" : "left"} at ${new Date(data[i].time).toLocaleTimeString("en-US", {timeZone: "Asia/Manila", hour12: true, hour: "numeric", minute: "2-digit"})}`;
	element.querySelector(".logs-container-item-img").innerText = data[i].isIn ? "Login" : "Logout";
	document.querySelector(".logs-container").appendChild(element);
	messageCount++;
};

ws.onerror = (error) => {console.error(error);};