const connection = require('../database');
const passwordHash = require('password-hash');
const usersMap = require('../usersMap');


module.exports = (req,res) => {
  
  const username = req.body.username;  
  const password = req.body.password;
  
  connection.findUser(username, result => {
    
    if (result.length>0) {
      if (passwordHash.verify(password,result[0].user_password)) {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect('/home');
        res.end();
        console.log(username+' logged in!')
        usersMap.storeUser(req.headers.cookie, username);
      }
      else {
        res.redirect('/home/incorrect');
        res.end();
      }
    }
    else {
      res.redirect('/home/incorrect');
      res.end();
    }
  });
}