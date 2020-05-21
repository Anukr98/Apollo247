import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import React, { useEffect, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { Success, Failure, Pending } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Payment } from '@aph/mobile-patients/src/strings/strings.json';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { useApolloClient } from 'react-apollo-hooks';
import {
  makeAppointmentPayment,
  makeAppointmentPaymentVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAppointmentPayment';
import { GET_PHARMA_TRANSACTION_STATUS } from '@aph/mobile-patients/src/graphql/profiles';
import { GET_MEDICINE_ORDER_DETAILS } from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { FirebaseEvents, FirebaseEventName } from '../helpers/firebaseEvents';
import { AppsFlyerEventName } from '../helpers/AppsFlyerEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface PaymentStatusProps extends NavigationScreenProps {}

export const PaymentStatus: React.FC<PaymentStatusProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>(props.navigation.getParam('status'));
  const [refNo, setrefNo] = useState<string>('');
  const [orderDateTime, setorderDateTime] = useState('');
  const [paymentMode, setPaymentMode] = useState<string>('');
  // const webEngageEventAttributes = props.navigation.getParam('webEngageEventAttributes');
  // const fireBaseEventAttributes = props.navigation.getParam('fireBaseEventAttributes');

  const client = useApolloClient();
  const { success, failure, pending } = Payment;
  const { showAphAlert } = useUIElements();
  const totalAmount = props.navigation.getParam('amount');
  const orderId = props.navigation.getParam('orderId');
  const orderAutoId = props.navigation.getParam('orderAutoId');
  const paymentTypeID = props.navigation.getParam('paymentTypeID');
  const { currentPatient } = useAllCurrentPatients();

  const PaymentModes: any = {
    DC: 'Debit Card',
    CC: 'Credit Card',
    NB: 'Net Banking',
    UPI: 'UPI',
    PPI: 'Paytm Wallet',
    PAYTM_DIGITAL_CREDIT:'Paytm Postpaid',
    EMI:'EMI'
  };

  const Modes: any = {
    DEBIT_CARD: 'Debit Card',
    CREDIT_CARD: 'Credit Card',
    NET_BANKING: 'Net Banking',
    PAYTM_WALLET: 'Paytm Wallet',
    EMI: 'EMI',
    UPI: 'UPI',
    PAYTM_POSTPAID: 'Paytm Postpaid',
    COD: 'COD',
  };

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  useEffect(() => {
    // getTxnStatus(orderId)
    client
      .query({
        query: GET_PHARMA_TRANSACTION_STATUS,
        variables: {
          orderId: orderAutoId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        console.log(res.data.pharmaPaymentStatus);
        const paymentEventAttributes = {
          order_Id: orderId,
          order_AutoId: orderAutoId,
          Type: 'Pharmacy',
          Payment_Status: res.data.pharmaPaymentStatus.paymentStatus,
        };
        postWebEngageEvent(WebEngageEventName.PAYMENT_STATUS, paymentEventAttributes);
        setorderDateTime(res.data.pharmaPaymentStatus.paymentDateTime);
        setrefNo(res.data.pharmaPaymentStatus.bankTxnId);
        setStatus(res.data.pharmaPaymentStatus.paymentStatus);
        setPaymentMode(res.data.pharmaPaymentStatus.paymentMode);
        setLoading(false);
      })
      .catch((error) => {
        CommonBugFender('fetchingTxnStutus', error);
        console.log(error);
        props.navigation.navigate(AppRoutes.ConsultRoom);
        renderErrorPopup(`Something went wrong, plaease try again after sometime`);
      });
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    props.navigation.navigate(AppRoutes.ConsultRoom);
    return true;
  };

  const statusIcon = () => {
    if (status === success) {
      return <Success style={styles.statusIconStyles} />;
    } else if (status === failure) {
      return <Failure style={styles.statusIconStyles} />;
    } else {
      return <Pending style={styles.statusIconStyles} />;
    }
  };

  const textComponent = (
    message: string,
    numOfLines: number | undefined,
    color: string,
    needStyle: boolean
  ) => {
    return (
      <Text
        style={{
          ...theme.viewStyles.text('SB', 13, color, 1, 20),
          marginHorizontal: needStyle ? 0.1 * windowWidth : undefined,
        }}
        numberOfLines={numOfLines}
      >
        {message}
      </Text>
    );
  };

  const statusCardColour = () => {
    if (status == success) {
      return colors.SUCCESS;
    } else if (status == failure) {
      return colors.FAILURE;
    } else {
      return colors.PENDING;
    }
  };

  const statusText = () => {
    let message = 'PAYMENT PENDING';
    let textColor = theme.colors.PENDING_TEXT;
    if (status === success) {
      message = ' PAYMENT SUCCESSFUL';
      textColor = theme.colors.SUCCESS_TEXT;
    } else if (status === failure) {
      message = ' PAYMENT FAILED';
      textColor = theme.colors.FAILURE_TEXT;
    }
    return textComponent(message, undefined, textColor, false);
  };

  const renderStatusCard = () => {
    const refNumberText = 'Ref.No : ' + String(refNo != '' && refNo != null ? refNo : '--');
    const orderIdText = 'Order ID: ' + String(orderAutoId);
    const priceText = 'Rs. ' + String(totalAmount);
    return (
      <View style={[styles.statusCardStyle, { backgroundColor: statusCardColour() }]}>
        <View style={styles.statusCardSubContainerStyle}>{statusIcon()}</View>
        <View
          style={{
            flex: 0.15,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {statusText()}
        </View>
        <View
          style={{
            flex: 0.18,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {textComponent(priceText, undefined, theme.colors.SHADE_GREY, false)}
        </View>
        <View
          style={{
            flex: 0.18,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {textComponent(refNumberText, undefined, theme.colors.SHADE_GREY, false)}
        </View>
        <View style={{ flex: 0.25, justifyContent: 'flex-start', alignItems: 'center' }}>
          {textComponent(orderIdText, undefined, theme.colors.SHADE_GREY, false)}
        </View>
      </View>
    );
  };

  const appointmentHeader = () => {
    return (
      <View style={styles.appointmentHeaderStyle}>
        {textComponent('ORDER DETAILS', undefined, theme.colors.ASTRONAUT_BLUE, false)}
      </View>
    );
  };

  const getdate = () => {
    const newdate = new Date(orderDateTime);
    newdate.setHours(newdate.getHours() - 5);
    newdate.setMinutes(newdate.getMinutes() - 30);
    return newdate.toDateString() + '  ' + newdate.toLocaleTimeString();
  };
  const orderCard = () => {
    const date = String(orderDateTime != '' && orderDateTime != null ? getdate() : '--');
    const paymenttype = String(
      paymentMode != '' && paymentMode != null ? Modes[paymentMode] : PaymentModes[paymentTypeID]
    );
    return (
      <View style={styles.orderCardStyle}>
        <View style={{ flex: 0.6, paddingTop: 0.05 * windowWidth }}>
          <View style={{ flex: 0.4, justifyContent: 'center' }}>
            {textComponent('Order Date & Time', undefined, theme.colors.ASTRONAUT_BLUE, false)}
          </View>
          <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
            {textComponent(date, undefined, theme.colors.SHADE_CYAN_BLUE, false)}
          </View>
        </View>
        <View style={{ flex: 0.4, paddingTop: 0.05 * windowWidth }}>
          <View style={{ flex: 0.4, justifyContent: 'center' }}>
            {textComponent('Mode of Payment', undefined, theme.colors.ASTRONAUT_BLUE, false)}
          </View>
          <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
            {textComponent(paymenttype, undefined, theme.colors.SHADE_CYAN_BLUE, false)}
          </View>
        </View>
      </View>
    );
  };

  const renderNote = () => {
    let noteText = '';
    if (status === failure) {
      noteText =
        'Note : In case your account has been debited, you should get the refund in 1-7 working days.';
    } else if (status != success && status != failure) {
      noteText =
        'Note : Your payment is in progress and this may take a couple of minutes to confirm your booking. We’ll intimate you once your bank confirms the payment.';
    }
    return textComponent(noteText, undefined, theme.colors.SHADE_GREY, true);
  };

  const getButtonText = () => {
    if (status == success) {
      return 'TRSCK ORDER';
    } else if (status == failure) {
      return 'TRY AGAIN';
    } else {
      return 'GO TO HOME';
    }
  };

  const handleButton = () => {
    const { navigation } = props;
    const { navigate } = navigation;
    if (status == success) {
      props.navigation.navigate(AppRoutes.OrderDetailsScene, {
        goToHomeOnBack: true,
        showOrderSummaryTab: false,
        orderAutoId,
      });
    } else if (status == failure) {
      navigate(AppRoutes.YourCart);
    } else {
      navigate(AppRoutes.ConsultRoom);
    }
  };

  const renderButton = () => {
    return (
      <TouchableOpacity
        style={styles.buttonStyle}
        onPress={() => {
          handleButton();
        }}
      >
        <Text style={{ ...theme.viewStyles.text('SB', 13, '#ffffff', 1, 24) }}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <Header leftIcon="backArrow" title="PAYMENT STATUS" onPressLeftIcon={() => handleBack()} />

      {!loading ? (
        <ScrollView style={styles.container}>
          {renderStatusCard()}
          {appointmentHeader()}
          {orderCard()}
          {renderNote()}
          {renderButton()}
        </ScrollView>
      ) : (
        <Spinner />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
  Payment: {
    fontSize: 14,
    color: theme.colors.ASTRONAUT_BLUE,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.1,
  },
  statusIconStyles: {
    width: 45,
    height: 45,
  },
  statusCardStyle: {
    height: 0.27 * windowHeight,
    margin: 0.06 * windowWidth,
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  statusCardSubContainerStyle: {
    flex: 0.22,
    marginVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCardStyle: {
    height: 0.15 * windowHeight,
    marginVertical: 0.03 * windowWidth,
    paddingLeft: 0.06 * windowWidth,
    marginHorizontal: 0.06 * windowWidth,
    flexDirection: 'row',
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  appointmentHeaderStyle: {
    backgroundColor: '#eee',
    height: 0.04 * windowHeight,
    justifyContent: 'center',
    marginHorizontal: 0.06 * windowWidth,
    borderBottomWidth: 0.8,
    borderBottomColor: '#ddd',
  },
  buttonStyle: {
    height: 0.06 * windowHeight,
    backgroundColor: '#fcb716',
    marginVertical: 0.06 * windowWidth,
    marginHorizontal: 0.2 * windowWidth,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
});
