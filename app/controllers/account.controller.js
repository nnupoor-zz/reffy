const path = require('path');

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
  Account.findOne({"email": req.body.email, "website": req.body.website})
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