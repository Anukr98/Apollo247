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
import { Header } from './ui/Header';
import { CheckedIcon, MedicineIcon, UnCheck } from './ui/Icons';
import { AppConfig } from '../strings/AppConfig';
import { GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus } from '../graphql/types/GetMedicineOrdersList';
import { MEDICINE_ORDER_STATUS } from '../graphql/types/globalTypes';

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
                <Text style={styles.popupButtonTextStyle}>VIEW ORDER SUMMARY</Text>
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
