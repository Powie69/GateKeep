const dashbaord = '/html/DashBoard.html';

fetch('http://localhost:3000/profile', {
	method: 'post',
	credentials: 'include'
})
.then(response => {
	if (response.status >= 400) {
		console.log("not auth (client)");
		return;
	} else {
		window.location.href = dashbaord;
	}
})
.catch(error => {console.error(error);});

if (new URL(window.location.href).searchParams.get("login") === "") {
	document.getElementById("form-signup").classList.add("disabled")
	document.getElementById("form-login").classList.remove("disabled")
} else if (new URL(window.location.href).searchParams.get("signup") === "") {
	document.getElementById("form-signup").classList.remove("disabled")
	document.getElementById("form-login").classList.add("disabled")
}

document.querySelector(".main").style.setProperty('background-image', `url(images/circles/${Math.floor(Math.random() * 10) + 1}.svg)`)
document.querySelector("._logout").addEventListener("click", () => {
	fetch('http://localhost:3000/profile/logout', {
	method: 'post',
	credentials: 'include'
})
	.then(response => {
		if (response.status >= 400) {
			return;
		}
		return;
	})
  	.catch(error => {console.error(error);});
})

// !remove this later
function lazyLogin() {
	fetch('http://localhost:3000/profile/login', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
	body: '{ "username": "godwin@gmail.com", "lrn": "123456789011", "password": "123" }'
	})
	.then(response => {
		if (response.status >= 400) {console.warn("wong (client)"); return;} else { return response.json() }
	})
	.then(data => { window.location.href = dashbaord;})
	.catch(error => { console.error(error); });
}

async function signupSubmit() {
	event.preventDefault()
	try {
		const data = Object.fromEntries(new FormData(document.getElementById("form-signup")).entries());

		// client side check, server side will still check
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !/^09\d{9}$/.test(data.phoneNumber) || !data.fullName || !/^[1-6]\d{11}$/.test(data.lrn)) {
			console.log("valid'nt signup"); return;
		}
		console.log("valid signup (client)");

		const response = await fetch('http://localhost:3000/profile/signup', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(data),
			credentials: 'include',
		});
		
		const respond = await response.json();
		if (!response.ok) {
			if (response.status === 409) {
				if (respond.field === "phoneNumber") {
                	console.warn("Phone number already exists");
					console.log(document.querySelector(".exist-m + #s-phoneNumber"));
					document.querySelector(".exist-n").classList.remove("disabled")
					document.querySelector(".exist-l").classList.add("disabled")
                } else if (respond.field === "lrn") {
					console.warn("LRN already exists");
					document.querySelector(".exist-l").classList.remove("disabled")
					document.querySelector(".exist-n").classList.add("disabled")
                }
				return;
            } else {
				throw new Error(response.status);
            }
        }

		console.log(respond)
		window.location.href = dashbaord;
	} catch (error) {console.error(error);}
}

async function loginSubmit() {
    event.preventDefault();
    try {
        const data = Object.fromEntries(new FormData(document.getElementById("form-login")).entries());

        // client-side check, server-side will still check
        if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username) || /^09\d{9}$/.test(data.username)) || !/^[1-6]\d{11}$/.test(data.lrn) || !data.password) {
            console.log("Invalid login data (client)");
			document.getElementById("l-invalid").classList.remove("disabled"); return;
        }
        console.log("Valid login data (client)");

        const response = await fetch('http://localhost:3000/profile/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data),
			credentials: 'include',
        });


        if (!response.ok) {
			if (response.status === 401) {
				console.log("Invalid email/phone, LRN, or password (server)");
				document.getElementById("l-invalid").classList.remove("disabled")
            }
			return;
        } else {
			document.getElementById("l-invalid").classList.add("disabled")
		}

		const respond = await response.json();
        console.log(respond);
		window.location.href = dashbaord;
    } catch (error) {console.error(error);}
}