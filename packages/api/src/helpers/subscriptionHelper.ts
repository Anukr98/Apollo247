const axios = require('axios');
import { TransactionType } from 'ApiConstants';
import { format } from 'date-fns';
import { log } from 'customWinstonLogger';

type SuccessTransactionInputForSubscription = {
  amount: string;
  transactionType: TransactionType;
  transactionDate: Date;
  transactionId: string;
  sourceTransactionIdentifier: string;
  mobileNumber: string;
  couponAvailed?: boolean;
  userSubscriptionId?: string;
  subscriptionInclusionId?: string;
};

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
  const url = `${process.env.SUBSCRIPTION_SERVICE_HOST}`;
  const query = `mutation {
      CreateUserSubscriptionTransactions(UserSubscriptionTransactions:{
       user_subscription_id: "${userSubscriptionId || ''}"
       subscription_inclusion_id: "${subscriptionInclusionId || ''}"
       transaction_type: ${transactionType}
       transaction_date: "${format(new Date(transactionDate), 'yyyy-MM-dd hh:mm')}"
       amount: ${parseFloat(amount)}
       source_transaction_indentifier: "${sourceTransactionIdentifier}",
       mobile_number:"${mobileNumber}",
       payment_reference_id: "${transactionId}",
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
      Authorization: process.env.SUBSCRIPTION_AUTH_TOKEN,
    },
  })
    .then((response: any) => {
      log(
        'TransactionSucessLogger',
        'transactionSuccessTrigger=>success',
        `orderId:${sourceTransactionIdentifier}`,
        response.data,
        ''
      );
    })
    .catch((error: any) => {
      log(
        'TransactionSucessLogger',
        'transactionSuccessTrigger=>failed',
        `orderId:${sourceTransactionIdentifier}`,
        '',
        JSON.stringify(error)
      );
    });
}
