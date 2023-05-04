import * as Sentry from '@sentry/node';
import mongoose from 'mongoose';

import './validate-env';
import './web';

import { client } from './bot';
import { isDevelopment } from './constants';
import logging from './utils/logger';
import logger from './utils/logger';

// Handle uncaught errors
function captureUnhandledRejections(err: Error) {
  logging.error(err);
  Sentry.captureException(err);
}

process.on('uncaughtException', captureUnhandledRejections);
process.on('unhandledRejection', captureUnhandledRejections);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: !isDevelopment,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1,
});

await mongoose.connect(`${process.env.MONGODB_URL}CktsunHelperDiscordBot`, {
  autoIndex: false,
});

// When the process exits, close the connection to the database
async function handleExit() {
  await mongoose.connection.close();
  client.destroy();
  logger.info('Node.js Server is shutting down...');
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
process.on('SIGUSR2', handleExit);
process.on('exit', handleExit);
