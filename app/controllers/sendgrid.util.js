const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');

/**
 * Data object format: 
 * {
 *  toEmail: 
 *  fromEmail:
 *  subject:
 *  text:
 * }
 * @param {*} data 
 */
const options = {
  auth: {
    api_user: 'nupoor.neha@gmail.com',
    api_key: 'AppleBanana123#',
  }
};
const sendConfirmationMail = (data) => {
  return new Promise((resolve, reject) => {
    
    const client = nodemailer.createTransport(sgTransport(options));
    var mailOptions = {
      to: data.toEmail,
      from: data.fromEmail, //'referalGenerator@demo.com',
      subject: data.subject, //'Your referral code is generated',
      text: data.text,
    };

    client.sendMail(mailOptions, function(err) {
      // req.flash('success', 'Success! Your password has been changed.');
      if (err) {
        console.log('||||||||||||||||||',err);
        err.type = "SENDGRID";
        reject(err);
      } else {
        resolve('true');
      }
    }); 
  });
};

exports.sendMail = sendConfirmationMail;

const forgotPwdMail = (data) => {
  return new Promise((resolve, reject) => {
    const options = {
      auth: {
        api_user: 'nupoor.neha@gmail.com',
        api_key: 'A*********a123#',
      }
    };
    const client = nodemailer.createTransport(sgTransport(options));
    var mailOptions = {
      to: data.toEmail,
      from: data.fromEmail,
      subject: data.subject,
      text: data.text
    };
    client.sendMail(mailOptions, function(err) {
      // req.flash('info', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
      if (err) {
        err.type = "SENDGRID";
        reject(err);
      } else {
        resolve(true);
      }
    }); 
  })
}

exports.forgotPwd = forgotPwdMail;
