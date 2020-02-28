let form = document.querySelector('form');
console.log(form);

let button = form[2];
let user_name = form[1].value;


window.onunload = () => {
	window.sessionStorage.clear();
	window.sessionStorage.setItem("user_name", user_name);	
	window.localStorage.clear();
	window.localStorage.setItem("user_name", user_name);
}

button.onclick = () => {
	window.sessionStorage.clear();
	window.sessionStorage.setItem("user_name", user_name);	
	window.localStorage.clear();
	window.localStorage.setItem("user_name", user_name);
}
