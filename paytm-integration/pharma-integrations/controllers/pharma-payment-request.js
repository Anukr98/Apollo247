const axios = require('axios');
const { Decimal } = require('decimal.js');
const logger = require('../../winston-logger')('Pharmacy-logs');
const { initPayment, singlePaymentAdditionalParams, addAdditionalMERC } = require('../helpers/common');
const { getCurrentSellingPrice, additionalMercUnqRef } = require('../../commons/paymentCommon.js');
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
      planId,
      subPlanId,
      storeCode
    } = req.query;
    orderId = orderAutoId;

    /**
     * If user did not buy subscription along with pharma order, then use 0 for the plan price as default
     */
    let planPrice = 0;

    logger.info(`${orderId} - paymed-request-input -  ${JSON.stringify(req.query)}`);

    amount = amount ? +amount : 0;
    healthCredits = healthCredits ? +healthCredits : 0;
    if (healthCredits < 0 || amount < 0) {
      throw new Error(PAYMENT_REQUEST_FAILURE_INVALID_PARAMETERS);
    }

    if (planId && !storeCode) {
      throw new Error(PAYMENT_REQUEST_FAILURE_INVALID_PARAMETERS);
    }

    const effectiveAmount = +new Decimal(amount).plus(healthCredits);
    const axiosConfig = {
      headers: {
        'authorization': process.env.API_TOKEN
      }
    };

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
        }`,
    };
    const orderDetails = await axios.post(process.env.API_URL, getMedicineOrderOMSDetails, axiosConfig);

    if (planId) {
      planPrice = await getCurrentSellingPrice(orderId, planId, subPlanId);
    }
    if (orderDetails.data.errors && orderDetails.data.errors.length) {
      logger.error(
        `${orderId} - paymed-request-getMedicineOrderOMSDetails - ${JSON.stringify(orderDetails.data.errors)}`
      );
      throw new Error(`Error Occured in getMedicineOrderOMSDetails for orderId:${orderId}`);
    }

    logger.info(`${orderId} - getMedicineOrderDetails -  ${JSON.stringify(orderDetails.data)}`);

    const {
      orderAutoId: responseOrderId,
      estimatedAmount: responseAmount,
      bookingSource,
      devliveryCharges: deliveryCharges,
      packagingCharges
    } = orderDetails.data.data.getMedicineOrderOMSDetails.medicineOrderDetails;

    /**
     * Health credits can be used for products only and not for delivery|packaging charges
     */
    const maxApplicableHC = new Decimal(effectiveAmount).minus(+deliveryCharges).minus(+packagingCharges).minus(+planPrice);
    if (+new Decimal(responseAmount).plus(planPrice) != effectiveAmount || maxApplicableHC < healthCredits) {
      return res.status(400).json({
        status: 'failed',
        reason: PAYMENT_REQUEST_FAILURE_INVALID_PARAMETERS,
        code: '10000',
      });
    }
    let merc_unq_ref = { bookingSource, healthCredits };
    const partnerInfo = paymentTypeID === process.env.PARTNER_SBI ? paymentTypeId : undefined;
    merc_unq_ref = additionalMercUnqRef(merc_unq_ref, { partnerInfo, planId, storeCode, subPlanId });

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