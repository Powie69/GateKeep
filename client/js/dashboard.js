function updateInfo(data) {

}

fetch('http://localhost:3000/profile/getData', {
	method: 'post',
	credentials: 'include'
})
	.then(response => {
		if (response.status >= 400) {
			console.log("not auth (client)"); return;
		} else {
			console.log("auth!! (client)");
			
		}
	})
  	.catch(error => {
    	console.error(error);
});