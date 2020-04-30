const axios = require('axios');
const logger = require('../../winston-logger')('Consults-logs');
const { initPayment, generatePaymentOrderId, singlePaymentAdditionalParams } = require('../helpers/common');

module.exports = async (req, res, next) => {
    let appointmentIdGlobal;

    try {

        const { appointmentId, patientId, price: amount } = req.query;
        appointmentIdGlobal = appointmentId;
        //res.send('consult payment');
        let source = 'MOBILE';
        if (req.query.source) {
            source = req.query.source;
        }

        let addParams = {};

        /**
         * If paymentModeOnly key == 'YES' then add additional params
         * I.E AUTH_MODE|BANK_CODE|PAYMENT_TYPE_ID
         */
        if (req.query.paymentModeOnly === 'YES') {
            addParams = singlePaymentAdditionalParams(req.query.paymentTypeID, req.query.bankCode);
            addParams['PAYMENT_MODE_ONLY'] = req.query.paymentModeOnly;
        }

        axios.defaults.headers.common['authorization'] = process.env.API_TOKEN;

        const getAptRequestJson = {
            query:
                'query { getAppointmentData(appointmentId:"' +
                appointmentId +
                '"){ appointmentsHistory { discountedAmount patientId } } }',
        };
        const aptResp = await axios.post(process.env.API_URL, getAptRequestJson);

        logger.info(`${appointmentId} - getAppointmentData - ${JSON.stringify(aptResp.data)}`);

        if (aptResp.data.errors && aptResp.data.errors.length) {
            logger.error(`${appointmentId} - consult-payment-request - ${JSON.stringify(aptResp.data.errors)}`)
            throw new Error(`Error Occured in getAppointmentData for appointmentID:${appointmentId}`)
        }

        const { discountedAmount, patientId: patientIdExisting } = aptResp.data.data.getAppointmentData.appointmentsHistory[0];

        if (discountedAmount != amount || patientId != patientIdExisting) {
            logger.error(`consults-payment-request -  ${JSON.stringify(req.query)}`)
            return next(new Error("Invalid request received!"));
        }

        const paymentOrderId = generatePaymentOrderId();
        console.log("paymentOrderId:", paymentOrderId);

        const requestJSON = {
            query:
                'mutation { updatePaymentOrderId(appointmentId:"' +
                appointmentId +
                '",orderId:"' +
                paymentOrderId +
                '",source:"' +
                source +
                '"){ status } }',
        };
        console.log("requestJson:", requestJSON);
        const updateResp = await axios.post(process.env.API_URL, requestJSON);

        logger.info(`${appointmentId} - updatePaymentOrderId - ${JSON.stringify(updateResp.data)}`);
        if (updateResp.data.errors && updateResp.data.errors.length) {
            logger.error(`${appointmentId} - consult-payment-request - ${JSON.stringify(updateResp.data.errors)}`)
            throw new Error(`Error Occured in updatePaymentOrderId for appoinment id: ${appointmentId}`);
        }

        const success = await initPayment(patientId, paymentOrderId, amount, source, addParams);

        res.render('paytmRedirect.ejs', {
            resultData: success,
            paytmFinalUrl: process.env.PAYTM_FINAL_URL,
        });
    } catch (e) {
        if (e.response && e.response.data) {
            logger.error(`${appointmentIdGlobal} - consult-payment-request - ${JSON.stringify(e.response.data)}`);
        } else {
            logger.error(`${appointmentIdGlobal} - consult-payment-request -  ${e.stack}`);
        }
        res.status(400).json({
            status: 'failed',
            reason: 'Something went wrong, please try again!',
            code: '10001',
        });
    }
}
