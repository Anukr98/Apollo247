const consultPayRequest = require('./consult-payment-request');
const consultPayResponse = require('./consult-payment-response');
const { consultsPgSuccess, consultsPgError } = require('./payment-response-redirect');
const consultWebhook = require('./webhook');


module.exports = {
    consultPayRequest,
    consultPayResponse,
    consultsPgSuccess,
    consultsPgError,
    consultWebhook
}
