import React, { useState, useEffect } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  BackHandler,
  NavState,
} from 'react-native';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CheckedIcon, MedicineIcon, UnCheck } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  getParameterByName,
  g,
  postWebEngageEvent,
  postAppsFlyerEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import moment from 'moment';
import { WebView } from 'react-native-webview';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { FirebaseEvents, FirebaseEventName } from '../helpers/firebaseEvents';
import { ShoppingCartItem } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { trackTagalysEvent } from '@aph/mobile-patients/src/helpers/apiCalls';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { Tagalys } from '@aph/mobile-patients/src/helpers/Tagalys';
import { saveMedicineOrderOMSVariables } from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderOMS';
import { OrderPlacedPopUp } from '@aph/mobile-patients/src/components/ui/OrderPlacedPopUp';
import { ONE_APOLLO_STORE_CODE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import AsyncStorage from '@react-native-community/async-storage';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
});

export interface PaymentSceneProps
  extends NavigationScreenProps<{
    orders: any;
    transactionId: number;
    amount: number;
    burnHC: number;
    deliveryTime: string;
    paymentTypeID: string;
    bankCode: any;
    checkoutEventAttributes?: WebEngageEvents[WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED];
    coupon: any;
    cartItems: ShoppingCartItem[];
    orderInfo: saveMedicineOrderOMSVariables;
    planId?: string;
    subPlanId?: string;
    isStorePickup: boolean;
  }> {}

