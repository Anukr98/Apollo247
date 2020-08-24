const axios = require('axios');
const logger = require('../../winston-logger')('Pharmacy-logs');
const { verifychecksum } = require('../../paytm/lib/checksum');
const { medicineOrderQuery } = require('../helpers/make-graphql-query');
const { PHARMA_RESPONSE_DELAY } = require('../../Constants');

module.exports = async (req, res, next) => {
  let transactionStatus = '';
  let orderId;
  let bookingSource = 'MOBILE';
  try {
    const payload = req.body;
    logger.info(`Payload received: - paymed-response - ${JSON.stringify(payload)}`);
    orderId = payload.ORDERID;

    const checksum = payload.CHECKSUMHASH;
    delete payload.CHECKSUMHASH;
    let merchantKey = process.env.PAYTM_MERCHANT_KEY_PHARMACY;
    if (payload.MID == process.env.SBI_MID_CONSULTS)
      merchantKey = process.env.SBI_PAYTM_MERCHANT_KEY_PHARMACY;
    if (!verifychecksum(payload, merchantKey, checksum)) {
      logger.error(
        `${orderId} - paymed-response: checksum did not match - ${JSON.stringify(payload)}`
      );
      return next(new Error(`checkSum did not match for order - ${orderId}`));
    }

    // Source of booking
    const [bookingSource, healthCredits] = payload.MERC_UNQ_REF.split(':');
    payload.HEALTH_CREDITS = healthCredits;
    /* make success and failure response */
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

    logger.info(`${orderId} - paymed-response - ${JSON.stringify(payload)}`);

    if (
      process.env.NODE_ENV == 'dev' ||
      process.env.NODE_ENV == 'local' ||
      transactionStatus == 'pending'
    ) {
      axios.defaults.headers.common['authorization'] = process.env.API_TOKEN;

      logger.info(`pharma-response-${medicineOrderQuery(payload)}`);

      // this needs to be altered later.
      const requestJSON = {
        query: medicineOrderQuery(payload),
      };

      /// write medicineorder
      const response = await axios.post(process.env.API_URL, requestJSON);
      logger.info(
        `${payload.ORDERID} - SaveMedicineOrderPaymentMq - ${JSON.stringify(response.data)}`
      );

      if (response.data.errors && response.data.errors.length) {
        logger.error(
          `${orderId} - pharma-payment-response - ${JSON.stringify(response.data.errors)}`
        );
        throw new Error('Error Occured in SaveMedicineOrderPaymentMq!');
      }
    }
    setTimeout(() => {
      if (bookingSource === 'WEB') {
        let redirectUrl = `${process.env.PORTAL_URL}/${orderId}/${transactionStatus}`;
        if (transactionStatus === 'failed') {
          redirectUrl = `${process.env.PORTAL_URL}/${orderId}/${transactionStatus}`;
        }
        res.redirect(redirectUrl);
      } else {
        if (transactionStatus === 'failed') {
          res.redirect(`/mob-error?status=${transactionStatus}`);
        } else {
          res.redirect(`/mob?status=${transactionStatus}`);
        }
      }
    }, PHARMA_RESPONSE_DELAY);
  } catch (e) {
    if (e.response && e.response.data) {
      logger.error(`${orderId} - paymed-response - ${JSON.stringify(e.response.data)}`);
    } else {
      logger.error(`${orderId} - paymed-response - ${e.stack}`);
    }

    if (bookingSource === 'WEB') {
      const redirectUrl = `${process.env.PORTAL_URL}/${orderId}/${transactionStatus}`;
      res.redirect(redirectUrl);
    } else {
      res.redirect(`/mob-error?status=${transactionStatus}`);
    }
  }
};
