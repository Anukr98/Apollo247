const axios = require('axios');
const fetch = require('node-fetch');
const { format } = require('date-fns');
const logger = require('../winston-logger')('Universal-Error-Logs');
const { getCache } = require('./connectRedis');
const { postWebEngageEvent } = require('./webEngage');
const Constants = require('../Constants');

module.exports = {
  async exotelCallEndHandler(req, res) {
    try {
      const EXOTEL_HDFC_CALL_PREFIX = 'exotelcall:hdfc';

      const { mobileNumber } = req.query;
      const key = `${EXOTEL_HDFC_CALL_PREFIX}:${mobileNumber}`;
      let callEndResponse = await getCache(key);
      callEndResponse = JSON.parse(callEndResponse);
      console.log(callEndResponse);
      const { benefitId } = callEndResponse;

      const callDetails = await getCallDetails(callEndResponse);
      const status = callDetails['Call']['Status'];
      const eventData = {
        userId: mobileNumber,
        eventData: {
          benefitId
        },
        eventName: eventMapper(status)
      }
      console.log(eventData, 'hitting event')
      postWebEngageEvent(eventData);
      if (status == Constants.EXOTEL_CALL_END_STATUS.COMPLETED) {
        await CreateUserSubscription(mobileNumber, benefitId);
      }
      res.json({ success: true });
    } catch (error) {
      throw new Error(error);
    }
  }
};


async function CreateUserSubscription(mobileNumber, benefitID) {
  const url = `http://${process.env.SUBSCRIPTION_SERVICE_HOST}:${process.env.SUBSCRIPTION_SERVICE_PORT}`;
  const query = `mutation {
    CreateUserSubscriptionTransactions(UserSubscriptionTransactions:{
    transaction_type:CONSULT
    amount:0
    transaction_date: "${format(new Date(), 'yyyy-MM-dd hh:mm')}"
    mobile_number:"+${mobileNumber}"
    subscription_inclusion_id: "${benefitID || ''}"

   }){
     success,
     message
   }
 }`;

  axios({
    url,
    method: 'post',
    data: {
      query,
    },
    headers: {
      Authorization: process.env.SUBSCRIPTION_SERVICE_AUTH_TOKEN,
    },
  })
    .then((response) => {
      logger.info(
        `CreateUserSubscriptionTransactionsLogger=>success mobileNumber:${mobileNumber}`
      );
    })
    .catch((error) => {
      logger.error(
        `CreateUserSubscriptionTransactionsLogger=>failed mobileNumber:${mobileNumber}: ${error}`
      );
    });
}

async function getCallDetails(args) {
  const { sid } = args;
  const apiBaseUrl = `https://${process.env.EXOTEL_HDFC_API_KEY}:${process.env.EXOTEL_HDFC_API_TOKEN}@${process.env.EXOTEL_SUB_DOMAIN}`;
  const apiUrl = `${apiBaseUrl}/v1/Accounts/${process.env.EXOTEL_SID}/Calls/${sid}.json`;
  console.log(apiUrl);
  return await fetch(apiUrl, {
    method: 'GET',
  })
    .then((res) => res.json())
    .catch((error) => {
      logger.error(
        `CreateUserSubscriptionTransactionsLogger'=>failed, call sid: ${sid}: ${JSON.stringify(
          error
        )}`
      );
      throw new Error('EXOTEL_REQUEST_ERROR');
    });
}


const eventMapper = function (status) {
  if (status == Constants.EXOTEL_CALL_END_STATUS.COMPLETED || status == Constants.EXOTEL_CALL_END_STATUS.IN_PROGRESS) {
    return 'HDFCAPICallTrue';
  } else {
    return 'HDFCAPICallFail'
  }
}
