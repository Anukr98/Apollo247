import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, NavState, BackHandler } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Spinner } from './ui/Spinner';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import AsyncStorage from '@react-native-community/async-storage';
import {
  getCircleNoSubscriptionText,
  getCirclePlanDetails,
  getUserType,
  postCleverTapEvent,
  postWebEngageEvent,
  formatUrl,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { useApolloClient } from 'react-apollo-hooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { postAppsFlyerCircleAddRemoveCartEvent } from '@aph/mobile-patients/src/components/CirclePlan/Events';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import { PLAN, PLAN_ID } from '@aph/mobile-patients/src/graphql/types/globalTypes';

export interface CommonWebViewProps extends NavigationScreenProps {}

export const CommonWebView: React.FC<CommonWebViewProps> = (props) => {
  const { navigation } = props;
  const source = props.navigation.getParam('source');
  const [loading, setLoading] = useState<boolean>(true);
  const isCallback = props.navigation.getParam('isCallback');
  const isGoBack = props.navigation.getParam('isGoBack');
  const circleEventSource = props.navigation.getParam('circleEventSource');
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>('');
  const [userMobileNumber, setUserMobileNumber] = useState<string | null>('');
  const { returnAuthToken } = useAuth();

  let WebViewRef: any;
  const client = useApolloClient();
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const {
    setCirclePlanSelected,
    setDefaultCirclePlan,
    setIsCircleSubscription,
    setCircleMembershipCharges,
    setCircleSubPlanId,
    setAutoCirlcePlanAdded,
    circlePlanValidity,
    serverCartItems,
  } = useShoppingCart();
  const { circleSubscription } = useAppCommonData();
  const { setIsCircleAddedToCart, setSelectedCirclePlan } = useDiagnosticsCart();
  const { setUserActionPayload } = useServerCart();
  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;

  const [webviewURl, setWebViewUrl] = useState('');

  const fireCirclePlanSelectedEvent = () => {
    const CircleEventAttributes: WebEngageEvents[WebEngageEventName.PHARMA_WEBVIEW_PLAN_SELECTED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
    };
    source == ('Pharma' || 'Product Detail' || 'Pharma Cart') &&
      postWebEngageEvent(WebEngageEventName.PHARMA_WEBVIEW_PLAN_SELECTED, CircleEventAttributes);
  };

  useEffect(() => {
    const saveSessionValues = async () => {
      returnAuthToken?.().then(setToken);
      setUserMobileNumber(currentPatient?.mobileNumber);
    };
    saveSessionValues();
    setWebViewUrl(formatUrl(props?.navigation?.getParam('url'), token, userMobileNumber));
    if (circleEventSource) fireCircleLandingPageViewedEvent();
  }, []);

  const fireCircleLandingPageViewedEvent = async () => {
    const mobile_number = currentPatient?.mobileNumber;
    let circlePriceAndDuration;
    if (mobile_number)
      await getCirclePlanDetails(mobile_number, client).then((res) => {
        circlePriceAndDuration = res?.find(
          (item: any) => item?.subPlanId === circlePlanValidity?.plan_id
        );
      });

    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CIRCLE_LANDING_PAGE_VIEWED] = {
      navigation_source: circleEventSource,
      circle_end_date: circlePlanValidity?.endDate
        ? circlePlanValidity?.endDate
        : getCircleNoSubscriptionText(),
      circle_start_date: circlePlanValidity?.startDate
        ? circlePlanValidity?.startDate
        : getCircleNoSubscriptionText(),
      plan_id: circlePlanValidity?.plan_id
        ? circlePlanValidity?.plan_id
        : getCircleNoSubscriptionText(),
      customer_id: currentPatient?.id,
      duration_in_months: circleSubscription
        ? circlePriceAndDuration?.durationInMonth
        : getCircleNoSubscriptionText(),
      user_type: getUserType(allCurrentPatients),
      price: circleSubscription ? circlePriceAndDuration?.price : getCircleNoSubscriptionText(),
    };
    postCleverTapEvent(CleverTapEventName.CIRCLE_LANDING_PAGE_VIEWED, cleverTapEventAttributes);
  };

  const fireCirclePlanToCartEvent = (circleData: any) => {
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CIRCLE_PAYMENT_PAGE_VIEWED_STANDALONE_CIRCLE_PURCHASE_PAGE] = {
      navigation_source: circleEventSource,
      circle_end_date: circlePlanValidity?.endDate
        ? circlePlanValidity?.endDate
        : getCircleNoSubscriptionText(),
      circle_start_date: circlePlanValidity?.startDate
        ? circlePlanValidity?.startDate
        : getCircleNoSubscriptionText(),
      plan_id: circleData?.subPlanId,
      customer_id: currentPatient?.id,
      duration_in_months: circleData?.durationInMonth,
      user_type: getUserType(allCurrentPatients),
      price: circleData?.currentSellingPrice,
    };
    postCleverTapEvent(CleverTapEventName.CIRCLE_PLAN_TO_CART, cleverTapEventAttributes);
    postAppsFlyerCircleAddRemoveCartEvent(circleData, circleEventSource, 'add', currentPatient);
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleAndroidBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleAndroidBack);
    };
  }, [canGoBack]);

  const handleAndroidBack = async () => {
    if (canGoBack && WebViewRef) {
      WebViewRef?.goBack();
      return true;
    } else {
      handleBack();
    }
  };

  const handleResponse = (data: NavState) => {
    if (data.url?.indexOf('user_from_device') == -1) {
      const appendURI =
        data.url?.indexOf('?') == -1 ? '?user_from_device=true' : '&user_from_device=true';
      setWebViewUrl(data.url + appendURI);
    }

    setCanGoBack(data?.canGoBack || false);
  };

  const renderWebView = () => {
    let uri =
      webviewURl == ''
        ? formatUrl(props?.navigation?.getParam('url'), token, userMobileNumber)
        : webviewURl;
    return (
      <WebView
        ref={(WEBVIEW_REF) => (WebViewRef = WEBVIEW_REF)}
        onLoadEnd={() => setLoading!(false)}
        source={{ uri }}
        renderError={(errorCode) => renderError(WebViewRef)}
        onNavigationStateChange={(data) => handleResponse(data)}
        onMessage={(event) => {
          const { data } = event.nativeEvent;
          const callBackData = data && JSON.parse(data); //gives entire result
          const action = callBackData?.action;
          const selectedPlan =
            action == 'PAY'
              ? callBackData?.selection && JSON.parse(callBackData.selection)
              : callBackData;

          if (callBackData === 'back') {
            navigation.goBack();
          }
          if (selectedPlan?.subPlanId) {
            const responseData = selectedPlan;
            fireCirclePlanSelectedEvent();
            if (action == 'PAY') {
              setDefaultCirclePlan && setDefaultCirclePlan(null);
              setCirclePlanSelected && setCirclePlanSelected(responseData);
              props.navigation.navigate(AppRoutes.SubscriptionCart, {
                circleEventSource,
              });
            } else {
              if (source === 'Diagnostic Cart') {
                setIsCircleAddedToCart?.(true);
                setSelectedCirclePlan?.(responseData);
                setCircleMembershipCharges &&
                  setCircleMembershipCharges(responseData?.currentSellingPrice);
                setCircleSubPlanId && setCircleSubPlanId(responseData?.subPlanId);
              } else {
                setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
                setDefaultCirclePlan && setDefaultCirclePlan(null);
                setCirclePlanSelected && setCirclePlanSelected(responseData);
                setIsCircleSubscription && setIsCircleSubscription(true);
                fireCirclePlanToCartEvent(responseData);
                setCircleMembershipCharges &&
                  setCircleMembershipCharges(responseData?.currentSellingPrice);
                setCircleSubPlanId && setCircleSubPlanId(responseData?.subPlanId);
                AsyncStorage.setItem('circlePlanSelected', data);
                setUserActionPayload?.({
                  subscription: {
                    planId: PLAN_ID.CIRCLEPlan,
                    subPlanId: responseData?.subPlanId,
                    TYPE: PLAN.CARE_PLAN,
                    subscriptionApplied: true,
                  },
                });
                if (serverCartItems?.length === 0) {
                  props.navigation.navigate(AppRoutes.SubscriptionCart, { circleEventSource });
                  return;
                }
              }

              navigation.goBack();
            }
            if (isCallback) {
              navigation?.state?.params?.onPlanSelected();
            }
          }
        }}
      />
    );
  };

  const handleBack = async () => {
    isGoBack ? props.navigation.goBack() : props.navigation.navigate(AppRoutes.HomeScreen);
  };

  const renderError = (WebViewRef: any) => {
    isGoBack ? props.navigation.goBack() : props.navigation.navigate(AppRoutes.HomeScreen);
    return <View style={{ flex: 1 }}></View>;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header leftIcon={isGoBack ? 'close' : 'logo'} onPressLeftIcon={() => handleBack()} />
        <View style={{ flex: 1, overflow: 'hidden' }}>{renderWebView()}</View>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
