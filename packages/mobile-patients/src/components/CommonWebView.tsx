import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, NavState, BackHandler } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { WebView } from 'react-native-webview';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Spinner } from './ui/Spinner';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import AsyncStorage from '@react-native-community/async-storage';
import { postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

export interface CommonWebViewProps extends NavigationScreenProps {}

export const CommonWebView: React.FC<CommonWebViewProps> = (props) => {
  const { navigation } = props;
  const source = props.navigation.getParam('source');
  const [loading, setLoading] = useState<boolean>(true);
  const isCallback = props.navigation.getParam('isCallback');
  const isGoBack = props.navigation.getParam('isGoBack');
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  let WebViewRef: any;
  const { currentPatient } = useAllCurrentPatients();
  const {
    setCirclePlanSelected,
    setDefaultCirclePlan,
    setIsCircleSubscription,
    setCircleMembershipCharges,
    setCircleSubPlanId,
    setAutoCirlcePlanAdded,
  } = useShoppingCart();

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
    setCanGoBack(data?.canGoBack || false);
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
              setTimeout(
                () =>
                  props.navigation.navigate(AppRoutes.CircleSubscription, {
                    from: 'Diagnostics',
                    selectedPlan: selectedPlan,
                    action: 'PAY',
                  }),
                0
              );
            } else {
              setAutoCirlcePlanAdded && setAutoCirlcePlanAdded(false);
              setDefaultCirclePlan && setDefaultCirclePlan(null);
              setCirclePlanSelected && setCirclePlanSelected(responseData);
              setIsCircleSubscription && setIsCircleSubscription(true);
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
      {loading && <Spinner />}
    </View>
  );
};
