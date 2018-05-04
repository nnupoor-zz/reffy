const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');

const AccountSchema = mongoose.Schema({
	local: {
    email: String,
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  facebook: {
    id: String,
    token: String,
    name: String,
    email: String
  },
  twitter: {
    id: String,
    token: String,
    displayName: String,
    username: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  website: String
}, {
	timestamps: true
}); 

AccountSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
AccountSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('Account', AccountSchema);
