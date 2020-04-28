import {
  Alert,
  BackHandler,
  NavState,
  StyleSheet,
  View,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { WebView } from 'react-native-webview';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';

export interface ConsultPaymentnewProps extends NavigationScreenProps {}

export const ConsultPaymentnew: React.FC<ConsultPaymentnewProps> = (props) => {
  const price = props.navigation.getParam('price');
  const appointmentId = props.navigation.getParam('appointmentId');
  const doctorName = props.navigation.getParam('doctorName');
  const paymentTypeID = props.navigation.getParam('paymentTypeID');
  const appointmentInput = props.navigation.getParam('appointmentInput');
  const bankCode = props.navigation.getParam('bankCode')
    ? props.navigation.getParam('bankCode')
    : null;
  const webEngageEventAttributes = props.navigation.getParam('webEngageEventAttributes');
  const { currentPatient } = useAllCurrentPatients();
  const currentPatiendId = currentPatient && currentPatient.id;
  const mobileNumber = currentPatient && currentPatient.mobileNumber;
  const [loading, setLoading] = useState(true);
  const displayID = props.navigation.getParam('displayID');

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const navigatetoStatusscreen = (status: string) => {
    props.navigation.navigate(AppRoutes.ConsultPaymentStatus, {
      orderId: appointmentId,
      price: price,
      doctorName: doctorName,
      appointmentDateTime: appointmentInput.appointmentDateTime,
      appointmentType: appointmentInput.appointmentType,
      displayID:displayID,
      status: status,
    });
  };

  const onWebViewStateChange = (data: NavState) => {
    const redirectedUrl = data.url;
    console.log({ data, redirectedUrl });
    console.log(`RedirectedUrl: ${redirectedUrl}`);

    if (redirectedUrl) {
      if (redirectedUrl.indexOf(AppConfig.Configuration.CONSULT_PG_SUCCESS_PATH) > -1) {
        navigatetoStatusscreen('SUCCESS');
      } else if (redirectedUrl.indexOf(AppConfig.Configuration.CONSULT_PG_ERROR_PATH) > -1) {
        navigatetoStatusscreen('FAILURE');
      } else if (redirectedUrl.indexOf(AppConfig.Configuration.CONSULT_PG_PENDING_PATH) > -1) {
        navigatetoStatusscreen('PENDING');
      }
    }
  };

  const renderwebView = () => {
    console.log(JSON.stringify(paymentTypeID));
    const baseUrl = AppConfig.Configuration.CONSULT_PG_BASE_URL;
    const url = `${baseUrl}/make-payment`;

    return (
      <WebView
        onLoadStart={() => setLoading!(true)}
        onLoadEnd={() => setLoading!(false)}
        bounces={false}
        source={{
          uri: url,
          method: 'POST',
          body:
            'orderID=' +
            [appointmentId] +
            '&patientID=' +
            [currentPatiendId] +
            '&amount=' +
            [price] +
            '&paymentTypeID=' +
            [paymentTypeID] +
            '&paymentModeOnly=YES' +
            '&mobileNumber=' +
            [mobileNumber] +
            // '&returnURL=' +
            // 'https://aph.dev.pmt.popcornapps.com/consulttransaction' +
            ([bankCode] ? '&bankCode=' + [bankCode] : ''),
        }}
        onNavigationStateChange={(data) => onWebViewStateChange(data)}
      />
    );
  };

  const handleBack = () => {
    Alert.alert('Alert', 'Are you sure you want to cancel the transaction?', [
      { text: 'No' },
      {
        text: 'Yes',
        onPress: () => {
          BackHandler.removeEventListener('hardwareBackPress', handleBack);
          props.navigation.navigate(AppRoutes.ConsultPaymentStatus, {
            orderId: appointmentId,
            price: price,
            doctorName: doctorName,
            appointmentDateTime: appointmentInput.appointmentDateTime,
            appointmentType: appointmentInput.appointmentType,
            status: 'PENDING',
          });
        },
      },
    ]);
    return true;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <Header leftIcon="backArrow" title="PAYMENT" onPressLeftIcon={() => handleBack()} />

      <View style={styles.container}>{renderwebView()}</View>
      {loading && <Spinner />}
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
    color: '#01475b',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0.1,
  },
});
