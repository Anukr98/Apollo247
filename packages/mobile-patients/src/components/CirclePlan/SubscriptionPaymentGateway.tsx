import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Alert,
  Platform,
  KeyboardAvoidingView,
  NavState,
} from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { WebView } from 'react-native-webview';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { ONE_APOLLO_STORE_CODE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  postWebEngageEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { FirebaseEvents, FirebaseEventName } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import moment from 'moment';
import { postCircleWEGEvent } from '@aph/mobile-patients/src/components/CirclePlan/Events';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

interface PaymentGatewayProps extends NavigationScreenProps {
  paymentTypeID: string;
  selectedPlan?: any;
  forCircle?: boolean;
  from?: string;
  screenName?: string;
}
export const SubscriptionPaymentGateway: React.FC<PaymentGatewayProps> = (props) => {
  let WebViewRef: any;
  const { currentPatient } = useAllCurrentPatients();
  const { isRenew, circleSubscription } = useAppCommonData();
  const { circlePlanSelected, defaultCirclePlan } = useShoppingCart();
  const from = props.navigation.getParam('from');
  const paymentTypeID = props.navigation.getParam('paymentTypeID');
  const selectedPlan = props.navigation.getParam('selectedPlan');
  const forCircle = props.navigation.getParam('forCircle');
  const screenName = props.navigation.getParam('screenName');
  const storeCode =
    Platform.OS === 'ios' ? ONE_APOLLO_STORE_CODE.IOSCUS : ONE_APOLLO_STORE_CODE.ANDCUS;
  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;
  const { setLoading } = useUIElements();
  const planSellingPrice = selectedPlan
    ? selectedPlan?.currentSellingPrice
    : defaultCirclePlan
    ? defaultCirclePlan?.currentSellingPrice
    : circlePlanSelected?.currentSellingPrice;
  const subPlanId = selectedPlan
    ? selectedPlan?.subPlanId
    : defaultCirclePlan
    ? defaultCirclePlan?.subPlanId
    : circlePlanSelected?.subPlanId;

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const fireCirclePurchaseEvent = () => {
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
      transaction_id: currentPatient?.mobileNumber,
      value: Number(circlePlanSelected?.currentSellingPrice),
      LOB: 'Circle',
    };
    postFirebaseEvent(FirebaseEventName.PURCHASE, eventAttributes);
  };

  const firePaymentDoneEvent = () => {
    const CircleEventAttributes: WebEngageEvents[WebEngageEventName.PURCHASE_CIRCLE] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      'Membership Type': String(circlePlanSelected?.valid_duration) + ' days',
      'Membership End Date': moment(new Date())
        .add(circlePlanSelected?.valid_duration, 'days')
        .format('DD-MMM-YYYY'),
      'Circle Plan Price': circlePlanSelected?.currentSellingPrice,
      Type: 'Direct Payment',
      Source: from,
    };
    !!circlePlanSelected?.valid_duration &&
      !!circlePlanSelected?.currentSellingPrice &&
      postWebEngageEvent(WebEngageEventName.PURCHASE_CIRCLE, CircleEventAttributes);
  };

  const handleBack = () => {
    Alert.alert('Alert', 'Are you sure you want to choose a different payment mode?', [
      { text: 'No' },
      {
        text: 'Yes',
        onPress: () => {
          WebViewRef && WebViewRef.stopLoading();
          props.navigation.goBack();
        },
      },
    ]);
    return true;
  };

  const renderwebView = () => {
    const baseUrl = AppConfig.Configuration.CONSULT_PG_BASE_URL;
    let circlePurchaseUrl = `${baseUrl}/subscriptionpayment?patientId=${currentPatient?.id}&price=${planSellingPrice}&paymentTypeID=${paymentTypeID}&paymentModeOnly=YES&planId=${planId}&subPlanId=${subPlanId}&storeCode=${storeCode}`;
    return (
      <WebView
        ref={(WEBVIEW_REF) => (WebViewRef = WEBVIEW_REF)}
        onLoadStart={() => setLoading!(true)}
        onLoadEnd={() => setLoading!(false)}
        bounces={false}
        source={{
          uri: circlePurchaseUrl,
        }}
        onNavigationStateChange={(data) => onWebViewStateChange(data)}
      />
    );
  };

  const onWebViewStateChange = (data: NavState) => {
    const redirectedUrl = data.url;
    if (
      redirectedUrl &&
      redirectedUrl.indexOf(AppConfig.Configuration.SUBSCRIPTION_PG_SUCCESS) > -1
    ) {
      forCircle ? firePaymentDoneEvent() : null;
      fireCirclePurchaseEvent();
      navigatetoStatusScreen(redirectedUrl);
      const circlePlanValidity = {
        startDate: new Date(),
        endDate: redirectedUrl?.split('end_date=')?.[1],
      };
      postCircleWEGEvent(
        currentPatient,
        isRenew ? 'About to Expire' : 'Expired',
        'renewed',
        circlePlanValidity,
        true,
        screenName || 'Homepage',
        'Direct Payment'
      );
    }
  };

  const navigatetoStatusScreen = (url: string) => {
    // show circle member activated component
    setLoading!(false);
    const circlePlanValidity = url.split('end_date=');
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [
          NavigationActions.navigate({
            routeName: AppRoutes.ConsultRoom,
            params: {
              circleActivated: true,
              circlePlanValidity: circlePlanValidity[1],
            },
          }),
        ],
      })
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Header leftIcon="backArrow" title="PAYMENT" onPressLeftIcon={() => handleBack()} />
        {Platform.OS == 'android' ? (
          <KeyboardAvoidingView style={styles.container} behavior={'height'}>
            {renderwebView()}
          </KeyboardAvoidingView>
        ) : (
          renderwebView()
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
});
