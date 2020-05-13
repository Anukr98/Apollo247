import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState, FC } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Payment } from '@aph/mobile-patients/src/strings/strings.json';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  getParameterByName,
  postWebEngageEvent,
  postAppsFlyerEvent,
  postFirebaseEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
// import { FirebaseEvents, FirebaseEventName } from '../../helpers/firebaseEvents';
// import { AppsFlyerEventName } from '../../helpers/AppsFlyerEvents';
import StatusCard from './components/StatusCard';
import { LocalStrings } from '@aph/mobile-patients/src/strings/LocalStrings';
import DetailsCard from './components/DetailsCard';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface PaymentStatusScreenProps extends NavigationScreenProps {}

const PaymentStatusScreen: FC<PaymentStatusScreenProps> = (props) => {
  const itemDetails = props.navigation.getParam('item');
  const paymentType = props.navigation.getParam('paymentFor');
  console.log('itemDetails', itemDetails);
  // const webEngageEventAttributes = props.navigation.getParam('webEngageEventAttributes');
  // const fireBaseEventAttributes = props.navigation.getParam('fireBaseEventAttributes');

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
    const { status } = itemDetails;
    const { failure, pending, refund } = Payment;
    const { failureNote, pendingNote, refundNote } = LocalStrings;
    switch (status) {
      case failure:
        return textComponent(failureNote, undefined, theme.colors.SHADE_GREY, true);
      case pending:
        return textComponent(pendingNote, undefined, theme.colors.SHADE_GREY, true);
      case refund:
        return textComponent(refundNote, undefined, theme.colors.SHADE_GREY, true);
      default:
        return textComponent('', undefined, theme.colors.SHADE_GREY, true);
    }
  };

  // const getButtonText = () => {
  //   if (status == success) {
  //     return 'START CONSULTATION';
  //   } else if (status == failure) {
  //     return 'TRY AGAIN';
  //   } else {
  //     return 'GO TO HOME';
  //   }
  // };

  // const handleButton = () => {
  //   const { navigation } = props;
  //   const { navigate } = navigation;
  //   if (status == success) {
  //     navigate('APPOINTMENTS');
  //   } else if (status == failure) {
  //     navigate(AppRoutes.DoctorSearch);
  //   } else {
  //     navigate(AppRoutes.ConsultRoom);
  //   }
  // };

  // const renderButton = () => {
  //   return (
  //     <TouchableOpacity
  //       style={styles.buttonStyle}
  //       onPress={() => {
  //         handleButton();
  //       }}
  //     >
  //       <Text style={{ ...theme.viewStyles.text('SB', 13, '#ffffff', 1, 24) }}>
  //         {getButtonText()}
  //       </Text>
  //     </TouchableOpacity>
  //   );
  // };
  const { actualAmount, status, displayId, appointmentPayments } = itemDetails;
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <Header leftIcon="backArrow" title="PAYMENT STATUS" onPressLeftIcon={() => handleBack()} />

      <ScrollView style={styles.container}>
        <StatusCard refNo="1234" displayId={displayId} price={actualAmount} status={status} />
        {appointmentHeader()}
        <DetailsCard item={itemDetails} paymentFor={paymentType} />
        {renderNote()}
        {/*{renderButton()} */}
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
