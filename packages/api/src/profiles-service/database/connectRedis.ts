import { Tedis } from 'redis-typescript';

export const redis = new Tedis({
  port: 6379,
  host: 'apollodev.redis.cache.windows.net',
  password: 'FgFyZpibcBewC6U7AZYDq1DppMW02mi+koiEa63gDF4=',
});
