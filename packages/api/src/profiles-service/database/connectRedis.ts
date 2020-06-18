import { Tedis } from 'redis-typescript';

export const redis = new Tedis({
  port: 6379,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
});
