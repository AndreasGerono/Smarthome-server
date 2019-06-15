const net = require('net');
const websocket = require('./webSocketServer');
const database = require('./database');

let clients = [];

const server = net.createServer(serverFunc);

function serverFunc(socket) {
	socket.name = socket.remoteAddress +':'+socket.remotePort+' ';
	clients.push(socket);
	socket.write('Connected!\n');
	console.log('Client: '+socket.name+'connected!');
	
	socket.on('data', data => {
		data = data.toString('ascii');
		console.log('From: '+socket.name+data);
		data = encodeData(data);
		database.updateDevice(data)
		websocket.sendToAll(JSON.stringify(data))
	});
	
	socket.on('close', () => {
		clients.splice(clients.indexOf(socket),1);
		console.log('Client: '+socket.name+'left');
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

function encodeData(data) {
	const id = parseInt(data/10000);
	let value = data%1000;
	value = parseInt(value/10) + (value%10)/10
	return {id: id, value: value}
}