import React, { useState, useEffect } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  WebView,
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
import { getParameterByName } from '@aph/mobile-patients/src/helpers/helperFunctions';
import moment from 'moment';

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
});

export interface PaymentSceneProps extends NavigationScreenProps {
  orderId: string;
  orderAutoId: number;
  token: string;
  amount: number;
}
{
}

export const PaymentScene: React.FC<PaymentSceneProps> = (props) => {
  const { clearCartInfo } = useShoppingCart();
  const totalAmount = props.navigation.getParam('amount');
  const orderAutoId = props.navigation.getParam('orderAutoId');
  const orderId = props.navigation.getParam('orderId');
  const authToken = props.navigation.getParam('token');
  const deliveryTime = props.navigation.getParam('deliveryTime');
  const { currentPatient } = useAllCurrentPatients();
  const currentPatiendId = currentPatient && currentPatient.id;
  const [isRemindMeChecked, setIsRemindMeChecked] = useState(true);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { getPatientApiCall } = useAuth();
  const [loading, setLoading] = useState(true);

  const handleBack = async () => {
    Alert.alert('Alert', 'Do you want to go back?', [
      { text: 'No' },
      { text: 'Yes', onPress: () => props.navigation.goBack() },
    ]);
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

  const handleOrderSuccess = async () => {
    // BackHandler.removeEventListener('hardwareBackPress', handleBack);
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
              {deliveryTime && `Delivery By: ${moment(deliveryTime).format('D MMM YYYY')}`}
            </Text>
          </View>
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
      title: 'Uh oh.. :(',
      description: `We're sorry but the payment failed.`,
    });
  };

  const onWebViewStateChange = (data: NavState) => {
    const redirectedUrl = data.url;
    console.log({ redirectedUrl, data });
    const isMatchesSuccessUrl =
      (redirectedUrl &&
        redirectedUrl.indexOf(AppConfig.Configuration.PAYMENT_GATEWAY_SUCCESS_PATH) > -1) ||
      false;
    const isMatchesFailUrl =
      (redirectedUrl &&
        redirectedUrl.indexOf(AppConfig.Configuration.PAYMENT_GATEWAY_ERROR_PATH) > -1) ||
      false;

    if (isMatchesSuccessUrl) {
      const tk = getParameterByName('tk', redirectedUrl!);
      const status = getParameterByName('status', redirectedUrl!);
      console.log('Consult PG isMatchesSuccessUrl:\n', { tk, status });
      handleOrderSuccess();
      clearCartInfo && clearCartInfo();
    }
    if (isMatchesFailUrl) {
      handleOrderFailure();
    }
  };

  const renderWebView = () => {
    const baseUrl = AppConfig.Configuration.PAYMENT_GATEWAY_BASE_URL;
    const url = `${baseUrl}/paymed?amount=${totalAmount}&oid=${orderAutoId}&token=${authToken}&pid=${currentPatiendId}&source=mobile`;

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
        <Header
          title="PAYMENT"
          leftText={{
            isBack: false,
            title: 'Cancel',
            onPress: handleBack,
          }}
        />
        {renderWebView()}
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
