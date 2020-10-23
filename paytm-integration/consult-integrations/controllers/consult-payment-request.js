//@ts-check
'use strict';
const { default: axios } = require('axios');
const { default: Decimal } = require('decimal.js');
const logger = require('../../winston-logger')('Consults-logs');
const { getCurrentSellingPrice, additionalMercUnqRef } = require('../../commons/paymentCommon.js');

const {
  initPayment,
  generatePaymentOrderId,
  singlePaymentAdditionalParams,
} = require('../helpers/common');

module.exports = async (req, res) => {
  let appointmentIdGlobal;

  try {
    const {
      appointmentId,
      planId,
      paymentTypeID: paymentTypeId,
      bankCode, paymentModeOnly,
      subPlanId,
      storeCode
    } = req.query;
    appointmentIdGlobal = appointmentId;
    let source = 'MOBILE';
    if (req.query.source) {
      source = req.query.source;
    }
    const mercUnqRefInit = { bookingSource: source, appointmentId };
    const partnerInfo = paymentTypeId === process.env.PARTNER_SBI ? paymentTypeId : undefined;

    const mercUnqRef = additionalMercUnqRef(mercUnqRefInit, { partnerInfo, planId, storeCode, subPlanId });


    let addParams = {};

    /**
     * If paymentModeOnly key == 'YES' then add additional params
     * I.E AUTH_MODE|BANK_CODE|PAYMENT_TYPE_ID
     */
    if (paymentModeOnly === 'YES') {

      addParams = singlePaymentAdditionalParams(paymentTypeId, bankCode);
      addParams['PAYMENT_MODE_ONLY'] = paymentModeOnly;
    }
    const axiosConfig = {
      headers: {
        'authorization': process.env.API_TOKEN
      }
    };

    const getAptRequestJson = {
      query:
        'query getAppointmentData { getAppointmentData(appointmentId:"' +
        appointmentId +
        '"){ appointmentsHistory { discountedAmount patientId } } }',
    };
    const appointmentData = await axios.post(process.env.API_URL, getAptRequestJson, axiosConfig);

    /**
     * If error occurs at getAppointmentData API, throw error and exit
     */
    if (appointmentData.data.errors && appointmentData.data.errors.length) {
      logger.error(
        `${appointmentId} - consult - payment - request - getAppointmentData - ${JSON.stringify(appointmentData.data.errors)} `
      );
      throw new Error(`Error Occured in getAppointmentData for appointmentID: ${appointmentId}`);
    }
    const paymentOrderId = generatePaymentOrderId();

    /**
     * If user did not buy subscription along with consult order, then use 0 for the plan price as default
     */
    let planPrice = 0;

    /**
     * If plan id is passed, we need to get the price
     */

    if (planId) {
      planPrice = await getCurrentSellingPrice(paymentOrderId, planId, subPlanId);
    }

    const {
      discountedAmount,
      patientId: patientIdExisting,
    } = appointmentData.data.data.getAppointmentData.appointmentsHistory[0];
    let totalPayAmount = +new Decimal(planPrice).plus(discountedAmount);


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
    const updateResp = await axios.post(process.env.API_URL, requestJSON, axiosConfig);

    logger.info(`${appointmentId} - updatePaymentOrderId - ${JSON.stringify(updateResp.data)}`);
    if (updateResp.data.errors && updateResp.data.errors.length) {
      logger.error(
        `${appointmentId} - consult - payment - request - ${JSON.stringify(updateResp.data.errors)} `
      );
      throw new Error(`Error Occured in updatePaymentOrderId for appoinment id: ${appointmentId}`);
    }

    const success = await initPayment(
      patientIdExisting,
      paymentOrderId,
      totalPayAmount,
      mercUnqRef,
      addParams,
      req.query.paymentTypeID
    );

    res.render('paytmRedirect.ejs', {
      resultData: success,
      paytmFinalUrl: process.env.PAYTM_FINAL_URL,
    });
  } catch (e) {
    if (e.response && e.response.data) {
      logger.error(
        `${appointmentIdGlobal} - consult - payment - request - ${JSON.stringify(e.response.data)}`
      );
    } else {
      logger.error(`${appointmentIdGlobal} - consult - payment - request - ${e.stack}`);
    }
    res.status(400).json({
      status: 'failed',
      reason: 'Something went wrong, please try again!',
      code: '10001',
    });
  }
};
