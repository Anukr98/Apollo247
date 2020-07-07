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
    return await getAsync(key);
  } catch (e) {
    dLogger(new Date(), 'Redis read write error', `Cache hit ${key} ${JSON.stringify(e)}`);
    return null;
  }
}

export async function setCache(key: string, value: string, expiry: number) {
  try {
    const set = client.set(key, value);
    client.expire(key, expiry);
    dLogger(new Date(), 'Redis Cache write', `Cache hit ${key}`);
    return set;
  } catch (e) {
    dLogger(new Date(), 'Redis Cache write error', `Cache hit ${key} ${JSON.stringify(e)}`);
    return false;
  }
}

export async function delCache(key: string) {
  try {
    const del = client.del(key);
    dLogger(new Date(), 'Redis Cache delete', `Cache hit ${key}`);
    return del;
  } catch (e) {
    dLogger(new Date(), 'Redis Cache del error', `Cache hit ${key} ${JSON.stringify(e)}`);
    return false;
  }
}
