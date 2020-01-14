import winston, { format as winstonFormat } from 'winston';
import path from 'path';
import { ApiConstants } from 'ApiConstants';
import { format } from 'date-fns';

const { combine, timestamp, label } = winstonFormat;
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

//sms-api logger
winston.loggers.add('smsOtpAPILogger', {
  format: combine(label({ label: 'smsOtpAPILogger' }), timestamp(), winstonFormat.json()),
  transports: [
    new winston.transports.File({
      filename: logsDir + ApiConstants.KALEYRA_OPT_API_LOG_FILE,
      level: 'info',
    }),
    new winston.transports.File({
      filename: logsDir + ApiConstants.KALEYRA_OPT_API_LOG_FILE,
      level: 'error',
    }),
  ],
});

//doctor-search-filter-api logger
winston.loggers.add('doctorSearchAPILogger', {
  format: combine(label({ label: 'doctorSearchAPILogger' }), timestamp(), winstonFormat.json()),
  transports: [
    new winston.transports.File({
      filename: logsDir + ApiConstants.DOCTORS_SEARCH_API_LOG_FILE,
      level: 'info',
    }),
    new winston.transports.File({
      filename: logsDir + ApiConstants.DOCTORS_SEARCH_API_LOG_FILE,
      level: 'error',
    }),
  ],
});

export const winstonLogger = winston;

export const log = (
  loggerName: string,
  message: string,
  path: string,
  response: string,
  error: string
) => {
  const logger = winstonLogger.loggers.get(loggerName);
  const logMessage = {
    level: error === '' ? 'info' : 'error',
    message,
    path,
    time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
    response: response,
    error: error,
  };
  logger.log(logMessage);
};

export const debugLog = (loggerName: string, message: string, path: string) => {
  const logger = winstonLogger.loggers.get(loggerName);
  const logMessage = {
    level: 'info',
    message,
    time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
    path,
  };
  logger.log(logMessage);
};
