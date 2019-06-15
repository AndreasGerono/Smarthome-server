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
	if (req.session.loggedin) {
		res.sendFile(path.join(__dirname + '/public/home.html'));
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
	if (req.session.loggedin) {
		database.findDevices(results=>{res.json(results)});
	}
	else {
		res.sendFile(path.join(__dirname + '/public/404.html'));
	}
});

router.get('/devices/sensors', (req,res) => {
	if (req.session.loggedin) {
		database.findSensors(results=>{res.json(results)});
	}
	else {
		res.sendFile(path.join(__dirname + '/public/404.html'));
	}
});


router.get('/*', (req,res) => {
	res.sendFile(path.join(__dirname + '/public/404.html'));
});




router.post('/auth', authController);
router.post('/contact', mailController);

module.exports = router;