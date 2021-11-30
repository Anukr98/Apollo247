import React, { useState, useEffect } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Platform,
  View,
  KeyboardAvoidingView,
  BackHandler,
  NavState,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  postWebEngageEvent,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postCleverTapEvent,
  getAsyncStorageValues,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
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
import { saveMedicineOrderOMSVariables } from '@aph/mobile-patients/src/graphql/types/saveMedicineOrderOMS';
import { ONE_APOLLO_STORE_CODE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';

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
    cleverTapCheckoutEventAttributes?: CleverTapEvents[CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED];
    coupon: any;
    cartItems: ShoppingCartItem[];
    orderInfo: saveMedicineOrderOMSVariables;
    planId?: string;
    subPlanId?: string;
    isStorePickup: boolean;
  }> {}

export const PaymentScene: React.FC<PaymentSceneProps> = (props) => {
  const {
    circleMembershipCharges,
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
  const cleverTapCheckoutEventAttributes = props.navigation.getParam(
    'cleverTapCheckoutEventAttributes'
  );
  const coupon = props.navigation.getParam('coupon');
  const cartItems = props.navigation.getParam('cartItems');
  const orderInfo = props.navigation.getParam('orderInfo');
  const planId = props.navigation.getParam('planId');
  const subPlanId = props.navigation.getParam('subPlanId');
  const { currentPatient } = useAllCurrentPatients();
  const currentPatiendId = currentPatient && currentPatient.id;
  const { getPatientApiCall } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isfocused, setisfocused] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>('');
  const [userMobileNumber, setUserMobileNumber] = useState<string | null>('');

  const { pharmacyUserTypeAttribute } = useAppCommonData();

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
    const saveSessionValues = async () => {
      const [loginToken, phoneNumber] = await getAsyncStorageValues();
      setToken(JSON.parse(loginToken));
      setUserMobileNumber(
        JSON.parse(phoneNumber)?.data?.getPatientByMobileNumber?.patients[0]?.mobileNumber
      );
    };
    saveSessionValues();
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

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
    const eventAttributes = {
      LOB: 'Pharmacy',
      af_order_id: orderId ? orderId : 0,
      af_price: totalAmount,
      af_coupon_code: coupon ? coupon : 0,
      af_payment_info_available: paymentTypeID,
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
      af_customer_user_id: currentPatient ? currentPatient.id : '',
      'cart size': cartItems.length,
      af_revenue: getFormattedAmount(grandTotal),
      af_currency: 'INR',
      af_order_id: orderId,
      orderAutoId: orderAutoId,
      'coupon applied': coupon ? true : false,
      af_content_id: cartItems?.map((item) => item?.id),
      af_price: cartItems?.map((item) => (item?.specialPrice ? item?.specialPrice : item?.price)),
      af_quantity: cartItems?.map((item) => item?.quantity),
      'Circle Cashback amount':
        circleSubscriptionId || isCircleSubscription ? Number(cartTotalCashback) : 0,
      ...pharmacyCircleAttributes!,
      ...pharmacyUserTypeAttribute,
      TransactionId: isStorePickup ? '' : transactionId,
    };
    return appsflyerEventAttributes;
  };

  const fireOrderEvent = (isSuccess: boolean, orderId: string, orderAutoId: number) => {
    if (checkoutEventAttributes && cleverTapCheckoutEventAttributes) {
      const paymentEventAttributes = {
        af_order_id: orderId,
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
        postCleverTapEvent(CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED, {
          ...cleverTapCheckoutEventAttributes,
          'Cart items': JSON.stringify(cartItems) || undefined,
        });
      }
    }
  };

  const fireCleverTapOrderEvent = (isSuccess: boolean) => {
    if (!!isSuccess) {
      postCleverTapEvent(CleverTapEventName.PHARMACY_CHECKOUT_COMPLETED, {
        ...cleverTapCheckoutEventAttributes,
        'Cart Items': JSON.stringify(cartItems) || undefined,
      });
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
      cleverTapCheckoutEventAttributes,
      isStorePickup: isStorePickup,
    });
  };

  const onWebViewStateChange = (data: NavState, WebViewRef: any) => {
    const redirectedUrl = data.url;
    const loading = data.loading;
    if (
      redirectedUrl &&
      redirectedUrl.indexOf(AppConfig.Configuration.PAYMENT_GATEWAY_SUCCESS_PATH) > -1 &&
      loading
    ) {
      navigationToPaymentStatus('PAYMENT_SUCCESS');
      fireCleverTapOrderEvent(true);
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
    }${
      bankCode ? '&bankCode=' + bankCode : ''
    }&utm_token=${token}&utm_mobile_number=${userMobileNumber}`;

    if (!circleSubscriptionId && isCircleSubscription) {
      url += `${planId ? '&planId=' + planId : ''}${
        subPlanId ? '&subPlanId=' + subPlanId : ''
      }${'&storeCode=' + storeCode}`;
    }

    let WebViewRef: any;
    return (
      <WebView
        ref={(WEBVIEW_REF) => (WebViewRef = WEBVIEW_REF)}
        onLoadStart={() => setLoading!(true)}
        onLoadEnd={() => setLoading!(false)}
        bounces={false}
        useWebKit={true}
        source={{
          uri: url,
          headers: {
            AccessFrom: 'app',
          },
        }}
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
