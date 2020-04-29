const axios = require('axios');
const logger = require('../../winston-logger')('Pharmacy-logs');
const initPayment = require('../helpers/getPaymentObject');
module.exports = async (req, res, next) => {

    // variable to log order id in catch
    let orderId;
    try {
        const { oid: orderAutoId, pid: patientId, amount } = req.query;

        orderId = orderAutoId;
        // Decide if we need token here or we can use static token
        axios.defaults.headers.common['authorization'] = process.env.API_TOKEN;

        // validate the order and token.
        const response = await axios({
            url: process.env.API_URL,
            method: 'post',
            data: {
                query: `
              query {
                getMedicineOrderDetails(patientId:"${patientId}", orderAutoId:${orderAutoId}) {
                  MedicineOrderDetails {
                    id
                    orderAutoId
                    estimatedAmount
                    bookingSource
                  }
                }
              }
            `,
            }
        });

        if (
            response &&
            response.data &&
            response.data.data &&
            response.data.data.getMedicineOrderDetails &&
            response.data.data.getMedicineOrderDetails.MedicineOrderDetails
        ) {
            logger.info(`${orderId} - getMedicineOrderDetails -  ${JSON.stringify(response.data)}`)

            const { orderAutoId: responseOrderId, estimatedAmount: responseAmount, bookingSource } = response.data.data.getMedicineOrderDetails.MedicineOrderDetails;
            console.log(responseAmount);
            if (responseAmount != amount) {
                return res.status(400).json({
                    status: 'failed',
                    reason: 'Invalid parameters',
                    code: '10000',
                });
            }
            const success = await initPayment(patientId, responseOrderId.toString(), amount, bookingSource);

            return res.render('paytmRedirect.ejs', {
                resultData: success,
                paytmFinalUrl: process.env.PAYTM_FINAL_URL,
            });
        } else {
            res.status(500).json({
                status: 'failed',
                reason: 'Something went wrong, please try again!',
                code: '10002',
            });
        }
    } catch (e) {
        if (e.response && e.response.data) {
            logger.error(`${orderId} - paymed - ${JSON.stringify(e.response.data)}`);
        } else {
            logger.error(`${orderId} - paymed -  ${e.stack}`);
        }
        res.status(500).json({
            status: 'failed',
            reason: 'Something went wrong, please try again!',
            code: '10002',
        });
    }
}
