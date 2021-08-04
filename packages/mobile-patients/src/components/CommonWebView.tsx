import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Platform, NavState, BackHandler } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Spinner } from './ui/Spinner';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import AsyncStorage from '@react-native-community/async-storage';
import {
  getCircleNoSubscriptionText,
  getUserType,
  postCleverTapEvent,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';

import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  CREATE_USER_SUBSCRIPTION,
  CREATE_INTERNAL_ORDER,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  CreateUserSubscription,
  CreateUserSubscriptionVariables,
} from '@aph/mobile-patients/src/graphql/types/CreateUserSubscription';
import { useApolloClient } from 'react-apollo-hooks';
import {
  one_apollo_store_code,
  PaymentStatus,
  OrderCreate,
  OrderVerticals,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  createOrderInternal,
  createOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrderInternal';
import { CommonBugFender } from '../FunctionHelpers/DeviceHelper';
import {
  initiateSDK,
  createHyperServiceObject,
  terminateSDK,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { useGetJuspayId } from '@aph/mobile-patients/src/hooks/useGetJuspayId';
import { fireCirclePaymentPageViewedEvent } from '@aph/mobile-patients/src/components/CirclePlan/Events';
export interface CommonWebViewProps extends NavigationScreenProps {}

export const CommonWebView: React.FC<CommonWebViewProps> = (props) => {
  const { navigation } = props;
  const source = props.navigation.getParam('source');
  const [loading, setLoading] = useState<boolean>(true);
  const isCallback = props.navigation.getParam('isCallback');
  const isGoBack = props.navigation.getParam('isGoBack');
  const circleEventSource = props.navigation.getParam('circleEventSource');
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
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
  } = useShoppingCart();
  const { showAphAlert } = useUIElements();
  const storeCode =
    Platform.OS === 'ios' ? one_apollo_store_code.IOSCUS : one_apollo_store_code.ANDCUS;
  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;
  const fireCirclePlanSelectedEvent = () => {
    const CircleEventAttributes: WebEngageEvents[WebEngageEventName.PHARMA_WEBVIEW_PLAN_SELECTED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
    };
    source == ('Pharma' || 'Product Detail' || 'Pharma Cart') &&
      postWebEngageEvent(WebEngageEventName.PHARMA_WEBVIEW_PLAN_SELECTED, CircleEventAttributes);
  };
  const { cusId, isfetchingId } = useGetJuspayId();
  const [hyperSdkInitialized, setHyperSdkInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (circleEventSource) fireCircleLandingPageViewedEvent();
  }, []);

  const fireCircleLandingPageViewedEvent = () => {
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CIRCLE_LANDING_PAGE_VIEWED] = {
      navigation_source: circleEventSource,
      circle_end_date: getCircleNoSubscriptionText(),
      circle_start_date: getCircleNoSubscriptionText(),
      circle_planid: getCircleNoSubscriptionText(),
      customer_id: currentPatient?.id,
      duration_in_month: getCircleNoSubscriptionText(),
      user_type: getUserType(allCurrentPatients),
      price: getCircleNoSubscriptionText(),
    };
    postCleverTapEvent(CleverTapEventName.CIRCLE_LANDING_PAGE_VIEWED, cleverTapEventAttributes);
  };

  const fireCirclePlanToCartEvent = (circleData: any) => {
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CIRCLE_PAYMENT_PAGE_VIEWED_STANDALONE_CIRCLE_PURCHASE_PAGE] = {
      navigation_source: circleEventSource,
      circle_end_date: getCircleNoSubscriptionText(),
      circle_start_date: getCircleNoSubscriptionText(),
      circle_planid: circleData?.subPlanId,
      customer_id: currentPatient?.id,
      duration_in_month: circleData?.durationInMonth,
      user_type: getUserType(allCurrentPatients),
      price: circleData?.currentSellingPrice,
    };
    postCleverTapEvent(CleverTapEventName.CIRCLE_PLAN_TO_CART, cleverTapEventAttributes);
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

  useEffect(() => {
    !isfetchingId ? (cusId ? initiateHyperSDK(cusId) : initiateHyperSDK(currentPatient?.id)) : null;
  }, [isfetchingId]);

  const initiateHyperSDK = async (cusId: any) => {
    try {
      const merchantId = AppConfig.Configuration.merchantId;
      terminateSDK();
      createHyperServiceObject();
      initiateSDK(cusId, cusId, merchantId);
      setHyperSdkInitialized(true);
    } catch (error) {
      CommonBugFender('ErrorWhileInitiatingHyperSDK', error);
    }
  };

  const handleResponse = (data: NavState) => {
    setCanGoBack(data?.canGoBack || false);
  };

  const createOrderInternal = (selectedPlan: any, subscriptionId: string) => {
    const orders: OrderVerticals = {
      subscription: [
        {
          order_id: subscriptionId,
          amount: Number(selectedPlan?.currentSellingPrice),
          patient_id: currentPatient?.id,
        },
      ],
    };
    const orderInput: OrderCreate = {
      orders: orders,
      total_amount: Number(selectedPlan?.currentSellingPrice),
    };
    return client.mutate<createOrderInternal, createOrderInternalVariables>({
      mutation: CREATE_INTERNAL_ORDER,
      variables: { order: orderInput },
    });
  };

  const initiateCirclePurchase = async (selectedPlan: any) => {
    try {
      setLoading(true);
      const purchaseInput = {
        userSubscription: {
          mobile_number: currentPatient?.mobileNumber,
          plan_id: planId,
          sub_plan_id: selectedPlan?.subPlanId,
          storeCode,
          FirstName: currentPatient?.firstName,
          LastName: currentPatient?.lastName,
          payment_reference: {
            amount_paid: Number(selectedPlan?.currentSellingPrice),
            payment_status: PaymentStatus.PENDING,
            purchase_via_HC: false,
            HC_used: 0,
          },
          transaction_date_time: new Date().toISOString(),
        },
      };
      const response = await client.mutate<CreateUserSubscription, CreateUserSubscriptionVariables>(
        {
          mutation: CREATE_USER_SUBSCRIPTION,
          variables: purchaseInput,
          fetchPolicy: 'no-cache',
        }
      );
      const subscriptionId = g(response, 'data', 'CreateUserSubscription', 'response', '_id');
      const data = await createOrderInternal(selectedPlan, subscriptionId);
      const orderInfo = {
        orderId: subscriptionId,
        circleParams: {
          circleActivated: true,
          circlePlanValidity: g(response, 'data', 'CreateUserSubscription', 'response', 'end_date'),
        },
      };
      setLoading(false);
      if (data?.data?.createOrderInternal?.success) {
        fireCirclePaymentPageViewedEvent(
          selectedPlan,
          circleEventSource,
          allCurrentPatients,
          currentPatient
        );
        props.navigation.navigate(AppRoutes.PaymentMethods, {
          paymentId: data?.data?.createOrderInternal?.payment_order_id!,
          amount: Number(selectedPlan?.currentSellingPrice),
          orderDetails: orderInfo,
          businessLine: 'subscription',
          customerId: cusId,
        });
      }
    } catch (error) {
      setLoading(false);
      renderAlert('Something went wrong. Please try again after some time');
    }
  };

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  const renderWebView = () => {
    return (
      <WebView
        ref={(WEBVIEW_REF) => (WebViewRef = WEBVIEW_REF)}
        onLoadEnd={() => setLoading!(false)}
        source={{ uri: props.navigation.getParam('url') }}
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
              initiateCirclePurchase(selectedPlan);
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
    isGoBack ? props.navigation.goBack() : props.navigation.navigate(AppRoutes.ConsultRoom);
  };

  const renderError = (WebViewRef: any) => {
    isGoBack ? props.navigation.goBack() : props.navigation.navigate(AppRoutes.ConsultRoom);
    return <View style={{ flex: 1 }}></View>;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header leftIcon={isGoBack ? 'close' : 'logo'} onPressLeftIcon={() => handleBack()} />
        <View style={{ flex: 1, overflow: 'hidden' }}>{renderWebView()}</View>
      </SafeAreaView>
      {(loading || !hyperSdkInitialized) && <Spinner />}
    </View>
  );
};
