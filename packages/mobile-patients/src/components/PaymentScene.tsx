import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, WebView, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '../theme/theme';
import { BottomPopUp } from './ui/BottomPopUp';
import { useShoppingCart } from './ShoppingCartProvider';
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
  const orderId = props.navigation.getParam('orderId');
  const authToken = props.navigation.getParam('token');

  const renderWebView = () => {
    const baseUrl = 'http://localhost:7000';
    const url = `${baseUrl}/paymed?amount=${totalAmount}&orderId=${orderId}&orderAutoId=${orderAutoId}&token=${authToken}`;
    console.log({ totalAmount, orderAutoId, authToken });

    return (
      <WebView
        useWebKit={true}
        source={{ uri: url }}
        onNavigationStateChange={(data) => {
          console.log({ data });
          const redirectedUrl = data.url;
          console.log({ redirectedUrl });
          if (redirectedUrl == 'http://localhost:7000/paymed-response') {
            setOrderSuccess(true);
            clearCartInfo && clearCartInfo();
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
