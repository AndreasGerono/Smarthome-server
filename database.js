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

function findSensors(callback) {
	connection.query('SELECT * FROM devices WHERE device_id%10 >= 2', (err,rows) =>{
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


function changeDeviceValue(value, id) {
	connection.query('UPDATE devices SET device_value = ? WHERE device_id = ?', [value, id], (err,res)=>{
		if (err) {
			console.log(err);
		}
		else {
			console.log('Changed device:', id);
		}
	})
	
}
function changeDeviceName(name, id) {
	connection.query('UPDATE devices SET device_name = ? WHERE device_id = ?', [name, id], (err,res)=>{
		if (err) {
			console.log(err);
		}
		else {
			console.log('Changed device:', id);
		}
	})
}


findDevices(device => {
	console.log(device);
})

exports.findDevices = findDevices;
exports.deleteDevice = deleteDevice;
exports.deleteUser = deleteUser;
exports.addUser = addUser;
exports.addDevice = addDevice;
exports.findUser = findUser;
exports.showUsers = showUsers;
exports.findSensors = findSensors;
exports.changeDeviceName = changeDeviceName;
exports.changeDeviceValue = changeDeviceValue;


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

