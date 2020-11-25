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
import { NavigationScreenProps } from 'react-navigation';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { ONE_APOLLO_STORE_CODE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';

interface PaymentGatewayProps extends NavigationScreenProps {
  paymentTypeID: string;
}
export const SubscriptionPaymentGateway: React.FC<PaymentGatewayProps> = (props) => {
  let WebViewRef: any;
  const { currentPatient } = useAllCurrentPatients();
  const { circlePlanSelected, defaultCirclePlan } = useShoppingCart();

  const paymentTypeID = props.navigation.getParam('paymentTypeID');
  const storeCode =
    Platform.OS === 'ios' ? ONE_APOLLO_STORE_CODE.IOSCUS : ONE_APOLLO_STORE_CODE.ANDCUS;
  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;
  const { setLoading } = useUIElements();
  const planSellingPrice = defaultCirclePlan
    ? defaultCirclePlan?.currentSellingPrice
    : circlePlanSelected?.currentSellingPrice;
  const subPlanId = defaultCirclePlan
    ? defaultCirclePlan?.subPlanId
    : circlePlanSelected?.subPlanId;

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

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
    console.log({ data, redirectedUrl });
    if (
      redirectedUrl &&
      (redirectedUrl.indexOf(AppConfig.Configuration.CONSULT_PG_SUCCESS_PATH) > -1 ||
        redirectedUrl.indexOf(AppConfig.Configuration.CONSULT_PG_ERROR_PATH) > -1)
    ) {
      navigatetoStatusScreen();
    }
  };

  const navigatetoStatusScreen = () => {
    // show circle member activated component
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
