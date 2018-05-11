const Note = require('../models/note.models.js');
const accController = require('./account.controller.js');
const sendGridUtils = require('./sendgrid.util.js');

exports.create = (req, res) => {
  console.log('reqBody: ',req.body, 'reqHeaders: ',req.headers, req.get('origin'));
  if (!req.body.email || !req.body.key) {
    return res.status(400).send({message: "Form can not be empty"});
  }
  //Confirm if the website on they accountId is same as this website.
  accController.getAccountWebsite(req.body.key)
  .then(accData => {
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
                const resObj = {
                  msg: 'Referral code generated',
                  refcode,
                  // _id,
                  // email,
                  // referreer,
                  // createdAt,
                }
                res.send(resObj);
                return data;
              })
              .then((data) => {
                const refcode = `${accData.website}/?referral=${data._id}`;
                const msgObj = {
                  toEmail: req.body.email,
                  fromEmail: 'referalGenerator@demo.com',
                  subject: 'Your referral code is generated',
                  text: `Hello,
                         Below is your referral code.
                         ${refcode}`,
                };
                sendGridUtils.sendMail(msgObj)
                  .then(res => console.log('sent mail: ',res))
                  .catch(res => console.log('failed mail', res))
              }) 
              .catch((err) => {
                res.status(500).send({message: "Some error occurred while creating the account."});
              });
          } else {
            const refcode = `${accData.website}/?referral=${user._id}`; 
            const msgObj = {
              toEmail: req.body.email,
              fromEmail: 'referalGenerator@demo.com',
              subject: 'Your referral code is generated',
              text: `Hello,
                     Below is your referral code.
                     ${refcode}`,
            };
            res.send({msg:'User already has referral code', refcode: refcode});
            sendGridUtils.sendMail(msgObj)
              .then(res => console.log('sent mail: ',res))
              .catch(res => console.log('failed mail', res));
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