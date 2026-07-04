// src/app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { NODE_ENV, COOKIE_SECRET } = require('./config/env');
const { morganLogger } = require('./sheared/utils/logger');
const rootRouter = require('./index.route');
const { errorMiddleware, notFoundMiddleware } = require('./sheared/middleware/error.middleware');

const app = express();

app.use(morganLogger);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(COOKIE_SECRET));

app.use(cors({
  origin: NODE_ENV === 'production' ? false : true,
  credentials: true,
}));

app.use('/api/v1', rootRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;