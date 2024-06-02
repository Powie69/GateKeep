const sections = {
	"7": ["love", "kindness", "hope", "faith"],
	"8": ["matthew", "jeremiah", "psalm", "john"],
	"9": ["thomas", "joseph", "james", "paul"],
	"10": ["zeus", "aphrodite", "athena", "poseidon"],
	"11": ["",""],
	"12": ["",""],
}

async function submitQuery(type) {
	event.preventDefault()
	try {
		const response = await fetch('http://localhost:3000/admin/query', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(Object.fromEntries(new FormData(document.querySelector(".search")).entries())),
			credentials: 'include',
		});

		if (!response.ok) { return console.log("sumting wong"); }

		const respond = await response.json();
        console.log(respond);
		displayData(respond)

	} catch (error) {console.error(console.error(error));}
}

function displayData(data) {
	document.querySelectorAll(".main-table-contain > div").forEach(element => {
		if (element.tagName == 'template') {return;} 
		document.querySelector(".main-table-contain").removeChild(element);
	});
	for (let i = 0; i < data.length ; i++) {
		const element = document.importNode(document.querySelector(".main-table-contain_template").content, true).querySelector(".main-table-contain-item")
		for (let i1 in data[i]) {
			if (!data) {return}
			const elementItem = element.querySelector(`#item-${i1}`);
			if (elementItem == null) {continue;}
			if (data[i][i1]) {elementItem.innerText = data[i][i1]; elementItem.classList.remove('_nullItems')};
		}
		document.querySelector(".main-table-contain").appendChild(element);
	}
}

function getSection(value) {
	document.querySelectorAll('.search-section-item').forEach((element, i) => {
		if (!value) {
			element.setAttribute("hidden","");
			element.innerHTML = "";
			document.querySelector('.search-section-text').selected = true;
			document.querySelector('.search-section-none').removeAttribute("hidden");
			document.querySelector('.search-section-any').setAttribute("hidden","");
			return;
		}
		if (!sections[value][i]) {element.setAttribute("hidden",""); return;}
		element.innerHTML = sections[value][i];
		element.value = sections[value][i];
		document.querySelector('.search-section-none').setAttribute("hidden","");
		document.querySelector('.search-section-any').removeAttribute("hidden");
		document.querySelector('.search-section-text').selected = true;
		element.removeAttribute("hidden")
	})
}

function adminLogin() {
	fetch('http://localhost:3000/admin/login', {
	method: 'post',
	credentials: 'include',
	headers: {
		'Content-Type': 'application/json'
	  },
	body: '{"password": "123" }'
	})
	.then(response => {
		if (response.status >= 400) {console.warn("wong (client)"); return;} else { return response.json() }
	})
	.then(data => { console.log(data);})
	.catch(error => { console.error(error); });
}