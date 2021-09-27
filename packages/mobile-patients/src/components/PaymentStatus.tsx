import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  Dimensions,
  Clipboard,
  SafeAreaView,
} from 'react-native';
import { Copy } from '@aph/mobile-patients/src/components/ui/Icons';
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
  GET_PHARMA_TRANSACTION_STATUS,
  SAVE_MEDICINE_ORDER_PAYMENT,
  SAVE_MEDICINE_ORDER_OMS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  postWebEngageEvent,
  postAppsFlyerEvent,
  postFirebaseEvent,
  apiCallEnums,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { FirebaseEvents, FirebaseEventName } from '../helpers/firebaseEvents';
import { AppsFlyerEventName } from '../helpers/AppsFlyerEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import { Snackbar } from 'react-native-paper';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  SaveMedicineOrderPaymentMq,
  SaveMedicineOrderPaymentMqVariables,
} from '@aph/mobile-patients/src/graphql/types/SaveMedicineOrderPaymentMq';
import {
  saveMedicineOrderOMS,
  saveMedicineOrderOMSVariables,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderOMS';

import { MEDICINE_ORDER_PAYMENT_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { OrderPlacedPopUp } from '@aph/mobile-patients/src/components/ui/OrderPlacedPopUp';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface PaymentStatusProps extends NavigationScreenProps {}

export const PaymentStatus: React.FC<PaymentStatusProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>(props.navigation.getParam('status'));
  const [refNo, setrefNo] = useState<string>('');
  const [orderDateTime, setorderDateTime] = useState('');
  const [paymentMode, setPaymentMode] = useState<string>('');
  const client = useApolloClient();
  const { success, failure, aborted } = Payment;
  const { showAphAlert, hideAphAlert } = useUIElements();
  const totalAmount = props.navigation.getParam('amount');
  const orderId = props.navigation.getParam('orderId');
  const orderAutoId = props.navigation.getParam('orderAutoId');
  const paymentTypeID = props.navigation.getParam('paymentTypeID');
  const orderInfo = props.navigation.getParam('orderInfo');
  const deliveryTime = props.navigation.getParam('deliveryTime');
  const checkoutEventAttributes = props.navigation.getParam('checkoutEventAttributes');
  const appsflyerEventAttributes = props.navigation.getParam('appsflyerEventAttributes');
  const [codOrderProcessing, setcodOrderProcessing] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const { apisToCall } = useAppCommonData();
  const {
    clearCartInfo,
    cartItems,
    coupon,
    orders,
    uploadPrescriptionRequired,
  } = useShoppingCart();
  const copyToClipboard = (refId: string) => {
    Clipboard.setString(refId);
    setSnackbarState(true);
  };
  const PaymentModes: any = {
    DC: 'Debit Card',
    CC: 'Credit Card',
    NB: 'Net Banking',
    UPI: 'UPI',
    PPI: 'Paytm Wallet',
    PAYTM_DIGITAL_CREDIT: 'Paytm Postpaid',
    EMI: 'EMI',
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
    client
      .query({
        query: GET_PHARMA_TRANSACTION_STATUS,
        variables: {
          orderId: orderAutoId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        const paymentEventAttributes = {
          af_order_id: orderId ? orderId : 0,
          order_AutoId: orderAutoId ? orderAutoId : 0,
          LOB: 'Pharmacy',
          Payment_Status: res.data.pharmaPaymentStatus.paymentStatus,
        };
        postWebEngageEvent(WebEngageEventName.PAYMENT_STATUS, paymentEventAttributes);
        postAppsFlyerEvent(AppsFlyerEventName.PAYMENT_STATUS, paymentEventAttributes);
        postFirebaseEvent(FirebaseEventName.PAYMENT_STATUS, paymentEventAttributes);
        setorderDateTime(res.data.pharmaPaymentStatus.orderDateTime);
        setrefNo(res.data.pharmaPaymentStatus.paymentRefId);
        setStatus(res.data.pharmaPaymentStatus.paymentStatus);
        setPaymentMode(res.data.pharmaPaymentStatus.paymentMode);
        setLoading(false);
      })
      .catch((error) => {
        CommonBugFender('fetchingTxnStutus', error);
        moveToHome();
        renderErrorPopup(string.common.tryAgainLater);
      });
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    moveToHome();
    return true;
  };

  const moveToHome = () => {
    // use apiCallsEnum values here in order to make that api call in home screen
    apisToCall.current = [apiCallEnums.circleSavings];
    navigateToHome(props.navigation);
  };

  const getFormattedAmount = (num: number) => Number(num.toFixed(2));

  const saveOrder = (orderInfo: saveMedicineOrderOMSVariables) =>
    client.mutate<saveMedicineOrderOMS, saveMedicineOrderOMSVariables>({
      mutation: SAVE_MEDICINE_ORDER_OMS,
      variables: orderInfo,
    });

  const savePayment = (paymentInfo: SaveMedicineOrderPaymentMqVariables) =>
    client.mutate<SaveMedicineOrderPaymentMq, SaveMedicineOrderPaymentMqVariables>({
      mutation: SAVE_MEDICINE_ORDER_PAYMENT,
      variables: paymentInfo,
    });

  const placeOrder = async (orderAutoId: number) => {
    const paymentInfo: SaveMedicineOrderPaymentMqVariables = {
      medicinePaymentMqInput: {
        orderAutoId: orderAutoId,
        amountPaid: getFormattedAmount(totalAmount),
        paymentType: MEDICINE_ORDER_PAYMENT_TYPE.COD,
        paymentStatus: 'success',
        responseCode: '',
        responseMessage: '',
      },
    };
    try {
      const response = await savePayment(paymentInfo);
      const { data } = response;
      const { errorCode, errorMessage } = data?.SaveMedicineOrderPaymentMq || {};
      if (errorCode || errorMessage) {
        errorPopUp();
      } else {
        handleOrderSuccess(`${orderAutoId}`);
        clearCartInfo?.();
      }
    } catch (error) {
      CommonBugFender('PaymentStatusScreen_savePayment', error);
      errorPopUp();
    }
  };

  const initiateOrder = async () => {
    setcodOrderProcessing(true);
    try {
      const response = await saveOrder(orderInfo);
      const { data } = response;
      const { orderId, orderAutoId, errorCode, errorMessage } = data?.saveMedicineOrderOMS || {};
      if (errorCode || errorMessage) {
        errorPopUp();
        setcodOrderProcessing(false);
        return;
      } else {
        placeOrder(orderAutoId!);
      }
    } catch (error) {
      CommonBugFender('PaymentStatusScreen_saveOrder', error);
      setcodOrderProcessing(false);
      errorPopUp();
    }
  };

  const errorPopUp = () => {
    showAphAlert!({
      title: `Hi ${currentPatient?.firstName || ''}!`,
      description: `Your order failed due to some temporary issue :( Please submit the order again.`,
    });
  };

  const handleOrderSuccess = (orderAutoId: string) => {
    moveToHome();
    fireOrderSuccessEvent(orderAutoId);
    showAphAlert!({
      title: `Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`,
      description:
        'Your order has been placed successfully. We will confirm the order in a few minutes.',
      children: (
        <OrderPlacedPopUp
          deliveryTime={deliveryTime}
          orderAutoId={orderAutoId}
          onPressViewInvoice={() => navigateToOrderDetails(true, orderAutoId)}
          onPressTrackOrder={() => navigateToOrderDetails(false, orderAutoId)}
        />
      ),
    });
  };

  const navigateToOrderDetails = (showOrderSummaryTab: boolean, orderAutoId: string) => {
    hideAphAlert!();
    props.navigation.navigate(AppRoutes.OrderDetailsScene, {
      goToHomeOnBack: true,
      showOrderSummaryTab,
      orderAutoId: orderAutoId,
    });
  };

  const fireOrderSuccessEvent = (newOrderId: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PAYMENT_FAILED_AND_CONVERTED_TO_COD] = {
      'Payment failed order id': orderAutoId,
      'Payment Success Order Id': newOrderId,
    };
    postWebEngageEvent(WebEngageEventName.PAYMENT_FAILED_AND_CONVERTED_TO_COD, eventAttributes);
    const pharmaCheckoutEventAttributes = {
      ...checkoutEventAttributes,
      'Split Cart': orders?.length > 1 ? 'Yes' : 'No',
      'Prescription Option selected': uploadPrescriptionRequired
        ? 'Prescription Upload'
        : 'Not Applicable',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED, {
      ...pharmaCheckoutEventAttributes,
      'Cart Items': JSON.stringify(cartItems),
    });
    postCleverTapEvent(CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED, {
      ...pharmaCheckoutEventAttributes,
      'Cart Items': cartItems?.length,
    });
    postAppsFlyerEvent(AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED, appsflyerEventAttributes);
    firePurchaseEvent();
  };

  const firePurchaseEvent = () => {
    let items: any = [];
    cartItems.forEach((item, index) => {
      let itemObj: any = {};
      itemObj.item_name = item.name; // Product Name or Doctor Name
      itemObj.item_id = item.id; // Product SKU or Doctor ID
      itemObj.price = item.specialPrice ? item.specialPrice : item.price; // Product Price After discount or Doctor VC price (create another item in array for PC price)
      itemObj.item_brand = ''; // Product brand or Apollo (for Apollo doctors) or Partner Doctors (for 3P doctors)
      itemObj.item_category = 'Pharmacy'; // 'Pharmacy' or 'Consultations'
      itemObj.item_category2 = item.isMedicine ? 'Drug' : 'FMCG'; // FMCG or Drugs (for Pharmacy) or Specialty Name (for Consultations)
      itemObj.item_variant = 'Default'; // "Default" (for Pharmacy) or Virtual / Physcial (for Consultations)
      itemObj.index = index + 1; // Item sequence number in the list
      itemObj.quantity = item.quantity; // "1" or actual quantity
      items.push(itemObj);
    });
    const eventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
      coupon: coupon?.coupon,
      currency: 'INR',
      items: items,
      transaction_id: orderId,
      value: totalAmount,
      LOB: 'Pharma',
    };
    postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
  };

  const statusIcon = () => {
    if (status === success) {
      return <Success style={styles.statusIconStyles} />;
    } else if (status === failure || status === aborted) {
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
    } else if (status == failure || status == aborted) {
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
    } else if (status === aborted) {
      message = ' PAYMENT ABORTED';
      textColor = theme.colors.FAILURE_TEXT;
    }
    return textComponent(message, undefined, textColor, false);
  };

  const renderStatusCard = () => {
    const refNumberText = String(refNo != '' && refNo != null ? refNo : '--');
    const orderIdText = 'Order ID: ' + String(orderAutoId);
    const priceText = `${string.common.Rs} ` + String(totalAmount);
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
            flex: 0.16,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {textComponent(priceText, undefined, theme.colors.SHADE_GREY, false)}
        </View>
        <View
          style={{
            flex: 0.16,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {textComponent(orderIdText, undefined, theme.colors.SHADE_GREY, false)}
        </View>
        <View style={{ flex: 0.29, justifyContent: 'flex-start', alignItems: 'center' }}>
          {textComponent('Payment Ref. Number - ', undefined, theme.colors.SHADE_GREY, false)}
          <TouchableOpacity style={styles.refStyles} onPress={() => copyToClipboard(refNumberText)}>
            {textComponent(refNumberText, undefined, theme.colors.SHADE_GREY, false)}
            <Copy style={styles.iconStyle} />
          </TouchableOpacity>
        </View>
        <Snackbar
          style={{ position: 'absolute', zIndex: 1001, bottom: -10 }}
          visible={snackbarState}
          onDismiss={() => {
            setSnackbarState(false);
          }}
          duration={1000}
        >
          Copied
        </Snackbar>
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

  const orderCard = () => {
    const date = String(
      orderDateTime != '' && orderDateTime != null ? getDate(String(orderDateTime)) : '--'
    );
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
    } else if (status != success && status != failure && status != aborted) {
      noteText =
        'Note : Your payment is in progress and this may take a couple of minutes to confirm your booking. We’ll intimate you once your bank confirms the payment.';
    }
    return textComponent(noteText, undefined, theme.colors.SHADE_GREY, true);
  };

  const getButtonText = () => {
    if (status == success) {
      return 'TRSCK ORDER';
    } else if (status == failure || status == aborted) {
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
    } else if (status == failure || status == aborted) {
      navigate(AppRoutes.MedicineCart);
    } else {
      moveToHome();
    }
  };

  const renderButton = () => {
    return (
      <TouchableOpacity style={styles.buttonStyle} onPress={() => handleButton()}>
        <Text style={{ ...theme.viewStyles.text('SB', 13, '#ffffff', 1, 24) }}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCODNote = () => {
    let noteText = "Your order wasn't placed as payment could not be processed. Please try again";
    return status == failure ? <Text style={styles.codText}>{noteText}</Text> : null;
  };

  const renderCODButton = () => {
    return status == failure ? (
      <View style={{ marginHorizontal: 0.06 * windowWidth, marginBottom: 0.06 * windowWidth }}>
        <Button
          style={{ height: 0.06 * windowHeight }}
          title={`PAY CASH ON DELIVERY`}
          onPress={() => initiateOrder()}
          disabled={false}
        />
      </View>
    ) : null;
  };

  const renderRetryPayment = () => {
    return (
      <View style={styles.retryPayment}>
        <TouchableOpacity onPress={() => handleButton()}>
          <Text style={styles.clickText}>Click here</Text>
        </TouchableOpacity>
        <Text style={styles.retryText}>{' to retry your payment'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <SafeAreaView style={styles.container}>
        <Header leftIcon="backArrow" title="PAYMENT STATUS" onPressLeftIcon={() => handleBack()} />
        {!loading ? (
          <ScrollView style={styles.container}>
            {renderStatusCard()}
            {renderCODNote()}
            {renderCODButton()}
            {appointmentHeader()}
            {orderCard()}
            {renderNote()}
            {status == failure ? renderRetryPayment() : renderButton()}
          </ScrollView>
        ) : (
          <Spinner />
        )}
        {codOrderProcessing && <Spinner />}
      </SafeAreaView>
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
    height: 0.3 * windowHeight,
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
  refStyles: {
    flexDirection: 'row',
  },
  iconStyle: {
    marginLeft: 6,
    marginTop: 5,
    width: 9,
    height: 10,
  },
  codText: {
    ...theme.viewStyles.text('SB', 13, theme.colors.SHADE_GREY, 1, 17),
    textAlign: 'center',
    marginHorizontal: 0.1 * windowWidth,
    marginBottom: 8,
  },
  retryPayment: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 13,
  },
  clickText: {
    ...theme.viewStyles.text('SB', 13, '#fcb716', 1, 17, 0.04),
  },
  retryText: {
    ...theme.viewStyles.text('R', 13, '#02475b', 1, 17, 0.04),
  },
});
