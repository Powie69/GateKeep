document.querySelector(".form-input-lrn-input").addEventListener("input", function() {
	this.value = this.value.replace(/[^0-9]/g, "");
});

function removeLoading() {
	document.querySelector(".form-submit-loading").classList.add("_noDisplay");
	document.querySelector(".form-submit-text").classList.remove("_noDisplay");
}

function showInvalid(input) {
	removeLoading();
	document.querySelector(`.form-input-${input}-invalid`).classList.remove("_hidden");
}

function resetInvalid() {
	document.querySelector(".form-input-username-invalid").classList.add("_hidden");
	document.querySelector(".form-input-lrn-invalid").classList.add("_hidden");
	document.querySelector(".form-input-password-invalid").classList.add("_hidden");
}

async function loginSubmit(event) {
	event.preventDefault();

	document.querySelector(".form-submit-loading").classList.remove("_noDisplay");
	document.querySelector(".form-submit-text").classList.add("_noDisplay");

	const data = Object.fromEntries(new FormData(event.target));

	if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username) || /^09\d{9}$/.test(data.username))) {
		return showInvalid("username");
	}

	if (!/^[1-6]\d{11}$/.test(data.lrn)) {
		return showInvalid("lrn");
	}

	if (!data.password) {
		return showInvalid("password");
	}

	resetInvalid();

	try {
		const response = await fetch("/profile/login", {
			method: "POST",
			headers: { "Content-Type": "application/json", },
			body: JSON.stringify(data),
		});

		const respond = await response.json();

		removeLoading();

		if (!response.ok) {
			document.querySelector(".form-message").innerText = respond.message;
			document.querySelector(".form-message").classList.remove("_hidden");
		} else {
			document.querySelector(".form-message").classList.add("_hidden");
			location.reload();
		}
	} catch (err) { console.error(err); }
}