import winston from 'winston';
import path from 'path';
import { ApiConstants } from 'ApiConstants';

export const logsUtility = {
  logger: function<M>(
    servicename: string,
    logdata: string,
    servicetype: string,
    reqStartTimeFormatted: string
  ) {
    //info log/error ----logsUtility.logger('ProfileService',{}/error(strig),info/error,time)
    const logsDirPath = <string>process.env.API_LOGS_DIRECTORY;
    const logsDir = path.resolve(logsDirPath);
    const filepath = '';

    if (servicename == 'ProfileService') {
      if (servicetype == 'info') {
        const filepath = ApiConstants.PROFILES_SERVICE_ACCESS_LOG_FILE;
      } else {
        const filepath = ApiConstants.PROFILES_SERVICE_ERROR_LOG_FILE;
      }
    } else if (servicename == 'doctorService') {
      if (servicetype == 'info') {
        const filepath = ApiConstants.DOCTORS_SERVICE_ACCESS_LOG_FILE;
      } else {
        const filepath = ApiConstants.DOCTORS_SERVICE_ERROR_LOG_FILE;
      }
    }
    winston.configure({
      transports: [
        new winston.transports.File({
          filename: logsDir + filepath,
          level: 'info',
        }),
        new winston.transports.File({
          filename: logsDir + filepath,
          level: 'error',
        }),
      ],
      exitOnError: false, // do not exit on handled exceptions
    });
    if (servicetype == 'info') {
      winston.log(JSON.parse(logdata));
    } else {
      winston.log('error', `Encountered Error at ${reqStartTimeFormatted}: `, logdata);
    }
    console.log(servicename, 'servicename', logdata, 'logdata');
  },
};
