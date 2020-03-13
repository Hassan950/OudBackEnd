const nodemailer = require('nodemailer');
const config = require('config');

const sendEmail = async (options) => {
  // create a transporter
  const transporter = nodemailer.createTransport({
    host: config.get('EMAIL_HOST'),
    port: config.get('EMAIL_PORT'),
    auth: {
      user: config.get('EMAIL_USERNAME'),
      pass: config.get('EMAIL_PASSWORD')
    }
  });
  // define the email options
  const mailOptions = {
    from: 'Oud oud@comp.io',
    to: options.email,
    subject: options.subject,
    text: options.message
  }
  // send the email
  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail
};