function handleAside(){let t=document.querySelector(".aside");t.classList.toggle("show"),document.querySelector(".overlay").classList.toggle("active"),"true"===t.getAttribute("aria-hidden")?t.setAttribute("aria-hidden","false"):t.setAttribute("aria-hidden","true")}async function logout(){fetch("/profile/logout",{method:"post"}).then(t=>{!(t.status>=400)&&location.reload()}).catch(t=>{console.error(t)})}