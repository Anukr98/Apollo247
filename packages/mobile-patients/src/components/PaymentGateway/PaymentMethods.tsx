import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  NativeModules,
  BackHandler,
  NativeEventEmitter,
  ScrollView,
  View,
  Text,
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
  isGooglePayReady,
  isPhonePeReady,
  InitiateUPISDKTxn,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GET_PAYMENT_METHODS,
  VERIFY_VPA,
  INITIATE_DIAGNOSTIC_ORDER_PAYMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { TxnFailed } from '@aph/mobile-patients/src/components/PaymentGateway/Components/TxnFailed';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { PAYMENT_MODE, VerifyVPA } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { verifyVPA, verifyVPAVariables } from '@aph/mobile-patients/src/graphql/types/verifyVPA';
import { PaymentInitiated } from '@aph/mobile-patients/src/components/Tests/Events';
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
import {
  createJusPayOrder,
  processDiagnosticsCODOrder,
  diagnosticPaymentSettings,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  isEmptyObject,
  isSmallDevice,
  paymentModeVersionCheck,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { InfoMessage } from '@aph/mobile-patients/src/components/Tests/components/InfoMessage';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { SavingsIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { colors } from '@aph/mobile-patients/src/theme/colors';

const { HyperSdkReact } = NativeModules;

export interface PaymentMethodsProps extends NavigationScreenProps {
  source?: string;
  businessLine: 'consult' | 'diagnostics' | 'pharma' | 'subscription' | 'vaccine';
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = (props) => {
  const { modifiedOrder, deliveryAddressCityId } = useDiagnosticsCart();
  const paymentId = props.navigation.getParam('paymentId');
  const amount = props.navigation.getParam('amount');
  const orderId = props.navigation.getParam('orderId');
  const orderDetails = props.navigation.getParam('orderDetails');
  const eventAttributes = props.navigation.getParam('eventAttributes');
  const businessLine = props.navigation.getParam('businessLine');
  const isDiagnostic = businessLine === 'diagnostics';
  const { currentPatient } = useAllCurrentPatients();
  const [banks, setBanks] = useState<any>([]);
  const [loading, setloading] = useState<boolean>(true);
  const [isTxnProcessing, setisTxnProcessing] = useState<boolean>(false);
  const [paymentMethods, setPaymentMethods] = useState<any>([]);
  const [cardTypes, setCardTypes] = useState<any>([]);
  const [isVPAvalid, setisVPAvalid] = useState<boolean>(true);
  const [isCardValid, setisCardValid] = useState<boolean>(true);
  const [phonePeReady, setphonePeReady] = useState<boolean>(false);
  const [googlePayReady, setGooglePayReady] = useState<boolean>(false);
  const [availableUPIApps, setAvailableUPIapps] = useState([]);
  const paymentActions = ['nbTxn', 'walletTxn', 'upiTxn', 'cardTxn'];
  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const { authToken, setauthToken } = useAppCommonData();
  const FailedStatuses = ['AUTHENTICATION_FAILED', 'AUTHORIZATION_FAILED'];
  const isDiagnosticModify = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  const [showPrepaid, setShowPrepaid] = useState<boolean>(isDiagnostic ? false : true);
  const [showCOD, setShowCOD] = useState<boolean>(isDiagnostic ? false : true);
  const [showDiagnosticHCMsg, setShowDiagnosticHCMsg] = useState<string>('');

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NativeModules.HyperSdkReact);
    const eventListener = eventEmitter.addListener('HyperEvent', (resp) => {
      handleEventListener(resp);
    });
    fecthPaymentOptions();
    fetchTopBanks();
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
    BackHandler.addEventListener('hardwareBackPress', () => {
      return !HyperSdkReact.isNull() && HyperSdkReact.onBackPressed();
    });
    return () => BackHandler.removeEventListener('hardwareBackPress', () => null);
  }, []);

  async function fetchDiagnosticPaymentMethods() {
    const DEFAULT_COD_CONFIGURATION = AppConfig.Configuration.Enable_Diagnostics_COD;
    try {
      setloading?.(true);
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
    } finally {
      setloading(false);
    }
  }

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
        } else if (payload?.payload?.action == 'isDeviceReady') {
          payload?.requestId == 'phonePe' && status && setphonePeReady(true);
          payload?.requestId == 'googlePay' && status && setGooglePayReady(true);
        } else if (action == 'upiTxn' && !payload?.error && !status) {
          setAvailableUPIapps(payload?.payload?.availableApps || []);
        } else if (payload?.error) {
          handleError(payload?.errorMessage);
        }
        break;
      default:
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
    if (!!authToken) {
      return authToken;
    } else {
      setisTxnProcessing(true);
      try {
        businessLine == 'diagnostics' && initiateOrderPayment();
        const response = await createJusPayOrder(
          client,
          paymentId,
          PAYMENT_MODE.PREPAID,
          AppConfig.Configuration.returnUrl
        );
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

  function triggerWebengege(type: string) {
    PaymentInitiated(amount, businessLine, type);
  }

  function triggerUserPaymentAbortedEvent(errorCode: string) {
    //JP_002 -> User aborted payment
    errorCode === 'JP_002' && isDiagnostic && DiagnosticUserPaymentAborted(currentPatient, orderId);
  }

  async function onPressBank(bankCode: string) {
    triggerWebengege('Net Banking');
    const token = await getClientToken();
    InitiateNetBankingTxn(currentPatient?.id, token, paymentId, bankCode);
  }

  async function onPressWallet(wallet: string) {
    triggerWebengege(wallet);
    const token = await getClientToken();
    wallet == 'PHONEPE' && phonePeReady
      ? InitiateUPISDKTxn(currentPatient?.id, token, paymentId, wallet, 'ANDROID_PHONEPE')
      : InitiateWalletTxn(currentPatient?.id, token, paymentId, wallet);
  }

  async function onPressUPIApp(app: any) {
    triggerWebengege(app?.payment_method_name);
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
    sdkPresent
      ? InitiateUPISDKTxn(currentPatient?.id, token, paymentId, paymentMethod, sdkPresent)
      : InitiateUPIIntentTxn(currentPatient?.id, token, paymentId, paymentCode);
  }

  async function onPressVPAPay(VPA: string) {
    triggerWebengege('UPI Collect');
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
    triggerWebengege('Card');
    const token = await getClientToken();
    InitiateCardTxn(currentPatient?.id, token, paymentId, cardInfo);
  }

  async function onPressPayByCash() {
    triggerWebengege('Cash');
    setisTxnProcessing(true);
    try {
      const response = await createJusPayOrder(
        client,
        paymentId,
        PAYMENT_MODE.COD,
        AppConfig.Configuration.returnUrl
      );
      const { data } = response;
      if (data?.createOrder?.success) {
        const response = await processDiagnosticsCODOrder(client, orderId, amount);
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
    const methods =
      topBanks?.payment_methods?.map((item: any) => item?.payment_method_code).slice(0, 4) || [];
    const otherBanks = banks?.filter((item: any) => !methods?.includes(item?.paymentMethod));
    triggerWebengege('Net Banking');
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
      case 'vaccine':
        props.navigation.navigate(AppRoutes.VaccineBookingConfirmationScreen, {
          appointmentId: orderDetails?.orderId,
          displayId: orderDetails?.displayId,
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
          switch (item?.name) {
            case 'COD':
              return isDiagnosticModify
                ? null
                : paymentModeVersionCheck(minVersion) && renderPayByCash();
            case 'CARD':
              return paymentModeVersionCheck(minVersion) && showPrepaid && renderCards();
            case 'WALLET':
              return (
                paymentModeVersionCheck(minVersion) &&
                showPrepaid &&
                renderWallets(item?.payment_methods || [])
              );
            case 'UPI':
              return (
                paymentModeVersionCheck(minVersion) &&
                showPrepaid &&
                renderUPIPayments(filterUPIApps() || [])
              );
            case 'NB':
              return (
                paymentModeVersionCheck(minVersion) &&
                showPrepaid &&
                renderNetBanking(item?.payment_methods || [])
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
    return (
      <>
        {isDiagnostic ? (
          <View>
            {!showCOD && renderInfoMessage()}
            <PayByCash onPressPlaceOrder={onPressPayByCash} disableCOD={!showCOD} />
            {!!showDiagnosticHCMsg && showDiagnosticHCMsg != '' && renderHCMsg()}
          </View>
        ) : null}
      </>
    );
  };

  const renderHCMsg = () => {
    return (
      <View style={styles.savingContainer}>
        <SavingsIcon style={styles.savingIconStyle} />
        <Text style={styles.savingText}>{showDiagnosticHCMsg}</Text>
      </View>
    );
  };

  const renderInfoMessage = () => {
    return (
      <InfoMessage
        content={string.diagnostics.codDisableText}
        textStyle={styles.textStyle}
        iconStyle={styles.iconStyle}
      />
    );
  };

  const showTxnFailurePopUP = () => {
    setisTxnProcessing(false);
    showAphAlert?.({
      unDismissable: businessLine == 'diagnostics' ? true : false,
      removeTopIcon: true,
      children: <TxnFailed onPressRetry={onPressRetryBooking} />,
    });
  };

  const renderSecureTag = () => <SecureTags />;

  return (
    <>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {!loading ? (
          <ScrollView contentContainerStyle={styles.container}>
            {renderBookingInfo()}
            {showPaymentOptions()}
            {!!paymentMethods?.length && renderSecureTag()}
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
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(isSmallDevice ? 8.5 : 9),
    lineHeight: isSmallDevice ? 13 : 14,
    letterSpacing: 0.1,
    color: theme.colors.SHERPA_BLUE,
    opacity: 0.7,
    marginHorizontal: '2%',
  },
  iconStyle: {
    resizeMode: 'contain',
    height: isSmallDevice ? 13 : 14,
    width: isSmallDevice ? 13 : 14,
  },
  savingContainer: {
    backgroundColor: '#F3FFFF',
    flexDirection: 'row',
    margin: 16,
    padding: 8,
    borderColor: colors.APP_GREEN,
    borderRadius: 10,
    borderWidth: 1,
  },
  savingIconStyle: {
    height: 25,
    width: 25,
    resizeMode: 'contain',
  },
  savingText: {
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1, 20),
    width: '89%',
    alignSelf: 'center',
    marginLeft: 10,
  },
});
