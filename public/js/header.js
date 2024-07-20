function handleAside() {
	const element =  document.querySelector('.aside');
	element.classList.toggle('show');
	document.querySelector('.overlay').classList.toggle('active')
	if (element.getAttribute('aria-hidden') === 'true') {
		element.setAttribute('aria-hidden', 'false');
	} else {
		element.setAttribute('aria-hidden', 'true');
	}
}

async function logout() {
	fetch('/profile/logout', {
		method: 'post',
	})
	.then(response => {
		if (response.status >= 400) {
			return;
		}
	location.reload()
	})
	.catch(err => {console.error(err);});
}