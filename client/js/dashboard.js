var messageCount = 0;
const msgElement = document.querySelector(".logs-item")

function updateMessage(data) {
	for (let i = 0; i < data.length; i++) {
		const element = msgElement.cloneNode(true);		
		// console.log(element)
		element.style.backgroundColor = "red";
		if (data[i].isIn == true) {
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

// this one is for the 'update' dialog
// function getInfo(data) {
// 	console.log("ayo");
// 	console.log(data.street);
// 	if (data.lastName) {document.querySelector("#lastName input").setAttribute("placeholder", `${data.lastName}`)}
// 	if (data.firstName) {document.querySelector("#firstName input").setAttribute("placeholder", `${data.firstName}`)}
// 	if (data.middleName) {document.querySelector("#middleName input").setAttribute("placeholder", `${data.middleName}`)}
// 	if (data.age) {document.querySelector("#age input").setAttribute("placeholder", `${data.age}`)}
// 	if (data.houseNo) {document.querySelector("#houseNo").setAttribute("placeholder", `${data.houseNo}`)}
// 	if (data.street) {document.querySelector("#street").setAttribute("placeholder", `${data.street}`)}
// 	if (data.zip) {document.querySelector("#zip").setAttribute("placeholder", `${data.zip}`)}
// 	if (data.barangay) {document.querySelector("#barangay").setAttribute("placeholder", `${data.barangay}`)}
// 	if (data.city) {document.querySelector("#city").setAttribute("placeholder", `${data.city}`)}
// 	if (data.province) {document.querySelector("#province").setAttribute("placeholder", `${data.province}`)}
// }

function getInfo(data) {
	console.log("ayo");
	for (var i in data) {
		console.log(i);
		if (data[i] == "lrn" || data[i] == "sex") {continue}

		if (data[i]) {document.querySelector(`#${i} input`).setAttribute("placeholder", data[i])}

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

// 

document.querySelector(".update").addEventListener("click", e => {
	const dialogDimensions = document.querySelector(".update").getBoundingClientRect()
	if (e.clientX < dialogDimensions.left ||e.clientX > dialogDimensions.right ||e.clientY < dialogDimensions.top ||e.clientY > dialogDimensions.bottom) {document.querySelector(".update").close()}
})

// this nesting hurts my head
function updateShow() {
	if (window.innerWidth <= 600) {
		window.location.href = "./updateInfo.html"
	} else {
		document.querySelector(".update").showModal()
		
		fetch('http://localhost:3000/profile/getData', {
			method: 'post',
			credentials: 'include'
		})
		.then(response => {
			if (response.status >= 400) { console.warn("not auth (client)"); return; } else { return response.json() }
		})
		.then(data => {
        	if (!data) {return}
			getInfo(data)
   		 })
  		.catch(error => {
    		console.error(error);
		});
	}
}

async function updateSubmit() {
    event.preventDefault();
    try {
        const formData = new FormData(document.getElementById("form-update"));
        const data = Object.fromEntries(formData.entries());

        // client-side check, server-side will still check

        const response = await fetch('http://localhost:3000/profile/updateData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data),
			credentials: 'include',
        });

        const respond = await response.json();

        if (!response.ok) {
			console.log(`server: ${response}`);
			document.querySelector(".update").close();
			return;
        } 

        console.log(respond);
		// TODO: updateInfo(), dont refresh
		location.reload()
    } catch (error) {
		document.querySelector(".update").close();
    }
	document.querySelector(".update").close();
}