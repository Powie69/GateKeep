async function submitLogin(e){e.preventDefault();try{let r=Object.fromEntries(new FormData(e.target).entries());if(void 0===r.password)return;let n=await fetch("/admin/login",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams(r),credentials:"include"});if(!n.ok)return console.log("sumting wong");location.reload()}catch(t){console.error(console.error(t))}}