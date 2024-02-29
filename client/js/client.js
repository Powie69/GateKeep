document.querySelector(".main").style.setProperty('background-image', `url(images/circles/${Math.floor(Math.random() * 10) + 1}.svg)`)

if (new URL(window.location.href).searchParams.get("login") === "") {
	document.getElementById("form-signup").classList.add("disabled")
	document.getElementById("form-login").classList.remove("disabled")
} else if (new URL(window.location.href).searchParams.get("signup") === "") {
	document.getElementById("form-signup").classList.remove("disabled")
	document.getElementById("form-login").classList.add("disabled")
}

async function signupSubmit() {
	event.preventDefault()
	try {
		const formData = new FormData(document.getElementById("form-signup"));
		const data = Object.fromEntries(formData.entries());
		
		// client side check, server side will still check
		if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) && /^09\d{9}$/.test(data.phoneNumber) && data.fullName && /^[1-6]\d{11}$/.test(data.lrn)) {
			console.log("valid signup (client)");
		} else {
			console.log("valid'nt signup");
			return
		}

		const response = await fetch('http://localhost:3000/ds', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(data),
		});

		
		const respond = await response.json();
		
		if (!response.ok) {
            if (response.status === 409) {
				if (respond.field === "phoneNumber") {
                    console.log("Phone number already exists");
                    // Handle the case where phone number already exists
					console.log(document.querySelector(".exist-m + #s-phoneNumber"));
					document.querySelector(".exist-n").classList.remove("disabled")
					document.querySelector(".exist-l").classList.add("disabled")
                } else if (respond.field === "lrn") {
					console.log("LRN already exists");
                    // Handle the case where LRN already exists
					document.querySelector(".exist-l").classList.remove("disabled")
					document.querySelector(".exist-n").classList.add("disabled")
                }
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }
		

		console.log(respond)
	} catch (error) {
		console.error(':', error);
	}
}