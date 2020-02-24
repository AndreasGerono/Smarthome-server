let submit_btn = document.querySelector("#submit");
let username = document.querySelector("#username");
let password = document.querySelector("#pass");
let repassword = document.querySelector("#repass");
const minimum_len = 5;


submit_btn.onclick = (e) => {
	if (password.value.length >= 1 && repassword.value.length >= 1 && username.value.length >= 1){
		e.preventDefault();
		
		if (password.value != repassword.value) {
			window.alert("Passwords must be the same!");
		}
		else if (password.value.length < minimum_len) {
			window.alert("Password must be at least 5 characters long!");
		}
		
		else {
			let form = 	JSON.stringify({user_name: username.value, user_password: password.value});
			console.log(form);
			const request = new XMLHttpRequest();
			request.open('POST', '/users');
			request.setRequestHeader('Content-Type', 'application/json');
			request.send(form);
			
			request.onload = () => {
				let status = JSON.parse(request.response);				
				if (status == false) {
					window.alert(`User ${username.value} already exist!`);
				}
				else {
					location.reload();
				}
			}
		}
	}
}



