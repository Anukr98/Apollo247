const paymedRequest = require('./pharma-payment-request');
const paymedResponse = require('./pharma-payment-response');
const { mobRedirect } = require('./payment-response-redirect');
const pharmaWebhook = require('./webhook');


module.exports = {
    paymedRequest,
    paymedResponse,
    mobRedirect,
    pharmaWebhook
}
