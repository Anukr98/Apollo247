import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Failure,
  Pending,
  Success,
  Copy,
  CircleLogo,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  GET_PHARMA_TRANSACTION_STATUS,
  GET_PHARMA_TRANSACTION_STATUS_V2,
  SAVE_MEDICINE_ORDER_OMS_V2,
  SAVE_MEDICINE_ORDER_PAYMENT_V2,
} from '@aph/mobile-patients/src/graphql/profiles';
import { apiCallEnums, g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string, { Payment } from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  BackHandler,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AddedCirclePlanWithValidity } from '@aph/mobile-patients/src/components/ui/AddedCirclePlanWithValidity';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  postWebEngageEvent,
  postAppsFlyerEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { OrderPlacedPopUp } from '@aph/mobile-patients/src/components/ui/OrderPlacedPopUp';
import { MEDICINE_ORDER_PAYMENT_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { FirebaseEvents, FirebaseEventName } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import moment from 'moment';
import {
  saveMedicineOrderV2,
  saveMedicineOrderV2Variables,
  saveMedicineOrderV2_saveMedicineOrderV2_orders,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderV2';
import {
  saveMedicineOrderPaymentMqV2,
  saveMedicineOrderPaymentMqV2Variables,
} from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderPaymentMqV2';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

export interface PharmacyPaymentStatusProps extends NavigationScreenProps {}

export const PharmacyPaymentStatus: React.FC<PharmacyPaymentStatusProps> = (props) => {
  const {
    clearCartInfo,
    setCircleMembershipCharges,
    isCircleSubscription,
    setIsCircleSubscription,
    cartItems,
    coupon,
    circlePlanSelected,
    circleMembershipCharges,
    setCirclePlanSelected,
    circleSubscriptionId,
    grandTotal,
    cartTotalCashback,
    pharmacyCircleAttributes,
  } = useShoppingCart();
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>(props.navigation.getParam('status'));
  const [paymentRefId, setpaymentRefId] = useState<string>('');
  const [orderDateTime, setorderDateTime] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const deliveryTime = props.navigation.getParam('deliveryTime');
  const orderInfo = props.navigation.getParam('orderInfo');
  const checkoutEventAttributes = props.navigation.getParam('checkoutEventAttributes');
  const orders = props.navigation.getParam('orders');
  const price = props.navigation.getParam('price');
  const transId = props.navigation.getParam('transId');
  const isStorePickup = props.navigation.getParam('isStorePickup');
  const [circleSubscriptionID, setCircleSubscriptionID] = useState<string>('');
  const [isCircleBought, setIsCircleBought] = useState<boolean>(false);
  const [totalCashBack, setTotalCashBack] = useState<number>(0);
  const client = useApolloClient();
  const { success, failure, aborted } = Payment;
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const [circlePlanDetails, setCirclePlanDetails] = useState({});
  const [codOrderProcessing, setcodOrderProcessing] = useState<boolean>(false);
  const { apisToCall } = useAppCommonData();

  const copyToClipboard = (refId: string) => {
    Clipboard.setString(refId);
    setSnackbarState(true);
  };
  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  useEffect(() => {
    getUserSubscriptionsByStatus();
  }, []);

  useEffect(() => {
    setLoading(true);
    const apiCall = isStorePickup
      ? GET_PHARMA_TRANSACTION_STATUS
      : GET_PHARMA_TRANSACTION_STATUS_V2;
    const variables = isStorePickup ? { orderId: transId } : { transactionId: transId };

    client
      .query({
        query: apiCall,
        variables: variables,
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        const pharmaPaymentStatus = isStorePickup
          ? res?.data?.pharmaPaymentStatus
          : res?.data?.pharmaPaymentStatusV2;
        setorderDateTime(pharmaPaymentStatus?.orderDateTime);
        setpaymentRefId(pharmaPaymentStatus?.paymentRefId);
        setStatus(pharmaPaymentStatus?.paymentStatus);
        setPaymentMode(pharmaPaymentStatus?.paymentMode);
        setIsCircleBought(!!pharmaPaymentStatus?.planPurchaseDetails?.planPurchased);
        setTotalCashBack(pharmaPaymentStatus?.planPurchaseDetails?.totalCashBack);
        setLoading(false);
        fireCirclePlanActivatedEvent(pharmaPaymentStatus?.planPurchaseDetails?.planPurchased);
        fireCirclePurchaseEvent(pharmaPaymentStatus?.planPurchaseDetails?.planPurchased);
      })
      .catch((error) => {
        setLoading(false);
        CommonBugFender('fetchingTxnStutus', error);
        renderErrorPopup(`Something went wrong, please try again after sometime`);
      });
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const getUserSubscriptionsByStatus = async () => {
    try {
      const query: GetSubscriptionsOfUserByStatusVariables = {
        mobile_number: g(currentPatient, 'mobileNumber'),
        status: ['active', 'deferred_inactive'],
      };
      const res = await client.query<GetSubscriptionsOfUserByStatus>({
        query: GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
        fetchPolicy: 'no-cache',
        variables: query,
      });
      const data = res?.data?.GetSubscriptionsOfUserByStatus?.response;
      setCirclePlanDetails(data?.APOLLO?.[0]);
      setCircleSubscriptionID(data?.APOLLO?.[0]._id);
    } catch (error) {
      CommonBugFender('ConsultRoom_getUserSubscriptionsByStatus', error);
    }
  };

  const clearCircleSubscriptionData = () => {
    if (status !== failure && status !== aborted && status !== 'PAYMENT_PENDING') {
      clearCartInfo?.();
    }
    AsyncStorage.removeItem('circlePlanSelected');
    setCircleMembershipCharges && setCircleMembershipCharges(0);
    setIsCircleSubscription && setIsCircleSubscription(false);
  };

  const handleBack = () => {
    clearCircleSubscriptionData();
    moveToHome();
    return true;
  };

  const moveToHome = () => {
    apisToCall.current = [
      apiCallEnums.circleSavings,
      apiCallEnums.getAllBanners,
      apiCallEnums.getUserSubscriptions,
      apiCallEnums.getUserSubscriptionsV2,
      apiCallEnums.oneApollo,
      apiCallEnums.pharmacyUserType,
      apiCallEnums.getPlans,
      apiCallEnums.plansCashback,
    ];
    navigateToHome(props.navigation);
  };

  const fireCirclePlanActivatedEvent = (planPurchased: boolean) => {
    const CircleEventAttributes: WebEngageEvents[WebEngageEventName.PURCHASE_CIRCLE] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      'Membership Type': String(circlePlanSelected?.valid_duration) + ' days',
      'Membership End Date': moment(new Date())
        .add(circlePlanSelected?.valid_duration, 'days')
        .format('DD-MMM-YYYY'),
      'Circle Plan Price': circlePlanSelected?.currentSellingPrice,
      Type: 'Pharmacy',
      Source: 'Pharma',
    };
    planPurchased && postWebEngageEvent(WebEngageEventName.PURCHASE_CIRCLE, CircleEventAttributes);
  };
  const getFormattedAmount = (num: number) => Number(num.toFixed(2));

  const saveOrderV2 = (orderInfo: saveMedicineOrderV2Variables) =>
    client.mutate<saveMedicineOrderV2, saveMedicineOrderV2Variables>({
      mutation: SAVE_MEDICINE_ORDER_OMS_V2,
      variables: orderInfo,
    });

  const savePaymentV2 = (paymentInfo: saveMedicineOrderPaymentMqV2Variables) =>
    client.mutate<saveMedicineOrderPaymentMqV2, saveMedicineOrderPaymentMqV2Variables>({
      mutation: SAVE_MEDICINE_ORDER_PAYMENT_V2,
      variables: paymentInfo,
    });

  const getPrepaidCheckoutCompletedAppsFlyerEventAttributes = (
    orderId: string,
    orderAutoId: string
  ) => {
    const appsflyerEventAttributes: AppsFlyerEvents[AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED] = {
      'customer id': currentPatient ? currentPatient.id : '',
      'cart size': cartItems.length,
      af_revenue: getFormattedAmount(grandTotal),
      af_currency: 'INR',
      'order id': orderId,
      orderAutoId: orderAutoId,
      'coupon applied': coupon ? true : false,
      'Circle Cashback amount':
        circleSubscriptionId || isCircleSubscription ? Number(cartTotalCashback) : 0,
      ...pharmacyCircleAttributes!,
    };
    return appsflyerEventAttributes;
  };

  const handleOrderSuccess = (orderAutoId: string, orderId: string) => {
    moveToHome();
    fireOrderSuccessEvent(orderAutoId, orderId);
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

  const placeOrder = async (
    orders: (saveMedicineOrderV2_saveMedicineOrderV2_orders | null)[],
    transactionId: number
  ) => {
    const paymentInfo: saveMedicineOrderPaymentMqV2Variables = {
      medicinePaymentMqInput: {
        transactionId: transactionId,
        amountPaid: getFormattedAmount(price),
        paymentType: MEDICINE_ORDER_PAYMENT_TYPE.COD,
        paymentStatus: 'success',
        responseCode: '',
        responseMessage: '',
      },
    };
    try {
      const response = await savePaymentV2(paymentInfo);
      const { data } = response;
      const { errorCode, errorMessage } = data?.saveMedicineOrderPaymentMqV2 || {};
      if (errorCode || errorMessage) {
        errorPopUp();
      } else {
        orders?.forEach((order) => {
          handleOrderSuccess(`${order?.orderAutoId}`, order?.id!);
        });
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
      const response = await saveOrderV2(orderInfo);
      const { data } = response;
      const { orders, transactionId, errorCode, errorMessage } = data?.saveMedicineOrderV2 || {};
      if (errorCode || errorMessage) {
        errorPopUp();
        setcodOrderProcessing(false);
        return;
      } else {
        placeOrder(orders!, transactionId!);
      }
    } catch (error) {
      CommonBugFender('PaymentStatusScreen_saveOrder', error);
      setcodOrderProcessing(false);
      errorPopUp();
    }
  };

  const errorPopUp = () => {
    fireOrderFailedEvent();
    showAphAlert!({
      title: `Hi ${currentPatient?.firstName || ''}!`,
      description: `Your order failed due to some temporary issue :( Please submit the order again.`,
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

  const fireOrderSuccessEvent = (orderAutoId: string, orderId: string) => {
    let eventAttributes: WebEngageEvents[WebEngageEventName.PAYMENT_FAILED_AND_CONVERTED_TO_COD] = {
      'Payment failed order id': transId,
      'Payment Success Order Id': orderAutoId,
      status: true,
    };
    postWebEngageEvent(WebEngageEventName.PAYMENT_FAILED_AND_CONVERTED_TO_COD, eventAttributes);
    postAppsFlyerEvent(
      AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED,
      getPrepaidCheckoutCompletedAppsFlyerEventAttributes(orderAutoId, orderId)
    );
    postWebEngageEvent(WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED, {
      ...checkoutEventAttributes,
      'Cart Items': JSON.stringify(cartItems),
    });
    firePurchaseEvent(orderAutoId);
  };

  const fireOrderFailedEvent = () => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PAYMENT_FAILED_AND_CONVERTED_TO_COD] = {
      'Payment failed order id': transId,
      status: false,
    };
    postWebEngageEvent(WebEngageEventName.PAYMENT_FAILED_AND_CONVERTED_TO_COD, eventAttributes);
  };

  const firePurchaseEvent = (orderId: string) => {
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
      value: price,
      LOB: 'Pharma',
    };
    postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
  };

  const fireCirclePurchaseEvent = (planPurchased: boolean) => {
    const eventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
      currency: 'INR',
      items: [
        {
          item_name: 'Circle Plan',
          item_id: circlePlanSelected?.subPlanId,
          price: Number(circlePlanSelected?.currentSellingPrice),
          item_category: 'Circle',
          index: 1, // Item sequence number in the list
          quantity: 1, // "1" or actual quantity
        },
      ],
      transaction_id: transId,
      value: Number(circlePlanSelected?.currentSellingPrice),
      LOB: 'Circle',
    };
    planPurchased && postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
  };

  const statusIcon = () => {
    if (status === success || paymentMode === 'COD') {
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
    if (status == success || paymentMode === 'COD') {
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
    if (paymentMode === 'COD') {
      message = ' ORDER CONFIRMED';
      textColor = theme.colors.SUCCESS_TEXT;
    } else if (status === success) {
      message = ' PAYMENT SUCCESSFUL';
      textColor = theme.colors.SUCCESS_TEXT;
    } else if (status === failure) {
      message = ' PAYMENT FAILED';
      textColor = theme.colors.FAILURE_TEXT;
    } else if (status === aborted) {
      message = ' PAYMENT ABORTED';
      textColor = theme.colors.FAILURE_TEXT;
    }
    return <Text style={theme.viewStyles.text('SB', 16, textColor)}>{message}</Text>;
  };

  const renderStatusCard = () => {
    const refNumberText = String(paymentRefId != '' && paymentRefId != null ? paymentRefId : '--');
    const priceText = `${string.common.Rs} ` + String(price);
    return (
      <View style={[styles.statusCardStyle, { backgroundColor: statusCardColour() }]}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <View style={styles.statusCardSubContainerStyle}>{statusIcon()}</View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              {statusText()}
            </View>
          </View>
          <Text style={theme.viewStyles.text('SB', 16, '#02475B', 1, 22, 0.7)}>{priceText}</Text>
        </View>
        <View
          style={{
            marginVertical: 10,
            marginHorizontal: 20,
            borderTopColor: '#E5E5E5',
            borderTopWidth: 1,
          }}
        />
        <View>
          <View
            style={{
              justifyContent: 'flex-start',
              flexDirection: 'row',
            }}
          >
            <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 30, 0.7)}>Order ID : </Text>
            <Text style={theme.viewStyles.text('M', 15, theme.colors.SHADE_GREY, 1, 30)}>
              {orders.map(
                (item: any, index: number) =>
                  item?.orderAutoId + (index != orders?.length - 1 && ', ')
              )}
            </Text>
          </View>
          {!!paymentRefId && (
            <>
              <View style={{ justifyContent: 'flex-start' }}>
                <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 30, 0.7)}>
                  Payment Reference Number :{' '}
                </Text>
                <TouchableOpacity
                  style={styles.refStyles}
                  onPress={() => copyToClipboard(refNumberText)}
                >
                  <Text style={theme.viewStyles.text('M', 15, theme.colors.SHADE_GREY, 1, 30)}>
                    {paymentRefId}
                  </Text>
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
            </>
          )}
        </View>
        <View>
          <TouchableOpacity onPress={() => {}}></TouchableOpacity>
        </View>
      </View>
    );
  };

  const appointmentHeader = () => {
    return (
      <View style={styles.appointmentHeaderStyle}>
        {textComponent('BOOKING DETAILS', undefined, theme.colors.ASTRONAUT_BLUE, false)}
      </View>
    );
  };

  const appointmentCard = () => {
    return (
      <View style={styles.appointmentCardStyle}>
        <View style={{ marginVertical: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <View style={{ justifyContent: 'flex-start' }}>
              {textComponent('Order Date & Time', undefined, theme.colors.ASTRONAUT_BLUE, false)}
            </View>
            <View style={{ justifyContent: 'flex-start', marginTop: 5 }}>
              {textComponent(
                getDate(orderDateTime),
                undefined,
                theme.colors.SHADE_CYAN_BLUE,
                false
              )}
            </View>
          </View>
          {!!paymentMode && (
            <View>
              <View style={{ justifyContent: 'flex-start' }}>
                {textComponent('Mode of Payment', undefined, theme.colors.ASTRONAUT_BLUE, false)}
              </View>
              <View style={{ justifyContent: 'flex-start', marginTop: 5 }}>
                {textComponent(paymentMode, undefined, theme.colors.SHADE_CYAN_BLUE, false)}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderNote = () => {
    let noteText = '';
    if (status === failure) {
      noteText =
        'Note : In case your account has been debited, you should get the refund in 10-14 business days.';
    } else if (paymentMode === 'COD') {
      noteText = 'Note - Your order is confirmed and has been placed successfully.';
    } else if (status != success && status != failure && status != aborted) {
      noteText =
        'Note : Your payment is in progress and this may take a couple of minutes to confirm your booking. We’ll intimate you once your bank confirms the payment.';
    }
    return textComponent(noteText, undefined, theme.colors.SHADE_GREY, true);
  };

  const getButtonText = () => {
    if (paymentMode === 'COD') {
      return 'VIEW ORDER';
    } else if (status == success) {
      return 'TRACK ORDER';
    } else if (status == failure || status == aborted) {
      return 'TRY AGAIN';
    } else {
      return 'GO TO HOMEPAGE';
    }
  };

  const renderCODNote = () => {
    let noteText = "Your order wasn't placed as payment could not be processed. Please try again";
    return status == failure || status == aborted ? (
      <Text style={styles.codText}>{noteText}</Text>
    ) : null;
  };

  const renderRetryPayment = () => {
    return (
      <View style={styles.retryPayment}>
        <TouchableOpacity style={styles.retryButton} onPress={() => handleButton()}>
          <Text style={theme.viewStyles.text('SB', 13, '#ffffff', 1, 24)}>RETRY PAYMENT</Text>
        </TouchableOpacity>
        {!circleMembershipCharges && (
          <TouchableOpacity style={styles.codButton} onPress={() => initiateOrder()}>
            <Text style={theme.viewStyles.text('SB', 13, '#fcb716', 1, 24)}>PAY COD</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const handleButton = () => {
    if (status == success || paymentMode === 'COD') {
      clearCircleSubscriptionData();
      props.navigation.navigate(AppRoutes.YourOrdersScene);
    } else if (status == failure || status == aborted) {
      setCircleMembershipCharges && setCircleMembershipCharges(0);
      setIsCircleSubscription && setIsCircleSubscription(false);
      setCirclePlanSelected?.(null);
      props.navigation.navigate(AppRoutes.MedicineCart);
    } else {
      clearCircleSubscriptionData();
      moveToHome();
    }
  };

  const renderButton = () => {
    return (
      <View>
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
        {(status === success || paymentMode === 'COD') && (
          <TouchableOpacity
            style={styles.textButtonStyle}
            onPress={() => {
              clearCircleSubscriptionData();
              moveToHome();
            }}
          >
            <Text style={{ ...theme.viewStyles.text('B', 13, '#fcb716', 1, 24) }}>
              GO TO HOMEPAGE
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAddedCirclePlanWithValidity = () => {
    return (
      <AddedCirclePlanWithValidity
        circleSavings={totalCashBack}
        circlePlanDetails={circlePlanDetails}
        isConsult={false}
      />
    );
  };

  const renderCircleSavingsOnPurchase = () => {
    return (
      <View style={styles.circleSavingsContainer}>
        <View style={styles.rowCenter}>
          <CircleLogo style={styles.circleLogo} />
          <Text
            style={{
              ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 14),
              marginTop: 3,
              left: -5,
              width: '92%',
            }}
          >
            {' '}
            You{' '}
            <Text style={theme.viewStyles.text('SB', 14, theme.colors.SEARCH_UNDERLINE_COLOR)}>
              saved {string.common.Rs}
              {convertNumberToDecimal(totalCashBack)}{' '}
            </Text>
            on your purchase
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <SafeAreaView style={styles.container}>
        <Header leftIcon="backArrow" title="PAYMENT STATUS" onPressLeftIcon={() => handleBack()} />
        {!loading ? (
          <View style={styles.container}>
            <ScrollView style={styles.container}>
              {renderStatusCard()}
              {status === 'PAYMENT_SUCCESS' && isCircleBought
                ? renderAddedCirclePlanWithValidity()
                : null}
              {(status === 'PAYMENT_SUCCESS' || paymentMode === 'COD') &&
              totalCashBack &&
              !isCircleBought
                ? renderCircleSavingsOnPurchase()
                : null}
              {renderCODNote()}
              {status != failure && status != aborted && appointmentHeader()}
              {status != failure && status != aborted && appointmentCard()}
              {renderNote()}
              {status == failure || status == aborted ? renderRetryPayment() : renderButton()}
            </ScrollView>
          </View>
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
    width: 25,
    height: 25,
  },
  statusCardStyle: {
    margin: 0.06 * windowWidth,
    padding: 15,
    flex: 1,
    borderRadius: 10,
    paddingBottom: 15,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  statusCardSubContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentCardStyle: {
    marginVertical: 0.03 * windowWidth,
    paddingHorizontal: 15,
    marginHorizontal: 0.06 * windowWidth,
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
    marginTop: 0.06 * windowWidth,
    marginHorizontal: 0.2 * windowWidth,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  textButtonStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
  inputStyle: {
    lineHeight: 18,
    ...theme.fonts.IBMPlexSansMedium(11),
    color: '#6D7278',
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  viewInvoice: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightIcon: {
    flex: 0.15,
    alignItems: 'flex-end',
  },
  sentMsg: {
    color: 'rgba(74, 165, 74, 0.6)',
    marginVertical: 4,
    ...theme.fonts.IBMPlexSansMedium(11),
  },
  priceCont: {
    alignItems: 'center',
    marginTop: 4,
  },
  paymentRef: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
  },
  circleSavingsContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    borderRadius: 5,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderWidth: 2,
    borderStyle: 'dashed',
    paddingHorizontal: 10,
    marginBottom: 20,
    paddingVertical: 8,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleLogo: {
    width: 50,
    height: 32,
    marginRight: 5,
  },
  codText: {
    ...theme.viewStyles.text('SB', 13, theme.colors.SHADE_GREY, 1, 17),
    textAlign: 'center',
    marginHorizontal: 0.1 * windowWidth,
    marginBottom: 8,
  },
  retryPayment: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 13,
  },
  retryButton: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#fcb716',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 7,
    width: '40%',
  },
  codButton: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    borderColor: '#fcb716',
    borderWidth: 2,
    width: '40%',
  },
});
