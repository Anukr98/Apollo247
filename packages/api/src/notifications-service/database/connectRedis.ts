import { createClient } from 'redis';
import { debugLog } from 'customWinstonLogger';
import { promisify } from 'util';

const dLogger = debugLog(
  'profileServiceLogger',
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

const hgetAsync = promisify(client.hget).bind(client);

export async function hget(key: string, field: string): Promise<string> {
  try {
    const cache = await hgetAsync(key, field);
    dLogger(new Date(), 'Redis Cache read hash', `Cache hit ${key}`);
    return cache;
  } catch (e) {
    dLogger(new Date(), 'Redis read hash error', `Cache hit ${key} ${JSON.stringify(e)}`);
    return '';
  }
}
