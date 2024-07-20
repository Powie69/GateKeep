var messageCount = 0;
let getMessageDebounce = true;
const msgElement = document.querySelector(".logs-item_template");
const dialogElements = document.querySelectorAll('.viewDialog')

function fetchMessages(limit, offset) {
	if (!limit || offset == undefined || limit >= 25 || offset <= -1) { console.log("bad data (client)"); return;}
	return fetch('profile/getMessage', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
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

function fetchQrcode() {
	fetch('/profile/getQrcode', {
		method: 'post',
		credentials: 'include',
	})
	.then(response => {
		if (response.status >= 400) {
			console.warn("wong (client)"); return;
		} else {
			return response.blob();
		}
	})
	.then(data => {
		document.querySelector(".qr-contain-img").src = URL.createObjectURL(data);
	})
	.catch(error => { console.error(error); });
}

function updateMessage(data) {
	if (!data) {return;}
	for (let i = 0; i < data.length; i++) {
		const element = document.importNode(msgElement.content, true).querySelector(".logs-item")
		element.querySelector(".logs-item-desc ._time").innerText = new Date(data[i].time).toLocaleTimeString('en-US', {timeZone: "Asia/Manila", hour12: true, hour: "numeric", minute: "2-digit"})
		element.querySelector(".logs-item-desc ._date").innerText = new Date(data[i].time).toLocaleDateString('en-US', { month: 'long', day: 'numeric'})
		if (data[i].isIn == 1) {
			element.querySelector(".logs-item-title span").innerText = "IN"
			element.querySelector(".logs-item-title i").innerText = "Login"
			element.querySelector(".logs-item-desc ._isIn").innerText = "arrived"
		} else {
			element.querySelector(".logs-item-title span").innerText = "OUT"
			element.querySelector(".logs-item-title i").innerText = "Logout"
			element.querySelector(".logs-item-desc ._isIn").innerText = "left"
		}
		document.querySelector(".logs-container").appendChild(element);
		messageCount++;
	}
}

function handleDropdown(element) {
	if (element.attributes.isDropdownOpen.value === 'false') {
		element.setAttribute('isDropdownOpen', 'true')
		element.nextElementSibling.querySelector('menu').style.display = 'inline';
	} else if (element.attributes.isDropdownOpen.value === 'true') {
		element.setAttribute('isDropdownOpen', 'false')
		element.nextElementSibling.querySelector('menu').style.removeProperty('display');
	}
}

function collapseSection(section,button) {
	section.classList.toggle('collapse')
	button.classList.toggle('up')
	setTimeout(() => {
		// section.classList.toggle('_noDisplay')
	}, 500);
}

fetchQrcode()

fetchMessages(10, messageCount)
.then(data => { updateMessage(data)})

// closes dropdown when clicked outside of container
document.addEventListener('click',event => {
	if (event.target.closest('.dropdown-contain') || event.target.closest('.dropdown-button') || document.querySelector('.dropdown-button').attributes.isDropdownOpen.value === 'false') {
		return
	}
	document.querySelectorAll('.dropdown').forEach(element => {
		element.querySelector('.dropdown-contain menu').style.removeProperty('display');
		element.querySelector('.dropdown-button').setAttribute('isDropdownOpen', 'false');
	})
})

// get messages when scrolling
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

dialogElements.forEach(element => {
	element.addEventListener("click", e => {
		const dialogDimensions = element.getBoundingClientRect()
		if (e.clientX < dialogDimensions.left ||e.clientX > dialogDimensions.right ||e.clientY < dialogDimensions.top ||e.clientY > dialogDimensions.bottom) {element.close()}
	})
});