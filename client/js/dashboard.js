var messageCount = 0;
const msgElement = document.querySelector(".logs-item")


function updateMessage(data) {
	for (let i = 0; i < data.length; i++) {
		const element = msgElement.cloneNode(true);		
		// console.log(element)
		element.style.backgroundColor = "red";
		if (data[0].isIn == true) {
			element.querySelector(".logs-item-title span").innerText = "IN"
			element.querySelector(".logs-item-title i").innerText = "Login"
			element.querySelector(".logs-item-desc ._isIn").innerText = "arrived"
		} else {
			element.querySelector(".logs-item-title span").innerText = "OUT"
			element.querySelector(".logs-item-title i").innerText = "Logout"
			element.querySelector(".logs-item-desc ._isIn").innerText = "left"
			
		}
		document.querySelector(".logs-container").appendChild(element)
	}
}

function updateInfo(data) {
	// This doesn't seem very efficient.
	if (data.lastName) {document.querySelector(".lastName p").innerText = data.lastName;}
	if (data.firstName) {document.querySelector(".firstName p").innerText = data.firstName;}
	if (data.middleName) {document.querySelector(".middleName p").innerText = data.middleName;}
	if (data.lrn) {document.querySelector(".lrn p").innerText = data.lrn;}
	if (data.age) {document.querySelector(".age p").innerText = data.age;}
	if (data.sex) {
		if (data.sex == 1) {
			document.querySelector(".sex p").innerText = "Male";
		} else {document.querySelector(".sex p").innerText = "Female";}
	}
}

fetch('http://localhost:3000/profile/getData', {
	method: 'post',
	credentials: 'include'
})
	.then(response => {
		if (response.status >= 400) {
			console.warn("not auth (client)"); return;
		} else {
			return response.json()
		}
	})
	.then(data => {
        if (!data) {return}
		updateInfo(data);
		console.log(data);
    })
  	.catch(error => {
    	console.error(error);
});

fetch('http://localhost:3000/profile/getMessage', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
	body: '{"limit": 5, "offset": 0}'
})
	.then(response => {
		if (response.status >= 400) {
			console.log(response);
			// console.warn("not auth (client)"); return;
		} else {
			return response.json()
		}
	})
	.then(data => {
		if (!data) {return}
		console.log(data[0]);
		updateMessage(data);
    })
  	.catch(error => {
    	console.error(error);
});

