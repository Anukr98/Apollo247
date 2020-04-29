const consultPayRequest = require('./consult-payment-request');
const consultPayResponse = require('./consult-payment-response');
const { consultsPgRedirect } = require('./payment-response-redirect');
const consultWebhook = require('./webhook');


module.exports = {
    consultPayRequest,
    consultPayResponse,
    consultsPgRedirect,
    consultWebhook
}
