if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
	  navigator.serviceWorker.register("/service-worker.js").then((registration) => {
			console.log("ServiceWorker registration successful with scope: ", registration.scope);
	  }, (error) => {
			console.log("ServiceWorker registration failed: ", error);
	  });
	});
}

function handleAside() {
	const element =  document.querySelector(".aside");
	element.classList.toggle("show");
	document.querySelector(".overlay").classList.toggle("active");
	if (element.getAttribute("aria-hidden") === "true") {
		element.setAttribute("aria-hidden", "false");
	} else {
		element.setAttribute("aria-hidden", "true");
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