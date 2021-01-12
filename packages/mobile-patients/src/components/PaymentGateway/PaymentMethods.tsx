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
import { GET_BANK_OPTIONS, CREATE_ORDER } from '@aph/mobile-patients/src/graphql/profiles';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AppRoutes } from '../NavigatorContainer';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { TxnFailed } from '@aph/mobile-patients/src/components/PaymentGateway/Components/TxnFailed';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
const { HyperSdkReact } = NativeModules;

export interface PaymentMethodsProps extends NavigationScreenProps {}

export const PaymentMethods: React.FC<PaymentMethodsProps> = (props) => {
  const paymentId = props.navigation.getParam('paymentId');
  const amount = props.navigation.getParam('amount');
  const orderId = props.navigation.getParam('orderId');
  const orderDetails = props.navigation.getParam('orderDetails');
  const { currentPatient } = useAllCurrentPatients();
  const [banks, setBanks] = useState<any>([]);
  const [loading, setloading] = useState<boolean>(true);
  const [isTxnProcessing, setisTxnProcessing] = useState<boolean>(false);
  const [paymentMethods, setPaymentMethods] = useState<any>([]);
  const paymentActions = ['nbTxn', 'walletTxn', 'upiTxn', 'cardTxn'];
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { clearDiagnoticCartInfo } = useDiagnosticsCart();
  const client = useApolloClient();

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
        if (payload?.payload?.action == 'getPaymentMethods' && !payload?.error) {
          console.log(payload?.payload?.paymentMethods);
          const banks = payload?.payload?.paymentMethods?.filter(
            (item: any) => item?.paymentMethodType == 'NB'
          );
          setBanks(banks);
          setloading(false);
        } else if (paymentActions.indexOf(payload?.payload?.action) != -1) {
          payload?.payload?.status == 'CHARGED' && navigatetoOrderStatus(false);
          (payload?.payload?.status == 'PENDING_VBV' ||
            payload?.payload?.status == 'AUTHORIZATION_FAILED') &&
            showTxnFailurePopUP();
        }
        break;
      default:
        console.log('Unknown Event', data);
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
    setloading(false);
  };

  const createJusPayOrder = (paymentMode: 'PREPAID' | 'COD') => {
    const orderInput = {
      payment_order_id: paymentId,
      payment_mode: paymentMode,
      is_mobile_sdk: true,
      return_url: AppConfig.Configuration.returnUrl,
    };
    return client.mutate({
      mutation: CREATE_ORDER,
      variables: { order_input: orderInput },
      fetchPolicy: 'no-cache',
    });
  };

  const getClientToken = async () => {
    setisTxnProcessing(true);
    const response = await createJusPayOrder('PREPAID');
    const { data } = response;
    const { createOrder } = data;
    const token = createOrder?.juspay?.client_auth_token;
    return token;
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
    const token = await getClientToken();
    InitiateVPATxn(currentPatient?.id, token, paymentId, VPA);
  }

  async function onPressCardPay(cardInfo: any) {
    const token = await getClientToken();
    InitiateCardTxn(currentPatient?.id, token, paymentId, cardInfo);
  }

  async function onPressPayByCash() {
    setisTxnProcessing(true);
    const response = await createJusPayOrder('COD');
    const { data } = response;
    const { createOrder } = data;
    setisTxnProcessing(false);
    console.log('createOrder >>', createOrder);
    data?.createOrder?.success && navigatetoOrderStatus(true);
  }

  const navigatetoOrderStatus = (isCOD: boolean) => {
    clearDiagnoticCartInfo?.();
    props.navigation.navigate(AppRoutes.OrderStatus, { orderDetails: orderDetails, isCOD: isCOD });
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
    return <BookingInfo LOB={'Diag'} />;
  };

  const showPaymentOptions = () => {
    return paymentMethods.map((item: any, index: number) => {
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
    });
  };

  const renderWallets = (wallets: any) => {
    return <Wallets wallets={wallets} onPressPayNow={onPressWallet} />;
  };

  const renderUPIPayments = (upiApps: any) => {
    return (
      <UPIPayments upiApps={upiApps} onPressUPIApp={onPressUPIApp} onPressPay={onPressVPAPay} />
    );
  };

  const renderCards = () => {
    return <Cards onPressPayNow={onPressCardPay} />;
  };

  const renderNetBanking = (topBanks: any) => {
    return (
      <NetBanking
        topBanks={topBanks}
        onPressOtherBanks={() =>
          props.navigation.navigate(AppRoutes.OtherBanks, {
            paymentId: paymentId,
            amount: amount,
            banks: banks,
          })
        }
        onPressBank={onPressBank}
      />
    );
  };

  const renderPayByCash = () => {
    return <PayByCash onPressPlaceOrder={onPressPayByCash} />;
  };

  const showTxnFailurePopUP = () => {
    showAphAlert?.({
      removeTopIcon: true,
      children: <TxnFailed onPressRetry={() => hideAphAlert?.()} />,
    });
  };

  return (
    <>
      <SafeAreaView style={theme.viewStyles.container}>
        {renderHeader()}
        {!loading ? (
          <ScrollView style={styles.container}>
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
    paddingBottom: 50,
  },
  header: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
});
