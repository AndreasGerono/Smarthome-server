const net = require('net');
const websocket = require('./webSocketServer');


let clients = [];

const server = net.createServer(serverFunc);

function serverFunc(socket) {
	socket.name = socket.remoteAddress +':'+socket.remotePort+' ';
	clients.push(socket);
	socket.write('Connected!\n');
	console.log('Client: '+socket.name+'connected!');
	
	socket.on('data', data => {
		console.log('From: '+socket.name+data.toString('ascii'));
		websocket.sendToAll(data.toString('ascii'));
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

