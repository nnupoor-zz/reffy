const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
const Account = require('../models/account.models.js');

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }  
  res.redirect('/');
}

exports.getAccountWebsite = (accId) => {
  return new Promise ((resolve, reject) => {
    Account.findById(accId)
    .then(data => { (data === null) ? reject('Not Found') : resolve(data); })
    .catch(err => { reject('Not Found'); });
  });
}

exports.create = (req, res) => {
  if(!req.body.email || !req.body.password || !req.body.website) {
    return res.status(400).send({message: "Enter complete data"});
  }
  Account.findOne({"local.email": req.body.email, "website": req.body.website})
    .then((acc) => {
      if (acc === null) {
        const account = new Account({
          email: req.body.email,
          password: req.body.password,
          website: req.body.website
        });
        account.save().then(data => res.send(data))
        .catch(err => res.status(500).send({message: "Some error occurred while creating the account."}));
      } else {
        res.send({message:'User already exists'});
      }
    })
    .catch(err => res.status(500).send({message: "Some error occurred"}));
}

exports.findAll = (req, res) => {
  // Account.find().then(account => res.send(account)).catch(err => res.status(500).send({message: "Some error occurred while retrieving notes."}));
  res.render(path.join(__dirname, '../views/index.view.ejs'));
}

exports.login = (req, res) => {
  res.render(path.join(__dirname, '../views/login.view.ejs'), { message: req.flash('loginMessage') }); 
}

exports.signup = (req, res) => {
  res.render(path.join(__dirname, '../views/signup.view.ejs'), { message: req.flash('signupMessage') });
}

exports.profile = (req, res) => {
  res.render(path.join(__dirname, '../views/profile.view.ejs'), {
    user : req.user // get the user out of session and pass to template
  });
}

exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
}

exports.forgot = (req, res) => {
  res.render(path.join(__dirname, '../views/forgot.view.ejs'), { user: req.user});
}

exports.forgotPwd = (req, res, next) => {
  const cryptoFn = () => { return new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buf) => {
      const token = buf.toString('hex');
      resolve(token);
    }); 
  })};
  const resetPwdToken = (token) => { return new Promise((resolve, reject) => {
    Account.findOne({ 'local.email': req.body.email }, (err, user) => {
      if (!user) {
        req.flash('error', 'No account with that email address exists.');
        return res.redirect('/forgot');
      }

      user.local.resetPasswordToken = token;
      user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      user.save((err) => {
        if (err) {
          err.type = "MONGO_SAVE";
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  })};
  const nodeMailerFn = (token, user) => { return new Promise((resolve, reject) => {
    const options = {
      auth: {
        api_user: 'nupoor.neha@gmail.com',
        api_key: 'AppleBanana123#',
      }
    };
    const client = nodemailer.createTransport(sgTransport(options));
    var mailOptions = {
      to: user.local.email,
      from: 'passwordreset@demo.com',
      subject: 'Node.js Password Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };
    client.sendMail(mailOptions, function(err) {
      req.flash('info', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
      if (err) {
        err.type = "SENDGRID";
        reject(err);
      } else {
        resolve();
      }
    }); 
  })};

  cryptoFn().then((token) => { 
    return resetPwdToken(token).then((user) => {
      return nodeMailerFn(token, user).then(() => {
        console.log('done');
      });
    });
  }).catch(err => {
    console.log(err.type, "=====", err);
    req.flash('error', 'Sendgrid error happened');
    return res.redirect('/forgot');
  });
}

exports.reset = (req, res) => {
  console.log(req.params.token);
  Account.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, (err, user) => {
    console.log(user);
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render(path.join(__dirname, '../views/reset.view.ejs'), {
      user: req.user
    });
  });
}

exports.resetPwd = (req, res) => {
  const getUser = () => { 
    return new Promise((resolve, reject) => {
      const findParams = { 
        'local.resetPasswordToken': req.params.token,
        'local.resetPasswordExpires': { $gt: Date.now() } 
      };
      Account.findOne(findParams, (err, user) => {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.local.password = user.generateHash(req.body.password);
        user.local.resetPasswordToken = undefined;
        user.local.resetPasswordExpires = undefined;
        user.save(err => {
          req.logIn(user, (err) => {
            if (err) {
              err.type = "USER_LOGIN"
              reject(err);
            } else {
              resolve(user);
            }
          });
        });
      });
    });
  };
  const sendConfirmationMail = (user) => {
    return new Promise((resolve, reject) => {
      const options = {
        auth: {
          api_user: 'nupoor.neha@gmail.com',
          api_key: 'AppleBanana123#',
        }
      };
      const client = nodemailer.createTransport(sgTransport(options));
      var mailOptions = {
        to: user.local.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
      };

      client.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        if (err) {
          err.type = "SENDGRID";
          reject(err);
        } else {
          resolve();
        }
      }); 
    });
  };

  getUser().then((user) => { 
    return sendConfirmationMail(user).then((user) => {
      res.redirect('/');
    });
  }).catch(err => {
    console.log(err.type, "=====", err);
    req.flash('error', 'Sendgrid error happened');
    return res.redirect('/forgot');
  });
}