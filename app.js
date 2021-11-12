const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
require('dotenv/config');
const authJwt = require('./auxillary/jwt');
const errorHandler = require('./auxillary/error-handler');

// Cors
app.use(cors());
app.options('*', cors())

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(authJwt());
app.use(errorHandler);

// Routes
app.use(require('./routes/category.js'));
app.use(require('./routes/order.js'));
app.use(require('./routes/postcode.js'));
app.use(require('./routes/product.js'));
app.use(require('./routes/user.js'));

module.exports = app;