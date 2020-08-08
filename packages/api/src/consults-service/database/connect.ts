import '@aph/universal/dist/global';
import 'reflect-metadata';
import { Appointment } from 'consults-service/entities/Appointment';
import { createConnections } from 'typeorm';
export const connect = async () => {
  try {
    createConnections(
      [
        {
          "name": 'consult-db',
          "entities": [Appointment],
          "type": 'postgres',
          "migrationsRun": true,
          "host": process.env.CONSULTS_DB_HOST,
          "port": parseInt(process.env.CONSULTS_DB_PORT, 10),
          "username": process.env.CONSULTS_DB_USER,
          "password": process.env.CONSULTS_DB_PASSWORD,
          "database": `consults_${process.env.DB_NODE_ENV}`,
          "logging": process.env.NODE_ENV === 'production' ? false : true,
          "synchronize": false,

          "migrations": ["dist/db/migrations/**/*.js"],

          "extra": {
            "connectionLimit": process.env.CONNECTION_POOL_LIMIT,
          },
          "cli": {
            "migrationsDir": "src/consults-service/database/migrations"
          }
        },
        {
          "name": 'doctors-db',
          "entities": [],
          "type": 'postgres',
          "host": process.env.DOCTORS_DB_HOST,
          "port": parseInt(process.env.DOCTORS_DB_PORT, 10),
          "username": process.env.DOCTORS_DB_USER,
          "password": process.env.DOCTORS_DB_PASSWORD,
          "database": `doctors_${process.env.DB_NODE_ENV}`,
          "logging": process.env.NODE_ENV === 'production' ? false : true,
          "extra": {
            "connectionLimit": process.env.CONNECTION_POOL_LIMIT,
          },
        },
        {
          "name": 'patients-db',
          "entities": [],
          "type": 'postgres',
          "host": process.env.PROFILES_DB_HOST,
          "port": parseInt(process.env.PROFILES_DB_PORT, 10),
          "username": process.env.PROFILES_DB_USER,
          "password": process.env.PROFILES_DB_PASSWORD,
          "database": `profiles_${process.env.DB_NODE_ENV}`,
          "logging": process.env.NODE_ENV === 'production' ? false : true,
          "extra": {
            "connectionLimit": process.env.CONNECTION_POOL_LIMIT,
          },
        }]
    )
      .then(res => {
        console.log('db connection established');
      })
      .catch(err => {
        console.log('connection error', err)
      })
  } catch (error) {
    console.log('connection error', error)
  }
};
