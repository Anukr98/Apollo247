//@ts-check
'use strict';
const { default: axios } = require('axios');
const { default: Decimal } = require('decimal.js');
const logger = require('../../winston-logger')('Consults-logs');
const {
  initPayment,
  generatePaymentOrderId,
  addAdditionalMERC,
  singlePaymentAdditionalParams,
} = require('../helpers/common');

module.exports = async (req, res) => {
  let appointmentIdGlobal;

  try {
    const { appointmentId, planId, paymentTypeID: paymentTypeId, bankCode, paymentModeOnly } = req.query;
    appointmentIdGlobal = appointmentId;
    let source = 'MOBILE';
    if (req.query.source) {
      source = req.query.source;
    }
    let merc_unq_ref = `${source}:${appointmentId}`;
    merc_unq_ref += addAdditionalMERC(paymentTypeId, planId);

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
    const prePaymentRequests = [];
    prePaymentRequests.push(axios.post(process.env.API_URL, getAptRequestJson, axiosConfig));

    /**
     * If plan id is passed, we need to get the price
     */
    if (planId) {
      const getPlanPrice = {
        query:
          'query getAppointmentData { getAppointmentData(appointmentId:"' +
          appointmentId +
          '"){ appointmentsHistory { discountedAmount patientId } } }',
      };
      prePaymentRequests.push(axios.post(process.env.API_URL, getPlanPrice, axiosConfig));
    }

    const [appointmentData, planData] = await Promise.all(prePaymentRequests);

    logger.info(`${appointmentId} - getAppointmentData - ${JSON.stringify(appointmentData.data)}`);
    let totalPayAmount = 0;

    /**
     * If error occurs at getAppointmentData API, throw error and exit
     */
    if (appointmentData.data.errors && appointmentData.data.errors.length) {
      logger.error(
        `${appointmentId} - consult-payment-request-getAppointmentData - ${JSON.stringify(appointmentData.data.errors)}`
      );
      throw new Error(`Error Occured in getAppointmentData for appointmentID:${appointmentId}`);
    }

    /**
     * If error occurs at getPlanPrice API, throw error and exit
     */
    if (planData) {
      if (planData.data.errors && planData.data.errors.length) {
        logger.error(
          `${appointmentId} - consult-payment-request-getPlanPrice - ${JSON.stringify(planData.data.errors)}`
        );
        throw new Error(`Error Occured in getAppointmentData for appointmentID:${appointmentId}`);
      }
      //totalPayAmount += planData.data.data.getPlanPrice.price;
      totalPayAmount = 300;
    }

    const {
      discountedAmount,
      patientId: patientIdExisting,
    } = appointmentData.data.data.getAppointmentData.appointmentsHistory[0];
    totalPayAmount += discountedAmount;
    if (planId) {
      //get price from planId
      const planPrice = 300;
      totalPayAmount = +new Decimal(planPrice).plus(totalPayAmount);
    }
    const paymentOrderId = generatePaymentOrderId();

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
        `${appointmentId} - consult-payment-request - ${JSON.stringify(updateResp.data.errors)}`
      );
      throw new Error(`Error Occured in updatePaymentOrderId for appoinment id: ${appointmentId}`);
    }

    const success = await initPayment(
      patientIdExisting,
      paymentOrderId,
      totalPayAmount,
      merc_unq_ref,
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
        `${appointmentIdGlobal} - consult-payment-request - ${JSON.stringify(e.response.data)}`
      );
    } else {
      logger.error(`${appointmentIdGlobal} - consult-payment-request -  ${e.stack}`);
    }
    res.status(400).json({
      status: 'failed',
      reason: 'Something went wrong, please try again!',
      code: '10001',
    });
  }
};


