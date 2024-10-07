let messageCount = 0;
let getMessageDebounce = true;

function fetchMessages(limit, offset) {
	if (!limit || offset == undefined || limit >= 25 || offset <= -1) { console.log("bad data (client)"); return;}
	return fetch('/admin/logs/data', {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
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
	if (!data) {return;}
	for (let i = 0; i < data.length; i++) {
		const element = document.importNode(document.querySelector(".logs-item_template").content, true).querySelector(".logs-item")
		element.querySelector(".logs-item-text-name").innerText = data[i].name;
		element.querySelector(".logs-item-text-verb").innerText = data[i].isIn ? "arrived" : "left";
		element.querySelector(".logs-item-text-time").innerText = new Date(data[i].time).toLocaleTimeString('en-US', {timeZone: "Asia/Manila", hour12: true, hour: "numeric", minute: "2-digit"})
		element.querySelector(".logs-item-text-grade").innerText = data[i].gradeLevel + " " + data[i].section
		element.querySelector(".logs-item-text-date").innerText = new Date(data[i].time).toLocaleDateString('en-US', { month: 'long', day: 'numeric'})
		if (data[i].isIn) {element.querySelector('.logs-item-button-img').classList.add('isIn') }
		document.querySelector(".logs-container").appendChild(element);
		messageCount++;
	}
}

fetchMessages(20, messageCount)
.then(data => { updateMessage(data)})

document.querySelector(".logs-container").addEventListener('scrollend', function(){
	if (getMessageDebounce && (this.clientHeight + this.scrollTop >= this.scrollHeight - 60)) {
		fetchMessages(5, messageCount)
		.then(data => {updateMessage(data)})
		getMessageDebounce = false;
		setTimeout(function() {
            getMessageDebounce = true;
        }, 500);
	}
})