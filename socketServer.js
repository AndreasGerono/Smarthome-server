const net = require('net');
const websocket = require('./webSocketServer');
const database = require('./database');

let clients = [];

const server = net.createServer(serverFunc);


function serverFunc(socket) {
	socket.setEncoding('utf-8');
	socket.name = socket.remoteAddress +':'+socket.remotePort+' ';
	clients.push(socket);
	socket.write('Connected!\n');
	console.log('Client: '+socket.name+'connected!');
	
	socket.on('data', data => {
		console.log('From:',socket.name,data);
		data = encodeMessage(data);
		if (data.value === 999.9) {
			socket.name = data.id
			database.addDevice(data.id)
			websocket.sendToAll('update')
		}
		else {
			database.updateDevice(data)
		}
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

exports.sendToDevice = (id, message) => {
	clients.forEach(client => {
		if (client.name === id) {
			client.write(message)
		}
	});
}


function encodeMessage(message) {
	const id = parseInt(message/10000);
	let value = message%10000;
	value = parseInt(value/10) + (value%10)/10
	return {id: id, value: value}
}
