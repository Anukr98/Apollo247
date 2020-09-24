const redis = require('redis');
const { promisify } = require('util');
const logger = require('../winston-logger')('Universal-Error-Logs');

const client = redis.createClient({
  port: 6379,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retry_strategy: function (options) {
    if (options.error) {
      logger.error(
        `Redis connection error code: ${options.error.code} details: ${JSON.stringify(
          options.error
        )}`
      );
    }
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 3) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  },
});

const getAsync = promisify(client.get).bind(client);

module.exports = {
  async getCache(key) {
    try {
      const cache = await getAsync(key);
      if (cache && typeof cache === 'string')
        logger.info(`${new Date()} Redis Cache read Cache hit ${key}`);
      return cache;
    } catch (e) {
      logger.error(`${new Date()} Redis read write error Cache hit ${key} ${JSON.stringify(e)}`);
      return null;
    }
  },
};
