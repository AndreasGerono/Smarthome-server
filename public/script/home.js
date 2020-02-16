const containers = document.querySelectorAll('.column');
const editButton = document.querySelector('.edit');
const colorEnable = 'rgb(255, 90, 82)';
const colorDisable = 'rgb(221, 221, 221)';


console.log(location.hostname)
editButton.onclick = toogleEdit;
setInterval(()=>{updateSensors()}, 2000);
updateDevices();




function getUnit(id) {
	const units =  [" °C", " °C"];
	return units[id%10-2];
}

function toogleEdit() {
	if (parseInt(this.value)) {
		this.textContent = 'edit';
		this.value = 0;
		enableAll();
	}
	else {
		this.textContent = 'done';
		this.value = 1;
		disableAll();
	}
}

function formatData(id,value,name=undefined) {
	return JSON.stringify({'id': id, 'value':value, 'name' : name});
}


let IP = location.hostname;
const WS_PORT = 8080;
var socket = new WebSocket('ws://'+IP+':'+WS_PORT);

socket.onopen = event => {
	
	socket.onmessage = message => {
		console.log(message.data);
		if (message.data == 'update') {
			updateDevices();
		}
	};
	
	socket.onclose = message => {
		console.log('Server closed on code:', message.code);
		setTimeout(() => { location.reload() }, 150);
	};
};


function updateDevices() {
	const request = new XMLHttpRequest();
	request.open('GET', '/devices');
	request.send();
	request.onload = () => {
		try{
			removeDevices();
			const data = JSON.parse(request.response)
			data.forEach(element => {
				if (element.device_id%10 === 0) {
					createSwitch(element);
				}
				else if (element.device_id%10 === 1) {
					createSlider(element);
				}
				
				else if (element.device_id%10 === 2) {
					createRgbSlider(element);
				}
				
				else if (element.device_id%10 > 2) {
					createSensor(element);
				}	
			});
		}
		catch(err){
			console.log('Unable to download devices!',err);
//			location.reload();
		}
	}
}

function updateSensors() {
	const request = new XMLHttpRequest();
	request.open('GET', '/devices/sensors');
	request.send();
	request.onload = () => {
		try{
			removeSensors();
			const data = JSON.parse(request.response);
			console.log(data);
			data.forEach(sensor => {
			createSensor(sensor);
			});
		}
		catch(err){
			console.log('Unable to download sensors!', err);
			location.reload();
		}
	}
}

function createSensor(element){
	let namePara = document.createElement('p');
	let valuePara = document.createElement('p');
	let div = document.createElement('div');
	if (element.device_is_active == 0){
		div.className = 'sensor disabled';
	}
	else{
		div.className = 'sensor enabled';
	}
	console.log(element.device_is_active);
	namePara.textContent = element.device_name;
	namePara.onclick = editElement;
	value = parseFloat(element.device_value).toFixed(1)
	valuePara.textContent = value + getUnit(element.device_id);
	valuePara.id = element.device_id;
	div.appendChild(namePara);
	div.appendChild(valuePara);
	containers[2].appendChild(div);
}

function createSwitch(element) {
	let button = document.createElement('button');
	let div = document.createElement('div');
	let para = document.createElement('p');
	if (element.device_is_active == 0) {
		div.className = 'switch disabled';
		button.disabled = true;
	}
	else{		
		div.className = 'switch enabled';
	}
	para.textContent = element.device_name;
	button.value = element.device_value;
	button.textContent = parseInt(element.device_value) ? 'ON' : 'OFF';
	button.id = element.device_id;
	button.onclick = switchClick;
	para.onclick = editElement;
	div.appendChild(para);
	div.appendChild(button);
	containers[0].appendChild(div);
}

function createSlider(element) {
	let slider = document.createElement('input');
	let div = document.createElement('div');
	let para = document.createElement('p');
	para.textContent = element.device_name;
	
	if (element.device_is_active == 0) {
		div.className = 'brightness disabled';
		slider.disabled = true;
	}
	else {
		div.className = 'brightness enabled';
	}
	slider.setAttribute('type', 'range');
	slider.setAttribute('max', '255');
	slider.setAttribute('step', '1');
	slider.id = element.device_id;
	slider.value = element.device_value%1000;
	slider.oninput = sliderDrag;
	slider.onclick = sliderClick;
	slider.onmouseup = sliderMouseUp;
	if (element.device_value >= 1000) {
		slider.style.background = colorEnable;
	}
	para.onclick = editElement;
	div.appendChild(para);
	div.appendChild(slider);
	containers[1].appendChild(div);
}



