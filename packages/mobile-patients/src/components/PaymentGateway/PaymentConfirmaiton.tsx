import {
  BackHandler,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Clipboard,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import string, { HyperSDKStatus } from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Pending, Success, Copy } from '@aph/mobile-patients/src/components/ui/Icons';
import { Snackbar } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface PaymentConfirmationProps extends NavigationScreenProps {}

export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = (props) => {
  const orderId = props.navigation.getParam('orderId');
  const paymentId = props.navigation.getParam('paymentId');
  const paymentStatus = props.navigation.getParam('paymentStatus');
  const amount = props.navigation.getParam('amount');
  const { success, pending } = HyperSDKStatus;
  const [snackbarState, setSnackbarState] = useState<boolean>(false);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    navigateToHome(props.navigation);
    return true;
  };

  const copyToClipboard = (refId: string) => {
    Clipboard.setString(refId);
    setSnackbarState(true);
  };

  const textComponent = (message: string, color: string, needStyle: boolean) => {
    return (
      <Text
        style={{
          ...theme.viewStyles.text('SB', 13, color, 1, 20),
          marginHorizontal: needStyle ? 0.1 * windowWidth : undefined,
        }}
      >
        {message}
      </Text>
    );
  };

  const statusCardColour = () => {
    return paymentStatus == success ? colors.SUCCESS : colors.PENDING;
  };

  const statusIcon = () => {
    return paymentStatus == success ? (
      <Success style={styles.statusIconStyles} />
    ) : (
      <Pending style={styles.statusIconStyles} />
    );
  };

  const statusText = () => {
    let message = 'PAYMENT PENDING';
    let textColor = theme.colors.PENDING_TEXT;
    paymentStatus == success &&
      ((message = ' PAYMENT SUCCESSFUL'), (textColor = theme.colors.SUCCESS_TEXT));
    return <Text style={theme.viewStyles.text('SB', 16, textColor)}>{message}</Text>;
  };

  const renderStatusCard = () => {
    const refNumberText = String(paymentId != '' && paymentId != null ? paymentId : '--');
    const orderIdText = 'Order ID: ' + String(orderId);
    const priceText = `${string.common.Rs} ` + String(amount);
    return (
      <View style={[styles.statusCardStyle, { backgroundColor: statusCardColour() }]}>
        <View style={styles.subContainer}>{statusIcon()}</View>
        <View style={{ alignItems: 'center', marginTop: 10 }}>{statusText()}</View>
        <View style={styles.priceCont}>
          {textComponent(priceText, theme.colors.SHADE_GREY, false)}
        </View>
        <View>
          <View style={styles.paymentRef}>
            {textComponent('Payment Ref. Number - ', theme.colors.SHADE_GREY, false)}
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={() => copyToClipboard(refNumberText)}
            >
              {textComponent(paymentId, theme.colors.SHADE_GREY, false)}
              <Copy style={styles.iconStyle} />
            </TouchableOpacity>
          </View>
          <Snackbar
            style={{ position: 'absolute', zIndex: 1001, bottom: -10 }}
            visible={snackbarState}
            onDismiss={() => setSnackbarState(false)}
            duration={1000}
          >
            Copied
          </Snackbar>
        </View>
      </View>
    );
  };

  const renderNote = () => {
    let noteText =
      'Note : Your Order is confirmed, please login with mobile number used to place this order to proceed further.';
    return textComponent(noteText, theme.colors.SHADE_GREY, true);
  };

  const renderButton = () => {
    return (
      <View>
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => navigateToHome(props.navigation)}
        >
          <Text style={styles.goHome}>GO TO HOMEPAGE</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Header leftIcon="backArrow" title="PAYMENT STATUS" onPressLeftIcon={() => handleBack()} />
        {renderStatusCard()}
        {renderNote()}
        {renderButton()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
  statusCardStyle: {
    margin: 0.06 * windowWidth,
    padding: 15,
    // flex: 1,
    borderRadius: 10,
    paddingBottom: 15,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  statusIconStyles: {
    width: 25,
    height: 25,
  },
  subContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceCont: {
    alignItems: 'center',
    marginTop: 10,
  },
  paymentRef: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 8,
  },
  iconStyle: {
    marginLeft: 6,
    marginTop: 5,
    width: 9,
    height: 10,
  },
  inputStyle: {
    lineHeight: 18,
    ...theme.fonts.IBMPlexSansMedium(11),
    color: '#6D7278',
    borderBottomWidth: 0,
    justifyContent: 'center',
  },
  buttonStyle: {
    height: 0.06 * windowHeight,
    backgroundColor: '#fcb716',
    marginTop: 0.06 * windowWidth,
    marginHorizontal: 0.2 * windowWidth,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  goHome: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: '#fff',
  },
});
