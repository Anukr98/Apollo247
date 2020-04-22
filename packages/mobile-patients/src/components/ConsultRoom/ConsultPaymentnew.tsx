import {
  Alert,
  BackHandler,
  NavState,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { WebView } from 'react-native-webview';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

// var uuid = require('react-native-uuid');

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

  useEffect(() => {
    // BackHandler.addEventListener('hardwareBackPress', () => {handleBack()});
    // return () => {
    //   BackHandler.removeEventListener('hardwareBackPress', () => {
    //     console.log('navigating to previous screen');
    //   });
    // };
  }, []);

  const onWebViewStateChange = (data: NavState) => {
    const redirectedUrl = data.url;
    console.log({ data, redirectedUrl });
    console.log(`RedirectedUrl: ${redirectedUrl}`);

    const isMatchesSuccessUrl =
      (redirectedUrl &&
        redirectedUrl.indexOf(AppConfig.Configuration.CONSULT_PG_SUCCESS_PATH) > -1) ||
      false;
    const isMatchesFailUrl =
      (redirectedUrl &&
        redirectedUrl.indexOf(AppConfig.Configuration.CONSULT_PG_ERROR_PATH) > -1) ||
      false;

    if (isMatchesSuccessUrl) {
      // BOOKING SUCCESSFULL
      props.navigation.navigate(AppRoutes.ConsultPaymentStatus, {
        orderId: appointmentId,
        price: price,
        doctorName: doctorName,
        appointmentDateTime: appointmentInput.appointmentDateTime,
        appointmentType: appointmentInput.appointmentType,
        status: 'success',
      });
    }
    if (isMatchesFailUrl) {
      // BOOKING FAILED
      props.navigation.navigate(AppRoutes.ConsultPaymentStatus, {
        orderId: appointmentId,
        price: price,
        doctorName: doctorName,
        appointmentDateTime: appointmentInput.appointmentDateTime,
        appointmentType: appointmentInput.appointmentType,
        status: 'failure',
      });
    }
  };

  const renderwebView = () => {
    console.log(JSON.stringify(paymentTypeID));
    const baseUrl = 'https://1d762210.ngrok.io';
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
            ([bankCode] ? '&bankCode=' + [bankCode] : ''),
        }}
        onNavigationStateChange={(data) => onWebViewStateChange(data)}
      />
    );
  };

  const renderLoading = () => {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#01475b" />
      </View>
    );
  };

  const handleBack = () => {
    Alert.alert('Alert', 'Are you sure you want to cancel the transaction?', [
      { text: 'No' },
      { text: 'Yes', onPress: () => props.navigation.goBack() },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <View
        style={{
          backgroundColor: '#FFF',
          flex: 0.1,
          justifyContent: 'center',
          alignItems: 'center',
          shadowOpacity: 5,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', left: 15 }}
          onPress={() => {
            handleBack();
          }}
        >
          <Image source={require('../ui/icons/back.png')} style={{ width: 35, height: 35 }} />
        </TouchableOpacity>
        <Text style={styles.Payment}> PAYMENT </Text>
      </View>
      <View style={{ flex: 0.9, backgroundColor: '#eee' }}>{renderwebView()}</View>
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
