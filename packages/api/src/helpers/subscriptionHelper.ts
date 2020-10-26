const axios = require('axios');

import { TransactionType } from 'ApiConstants';
import { format, addMinutes } from 'date-fns';
import { log } from 'customWinstonLogger';
import { getPortStr } from '@aph/universal/src/aphRoutes';
import { ONE_APOLLO_STORE_CODE } from 'types/oneApolloTypes';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

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
  dob?: Date;
  email?: string;
  partnerId: string;
};
export async function fetchUserSubscription(mobileNumber: string) {
  const url = `http://${process.env.SUBSCRIPTION_SERVICE_HOST}:${process.env.SUBSCRIPTION_SERVICE_PORT}`;
  const requestJSON = {
    query: `query{
    GetSubscriptionsOfUserByStatus(mobile_number: "${mobileNumber}",status: ["active"])
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
  try {
    const response = await axios.post(url, requestJSON);
    if (
      response?.data?.data?.GetSubscriptionsOfUserByStatus?.response &&
      response?.data?.data?.GetSubscriptionsOfUserByStatus?.response?.length > 0
    ) {
      return `${response.data.data.GetSubscriptionsOfUserByStatus.response[0].group_plan.group.name}:${response.data.data.GetSubscriptionsOfUserByStatus.response[0].group_plan.plan_id}`;
    } else return '';
  } catch (error) {
    return '';
  }
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
    dob,
    email,
    partnerId,
  } = args;
  const url = `http://${process.env.SUBSCRIPTION_SERVICE_HOST}${getPortStr(
    process.env.SUBSCRIPTION_SERVICE_PORT ? process.env.SUBSCRIPTION_SERVICE_PORT : '80'
  )}`;
  const query = `mutation {
      CreateUserSubscriptionTransactions(UserSubscriptionTransactions:{
       user_subscription_id: "${userSubscriptionId || ''}"
       subscription_inclusion_id: "${subscriptionInclusionId || ''}"
       transaction_type: ${transactionType}
       transaction_date: "${format(addMinutes(new Date(transactionDate), +330), 'yyyy-MM-dd hh:mm')}"
       amount: ${parseFloat(amount)}
       source_transaction_indentifier: "${sourceTransactionIdentifier || ''}"
       mobile_number:"${mobileNumber}"
       payment_reference_id: "${transactionId || ''}",
       coupon_availed: "${couponAvailed || false}"
       dob: "${dob || ''}"
       email:"${email || ''}"
       partnerId:"${partnerId || ''}"
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

export async function activateSubscription(storeCode: ONE_APOLLO_STORE_CODE, planId: string, subPlanId: string, mobileNumber: string) {
  try {
    let paramString = `plan_id:"${planId}",storeCode:"${storeCode}",mobile_number:"${mobileNumber}"`;
    if (subPlanId) {
      paramString += `,sub_plan_id:"${subPlanId}"`;
    }
    const mutation = {
      query: `
      mutation CreateUserSubscription {
        CreateUserSubscription(UserSubscription:{
          ${paramString}
        }){
          message
          code
          response{
            status
            version
            start_date
          }
        }
      }`
    };
    const url = `http://${process.env.SUBSCRIPTION_SERVICE_HOST}${getPortStr(
      process.env.SUBSCRIPTION_SERVICE_PORT ? process.env.SUBSCRIPTION_SERVICE_PORT : '80'
    )}`;
    //const url = "https://qaapi.apollo247.com";
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(mutation),
      headers: {
        'authorization': <string>process.env.SUBSCRIPTION_SERVICE_AUTH_TOKEN,
        'Content-Type': 'application/json'
      },
    });
    const resp = await response.json();
    if (resp.code > 299) {
      throw new AphError(AphErrorMessages.SUBSCRIPTION_CREATION_FAILED, resp.code, { mobileNumber })
      log(
        'profileServiceLogger',
        `Subscriptionservice response - ${mobileNumber}`,
        "saveMedicineOrderPaymentMq()->activateSubscription",
        resp,
        'true'
      )
    }
    return true;
  } catch (e) {
    log(
      'profileServiceLogger',
      `Subscriptionservice exception - ${mobileNumber}`,
      "saveMedicineOrderPaymentMq()->activateSubscription",
      e.stack,
      'true'
    )
    throw new AphError(AphErrorMessages.SUBSCRIPTION_CREATION_FAILED, "", { mobileNumber })
  }
}

export const checkDocOnCallAvailable = async function (mobileNumber: string, benefitId: string) {
  const url = `http://${process.env.SUBSCRIPTION_SERVICE_HOST}:${process.env.SUBSCRIPTION_SERVICE_PORT}`;
  const requestJSON = {
    query: `query {
      GetAllUserSubscriptionsWithPlanBenefits(mobile_number:"${mobileNumber}"){
       response   
      }
    }`,
  };
  const response = await axios.post(url, requestJSON);
  const benefits = response?.data?.data?.GetAllUserSubscriptionsWithPlanBenefits?.response[0]?.benefits;
  if (benefits) {
    return benefits.filter((el: any) => {
      return (el._id == benefitId && el.attribute == "Doc on Call") ? true : false;
    }).length > 0;
  }
  return false;
}
