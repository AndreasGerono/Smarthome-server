const mysql = require('mysql');
const passwordHash = require('password-hash');

settings = {
	host: 'localhost',
	user: 'node1',
	password: 'windows1234',
	database: 'nodelogin'
}


connection = mysql.createConnection(settings);

connection.connect(err => {
	if (err) {
		throw err;
	}
	console.log('Connected to database!');
});



function deleteUser(id) {
	connection.query('DELETE FROM users WHERE id = ?', [id], err =>{
		if (err) {
			console.log(err);
		}
		else {
			console.log('User',id,'deleted from database');
		}
	});
}


function showUsers() {
	connection.query('SELECT * FROM users', (err,rows) =>{
		if (err) {
			console.log(err);
		}
		else {
			console.log('Users in database:', rows);
		}
	});
}

function findUser(username, callback) {
	connection.query('SELECT * FROM users WHERE user_name = ?', [username], (err,rows) =>{
		if (err) {
			console.log(err);
		}
		else {
			callback(rows);
		}
	});
}


function addUser(username, password, email) {
	const safePass = passwordHash.generate(password);
	const account = {
		user_name: username,
		user_password: password,
		user_email: email
	};	
}


function showDevices() {
	connection.query('SELECT * FROM devices', (err, rows) =>{
		if (err) {
			console.log(err);
		}
		else {
			rows.forEach((row)=>{
				console.log(row);
			});
		}
	});
}

function findDevices(callback) {
	connection.query('SELECT * FROM devices', (err,rows) =>{
		if (err) {
			console.log(err);
		}
		else {
			callback(rows);
		}
	});
}

function findDevice(id, callback) {
	connection.query('SELECT * FROM devices WHERE device_id = ?', [id], (err,rows)=>{
		if (err) {
			console.log(err);
		}
		else {
			callback(rows);
		}
	});
	
}


function addDevice(id) {
	findDevice(id, (result) => {
		if (result.length === 0) {
			connection.query('INSERT INTO devices SET device_id =  ?', [id], (err, res)=>{
					if (err) {
						console.log(err);
					}
					else {
						console.log('Added ',id,' to devices');
					}
				});
		}
		else {
			console.log('Device alredy exists!');
		}
	});
}


function updateDevice(param) {
	
	let values;
	if (param.value) {
		values = param.name ? {device_value: param.value, device_name: param.name} : {device_value: param.value}
	}
	
	else{
		values = param.name? {device_name: param.name} : {};
	}
	const data = [values, param.id];
	connection.query('UPDATE devices SET ? WHERE device_id = ?', data, (err,res)=>{
		if (err) {
			console.log(err);
		}
		else {
			console.log('Changed device:', param.id);
		}
		
	});
}


function editDevices(param) {
	if (param.name == 'delete'){
		deleteDevice(param.id);
	}
	else {
		updateDevice(param);
	}
}


function deleteDevice(id) {
	connection.query('DELETE FROM devices WHERE device_id = ?', [id], err=>{
		if (err) {
			console.log(err);
		}
		else {
			console.log('Device',id,'deleted from database');
		}
	});
}


exports.updateDevice = updateDevice;
exports.findDevices = findDevices;
exports.deleteUser = deleteUser;
exports.addUser = addUser;
exports.findUser = findUser;
exports.showUsers = showUsers;
exports.editDevices = editDevices;


//function creatUser(name, password, email) {
//  const encryptedPassword = passwordHash.generate(password);
//  const account = {username: name, password: encryptedPassword, email: email};
//  connection.query('INSERT INTO accounts SET ?', account, function (err,res) {
//    if (err) {
//       console.log(err);
//    }
//    console.log('Added ',account,' to users');
//  });
//}
