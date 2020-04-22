const winston = require('winston');
const config = require('config');
const { Loggly } = require('winston-loggly-bulk');

const enumerateErrorFormat = winston.format(info => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const transports = [
  new winston.transports.Console({
    stderrLevels: ['error'],
  })
];

if (config.get('NODE_ENV') === 'production') {
  transports.push(
    new Loggly({
      token: config.get('LOGGY_TOKEN'),
      subdomain: config.get('LOGGY_SUBDOMAIN'),
      tags: ["Winston-NodeJS"],
      json: true
    })
  );
}

const logger = winston.createLogger({
  level: config.get('NODE_ENV') === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.get('NODE_ENV') === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: transports,
});

module.exports = logger;
