const winston = require('winston');
const winston_rotate = require('winston-daily-rotate-file');
const { format } = winston;
const { combine, timestamp, label, printf } = format;


/**
 * Defined format of logging
 */
const myFormat = printf(({ level, message, label, timestamp }) => {
    if (typeof message === 'object') {
        message = JSON.stringify(message);
    }
    return `${timestamp} [${label}] ${level}: ${message}`;
});

/**
 * Method returns array of possible transports for winston
 * @param {String} filename 
 */
const getTransports = (filename) => {
    const transports = [
        new winston_rotate({
            filename: `./logs/info/${filename}-%DATE%.log`,
            datePattern: 'DD-MM-YYYY',
            level: "info"
        }),

        new winston_rotate({
            filename: `./logs/error/${filename}-%DATE%.log`,
            datePattern: 'DD-MM-YYYY',
            level: "error"
        }),

        new winston_rotate({
            filename: `./logs/debug/${filename}-%DATE%.log`,
            datePattern: 'DD-MM-YYYY',
            level: "debug"
        })
    ]
    if (process.env.NODE_ENV != 'production') {
        transports.push(new winston.transports.Console({
            format: winston.format.simple()
        }));
    }
    return transports;
}

/**
 * Added loggers here for different entities
 */
winston.loggers.add('Pharmacy-logs', {
    format: combine(
        label({ label: 'Pharmacy' }),
        timestamp(),
        myFormat,
    ),
    transports: getTransports('pharmacy')
});

winston.loggers.add('Consults-logs', {
    format: combine(
        label({ label: 'Consults' }),
        timestamp(),
        myFormat,
    ),
    transports: getTransports('consults')
});

winston.loggers.add('Universal-Error-Logs', {
    format: combine(
        label({ label: 'Universal' }),
        timestamp(),
        myFormat,
    ),
    transports: getTransports('universal')
})

module.exports = (logger) => {
    return winston.loggers.get(logger);
}