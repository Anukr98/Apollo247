import React, { useState, useEffect, useRef } from 'react';
import {
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
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { BookingInfo } from '@aph/mobile-patients/src/components/PaymentGateway/Components/BookingInfo';
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
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import {
  CREATE_ORDER,
  UPDATE_ORDER,
  VERIFY_VPA,
  INITIATE_DIAGNOSTIC_ORDER_PAYMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { TxnFailed } from '@aph/mobile-patients/src/components/PaymentGateway/Components/TxnFailed';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  VerifyVPA,
  one_apollo_store_code,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { verifyVPA, verifyVPAVariables } from '@aph/mobile-patients/src/graphql/types/verifyVPA';
import {
  DiagnosticUserPaymentAborted,
  DiagnosticPaymentPageViewed,
} from '@aph/mobile-patients/src/components/Tests/Events';
import {
  initiateDiagonsticHCOrderPaymentVariables,
  initiateDiagonsticHCOrderPayment,
} from '@aph/mobile-patients/src/graphql/types/initiateDiagonsticHCOrderPayment';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { SecureTags } from '@aph/mobile-patients/src/components/PaymentGateway/Components/SecureTag';
import { useFetchHealthCredits } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useFetchHealthCredits';
import { HealthCredits } from '@aph/mobile-patients/src/components/PaymentGateway/Components/HealthCredits';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useGetPaymentMethods } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useGetPaymentMethods';
import { diagnosticPaymentSettings } from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  isEmptyObject,
  paymentModeVersionCheck,
  goToConsultRoom,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  PaymentStatus,
  PaymentInitiated,
  PharmaOrderPlaced,
} from '@aph/mobile-patients/src/components/PaymentGateway/Events';
import { useFetchSavedCards } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useFetchSavedCards';
import Decimal from 'decimal.js';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useGetClientAuthToken } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useGetClientAuthtoken';
import { CredPay } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CredPay';
const { HyperSdkReact } = NativeModules;

