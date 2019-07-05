const net = require('net');
const websocket = require('./webSocketServer');
const database = require('./database');

let clients = [];

const server = net.createServer(serverFunc);


function serverFunc(socket) {
	socket.setEncoding('utf-8');
	socket.id = 0;
	clients.push(socket);
	socket.write('Connected!\n');
	console.log(`Client: ${socket.id} connected!`);
	
	socket.on('data', data => {
		console.log(`From: ${socket.id} ${data}`);
		data = encodeMessage(data);
		if (data.value == 9999) {
			socket.id = data.id;
			database.addDevice(data.id);
		}
		else if (data && socket.id) {
			database.updateDevice(socket.id, data.value);
			websocket.sendToAll('update')
		}
		websocket.sendToAll(JSON.stringify(data));
	});
	
	socket.on('close', () => {
		clients.splice(clients.indexOf(socket),1);
		console.log(`Client: ${socket.id} left`);
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
	clients.forEach(client => {
		if (client.name == id) {
			client.write(message)
		}
	});
}


function encodeMessage(message) {
	if (isNaN(message)) {
		return 0;
	}
	const id = parseInt(message/10000);
	let value = message%10000;
	return {id: id.toString(), value: value.toString()}
}
