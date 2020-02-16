const express = require('express');
const path = require('path');
const ip = require('ip');
const router = express.Router();

const database = require('./database');

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

router.get('/home-incorrect', (req,res) => {
	res.sendFile(path.join(__dirname + '/public/login-incorrect.html'));
});

router.get('/contact', (req,res) => {
	res.sendFile(path.join(__dirname + '/public/contact.html'));
});


router.get('/logout', (req,res) => {
	if (req.session.loggedin) {
		console.log(req.session.username+' logged out!')
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


router.get('/users_devices', (req,res) => {
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


router.post('/device', (req, res) => {
	if (req.session.username == "admin") {
		const device = req.body;
		if (device.name == "delete") {
			database.deleteDevice(device.id);
		}
		else {
			database.changeDeviceName(device.name, device.id);
		}
		res.send("ok");
	}
});


router.post('/user_devices/add', (req, res) => {
	if (req.session.username == "admin") {
		let user_device = req.body;
		database.addUserDevice(user_device.user_id , user_device.device_id);
		res.send("ok");
	}
});

router.post('/user_devices/delete', (req, res) => {
	if (req.session.username == "admin") {
		let user_device = req.body;
		database.deleteUserDevice(user_device.user_id , user_device.device_id);
		res.send("ok");
	}
});



module.exports = router;



function sortUsers(users) {
	let result = users.filter(user => user.user_name != "admin");
	let newArray = [];
	
	for (element of result) {
		let userData = {user_id: element.user_id, user_name: element.user_name};
		newArray.push(userData);
	}
	
	return newArray;
}