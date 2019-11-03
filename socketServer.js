const net = require('net');
const wss = require('./webSocket');
const database = require('./database');


const PAIRING = 9999;
const MESSAGE_SIZE = 4;

let clients = [];

const server = net.createServer(serverFunc);


function serverFunc(socket) {
	socket.setEncoding('utf-8');
	socket.id = "NEW";
	clients.push(socket);
	socket.write('Connected!\n');
	console.log(`Client: ${socket.id} connected!`);
//	socket.setTimeout(4000);
	
	socket.on('data', data => {
		console.log(`From: ${socket.id} ${data}`);
		data = encodeMessage(data);
		console.log(data.id, data.value);
		if (data.value == PAIRING) {
			socket.id = data.id;
			database.addDevice(data.id);
			socket.write(data.id);	//response to device
			
//			database.getDeviceValue.then(value => socket.write(decodeMessage(value)), error => console.log(error));	//nowe
		}
		else if (data && socket.id) {
			database.changeDeviceValue(data.value, socket.id);
		}
		wss.sendToAll(JSON.stringify(data));
		
	});
	
	socket.on('close', () => {
		clients.splice(clients.indexOf(socket), 1);
		console.log(`Client: ${socket.id} left`);
	});
	
	
	socket.on('timeout', () => {
		clients.splice(clients.indexOf(socket), 1)
		database.deActivateDevice(socket.id)
		console.log(`Client: ${socket.id} left due  timeout`);
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

exports.sendToDevice = (id, message) => {
	console.log(id, message);
	message = decodeMessage(message);
	clients.forEach(client => {
		if (client.id == id) {
			try{
				setTimeout(() => client.write(message), 200);	//może coś psuć? eksperymentalnie dobrać opóźnienie
			}
			catch(err){
				
			}
		}
	});
	console.log(message);
}


function decodeMessage(message){
	while (message.length < MESSAGE_SIZE) {
		message = '0' + message;
	}
	message = '$' + message;	
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
