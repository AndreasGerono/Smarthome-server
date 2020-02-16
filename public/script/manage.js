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
			request.open('GET', '/user_devices');
			request.send();
			request.onload = () => {
			const userDevices = JSON.parse(request.response);
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
		cell.appendChild(text);
	});
	
	
	devices.forEach(device => {
		let row = table.insertRow();
		let cell = row.insertCell();
		let text = document.createTextNode(device.device_name);
		cell.id = device.device_id;
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
	request.open('POST', '/user_devices/add');
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(userDevice);
}

function deleteUserDeviceRequest(userDevice) {
	const request = new XMLHttpRequest();
	request.open('POST', '/user_devices/delete');
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(userDevice);
}