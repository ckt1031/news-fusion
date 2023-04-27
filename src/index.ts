import * as Sentry from '@sentry/node';
import mongoose from 'mongoose';

import './validate-env';
import './bot';
import './web';

import logging from './utils/logger';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1,
});

void mongoose.connect(`${process.env.MONGODB_URL}CktsunHelperDiscordBot`, {
  autoIndex: false,
});

process.on('uncaughtException', err => {
  logging.error(err);
  Sentry.captureException(err);
});
process.on('unhandledRejection', err => {
  logging.error(err);
  Sentry.captureException(err);
});
