const axios = require('axios');
const logger = require('../../winston-logger')('Consults-logs');
const { verifychecksum } = require('../../paytm/lib/checksum');
const { consultsOrderQuery } = require('../helpers/make-graphql-query');
const { CONSULT_RESPONSE_DELAY } = require('../../Constants');

module.exports = async (req, res, next) => {
  let orderId;
  let transactionStatus = '';
  let bookingSource = 'MOBILE';
  try {
    const payload = req.body;
    orderId = payload.ORDERID;
    logger.info(`${orderId} - Payload received - ${JSON.stringify(payload)}`);
    const checksum = payload.CHECKSUMHASH;
    delete payload.CHECKSUMHASH;
    let merchantKey = process.env.PAYTM_MERCHANT_KEY_CONSULTS;
    if (payload.MID == process.env.SBI_MID_CONSULTS)
      merchantKey = process.env.SBI_PAYTM_MERCHANT_KEY_CONSULTS;
    if (!verifychecksum(payload, merchantKey, checksum)) {
      logger.error(
        `${orderId} - consult-payment-response: checksum did not match - ${JSON.stringify(payload)}`
      );
      return next(new Error(`checkSum did not match for order - ${orderId}`));
    }
    switch (payload.STATUS) {
      case 'TXN_FAILURE':
        transactionStatus = 'failed';
        break;
      case 'PENDING':
        transactionStatus = 'pending';
        break;
      default:
        transactionStatus = 'success';
    }
    const merc_unq_ref = payload.MERC_UNQ_REF.split(':');

    // Source of booking
    bookingSource = merc_unq_ref[0];
    const appointmentId = merc_unq_ref[1];

    if (
      process.env.NODE_ENV == 'dev' ||
      process.env.NODE_ENV == 'local' ||
      transactionStatus == 'pending'
    ) {
      /*save response in apollo24x7*/
      const axiosConfig = {
        headers: {
          'authorization': process.env.API_TOKEN
        }
      }

      logger.info(`consults query - ${consultsOrderQuery(payload)}`);

      logger.info(`${orderId} - makeAppointmentPayment - ${consultsOrderQuery(payload)}`);
      const requestJSON = {
        query: consultsOrderQuery(payload),
      };

      const response = await axios.post(process.env.API_URL, requestJSON, axiosConfig);

      logger.info(`${orderId} - consult-payment-response - ${JSON.stringify(response.data)}`);

      if (response.data.errors && response.data.errors.length) {
        logger.error(
          `${orderId} - consult-payment-response - ${JSON.stringify(response.data.errors)}`
        );
        throw new Error(`Error Occured in makeAppointmentPayment for orderId: ${orderId}`);
      }

      const isRefunded = response.data.data.makeAppointmentPayment.isRefunded;
      if (isRefunded) {
        transactionStatus = 'refunded';
      }
    }
    setTimeout(() => {
      if (bookingSource == 'WEB') {
        const redirectUrl = `${process.env.PORTAL_URL_APPOINTMENTS}?apptid=${appointmentId}&status=${transactionStatus}`;
        res.redirect(redirectUrl);
      } else {
        if (transactionStatus === 'failed') {
          res.redirect(`/consultpg-error?tk=${appointmentId}&status=${transactionStatus}`);
        } else {
          res.redirect(`/consultpg-success?tk=${appointmentId}&status=${transactionStatus}`);
        }
      }
    }, CONSULT_RESPONSE_DELAY);
  } catch (e) {
    if (e.response && e.response.data) {
      logger.error(`${orderId} - consult-response - ${JSON.stringify(e.response.data)}`);
    } else {
      logger.error(`${orderId} - consult-response -  ${e.stack}`);
    }
    if (bookingSource == 'WEB') {
      const redirectUrl = `${process.env.PORTAL_URL_APPOINTMENTS}?status=${transactionStatus}`;
      res.redirect(redirectUrl);
    } else {
      res.redirect(`/consultpg-error?tk=${orderId}&status=${transactionStatus}`);
    }
  }
};
