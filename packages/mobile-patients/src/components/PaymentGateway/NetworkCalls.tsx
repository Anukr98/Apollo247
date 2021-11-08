// import HyperSdkReact from '​hyper-sdk-react​';
import { NativeModules } from 'react-native';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import Axios from 'axios';

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

export const initiateSDK = (customerId: string, requestId: string, merchantId: string) => {
  const initiatePayload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'initiate',
      merchantId: merchantId,
      clientId: AppConfig.Configuration.clientId,
      customerId: customerId, //Any unique refrences to current customer
      environment: AppConfig.Configuration.jusPayenvironment,
      eligibilityInInitiate: true,
    },
  };
  //It is highly recommended to initiate SDK from the order summary page
  HyperSdkReact.initiate(JSON.stringify(initiatePayload));
};

export const terminateSDK = () => {
  HyperSdkReact.terminate();
};

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
      endUrls: [AppConfig.Configuration.baseUrl],
      clientAuthToken: clientAuthToken,
    },
  };
  HyperSdkReact.process(JSON.stringify(netBankingPayload));
};

export const InitiateCardTxn = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  cardInfo: any,
  saveCard: boolean
) => {
  const cardPayload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'cardTxn',
      orderId: paymentOrderId,
      endUrls: [AppConfig.Configuration.baseUrl],
      paymentMethod: cardInfo?.cardType,
      cardNumber: cardInfo?.cardNumber,
      cardExpMonth: cardInfo?.ExpMonth,
      cardExpYear: cardInfo?.ExpYear,
      cardSecurityCode: cardInfo?.CVV,
      saveToLocker: saveCard ? true : false,
      clientAuthToken: clientAuthToken,
    },
  };
  HyperSdkReact.process(JSON.stringify(cardPayload));
};

export const InitiateWalletTxn = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  wallet: string,
  offerId?: any
) => {
  const walletPayload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'walletTxn',
      orderId: paymentOrderId,
      paymentMethod: wallet,
      endUrls: [AppConfig.Configuration.baseUrl],
      clientAuthToken: clientAuthToken,
      offers: !!offerId ? [offerId] : null,
    },
  };
  HyperSdkReact.process(JSON.stringify(walletPayload));
};

export const CardInfo = (sixdigits: string) => {
  const url = `${AppConfig.Configuration.jusPaybaseUrl}/${sixdigits}?merchant_id=${AppConfig.Configuration.merchantId}`;
  return Axios.get(url);
};

export const InitiateUPISDKTxn = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  paymentMethod: string,
  sdkPresent: string,
  offerId?: any
) => {
  const IntentPayload: any = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'walletTxn',
      orderId: paymentOrderId,
      paymentMethod: paymentMethod,
      sdkPresent: sdkPresent,
      endUrls: [AppConfig.Configuration.baseUrl],
      clientAuthToken: clientAuthToken,
      offers: !!offerId ? [offerId] : null,
    },
  };
  if (paymentMethod == 'GOOGLEPAY') {
    IntentPayload['payload']['allowedMethods'] = ['UPI'];
  }
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
      endUrls: [AppConfig.Configuration.baseUrl],
      displayNote: 'UPI Collect',
      clientAuthToken: clientAuthToken,
    },
  };
  HyperSdkReact.process(JSON.stringify(VPAPayload));
};

export const isGooglePayReady = () => {
  const payload = {
    requestId: 'googlePay',
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'isDeviceReady',
      sdkPresent: 'ANDROID_GOOGLEPAY',
    },
  };
  HyperSdkReact.process(JSON.stringify(payload));
};

export const isPhonePeReady = () => {
  const payload = {
    requestId: 'phonePe',
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'isDeviceReady',
      sdkPresent: 'ANDROID_PHONEPE',
    },
  };
  HyperSdkReact.process(JSON.stringify(payload));
};

export const isPayTmReady = () => {
  const payload = {
    requestId: 'payTm',
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'isDeviceReady',
      sdkPresent: 'ANDROID_PAYTM',
    },
  };
  HyperSdkReact.process(JSON.stringify(payload));
};

