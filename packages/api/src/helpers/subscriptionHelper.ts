const axios = require('axios');
import { TransactionType } from 'ApiConstants';
import { format } from 'date-fns';
import { log } from 'customWinstonLogger';

type SuccessTransactionInputForSubscription = {
  amount: string;
  transactionType: TransactionType;
  transactionDate: Date;
  transactionId?: string;
  sourceTransactionIdentifier?: string;
  mobileNumber: string;
  couponAvailed?: boolean;
  userSubscriptionId?: string;
  subscriptionInclusionId?: string;
};
export async function fetchUserSubscription(mobileNumber: string) {
  const url = `http://${process.env.SUBSCRIPTION_SERVICE_HOST}:${process.env.SUBSCRIPTION_SERVICE_PORT}`;
  const requestJSON = {
    query: `query{
    GetSubscriptionsOfUserByStatus(mobile_number: ${mobileNumber},status: ["active"])
    {
      response
      {
        group_plan
        {
          plan_id
          group
          {
            name
          }
        }
      }
    }
  }`,
  };
  const response = await axios.post(url, requestJSON);
  if (response?.data?.data?.GetSubscriptionsOfUserByStatus?.response[0].group_plan) {
    return `${response.data.data.response[0].group_plan.group.name}:${response.data.data.response[0].group_plan.plan_id}`;
  } else return '';
}
export async function transactionSuccessTrigger(args: SuccessTransactionInputForSubscription) {
  const {
    amount,
    transactionType,
    transactionDate,
    sourceTransactionIdentifier,
    transactionId,
    mobileNumber,
    couponAvailed,
    userSubscriptionId,
    subscriptionInclusionId,
  } = args;
  const url = `http://${process.env.SUBSCRIPTION_SERVICE_HOST}:${process.env.SUBSCRIPTION_SERVICE_PORT}`;
  const query = `mutation {
      CreateUserSubscriptionTransactions(UserSubscriptionTransactions:{
       user_subscription_id: "${userSubscriptionId || ''}"
       subscription_inclusion_id: "${subscriptionInclusionId || ''}"
       transaction_type: ${transactionType}
       transaction_date: "${format(new Date(transactionDate), 'yyyy-MM-dd hh:mm')}"
       amount: ${parseFloat(amount)}
       source_transaction_indentifier: "${sourceTransactionIdentifier || ''} "
       mobile_number:"${mobileNumber}"
       payment_reference_id: "${transactionId || ''}",
       coupon_availed: "${couponAvailed || false}"
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
    .then((response: any) => {
      log(
        'consultServiceLogger',
        'transactionSuccessTrigger=>success',
        `orderId:${sourceTransactionIdentifier || ''}`,
        response.data,
        ''
      );
    })
    .catch((error: any) => {
      log(
        'consultServiceLogger',
        'transactionSuccessTrigger=>failed',
        `orderId:${sourceTransactionIdentifier || ''}`,
        '',
        JSON.stringify(error)
      );
    });
}
