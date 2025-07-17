// document.querySelector(".main").style.setProperty("background", `url(images/circles/${Math.floor(Math.random() * 10) + 1}.svg) no-repeat top left / cover`);
document.querySelector("._logout").addEventListener("click", () => {
	fetch("/profile/logout", {
		method: "POST"
	})
		.then(response => {
			if (response.status >= 400) return;
			location.href = "/";
		})
		.catch(error => { console.error(error); });
});
document.querySelectorAll(".help-item-button").forEach(element => {
	element.addEventListener("click", e => {
		const dropElement = e.currentTarget.nextElementSibling;
		if (dropElement.style.display == "block") {
			dropElement.style.setProperty("display", "none");
			e.currentTarget.querySelector(".material-symbols-rounded").innerText = "arrow_drop_down";
		} else {
			dropElement.style.setProperty("display", "block");
			e.currentTarget.querySelector(".material-symbols-rounded").innerText = "arrow_drop_up";
		}
	});
});

async function loginSubmit(event) {
	event.preventDefault();
	const data = Object.fromEntries(new FormData(event.target));

	if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.username) || /^09\d{9}$/.test(data.username)) || !/^[1-6]\d{11}$/.test(data.lrn) || !data.password) {
		console.log("Invalid login data (client)");
	}

	try {
		const response = await fetch("/profile/login", {
			method: "POST",
			headers: { "Content-Type": "application/json", },
			body: JSON.stringify(data),
		});

		const respond = await response.json();

		if (!response.ok) {
			document.querySelector(".main-form-message").innerText = respond.message;
			document.querySelector(".main-form-message").classList.remove("_noDisplay");
			return;
		} else {
			document.querySelector(".main-form-message").classList.add("_noDisplay");
			location.reload();
			return;
		}
	} catch (err) { console.error(err); }
}