export const PaymentScene: React.FC<PaymentSceneProps> = (props) => {
  const {
    clearCartInfo,
    circleMembershipCharges,
    setCircleMembershipCharges,
    isCircleSubscription,
    circleSubscriptionId,
    pharmacyCircleAttributes,
    grandTotal,
    cartTotalCashback,
  } = useShoppingCart();
  const totalAmount = props.navigation.getParam('amount');
  const burnHC = props.navigation.getParam('burnHC');
  const orders = props.navigation.getParam('orders');
  const transactionId = props.navigation.getParam('transactionId');
  const deliveryTime = props.navigation.getParam('deliveryTime');
  const paymentTypeID = props.navigation.getParam('paymentTypeID');
  const bankCode = props.navigation.getParam('bankCode');
  const isStorePickup = props.navigation.getParam('isStorePickup');
  const checkoutEventAttributes = props.navigation.getParam('checkoutEventAttributes');
  const coupon = props.navigation.getParam('coupon');
  const cartItems = props.navigation.getParam('cartItems');
  const orderInfo = props.navigation.getParam('orderInfo');
  const planId = props.navigation.getParam('planId');
  const subPlanId = props.navigation.getParam('subPlanId');
  const { currentPatient } = useAllCurrentPatients();
  const currentPatiendId = currentPatient && currentPatient.id;
  const [isRemindMeChecked, setIsRemindMeChecked] = useState(true);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { getPatientApiCall } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isfocused, setisfocused] = useState<boolean>(false);
  const { circleSubscription } = useAppCommonData();

  const handleBack = async () => {
    Alert.alert('Alert', 'Are you sure you want to change your payment mode?', [
      { text: 'No' },
      { text: 'Yes', onPress: () => props.navigation.goBack() },
    ]);
    return true;
  };

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setisfocused(true);
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setisfocused(false);
    });
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
    };
  }, []);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

  // const navigateToOrderDetails = (showOrderSummaryTab: boolean) => {
  //   hideAphAlert!();
  //   props.navigation.navigate(AppRoutes.OrderDetailsScene, {
  //     goToHomeOnBack: true,
  //     showOrderSummaryTab,
  //     orderAutoId,
  //   });
  // };

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
      coupon: coupon,
      currency: 'INR',
      items: items,
      transaction_id: orderId,
      value: totalAmount,
      LOB: 'Pharma',
    };
    postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
  };

  const fireOrderFailedEvent = (orderId: string) => {
    const eventAttributes: FirebaseEvents[FirebaseEventName.ORDER_FAILED] = {
      OrderID: orderId,
      Price: totalAmount,
      CouponCode: coupon,
      PaymentType: paymentTypeID,
      LOB: 'Pharmacy',
    };
    postAppsFlyerEvent(AppsFlyerEventName.ORDER_FAILED, eventAttributes);
    postFirebaseEvent(FirebaseEventName.ORDER_FAILED, eventAttributes);
  };

  const getFormattedAmount = (num: number) => Number(num.toFixed(2));

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

  const fireOrderEvent = (isSuccess: boolean, orderId: string, orderAutoId: number) => {
    if (checkoutEventAttributes) {
      const paymentEventAttributes = {
        order_Id: orderId,
        order_AutoId: orderAutoId,
        LOB: 'Pharmacy',
        Payment_Status: !!isSuccess ? 'PAYMENT_SUCCESS' : 'PAYMENT_PENDING',
      };
      postWebEngageEvent(WebEngageEventName.PAYMENT_STATUS, paymentEventAttributes);
      postAppsFlyerEvent(AppsFlyerEventName.PAYMENT_STATUS, paymentEventAttributes);
      postFirebaseEvent(FirebaseEventName.PAYMENT_STATUS, paymentEventAttributes);
      postAppsFlyerEvent(
        AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED,
        getPrepaidCheckoutCompletedAppsFlyerEventAttributes(orderId, `${orderAutoId}`)
      );
      firePurchaseEvent(orderId);
      if (!!isSuccess) {
        postWebEngageEvent(WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED, {
          ...checkoutEventAttributes,
          'Cart Items': JSON.stringify(cartItems),
        });
      }
    }
  };

  const navigationToPaymentStatus = (status: string) => {
    props.navigation.navigate(AppRoutes.PharmacyPaymentStatus, {
      status: status,
      price: totalAmount,
      transId: transactionId,
      orders: orders,
      orderInfo: orderInfo,
      deliveryTime: deliveryTime,
      checkoutEventAttributes: checkoutEventAttributes,
      isStorePickup: isStorePickup,
    });
  };

  const onWebViewStateChange = (data: NavState, WebViewRef: any) => {
    const redirectedUrl = data.url;
    const loading = data.loading;
    console.log('redirectedUrl >>>>>>', redirectedUrl);
    if (
      redirectedUrl &&
      redirectedUrl.indexOf(AppConfig.Configuration.PAYMENT_GATEWAY_SUCCESS_PATH) > -1 &&
      loading
    ) {
      navigationToPaymentStatus('PAYMENT_SUCCESS');
      orders?.forEach((order: any) => {
        fireOrderEvent(true, order?.id!, order?.orderAutoId);
      });
      WebViewRef.stopLoading();
    } else if (
      redirectedUrl &&
      redirectedUrl.indexOf(AppConfig.Configuration.PAYMENT_GATEWAY_ERROR_PATH) > -1 &&
      loading
    ) {
      if (!!circleMembershipCharges) {
        navigationToPaymentStatus('PAYMENT_FAILED');
      } else {
        navigationToPaymentStatus('PAYMENT_PENDING');
      }
      orders?.forEach((order: any) => {
        fireOrderFailedEvent(order?.id!);
      });
      WebViewRef.stopLoading();
    }
  };

  const renderWebView = () => {
    const baseUrl = AppConfig.Configuration.PAYMENT_GATEWAY_BASE_URL;
    const storeCode =
      Platform.OS == 'android' ? ONE_APOLLO_STORE_CODE.ANDCUS : ONE_APOLLO_STORE_CODE.IOSCUS;
    let url = `${baseUrl}/${isStorePickup ? 'paymed' : 'paymedv2'}?amount=${totalAmount}&${
      isStorePickup ? 'oid' : 'transId'
    }=${transactionId}&pid=${currentPatiendId}&source=mobile&paymentTypeID=${paymentTypeID}&paymentModeOnly=YES${
      burnHC ? '&hc=' + burnHC : ''
    }${bankCode ? '&bankCode=' + bankCode : ''}`;

    if (!circleSubscriptionId && isCircleSubscription) {
      url += `${planId ? '&planId=' + planId : ''}${
        subPlanId ? '&subPlanId=' + subPlanId : ''
      }${'&storeCode=' + storeCode}`;
    }
    console.log({ totalAmount, transactionId, url });
    console.log(`%cMEDICINE_PG_URL:\t${url}`, 'color: #bada55');

    let WebViewRef: any;
    return (
      <WebView
        ref={(WEBVIEW_REF) => (WebViewRef = WEBVIEW_REF)}
        onLoadStart={() => setLoading!(true)}
        onLoadEnd={() => setLoading!(false)}
        bounces={false}
        useWebKit={true}
        source={{ uri: url }}
        onNavigationStateChange={(data) => onWebViewStateChange(data, WebViewRef)}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header leftIcon="backArrow" title="PAYMENT" onPressLeftIcon={() => handleBack()} />
        {Platform.OS == 'android' ? (
          <KeyboardAvoidingView style={styles.container} behavior={'height'}>
            {isfocused && renderWebView()}
          </KeyboardAvoidingView>
        ) : (
          isfocused && renderWebView()
        )}
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
