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
  UPDATE_MEDICINE_ORDER_SUBSTITUTION,
  GET_CAMPAIGN_ID_FOR_REFERRER,
  GET_REWARD_ID,
  CREATE_ORDER,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  apiCallEnums,
  g,
  getCleverTapCircleMemberValues,
  goToConsultRoom,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
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
  Platform,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AddedCirclePlanWithValidity } from '@aph/mobile-patients/src/components/ui/AddedCirclePlanWithValidity';
import InAppReview from 'react-native-in-app-review';

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
import {
  MEDICINE_ORDER_PAYMENT_TYPE,
  MEDICINE_ORDER_STATUS,
  one_apollo_store_code,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
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
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import {
  updateMedicineOrderSubstitution,
  updateMedicineOrderSubstitutionVariables,
} from '@aph/mobile-patients/src/graphql/types/updateMedicineOrderSubstitution';
import { SubstituteItemsCard } from '@aph/mobile-patients/src/components/Medicines/Components/SubstituteItemsCard';
import InAppReview from 'react-native-in-app-review';
import DeviceInfo from 'react-native-device-info';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { PrescriptionType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { PrescriptionInfoView } from '@aph/mobile-patients/src/components/MedicineCart/Components/PrescriptionInfoView';
import { ReferralBanner } from '@aph/mobile-patients/src/components/ui/ReferralBanner';
import { useReferralProgram } from '@aph/mobile-patients/src/components/ReferralProgramProvider';
import remoteConfig from '@react-native-firebase/remote-config';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';

enum SUBSTITUTION_RESPONSE {
  OK = 'OK',
  NOT_OK = 'not-OK',
}

export interface PharmacyPaymentStatusProps extends NavigationScreenProps {}

export const PharmacyPaymentStatus: React.FC<PharmacyPaymentStatusProps> = (props) => {
  const {
    setCircleMembershipCharges,
    cartSubscriptionDetails,
    setIsCircleSubscription,
    serverCartItems,
    cartCoupon,
    circlePlanSelected,
    circleMembershipCharges,
    setCirclePlanSelected,
    cartCircleSubscriptionId,
    pharmacyCircleAttributes,
    prescriptionType,
    consultProfile,
    serverCartAmount,
  } = useShoppingCart();
  const { fetchServerCart } = useServerCart();
  const grandTotal = serverCartAmount?.cartTotal;
  const cartTotalCashback = serverCartAmount?.totalCashBack;
  const deliveryCharges = serverCartAmount?.isDeliveryFree ? 0 : serverCartAmount?.deliveryCharges;
  const [loading, setLoading] = useState<boolean>(true);
  const { success, failure, aborted, pending } = Payment;
  const [status, setStatus] = useState<string>(
    props.navigation.getParam('paymentStatus') == 'success'
      ? success
      : props.navigation.getParam('paymentStatus') == 'pending'
      ? pending
      : pending
  );
  const [paymentRefId, setpaymentRefId] = useState<string>('');
  const [orderDateTime, setorderDateTime] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const checkoutEventAttributes = props.navigation.getParam('checkoutEventAttributes');
  const cleverTapCheckoutEventAttributes = props.navigation.getParam(
    'cleverTapCheckoutEventAttributes'
  );
  const price = props.navigation.getParam('price');
  const transId = props.navigation.getParam('transId');
  const { orders, deliveryTime, orderInfo, isStorePickup } = props.navigation.getParam(
    'orderDetails'
  );
  const orderDetails = props.navigation.getParam('orderDetails');
  const orderIds = orders.map(
    (item: any, index: number) => item?.orderAutoId + (index != orders?.length - 1 && ', ')
  );
  const [circleSubscriptionID, setCircleSubscriptionID] = useState<string>('');
  const [isCircleBought, setIsCircleBought] = useState<boolean>(false);
  const [totalCashBack, setTotalCashBack] = useState<number>(0);
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { currentPatient } = useAllCurrentPatients();
  const [snackbarState, setSnackbarState] = useState<boolean>(false);
  const [circlePlanDetails, setCirclePlanDetails] = useState({});
  const [codOrderProcessing, setcodOrderProcessing] = useState<boolean>(false);
  const {
    apisToCall,
    pharmacyUserTypeAttribute,
    selectedPrescriptionType,
    setSelectedPrescriptionType,
    pharmacyUserType,
  } = useAppCommonData();

  const [showSubstituteMessage, setShowSubstituteMessage] = useState<boolean>(false);
  const [substituteMessage, setSubstituteMessage] = useState<string>('');
  const [substituteTime, setSubstituteTime] = useState<number>(0);
  const [transactionId, setTransactionId] = useState(null);
  const [showSubstituteConfirmation, setShowSubstituteConfirmation] = useState<boolean>(false);
  const isSplitCart: boolean = orders?.length > 1 ? true : false;
  const defaultClevertapEventParams = props.navigation.getParam('defaultClevertapEventParams');
  const payload = props.navigation.getParam('payload');
  const { setRewardId, setCampaignId } = useReferralProgram();
  const [isReferrerAvailable, setReferrerAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (!!substituteTime && showSubstituteMessage && status == success) {
      const interval = setInterval(() => {
        if (substituteTime < 1) {
          clearInterval(interval);
        } else {
          setSubstituteTime((substituteTime) => substituteTime - 1);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [substituteTime]);

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
    firebaseRemoteConfigForReferrer();
  }, []);

  useEffect(() => {
    setLoading(true);
    const variables = { paymentOrderId: transId };
    client
      .query({
        query: GET_PHARMA_TRANSACTION_STATUS_V2,
        variables: variables,
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        const pharmaPaymentStatus = res?.data?.pharmaPaymentStatusV2;
        setorderDateTime(pharmaPaymentStatus?.orderDateTime);
        setpaymentRefId(pharmaPaymentStatus?.paymentRefId);
        status == pending && setStatus(pharmaPaymentStatus?.paymentStatus);
        setPaymentMode(pharmaPaymentStatus?.paymentMode);
        setPaymentMethod(pharmaPaymentStatus?.paymentMethod);
        setTransactionId(pharmaPaymentStatus?.bankTxnId);
        setIsCircleBought(!!pharmaPaymentStatus?.planPurchaseDetails?.planPurchased);
        setTotalCashBack(pharmaPaymentStatus?.planPurchaseDetails?.totalCashBack);
        setShowSubstituteMessage(pharmaPaymentStatus?.isSubstitution);
        setSubstituteMessage(pharmaPaymentStatus?.substitutionMessage);
        setSubstituteTime(pharmaPaymentStatus?.substitutionTime);
        setLoading(false);
        firePaymentStatusPageViewedEvent(
          pharmaPaymentStatus?.paymentStatus,
          pharmaPaymentStatus?.bankTxnId,
          pharmaPaymentStatus?.paymentMode
        );
        firePaymentOrderStatusEvent(pharmaPaymentStatus?.paymentStatus);
        fireCirclePlanActivatedEvent(pharmaPaymentStatus?.planPurchaseDetails?.planPurchased);
        fireCirclePurchaseEvent(pharmaPaymentStatus?.planPurchaseDetails?.planPurchased);
        appReviewAndRating();
        fetchServerCart();
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

  const firebaseRemoteConfigForReferrer = async () => {
    try {
      const bannerConfig = await remoteConfig().getValue('Referrer_Banner');
      setReferrerAvailable(bannerConfig.asBoolean());
    } catch (e) {}
  };

  const appReviewAndRating = async () => {
    try {
      const { shipments } = orderInfo?.medicineOrderInput;
      let tatHours = shipments?.[0].tatHours?.split('')[0];

      if (tatHours <= 5) {
        if (InAppReview.isAvailable()) {
          await InAppReview.RequestInAppReview()
            .then((hasFlowFinishedSuccessfully) => {
              if (hasFlowFinishedSuccessfully) {
                postCleverTapEventForTrackingAppReview();
              }
            })
            .catch((error) => {
              CommonBugFender('inAppReviewForPharmacy', error);
            });
        }
      }
    } catch (error) {
      CommonBugFender('inAppRevireAfterPaymentForPharmacy', error);
    }
  };

  const postCleverTapEventForTrackingAppReview = async () => {
    const uniqueId = await DeviceInfo.getUniqueId();
    const eventAttributes: CleverTapEvents[CleverTapEventName.PLAYSTORE_APP_REVIEW_AND_RATING] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'User Type': pharmacyUserTypeAttribute?.User_Type || '',
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'CT Source': Platform.OS,
      'Device ID': uniqueId,
      'Circle Member':
        getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
        '',
      'Page Name': 'Pharmacy Order Completed',
      'NAV Source': 'Pharmacy',
    };
    postCleverTapEvent(
      Platform.OS == 'android'
        ? CleverTapEventName.APP_REVIEW_AND_RATING_TO_PLAYSTORE
        : CleverTapEventName.APP_REVIEW_AND_RATING_TO_APPSTORE,
      eventAttributes
    );
  };

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
      data?.APOLLO?.[0]._id && AsyncStorage.setItem('circleSubscriptionId', data?.APOLLO?.[0]._id);
    } catch (error) {
      CommonBugFender('ConsultRoom_getUserSubscriptionsByStatus', error);
    }
  };

  const clearCircleSubscriptionData = () => {
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
    goToConsultRoom(props.navigation);
    // clearing free consult option selected
    setSelectedPrescriptionType && setSelectedPrescriptionType('');
  };

  const firePaymentOrderStatusEvent = (backEndStatus: string) => {
    try {
      const { mobileNumber, vertical, displayId, paymentId } = defaultClevertapEventParams;
      const status =
        props.navigation.getParam('paymentStatus') == 'success'
          ? 'PAYMENT_SUCCESS'
          : 'PAYMENT_PENDING';
      const eventAttributes: CleverTapEvents[CleverTapEventName.PAYMENT_ORDER_STATUS] = {
        'Phone Number': mobileNumber,
        vertical: vertical,
        'Vertical Internal Order Id': displayId,
        'Payment Order Id': paymentId,
        'Payment Method Type': payload?.payload?.action,
        BackendPaymentStatus: backEndStatus,
        JuspayResponseCode: payload?.errorCode,
        Response: payload?.payload?.status,
        Status: status,
      };
      postCleverTapEvent(CleverTapEventName.PAYMENT_ORDER_STATUS, eventAttributes);
    } catch (error) {}
  };

  const firePaymentStatusPageViewedEvent = (
    status: string,
    transactionId: number,
    paymentMode: string
  ) => {
    const paymentStatus =
      status == MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS
        ? 'Success'
        : status == MEDICINE_ORDER_STATUS.PAYMENT_FAILED
        ? 'Payment Failed'
        : status == 'PAYMENT_STATUS_NOT_KNOWN' // for COD
        ? 'Payment Status Not Known'
        : 'Payment Aborted';
    const paymentType = paymentMode == MEDICINE_ORDER_PAYMENT_TYPE.COD ? 'COD' : 'Cashless';
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_POST_CART_PAGE_VIEWED] = {
      'Payment status': paymentStatus,
      'Payment Type': paymentType,
      'Transaction ID': transactionId,
      'Order ID(s)': orderIds,
      'MRP Total': getFormattedAmount(grandTotal),
      'Discount Amount': totalCashBack,
      'Payment Instrument': paymentMode,
      'Order Type': 'Cart',
      'Shipping Charges': deliveryCharges,
      'Circle Member':
        cartCircleSubscriptionId || cartSubscriptionDetails?.subscriptionApplied ? true : false,
      'Substitution Option Shown': showSubstituteMessage ? 'Yes' : 'No',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_POST_CART_PAGE_VIEWED, eventAttributes);
  };

  const fireSubstituteResponseEvent = (action: string) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_ORDER_SUBSTITUTE_OPTION_CLICKED] = {
      'Transaction ID': transactionId,
      'Order ID(s)': transId,
      'Substitute Action Taken': action == SUBSTITUTION_RESPONSE.OK ? 'Agree' : 'Disagree',
    };
    postWebEngageEvent(
      WebEngageEventName.PHARMACY_ORDER_SUBSTITUTE_OPTION_CLICKED,
      eventAttributes
    );
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
      af_customer_user_id: currentPatient ? currentPatient?.id : '',
      'cart size': serverCartItems?.length,
      af_revenue: getFormattedAmount(grandTotal),
      af_currency: 'INR',
      af_order_id: orderId ? orderId : '0',
      orderAutoId: orderAutoId ? orderAutoId : '0',
      'coupon applied': cartCoupon?.coupon ? true : false,
      af_content_id: serverCartItems?.map((item) => item?.id),
      af_quantity: serverCartItems?.map((item) => item?.quantity),
      af_price: serverCartItems?.map((item) =>
        item?.sellingPrice ? item?.sellingPrice : item?.price
      ),
      'Circle Cashback amount':
        cartCircleSubscriptionId || cartSubscriptionDetails?.subscriptionApplied
          ? Number(cartTotalCashback)
          : 0,
      ...pharmacyCircleAttributes!,
      ...pharmacyUserTypeAttribute,
      TransactionId: transId,
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

  const createJusPayOrder = (transactionId: number) => {
    const orderInput = {
      payment_order_id: transactionId,
      health_credits_used: 0,
      cash_to_collect: price,
      prepaid_amount: 0,
      store_code:
        Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS,
      is_mobile_sdk: true,
      return_url: AppConfig.Configuration.baseUrl,
    };
    return client.mutate({
      mutation: CREATE_ORDER,
      variables: { order_input: orderInput },
      fetchPolicy: 'no-cache',
    });
  };

  const placeOrder = async (
    orders: (saveMedicineOrderV2_saveMedicineOrderV2_orders | null)[],
    transactionId: number
  ) => {
    try {
      const response = await createJusPayOrder(transactionId);
      const { data } = response;
      const status =
        data?.createOrderV2?.payment_status || data?.updateOrderDetails?.payment_status;
      if (status === 'TXN_SUCCESS') {
        fireCleverTapOrderSuccessEvent();
        orders?.forEach((order) => {
          handleOrderSuccess(`${order?.orderAutoId}`, order?.id!);
        });
      } else {
        errorPopUp();
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
      'Cart Items': JSON.stringify(serverCartItems),
    });
    const skus = serverCartItems?.map((item) => item?.sku);
    const firebaseCheckoutEventAttributes: FirebaseEvents[FirebaseEventName.PHARMACY_CHECKOUT_COMPLETED] = {
      order_id: `${orderAutoId}`,
      transaction_id: transId,
      currency: 'INR',
      coupon: cartCoupon?.coupon,
      shipping: deliveryCharges,
      items: JSON.stringify(skus),
      value: grandTotal,
      circle_membership_added: circleMembershipCharges
        ? 'Yes'
        : circleSubscriptionID
        ? 'Existing'
        : 'No',
      payment_type: 'COD',
      user_type: pharmacyUserType,
    };
    postFirebaseEvent(
      FirebaseEventName.PHARMACY_CHECKOUT_COMPLETED,
      firebaseCheckoutEventAttributes
    );
    firePurchaseEvent(orderAutoId);
  };

  const fireCleverTapOrderSuccessEvent = () => {
    postCleverTapEvent(CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED, {
      ...cleverTapCheckoutEventAttributes,
      'Cart items': serverCartItems?.length,
    });
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
    serverCartItems.forEach((item, index) => {
      let itemObj: any = {};
      itemObj.item_name = item?.name; // Product Name or Doctor Name
      itemObj.item_id = item?.sku; // Product SKU or Doctor ID
      itemObj.price = item?.sellingPrice ? item?.sellingPrice : item?.price; // Product Price After discount or Doctor VC price (create another item in array for PC price)
      itemObj.item_brand = ''; // Product brand or Apollo (for Apollo doctors) or Partner Doctors (for 3P doctors)
      itemObj.item_category = 'Pharmacy'; // 'Pharmacy' or 'Consultations'
      itemObj.item_category2 = item?.typeId?.toLowerCase() == 'pharma' ? 'Drug' : 'FMCG'; // FMCG or Drugs (for Pharmacy) or Specialty Name (for Consultations)
      itemObj.item_variant = 'Default'; // "Default" (for Pharmacy) or Virtual / Physcial (for Consultations)
      itemObj.index = index + 1; // Item sequence number in the list
      itemObj.quantity = item?.quantity; // "1" or actual quantity
      items.push(itemObj);
    });
    const eventAttributes: FirebaseEvents[FirebaseEventName.PURCHASE] = {
      coupon: cartCoupon?.coupon,
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
              {orderIds}
            </Text>
          </View>
          {!!paymentRefId && (
            <>
              <View style={{ justifyContent: 'flex-start' }}>
                <Text style={theme.viewStyles.text('SB', 15, '#02475B', 1, 30, 0.7)}>
                  Payment Reference Number :{' '}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.5}
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
          <TouchableOpacity activeOpacity={0.5} onPress={() => {}}></TouchableOpacity>
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
                {textComponent(paymentMethod, undefined, theme.colors.SHADE_CYAN_BLUE, false)}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const substituteItemsCard = () => {
    if (status == success) {
      return (
        <SubstituteItemsCard
          orderId={orderIds?.[0]}
          transactionId={transId}
          substituteMessage={substituteMessage}
          substituteTime={substituteTime}
          updateOrderSubstitution={updateOrderSubstitution}
          setShowSubstituteMessage={setShowSubstituteMessage}
          setShowSubstituteConfirmation={setShowSubstituteConfirmation}
        />
      );
    } else {
      return null;
    }
  };

  const renderSubstituteSnackBar = () => {
    return (
      <Snackbar
        style={{ position: 'absolute', zIndex: 1001, backgroundColor: theme.colors.GRAY }}
        visible={showSubstituteConfirmation}
        onDismiss={() => {
          setShowSubstituteConfirmation(false);
        }}
        duration={3000}
      >
        Response Received.
      </Snackbar>
    );
  };

  const updateOrderSubstitution = (paymentInfo: updateMedicineOrderSubstitutionVariables) => {
    client
      .mutate<updateMedicineOrderSubstitution, updateMedicineOrderSubstitutionVariables>({
        mutation: UPDATE_MEDICINE_ORDER_SUBSTITUTION,
        variables: paymentInfo,
      })
      .then((data) => {
        if (data?.data?.updateMedicineOrderSubstitution?.message === 'success') {
          fireSubstituteResponseEvent(paymentInfo?.substitution);
        }
      })
      .catch((error) => {
        CommonBugFender('updateMedicineOrderSubstitution Error', error);
      });
  };

  const renderNote = () => {
    let noteText = '';
    if (status === failure) {
      noteText =
        'Note : In case your account has been debited, you should get the refund in 10-14 business days.';
    } else if (paymentMode === 'COD') {
      noteText =
        selectedPrescriptionType === 'CONSULT'
          ? 'Note - Your order will be confirmed once the consultation is completed with a valid prescription'
          : 'Note - Your order is confirmed and has been placed successfully.';
    } else if (status != success && status != failure && status != aborted) {
      noteText =
        'Note : Your payment is in progress and this may take a couple of minutes to confirm your booking. We???ll intimate you once your bank confirms the payment.';
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
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.retryButton}
          onPress={() => handleButton()}
        >
          <Text style={theme.viewStyles.text('SB', 13, '#ffffff', 1, 24)}>RETRY PAYMENT</Text>
        </TouchableOpacity>
        {!circleMembershipCharges && (
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.codButton}
            onPress={() => initiateOrder()}
          >
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
      setSelectedPrescriptionType && setSelectedPrescriptionType('');
      props.navigation.navigate(AppRoutes.ServerCart);
    } else {
      clearCircleSubscriptionData();
      moveToHome();
    }
  };

  const renderButton = () => {
    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.5}
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
            activeOpacity={0.5}
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

  const renderPrescriptionInfo = () => {
    const isPrescriptionLater = prescriptionType === PrescriptionType.LATER;
    const name = consultProfile?.firstName || currentPatient?.firstName;
    const title = isPrescriptionLater
      ? 'Share Prescription Later Selected'
      : AppConfig.Configuration.FREE_CONSULT_MESSAGE.orderConfirmationHeader.replace(
          '{Patient Name}',
          name
        );
    const description = isPrescriptionLater
      ? 'You have to share prescription later for order to be verified successfully.'
      : AppConfig.Configuration.FREE_CONSULT_MESSAGE.orderConfirmationMessage;
    const note = isPrescriptionLater
      ? 'Delivery TAT will be on hold till the prescription is submitted.'
      : 'Delivery TAT will be on hold till the consult is completed.';
    return (
      <PrescriptionInfoView
        title={title}
        description={description}
        note={note}
        style={{ marginHorizontal: 20 }}
        uploadNowToBeShown={false}
      />
    );
  };
  const beforeRedirectGetRewardIdAndCampaignId = async () => {
    try {
      const responseCampaign = await client.query({
        query: GET_CAMPAIGN_ID_FOR_REFERRER,
        variables: { camp: 'HC_CAMPAIGN' },
        fetchPolicy: 'no-cache',
      });
      const responseReward = await client.query({
        query: GET_REWARD_ID,
        variables: { reward: 'HC' },
        fetchPolicy: 'no-cache',
      });
      if (responseCampaign?.data?.getCampaignInfoByCampaignType?.id) {
        const campaignId = responseCampaign?.data?.getCampaignInfoByCampaignType?.id;
        setCampaignId?.(campaignId);
      }
      if (responseReward?.data?.getRewardInfoByRewardType?.id) {
        const rewardId = responseReward?.data?.getRewardInfoByRewardType?.id;
        setRewardId?.(rewardId);
      }
      props.navigation.navigate('ShareReferLink');
    } catch (e) {}
  };
  const renderReferrerBanner = () => {
    return (
      <View style={styles.referrerBannerContainer}>
        <ReferralBanner
          {...props}
          redirectOnShareReferrer={() => {
            beforeRedirectGetRewardIdAndCampaignId();
          }}
          screenName={'Pharma order screen'}
        />
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
              {showSubstituteMessage && !!substituteTime && substituteItemsCard()}
              {renderStatusCard()}
              {status === 'PAYMENT_SUCCESS' && isCircleBought
                ? renderAddedCirclePlanWithValidity()
                : null}
              {(status === 'PAYMENT_SUCCESS' || paymentMode === 'COD') &&
              totalCashBack &&
              !isCircleBought
                ? renderCircleSavingsOnPurchase()
                : null}
              {selectedPrescriptionType === 'CONSULT' && renderPrescriptionInfo()}
              {renderCODNote()}
              {status != failure && status != aborted && appointmentHeader()}
              {status != failure && status != aborted && appointmentCard()}
              {renderNote()}
              {status == failure || status == aborted ? renderRetryPayment() : renderButton()}
              {renderSubstituteSnackBar()}
              {isReferrerAvailable && renderReferrerBanner()}
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
  referrerBannerContainer: {
    marginTop: 10,
  },
});
