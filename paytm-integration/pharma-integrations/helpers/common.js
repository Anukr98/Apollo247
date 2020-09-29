const { genchecksum } = require('../../paytm/lib/checksum');
const logger = require('../../winston-logger')('Pharmacy-logs');
const { POSSIBLE_PAYMENT_TYPES, INVALID_PAYMENT_TYPE } = require('../../Constants');
/**
 * Method for returning the promise
 * @param {*} orderAutoId
 * @param {*} amount
 * @param {*} bookingSource
 */
const initPayment = function (
  patientId,
  orderAutoId,
  amount,
  merc_unq_ref,
  addParams,
  paymentTypeID
) {
  return new Promise((resolve, reject) => {
    let merchantId = process.env.MID_PHARMACY;
    if (paymentTypeID == process.env.PARTNER_SBI) {
      merchantId = process.env.SBI_MID_PHARMACY;
      merc_unq_ref += ':' + process.env.PARTNER_SBI;
    }
    let paymentObj = {
      ORDER_ID: orderAutoId,
      CUST_ID: patientId,
      INDUSTRY_TYPE_ID: process.env.INDUSTRY_TYPE_ID_PHARMACY,
      CHANNEL_ID: process.env.CHANNEL_ID_PHARMACY,
      TXN_AMOUNT: amount.toString(),
      MID: merchantId,
      WEBSITE: process.env.WEBSITE_PHARMACY,
      CALLBACK_URL: process.env.CALLBACK_URL_PHARMACY,
      MERC_UNQ_REF: merc_unq_ref,
    };

    Object.assign(paymentObj, addParams);
    logger.info(`${orderAutoId} -paymed-request-initPayment- ${JSON.stringify(paymentObj)}`);

    let merchantKey = process.env.PAYTM_MERCHANT_KEY_PHARMACY;
    if (paymentTypeID == process.env.PARTNER_SBI)
      merchantKey = process.env.SBI_PAYTM_MERCHANT_KEY_PHARMACY;
    genchecksum(paymentObj, merchantKey, (err, result) => {
      if (err) {
        return reject('Error while generating checksum');
      } else {
        paymentObj.CHECKSUMHASH = result;
        resolve(paymentObj);
      }
    });
  });
};

const singlePaymentAdditionalParams = (paymentTypeID, bankCode) => {
  const paymentTypeParams = {};
  if (paymentTypeID == process.env.PARTNER_SBI) paymentTypeID = 'DC';
  logger.info(`${paymentTypeID} - paymentTypeID`);
  if (!POSSIBLE_PAYMENT_TYPES.includes(paymentTypeID)) {
    throw new Error(INVALID_PAYMENT_TYPE);
  }
  paymentTypeParams['PAYMENT_TYPE_ID'] = paymentTypeID;
  if (paymentTypeID === 'NB' && bankCode) {
    paymentTypeParams['BANK_CODE'] = bankCode;
  }
  switch (paymentTypeID) {
    case 'CC':
    case 'DC':
    case 'EMI':
      paymentTypeParams['AUTH_MODE'] = '3D';
      break;
    case 'PPI':
    case 'PAYTM_DIGITAL_CREDIT':
    case 'NB':
      paymentTypeParams['AUTH_MODE'] = 'USRPWD';
      break;
  }
  return paymentTypeParams;
};

module.exports = {
  initPayment,
  singlePaymentAdditionalParams,
};
