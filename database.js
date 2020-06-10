const mysql = require('mysql');
const passwordHash = require('password-hash');

settings = {
	host: 'localhost',
	user: 'node1',
	password: 'windows1234',
	database: 'smarthome'
}


connection = mysql.createConnection(settings);

connection.connect(err => {
	if (err) {
		throw err;
	}
	console.log('Connected to database!');
});

function addUser(username, password) {
	const hashPassword = passwordHash.generate(password);
	const user = {user_name: username, user_password: hashPassword};
	connection.query('INSERT INTO users SET ?', user, function (err,res) {
		if (err) {
			console.log(err);
		}
		else {
			console.log(`Added  ${username} to users`);
			return true;
		}
	});
}



function deleteUser(id) {
	connection.query('DELETE FROM users WHERE user_id = ?', [id], err =>{
		if (err) {
			console.log(err);
		}
		else {
			console.log(`User ${id} deleted from database`);
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

function findUsers(callback) {
	connection.query('SELECT * FROM users', (err,rows) =>{
		if (err) {
			console.log(err);
		}
		else {
			callback(rows);
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
	connection.query('SELECT * FROM devices WHERE device_id%10 > 2', (err,rows) =>{
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
			let values = {device_id: id};
			connection.query('INSERT INTO devices SET ?', [values], (err, res)=>{
					if (err) {
						console.log(err);
					}
					else {
						console.log(`Added ${id} to devices`);
					}
				});
		}
		else {
			console.log('Device alredy exists!');
		}
	});
}


function deleteDevice(id) {	//Removes all peripherals from one device
	id = parseInt(Math.floor(id/10));
	connection.query('DELETE FROM devices WHERE FLOOR(device_id/10) = ?', [id], err=>{
		if (err) {
			console.log(err);
		}
		else {
			console.log(`Device ${id} deleted from database`);
		}
	});
}


function changeDeviceValue(value, id) {
	connection.query('UPDATE devices SET device_value = ? WHERE device_id = ?', [value, id], (err,res)=>{
		if (err) {
			console.log(err);
		}
		else {
			console.log(`Changed device: ${id}`);
		}
	})
}


function changeDeviceName(name, id) {
	connection.query('UPDATE devices SET device_name = ? WHERE device_id = ?', [name, id], (err,res)=>{
		if (err) {
			console.log(err);
		}
		else {
			console.log(`Changed device: ${id}`);
		}
	})
}

function getDeviceValue(id) {
	return new Promise( (resolve, reject) => {
		findDevice(id, device => {
			if (device[0]) {
				resolve(device[0].device_value);
			}
			else {
				reject("Device not found!!");
			}
		});
	});
}


function activateModule(code) {	//Activates all devices from one module
	connection.query('UPDATE devices SET device_is_active = ? WHERE FLOOR(device_id) = ?', [true, code], (err,res)=>{
		if (err) {
			console.log(err);
		}
		else {
			console.log(`Module ${code} activated`);
		}
	})
}


function deactivateModule(code) { //deactivates all devices from one module
	connection.query('UPDATE devices SET device_is_active = ? WHERE FLOOR(device_id) = ?', [false, code], (err,res)=>{
		if (err) {
			console.log(err);
		}
		else {
			console.log(`Module ${code} deactivated`);
		}
	});
}


function resetModuleValues(code) {
	connection.query('UPDATE devices SET device_value = ? WHERE FLOOR(device_id) = ?', [0, code], (err,res)=>{
		if (err) {
			console.log(err);
		}
		else {
			console.log(`Module ${code} reset`);
		}
	});
}


function addUserDevice(user_id, device_id) {
	let user_device = {device_id: device_id, user_id: user_id};
	connection.query('INSERT INTO user_device SET?', user_device, (err, res) => {
		if (err){
			console.log(err)
		}
		else{
			console.log(`Added device ${device_id} to user ${user_id}`)	
		}
	});
}


function deleteUserDevice(user_id, device_id) {		
	connection.query('DELETE FROM user_device WHERE device_id = ? AND user_id = ?', [device_id, user_id], (err, res) => {
		if (err){
			console.log(err)
		}
		else{
			console.log(`Removed device ${device_id} from user ${user_id}`)	
		}
	});
}


function findUserDevices(username, callback) {
	findUser(username, result => { 
		if (result.length > 0) {
			connection.query('select * from devices d inner join user_device uc on d.device_id = uc.device_id Where user_id = ?', [result[0].user_id], (err, rows) => {
				if (err){
					console.log(err)
				}
				else{
					callback(rows)	
				}
			});
		}
	});
}

function findUserSensors(username, callback) {
	findUser(username, result => { 
		if (result.length > 0) {
			connection.query('select * from devices d inner join user_device uc on d.device_id = uc.device_id Where user_id = ?', [result[0].user_id], (err, rows) => {
				if (err){
					console.log(err)
				}
				else{
					
					let sensors = [];
					for (row of rows) {
						if (row.device_id%10 > 2){
							sensors.push(row);
						}
					}
					callback(sensors);
				}
			});
		}
	});
}

function usersDevices(callback) {
	connection.query('SELECT * FROM user_device', (err,rows) =>{
		if (err) {
			console.log(err);
		}
		else {
			callback(rows);
		}
	});
}



findDevices(devices => {
	console.log(devices);
});




exports.getDeviceValue = getDeviceValue;

exports.activateModule = activateModule;
exports.deactivateModule = deactivateModule;
exports.resetModuleValues = resetModuleValues;

exports.findDevices = findDevices;
exports.deleteDevice = deleteDevice;
exports.deleteUser = deleteUser;
exports.addUser = addUser;
exports.addDevice = addDevice;
exports.findUser = findUser;
exports.findUsers = findUsers;
exports.showUsers = showUsers;
exports.findSensors = findSensors;
exports.changeDeviceName = changeDeviceName;
exports.changeDeviceValue = changeDeviceValue;

exports.usersDevices = usersDevices;
exports.addUserDevice = addUserDevice;
exports.deleteUserDevice = deleteUserDevice;
exports.findUserDevices = findUserDevices;
exports.findUserSensors = findUserSensors;
