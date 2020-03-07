const express = require('express');
const session = require('express-session');
const https = require('https');
const bodyParser = require('body-parser');
const database = require('./database');
const socketServer = require('./socketServer')


const ip = require('ip');
const IP = ip.address();
const S_PORT = 80;
const SS_PORT = 1337;
const WS_PORT = 8080;

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

const wss = require('./webSocket');
//const wssController = require('./controllers/wssController'); 
//wss.on('connection', wssController);
wss.listen(WS_PORT);

wss.on('connection', (ws,req) => {
      wss.setClientId(ws, req);
      ws.on('message', message => {
        message = JSON.parse(message);
        database.changeDeviceValue(message.value, message.id);
        socketServer.sendToDevice(message.id, message.value);
        wss.sendToOthers('update', ws);
        console.log('Message:', message);

        
      });
      ws.on('close', err =>{
//        wss.terminateOthers(ws);
        console.log('disconnected on error:',err);
      });
      console.log('Client connected!');
      ws.send('connected!');  
});



