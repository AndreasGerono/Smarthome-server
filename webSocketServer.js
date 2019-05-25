const websocket = require('ws');
//const https = require('https');


const WS_PORT = 8080;
let wss = new websocket.Server({port: WS_PORT});

//server = https.createServer(httpsOptions);
//const wss = new websocket.Server({server});
//server.listen(8080);


wss.on('connection', (ws, req) => {
	ws.id = req.headers.cookie;
	ws.on('close', err => {
		terminateOthersInSameSession(ws);
		console.log('disconnected on error:',err);
	});
	
	console.log('Client connected!')
	ws.send('connected!');
});


function sendToAll(message) {
	wss.clients.forEach(client =>{
		client.send(message);
	});
}

function sendToOthers(message, ws) {
	wss.clients.forEach(client =>{
			if (ws !== client){
				client.send(message);
			}
		});	
}

function terminateOthersInSameSession(ws) {
	wss.clients.forEach(client => {
		if (client.id === ws.id) {
			client.terminate();
		}
	});
}


exports.sendToAll = sendToAll;
exports.wss = wss;
exports.sendToOthers = sendToOthers;
