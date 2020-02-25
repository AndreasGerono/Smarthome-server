const net = require('net');
const wss = require('./webSocket');
const database = require('./database');


const PAIRING = 9999;
const MESSAGE_SIZE = 4;

//let clients = [];
let clients = new Map();

const server = net.createServer(serverFunc);


function serverFunc(socket) {
	socket.setEncoding('utf-8');
	socket.code = "NEW";
	socket.write('Connected\r\n');
	console.log(`Client: ${socket.code} connected!`);
//	socket.setTimeout(4000);
	
	socket.on('data', data => {
		console.log(`From: ${socket.code} ${data}`);
		data = encodeMessage(data);
		console.log(data.id, data.value);
		if (data.value == PAIRING) {
			socket.code = getModuleCode(data.id);
			clients.set(socket.code, socket);
			database.addDevice(data.id);
			setTimeout(() => {
				database.activateModule(socket.code);	//NEW
				wss.sendToAll('update');
			}, 500)
		}
		else if (data.id != 0) {
			database.changeDeviceValue(data.value, data.id);
		}
		
		wss.sendToAll(JSON.stringify(data));
	});
	
	socket.on('close', () => {
		clients.delete(socket.code);
		console.log(`Client: ${socket.code} left`);
		database.deactivateModule(socket.code);
		database.resetModuleValues(socket.code);
		wss.sendToAll('update');
	});
	
	
	socket.on('timeout', () => {
		clients.delete(socket.code);
		database.deactivateModule(socket.code);
		database.resetModuleValues(socket.code);
		console.log(`Client: ${socket.code} left due  timeout`);
		console.log(clients);
		wss.sendToAll('update');
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
	client = clients.get(getModuleCode(id));
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
	message = '$' + message+"\r\n";
	return message;
}

function encodeMessage(message) {
	if (isNaN(message)) {
		return 0;
	}
	const id = parseInt(message/10000);
	let value = message%10000;
	return {id: id.toString(), value: value.toString()}
}



