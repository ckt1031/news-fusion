import RssFeedChecks from '../models/RssFeedChecks';
import logger from './logger';

export default async function shirkDatabase() {
  // Delete data which the field lastChecked (in ms) is older than 24 hours.
  const deleteOlderThan = Date.now() - 1000 * 60 * 60 * 24;

  await RssFeedChecks.deleteMany({
    lastChecked: {
      $lt: deleteOlderThan,
    },
  });

  logger.info('Shirk database (RSS feed checks)');
}
