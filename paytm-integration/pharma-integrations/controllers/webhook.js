const axios = require('axios');
const logger = require('../../winston-logger')('Pharmacy-logs');
const { verifychecksum } = require('../../paytm/lib/checksum');
const { medicineOrderQuery } = require('../helpers/make-graphql-query');

module.exports = async (req, res, next) => {
    let orderId;
    try {
        const payload = req.body;
        orderId = payload.ORDERID;

        logger.info(`${orderId} - paymed-response-webhook - ${JSON.stringify(payload)}`);

        const checksum = payload.CHECKSUMHASH;
        delete payload.CHECKSUMHASH;
        if (!verifychecksum(payload, process.env.PAYTM_MERCHANT_KEY_PHARMACY, checksum)) {
            logger.error(`${orderId} - paymed-response: checksum did not match - ${JSON.stringify(payload)}`);
            return next(new Error(`checkSum did not match for order - ${orderId}`));
        }

        axios.defaults.headers.common['authorization'] = process.env.API_TOKEN;

        // this needs to be altered later.
        const requestJSON = {
            query: medicineOrderQuery(payload),
        };

        const response = await axios.post(process.env.API_URL, requestJSON);
        logger.info(`${payload.ORDERID} - SaveMedicineOrderPaymentMq -  ${JSON.stringify(response.data)}`);

        if (response.data.errors && response.data.errors.length) {
            logger.error(`${orderId} - pharma-response-webhook - ${JSON.stringify(response.data.errors)}`)
            throw new Error(`Error Occured in SaveMedicineOrderPaymentMq for order id: ${orderId}`);
        }

    } catch (e) {

        if (e.response && e.response.data) {
            logger.error(`${orderId} - paymed-response - ${JSON.stringify(e.response.data)}`);
        } else {
            logger.error(`${orderId} - paymed-response -  ${e.stack}`);
        }
        next(e);
    }
}