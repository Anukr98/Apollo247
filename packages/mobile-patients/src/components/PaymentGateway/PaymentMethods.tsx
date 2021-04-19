import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  NativeModules,
  BackHandler,
  NativeEventEmitter,
  View,
  ScrollView,
} from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
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
  InitiateUPISDKTxn,
  InitiateUPIIntentTxn,
  InitiateVPATxn,
  InitiateCardTxn,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GET_PAYMENT_METHODS,
  CREATE_ORDER,
  PROCESS_DIAG_COD_ORDER,
  VERIFY_VPA,
  INITIATE_DIAGNOSTIC_ORDER_PAYMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AppRoutes } from '../NavigatorContainer';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { TxnFailed } from '@aph/mobile-patients/src/components/PaymentGateway/Components/TxnFailed';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  processDiagnosticHCOrder,
  processDiagnosticHCOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/processDiagnosticHCOrder';
import {
  ProcessDiagnosticHCOrderInput,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  OrderInput,
  PAYMENT_MODE,
  VerifyVPA,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  createOrder,
  createOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrder';
import { verifyVPA, verifyVPAVariables } from '@aph/mobile-patients/src/graphql/types/verifyVPA';
import { DiagnosticPaymentInitiated } from '@aph/mobile-patients/src/components/Tests/Events';
import {
  initiateDiagonsticHCOrderPaymentVariables,
  initiateDiagonsticHCOrderPayment,
} from '@aph/mobile-patients/src/graphql/types/initiateDiagonsticHCOrderPayment';
import { paymentModeVersionCheck } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

const { HyperSdkReact } = NativeModules;

export interface PaymentMethodsProps extends NavigationScreenProps {
  businessLine: 'consult' | 'diagnostics' | 'pharma' | 'subscription';
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = (props) => {
  const paymentId = props.navigation.getParam('paymentId');
  const amount = props.navigation.getParam('amount');
  const orderId = props.navigation.getParam('orderId');
  const orderDetails = props.navigation.getParam('orderDetails');
  const eventAttributes = props.navigation.getParam('eventAttributes');
  const businessLine = props.navigation.getParam('businessLine');
  const { currentPatient } = useAllCurrentPatients();
  const [banks, setBanks] = useState<any>([]);
  const [loading, setloading] = useState<boolean>(true);
  const [isTxnProcessing, setisTxnProcessing] = useState<boolean>(false);
  const [paymentMethods, setPaymentMethods] = useState<any>([]);
  const [cardTypes, setCardTypes] = useState<any>([]);
  const [isVPAvalid, setisVPAvalid] = useState<boolean>(true);
  const [isCardValid, setisCardValid] = useState<boolean>(true);
  const [availableUPIApps, setAvailableUPIapps] = useState([]);
  const paymentActions = ['nbTxn', 'walletTxn', 'upiTxn', 'cardTxn'];
  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const { authToken, setauthToken } = useAppCommonData();
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.HyperSdkReact);
    const eventListener = eventEmitter.addListener('HyperEvent', (resp) => {
      handleEventListener(resp);
    });
    fecthPaymentOptions();
    fetchTopBanks();
    return () => eventListener.remove();
  }, []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      return !HyperSdkReact.isNull() && HyperSdkReact.onBackPressed();
    });
    return () => BackHandler.removeEventListener('hardwareBackPress', () => null);
  }, []);

  const handleEventListener = (resp: any) => {
    var data = JSON.parse(resp);
    var event: string = data.event || '';
    switch (event) {
      case 'process_result':
        var payload = data.payload || {};
        const status = payload?.payload?.status;
        const action = payload?.payload?.action;
        if (action == 'getPaymentMethods' && !payload?.error) {
          const banks = payload?.payload?.paymentMethods?.filter(
            (item: any) => item?.paymentMethodType == 'NB'
          );
          setBanks(banks);
          setloading(false);
        } else if (paymentActions.indexOf(action) != -1 && status) {
          handleTxnStatus(status, payload);
          setisTxnProcessing(false);
        } else if (action == 'upiTxn' && !payload?.error && !status) {
          setAvailableUPIapps(payload?.payload?.availableApps || []);
        } else if (payload?.error) {
          handleError(payload?.errorMessage);
        }
        break;
      default:
        console.log('Unknown Event', data);
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

  const fetchTopBanks = async () => {
    const response = await client.query({
      query: GET_PAYMENT_METHODS,
      variables: { is_mobile: true },
      fetchPolicy: 'no-cache',
    });
    const { data } = response;
    const { getPaymentMethods } = data;
    setPaymentMethods(getPaymentMethods);
    const types = getPaymentMethods.find((item: any) => item?.name == 'CARD');
    setCardTypes(types?.payment_methods);
    setloading(false);
  };

  const createJusPayOrder = (paymentMode: PAYMENT_MODE) => {
    const orderInput: OrderInput = {
      payment_order_id: paymentId,
      payment_mode: paymentMode,
      is_mobile_sdk: true,
      return_url: AppConfig.Configuration.returnUrl,
    };
    return client.mutate<createOrder, createOrderVariables>({
      mutation: CREATE_ORDER,
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

  const processCODOrder = () => {
    const processDiagnosticHCOrderInput: ProcessDiagnosticHCOrderInput = {
      orderID: orderDetails?.orderId,
      paymentMode: DIAGNOSTIC_ORDER_PAYMENT_TYPE.COD,
      amount: amount,
    };
    return client.mutate<processDiagnosticHCOrder, processDiagnosticHCOrderVariables>({
      mutation: PROCESS_DIAG_COD_ORDER,
      variables: { processDiagnosticHCOrderInput: processDiagnosticHCOrderInput },
      fetchPolicy: 'no-cache',
    });
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
    if (!!authToken) {
      return authToken;
    } else {
      setisTxnProcessing(true);
      try {
        businessLine == 'diagnostics' && initiateOrderPayment();
        const response = await createJusPayOrder(PAYMENT_MODE.PREPAID);
        const { data } = response;
        const { createOrder } = data;
        const token = createOrder?.juspay?.client_auth_token;
        setauthToken?.(token);
        return token;
      } catch (e) {
        setisTxnProcessing(false);
        renderErrorPopup();
      }
    }
  };

  function triggerWebengege(mode: 'Prepaid' | 'Cash', type: string) {
    DiagnosticPaymentInitiated(mode, amount, 'Diagnostic', 'Diagnostic', type);
  }

  async function onPressBank(bankCode: string) {
    triggerWebengege('Prepaid', 'Net Banking');
    const token = await getClientToken();
    InitiateNetBankingTxn(currentPatient?.id, token, paymentId, bankCode);
  }

  async function onPressWallet(wallet: string) {
    triggerWebengege('Prepaid', wallet);
    const token = await getClientToken();
    InitiateWalletTxn(currentPatient?.id, token, paymentId, wallet);
  }

  async function onPressUPIApp(app: any) {
    triggerWebengege('Prepaid', 'UPI');
    const token = await getClientToken();
    // const sdkPresent =
    //   app?.payment_method_code == 'PHONEPE'
    //     ? 'ANDROID_PHONEPE'
    //     : app?.payment_method_code == 'GOOGLEPAY'
    //     ? 'ANDROID_GOOGLEPAY'
    //     : '';
    // InitiateUPISDKTxn(currentPatient?.id, token, paymentId, app?.payment_method_code, sdkPresent);
    InitiateUPIIntentTxn(currentPatient?.id, token, paymentId, app.packageName);
  }

  async function onPressVPAPay(VPA: string) {
    triggerWebengege('Prepaid', VPA);
    try {
      setisTxnProcessing(true);
      const response = await verifyVPA(VPA);
      if (response?.data?.verifyVPA?.status == 'VALID') {
        const token = await getClientToken();
        InitiateVPATxn(currentPatient?.id, token, paymentId, VPA);
      } else {
        setisTxnProcessing(false);
        setisVPAvalid(false);
      }
    } catch (e) {
      showTxnFailurePopUP();
    }
  }

  async function onPressCardPay(cardInfo: any) {
    triggerWebengege('Prepaid', 'Card');
    const token = await getClientToken();
    InitiateCardTxn(currentPatient?.id, token, paymentId, cardInfo);
  }

  async function onPressPayByCash() {
    triggerWebengege('Cash', 'Cash');
    setisTxnProcessing(true);
    try {
      const response = await createJusPayOrder(PAYMENT_MODE.COD);
      const { data } = response;
      if (data?.createOrder?.success) {
        const response = await processCODOrder();
        const { data } = response;
        data?.processDiagnosticHCOrder?.status
          ? navigatetoOrderStatus(true, 'success')
          : showTxnFailurePopUP();
      } else {
        showTxnFailurePopUP();
      }
    } catch (e) {
      showTxnFailurePopUP();
    }
  }

  const OtherBanks = () => {
    const topBanks = paymentMethods?.find((item: any) => item?.name == 'NB');
    const methods = topBanks?.payment_methods?.map((item: any) => item?.payment_method_code) || [];
    const otherBanks = banks?.filter((item: any) => !methods?.includes(item?.paymentMethod));
    triggerWebengege('Prepaid', 'Other Banks');
    props.navigation.navigate(AppRoutes.OtherBanks, {
      paymentId: paymentId,
      amount: amount,
      banks: otherBanks,
      orderId: orderDetails?.orderId,
      businessLine: businessLine,
    });
  };

  const filterUPIApps = () => {
    if (availableUPIApps?.length) {
      const available = availableUPIApps?.map((item: any) => item?.appName);
      const UPIApps = paymentMethods?.find((item: any) => item?.name == 'UPI')?.payment_methods;
      const apps = UPIApps?.map((app: any) => {
        if (
          available.includes(app?.payment_method_name) &&
          paymentModeVersionCheck(app?.minimum_supported_version)
        ) {
          let object = app;
          const packageName = availableUPIApps?.find(
            (item: any) => item?.appName == app.payment_method_name
          )?.['packageName'];
          object['packageName'] = packageName;
          return object;
        }
      }).filter((value: any) => value);
      return apps;
    } else {
      return [];
    }
  };
  const onPressRetryBooking = () => {
    hideAphAlert?.();
    businessLine == 'diagnostics' && props.navigation.goBack();
  };

  const navigatetoOrderStatus = (isCOD: boolean, paymentStatus: string) => {
    switch (businessLine) {
      case 'diagnostics':
        props.navigation.navigate(AppRoutes.OrderStatus, {
          orderDetails: orderDetails,
          isCOD: isCOD,
          eventAttributes,
          paymentStatus: paymentStatus,
        });
        break;
      case 'consult':
        props.navigation.navigate(AppRoutes.ConsultPaymentStatus, {
          orderDetails: orderDetails,
          paymentStatus: paymentStatus,
          paymentId: paymentId,
        });
        break;
    }
  };

  const renderErrorPopup = () =>
    showAphAlert!({
      title: 'Uh oh! :(',
      description: 'Oops! seems like we are having an issue. Please try again.',
    });

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
    return <BookingInfo LOB={businessLine} orderDetails={orderDetails} />;
  };

  const showPaymentOptions = () => {
    return !!paymentMethods?.length
      ? paymentMethods.map((item: any) => {
          const minVersion = item?.minimum_supported_version;
          switch (item?.name) {
            case 'COD':
              return paymentModeVersionCheck(minVersion) && renderPayByCash();
            case 'CARD':
              return paymentModeVersionCheck(minVersion) && renderCards();
            case 'WALLET':
              return (
                paymentModeVersionCheck(minVersion) && renderWallets(item?.payment_methods || [])
              );
            case 'UPI':
              return (
                paymentModeVersionCheck(minVersion) && renderUPIPayments(filterUPIApps() || [])
              );
            case 'NB':
              return (
                paymentModeVersionCheck(minVersion) && renderNetBanking(item?.payment_methods || [])
              );
          }
        })
      : renderPayByCash();
  };

  const renderWallets = (wallets: any) => {
    return <Wallets wallets={wallets} onPressPayNow={onPressWallet} />;
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
        onPressPayNow={onPressCardPay}
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
    return businessLine != 'consult' ? <PayByCash onPressPlaceOrder={onPressPayByCash} /> : null;
  };

  const showTxnFailurePopUP = () => {
    setisTxnProcessing(false);
    showAphAlert?.({
      unDismissable: businessLine == 'diagnostics' ? true : false,
      removeTopIcon: true,
      children: <TxnFailed onPressRetry={onPressRetryBooking} />,
    });
  };

  return (
    <>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {!loading ? (
          <ScrollView contentContainerStyle={styles.container}>
            {renderBookingInfo()}
            {showPaymentOptions()}
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
    paddingBottom: 24,
  },
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
});
