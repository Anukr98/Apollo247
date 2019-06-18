import { Sequelize, Dialect } from 'sequelize';
import config from 'services/doctors/config/config.json';
import { Doctor } from 'services/doctors/models/doctor';

const NODE_ENV: 'development' | 'test' | 'production' = (process as any).env.NODE_ENV;
const { database, username, password, dialect, host } = config[NODE_ENV];

const sequelize = new Sequelize(database, username, password, {
  dialect: dialect as Dialect,
  host,
});

export const models = {
  Doctor: Doctor(sequelize),
};
