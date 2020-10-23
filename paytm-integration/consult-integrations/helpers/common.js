const { genchecksum } = require('../../paytm/lib/checksum');
const logger = require('../../winston-logger')('Consults-logs');

/**
 * Method for returning the
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
    let merchantId = process.env.MID_CONSULTS;
    if (paymentTypeID == process.env.PARTNER_SBI) {
      merchantId = process.env.SBI_MID_CONSULTS;
    }
    let paymentObj = {
      ORDER_ID: orderAutoId,
      CUST_ID: patientId,
      INDUSTRY_TYPE_ID: process.env.INDUSTRY_TYPE_ID_CONSULTS,
      CHANNEL_ID: process.env.CHANNEL_ID_CONSULTS,
      TXN_AMOUNT: amount.toString(),
      MID: merchantId,
      WEBSITE: process.env.WEBSITE_CONSULTS,
      CALLBACK_URL: process.env.CALLBACK_URL_CONSULTS,
      MERC_UNQ_REF: merc_unq_ref,
    };
    Object.assign(paymentObj, addParams);
    let merchantKey = process.env.PAYTM_MERCHANT_KEY_CONSULTS;
    if (paymentTypeID == process.env.PARTNER_SBI)
      merchantKey = process.env.SBI_PAYTM_MERCHANT_KEY_CONSULTS;
    genchecksum(paymentObj, merchantKey, (err, result) => {
      if (err) {
        reject('Error while generating checksum');
      } else {
        paymentObj.CHECKSUMHASH = result;
        console.log(paymentObj);
        resolve(paymentObj);
      }
    });
  });
};

const addAdditionalMERC = (paymentTypeId, planId) => {
  let merc = ":" + (paymentTypeId === process.env.PARTNER_SBI ? paymentTypeId : 0);
  merc += ":" + (planId ? planId : 0);
  return merc;
};

const generatePaymentOrderId = () => {
  const dateObj = new Date();
  let minutes =
    dateObj.getMinutes() < 10 ? '0' + dateObj.getMinutes() : dateObj.getMinutes().toString();
  let hours = dateObj.getHours() < 10 ? '0' + dateObj.getHours() : dateObj.getHours().toString();
  let month =
    dateObj.getMonth() + 1 < 10
      ? '0' + (dateObj.getMonth() + 1)
      : (dateObj.getMonth() + 1).toString();
  let seconds =
    dateObj.getSeconds() < 10 ? '0' + dateObj.getSeconds() : dateObj.getSeconds().toString();
  let date = dateObj.getDate() < 10 ? '0' + dateObj.getDate() : dateObj.getDate().toString();
  let random4Digits = Math.random()
    .toString()
    .slice(-4);

  return (
    dateObj.getFullYear().toString() + month + date + hours + minutes + seconds + random4Digits
  );
};

const singlePaymentAdditionalParams = (paymentTypeID, bankCode) => {
  const paymentTypeParams = {};
  if (paymentTypeID == process.env.PARTNER_SBI) paymentTypeID = 'DC';
  const possiblePaymentTypes = ['CC', 'DC', 'NB', 'PPI', 'EMI', 'UPI', 'PAYTM_DIGITAL_CREDIT'];
  logger.info(`${paymentTypeID} - paymentTypeID`);
  if (!possiblePaymentTypes.includes(paymentTypeID)) {
    throw new Error('Invalid payment type! Please contact IT department.');
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

module.exports = { initPayment, generatePaymentOrderId, singlePaymentAdditionalParams, addAdditionalMERC };
