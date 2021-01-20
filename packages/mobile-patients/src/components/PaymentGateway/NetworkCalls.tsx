// import HyperSdkReact from '​hyper-sdk-react​';
import { NativeModules } from 'react-native';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import Axios, { AxiosResponse } from 'axios';

const { HyperSdkReact } = NativeModules;

export const preFetchSDK = (requestId: string) => {
  const payLoad: any = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      clientId: AppConfig.Configuration.clientId,
    },
  };
  // To keep the SDK upto date with the latest changes
  HyperSdkReact.preFetch(JSON.stringify(payLoad));
};

export const createHyperServiceObject = () => {
  //This method creates an instance of HyperServices class in the React Bridge Module on which all the HyperSDK APIs / methods are triggered
  HyperSdkReact.createHyperServices();
};

export const initiateSDK = (customerId: string, requestId: string) => {
  const initiatePayload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'initiate',
      merchantId: AppConfig.Configuration.merchantId,
      clientId: AppConfig.Configuration.clientId,
      customerId: customerId, //Any unique refrences to current customer
      environment: AppConfig.Configuration.jusPayenvironment,
    },
  };
  //It is highly recommended to initiate SDK from the order summary page
  HyperSdkReact.initiate(JSON.stringify(initiatePayload));
};

// export const handleEventListener = (resp: any) => {
//   var data = JSON.parse(resp);
//   var event: string = data.event || '';
//   console.log('data >>>>', data);
//   switch (event) {
//     case 'show_loader':
//       // show some loader here
//       console.log('show_loader');
//       break;
//     case 'hide_loader':
//       // hide the loader
//       console.log('hide_loader');
//       break;
//     case 'initiate_result':
//       var payload = data.payload || {};
//       console.log('initiate_result: ', payload);
//       // merchant code
//       break;
//     case 'process_result':
//       var payload = data.payload || {};
//       console.log('process_result: ', payload);
//       // merchant code
//       break;
//     default:
//       console.log('Unknown Event', data);
//   }
// };

export const isSDKInitialised = () => {
  return HyperSdkReact.isInitialised();
};

export const fetchPaymentMethods = (requestId: string) => {
  const processPayload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'getPaymentMethods',
    },
  };
  HyperSdkReact.process(JSON.stringify(processPayload));
};

export const InitiateNetBankingTxn = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  bankCode: string
) => {
  const netBankingPayload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'nbTxn',
      orderId: paymentOrderId,
      paymentMethod: bankCode,
      endUrls: [AppConfig.Configuration.returnUrl],
      clientAuthToken: clientAuthToken,
    },
  };
  console.log('netBankingPayload >>>', netBankingPayload);
  HyperSdkReact.process(JSON.stringify(netBankingPayload));
};

export const InitiateCardTxn = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  cardInfo: any
) => {
  const cardPayload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'cardTxn',
      orderId: paymentOrderId,
      endUrls: [AppConfig.Configuration.returnUrl],
      paymentMethod: cardInfo?.cardType,
      cardNumber: cardInfo?.cardNumber,
      cardExpMonth: cardInfo?.ExpMonth,
      cardExpYear: cardInfo?.ExpYear,
      cardSecurityCode: cardInfo?.CVV,
      saveToLocker: false,
      clientAuthToken: clientAuthToken,
    },
  };
  HyperSdkReact.process(JSON.stringify(cardPayload));
};

export const InitiateWalletTxn = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  wallet: string
) => {
  const walletPayload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'walletTxn',
      orderId: paymentOrderId,
      paymentMethod: wallet,
      endUrls: [AppConfig.Configuration.returnUrl],
      clientAuthToken: clientAuthToken,
    },
  };
  console.log('walletPayload >>', walletPayload);
  HyperSdkReact.process(JSON.stringify(walletPayload));
};

export const CardInfo = (sixdigits: string) => {
  const url = `${AppConfig.Configuration.jusPaybaseUrl}/${sixdigits}?merchant_id=${AppConfig.Configuration.merchantId}`;
  return Axios.get(url);
};

export const InitiateUPIIntentTxn = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  paymentMethod: string,
  sdkPresent: string
) => {
  const IntentPayload: any = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'walletTxn',
      orderId: paymentOrderId,
      paymentMethod: paymentMethod,
      sdkPresent: sdkPresent,
      endUrls: [AppConfig.Configuration.returnUrl],
      clientAuthToken: clientAuthToken,
    },
  };
  if (paymentMethod == 'GOOGLEPAY') {
    IntentPayload['payload']['allowedMethods'] = ['UPI'];
  }
  console.log('IntentPayload >>', IntentPayload);
  HyperSdkReact.process(JSON.stringify(IntentPayload));
};

export const InitiateVPATxn = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  VPA: string
) => {
  const VPAPayload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'upiTxn',
      orderId: paymentOrderId,
      custVpa: VPA,
      upiSdkPresent: true,
      endUrls: [AppConfig.Configuration.returnUrl],
      displayNote: 'UPI Collect',
      clientAuthToken: clientAuthToken,
    },
  };
  console.log('VPAPayload >>', VPAPayload);
  HyperSdkReact.process(JSON.stringify(VPAPayload));
};