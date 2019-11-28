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
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CheckedIcon, MedicineIcon, UnCheck } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

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
  const [isOrderSuccess, setOrderSuccess] = useState<boolean>(false);
  const { clearCartInfo } = useShoppingCart();
  const totalAmount = props.navigation.getParam('amount');
  const orderAutoId = props.navigation.getParam('orderAutoId');
  const orderId = props.navigation.getParam('orderId');
  const authToken = props.navigation.getParam('token');
  const { currentPatient } = useAllCurrentPatients();
  const currentPatiendId = currentPatient && currentPatient.id;
  const [isRemindMeChecked, setIsRemindMeChecked] = useState(true);

  const { getPatientApiCall } = useAuth();

  const handleBack = async () => {
    Alert.alert('Alert', 'Cancel Order?', [
      { text: 'No' },
      { text: 'Yes', onPress: () => props.navigation.goBack() },
    ]);
  };

  useEffect(() => {
    const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });

    const _willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });

    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

  const getParameterByName = (name: string, url: string) => {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };

  const renderWebView = () => {
    const baseUrl = AppConfig.Configuration.PAYMENT_GATEWAY_BASE_URL;

    // /paymed?amount=${totalAmount}&oid=${orderAutoId}&token=${authToken}&pid=${currentPatiendId}&source=mobile
    // /mob?tk=<>&status=<>

    const url = `${baseUrl}/paymed?amount=${totalAmount}&oid=${orderAutoId}&token=${authToken}&pid=${currentPatiendId}&source=mobile`;
    console.log({ totalAmount, orderAutoId, authToken, url });
    console.log(url);

    // comment below line
    // return null;

    return (
      <WebView
        bounces={false}
        useWebKit={true}
        source={{ uri: url }}
        onNavigationStateChange={(data) => {
          console.log({ data });
          const redirectedUrl = data.url;
          console.log({ redirectedUrl });
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
            console.log({ tk, status });
            setOrderSuccess(true);
            clearCartInfo && clearCartInfo();
          }
          if (isMatchesFailUrl) {
            props.navigation.goBack();
            Alert.alert('Error', 'Payment failed');
          }
        }}
      />
    );
  };

  const renderOrderInfoPopup = () => {
    const navigateOnSuccess = (showOrderSummaryTab: boolean) => {
      props.navigation.replace(AppRoutes.OrderDetailsScene, {
        goToHomeOnBack: true,
        showOrderSummaryTab,
        orderAutoId,
      });
    };

    if (isOrderSuccess) {
      return (
        <BottomPopUp
          title={`Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`}
          description={'Your order has been placed successfully.'}
        >
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
            {/* <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
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
            </View> 
            <View
              style={{
                height: 1,
                backgroundColor: '#02475b',
                opacity: 0.1,
                marginBottom: 15.5,
                marginTop: 7.5,
              }}
            /> */}
            <View style={styles.popupButtonStyle}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => navigateOnSuccess(true)}>
                <Text style={styles.popupButtonTextStyle}>VIEW INVOICE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, alignItems: 'flex-end' }}
                onPress={() => navigateOnSuccess(false)}
              >
                <Text style={styles.popupButtonTextStyle}>TRACK ORDER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomPopUp>
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          title="PAYMENT"
          leftText={{
            isBack: false,
            title: 'Cancel',
            onPress: () => {
              Alert.alert('Alert', 'Cancel Order?', [
                { text: 'No' },
                { text: 'Yes', onPress: () => props.navigation.goBack() },
              ]);
            },
          }}
        />
        {!isOrderSuccess && renderWebView()}
      </SafeAreaView>
      {renderOrderInfoPopup()}
    </View>
  );
};
