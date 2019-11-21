import winston from 'winston';
import path from 'path';
import { ApiConstants } from 'ApiConstants';

export const logsUtility = {
  logger: function<M>(servicename: string, logdata: string) {
    const logsDirPath = <string>process.env.API_LOGS_DIRECTORY;
    const logsDir = path.resolve(logsDirPath);
    winston.configure({
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
      exitOnError: false, // do not exit on handled exceptions
    });

    console.log(servicename, 'servicename', logdata, 'logdata');
  },
};
