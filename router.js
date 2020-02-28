const express = require('express');
const path = require('path');
const ip = require('ip');
const router = express.Router();

const usersMap = require('./usersMap');
const database = require('./database');
const wss = require('./webSocket');



const authController = require('./controllers/authController');  
const mailController = require('./controllers/mailController');  


router.get('/', (req,res) => {
	if (req.session.loggedin) {
		res.redirect('/home');
	}
	else {
		res.sendFile(path.join(__dirname + '/public/login.html'));
	}
});


router.get('/signup', (req,res) => {
	if (req.session.loggedin) {
		res.redirect('/');
	}
	else{
		res.sendFile(path.join(__dirname + '/public/signup.html'));
	}
});


router.get('/home', (req,res) => {
	if (req.session.username == "admin") {
		res.sendFile(path.join(__dirname + '/public/home-admin.html'));
	}
	else if (req.session.loggedin) {
		res.sendFile(path.join(__dirname + '/public/home.html'));
	} 
	else {
		res.redirect('/');
	}
});

router.get('/manage', (req,res) => {	
	if (req.session.username == "admin") {
		res.sendFile(path.join(__dirname + '/public/manage.html'));
	} else {
		res.redirect('/');
	}
});

router.get('/home/incorrect', (req,res) => {
	res.sendFile(path.join(__dirname + '/public/login-incorrect.html'));
});

router.get('/contact', (req,res) => {
	res.sendFile(path.join(__dirname + '/public/contact.html'));
});


router.get('/logout', (req,res) => {
	if (req.session.loggedin) {
		console.log(req.session.username+' logged out!');
		console.log(req.headers.cookie);
		usersMap.removeUser(req.headers.cookie);
		req.session.destroy();
	}
	res.redirect('/');
});


router.get('/devices', (req,res) => {
	if (req.session.username == "admin") {
		database.findDevices(results=>{res.json(results)});
	}
	else if (req.session.loggedin) {
		database.findUserDevices(req.session.username, results=>{res.json(results)});
	}
	else {
		res.sendFile(path.join(__dirname + '/public/404.html'));
	}
});

router.get('/users', (req,res) => {
	if (req.session.username == "admin") {
		database.findUsers(results=>{res.json(sortUsers(results))});	
	}
	else {
		res.sendFile(path.join(__dirname + '/public/404.html'));
	}
});


router.get('/users/devices', (req,res) => {
	if (req.session.username == "admin") {
		database.usersDevices(results=>{res.json(results)});
	}
	
	else {
		res.sendFile(path.join(__dirname + '/public/404.html'));
	}
	
	
});


router.get('/devices/sensors', (req,res) => {
	if (req.session.username == "admin") {
		database.findSensors(results=>{res.json(results)});
	}
	else if (req.session.loggedin) {
		database.findUserSensors(req.session.username, results=>{res.json(results)});
	}
	else {
		res.sendFile(path.join(__dirname + '/public/404.html'));
	}
});


router.get('/*', (req, res) => {
	res.sendFile(path.join(__dirname + '/public/404.html'));
});


router.post('/auth', authController);
router.post('/contact', mailController);


router.post('/devices/names', (req, res) => {
	if (req.session.username == "admin") {
		const data = req.body;
		console.log(data);
		database.changeDeviceName(data.device_name, data.device_id);
		wss.sendToOwners(data.device_id, "update");
		res.send("ok");
	}
});

router.delete('/devices', (req, res) => {
	if (req.session.username == "admin") {
		const data = req.body;
		console.log(data);
		database.deleteDevice(data.device_id);
		wss.sendToOwners(data.device_id, "update");
		res.send("ok");
	}
});


router.post('/user/devices', (req, res) => {
	if (req.session.username == "admin") {
		let user_device = req.body;
		database.addUserDevice(user_device.user_id , user_device.device_id);
		wss.sendToUser(user_device.user_id, "update");
		res.send("ok");
	}
});

router.delete('/user/devices', (req, res) => {
	if (req.session.username == "admin") {
		let user_device = req.body;
		database.deleteUserDevice(user_device.user_id , user_device.device_id);
		wss.sendToUser(user_device.user_id, "update");
		res.send("ok");
	}
});


router.post('/users', (req, res) => {
	let user = req.body;
	console.log(user);
	database.findUser(user.user_name, result => {
		if (result.length > 0) {
			res.send("false");
		}
		else {
			database.addUser(user.user_name, user.user_password);
			req.session.loggedin = true;
			req.session.username = user.user_name;
			res.send("true");
		}
	});	
});


router.delete('/users', (req, res) => {
	if (req.session.username == "admin") {
		let user = req.body;
		database.deleteUser(user.user_id);
		wss.terminateUser(user.user_id);
		res.send("ok");
	}
});






function sortUsers(users) {
	let result = users.filter(user => user.user_name != "admin");
	let newArray = [];
	
	for (element of result) {
		let userData = {user_id: element.user_id, user_name: element.user_name};
		newArray.push(userData);
	}
	
	return newArray;
}




module.exports = router;