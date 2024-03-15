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
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !/^09\d{9}$/.test(data.phoneNumber) || !data.fullName || !/^[1-6]\d{11}$/.test(data.lrn)) {
			console.log("valid'nt signup"); return;
		} 
		console.log("valid signup (client)");

		const response = await fetch('http://localhost:3000/signup', {
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
					console.log(document.querySelector(".exist-m + #s-phoneNumber"));
					document.querySelector(".exist-n").classList.remove("disabled")
					document.querySelector(".exist-l").classList.add("disabled")
                } else if (respond.field === "lrn") {
					console.log("LRN already exists");
					document.querySelector(".exist-l").classList.remove("disabled")
					document.querySelector(".exist-n").classList.add("disabled")
                }
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }
		console.log(respond)
	} catch (error) {
		console.error(error);
	}
}

async function loginSubmit() {
    event.preventDefault();
    try {
        const formData = new FormData(document.getElementById("form-login"));
        const data = Object.fromEntries(formData.entries());

        // client-side check, server-side will still check
        if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username) || /^09\d{9}$/.test(data.username)) || !/^[1-6]\d{11}$/.test(data.lrn) || !data.password) {
            console.log("Invalid login data (client)");
			document.getElementById("l-invalid").classList.remove("disabled"); return;
        }
        console.log("Valid login data (client)");

        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(data),
			credentials: 'include',
        });

        const respond = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                console.log("Invalid email/phone, LRN, or password (server)");
				document.getElementById("l-invalid").classList.remove("disabled")
            }
        } else {
			document.getElementById("l-invalid").classList.add("disabled")
		}

        // Handle successful login, e.g., redirect to a new page
        console.log(respond);
    } catch (error) {
        console.error(error);
    }
}