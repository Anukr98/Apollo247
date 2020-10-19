const axios = require('axios');
const { Decimal } = require('decimal.js');
const logger = require('../../winston-logger')('Pharmacy-logs');
const { initPayment, singlePaymentAdditionalParams, addAdditionalMERC } = require('../helpers/common');
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
      bankCode,
      planId
    } = req.query;
    orderId = orderAutoId;

    /**
     * If user did not buy subscription, then use 0 for the plan price as default
     */
    let planPrice = 0;

    logger.info(`${orderId} - paymed-request-input -  ${JSON.stringify(req.query)}`);

    amount = amount ? +amount : 0;
    healthCredits = healthCredits ? +healthCredits : 0;
    if (healthCredits < 0 || amount < 0) {
      throw new Error(PAYMENT_REQUEST_FAILURE_INVALID_PARAMETERS);
    }
    const effectiveAmount = +new Decimal(amount).plus(healthCredits);
    const axiosConfig = {
      headers: {
        'authorization': process.env.API_TOKEN
      }
    };

    const prePaymentRequests = [];
    // validate the order and token.
    const getMedicineOrderOMSDetails = {
      query:
        `query getMedicineOrderOMSDetails {
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
    };
    prePaymentRequests.push(axios.post(process.env.API_URL, getMedicineOrderOMSDetails, axiosConfig));

    if (planId) {
      const getPlanDetails = {
        query:
          `query getMedicineOrderOMSDetails {
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
      };
      prePaymentRequests.push(axios.post(process.env.API_URL, getPlanDetails, axiosConfig));

    }
    const [orderDetails, planDetails] = await promise.all(prePaymentRequests);
    if (orderDetails.data.errors && orderDetails.data.errors.length) {
      logger.error(
        `${orderId} - paymed-request-getMedicineOrderOMSDetails - ${JSON.stringify(orderDetails.data.errors)}`
      );
      throw new Error(`Error Occured in getMedicineOrderOMSDetails for orderId:${orderId}`);
    }
    if (planDetails.data.errors && planDetails.data.errors.length) {
      logger.error(
        `${orderId} - paymed-request-getPlanDetails - ${JSON.stringify(planDetails.data.errors)}`
      );
      throw new Error(`Error Occured in getPlanDetails for orderId:${orderId}`);
    }


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
    const maxApplicableHC = new Decimal(effectiveAmount).minus(+deliveryCharges).minus(+packagingCharges).minus(planPrice);
    if (responseAmount != effectiveAmount || maxApplicableHC < healthCredits) {
      return res.status(400).json({
        status: 'failed',
        reason: PAYMENT_REQUEST_FAILURE_INVALID_PARAMETERS,
        code: '10000',
      });
    }
    const merc_unq_ref = `${bookingSource}:${healthCredits}`;
    merc_unq_ref += addAdditionalMERC(paymentTypeID, planId);
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