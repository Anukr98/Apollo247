import { TedisPool } from 'redis-typescript';

export const pool = new TedisPool({
  port: 6379,
  host: process.env.REDIS_HOST!.toString(),
  password: process.env.REDIS_PASSWORD!.toString(),
});
