const net = require('net');
const wss = require('./webSocket');
const database = require('./database');


const PAIRING = 9999;
const MESSAGE_SIZE = 6;

//let clients = [];
let clients = new Map();

const server = net.createServer(serverFunc);


function serverFunc(socket) {
	socket.setEncoding('utf-8');
	socket.id = "NEW";
	socket.write('Connected\r\n');
	console.log(`Client: ${socket.id} connected!`);
	socket.write("lol");
	socket.setTimeout(10000);
	socket.on('data', data => {
		console.log(`From: ${socket.id} ${data}`);
		data = encodeMessage(data);
		console.log(data);
		
		
		
		if (data.value == PAIRING) {
			socket.id = data.id;
			clients.set(data.id, socket);
			database.addDevice(data.id);
			wss.sendToOwners(socket.id, 'update');
			database.activateModule(socket.id);	
		}
		else if (data.value != undefined) {
			database.changeDeviceValue(data.value, socket.id);
		}
		
		else if (socket.id != "NEW") {
			database.activateModule(socket.id);	
		}
	
		
		
		
		
	});
	
	

	socket.on('close', () => {
		console.log(`Client: ${socket.id} left`);
		if (socket.id != "NEW") {
			wss.sendToOwners(socket.id, 'update');
			database.deactivateModule(socket.id);
			database.resetModuleValues(socket.id);
		}
		clients.delete(socket.id);
	});
	
	
	socket.on('timeout', () => {
		console.log(`Client: ${socket.id} left`);
		if (socket.id != "NEW") {
			wss.sendToOwners(socket.id, 'update');
			database.deactivateModule(socket.id);
			database.resetModuleValues(socket.id);
		}
		clients.delete(socket.id);
	});
	
	
	socket.on('error', err => {
		console.log(err);
	});
	
};


exports.broadcast = message => {
	clients.forEach(client => {client.write(message)}); 
}

exports.listen = (PORT, IP) => {
	server.listen(PORT,IP);
}

//exports.sendToDevice = (id, message) => {
//	console.log(id, message);
//	clients.forEach(client => {
//		if (Math.floor(client.id/10) == Math.floor(id/10)) {
//			try{
//				client.write(decodeMessage(id, message)); 
//			}
//			catch(err){}
//		}
//	});
//	console.log(message);
//}

exports.sendToDevice = (id, message) => {
	console.log(id, message);
	client = clients.get(id);
	if (client) {
		client.write(decodeMessage(id, message));
	}
}

function getDeviceType(id) {
	return parseInt(id%10);
}
function getModuleCode(id) {
	return Math.floor(id/10);
}

function decodeMessage(id, message){
	while (message.length < MESSAGE_SIZE) {
		message = '0' + message;
	}
	message = '$ ' + message+"\r\n";
	return message;
}

function encodeMessage(message) {
	
	message = parseFloat(message);
	if (isNaN(message)) {
		return 0;
	}
	let id = parseInt(message/10000);
	let value = message%10000;
	return {id: id.toString(), value: value.toString()}
}



