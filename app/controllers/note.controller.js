const Note = require('../models/note.models.js');
const accController = require('./account.controller.js');
const _ID = "5ac853250e3ad813c3e8d1ef";
const nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

exports.create = (req, res) => {
  console.log('reqBody: ',req.body, 'reqHeaders: ',req.headers, req.get('origin'));
  if (!req.body.email || !req.body.key) {
    return res.status(400).send({message: "Form can not be empty"});
  }
  //Confirm if the website on they accountId is same as this website.
  accController.getAccountWebsite(req.body.key)
  .then(accData => {
    console.log('++++++ data:',accData, '+++++++++') 
    const origin = 'test.com'; //req.get('origin');
    if (accData.website === origin) {
      Note.findOne({"email": req.body.email, "account_id": req.body.key})
      .then((user) => {
          if (user === null) {
            const note = new Note({
              email: req.body.email,
              referreer: req.body.referredBy || null,
              account_id: req.body.key,
              refcode: req.body.refcode || null
            });
            note.save()
              .then((data)=>{
                // create referral code by matching website from account along with _id;
                const refcode = `${accData.website}/?referral=${data._id}`; 
                data.refcode = refcode;
                res.send(data);
                return data;
              })
              .then((data) => {
                const sendConfirmationMail = (user) => {
                  return new Promise((resolve, reject) => {
                    const options = {
                      auth: {
                        api_user: 'nupoor.neha@gmail.com',
                        api_key: 'AppleBanana123#',
                      }
                    };
                    const client = nodemailer.createTransport(sgTransport(options));
                    const refcode = `${accData.website}/?referral=${data._id}`;
                    var mailOptions = {
                      to: req.body.email,
                      from: 'referalGenerator@demo.com',
                      subject: 'Your referral code is generated',
                      text: 'Hello,\n\n' +
                        'Below is your referral code.\n' +
                        refcode
                    };
              
                    client.sendMail(mailOptions, function(err) {
                      // req.flash('success', 'Success! Your password has been changed.');
                      if (err) {
                        err.type = "SENDGRID";
                        reject(err);
                      } else {
                        resolve();
                      }
                    }); 
                  });
                };
                sendConfirmationMail(user)
              }) 
              .catch((err) => {
                res.status(500).send({message: "Some error occurred while creating the account."});
              });
          } else {
            const refcode = `${accData.website}/?referral=${user._id}`; 
            res.send({message:'User already has referral code', code: refcode});
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
                  to: req.body.email,
                  from: 'referalGenerator@demo.com',
                  subject: 'You asked for your referral code.',
                  text: 'Hello,\n\n' +
                    'Below is your already generated referral code.\n' +
                    refcode
                };
          
                client.sendMail(mailOptions, function(err) {
                  // req.flash('success', 'Success! Your password has been changed.');
                  if (err) {
                    err.type = "SENDGRID";
                    reject(err);
                  } else {
                    resolve();
                  }
                }); 
              });
            };
            sendConfirmationMail(user)
          }
      })
      .catch((err) => {
        res.status(500).send({message: "Some error occurred."});
      });
    } else {
      res.status(400).send({message: "Incorrect origin for this key"});
    }
  })
  .catch(err => {
    res.status(400).send({message: "No account found"});
  });
}

exports.findAll = (req, res) => {
  Note.find().then(notes => res.send(notes)).catch(err => es.status(500).send({message: "Some error occurred while retrieving users."}));
}

exports.findOne = (req, res) => {
  
}

exports.update = (req, res) => {
  
}

exports.delete = (req, res) => {
  
}