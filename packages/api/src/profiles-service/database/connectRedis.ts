import { TedisPool } from 'tedis';

export const pool = new TedisPool({
  port: 6379,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
  max_conn: 50,
  min_conn: 5,
});
