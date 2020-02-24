const connection = require('../database');
const passwordHash = require('password-hash');

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