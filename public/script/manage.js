const table = document.querySelector('table');

createTable();

function createTable() {
	const request = new XMLHttpRequest();
	request.open('GET', '/devices');
	request.send();
	request.onload = () => {
		const devices = JSON.parse(request.response);
		request.open('GET', '/users');
		request.send();
		request.onload = () => {
			const users = JSON.parse(request.response);
			request.open('GET', '/users/devices');
			request.send();
			request.onload = () => {
			const userDevices = JSON.parse(request.response);
			eraseTable();
			drawTable(users, devices, userDevices);
			
			}
		}		
	}
}


function drawTable(users, devices, userDevices) {
	
	let usersRow = table.insertRow();
	let firstCell = usersRow.insertCell();
	let text = document.createTextNode("");
	firstCell.appendChild(text);
	
	
	users.forEach(user => {
		let cell = usersRow.insertCell();
		let text = document.createTextNode(user.user_name);
		cell.id = user.user_id;
		cell.onclick = deleteUser;
		cell.appendChild(text);
	});
	
	
	devices.forEach(device => {
		let row = table.insertRow();
		let cell = row.insertCell();
		let text = document.createTextNode(device.device_name);
		cell.id = device.device_id;
		cell.onclick = editDevice;
		cell.appendChild(text);
	});
	
			
	
	for (let row of table.rows) {
	
		if (row.cells.length > 1) {
			continue;
		}
		
		for (let step = 1; step <= users.length; step++ ) {
			
			let device_id = row.cells[0].id;
			let user_id = table.rows[0].cells[step].id;		
			let cell = row.insertCell();
			cell.id = user_id;
			let checked = checkIfUserDevice(user_id, device_id, userDevices);
			let checkBox = createCheckBox(checked, user_id, device_id);
			cell.appendChild(checkBox);
		}		
	}
}


function checkIfUserDevice(user, device, userDevice) {
	for (let element of userDevice) {
		if ((element.device_id ==  device) && (element.user_id == user)) {
			return true;
		}
	}
	return false;
}

function createCheckBox(checked, user, device) {
	let checkBox = document.createElement("INPUT");
	checkBox.setAttribute("type", "checkbox");
	let userDevice = JSON.stringify({device_id: device, user_id: user});
	checkBox.textContent = userDevice;
	checkBox.checked = checked;
	document.body.appendChild(checkBox);
	checkBox.onclick = () => {
		if (checkBox.checked) {
			addUserDeviceRequest(checkBox.textContent);
		}
		else {
			deleteUserDeviceRequest(checkBox.textContent);	
		}
	}
	return checkBox;
}

function addUserDeviceRequest(userDevice) {
	const request = new XMLHttpRequest();
	request.open('POST', '/user/devices');
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(userDevice);
}

function deleteUserDeviceRequest(userDevice) {
	const request = new XMLHttpRequest();
	request.open('DELETE', '/user/devices/');
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(userDevice);
}

function devicesCellOnClick() {
	console.log(this.innerText);
}


function editDevice(){
	const request = new XMLHttpRequest();
	const name = window.prompt('New name:', this.textContent);
	const name_lower = name.toLowerCase().trim();
	
	if (name_lower === "delete") {
		request.open('DELETE', '/devices');
		request.setRequestHeader('Content-Type', 'application/json');
		let data = JSON.stringify({device_id: this.id});
		request.send(data);
		eraseRow(this.parentElement);
	}
	
	else if (validateName(name)) {
		request.open('POST', '/devices/names');
		request.setRequestHeader('Content-Type', 'application/json');
		this.innerText = name;
		let data = JSON.stringify({device_id: this.id, device_name: this.innerText});
		request.send(data);
		console.log(data);
	}
	else if (name != null){
		window.alert('Wrong name!');
	}
}

function validateName(name) {
	if (name) {
		return name.charAt(0) !== ' ' && name != '' && name != 'null' && name.length < 20;
	}
	return 0;
}

function deleteUser(){
	const request = new XMLHttpRequest();
	let status = window.confirm(`Are you sure you want to delete user ${this.innerText}?`);
	if (status == true) {
		request.open('DELETE', '/users');
		request.setRequestHeader('Content-Type', 'application/json');
		let data = JSON.stringify({user_id: this.id});
		request.send(data);
		console.log(data);
		createTable();

	}
}


function eraseTable() {
	try {
		
		while (table.firstChild.firstChild) {
			table.firstChild.removeChild(table.firstChild.firstChild);
		}
		
	}
	
	catch(error){
		console.log("Table is empty!");
	}
}


function eraseRow(row) {
	row.parentElement.removeChild(row);
}