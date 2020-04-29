const { genchecksum } = require('../../paytm/lib/checksum')

/**
 * Method for returning the 
 * @param {*} orderAutoId 
 * @param {*} amount 
 * @param {*} bookingSource 
 */
const initPayment = function (patientId, orderAutoId, amount, bookingSource) {
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

        genchecksum(paymentObj, process.env.PAYTM_MERCHANT_KEY_PHARMACY, (err, result) => {

            if (err) {
                return reject('Error while generating checksum');
            } else {
                paymentObj.CHECKSUMHASH = result;
                resolve(paymentObj);
            }
        })

    });
};

module.exports = initPayment;
