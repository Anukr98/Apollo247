import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Refund } from '@aph/mobile-patients/src/components/ui/Icons';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getDate } from '@aph/mobile-patients/src/utils/dateUtil';
import React, { useEffect } from 'react';
import {
  BackHandler,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { PaymentModes } from '@aph/mobile-patients/src/strings/strings.json';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { navigateToHome } from '@aph/mobile-patients/src/helpers/helperFunctions';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface RefundStatusProps extends NavigationScreenProps {}

export const RefundStatus: React.FC<RefundStatusProps> = (props) => {
  const orderAutoId = props.navigation.getParam('orderAutoId');
  const refundAmount = props.navigation.getParam('refundAmount');
  const refundId = props.navigation.getParam('refundId');
  const initiationDate = props.navigation.getParam('initiationDate');
  const paymentMode = props.navigation.getParam('paymentMode');

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const handleBack = () => {
    props.navigation.goBack();
    return true;
  };

  const statusIcon = () => {
    return <Refund style={styles.statusIconStyles} />;
  };

  const textComponent = (
    message: string,
    numOfLines: number | undefined,
    color: string,
    needStyle: boolean
  ) => {
    return (
      <Text
        style={{
          ...theme.viewStyles.text('SB', 13, color, 1, 20),
          marginHorizontal: needStyle ? 0.1 * windowWidth : undefined,
        }}
        numberOfLines={numOfLines}
      >
        {message}
      </Text>
    );
  };

  const statusCardColour = () => {
    return colors.REFUND;
  };

  const statusText = () => {
    let message = 'REFUND PROCESSED';
    let textColor = theme.colors.REFUND_TEXT;
    return textComponent(message, undefined, textColor, false);
  };

  const renderStatusCard = () => {
    const refNumberText = String(refundId != '' && refundId != null ? refundId : '--');
    const orderIdText = 'Order ID: ' + String(orderAutoId);
    const priceText = `${string.common.Rs} ` + String(refundAmount);
    return (
      <View style={[styles.statusCardStyle, { backgroundColor: statusCardColour() }]}>
        <View style={styles.statusCardSubContainerStyle}>{statusIcon()}</View>
        <View
          style={{
            flex: 0.15,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {statusText()}
        </View>
        <View
          style={{
            flex: 0.12,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {textComponent(priceText, undefined, theme.colors.SHADE_GREY, false)}
        </View>
        <View
          style={{
            flex: 0.12,
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          {textComponent(orderIdText, undefined, theme.colors.SHADE_GREY, false)}
        </View>
        <View style={{ flex: 0.39, justifyContent: 'flex-start', alignItems: 'center' }}>
          <View style={{ flex: 0.6, justifyContent: 'flex-start', alignItems: 'center' }}>
            {textComponent('Refund Ref. Number - ', undefined, theme.colors.SHADE_GREY, false)}

            {textComponent(refNumberText, undefined, theme.colors.SHADE_GREY, false)}
          </View>
          <View style={{ flex: 0.4, justifyContent: 'flex-start', alignItems: 'center' }}></View>
        </View>
      </View>
    );
  };

  const appointmentHeader = () => {
    return (
      <View style={styles.appointmentHeaderStyle}>
        {textComponent('ORDER DETAILS', undefined, theme.colors.ASTRONAUT_BLUE, false)}
      </View>
    );
  };

  const DetailsCard = () => {
    const date = String(
      initiationDate != '' && initiationDate != null ? getDate(String(initiationDate)) : '--'
    );
    const paymenttype = String(
      paymentMode != '' && paymentMode != null ? PaymentModes[paymentMode] : ''
    );
    return (
      <View style={styles.orderCardStyle}>
        <View style={{ flex: 0.6, paddingTop: 0.05 * windowWidth }}>
          <View style={{ flex: 0.4, justifyContent: 'center' }}>
            {textComponent('Date of Refund', undefined, theme.colors.ASTRONAUT_BLUE, false)}
          </View>
          <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
            {textComponent(date, undefined, theme.colors.SHADE_CYAN_BLUE, false)}
          </View>
        </View>
        <View style={{ flex: 0.4, paddingTop: 0.05 * windowWidth }}>
          <View style={{ flex: 0.4, justifyContent: 'center' }}>
            {textComponent('Mode of Payment', undefined, theme.colors.ASTRONAUT_BLUE, false)}
          </View>
          <View style={{ flex: 0.6, justifyContent: 'flex-start' }}>
            {textComponent(paymenttype, undefined, theme.colors.SHADE_CYAN_BLUE, false)}
          </View>
        </View>
      </View>
    );
  };

  const renderNote = () => {
    let noteText = 'Note : The amount should be credited in your account in 10-14 business days';

    return textComponent(noteText, undefined, theme.colors.SHADE_GREY, true);
  };

  const getButtonText = () => {
    return 'GO TO HOME';
  };

  const handleButton = () => {
    const { navigation } = props;
    const { navigate } = navigation;

    navigateToHome(props.navigation);
  };

  const renderButton = () => {
    return (
      <TouchableOpacity
        style={styles.buttonStyle}
        onPress={() => {
          handleButton();
        }}
      >
        <Text style={{ ...theme.viewStyles.text('SB', 13, '#ffffff', 1, 24) }}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <Header leftIcon="backArrow" title="PAYMENT STATUS" onPressLeftIcon={() => handleBack()} />

      <ScrollView style={styles.container}>
        {renderStatusCard()}
        {appointmentHeader()}
        {DetailsCard()}
        {renderNote()}
        {renderButton()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f1ec',
  },
  Payment: {
    fontSize: 14,
    color: theme.colors.ASTRONAUT_BLUE,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.1,
  },
  statusIconStyles: {
    width: 45,
    height: 45,
  },
  statusCardStyle: {
    height: 0.32 * windowHeight,
    margin: 0.06 * windowWidth,
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  orderCardStyle: {
    height: 0.15 * windowHeight,
    marginVertical: 0.03 * windowWidth,
    paddingLeft: 0.06 * windowWidth,
    marginHorizontal: 0.06 * windowWidth,
    flexDirection: 'row',
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  statusCardSubContainerStyle: {
    flex: 0.22,
    marginVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentHeaderStyle: {
    backgroundColor: '#eee',
    height: 0.04 * windowHeight,
    justifyContent: 'center',
    marginHorizontal: 0.06 * windowWidth,
    borderBottomWidth: 0.8,
    borderBottomColor: '#ddd',
  },
  buttonStyle: {
    height: 0.06 * windowHeight,
    backgroundColor: '#fcb716',
    marginVertical: 0.06 * windowWidth,
    marginHorizontal: 0.2 * windowWidth,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
});
