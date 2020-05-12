const { genchecksum } = require('../../paytm/lib/checksum');
const logger = require('../../winston-logger')('Pharmacy-logs');
const {
    POSSIBLE_PAYMENT_TYPES,
    INVALID_PAYMENT_TYPE
} = require('../../Constants');
/**
 * Method for returning the promise 
 * @param {*} orderAutoId 
 * @param {*} amount 
 * @param {*} bookingSource 
 */
const initPayment = function (patientId, orderAutoId, amount, bookingSource, addParams) {
    return new Promise((resolve, reject) => {
        let paymentObj = {
            ORDER_ID: orderAutoId,
            CUST_ID: patientId,
            INDUSTRY_TYPE_ID: process.env.INDUSTRY_TYPE_ID_PHARMACY,
            CHANNEL_ID: process.env.CHANNEL_ID_PHARMACY,
            TXN_AMOUNT: amount.toString(),
            MID: process.env.MID_PHARMACY,
            WEBSITE: process.env.WEBSITE_PHARMACY,
            CALLBACK_URL: process.env.CALLBACK_URL_PHARMACY,
            MERC_UNQ_REF: bookingSource
        };

        Object.assign(paymentObj, addParams);

        genchecksum(paymentObj, process.env.PAYTM_MERCHANT_KEY_PHARMACY, (err, result) => {
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
    singlePaymentAdditionalParams
};