export interface PaymentMethodsProps extends NavigationScreenProps {
  source?: string;
  businessLine: 'consult' | 'diagnostics' | 'pharma' | 'subscription' | 'vaccination';
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = (props) => {
  const { modifiedOrder, deliveryAddressCityId } = useDiagnosticsCart();
  const paymentId = props.navigation.getParam('paymentId');
  const customerId = props.navigation.getParam('customerId');
  const checkoutEventAttributes = props.navigation.getParam('checkoutEventAttributes');
  const cleverTapCheckoutEventAttributes = props.navigation.getParam(
    'cleverTapCheckoutEventAttributes'
  );
  const [amount, setAmount] = useState<number>(props.navigation.getParam('amount'));
  const orderDetails = props.navigation.getParam('orderDetails');
  const eventAttributes = props.navigation.getParam('eventAttributes');
  const businessLine = props.navigation.getParam('businessLine');
  const isDiagnostic = businessLine === 'diagnostics';
  const disableCod = props.navigation.getParam('disableCOD');
  const { currentPatient } = useAllCurrentPatients();
  const [banks, setBanks] = useState<any>([]);
  const [isTxnProcessing, setisTxnProcessing] = useState<boolean>(false);
  const [isVPAvalid, setisVPAvalid] = useState<boolean>(true);
  const [isCardValid, setisCardValid] = useState<boolean>(true);
  const [phonePeReady, setphonePeReady] = useState<boolean>(false);
  const [googlePayReady, setGooglePayReady] = useState<boolean>(false);
  const [availableUPIApps, setAvailableUPIapps] = useState([]);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const { authToken, setauthToken } = useAppCommonData();
  const { grandTotal, cartItems, nonCodSKus } = useShoppingCart();
  const [HCSelected, setHCSelected] = useState<boolean>(false);
  const [burnHc, setburnHc] = useState<number>(0);
  const storeCode =
    Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS;
  const shoppingCart = useShoppingCart();
  const { paymentCodMessage } = shoppingCart;
  const isDiagnosticModify = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  const [showPrepaid, setShowPrepaid] = useState<boolean>(isDiagnostic ? false : true);
  const [showCOD, setShowCOD] = useState<boolean>(isDiagnostic ? false : true);
  const [showDiagnosticHCMsg, setShowDiagnosticHCMsg] = useState<string>('');
  const paymentType = useRef<string>('');
  const [areNonCODSkus, setAreNonCODSkus] = useState(false);
  const { healthCredits } = useFetchHealthCredits(businessLine);
  const { paymentMethods, cardTypes, fetching } = useGetPaymentMethods(paymentId);
  const { savedCards } = useFetchSavedCards(customerId);
  const clientAuthToken = !!customerId
    ? useGetClientAuthToken(customerId, businessLine)
    : undefined;
  const [cred, setCred] = useState<any>(undefined);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.HyperSdkReact);
    const eventListener = eventEmitter.addListener('HyperEvent', (resp) => {
      handleEventListener(resp);
    });
    fecthPaymentOptions();
    isPhonePeReady();
    isGooglePayReady();
    return () => eventListener.remove();
  }, []);

  useEffect(() => {
    if (isDiagnostic) {
      DiagnosticPaymentPageViewed(currentPatient, amount);
      //modify -> always show prepaid
      // modify -> not to show cod
      setShowPrepaid(AppConfig.Configuration.Enable_Diagnostics_Prepaid);
      isDiagnosticModify ? setShowCOD(false) : fetchDiagnosticPaymentMethods();
    }
  }, []);

  useEffect(() => {
    if (cartItems?.length) {
      const skusNotForCod = cartItems?.find((item) => nonCodSKus?.includes(item?.id));
      const areNonCodSkus = !!skusNotForCod?.id;
      setAreNonCODSkus(areNonCodSkus);
    }
  }, [cartItems]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      return !HyperSdkReact.isNull() && HyperSdkReact.onBackPressed();
    });
    return () => BackHandler.removeEventListener('hardwareBackPress', () => null);
  }, []);

  useEffect(() => {
    healthCredits && updateAmount();
  }, [HCSelected]);

  const updateAmount = () => {
    const redeemableAmount = grandTotal;
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
    !!clientAuthToken && checkCredEligibility();
  }, [clientAuthToken]);

  const checkCredEligibility = () => {
    const mobileNo = currentPatient?.mobileNumber.substring(3);
    CheckCredEligibility(currentPatient?.id, mobileNo, String(amount), clientAuthToken);
  };

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
        status
          ? (handleTxnStatus(status, payload), setisTxnProcessing(false))
          : !payload?.error && setAvailableUPIapps(payload?.payload?.availableApps || []);
        break;
      case 'isDeviceReady':
        payload?.requestId == 'phonePe' && status && setphonePeReady(true);
        payload?.requestId == 'googlePay' && status && setGooglePayReady(true);
        break;
      case 'eligibility':
        const eligibleApps = payload?.payload?.apps?.[0]?.paymentMethodsEligibility;
        setCred(eligibleApps?.find((item: any) => item?.paymentMethod == 'CRED'));
        break;
      default:
        payload?.error && handleError(payload?.errorMessage);
    }
  };

  const handleTxnStatus = (status: string, payload: any) => {
    switch (status) {
      case 'CHARGED':
        navigatetoOrderStatus(false, 'success');
        break;
      case 'AUTHORIZING':
        navigatetoOrderStatus(false, 'pending');
        break;
      case 'PENDING_VBV':
        handlePaymentPending(payload?.errorCode);
        break;
      default:
        // includes cases AUTHENTICATION_FAILED, AUTHORIZATION_FAILED, JUSPAY_DECLINED
        showTxnFailurePopUP();
    }
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

  const handlePaymentPending = (errorCode: string) => {
    triggerUserPaymentAbortedEvent(errorCode);
    switch (errorCode) {
      case 'JP_002':
      case 'JP_005':
      case 'JP_009':
      case 'JP_012':
        // User aborted txn or no Internet or user had exceeded the limit of incorrect OTP submissions or txn failed at PG end
        showTxnFailurePopUP();
        break;
      case 'JP_006':
        // txn status is awaited
        navigatetoOrderStatus(false, 'pending');
        break;
      default:
        showTxnFailurePopUP();
    }
  };

  const fecthPaymentOptions = async () => {
    const response: boolean = await isSDKInitialised();
    if (response) {
      fetchPaymentMethods(currentPatient?.id);
      fetchAvailableUPIApps(currentPatient?.id);
    }
  };

  const createJusPayOrder = (cod: boolean) => {
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
      mutation: !!authToken ? UPDATE_ORDER : CREATE_ORDER,
      variables: { order_input: orderInput },
      fetchPolicy: 'no-cache',
    });
  };

  const initiateOrderPayment = async () => {
    // Api is called to update the order status from Quote to Payment Pending
    try {
      const input: initiateDiagonsticHCOrderPaymentVariables = {
        diagnosticInitiateOrderPaymentInput: { orderId: orderDetails?.orderId },
      };
      const res = await client.mutate<
        initiateDiagonsticHCOrderPayment,
        initiateDiagonsticHCOrderPaymentVariables
      >({
        mutation: INITIATE_DIAGNOSTIC_ORDER_PAYMENT,
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

  function triggerWebengege(type: string, instrument: string) {
    paymentType.current = type;
    PaymentInitiated(amount, businessLine, type, paymentId, instrument);
  }

  function triggerUserPaymentAbortedEvent(errorCode: string) {
    //JP_002 -> User aborted payment
    errorCode === 'JP_002' &&
      isDiagnostic &&
      DiagnosticUserPaymentAborted(currentPatient, orderDetails?.orderId);
  }

  async function onPressBank(bankCode: string) {
    triggerWebengege('NetBanking-' + bankCode, 'NB');
    const token = await getClientToken();
    token
      ? InitiateNetBankingTxn(currentPatient?.id, token, paymentId, bankCode)
      : renderErrorPopup();
  }

  async function onPressWallet(wallet: string) {
    triggerWebengege('Wallet-' + wallet, 'WALLET');
    const token = await getClientToken();
    token
      ? wallet == 'PHONEPE' && phonePeReady
        ? InitiateUPISDKTxn(currentPatient?.id, token, paymentId, wallet, 'ANDROID_PHONEPE')
        : InitiateWalletTxn(currentPatient?.id, token, paymentId, wallet)
      : renderErrorPopup();
  }

  async function onPressCred() {
    const token = await getClientToken();
    const mobileNo = currentPatient?.mobileNumber.substring(3);
    token ? InitiateCredTxn(currentPatient?.id, token, paymentId, mobileNo) : renderErrorPopup();
  }

  async function onPressUPIApp(app: any) {
    triggerWebengege('UPIApp-' + app?.payment_method_name, 'UPI');
    const token = await getClientToken();
    const paymentCode = app?.payment_method_code;
    const sdkPresent =
      paymentCode == 'com.phonepe.app' && phonePeReady
        ? 'ANDROID_PHONEPE'
        : // : paymentCode == 'com.google.android.apps.nbu.paisa.user' && googlePayReady
          // ? 'ANDROID_GOOGLEPAY'
          '';
    const paymentMethod =
      paymentCode == 'com.phonepe.app'
        ? 'PHONEPE'
        : // : paymentCode == 'com.google.android.apps.nbu.paisa.user'
          // ? 'GOOGLEPAY'
          '';
    token
      ? sdkPresent
        ? InitiateUPISDKTxn(currentPatient?.id, token, paymentId, paymentMethod, sdkPresent)
        : InitiateUPIIntentTxn(currentPatient?.id, token, paymentId, paymentCode)
      : renderErrorPopup();
  }

  async function onPressVPAPay(VPA: string) {
    triggerWebengege('UPI Collect', 'UPI');
    try {
      setisTxnProcessing(true);
      const response = await verifyVPA(VPA);
      if (response?.data?.verifyVPA?.status == 'VALID') {
        const token = await getClientToken();
        token ? InitiateVPATxn(currentPatient?.id, token, paymentId, VPA) : renderErrorPopup();
      } else {
        setisTxnProcessing(false);
        setisVPAvalid(false);
      }
    } catch (e) {
      showTxnFailurePopUP();
    }
  }

  async function onPressNewCardPayNow(cardInfo: any, saveCard: boolean) {
    triggerWebengege('Card', 'CARD');
    const token = await getClientToken();
    token
      ? InitiateCardTxn(currentPatient?.id, token, paymentId, cardInfo, saveCard)
      : renderErrorPopup();
  }

  async function onPressSavedCardPayNow(cardInfo: any, cvv: string) {
    triggerWebengege('Card', 'CARD');
    const token = await getClientToken();
    token
      ? InitiateSavedCardTxn(currentPatient?.id, token, paymentId, cardInfo, cvv)
      : renderErrorPopup();
  }

  async function onPressPayByCash() {
    triggerWebengege('Cash', 'COD');
    setisTxnProcessing(true);
    try {
      businessLine == 'diagnostics' && initiateOrderPayment();
      const response = await createJusPayOrder(true);
      const { data } = response;
      const status =
        data?.createOrderV2?.payment_status || data?.updateOrderDetails?.payment_status;
      status == 'TXN_SUCCESS' ? navigatetoOrderStatus(true, 'success') : showTxnFailurePopUP();
    } catch (e) {
      showTxnFailurePopUP();
    }
  }

  async function onPressplaceHcOrder() {
    triggerWebengege('HealthCredits', 'HEALTH_CREDITS');
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

  const OtherBanks = () => {
    const topBanks = paymentMethods?.find((item: any) => item?.name == 'FEATURED_BANKS');
    let otherBanks = paymentMethods?.find((item: any) => item?.name == 'OTHER_BANKS');
    const methods =
      topBanks?.payment_methods?.map((item: any) => item?.payment_method_code).slice(0, 4) || [];
    otherBanks = otherBanks?.payment_methods?.filter(
      (item: any) => !methods?.includes(item?.payment_method_code)
    );
    triggerWebengege('NetBanking - OtherBanks', 'NB');
    props.navigation.navigate(AppRoutes.OtherBanks, {
      paymentId: paymentId,
      amount: amount,
      burnHc: burnHc,
      banks: otherBanks,
      orderId: orderDetails?.orderId,
      businessLine: businessLine,
    });
  };

  const filterUPIApps = () => {
    if (availableUPIApps?.length) {
      const available = availableUPIApps?.map((item: any) => item?.packageName);
      const UPIApps = paymentMethods?.find((item: any) => item?.name == 'UPI')?.payment_methods;
      const apps = UPIApps?.map((app: any) => {
        if (
          available.includes(app?.payment_method_code) &&
          paymentModeVersionCheck(app?.minimum_supported_version)
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
    businessLine == 'diagnostics' && props.navigation.goBack();
  };

  const navigatetoOrderStatus = (isCOD: boolean, paymentStatus: string) => {
    PaymentStatus(paymentStatus, businessLine, paymentId);
    setauthToken?.('');
    switch (businessLine) {
      case 'diagnostics':
        props.navigation.navigate(AppRoutes.OrderStatus, {
          paymentId: paymentId,
          orderDetails: orderDetails,
          isCOD: isCOD,
          eventAttributes,
          paymentStatus: paymentStatus,
          isModify: isDiagnosticModify ? modifiedOrder : null,
        });
        break;
      case 'consult':
        props.navigation.navigate(AppRoutes.ConsultPaymentStatus, {
          orderDetails: orderDetails,
          paymentStatus: paymentStatus,
          paymentId: paymentId,
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
            isCOD
          );
        props.navigation.navigate(AppRoutes.PharmacyPaymentStatus, {
          paymentStatus: paymentStatus,
          price: amount,
          transId: paymentId,
          orderDetails: orderDetails,
          checkoutEventAttributes: checkoutEventAttributes,
          cleverTapCheckoutEventAttributes,
        });
        break;
      case 'subscription':
        const params = orderDetails?.circleParams;
        goToConsultRoom(props.navigation, params);
        break;
      case 'vaccination':
        props.navigation.navigate(AppRoutes.VaccineBookingConfirmationScreen, {
          appointmentId: orderDetails?.orderId,
          displayId: orderDetails?.displayId,
          paymentStatus: paymentStatus,
          paymentId: paymentId,
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

  const renderHeader = () => {
    return (
      <Header
        container={styles.header}
        leftIcon={'backArrow'}
        title={`AMOUNT TO PAY : ₹ ${amount}`}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderBookingInfo = () => {
    return (
      <BookingInfo
        LOB={businessLine}
        orderDetails={orderDetails}
        modifyOrderDetails={modifiedOrder}
      />
    );
  };

  const showPaymentOptions = () => {
    //showPrepaid is true for all vertical except diagnostics
    return !!paymentMethods?.length
      ? paymentMethods.map((item: any) => {
          const minVersion = item?.minimum_supported_version;
          const versionCheck = paymentModeVersionCheck(minVersion);
          const methods = item?.payment_methods || [];
          switch (item?.name) {
            case 'COD':
              return !!amount && versionCheck && renderPayByCash();
            case 'CARD':
              return !!amount && versionCheck && showPrepaid && renderCards();
            case 'WALLET':
              return !!amount && versionCheck && showPrepaid && renderWallets(methods);
            case 'CRED':
              return !!amount && versionCheck && showPrepaid && renderCred(methods[0]);
            case 'UPI':
              return !!amount && versionCheck && showPrepaid && renderUPIPayments(filterUPIApps());
            case 'FEATURED_BANKS':
              return !!amount && versionCheck && showPrepaid && renderNetBanking(methods);
            case 'HEALTH_CREDITS':
              return versionCheck && showPrepaid && renderHealthCredits();
          }
        })
      : renderPayByCash();
  };

  const renderHealthCredits = () => {
    return healthCredits && businessLine == 'pharma' ? (
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
    return <Wallets wallets={wallets} onPressPayNow={onPressWallet} />;
  };

  const renderCred = (info: any) => {
    return !!cred && cred?.isEligible ? (
      <CredPay credInfo={cred} paymentMethod={info} onPressPayNow={onPressCred} />
    ) : null;
  };

  const renderUPIPayments = (upiApps: any) => {
    return (
      <UPIPayments
        isVPAvalid={isVPAvalid}
        upiApps={upiApps}
        onPressUPIApp={onPressUPIApp}
        onPressPay={onPressVPAPay}
        setisVPAvalid={setisVPAvalid}
      />
    );
  };

  const renderCards = () => {
    return (
      <Cards
        savedCards={savedCards}
        onPressNewCardPayNow={onPressNewCardPayNow}
        onPressSavedCardPayNow={onPressSavedCardPayNow}
        cardTypes={cardTypes}
        isCardValid={isCardValid}
        setisCardValid={setisCardValid}
      />
    );
  };

  const renderNetBanking = (topBanks: any) => {
    return (
      <NetBanking
        topBanks={topBanks}
        onPressOtherBanks={() => OtherBanks()}
        onPressBank={onPressBank}
      />
    );
  };

  const renderPayByCash = () => {
    return (
      <PayByCash
        businessLine={businessLine}
        HCselected={HCSelected}
        onPressPlaceOrder={onPressPayByCash}
        showDiagCOD={showCOD}
        diagMsg={showDiagnosticHCMsg}
        pharmaDisableCod={disableCod}
        pharmaDisincentivizeCodMessage={paymentCodMessage}
        areNonCodSkus={areNonCODSkus}
      />
    );
  };

  const showTxnFailurePopUP = () => {
    setisTxnProcessing(false);
    PaymentStatus('failure', businessLine, paymentId);
    showAphAlert?.({
      unDismissable: businessLine == 'diagnostics' ? true : false,
      removeTopIcon: true,
      children: <TxnFailed onPressRetry={onPressRetryBooking} />,
    });
  };

  const renderSecureTag = () => {
    return !!paymentMethods?.length && amount != 0 ? <SecureTags /> : null;
  };

  return (
    <>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {!fetching ? (
          <ScrollView contentContainerStyle={styles.container}>
            {renderBookingInfo()}
            {showPaymentOptions()}
            {renderSecureTag()}
          </ScrollView>
        ) : (
          <Spinner />
        )}
        {isTxnProcessing && <Spinner />}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 47,
  },
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
});
