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

fetch('http://localhost:3000/profile/getData', {
	method: 'post',
	credentials: 'include'
})
	.then(response => {
		if (response.status >= 400) {
			console.console.warn("not auth (client)"); return;
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