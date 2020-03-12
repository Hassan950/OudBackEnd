const emailService = require('../../../src/services/mail.services.js');

emailService.sendEmail = jest.fn().mockImplementation((Options) => {
  return new Promise((resolve, reject) => {
    resolve(Options);
  })
});


module.exports = emailService;