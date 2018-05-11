const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dbConfig = require('./config/database.config.js');
const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url);

mongoose.connection.on('error', ()=>{
  console.log('Couldnot connect to database. Exiting now...');
  process.exit();
});

mongoose.connection.once('open', ()=>{
  console.log("Successfully connected to the database");
});

app.authenticate = (req, res, next) => {
  if(req.user){
    next();
  }else{
    res.redirect('/login');  
  }
}

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs'); 
app.use(session({
  secret: 'iamtryingreallyhardagainstmyinstincts', 
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/routes/account.routes.js')(app, passport);
require('./app/routes/note.routes.js')(app);
require('./config/passport.config.js')(passport);

app.get('/', app.authenticate, function(req, res){
  console.log(req.user)
  res.redirect('/profile');
});



app.listen(4000, function(){
  console.log("Server is listening on port 4000");
});
