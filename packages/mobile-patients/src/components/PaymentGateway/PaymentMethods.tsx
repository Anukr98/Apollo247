import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  NativeModules,
  BackHandler,
  NativeEventEmitter,
  ScrollView,
  Platform,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/PaymentGateway/Components/Header';
import { PayByCash } from '@aph/mobile-patients/src/components/PaymentGateway/Components/PayByCash';
import { NetBanking } from '@aph/mobile-patients/src/components/PaymentGateway/Components/NetBanking';
import { Cards } from '@aph/mobile-patients/src/components/PaymentGateway/Components/Cards';
import { Wallets } from '@aph/mobile-patients/src/components/PaymentGateway/Components/Wallets';
import { UPIPayments } from '@aph/mobile-patients/src/components/PaymentGateway/Components/UPIPayments';
import {
  isSDKInitialised,
  fetchPaymentMethods,
  fetchAvailableUPIApps,
  InitiateNetBankingTxn,
  InitiateWalletTxn,
  InitiateUPIIntentTxn,
  InitiateVPATxn,
  InitiateCardTxn,
  InitiateSavedCardTxn,
  isGooglePayReady,
  isPhonePeReady,
  InitiateUPISDKTxn,
  InitiateCredTxn,
  CheckCredEligibility,
  isPayTmReady,
  fetchWalletBalance,
  createAPayWallet,
  directWalletDebit,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import {
  CREATE_ORDER,
  UPDATE_ORDER,
  VERIFY_VPA,
  GET_PAYMENT_METHODS,
  INITIATE_DIAGNOSTIC_ORDER_PAYMENT_V2,
} from '@aph/mobile-patients/src/graphql/profiles';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { TxnFailed } from '@aph/mobile-patients/src/components/PaymentGateway/Components/TxnFailed';
import { InvalidOffer } from '@aph/mobile-patients/src/components/PaymentGateway/Components/InvalidOffer';
import { AppConfig, ELIGIBLE_HC_VERTICALS } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  VerifyVPA,
  one_apollo_store_code,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { verifyVPA, verifyVPAVariables } from '@aph/mobile-patients/src/graphql/types/verifyVPA';
import {
  DiagnosticUserPaymentAborted,
  DiagnosticPaymentPageViewed,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { SecureTags } from '@aph/mobile-patients/src/components/PaymentGateway/Components/SecureTag';
import { useFetchHealthCredits } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useFetchHealthCredits';
import { HealthCredits } from '@aph/mobile-patients/src/components/PaymentGateway/Components/HealthCredits';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useGetPaymentMethods } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useGetPaymentMethods';
import {
  diagnosticPaymentSettings,
  saveJusPaySDKresponse,
  getOffersList,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  isEmptyObject,
  paymentModeVersionCheck,
  goToConsultRoom,
  getPaymentMethodsInfo,
  getIOSPackageName,
  clearStackAndNavigate,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  PaymentStatus,
  PaymentInitiated,
  PharmaOrderPlaced,
  PaymentScreenLoaded,
  PaymentTxnInitiated,
  PaymentTxnResponse,
} from '@aph/mobile-patients/src/components/PaymentGateway/Events';
import Decimal from 'decimal.js';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import DeviceInfo from 'react-native-device-info';
import {
  initiateDiagonsticHCOrderPaymentv2,
  initiateDiagonsticHCOrderPaymentv2Variables,
} from '@aph/mobile-patients/src/graphql/types/initiateDiagonsticHCOrderPaymentv2';
import string from '@aph/mobile-patients/src/strings/strings.json';

import { useGetClientAuthToken } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useGetClientAuthtoken';
import { CredPay } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CredPay';
import { Offers } from '@aph/mobile-patients/src/components/PaymentGateway/Components/Offers';
import { OfferInfo } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OfferInfo';
import { PaymentAnimations } from '@aph/mobile-patients/src/components/PaymentGateway/Components/PaymentAnimations';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import { OtherPaymentOptions } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OtherPaymentOptions';
import { CredPayPopup } from '@aph/mobile-patients/src/components/PaymentGateway/OtherPaymentsComponents/CredPayPopup';
import { PayByCashPopUp } from '@aph/mobile-patients/src/components/PaymentGateway/OtherPaymentsComponents/PayByCashPopUp';
import { NetBankingPopup } from '@aph/mobile-patients/src/components/PaymentGateway/OtherPaymentsComponents/NetBankingPopup';
import { UPICollectPopup } from '@aph/mobile-patients/src/components/PaymentGateway/OtherPaymentsComponents/UPICollectPopup';
import { ShowBottomPopUp } from '@aph/mobile-patients/src/components/PaymentGateway/OtherPaymentsComponents/showBottomPopUp';
import { CardsPopUp } from '@aph/mobile-patients/src/components/PaymentGateway/OtherPaymentsComponents/CardsPopUp';
import { UPIAppsPopup } from '@aph/mobile-patients/src/components/PaymentGateway/OtherPaymentsComponents/UPIAppsPopup';
import { NewCard } from '@aph/mobile-patients/src/components/PaymentGateway/Components/NewCard';
import { PreferredPayments } from '@aph/mobile-patients/src/components/PaymentGateway/Components/PreferredPayments';
const { HyperSdkReact } = NativeModules;

export interface PaymentMethodsProps extends NavigationScreenProps {
  source?: string;
  businessLine:
    | 'consult'
    | 'diagnostics'
    | 'pharma'
    | 'subscription'
    | 'vaccination'
    | 'paymentLink'
    | 'doctorPackage';
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = (props) => {
  const { modifiedOrder } = useDiagnosticsCart();
  const paymentId = props.navigation.getParam('paymentId');
  const customerId = props.navigation.getParam('customerId');
  const checkoutEventAttributes = props.navigation.getParam('checkoutEventAttributes');
  const cleverTapCheckoutEventAttributes = props.navigation.getParam(
    'cleverTapCheckoutEventAttributes'
  );
  const [amount, setAmount] = useState<number>(props.navigation.getParam('amount'));
  const orderDetails = props.navigation.getParam('orderDetails');
  const eventAttributes = props.navigation.getParam('eventAttributes');
  const verticalSpecificEventAttributes = props.navigation.getParam('verticalSpecificData');
  const businessLine = props.navigation.getParam('businessLine');
  const isDiagnostic = businessLine === 'diagnostics';
  const disableCod = props.navigation.getParam('disableCOD');
  const paymentCodMessage = props.navigation.getParam('paymentCodMessage');
  const isCircleAddedToCart = props.navigation.getParam('isCircleAddedToCart');
  const oneTapPatient = props.navigation.getParam('oneTapPatient');
  const transactionId = props.navigation.getParam('transactionId');
  const orders = props.navigation.getParam('orders');

  const { currentPatient } = useAllCurrentPatients();
  const [banks, setBanks] = useState<any>([]);
  const [isTxnProcessing, setisTxnProcessing] = useState<boolean>(false);
  const [isVPAvalid, setisVPAvalid] = useState<boolean>(true);
  const [isCardValid, setisCardValid] = useState<boolean>(true);
  const [phonePeReady, setphonePeReady] = useState<boolean>(false);
  const [googlePayReady, setGooglePayReady] = useState<boolean>(false);
  const [payTmReady, setPayTmReady] = useState<boolean>(false);
  const [availableUPIApps, setAvailableUPIapps] = useState<any>(null);
  const [eligibleApps, setEligibleApps] = useState<any>(null);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const { authToken, setauthToken, pharmacyUserType } = useAppCommonData();
  const { grandTotal, serverCartAmount, cartTat } = useShoppingCart();
  const [HCSelected, setHCSelected] = useState<boolean>(false);
  const [burnHc, setburnHc] = useState<number>(0);
  const storeCode =
    Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS;
  const shoppingCart = useShoppingCart();
  const isDiagnosticModify = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  const [showPrepaid, setShowPrepaid] = useState<boolean>(isDiagnostic ? false : true);
  const [showCOD, setShowCOD] = useState<boolean>(isDiagnostic ? false : true);
  const [showDiagnosticHCMsg, setShowDiagnosticHCMsg] = useState<string>('');
  const paymentType = useRef<string>('');
  const { healthCredits } = useFetchHealthCredits(businessLine);
  const { paymentMethods, fetching } = useGetPaymentMethods(paymentId!, amount);
  const [fetchedPaymentMethods, setFetchedPaymentMethods] = useState(null);
  const { all_payment_modes, offers, saved_card_list, preferred_payment_methods } =
    fetchedPaymentMethods || paymentMethods;
  const linkedWallets = preferred_payment_methods?.linked_wallets;
  const closedPaymentModes = all_payment_modes?.filter((item: any) => item?.state == 'CLOSE');
  const recently_used_or_defined = preferred_payment_methods?.recently_used_or_defined;
  const usedWallets = recently_used_or_defined?.find((item: any) => item?.name == 'WALLET')
    ?.payment_methods;
  const usedUPIApps = recently_used_or_defined?.find((item: any) => item?.name == 'UPI')
    ?.payment_methods;
  const preferredSavedCards = preferred_payment_methods?.saved_cards?.cards || [];
  const preferredCardTokens = preferredSavedCards?.map((item: any) => item?.card_token);
  const savedCards =
    saved_card_list?.cards?.filter(
      (item: any) => !preferredCardTokens?.includes(item?.card_token)
    ) || [];
  const cardTypes = all_payment_modes?.filter((item: any) => item?.name == 'CARD')?.[0]
    ?.payment_methods;
  const clientAuthToken = !!customerId
    ? useGetClientAuthToken(customerId, businessLine)
    : undefined;
  const [cred, setCred] = useState<any>(undefined);
  const [offersList, setOffersList] = useState<any>([]);
  const [selectedPayment, setSelectedPaymentOption] = useState<any>({});
  const [offer, setoffer] = useState<any>(null);
  const [createdWallet, setcreatedWallet] = useState<any>({});
  const [walletLinking, setWalletLinking] = useState<any>('AMAZONPAY');
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [paymentStatus, setpaymentStatus] = useState<string>('');
  const requestId = currentPatient?.id || customerId || 'apollo247';
  const { isDiagnosticCircleSubscription } = useDiagnosticsCart();
  const defaultClevertapEventParams = {
    mobileNumber: currentPatient?.mobileNumber,
    vertical: businessLine,
    displayId: orderDetails?.displayId,
    paymentId: paymentId,
    amount: amount,
    availableHc: healthCredits,
  };
  const { deleteServerCart } = useServerCart();
  const [otherPaymentSelected, setOtherPaymentSelected] = useState<any>(null);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.HyperSdkReact);
    const eventListener = eventEmitter.addListener('HyperEvent', (resp) => {
      handleEventListener(resp);
    });
    fecthPaymentOptions();
    isPhonePeReady();
    isGooglePayReady();
    isPayTmReady();
    return () => eventListener.remove();
  }, []);

  useEffect(() => {
    paymentMethods && availableUPIApps && eligibleApps && savedCards && fireScreenLoadedEvent();
  }, [paymentMethods, availableUPIApps, eligibleApps, savedCards]);

  useEffect(() => {
    if (isDiagnostic) {
      DiagnosticPaymentPageViewed(currentPatient, amount, isDiagnosticCircleSubscription);
      //modify -> always show prepaid
      // modify -> not to show cod
      setShowPrepaid(AppConfig.Configuration.Enable_Diagnostics_Prepaid);
      isDiagnosticModify ? setShowCOD(false) : fetchDiagnosticPaymentMethods();
    }
  }, []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      recreateCart();
      return !HyperSdkReact.isNull() && HyperSdkReact.onBackPressed();
    });
    return () => BackHandler.removeEventListener('hardwareBackPress', () => null);
  }, []);

  useEffect(() => {
    healthCredits && updateAmount();
  }, [HCSelected]);

  const fireScreenLoadedEvent = () => {
    const intentApps = filterUPIApps()?.map((item: any) => item?.payment_method_name);
    PaymentScreenLoaded(defaultClevertapEventParams, savedCards?.length, eligibleApps, intentApps);
  };

  const updateAmount = () => {
    const redeemableAmount = amount;
    HCSelected
      ? healthCredits >= redeemableAmount
        ? (setburnHc(redeemableAmount), setAmount(Number(Decimal.sub(amount, redeemableAmount))))
        : redeemableAmount - healthCredits < 1
        ? (setburnHc(Number(Decimal.sub(healthCredits, 1))),
          setAmount(Number(Decimal.sub(amount, healthCredits).plus(1))))
        : (setburnHc(healthCredits), setAmount(Number(Decimal.sub(amount, healthCredits))))
      : (setAmount(props.navigation.getParam('amount')), setburnHc(0));
  };

  useEffect(() => {
    !!clientAuthToken &&
      (checkCredEligibility(), fetchWalletBalance(currentPatient?.id, clientAuthToken));
  }, [clientAuthToken]);

  const checkCredEligibility = () => {
    const mobileNo = currentPatient?.mobileNumber.substring(3);
    CheckCredEligibility(currentPatient?.id, mobileNo, String(amount), clientAuthToken);
  };

  useEffect(() => {
    refetchPaymentOptions();
  }, [amount]);

  const getPaymentOptions = () => {
    return client.query({
      query: GET_PAYMENT_METHODS,
      variables: { payment_order_id: paymentId, prepaid_amount: amount },
      fetchPolicy: 'no-cache',
    });
  };

  async function refetchPaymentOptions() {
    //this is to refetch offers when a user opts health credits
    try {
      const response = await getPaymentOptions();
      setFetchedPaymentMethods(response?.data?.getPaymentMethodsV3);
    } catch (error) {}
  }

  async function fetchOffers(paymentInfo?: any) {
    try {
      const orderInfo = {
        paymentId: paymentId,
        amount: String(amount),
      };
      const walletInfo = getPaymentMethodsInfo(paymentMethods, 'WALLET');
      const info = !!paymentInfo ? walletInfo.concat(paymentInfo) : walletInfo;
      const res = await getOffersList(client, orderInfo, businessLine, info);
      setOffersList(res?.data?.getOffersList);
    } catch (error) {}
  }

  async function fetchDiagnosticPaymentMethods() {
    const DEFAULT_COD_CONFIGURATION = AppConfig.Configuration.Enable_Diagnostics_COD;
    try {
      const response = await diagnosticPaymentSettings(client, paymentId);
      if (response?.data) {
        const getCodSetting = response?.data?.getDiagnosticPaymentSettings?.cod;
        const getHCMsgSetting = response?.data?.getDiagnosticPaymentSettings?.hc_credits_message;
        setShowCOD(getCodSetting!);
        !!getHCMsgSetting && getHCMsgSetting != '' && setShowDiagnosticHCMsg(getHCMsgSetting);
      }
    } catch (error) {
      CommonBugFender('PaymentMethods_fetchDiagnosticPaymentMethods', error);
      setShowCOD(DEFAULT_COD_CONFIGURATION);
    }
  }

  const handleEventListener = (resp: any) => {
    var data = JSON.parse(resp);
    var event: string = data.event || '';
    switch (event) {
      case 'process_result':
        var payload = data.payload || {};
        handleResponsePayload(payload);
        break;
      default:
    }
  };

  const handleResponsePayload = (payload: any) => {
    const status = payload?.payload?.status;
    const action = payload?.payload?.action;
    setpaymentStatus('');
    switch (action) {
      case 'getPaymentMethods':
        if (!payload?.error) {
          const paymentMethods = payload?.payload?.paymentMethods || [];
          const banks = paymentMethods?.filter((item: any) => item?.paymentMethodType == 'NB');
          setBanks(banks);
        }
        break;
      case 'nbTxn':
      case 'walletTxn':
      case 'cardTxn':
      case 'appPayTxn':
        handleTxnStatus(status, payload);
        setisTxnProcessing(false);
        break;
      case 'upiTxn':
        let activityRes = payload?.payload?.otherInfo?.response?.dropoutInfo?.activityResponse;
        if (Platform.OS == 'android') {
          activityRes = !!activityRes && activityRes != {} && JSON.parse(activityRes);
        }
        activityRes?.Status == 'FAILURE' || activityRes?.Status == 'Failed'
          ? showTxnFailurePopUP()
          : status
          ? (handleTxnStatus(status, payload), setisTxnProcessing(false))
          : !payload?.error && setAvailableUPIapps(payload?.payload?.availableApps || []);
        break;
      case 'isDeviceReady':
        payload?.requestId == 'phonePe' && status && setphonePeReady(true);
        payload?.requestId == 'googlePay' && status && setGooglePayReady(true);
        payload?.requestId == 'payTm' && status && setPayTmReady(true);
        break;
      case 'eligibility':
        const eligibleApps = payload?.payload?.apps[0]?.paymentMethodsEligibility;
        setEligibleApps(eligibleApps?.map((item: any) => item?.paymentMethod) || []);
        setCred(eligibleApps?.find((item: any) => item?.paymentMethod == 'CRED'));
        break;
      case 'createWallet':
        setWalletLinking(null);
        setOtherPaymentSelected(null);
        payload?.payload?.linked && setcreatedWallet(payload?.payload);
        break;
      case 'refreshWalletBalances':
        setWalletLinking(null);
        // setLinkedWallets(payload?.payload?.list);
        break;
      default:
        payload?.error && handleError(payload?.errorMessage);
    }
  };

  useEffect(() => {
    paymentStatus != '' && setShowAnimation(true);
  }, [paymentStatus]);

  const handleTxnStatus = (status: string, payload: any) => {
    const verticals = ['consult', 'diagnostics', 'pharma'];
    storeSDKresponse(payload);
    const errCode = payload?.payload?.otherInfo?.offers?.[0]?.errorCode;
    switch (status) {
      case 'CHARGED':
        // setpaymentStatus('success');
        navigatetoOrderStatus(false, 'success', payload);
        break;
      case 'AUTHORIZING':
        verticals.includes(businessLine)
          ? setpaymentStatus('pending')
          : navigatetoOrderStatus(false, 'pending', payload);
        break;
      case 'PENDING_VBV':
        handlePaymentPending(payload?.errorCode, payload);
        break;
      case 'JUSPAY_DECLINED':
        setoffer({ offerFailed: true, errCode: errCode });
        break;
      default:
        // includes cases AUTHENTICATION_FAILED, AUTHORIZATION_FAILED, JUSPAY_DECLINED
        showTxnFailurePopUP();
        fireTxnResponseEvent(payload, 'PAYMENT_FAILED');
    }
  };

  useEffect(() => {
    offer?.offerFailed && showTxnFailurePopUP(true, offer?.errCode);
  }, [offer]);

  function fireTxnResponseEvent(payload: any, paymentStatus: string) {
    PaymentTxnResponse(
      defaultClevertapEventParams,
      payload?.payload?.action,
      payload?.errorCode,
      payload?.payload?.status,
      paymentStatus
    );
  }
  const storeSDKresponse = (payload: any) => {
    try {
      const sdkResponse = {
        auditInput: {
          paymentOrderId: paymentId,
          source:
            Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS,
          sdkOrWebResponse: {
            action: payload?.payload?.action, // type of payment or mode of payment
            status: payload?.payload?.status, // status of the txn
            orderId: payload?.payload?.orderId, // orderId
            error: payload?.error, // boolean value, is true in case of errors
            errorCode: payload?.errorCode, // corresponding Juspay error code in case of errors
            activityResponse: payload?.payload?.otherInfo?.response?.dropoutInfo?.activityResponse,
          },
          version: DeviceInfo.getVersion(),
        },
      };
      saveJusPaySDKresponse(client, sdkResponse);
    } catch (error) {}
  };

  const handleError = (errorMessage: string) => {
    setisTxnProcessing(false);
    switch (errorMessage) {
      case 'Card number is invalid.':
        setisCardValid(false);
        break;
      default:
        showTxnFailurePopUP();
    }
  };

  const handlePaymentPending = (errorCode: string, payload: any) => {
    triggerUserPaymentAbortedEvent(errorCode);
    const verticals = ['consult', 'diagnostics', 'pharma'];
    switch (errorCode) {
      case 'JP_002':
      case 'JP_005':
      case 'JP_009':
      case 'JP_012':
        // User aborted txn or no Internet or user had exceeded the limit of incorrect OTP submissions or txn failed at PG end
        showTxnFailurePopUP();
        fireTxnResponseEvent(payload, 'PAYMENT_FAILED');
        break;
      case 'JP_006':
        // txn status is awaited
        verticals.includes(businessLine)
          ? setpaymentStatus('pending')
          : navigatetoOrderStatus(false, 'pending', payload);
        break;
      default:
        showTxnFailurePopUP();
        fireTxnResponseEvent(payload, 'PAYMENT_FAILED');
    }
  };

  const fecthPaymentOptions = async () => {
    const response: boolean = await isSDKInitialised();
    if (response) {
      fetchPaymentMethods(requestId);
      fetchAvailableUPIApps(requestId);
    }
  };

  const createJusPayOrder = (cod: boolean, updateToCOD?: boolean) => {
    const orderInput = {
      payment_order_id: paymentId,
      health_credits_used: HCSelected ? burnHc : 0,
      cash_to_collect: cod ? amount : 0,
      prepaid_amount: !cod ? amount : 0,
      store_code: storeCode,
      is_mobile_sdk: true,
      return_url: AppConfig.Configuration.baseUrl,
    };
    return client.mutate({
      mutation: !!authToken || updateToCOD ? UPDATE_ORDER : CREATE_ORDER,
      variables: { order_input: orderInput },
      fetchPolicy: 'no-cache',
    });
  };

  const initiateOrderPayment = async () => {
    // Api is called to update the order status from Quote to Payment Pending
    //changed this api from INITIATE_DIAGNOSTIC_ORDER_PAYMENT to INITIATE_DIAGNOSTIC_ORDER_PAYMENT_V2
    try {
      const input: initiateDiagonsticHCOrderPaymentv2Variables = {
        diagnosticInitiateOrderPaymentInput: { paymentOrderID: paymentId },
      };
      const res = await client.mutate<
        initiateDiagonsticHCOrderPaymentv2,
        initiateDiagonsticHCOrderPaymentv2Variables
      >({
        mutation: INITIATE_DIAGNOSTIC_ORDER_PAYMENT_V2,
        variables: input,
        fetchPolicy: 'no-cache',
      });
    } catch (error) {}
  };

  const verifyVPA = (VPA: string) => {
    const verifyVPA: VerifyVPA = {
      vpa: VPA,
      merchant_id: AppConfig.Configuration.merchantId,
    };
    return client.mutate<verifyVPA, verifyVPAVariables>({
      mutation: VERIFY_VPA,
      variables: { verifyVPA: verifyVPA },
      fetchPolicy: 'no-cache',
    });
  };

  const getClientToken = async () => {
    setisTxnProcessing(true);
    try {
      businessLine == 'diagnostics' && initiateOrderPayment();
      const response = await createJusPayOrder(false);
      const { data } = response;
      const { createOrderV2, updateOrderDetails } = data;
      const token =
        createOrderV2?.mobile_token?.client_auth_token ||
        updateOrderDetails?.mobile_token?.client_auth_token;
      setauthToken?.(token);
      return token;
    } catch (e) {
      setisTxnProcessing(false);
      renderErrorPopup();
    }
  };

  function firePaymentInitiatedEvent(
    paymentMethod: string,
    paymentMode: string,
    intentApp: any,
    isSavedCard: boolean,
    upitxnType: any,
    newCardSaved: boolean,
    isCOD: boolean,
    walletBalance?: any
  ) {
    PaymentTxnInitiated(
      defaultClevertapEventParams,
      burnHc,
      paymentMethod,
      paymentMode,
      intentApp,
      isSavedCard,
      upitxnType,
      newCardSaved,
      isCOD,
      walletBalance
    );
  }

  function triggerWebengege(type: string, instrument: string, paymentModeName?: string) {
    paymentType.current = type;
    PaymentInitiated(
      amount,
      businessLine,
      type,
      paymentId,
      instrument,
      paymentModeName,
      verticalSpecificEventAttributes
    );
  }

  function triggerUserPaymentAbortedEvent(errorCode: string) {
    //JP_002 -> User aborted payment
    errorCode === 'JP_002' &&
      isDiagnostic &&
      DiagnosticUserPaymentAborted(currentPatient, orderDetails?.orderId);
  }

  async function onPressBank(bankCode: string) {
    setOtherPaymentSelected(null);
    triggerWebengege('NetBanking-' + bankCode, 'NB', string.common.netBanking);
    firePaymentInitiatedEvent('NB', bankCode, null, false, null, false, false);
    const token = await getClientToken();
    token ? InitiateNetBankingTxn(requestId, token, paymentId, bankCode) : renderErrorPopup();
    token &&
      setSelectedPaymentOption({
        function: InitiateNetBankingTxn,
        paymentMode: bankCode,
      });
  }

  async function onPressWallet(wallet: string, bestOffer?: any) {
    setOtherPaymentSelected(null);
    triggerWebengege('Wallet-' + wallet, 'WALLET', string.common.phonePeWallet);
    firePaymentInitiatedEvent('WALLET', wallet, null, false, null, false, false);
    const offerId = bestOffer?.offer_id;
    const token = await getClientToken();
    token
      ? wallet == 'PHONEPE' && phonePeReady
        ? InitiateUPISDKTxn(requestId, token, paymentId, wallet, 'ANDROID_PHONEPE', offerId)
        : wallet == 'PAYTM' && payTmReady
        ? InitiateUPISDKTxn(requestId, token, paymentId, wallet, 'ANDROID_PAYTM', offerId)
        : InitiateWalletTxn(requestId, token, paymentId, wallet, offerId)
      : renderErrorPopup();
    const param =
      wallet == 'PHONEPE' && phonePeReady
        ? 'ANDROID_PHONEPE'
        : wallet == 'PAYTM' && payTmReady
        ? 'ANDROID_PAYTM'
        : null;
    token &&
      setSelectedPaymentOption({
        function: param ? InitiateUPISDKTxn : InitiateWalletTxn,
        paymentMode: wallet,
        additionalParam: param,
      });
  }

  async function onPressLinkWallet(wallet: string) {
    setWalletLinking(wallet);
    firePaymentInitiatedEvent('WALLET', wallet, null, false, 'LinkWallet', false, false, 0);
    createAPayWallet(currentPatient?.id, clientAuthToken);
  }

  async function onPressWalletDirectDebit(wallet: string, walletToken: string, bestOffer?: any) {
    setOtherPaymentSelected(null);
    firePaymentInitiatedEvent('WALLET', wallet, null, false, null, false, false);
    const offerId = bestOffer?.offer_id;
    const token = await getClientToken();
    const sdkPresent =
      Platform.OS == 'android' ? 'ANDROID_AMAZONPAY_TOKENIZED' : 'IOS_AMAZONPAY_TOKENIZED';
    token
      ? directWalletDebit(requestId, token, paymentId, wallet, sdkPresent, walletToken, offerId)
      : renderErrorPopup();
  }

  async function onPressCred() {
    setOtherPaymentSelected(null);
    firePaymentInitiatedEvent('CRED', 'Cred Pay', null, false, null, false, false);
    const token = await getClientToken();
    const mobileNo = currentPatient?.mobileNumber.substring(3);
    token ? InitiateCredTxn(requestId, token, paymentId, mobileNo) : renderErrorPopup();
  }

  async function onPressUPIApp(app: any) {
    setOtherPaymentSelected(null);
    triggerWebengege('UPIApp-' + app?.payment_method_name, 'UPI', app?.payment_method_name);
    const appName = app?.payment_method_name;
    firePaymentInitiatedEvent('UPI', appName, appName, false, 'Intent', false, false);

    const token = await getClientToken();
    let paymentCode = app?.payment_method_code;
    paymentCode = Platform.OS == 'android' ? paymentCode : getIOSPackageName(paymentCode);
    const sdkPresent = paymentCode == 'com.phonepe.app' && phonePeReady ? 'ANDROID_PHONEPE' : '';
    const paymentMethod = paymentCode == 'com.phonepe.app' ? 'PHONEPE' : '';
    token
      ? sdkPresent
        ? InitiateUPISDKTxn(requestId, token, paymentId, paymentMethod, sdkPresent)
        : InitiateUPIIntentTxn(requestId, token, paymentId, paymentCode)
      : renderErrorPopup();
    token &&
      setSelectedPaymentOption({
        function: sdkPresent ? InitiateUPISDKTxn : InitiateUPIIntentTxn,
        paymentMode: sdkPresent ? paymentMethod : paymentCode,
        additionalParam: sdkPresent ? sdkPresent : null,
      });
  }

  async function onPressVPAPay(VPA: string) {
    triggerWebengege('UPI Collect', 'UPI', string.common.VPA);
    firePaymentInitiatedEvent('UPI', 'Upi Collect', null, false, 'Collect', false, false);
    setOtherPaymentSelected(null);
    try {
      setisTxnProcessing(true);
      const response = await verifyVPA(VPA);
      if (response?.data?.verifyVPA?.status == 'VALID') {
        const token = await getClientToken();
        token ? InitiateVPATxn(requestId, token, paymentId, VPA) : renderErrorPopup();
        token &&
          setSelectedPaymentOption({
            function: InitiateVPATxn,
            paymentMode: VPA,
          });
      } else {
        setisTxnProcessing(false);
        setisVPAvalid(false);
      }
    } catch (e) {
      showTxnFailurePopUP();
    }
  }

  async function onPressNewCardPayNow(cardInfo: any, saveCard: boolean, bestOffer?: any) {
    triggerWebengege('Card', 'CARD', string.common.Card);
    firePaymentInitiatedEvent('CARD', cardInfo?.cardType, null, false, null, saveCard, false);
    setOtherPaymentSelected(null);
    const token = await getClientToken();
    token
      ? InitiateCardTxn(requestId, token, paymentId, cardInfo, saveCard, bestOffer?.offer_id)
      : renderErrorPopup();
    token &&
      setSelectedPaymentOption({
        function: InitiateCardTxn,
        paymentMode: cardInfo,
        additionalParam: saveCard,
      });
  }

  async function onPressSavedCardPayNow(cardInfo: any, cvv: string, bestOffer?: any) {
    setOtherPaymentSelected(null);
    triggerWebengege('Card', 'CARD', 'Card');
    firePaymentInitiatedEvent('CARD', cardInfo?.cardType, null, true, null, false, false);
    const token = await getClientToken();
    token
      ? InitiateSavedCardTxn(requestId, token, paymentId, cardInfo, cvv, bestOffer?.offer_id)
      : renderErrorPopup();
    token &&
      setSelectedPaymentOption({
        function: InitiateSavedCardTxn,
        paymentMode: cardInfo,
        additionalParam: cvv,
      });
  }

  async function onPressPayByCash(updateToCOD?: boolean) {
    hideAphAlert?.();
    setOtherPaymentSelected(null);
    triggerWebengege('Cash', 'COD', string.common.Cash);
    firePaymentInitiatedEvent('COD', 'COD', null, false, null, false, true);
    setisTxnProcessing(true);
    try {
      businessLine == 'diagnostics' && initiateOrderPayment();
      const response = await createJusPayOrder(true, updateToCOD);
      const { data } = response;
      const status =
        data?.createOrderV2?.payment_status || data?.updateOrderDetails?.payment_status;
      if (status === 'TXN_SUCCESS') {
        navigatetoOrderStatus(true, 'success');
        setisTxnProcessing(false);
      } else {
        showTxnFailurePopUP();
      }
    } catch (e) {
      showTxnFailurePopUP();
    }
  }

  async function onPressplaceHcOrder() {
    triggerWebengege('HealthCredits', 'HEALTH_CREDITS');
    firePaymentInitiatedEvent('HEALTH_CREDITS', 'HC', null, false, null, false, false);
    try {
      setisTxnProcessing(true);
      const response = await createJusPayOrder(false);
      const { data } = response;
      const status =
        data?.createOrderV2?.payment_status || data?.updateOrderDetails?.payment_status;
      status == 'TXN_SUCCESS' ? navigatetoOrderStatus(false, 'success') : showTxnFailurePopUP();
    } catch (e) {
      showTxnFailurePopUP();
    }
  }

  const filterUPIApps = () => {
    if (availableUPIApps?.length) {
      const available = availableUPIApps?.map((item: any) => item?.packageName);
      const UPIApps = all_payment_modes?.find((item: any) => item?.name == 'UPI')?.payment_methods;
      const apps = UPIApps?.map((app: any) => {
        if (
          available.includes(app?.payment_method_code) ||
          (available.includes(getIOSPackageName(app?.payment_method_code)) &&
            paymentModeVersionCheck(app?.minimum_supported_version))
        ) {
          return app;
        }
      }).filter((value: any) => value);
      return apps || [];
    } else {
      return [];
    }
  };

  const onPressRetryBooking = () => {
    hideAphAlert?.();
    setHCSelected(false);
  };

  const onPressContinue = async () => {
    try {
      hideAphAlert?.();
      if (selectedPayment) {
        const token = await getClientToken();
        const paymentCall = selectedPayment?.function;
        const param = selectedPayment?.additionalParam;
        param
          ? paymentCall(requestId, token, paymentId, selectedPayment?.paymentMode, param)
          : paymentCall(requestId, token, paymentId, selectedPayment?.paymentMode);
      } else {
        hideAphAlert?.();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const navigatetoOrderStatus = (isCOD: boolean, paymentStatus: string, payload?: any) => {
    PaymentStatus(paymentStatus, businessLine, paymentId);
    const status = paymentStatus == 'success' ? 'PAYMENT_SUCCESS' : 'PAYMENT_PENDING';
    fireTxnResponseEvent(payload, status);
    setauthToken?.('');
    switch (businessLine) {
      case 'diagnostics':
        props.navigation.navigate(AppRoutes.PaymentStatusDiag, {
          paymentId: paymentId,
          orderDetails: orderDetails,
          isCOD: isCOD,
          eventAttributes,
          paymentStatus: paymentStatus,
          isModify: isDiagnosticModify ? modifiedOrder : null,
          defaultClevertapEventParams: defaultClevertapEventParams,
          payload: payload,
          isCircleAddedToCart: isCircleAddedToCart,
          verticalSpecificEventAttributes,
          amount: props.navigation.getParam('amount'),
        });
        break;
      case 'consult':
        props.navigation.navigate(AppRoutes.PaymentStatusConsult, {
          orderDetails: orderDetails,
          paymentStatus: paymentStatus,
          paymentId: paymentId,
          defaultClevertapEventParams: defaultClevertapEventParams,
          payload: payload,
          amount: props.navigation.getParam('amount'),
        });
        break;
      case 'pharma':
        paymentStatus == 'success' &&
          PharmaOrderPlaced(
            checkoutEventAttributes,
            cleverTapCheckoutEventAttributes,
            paymentType.current,
            shoppingCart,
            paymentId,
            burnHc,
            isCOD,
            currentPatient,
            `${orderDetails?.displayId}`,
            pharmacyUserType
          );
        props.navigation.navigate(AppRoutes.PaymentStatusPharma, {
          paymentStatus: paymentStatus,
          amount: props.navigation.getParam('amount'),
          paymentId: paymentId,
          orderDetails: orderDetails,
          checkoutEventAttributes: checkoutEventAttributes,
          cleverTapCheckoutEventAttributes,
          defaultClevertapEventParams: defaultClevertapEventParams,
          isCOD: isCOD,
          payload: payload,
          transactionId,
          orders,
          cartTat,
        });
        break;
      case 'subscription':
        let params = orderDetails?.circleParams;
        params['paymentStatus'] = paymentStatus;
        goToConsultRoom(props.navigation, params);
        break;
      case 'vaccination':
        props.navigation.navigate(AppRoutes.VaccineBookingConfirmationScreen, {
          appointmentId: orderDetails?.orderId,
          displayId: orderDetails?.displayId,
          paymentStatus: paymentStatus,
          paymentId: paymentId,
          defaultClevertapEventParams: defaultClevertapEventParams,
          payload: payload,
        });
        break;
      case 'paymentLink':
        props.navigation.navigate(AppRoutes.PaymentConfirmation, {
          orderId: orderDetails?.orderId,
          paymentStatus: paymentStatus,
          paymentId: paymentId,
          amount: props.navigation.getParam('amount'),
          defaultClevertapEventParams: defaultClevertapEventParams,
          payload: payload,
        });
        break;
      case 'doctorPackage':
        props.navigation.navigate(AppRoutes.PackagePaymentStatus, {
          paymentStatus: paymentStatus,
          paymentId: paymentId,
          orderDetails: orderDetails,
          oneTapPatient: oneTapPatient,
        });
        break;
    }
  };

  const renderErrorPopup = () => {
    setisTxnProcessing(false);
    showAphAlert!({
      title: 'Uh oh! :(',
      description: 'Oops! seems like we are having an issue. Please try again.',
    });
  };

  const showOtherPaymentBottomPopUp = () => {
    const UPIapps = filterUPIApps();
    return !!otherPaymentSelected ? (
      <ShowBottomPopUp
        onDismissPopUp={() => setOtherPaymentSelected(null)}
        childComponent={getChildComponent(otherPaymentSelected)}
        paymentMode={otherPaymentSelected?.name}
        UPIapps={UPIapps}
        savedCards={savedCards}
      />
    ) : null;
  };

  const getChildComponent = (paymentInfo: any) => {
    const methods = paymentInfo?.payment_methods || [];
    switch (paymentInfo?.name) {
      case 'COD':
        return (
          <PayByCashPopUp
            onPressPayNow={onPressPayByCash}
            businessLine={businessLine}
            HCselected={HCSelected}
            showDiagCOD={showCOD}
            diagMsg={showDiagnosticHCMsg}
            pharmaDisableCod={disableCod}
            pharmaDisincentivizeCodMessage={paymentCodMessage}
          />
        );
      case 'CARD':
        return (
          <CardsPopUp
            savedCards={savedCards}
            onPressSavedCardPayNow={onPressSavedCardPayNow}
            cardTypes={cardTypes}
            offers={offers}
            amount={amount}
            onPressNewCard={() => setOtherPaymentSelected({ name: 'NEWCARD' })}
          />
        );
      case 'WALLET':
        return (
          <Wallets
            wallets={methods}
            onPressPayNow={onPressWallet}
            onPressLinkWallet={onPressLinkWallet}
            onPressDirectDebit={onPressWalletDirectDebit}
            offers={offers}
            createdWallet={createdWallet}
            linked={linkedWallets}
            amount={amount}
            walletLinking={walletLinking}
            popUp={true}
          />
        );
      case 'CRED':
        return (
          <CredPayPopup credInfo={cred} paymentMethod={paymentInfo} onPressPayNow={onPressCred} />
        );
      case 'UPI':
        return (
          <UPIAppsPopup
            upiApps={filterUPIApps()}
            onPressUPIApp={onPressUPIApp}
            onPressUpiCollect={() => setOtherPaymentSelected({ name: 'UPICOLLECT' })}
          />
        );
      case 'FEATURED_BANKS':
        return <NetBankingPopup onPressBank={onPressBank} allPaymentModes={all_payment_modes} />;
      case 'UPICOLLECT':
        return <UPICollectPopup amount={amount} onPressPay={onPressVPAPay} />;
      case 'NEWCARD':
        return (
          <NewCard
            onPressNewCardPayNow={onPressNewCardPayNow}
            cardTypes={cardTypes}
            isCardValid={isCardValid}
            setisCardValid={setisCardValid}
            offers={offersList}
            fetchOffers={fetchOffers}
            amount={amount}
          />
        );
    }
  };

  const showPaymentAnimation = () => {
    return !!showAnimation ? (
      <PaymentAnimations
        paymentId={paymentId}
        paymentStatus={paymentStatus}
        onPaymentFailure={() => {
          setShowAnimation(false);
          showTxnFailurePopUP();
        }}
        onPaymentSuccess={() => {
          setShowAnimation(false);
          navigatetoOrderStatus(false, 'success');
        }}
        onTimeOut={() => {
          clearStackAndNavigate(props.navigation, AppRoutes.PaymentFailed, {
            orderDetails: orderDetails,
            paymentId: paymentId,
            businessLine: businessLine,
            amount: amount,
          });
          setTimeout(() => setShowAnimation(false), 500);
        }}
      />
    ) : null;
  };

  const recreateCart = () => {
    businessLine == 'pharma' && deleteServerCart(false, paymentId);
  };

  const goBackToCart = () => {
    businessLine == 'pharma' && deleteServerCart(false, paymentId);
    props.navigation.goBack();
  };

  const renderHeader = () => {
    return <Header amount={amount} onPressLeftIcon={goBackToCart} />;
  };

  const renderOffers = () => {
    return <Offers offers={offers} onPressTnC={showOfferInfo} />;
  };

  const renderPreferredPaymentOptions = () => {
    return !!amount ? (
      <PreferredPayments
        amount={amount}
        preferredPayments={preferred_payment_methods}
        cardTypes={cardTypes}
        onPressSavedCardPayNow={onPressSavedCardPayNow}
        allModes={all_payment_modes}
        onPressWallet={onPressWallet}
        onPressDirectDebit={onPressWalletDirectDebit}
        onPressUPIApp={onPressUPIApp}
        availableUPIApps={availableUPIApps}
      />
    ) : null;
  };

  const showOfferInfo = (offer: any) => {
    showAphAlert!({
      removeTopIcon: true,
      children: <OfferInfo offer={offer} />,
    });
  };

  const showPaymentOptions = () => {
    //showPrepaid is true for all vertical except diagnostics
    return !!all_payment_modes?.length
      ? all_payment_modes.map((item: any) => {
          const minVersion = item?.minimum_supported_version;
          const isOpen = item?.state == 'OPEN';
          const versionCheck = paymentModeVersionCheck(minVersion);
          const showPaymentOption = isOpen && versionCheck && !!amount && showPrepaid;
          const methods = item?.payment_methods || [];
          switch (item?.name) {
            case 'COD':
              return showPaymentOption && renderPayByCash();
            case 'CARD':
              return showPaymentOption && renderCards();
            case 'WALLET':
              return showPaymentOption && renderWallets(methods);
            case 'CRED':
              return showPaymentOption && renderCred(methods[0]);
            case 'UPI':
              return showPaymentOption && renderUPIPayments(filterUPIApps());
            case 'FEATURED_BANKS':
              return showPaymentOption && renderNetBanking(methods);
            case 'HEALTH_CREDITS':
              return versionCheck && showPrepaid && renderHealthCredits();
          }
        })
      : renderPayByCash();
  };

  const renderHealthCredits = () => {
    return healthCredits ? (
      <HealthCredits
        credits={healthCredits}
        HCSelected={HCSelected}
        amount={amount}
        burnHc={burnHc}
        onPressHCoption={(value) => setHCSelected(value)}
        onPressPlaceOrder={onPressplaceHcOrder}
      />
    ) : null;
  };

  const renderWallets = (wallets: any) => {
    // Do not show linked wallets and wallets shown under preferred payment options
    const usedWalletCodes = usedWallets?.map((item: any) => item?.payment_method_code);
    const linkedWalletCodes = linkedWallets?.map((item: any) => item?.wallet);
    const filteredWallets =
      wallets?.filter(
        (item: any) =>
          !usedWalletCodes?.includes(item?.payment_method_code) &&
          !linkedWalletCodes?.includes(item?.payment_method_code)
      ) || [];
    return (
      <Wallets
        wallets={filteredWallets}
        onPressPayNow={onPressWallet}
        onPressLinkWallet={onPressLinkWallet}
        onPressDirectDebit={onPressWalletDirectDebit}
        offers={offers}
        createdWallet={createdWallet}
        walletLinking={walletLinking}
        linked={linkedWallets}
        amount={amount}
      />
    );
  };

  const renderCred = (info: any) => {
    return !!cred && cred?.isEligible ? (
      <CredPay credInfo={cred} paymentMethod={info} onPressPayNow={onPressCred} />
    ) : null;
  };

  const renderUPIPayments = (upiApps: any) => {
    // Do not show the upi apps shown under preferred payment options
    const usedUPIAppCodes = usedUPIApps?.map((item: any) => item?.payment_method_code);
    const filteredUPIApps =
      upiApps?.filter((item: any) => !usedUPIAppCodes?.includes(item?.payment_method_code)) || [];
    return (
      <UPIPayments
        isVPAvalid={isVPAvalid}
        upiApps={filteredUPIApps}
        onPressUPIApp={onPressUPIApp}
        onPressUpiCollect={() => setOtherPaymentSelected({ name: 'UPICOLLECT' })}
        setisVPAvalid={setisVPAvalid}
        onPressMoreApps={() => setOtherPaymentSelected({ name: 'UPI' })}
      />
    );
  };

  const renderCards = () => {
    return (
      <Cards
        savedCards={savedCards}
        onPressNewCard={() => setOtherPaymentSelected({ name: 'NEWCARD' })}
        onPressSavedCardPayNow={onPressSavedCardPayNow}
        cardTypes={cardTypes}
        offers={offers}
        amount={amount}
      />
    );
  };

  const renderNetBanking = (topBanks: any) => {
    return (
      <NetBanking
        topBanks={topBanks}
        onPressOtherBanks={() => setOtherPaymentSelected({ name: 'FEATURED_BANKS' })}
        onPressBank={onPressBank}
      />
    );
  };

  const renderPayByCash = () => {
    return !isDiagnosticModify ? (
      <PayByCash
        businessLine={businessLine}
        HCselected={HCSelected}
        onPressPlaceOrder={onPressPayByCash}
        showDiagCOD={showCOD}
        diagMsg={showDiagnosticHCMsg}
        pharmaDisableCod={disableCod}
        pharmaDisincentivizeCodMessage={paymentCodMessage}
      />
    ) : null;
  };

  const showTxnFailurePopUP = (invalidOffer?: boolean, errCode?: string) => {
    setoffer(null);
    setisTxnProcessing(false);
    PaymentStatus('failure', businessLine, paymentId);
    showAphAlert?.({
      unDismissable: false,
      removeTopIcon: true,
      children: invalidOffer ? (
        <InvalidOffer onPressContinue={() => onPressContinue()} errCode={errCode} />
      ) : (
        <TxnFailed
          onPressRetry={onPressRetryBooking}
          businessLine={businessLine}
          onPressCOD={() => onPressPayByCash(true)}
        />
      ),
    });
  };

  const showOtherPaymentOptions = () => {
    return !!amount ? (
      <OtherPaymentOptions
        paymentOptions={closedPaymentModes}
        onPressOtherPaymentOption={(paymentInfo: any) => setOtherPaymentSelected(paymentInfo)}
        cred={cred}
      />
    ) : null;
  };

  const renderSecureTag = () => {
    return !!all_payment_modes?.length && amount != 0 ? <SecureTags /> : null;
  };
  const keyboardVerticalOffset = Platform.OS === 'android' ? { keyboardVerticalOffset: 0 } : {};

  return (
    <>
      {!showAnimation ? (
        <SafeAreaView style={{ flex: 1 }}>
          {renderHeader()}
          {!fetching ? (
            <ScrollView
              keyboardShouldPersistTaps={'always'}
              contentContainerStyle={styles.container}
            >
              {renderOffers()}
              {renderPreferredPaymentOptions()}
              {showPaymentOptions()}
              {showOtherPaymentOptions()}
              {renderSecureTag()}
              {showOtherPaymentBottomPopUp()}
            </ScrollView>
          ) : (
            <Spinner />
          )}
          {isTxnProcessing && <Spinner />}
        </SafeAreaView>
      ) : (
        showPaymentAnimation()
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 47,
    backgroundColor: 'transparent',
  },
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
});
