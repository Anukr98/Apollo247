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

const styles = StyleSheet.create({
  popupButtonStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popupButtonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.APP_YELLOW,
    lineHeight: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
});

export interface PaymentSceneProps
  extends NavigationScreenProps<{
    orderId: string;
    orderAutoId: number;
    token: string;
    amount: number;
    burnHC: number;
    deliveryTime: string;
    paymentTypeID: string;
    bankCode: any;
    checkoutEventAttributes?: WebEngageEvents[WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED];
    appsflyerEventAttributes: AppsFlyerEvents[AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED];
    coupon: any;
    cartItems: ShoppingCartItem[];
  }> {}

export const PaymentScene: React.FC<PaymentSceneProps> = (props) => {
  const { clearCartInfo } = useShoppingCart();
  const totalAmount = props.navigation.getParam('amount');
  const burnHC = props.navigation.getParam('burnHC');
  const orderAutoId = props.navigation.getParam('orderAutoId');
  const orderId = props.navigation.getParam('orderId');
  const authToken = props.navigation.getParam('token');
  const deliveryTime = props.navigation.getParam('deliveryTime');
  const paymentTypeID = props.navigation.getParam('paymentTypeID');
  const bankCode = props.navigation.getParam('bankCode');
  const checkoutEventAttributes = props.navigation.getParam('checkoutEventAttributes');
  const appsflyerEventAttributes = props.navigation.getParam('appsflyerEventAttributes');
  const coupon = props.navigation.getParam('coupon');
  const cartItems = props.navigation.getParam('cartItems');
  const { currentPatient } = useAllCurrentPatients();
  const currentPatiendId = currentPatient && currentPatient.id;
  const [isRemindMeChecked, setIsRemindMeChecked] = useState(true);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { getPatientApiCall } = useAuth();
  const [loading, setLoading] = useState(true);

  const handleBack = async () => {
    Alert.alert('Alert', 'Are you sure you want to change your payment mode?', [
      { text: 'No' },
      { text: 'Yes', onPress: () => props.navigation.goBack() },
    ]);
    return true;
  };

  // useEffect(() => {
  //   const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
  //     BackHandler.addEventListener('hardwareBackPress', handleBack);
  //   });

  //   const _willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
  //     BackHandler.removeEventListener('hardwareBackPress', handleBack);
  //   });

  //   return () => {
  //     _didFocusSubscription && _didFocusSubscription.remove();
  //     _willBlurSubscription && _willBlurSubscription.remove();
  //   };
  // }, []);

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

  const navigateToOrderDetails = (showOrderSummaryTab: boolean) => {
    hideAphAlert!();
    props.navigation.navigate(AppRoutes.OrderDetailsScene, {
      goToHomeOnBack: true,
      showOrderSummaryTab,
      orderAutoId,
    });
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
      coupon: coupon,
      currency: 'INR',
      items: items,
      transaction_id: orderId,
      value: totalAmount,
    };
    postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
  };

  const handleOrderSuccess = async () => {
    // BackHandler.removeEventListener('hardwareBackPress', handleBack);
    try {
      if (checkoutEventAttributes) {
        const paymentEventAttributes = {
          order_Id: orderId,
          order_AutoId: orderAutoId,
          Type: 'Pharmacy',
          Payment_Status: 'PAYMENT_SUCCESS',
        };
        postWebEngageEvent(WebEngageEventName.PAYMENT_STATUS, paymentEventAttributes);
        postWebEngageEvent(WebEngageEventName.PHARMACY_CHECKOUT_COMPLETED, checkoutEventAttributes);
        postAppsFlyerEvent(
          AppsFlyerEventName.PHARMACY_CHECKOUT_COMPLETED,
          appsflyerEventAttributes
        );
        firePurchaseEvent();
        try {
          Promise.all(
            cartItems.map((cartItem) =>
              trackTagalysEvent(
                {
                  event_type: 'product_action',
                  details: {
                    sku: cartItem.id,
                    action: 'buy',
                    quantity: cartItem.quantity,
                    order_id: `${orderAutoId}`,
                  } as Tagalys.ProductAction,
                },
                g(currentPatient, 'id')!
              )
            )
          );
        } catch (error) {
          CommonBugFender(`${AppRoutes.CheckoutSceneNew}_trackTagalysEvent`, error);
        }
      }
    } catch (error) {}

    setLoading!(false);
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
      })
    );
    showAphAlert!({
      // unDismissable: true,
      title: `Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`,
      description:
        'Your order has been placed successfully. We will confirm the order in a few minutes.',
      children: (
        <View
          style={{
            margin: 20,
            marginTop: 16,
            padding: 16,
            backgroundColor: '#f7f8f5',
            borderRadius: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <MedicineIcon />
            <Text
              style={{
                flex: 1,
                ...theme.fonts.IBMPlexSansMedium(17),
                lineHeight: 24,
                color: '#01475b',
              }}
            >
              Medicines
            </Text>
            <Text
              style={{
                flex: 1,
                ...theme.fonts.IBMPlexSansMedium(14),
                lineHeight: 24,
                color: '#01475b',
                textAlign: 'right',
              }}
            >
              {`#${orderAutoId}`}
            </Text>
          </View>
          {moment(deliveryTime).isValid() && (
            <>
              <View
                style={{
                  height: 1,
                  backgroundColor: '#02475b',
                  opacity: 0.1,
                  marginBottom: 7.5,
                  marginTop: 15.5,
                }}
              />
              <View>
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
                  }}
                >
                  {deliveryTime &&
                    `Delivery By: ${moment(deliveryTime).format('D MMM YYYY  | hh:mm A')}`}
                </Text>
              </View>
            </>
          )}
          {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 7.5
              }}
            >
              <Text
                style={{
                  // flex: 1,
                  ...theme.fonts.IBMPlexSansMedium(14),
                  lineHeight: 24,
                  color: '#01475b',
                }}
              >
                Remind me to take medicines
              </Text>
              <TouchableOpacity style={{}} onPress={() => setIsRemindMeChecked(!isRemindMeChecked)}>
                {isRemindMeChecked ? <CheckedIcon /> : <UnCheck />}
              </TouchableOpacity>
            </View> */}
          <View
            style={{
              height: 1,
              backgroundColor: '#02475b',
              opacity: 0.1,
              marginBottom: 15.5,
              marginTop: 7.5,
            }}
          />
          <View style={styles.popupButtonStyle}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => navigateToOrderDetails(true)}>
              <Text style={styles.popupButtonTextStyle}>VIEW INVOICE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'flex-end' }}
              onPress={() => navigateToOrderDetails(false)}
            >
              <Text style={styles.popupButtonTextStyle}>TRACK ORDER</Text>
            </TouchableOpacity>
          </View>
        </View>
      ),
    });
  };

  const handleOrderFailure = () => {
    props.navigation.goBack();
    showAphAlert!({
      title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
      description: `We're sorry. :(  There's been a problem with your order. If money was debited from your account, it will be refunded automatically in 5-7 working days.`,
    });
  };

  const onWebViewStateChange = (data: NavState) => {
    const redirectedUrl = data.url;
    console.log({ redirectedUrl, data });
    if (
      redirectedUrl &&
      redirectedUrl.indexOf(AppConfig.Configuration.PAYMENT_GATEWAY_SUCCESS_PATH) > -1
    ) {
      handleOrderSuccess();
      clearCartInfo && clearCartInfo();
    } else if (
      redirectedUrl &&
      redirectedUrl.indexOf(AppConfig.Configuration.PAYMENT_GATEWAY_ERROR_PATH) > -1
    ) {
      props.navigation.navigate(AppRoutes.PaymentStatus, {
        orderId: orderId,
        orderAutoId: orderAutoId,
        amount: totalAmount,
        paymentTypeID: paymentTypeID,
      });
    }
    // const isMatchesSuccessUrl =
    //   (redirectedUrl &&
    //     redirectedUrl.indexOf(AppConfig.Configuration.PAYMENT_GATEWAY_SUCCESS_PATH) > -1) ||
    //   false;
    // const isMatchesFailUrl =
    //   (redirectedUrl &&
    //     redirectedUrl.indexOf(AppConfig.Configuration.PAYMENT_GATEWAY_ERROR_PATH) > -1) ||
    //   false;

    // if (isMatchesSuccessUrl) {
    //   const tk = getParameterByName('tk', redirectedUrl!);
    //   const status = getParameterByName('status', redirectedUrl!);
    //   console.log('Consult PG isMatchesSuccessUrl:\n', { tk, status });
    //   handleOrderSuccess();
    //   clearCartInfo && clearCartInfo();
    // }
    // if (isMatchesFailUrl) {
    //   const responseMessage = getParameterByName('responseMessage', redirectedUrl!);
    //   const responseCode = getParameterByName('responseCode', redirectedUrl!);
    //   console.log({ responseMessage, responseCode });
    //   if (responseCode == '141' && responseMessage == 'User has not completed transaction.') {
    //     // To handle Paytm PG page back button
    //     props.navigation.goBack();
    //   } else {
    //     handleOrderFailure();
    //   }
    // }
  };

  const renderWebView = () => {
    const baseUrl = AppConfig.Configuration.PAYMENT_GATEWAY_BASE_URL;
    const url = `${baseUrl}/paymed?amount=${totalAmount}&oid=${orderAutoId}&pid=${currentPatiendId}&source=mobile&paymentTypeID=${paymentTypeID}&paymentModeOnly=YES${
      burnHC ? '&hc=' + burnHC : ''
    }${bankCode ? '&bankCode=' + bankCode : ''}`;

    // PATH: /paymed?amount=${totalAmount}&oid=${orderAutoId}&token=${authToken}&pid=${currentPatiendId}&source=mobile
    // SUCCESS_PATH: /mob?tk=<>&status=<>
    console.log({ totalAmount, orderAutoId, authToken, url });
    console.log(`%cMEDICINE_PG_URL:\t${url}`, 'color: #bada55');

    return (
      <WebView
        onLoadStart={() => setLoading!(true)}
        onLoadEnd={() => setLoading!(false)}
        bounces={false}
        useWebKit={true}
        source={{ uri: url }}
        onNavigationStateChange={onWebViewStateChange}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header leftIcon="backArrow" title="PAYMENT" onPressLeftIcon={() => handleBack()} />
        {Platform.OS == 'android' ? (
          <KeyboardAvoidingView style={styles.container} behavior={'height'}>
            {renderWebView()}
          </KeyboardAvoidingView>
        ) : (
          renderWebView()
        )}
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
