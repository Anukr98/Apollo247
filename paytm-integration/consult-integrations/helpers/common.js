const { genchecksum } = require('../../paytm/lib/checksum')

/**
 * Method for returning the 
 * @param {*} orderAutoId 
 * @param {*} amount 
 * @param {*} bookingSource 
 */
const initPayment = function (patientId, orderAutoId, amount, bookingSource, addParams) {

    return new Promise((resolve, reject) => {
        let paymentObj = {
            ORDER_ID: orderAutoId,
            CUST_ID: patientId,
            INDUSTRY_TYPE_ID: process.env.INDUSTRY_TYPE_ID_CONSULTS,
            CHANNEL_ID: process.env.CHANNEL_ID_CONSULTS,
            TXN_AMOUNT: amount.toString(),
            MID: process.env.MID_CONSULTS,
            WEBSITE: process.env.WEBSITE_CONSULTS,
            CALLBACK_URL: process.env.CALLBACK_URL_CONSULTS,
            MERC_UNQ_REF: bookingSource
        };
        Object.assign(paymentObj, addParams);


        genchecksum(paymentObj, process.env.PAYTM_MERCHANT_KEY_CONSULTS, (err, result) => {

            if (err) {
                reject('Error while generating checksum');
            } else {
                paymentObj.CHECKSUMHASH = result;
                console.log(paymentObj);
                resolve(paymentObj);
            }
        })
    });
};

const generatePaymentOrderId = () => {

    const dateObj = new Date();
    let minutes = dateObj.getMinutes() < 10 ? "0" + dateObj.getMinutes() : dateObj.getMinutes().toString();
    let hours = dateObj.getHours() < 10 ? "0" + dateObj.getHours() : dateObj.getHours().toString();
    let month = dateObj.getMonth() < 10 ? "0" + dateObj.getMonth() : dateObj.getMonth().toString();
    let seconds = dateObj.getSeconds() < 10 ? "0" + dateObj.getSeconds() : dateObj.getSeconds().toString();
    let date = dateObj.getDate() < 10 ? "0" + dateObj.getDate() : dateObj.getDate().toString();
    let random4Digits = Math.random().toString().slice(-4);

    return dateObj.getFullYear().toString() + month + date + hours + minutes + seconds + random4Digits;
}

const singlePaymentAdditionalParams = (paymentTypeID, bankCode) => {

    const paymentTypeParams = {};
    const possiblePaymentTypes = ['CC', 'DC', 'NB', 'PPI', 'EMI', 'UPI', 'PAYTM_DIGITAL_CREDIT'];

    if (!possiblePaymentTypes.includes(paymentTypeID)) {
        throw new Error("Invalid payment type! Please contact IT department.")
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
}

module.exports = { initPayment, generatePaymentOrderId, singlePaymentAdditionalParams }
