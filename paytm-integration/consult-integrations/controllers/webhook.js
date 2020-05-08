const axios = require('axios');
const logger = require('../../winston-logger')('Consults-logs');
const { verifychecksum } = require('../../paytm/lib/checksum');
const { consultsOrderQuery } = require('../helpers/make-graphql-query');


module.exports = async (req, res, next) => {
    let orderId;

    try {
        const payload = req.body;
        orderId = payload.ORDERID;

        logger.info(`${orderId} - consult-response-webhook - ${JSON.stringify(payload)}`);

        const checksum = payload.CHECKSUMHASH;
        delete payload.CHECKSUMHASH;
        if (!verifychecksum(payload, process.env.PAYTM_MERCHANT_KEY_CONSULTS, checksum)) {
            logger.error(`${orderId} - consult-response-webhook: checksum did not match - ${JSON.stringify(payload)}`);
            return next(new Error(`checkSum did not match for order - ${orderId}`));
        }

        axios.defaults.headers.common['authorization'] = process.env.API_TOKEN;

        // this needs to be altered later.
        const requestJSON = {
            query: consultsOrderQuery(payload),
        };

        /// write medicineoirder
        const response = await axios.post(process.env.API_URL, requestJSON);
        logger.info(`${payload.ORDERID} - makeAppointmentPayment -  ${JSON.stringify(response.data)}`);

        if (response.data.errors && response.data.errors.length) {
            logger.error(`${orderId} - consult-payment-webhook - ${JSON.stringify(response.data.errors)}`)
            throw new Error(`Error Occured in makeAppointmentPayment - consult-payment-webhook - for order id: ${orderId}`);
        }


    } catch (e) {
        if (e.response && e.response.data) {
            logger.error(`${orderId} - consult-payment-webhook - ${JSON.stringify(e.response.data)}`);
        } else {
            logger.error(`${orderId} - consult-payment-webhook -  ${e.stack}`);
        }
        next(e);
    }
}