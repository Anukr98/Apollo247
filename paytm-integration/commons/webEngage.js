const AbortController = require('abort-controller');
const fetch = require('node-fetch');
const { format, addMinutes } = require('date-fns');
const logger = require('../winston-logger')('Universal-Error-Logs');

const webEngageTimeoutMillSeconds = Number(process.env.WEBENGAGE_TIMEOUT_IN_MILLISECONDS);




module.exports = {
  async postWebEngageEvent(uploadParams) {
    if (
      !process.env.WEB_ENGAGE_URL_API ||
      !process.env.WEB_ENGAGE_API_KEY ||
      !process.env.WEB_ENGAGE_LICENSE_CODE
    )
      throw new Error('INVALID_WEBENGAGE_URL');
    let apiUrl = process.env.WEB_ENGAGE_URL_API.toString();
    apiUrl = apiUrl.replace('{LICENSE_CODE}', process.env.WEB_ENGAGE_LICENSE_CODE);

    uploadParams.eventTime = format(addMinutes(new Date(), +330), "yyyy-MM-dd'T'HH:mm:ss'+0530'");

    const reqStartTime = new Date();
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, webEngageTimeoutMillSeconds);
    console.log('WEB ENGAGE HIT !!!')

    return await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.WEB_ENGAGE_API_KEY,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(uploadParams),
    })
      .then((res) => res.json())
      .then(
        (data) => {
          console.log('===>', data);
          logger.info(
            `${reqStartTime},
            'postWebEngageEvent POST_WEBENGAGE_API_CALL___END',
            ${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${JSON.stringify(data)}`
          );
          return data;
        },
        (err) => {
          console.log(`${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${JSON.stringify(err)}`);
          logger.error(
            `${reqStartTime},
            'postWebEngageEvent POST_WEBENGAGE_API_CALL___ERROR',
            ${apiUrl} --- ${JSON.stringify(uploadParams)} --- ${JSON.stringify(err)}`
          );
          if (err.name === 'AbortError') {
            throw new Error('NO_RESPONSE_FROM_WEBENGAGE');
          } else {
            throw new Error('ERROR_FROM_WEBENGAGE');
          }
        }
      )
      .finally(() => {
        clearTimeout(timeout);
      });
  }
}

