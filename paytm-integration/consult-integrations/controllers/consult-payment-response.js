const axios = require('axios');
const logger = require('../../winston-logger')('Consults-logs');
const { verifychecksum } = require('../../paytm/lib/checksum');
const { consultsOrderQuery } = require('../helpers/make-graphql-query');

module.exports = async (req, res) => {

    let orderId;
    let transactionStatus = '';
    try {
        const payload = req.body;
        orderId = payload.ORDERID;

        logger.info(`${orderId} - Payload received - ${JSON.stringify(payload)}`);
        const checksum = payload.CHECKSUMHASH;
        console.log("checksumreceived:", checksum);
        delete payload.CHECKSUMHASH;

        if (!verifychecksum(payload, process.env.PAYTM_MERCHANT_KEY_CONSULTS, checksum)) {
            logger.error(`${orderId} - consult-payment-response: checksum did not match - ${JSON.stringify(payload)}`);
            return next(new Error(`checkSum did not match for order - ${orderId}`));
        }
        switch (payload.STATUS) {
            case 'TXN_FAILURE':
                transactionStatus = 'failed';
                break;
            case 'PENDING':
                transactionStatus = 'pending';
                break;
            default:
                transactionStatus = 'success';
        }

        // Source of booking
        bookingSource = payload.MERC_UNQ_REF;

        /*save response in apollo24x7*/
        axios.defaults.headers.common['authorization'] = process.env.API_TOKEN;

        logger.info(`${orderId} - makeAppointmentPayment - ${consultsOrderQuery(payload, false)}`)
        const requestJSON = {
            query: consultsOrderQuery(payload, false)
        };

        const response = await axios.post(process.env.API_URL, requestJSON);

        logger.info(`${orderId} - consult-payment-response - ${JSON.stringify(response.data)}`)

        if (response.data.errors && response.data.errors.length) {
            logger.error(`${orderId} - consult-payment-response - ${JSON.stringify(response.data.errors)}`)
            throw new Error(`Error Occured in makeAppointmentPayment for orderId: ${orderId}`)
        }

        const appointmentId = response.data.data.makeAppointmentPayment.appointment.id;

        if (bookingSource == 'WEB') {
            const redirectUrl = `${process.env.PORTAL_URL_APPOINTMENTS}?apptid=${appointmentId}&status=${transactionStatus}`;
            res.redirect(redirectUrl);
        } else {
            res.redirect(
                `/consultpg-redirect?tk=${appointmentId}&status=${transactionStatus}`
            );
        }

    } catch (e) {
        if (e.response && e.response.data) {
            logger.error(`${orderId} - paymed-response - ${JSON.stringify(e.response.data)}`);
        } else {
            logger.error(`${orderId} - paymed-response -  ${e.stack}`);
        }
        if (bookingSource == 'WEB') {
            const redirectUrl = `${process.env.PORTAL_URL_APPOINTMENTS}?status=${transactionStatus}`;
            res.redirect(redirectUrl);
        } else {
            res.redirect(`/consultpg-redirect?tk=${orderId}&status=${transactionStatus}`);
        }
    }
}