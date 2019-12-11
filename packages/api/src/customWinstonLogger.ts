import winston from 'winston';
import path from 'path';
import { createLogger, format as winstonFormat, transports } from 'winston';
const { combine, timestamp, label, printf } = winstonFormat;
import { ApiConstants } from 'ApiConstants';

const logsDirPath = <string>process.env.API_LOGS_DIRECTORY;
const logsDir = path.resolve(logsDirPath);

//profiles-service loggers
winston.loggers.add('profileServiceLogger', {
  format: combine(label({ label: 'profileServiceLogger' }), timestamp(), winstonFormat.json()),
  transports: [
    new winston.transports.File({
      filename: logsDir + ApiConstants.PROFILES_SERVICE_ACCESS_LOG_FILE,
      level: 'info',
    }),
    new winston.transports.File({
      filename: logsDir + ApiConstants.PROFILES_SERVICE_ERROR_LOG_FILE,
      level: 'error',
    }),
  ],
});

//doctors-service loggers
winston.loggers.add('doctorServiceLogger', {
  format: combine(label({ label: 'doctorServiceLogger' }), timestamp(), winstonFormat.json()),
  transports: [
    new winston.transports.File({
      filename: logsDir + ApiConstants.DOCTORS_SERVICE_ACCESS_LOG_FILE,
      level: 'info',
    }),
    new winston.transports.File({
      filename: logsDir + ApiConstants.DOCTORS_SERVICE_ERROR_LOG_FILE,
      level: 'error',
    }),
  ],
});

//consults-service loggers
winston.loggers.add('consultServiceLogger', {
  format: combine(label({ label: 'consultServiceLogger' }), timestamp(), winstonFormat.json()),
  transports: [
    new winston.transports.File({
      filename: logsDir + ApiConstants.CONSULTS_SERVICE_ACCESS_LOG_FILE,
      level: 'info',
    }),
    new winston.transports.File({
      filename: logsDir + ApiConstants.CONSULTS_SERVICE_ERROR_LOG_FILE,
      level: 'error',
    }),
  ],
});

//notifications-service loggers
winston.loggers.add('notificationServiceLogger', {
  format: combine(label({ label: 'notificationServiceLogger' }), timestamp(), winstonFormat.json()),
  transports: [
    new winston.transports.File({
      filename: logsDir + ApiConstants.NOTIFICATIONS_SERVICE_ACCESS_LOG_FILE,
      level: 'info',
    }),
    new winston.transports.File({
      filename: logsDir + ApiConstants.NOTIFICATIONS_SERVICE_ERROR_LOG_FILE,
      level: 'error',
    }),
  ],
});

export default winston;
