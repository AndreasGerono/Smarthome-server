const mailer = require('nodemailer');

const transporter = mailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'andreas.gerono@gmail.com',
		pass: 'Onoreg2274'
	}
});

module.exports = (req,res) => {
	
	const mailOptions = {
		from: 'andreas.gerono@gmail.com',
		to: 'andreas.gerono@gmail.com',
		subject: 'Message from: '+req.body.email,
		text: req.body.name+'\n'+req.body.message
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error);
		}
		else {
			console.log(info);
		}
	});
	res.redirect('/contact');
};