function createRgbSlider(element) {
	let slider = document.createElement('input');
	let div = document.createElement('div');
	let para = document.createElement('p');
	if (element.device_is_active == 0) {
		div.className = 'rgb disabled';
		slider.disabled = true;
	}
	else {
		div.className = 'rgb enabled';
	}
	slider.setAttribute('type', 'range');
	slider.setAttribute('max', '340');
	slider.setAttribute('step', '2');
	slider.id = element.device_id;
	slider.className = 'rgb';
	slider.value = element.device_value;
	slider.oninput = sliderRgbDrag;
	div.appendChild(para);
	div.appendChild(slider);
	containers[1].appendChild(div);
}


function switchClick() {
	
	if (parseInt(this.value)) {
		this.textContent = 'OFF';
		this.value = 0;
	}
	else {
		this.textContent = 'ON';
		this.value = 1;
	}
	socket.send(formatData(this.id, this.value));
	console.log(formatData(this.id, this.value));

}



function sliderClick() {
	var value = parseInt(this.value);
	if (this.style.background === colorEnable) {
		this.style.background = colorDisable;
	}
	
	else {
		this.style.background = colorEnable;
		value += 1000;
	}
	
	value = value.toString();
	socket.send(formatData(this.id, value));
	console.log(formatData(this.id, value));
}

function sliderMouseUp() {
	setTimeout(()=>this.onclick = sliderClick, 100);
	
}


function sliderRgbMouseUp() {
	this.setAttribute("style", "background: linear-gradient(to right, hsl(0, 100%, 50%), hsl(36, 100%, 50%), hsl(72, 100%, 50%), hsl(108, 100%, 50%), hsl(144, 100%, 50%), hsl(180, 100%, 50%), hsl(216, 100%, 50%), hsl(252, 100%, 50%), hsl(288, 100%, 50%), hsl(324, 100%, 50%), hsl(360, 100%, 50%))");	
}




function sliderDrag() {
	this.onclick = null;
	var value = parseInt(this.value);
		
	if (this.style.background === colorEnable) {
		value += 1000;
	}
	
	value = value.toString();
	socket.send(formatData(this.id, value));
	console.log(formatData(this.id, value));
	
}

function sliderRgbDrag() {	
	socket.send(formatData(this.id, this.value));
	console.log(formatData(this.id, this.value));
}


function editElement(e){
	if (editButton.textContent !== 'edit') {
		const request = new XMLHttpRequest();
		const name = window.prompt('New name:', this.textContent);
		if (validateName(name)) {
			request.open('POST', '/device');
			request.setRequestHeader('Content-Type', 'application/json');
			let data = formatData(this.parentElement.children[1].id, undefined, name);
			request.send(data);
			updateSensors();
			updateDevices();
		}
		else if (name != null){
			window.alert('Wrong name!');
		}
	}
}

function validateName(name) {
	if (name) {
		return name.charAt(0) !== ' ' && name != '' && name != 'null' && name.length < 20;
	}
	return 0;
}

function disableAll() {
	let elements = document.querySelectorAll('.rgb, .switch , .brightness');
	try{
		elements.forEach(element => {
		element.children[1].disabled = true;
		console.log(element);
		});
	}
	catch(error){};
}

function enableAll() {
	let elements = document.querySelectorAll('.rgb, .switch , .brightness');
	try{
		elements.forEach(element => {
		element.children[1].disabled = false;
//		element.classList.remove("disabled");
//		element.classList.add("enabled");
		});
	}
	catch(error){};
}

function removeDevices() {
	let elements = document.querySelectorAll('.switch, .slider, .sensor, .rgb, .brightness');
	elements.forEach(element => {element.parentElement.removeChild(element)});
}

function removeSensors() {
	let sensors = document.querySelectorAll('.sensor')
	sensors.forEach(sensor => {sensor.parentElement.removeChild(sensor)});
}

