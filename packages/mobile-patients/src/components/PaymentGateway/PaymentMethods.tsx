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
  InitiateNetBankingTxn,
  InitiateWalletTxn,
  InitiateUPIIntentTxn,
  InitiateVPATxn,
  InitiateCardTxn,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GET_BANK_OPTIONS,
  CREATE_ORDER,
  PROCESS_DIAG_COD_ORDER,
  VERIFY_VPA,
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
const { HyperSdkReact } = NativeModules;

export interface PaymentMethodsProps extends NavigationScreenProps {}

export const PaymentMethods: React.FC<PaymentMethodsProps> = (props) => {
  const paymentId = props.navigation.getParam('paymentId');
  const amount = props.navigation.getParam('amount');
  const orderId = props.navigation.getParam('orderId');
  const orderDetails = props.navigation.getParam('orderDetails');
  const eventAttributes = props.navigation.getParam('eventAttributes');
  const { currentPatient } = useAllCurrentPatients();
  const [banks, setBanks] = useState<any>([]);
  const [loading, setloading] = useState<boolean>(true);
  const [isTxnProcessing, setisTxnProcessing] = useState<boolean>(false);
  const [paymentMethods, setPaymentMethods] = useState<any>([]);
  const [cardTypes, setCardTypes] = useState<any>([]);
  const [isVPAvalid, setisVPAvalid] = useState<boolean>(true);
  const [isCardValid, setisCardValid] = useState<boolean>(true);
  const paymentActions = ['nbTxn', 'walletTxn', 'upiTxn', 'cardTxn'];
  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();
  const FailedStatuses = ['AUTHENTICATION_FAILED', 'PENDING_VBV', 'AUTHORIZATION_FAILED'];
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
    setisTxnProcessing(false);
    switch (event) {
      case 'process_result':
        var payload = data.payload || {};
        console.log('payload >>', JSON.stringify(payload));
        if (payload?.error) {
          handleError(payload?.errorMessage);
        }
        if (payload?.payload?.action == 'getPaymentMethods' && !payload?.error) {
          console.log(payload?.payload?.paymentMethods);
          const banks = payload?.payload?.paymentMethods?.filter(
            (item: any) => item?.paymentMethodType == 'NB'
          );
          setBanks(banks);
          setloading(false);
        } else if (paymentActions.indexOf(payload?.payload?.action) != -1) {
          payload?.payload?.status == 'CHARGED' && navigatetoOrderStatus(false);
          FailedStatuses.includes(payload?.payload?.status) && showTxnFailurePopUP();
        }
        break;
      default:
        console.log('Unknown Event', data);
    }
  };

  const handleError = (errorMessage: string) => {
    switch (errorMessage) {
      case 'Card number is invalid.':
        setisCardValid(false);
        break;
      default:
        renderErrorPopup();
    }
  };

  const fecthPaymentOptions = async () => {
    const response: boolean = await isSDKInitialised();
    if (response) {
      fetchPaymentMethods(currentPatient?.id);
    }
  };

  const fetchTopBanks = async () => {
    const response = await client.query({
      query: GET_BANK_OPTIONS,
      fetchPolicy: 'no-cache',
    });
    const { data } = response;
    const { getPaymentMethods } = data;
    console.log('getPaymentMethods >>', getPaymentMethods);
    setPaymentMethods(getPaymentMethods);
    const types = getPaymentMethods.find((item: any) => item?.name == 'CARD');
    setCardTypes(types?.featured_banks);
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

  const processCODOrder = () => {
    const processDiagnosticHCOrderInput: ProcessDiagnosticHCOrderInput = {
      orderID: orderId,
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
    setisTxnProcessing(true);
    try {
      const response = await createJusPayOrder(PAYMENT_MODE.PREPAID);
      const { data } = response;
      const { createOrder } = data;
      const token = createOrder?.juspay?.client_auth_token;
      return token;
    } catch (e) {
      setisTxnProcessing(true);
      renderErrorPopup();
    }
  };

  async function onPressBank(bankCode: string) {
    const token = await getClientToken();
    InitiateNetBankingTxn(currentPatient?.id, token, paymentId, bankCode);
  }

  async function onPressWallet(wallet: string) {
    const token = await getClientToken();
    InitiateWalletTxn(currentPatient?.id, token, paymentId, wallet);
  }

  async function onPressUPIApp(app: any) {
    const token = await getClientToken();
    const sdkPresent =
      app?.method == 'PHONEPE'
        ? 'ANDROID_PHONEPE'
        : app?.method == 'GOOGLEPAY'
        ? 'ANDROID_GOOGLEPAY'
        : '';
    InitiateUPIIntentTxn(currentPatient?.id, token, paymentId, app?.method, sdkPresent);
  }

  async function onPressVPAPay(VPA: string) {
    try {
      setisTxnProcessing(true);
      const response = await verifyVPA(VPA);
      console.log('response >>', response?.data?.verifyVPA);
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
    const token = await getClientToken();
    InitiateCardTxn(currentPatient?.id, token, paymentId, cardInfo);
  }

  async function onPressPayByCash() {
    setisTxnProcessing(true);
    try {
      const response = await createJusPayOrder(PAYMENT_MODE.COD);
      const { data } = response;
      if (data?.createOrder?.success) {
        const response = await processCODOrder();
        const { data } = response;
        data?.processDiagnosticHCOrder?.status
          ? navigatetoOrderStatus(true)
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
    const methods = topBanks?.featured_banks?.map((item: any) => item?.method) || [];
    const otherBanks = banks?.filter((item: any) => !methods?.includes(item?.paymentMethod));
    props.navigation.navigate(AppRoutes.OtherBanks, {
      paymentId: paymentId,
      amount: amount,
      banks: otherBanks,
    });
  };

  const navigatetoOrderStatus = (isCOD: boolean) => {
    props.navigation.navigate(AppRoutes.OrderStatus, {
      orderDetails: orderDetails,
      isCOD: isCOD,
      eventAttributes,
    });
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
    return <BookingInfo LOB={'Diag'} />;
  };

  const showPaymentOptions = () => {
    return !!paymentMethods?.length
      ? paymentMethods.map((item: any) => {
          switch (item?.name) {
            case 'COD':
              return renderPayByCash();
            case 'CARD':
              return renderCards();
            case 'WALLET':
              return renderWallets(item?.featured_banks || []);
            case 'UPI':
              return renderUPIPayments(item?.featured_banks || []);
            case 'NB':
              return renderNetBanking(item?.featured_banks || []);
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
    return <PayByCash onPressPlaceOrder={onPressPayByCash} />;
  };

  const showTxnFailurePopUP = () => {
    setisTxnProcessing(false);
    showAphAlert?.({
      unDismissable: true,
      removeTopIcon: true,
      children: (
        <TxnFailed
          onPressRetry={() => {
            hideAphAlert?.();
            props.navigation.goBack();
          }}
        />
      ),
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
