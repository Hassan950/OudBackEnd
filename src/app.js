const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const httpStatus = require('http-status');
const AppError = require('./utils/AppError');
const { errorConverter, errorHandler } = require('./middlewares/error');
const { authLimiter } = require('./middlewares/rateLimiter');
const config = require('config');
const morgan = require('./config/morgan');
const routes = require('./routes/v1');

const app = express();

// logger format
if (config.get('NODE_ENV') !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(
  express.urlencoded({
    extended: true
  })
);

// set uploads folder as static
const path = require('path');
app.use('/api/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
const corsOptions = {
  exposedHeaders: ['x-auth-token'],
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));
// app.options('*', cors());

// limit repeated failed requests to auth endpoints
if (config.get('NODE_ENV') === 'production') {
  app.use('/api/v1/auth', authLimiter);
  app.use('/api/v1/users/login', authLimiter);
}

// v1 api routes
app.use('/api/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new AppError('Not found', httpStatus.NOT_FOUND));
});

// convert error to AppError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
