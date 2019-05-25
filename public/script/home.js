const containers = document.querySelectorAll('.column');
const editButton = document.querySelector('.edit');
const colorEnable = 'rgb(255, 90, 82)';
const colorDisable = 'rgb(221, 221, 221)';

console.log(location.hostname)
editButton.onclick = toogleEdit;
updateDevices();

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


function formatData(id,value,name=null) {
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
			let data = JSON.parse(request.response)
			removeDevices();
			data.forEach(element => {
				if (element.device_id%10 === 0) {
					creatSwitch(element)
				}
				else if (element.device_id%10 === 1) {
					creatSlider(element)
				}
			});
		}
		catch{
			console.log('Unable to download devices!');
			location.reload();
		}
	};
}


function creatSwitch(element) {
	let button = document.createElement('button');
	let div = document.createElement('div');
	let para = document.createElement('p')
	div.className = 'switch';
	para.textContent = element.name;
	button.value = element.value;
	button.textContent = element.value ? 'ON' : 'OFF';
	button.id = element.device_id;
	button.onclick = switchClick;
	para.onclick = editElement;
	div.appendChild(para);
	div.appendChild(button);
	containers[0].appendChild(div);
}

function creatSlider(element) {
	let slider = document.createElement('input');
	let div = document.createElement('div');
	let para = document.createElement('p');
	para.textContent = element.name;
	div.className = 'slider';
	slider.setAttribute('type', 'range');
	slider.setAttribute('max', '255');
	slider.setAttribute('step', '1');
	slider.id = element.device_id;
	slider.value = element.value%1000;
	slider.onchange = sliderDrag;
	slider.onclick = sliderClick;
	if (element.value >= 1000) {
		slider.style.background = colorEnable;
	}
	para.onclick = editElement;
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
	console.log(this.style.background);
	if (this.style.background === colorEnable) {
		this.style.background = colorDisable;
		console.log('dis');
	}
	
	else {
		this.style.background = colorEnable;
		value += 1000;
		console.log('en');
	}
	
	socket.send(formatData(this.id, value));
}

function sliderDrag() {
	this.onclick = 0;
	var value = parseInt(this.value);
		
	if (this.style.background === colorEnable) {
		value += 1000;
	}
	
	socket.send(formatData(this.id, value));
	setTimeout(()=>this.onclick = sliderClick, 100);
}

function editElement(e) {
	if (parseInt(editButton.value)) {
		name = window.prompt('Give a new name', this.textContent );
		if (isWalid(name)) {
			if (name == 'delete') {
				this.parentElement.parentElement.removeChild(this.parentElement);
			}
			else{
				this.textContent = name;
			}
			socket.send(formatData(this.parentElement.children[1].id, null, name));
		}
		
		else if (name != 'null'){
			window.alert('Wrong name!');
		}
	}
}


function isWalid(s) {
	return s.charAt(0) !== ' ' && s != '' && s != 'null' && s.length < 20;
}

function disableAll() {
	let elements = document.querySelectorAll('.switch, .slider');
	elements.forEach(element => {element.children[1].disabled = true});
}

function enableAll() {
	let elements = document.querySelectorAll('.switch, .slider');
	elements.forEach(element => {element.children[1].disabled = false});
}

function removeDevices() {
	let elements = document.querySelectorAll('.switch, .slider');
	elements.forEach(element => {element.parentElement.removeChild(element)});
}

