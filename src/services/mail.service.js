const config = require('config');

const sendEmail = async (options) => {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(config.get('SENDGRID_API_KEY'));
  const msg = {
    to: options.email,
    from: 'support@oud-zerobase.me',
    subject: options.subject,
    text: options.message,
    html: '<strong>السلام علي من أتبع الهدي</strong>',
  }

  await sgMail.send(msg);
};

module.exports = {
  sendEmail
};