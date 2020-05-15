/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import { StyleSheet, Text, View, ScrollView, StatusBar, Dimensions } from 'react-native';
import React, { FC } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import StatusCard from './components/StatusCard';
import { LocalStrings } from '@aph/mobile-patients/src/strings/LocalStrings';
import DetailsCard from './components/DetailsCard';
import FooterButton from './components/FooterButton';
import PaymentConstants from '../constants';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface PaymentStatusScreenProps extends NavigationScreenProps {}

const PaymentStatusScreen: FC<PaymentStatusScreenProps> = (props) => {
  const itemDetails = props.navigation.getParam('item');
  const paymentType = props.navigation.getParam('paymentFor');
  const paymentStatus = props.navigation.getParam('status');
  const { SUCCESS, FAILED, REFUND } = PaymentConstants;

  const handleBack = () => {
    props.navigation.goBack();
    return true;
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

  const appointmentHeader = () => {
    let headerText = 'BOOKING DETAILS';
    if (paymentType === 'pharmacy') {
      headerText = 'ORDER DETAILS';
    }
    return (
      <View style={styles.appointmentHeaderStyle}>
        {textComponent(headerText, undefined, theme.colors.ASTRONAUT_BLUE, false)}
      </View>
    );
  };

  const renderNote = () => {
    const { failureNote, pendingNote, refundNote } = LocalStrings;
    switch (paymentStatus) {
      case FAILED:
        return textComponent(failureNote, undefined, theme.colors.SHADE_GREY, true);
      case REFUND:
        return textComponent(refundNote, undefined, theme.colors.SHADE_GREY, true);
      case SUCCESS:
        return null;
      default:
        return textComponent(pendingNote, undefined, theme.colors.SHADE_GREY, true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <Header leftIcon="backArrow" title="PAYMENT STATUS" onPressLeftIcon={() => handleBack()} />

      <ScrollView style={styles.container}>
        <StatusCard item={itemDetails} paymentFor={paymentType} />
        {appointmentHeader()}
        <DetailsCard item={itemDetails} paymentFor={paymentType} />
        {renderNote()}
        <FooterButton
          item={itemDetails}
          paymentFor={paymentType}
          navigationProps={props.navigation}
        />
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
    height: 0.27 * windowHeight,
    margin: 0.06 * windowWidth,
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  statusCardSubContainerStyle: {
    flex: 0.22,
    marginVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentCardStyle: {
    height: 0.23 * windowHeight,
    marginVertical: 0.03 * windowWidth,
    paddingLeft: 0.06 * windowWidth,
    marginHorizontal: 0.06 * windowWidth,
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
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
export default PaymentStatusScreen;