export const fetchAvailableUPIApps = (requestId: string) => {
  const payload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'upiTxn',
      orderId: requestId,
      getAvailableApps: true,
      showLoader: false,
    },
  };
  HyperSdkReact.process(JSON.stringify(payload));
};

export const InitiateUPIIntentTxn = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  packageName: string
) => {
  const payload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'upiTxn',
      orderId: paymentOrderId,
      upiSdkPresent: true,
      showLoader: false,
      payWithApp: packageName,
      displayNote: 'Payment to Apollo247',
      clientAuthToken: clientAuthToken,
    },
  };
  HyperSdkReact.process(JSON.stringify(payload));
};

export const fetchSavedCards = (requestId: string, clientAuthToken: string) => {
  const payload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'cardList',
      clientAuthToken: clientAuthToken,
    },
  };
  HyperSdkReact.process(JSON.stringify(payload));
};

export const deleteCard = (requestId: string, clientAuthToken: string, cardToken: string) => {
  const payload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'deleteCard',
      cardToken: cardToken,
      clientAuthToken: clientAuthToken,
    },
  };
  HyperSdkReact.process(JSON.stringify(payload));
};

export const InitiateSavedCardTxn = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  cardInfo: any,
  cvv: string,
  offerId?: string
) => {
  const payload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'cardTxn',
      orderId: paymentOrderId,
      paymentMethod: cardInfo?.card_brand,
      endUrls: [AppConfig.Configuration.baseUrl],
      cardToken: cardInfo?.card_token,
      cardSecurityCode: cvv,
      clientAuthToken: clientAuthToken,
      offers: !!offerId ? [offerId] : null,
    },
  };
  HyperSdkReact.process(JSON.stringify(payload));
};

export const CheckCredEligibility = (
  requestId: string,
  mobileNo: string,
  amount: string,
  clientAuthToken: string
) => {
  const payload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'eligibility',
      amount: amount, //mandatory
      clientAuthToken: clientAuthToken,
      data: {
        apps: [
          {
            checkType: ['cred'],
            mobile: mobileNo,
          },
        ],
        cards: [],
        wallets: [],
      },
    },
  };
  HyperSdkReact.process(JSON.stringify(payload));
};

export const InitiateCredTxn = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  mobileNo: string
) => {
  const payload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'appPayTxn',
      orderId: paymentOrderId,
      paymentMethod: 'CRED',
      clientAuthToken: clientAuthToken,
      application: 'CRED',
      walletMobileNumber: mobileNo, //required for collect and web-redirect flow
    },
  };
  HyperSdkReact.process(JSON.stringify(payload));
};

export const fetchWalletBalance = (requestId: string, clientAuthToken: string) => {
  const payload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'refreshWalletBalances',
      clientAuthToken: clientAuthToken,
    },
  };
  HyperSdkReact.process(JSON.stringify(payload));
};

export const linkWallet = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  paymentMethod: string,
  sdkPresent: string,
  offerId?: string
) => {
  const payload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'walletTxn',
      orderId: paymentOrderId,
      paymentMethodType: 'Wallet',
      paymentMethod: paymentMethod,
      shouldLink: true,
      sdkPresent: sdkPresent,
      endUrls: [AppConfig.Configuration.baseUrl],
      clientAuthToken: clientAuthToken,
      offers: !!offerId ? [offerId] : null,
    },
  };
  console.log('link wallet payload >>>>', payload);
  HyperSdkReact.process(JSON.stringify(payload));
};

export const directWalletDebit = (
  requestId: string,
  clientAuthToken: string,
  paymentOrderId: string,
  paymentMethod: string,
  sdkPresent: string,
  directWalletToken: string,
  offerId?: string
) => {
  const payload = {
    requestId: requestId,
    service: AppConfig.Configuration.jusPayService,
    payload: {
      action: 'walletTxn',
      orderId: paymentOrderId,
      paymentMethodType: 'Wallet',
      paymentMethod: paymentMethod,
      shouldLink: true,
      sdkPresent: sdkPresent,
      endUrls: [AppConfig.Configuration.baseUrl],
      clientAuthToken: clientAuthToken,
      directWalletToken: directWalletToken,
      offers: !!offerId ? [offerId] : null,
    },
  };
  HyperSdkReact.process(JSON.stringify(payload));
};
