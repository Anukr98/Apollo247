const axios = require('axios');
const { Decimal } = require('decimal.js');
const logger = require('../../winston-logger')('Pharmacy-logs');
const { initPayment, singlePaymentAdditionalParams } = require('../helpers/common');
const {
  PAYMENT_MODE_ONLY_TRUE,
  PAYMENT_REQUEST_FAILURE_UNKNOWN_REASON,
  PAYMENT_REQUEST_FAILURE_INVALID_PARAMETERS,
} = require('../../Constants');
module.exports = async (req, res) => {
  // variable to log order id in catch
  let orderId;
  try {
    let {
      oid: orderAutoId,
      pid: patientId,
      amount,
      hc: healthCredits,
      paymentTypeID,
      paymentModeOnly,
      bankCode
    } = req.query;
    orderId = orderAutoId;

    logger.info(`${orderId} - paymed-request-input -  ${JSON.stringify(req.query)}`);
    amount = amount ? +amount : 0;
    healthCredits = healthCredits ? +healthCredits : 0;
    if (healthCredits < 0 || amount < 0) {
      throw new Error(PAYMENT_REQUEST_FAILURE_INVALID_PARAMETERS);
    }
    const effectiveAmount = +new Decimal(amount).plus(healthCredits);

    // Decide if we need token here or we can use static token
    axios.defaults.headers.common['authorization'] = process.env.API_TOKEN;

    // validate the order and token.
    const response = await axios({
      url: process.env.API_URL,
      method: 'post',
      data: {
        query: `
              query {
                getMedicineOrderOMSDetails(patientId:"${patientId}", orderAutoId:${orderAutoId}) {
                  medicineOrderDetails {
                    id
                    orderAutoId
                    estimatedAmount
                    bookingSource
                    packagingCharges
                    devliveryCharges
                  }
                }
              }
            `,
      },
    });
    if (
      response &&
      response.data &&
      response.data.data &&
      response.data.data.getMedicineOrderOMSDetails &&
      response.data.data.getMedicineOrderOMSDetails.medicineOrderDetails
    ) {
      logger.info(`${orderId} - getMedicineOrderDetails -  ${JSON.stringify(response.data)}`);

      const {
        orderAutoId: responseOrderId,
        estimatedAmount: responseAmount,
        bookingSource,
        devliveryCharges: deliveryCharges,
        packagingCharges
      } = response.data.data.getMedicineOrderOMSDetails.medicineOrderDetails;

      /**
       * Health credits can be used for products only and not for delivery|packaging charges
       */
      const maxApplicableHC = new Decimal(effectiveAmount).minus(+deliveryCharges).minus(+packagingCharges);
      if (responseAmount != effectiveAmount || maxApplicableHC < healthCredits) {
        return res.status(400).json({
          status: 'failed',
          reason: PAYMENT_REQUEST_FAILURE_INVALID_PARAMETERS,
          code: '10000',
        });
      }
      const merc_unq_ref = `${bookingSource}:${healthCredits}`;

      if (!paymentTypeID.trim() && amount === 0) {
        const response = await saveMedicineOrder({
          orderId,
          healthCredits,
          paymentStatus: "TXN_SUCCESS",
          amountPaid: amount
        });
        if (!response) {
          return res.redirect(`/mob-error?status=failed`);
        } else {
          return res.redirect(`/mob?status=success`);
        }
      }
      let addParams = {};
      /**
       * If paymentModeOnly key == 'YES' then add additional params
       * I.E AUTH_MODE|BANK_CODE|PAYMENT_TYPE_ID
       */
      if (paymentModeOnly === PAYMENT_MODE_ONLY_TRUE && paymentTypeID.trim()) {
        addParams = singlePaymentAdditionalParams(paymentTypeID, bankCode);
        addParams['PAYMENT_MODE_ONLY'] = req.query.paymentModeOnly;
      }
      const success = await initPayment(
        patientId,
        responseOrderId.toString(),
        amount,
        merc_unq_ref,
        addParams,
        paymentTypeID
      );
      return res.render('paytmRedirect.ejs', {
        resultData: success,
        paytmFinalUrl: process.env.PAYTM_FINAL_URL,
      });
    } else {
      res.status(500).json({
        status: 'failed',
        reason: PAYMENT_REQUEST_FAILURE_UNKNOWN_REASON,
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
      reason: PAYMENT_REQUEST_FAILURE_UNKNOWN_REASON,
      code: '10002',
    });
  }
};

async function saveMedicineOrder(payload) {
  axios.defaults.headers.common['authorization'] = process.env.API_TOKEN;;
  // this needs to be altered later.
  const requestJSON = {
    query:
      'mutation { SaveMedicineOrderPaymentMq(medicinePaymentMqInput: { orderId: "0", orderAutoId: ' +
      payload.orderId +
      ', paymentType: CASHLESS, amountPaid: ' +
      payload.amountPaid +
      ', paymentStatus: "' +
      payload.paymentStatus +
      '", paymentDateTime: "' +
      new Date(new Date().toUTCString()).toISOString() +
      '", responseCode: "",' +
      'responseMessage: "",' +
      'healthCredits: ' +
      payload.healthCredits +
      '}){ errorCode, errorMessage,orderStatus }}',
  };

  /// write medicineoirder
  const response = await axios.post(process.env.API_URL, requestJSON);
  if (response.data && response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }
  return response;
}
