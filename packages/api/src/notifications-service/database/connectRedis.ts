import { createClient } from 'redis';
import { debugLog } from 'customWinstonLogger';
import { promisify } from 'util';

const dLogger = debugLog(
  'NotificationServiceLogger',
  'RedisConnect',
  Math.floor(Math.random() * 100000000)
);
const client = createClient({
  port: 6379,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retry_strategy: function(options) {
    if (options.error) {
      dLogger(
        new Date(),
        'Redis Connection error',
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

export async function getCache(key: string) {
  try {
    const cache = await getAsync(key);
    if (cache && typeof cache === 'string')
      dLogger(new Date(), 'Redis Cache read', `Cache hit ${key}`);
    return cache;
  } catch (e) {
    dLogger(new Date(), 'Redis read write error', `Cache hit ${key} ${JSON.stringify(e)}`);
    return null;
  }
}
