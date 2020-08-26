module.exports = [
  {
    name: 'consults-db',
    type: 'postgres',
    host: process.env.CONSULTS_DB_HOST,
    port: process.env.CONSULTS_DB_PORT,
    username: 'postgres',
    password: 'postgres',
    database: 'consults_local',
    migrations: ['dist/migration/consults/*.js'],
    cli: {
      migrationsDir: 'src/consults-service/database/migration',
    },
  },
  {
    name: 'doctors-db',
    type: 'postgres',
    host: process.env.DOCTORS_DB_HOST,
    port: process.env.DOCTORS_DB_PORT,
    username: 'postgres',
    password: 'postgres',
    database: 'doctors_local',
    migrations: ['dist/migration/doctors/*.js'],
    cli: {
      migrationsDir: 'src/doctors-service/database/migration',
    },
  },
  {
    name: 'profiles-db',
    type: 'postgres',
    host: process.env.PROFILES_DB_HOST,
    port: process.env.PROFILES_DB_PORT,
    username: 'postgres',
    password: 'postgres',
    database: 'profiles_local',
    migrations: ['dist/migration/profiles/*.js'],
    cli: {
      migrationsDir: 'src/profiles-service/database/migration',
    },
  },
];
