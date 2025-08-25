const asideElement =  document.querySelector(".aside");

function handleAside() {
	asideElement.classList.toggle("show");
	document.querySelector(".overlay").classList.toggle("active");
	if (asideElement.getAttribute("aria-hidden") === "true") {
		asideElement.setAttribute("aria-hidden", "false");
	} else {
		asideElement.setAttribute("aria-hidden", "true");
	}
}

async function logout() {
	fetch("/profile/logout", {
		method: "post",
	})
		.then(response => {
			if (response.status >= 400) {
				return;
			}
			location.href = "/";
		})
		.catch(err => {console.error(err);});
}