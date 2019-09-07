import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  WebView,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useAllCurrentPatients } from '../hooks/authHooks';
import { theme } from '../theme/theme';
import { AppRoutes } from './NavigatorContainer';
import { useShoppingCart } from './ShoppingCartProvider';
import { BottomPopUp } from './ui/BottomPopUp';
import { MedicineIcon } from './ui/Icons';

const styles = StyleSheet.create({
  popupButtonStyle: {
    marginTop: 16,
    marginBottom: 20,
    marginHorizontal: 25,
  },
  popupButtonTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.APP_YELLOW,
    lineHeight: 24,
    textAlign: 'right',
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
  // const orderAutoId = Math.random();
  const orderId = props.navigation.getParam('orderId');
  const authToken = props.navigation.getParam('token');
  const { currentPatient } = useAllCurrentPatients();
  const currentPatiendId = currentPatient && currentPatient.id;

  const getParameterByName = (name: string, url: string) => {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };

  const renderWebView = () => {
    const baseUrl = 'http://localhost:7000';

    // /paymed?amount=${totalAmount}&oid=${orderAutoId}&token=${authToken}&pid=${currentPatiendId}&source=mobile
    // /mob?tk=<>&status=<>

    const url = `${baseUrl}/paymed?amount=${totalAmount}&oid=${orderAutoId}&token=${authToken}&pid=${currentPatiendId}&source=mobile`;
    console.log({ totalAmount, orderAutoId, authToken, url });
    console.log({ url });
    console.log(url);

    return (
      <WebView
        useWebKit={true}
        source={{ uri: url }}
        onNavigationStateChange={(data) => {
          console.log({ data });
          const redirectedUrl = data.url;
          console.log({ redirectedUrl });
          const isMatchesSuccessUrl =
            (redirectedUrl && redirectedUrl.indexOf('/mob?') > -1) || false;
          const isMatchesFailUrl =
            (redirectedUrl && redirectedUrl.indexOf('/mob-error?') > -1) || false;

          if (isMatchesSuccessUrl) {
            const tk = getParameterByName('tk', redirectedUrl!);
            const status = getParameterByName('status', redirectedUrl!);
            console.log({ tk, status });
            setOrderSuccess(true);
            clearCartInfo && clearCartInfo();
            props.navigation.navigate(AppRoutes.TabBar);
          }
          if (isMatchesFailUrl) {
            Alert.alert('Error', 'Payment failed');
          }
        }}
      />
    );
  };

  const renderOrderInfoPopup = () => {
    if (isOrderSuccess) {
      return (
        <BottomPopUp
          title={'Order Successfull'}
          description={'Your order has been placed successfully.'}
        >
          <View style={{ margin: 20, marginTop: 16, padding: 16, backgroundColor: '#f7f8f5' }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15.5,
              }}
            >
              <MedicineIcon />
              <Text
                style={{ ...theme.fonts.IBMPlexSansMedium(17), lineHeight: 24, color: '#01475b' }}
              >
                Medicines
              </Text>
              <Text
                style={{ ...theme.fonts.IBMPlexSansMedium(14), lineHeight: 24, color: '#01475b' }}
              >
                {`#${orderAutoId}`}
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#02475b', opacity: 0.3 }} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginVertical: 7.5,
              }}
            >
              <Text
                style={{ ...theme.fonts.IBMPlexSansMedium(14), lineHeight: 24, color: '#01475b' }}
              >
                Remind me to take medicines
              </Text>
            </View>
            <View style={{ height: 1, backgroundColor: '#02475b', opacity: 0.3 }} />
            <TouchableOpacity
              style={styles.popupButtonStyle}
              onPress={() => props.navigation.pop(4)}
            >
              <Text style={styles.popupButtonTextStyle}>OK, GOT IT</Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      );
    }
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {renderOrderInfoPopup()}
      {renderWebView()}
    </SafeAreaView>
  );
};
