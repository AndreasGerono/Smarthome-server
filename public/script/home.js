const containers = document.querySelectorAll('.column');
const editButton = document.querySelector('.edit');
const colorEnable = 'rgb(255, 90, 82)';
const colorDisable = 'rgb(221, 221, 221)';

var currentColor = 0;

console.log(location.hostname)
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


window.onbeforeunload = () => {
	socket.close();
}

socket.onopen = event => {
	
	socket.onmessage = message => {
		console.log(message.data);
		if (message.data == 'update') {
			updateDevices();
		}
	};
	
	socket.onclose = message => {
		console.log('Server closed on code:', message.code);
		setTimeout(() => {location.reload()}, 200);
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
					createRgb(element);
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
	namePara.textContent = element.device_name;
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
	slider.setAttribute('max', '99');
	slider.setAttribute('step', '1');
	slider.id = element.device_id;
	slider.value = element.device_value%1000;
	slider.oninput = sliderDrag;
	slider.onclick = sliderClick;
	slider.onmouseup = sliderMouseUp;
	if (element.device_value >= 1000) {
		slider.style.background = colorEnable;
	}
	div.appendChild(para);
	div.appendChild(slider);
	containers[1].appendChild(div);
}

function createRgb(element) {
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
	slider.setAttribute('max', '99');
	slider.setAttribute('step', '1');
	slider.id = element.device_id;
	slider.value = element.device_value%100;
	slider.oninput = sliderRgbDrag;
	slider.onclick = sliderRgbClick;
	slider.onmouseup = sliderRgbMouseUp;
	if (element.device_value >= 1000) {
		slider.style.background = colorEnable;
	}
	div.appendChild(para);
	div.appendChild(slider);
	
	let rgb_div = document.createElement('div');
	rgb_div.className = "colors";
	rgb_div.appendChild(createColorButton(0));
	rgb_div.appendChild(createColorButton(1));
	rgb_div.appendChild(createColorButton(2));
	rgb_div.appendChild(createColorButton(3));
	div.appendChild(rgb_div);
	containers[1].appendChild(div);
}


function createColorButton(color) {
	let button = document.createElement('button');
	button.className = "rgbButton";
	button.value = color;
	button.onclick = colorButtonOnClick;
	return button;
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

//RGB

function sliderRgbClick() {
	let value = currentColor*100 + parseInt(this.value);
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

function sliderRgbMouseUp() {
	setTimeout(()=>this.onclick = sliderRgbClick, 100);	
}

function sliderRgbDrag() {
	this.onclick = null;
	let value = currentColor*100 + parseInt(this.value);
		
	if (this.style.background === colorEnable) {
		value += 1000;
	}
	
	value = value.toString();
	socket.send(formatData(this.id, value));
	console.log(formatData(this.id, value));
}


function colorButtonOnClick() {
	currentColor = this.value;
	let sliderVal =  this.parentNode.parentNode.children[1].value;
	let value = 1000 + parseInt(this.value)*100 + parseInt(sliderVal);
	this.parentNode.parentNode.children[1].style.background = colorEnable;
	let id = this.parentNode.parentNode.children[1].id;
	socket.send(formatData(id, value));
	console.log(formatData(id, value));
}

//function disableAll() {
//	let elements = document.querySelectorAll('.rgb, .switch , .brightness');
//	try{
//		elements.forEach(element => {
//		element.children[1].disabled = true;
//		console.log(element);
//		});
//	}
//	catch(error){};
//}
//
//function enableAll() {
//	let elements = document.querySelectorAll('.rgb, .switch , .brightness');
//	try{
//		elements.forEach(element => {
//		element.children[1].disabled = false;
////		element.classList.remove("disabled");
////		element.classList.add("enabled");
//		});
//	}
//	catch(error){};
//}

function removeDevices() {
	let elements = document.querySelectorAll('.switch, .slider, .sensor, .rgb, .brightness');
	elements.forEach(element => {element.parentElement.removeChild(element)});
}

function removeSensors() {
	let sensors = document.querySelectorAll('.sensor')
	sensors.forEach(sensor => {sensor.parentElement.removeChild(sensor)});
}

