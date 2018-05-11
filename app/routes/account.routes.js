module.exports = (app, passport) => {
  const account = require('../controllers/account.controller.js');
  // Create a new Note
  app.post('/account/create', app.authenticate,  account.create);
  app.get('/account', account.findAll);

  app.get('/login', account.login);
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/signup', account.signup);
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/profile', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

  app.get('/profile', app.authenticate,  account.profile);
  
  app.get('/logout',  account.logout);  
  // reset pwd
  // passport
  app.get('/forgot',  account.forgot);
  app.post('/forgot',  account.forgotPwd);

  app.get('/reset/:token',  account.reset);
  app.post('/reset/:token', account.resetPwd);
}