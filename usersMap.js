var map = new Map();

function storeUser(user_cookie, user_name) {
	map.set(user_cookie, user_name);
	console.log(map);
}

function getUser(user_cookie) {
	return map.get(user_cookie);
}

function removeUser(user_cookie) {
	map.delete(user_cookie);
}

exports.getUser = getUser;
exports.storeUser = storeUser;
exports.removeUser = removeUser;
