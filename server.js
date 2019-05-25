const express = require('express');
const session = require('express-session');
const https = require('https');
const bodyParser = require('body-parser');

const database = require('./database');
const socketServer = require('./socketServer')


const ip = require('ip');
const IP = ip.address()
const S_PORT = 80;
const SS_PORT = 1337;
const app = express();

//const fs = require('fs');
//const httpsOptions = {
//    key: fs.readFileSync('/etc/letsencrypt/live/andreas-gerono.duckdns.org/privkey.pem'),
//    cert: fs.readFileSync('/etc/letsencrypt/live/andreas-gerono.duckdns.org/fullchain.pem')
//};

app.use(express.static(__dirname + '/'));


app.use(session({
  secret: '3a5yn9c5b',
  resave: 'false',
  saveUninitialized: false
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.listen(S_PORT, IP , () => {
  console.log('Listening on',IP+':'+S_PORT);
});

//https.createServer(httpsOptions, app).listen(S_PORT, IP, function () {
//  console.log('Listening on',S_PORT, '!');
//});

const router = require('./router');
app.use('/', router);

socketServer.listen(SS_PORT, IP);

const websocket = require('./webSocketServer');
const wss = websocket.wss;


wss.on('connection', ws => {
  
  ws.on('message', message => {
    database.editDevices(JSON.parse(message));
    websocket.sendToOthers('update',ws);
    const toSend = decodeMessage(message);
    if (toSend){
      console.log('Wiadomość: ',toSend);
      socketServer.broadcast(toSend);
    }
  });
});


function decodeMessage(message) {
  const obj = JSON.parse(message);
  if (!obj.value) {
    return 0;
  }
  return (parseInt(obj.id)*10000+parseInt(obj.value)).toString();
}

