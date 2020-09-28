const axios = require('axios');
const fetch = require('node-fetch');
const { format } = require('date-fns');
const logger = require('../winston-logger')('Universal-Error-Logs');

module.exports = {
  CreateUserSubscription(mobileNumber) {
    const url = `http://${process.env.SUBSCRIPTION_SERVICE_HOST}:${process.env.SUBSCRIPTION_SERVICE_PORT}`;
    const query = `mutation {
      CreateUserSubscriptionTransactions(UserSubscriptionTransactions:{
      transaction_type:CONSULT
      amount:0
      transaction_date: "${format(new Date(), 'yyyy-MM-dd hh:mm')}"
      mobile_number:"+${mobileNumber}"

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
  },

  async getCallDetails(args) {
    const { sid } = args;
    const apiBaseUrl = `https://${process.env.EXOTEL_HDFC_API_KEY}:${process.env.EXOTEL_HDFC_API_TOKEN}@${process.env.EXOTEL_SUB_DOMAIN}`;
    const apiUrl = `${apiBaseUrl}/v1/Accounts/${process.env.EXOTEL_SID}/Calls/${sid}.json`;
    return await fetch(apiUrl, {
      method: 'GET',
    })
      .then((res) => res.json())
      .catch((error) => {
        logger.error(
          `initateCallAPILogger' CATCH_BLOCK', call sid: ${sid}: ${JSON.stringify(error)}`
        );
        throw new Error('EXOTEL_REQUEST_ERROR');
      });
  },
};
