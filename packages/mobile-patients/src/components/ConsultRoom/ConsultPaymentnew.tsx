import {
  Alert,
  BackHandler,
  NavState,
  Platform,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { WebView } from 'react-native-webview';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import AsyncStorage from '@react-native-community/async-storage';
import { ONE_APOLLO_STORE_CODE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  calculateCircleDoctorPricing,
  isPhysicalConsultation,
} from '@aph/mobile-patients/src/utils/commonUtils';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { getAsyncStorageValues } from '../../helpers/helperFunctions';

export interface ConsultPaymentnewProps extends NavigationScreenProps {}

export const ConsultPaymentnew: React.FC<ConsultPaymentnewProps> = (props) => {
  const consultedWithDoctorBefore = props.navigation.getParam('consultedWithDoctorBefore');
  const price = props.navigation.getParam('price');
  const appointmentId = props.navigation.getParam('appointmentId');
  const doctorName = props.navigation.getParam('doctorName');
  const doctorID = props.navigation.getParam('doctorID');
  const doctor = props.navigation.getParam('doctor');
  const paymentTypeID = props.navigation.getParam('paymentTypeID');
  const appointmentInput = props.navigation.getParam('appointmentInput');
  const bankCode = props.navigation.getParam('bankCode')
    ? props.navigation.getParam('bankCode')
    : null;
  const isDoctorsOfTheHourStatus = props.navigation.getParam('isDoctorsOfTheHourStatus');
  const selectedTab = props.navigation.getParam('selectedTab');
  const webEngageEventAttributes = props.navigation.getParam('webEngageEventAttributes');
  const cleverTapConsultBookedEventAttributes = props.navigation.getParam(
    'cleverTapConsultBookedEventAttributes'
  );
  const appsflyerEventAttributes = props.navigation.getParam('appsflyerEventAttributes');
  const fireBaseEventAttributes = props.navigation.getParam('fireBaseEventAttributes');
  const planSelected = props.navigation.getParam('planSelected');
  const { currentPatient } = useAllCurrentPatients();
  const currentPatiendId = currentPatient && currentPatient.id;
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>('')
  const [userMobileNumber, setUserMobileNumber] = useState<string | null>('')

  const displayID = props.navigation.getParam('displayID');
  let WebViewRef: any;
  const planId = AppConfig.Configuration.CIRCLE_PLAN_ID;
  const storeCode =
    Platform.OS === 'ios' ? ONE_APOLLO_STORE_CODE.IOSCUS : ONE_APOLLO_STORE_CODE.ANDCUS;
  const isOnlineConsult =
    selectedTab === string.consultModeTab.VIDEO_CONSULT ||
    selectedTab === string.consultModeTab.CONSULT_ONLINE;

  const isPhysicalConsult = isPhysicalConsultation(selectedTab);

  const circleDoctorDetails = calculateCircleDoctorPricing(
    doctor,
    isOnlineConsult,
    isPhysicalConsult
  );
  const { isCircleDoctorOnSelectedConsultMode } = circleDoctorDetails;
  const { circleSubscriptionId } = useShoppingCart();

  useEffect(() => {
    const saveSessionValues = async () => {
      const [loginToken, phoneNumber] = await getAsyncStorageValues()
      setToken(loginToken)
      setUserMobileNumber(phoneNumber)
    }
    saveSessionValues()
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const storeAppointmentId = async () => {
    try {
      const ids = await AsyncStorage.getItem('APPOINTMENTS_CONSULTED_WITH_DOCTOR_BEFORE');
      const appointmentIds: string[] = ids ? JSON.parse(ids || '[]') : [];
      AsyncStorage.setItem(
        'APPOINTMENTS_CONSULTED_WITH_DOCTOR_BEFORE',
        JSON.stringify([...appointmentIds, appointmentId])
      );
    } catch (error) {}
  };

  const navigatetoStatusscreen = (status: string) => {
    if (consultedWithDoctorBefore) {
      storeAppointmentId();
    }
    props.navigation.navigate(AppRoutes.ConsultPaymentStatus, {
      orderId: appointmentId,
      price: price,
      doctorName: doctorName,
      doctorID: doctorID,
      doctor: doctor,
      appointmentDateTime: appointmentInput.appointmentDateTime,
      appointmentType: appointmentInput.appointmentType,
      coupon: appointmentInput.couponCode,
      displayID: displayID,
      status: status,
      webEngageEventAttributes: webEngageEventAttributes,
      cleverTapConsultBookedEventAttributes: cleverTapConsultBookedEventAttributes,
      fireBaseEventAttributes: fireBaseEventAttributes,
      appsflyerEventAttributes: appsflyerEventAttributes,
      paymentTypeID: paymentTypeID,
      isDoctorsOfTheHourStatus,
      isCircleDoctor: isCircleDoctorOnSelectedConsultMode,
    });
  };

  const onWebViewStateChange = (data: NavState) => {
    const redirectedUrl = data.url;

    if (
      redirectedUrl &&
      (redirectedUrl.indexOf(AppConfig.Configuration.CONSULT_PG_SUCCESS_PATH) > -1 ||
        redirectedUrl.indexOf(AppConfig.Configuration.CONSULT_PG_ERROR_PATH) > -1)
    ) {
      navigatetoStatusscreen('PAYMENT_PENDING_PG');
    }
  };

  const renderwebView = () => {
    const baseUrl = AppConfig.Configuration.CONSULT_PG_BASE_URL;
    let url = `${baseUrl}/consultpayment?appointmentId=${appointmentId}&patientId=${currentPatiendId}&price=${price}&paymentTypeID=${paymentTypeID}&paymentModeOnly=YES${
      bankCode ? '&bankCode=' + bankCode : ''
    }&utm_token=${token}&utm_mobile_number=${userMobileNumber}`;
    if (planSelected && isCircleDoctorOnSelectedConsultMode && circleSubscriptionId == '') {
      url = `${url}&planId=${planId}&subPlanId=${planSelected?.subPlanId}&storeCode=${storeCode}`;
    }
    return (
      <WebView
        ref={(WEBVIEW_REF) => (WebViewRef = WEBVIEW_REF)}
        onLoadStart={() => setLoading!(true)}
        onLoadEnd={() => setLoading!(false)}
        bounces={false}
        source={{
          uri: url,
        }}
        onNavigationStateChange={(data) => onWebViewStateChange(data)}
      />
    );
  };

  const handleBack = () => {
    Alert.alert('Alert', 'Are you sure you want to choose a different payment mode?', [
      { text: 'No' },
      {
        text: 'Yes',
        onPress: () => {
          WebViewRef && WebViewRef.stopLoading();
          props.navigation.goBack();
        },
      },
    ]);
    return true;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#01475b" />
      <SafeAreaView style={styles.container}>
        <Header leftIcon="backArrow" title="PAYMENT" onPressLeftIcon={() => handleBack()} />
        {Platform.OS == 'android' ? (
          <KeyboardAvoidingView style={styles.container} behavior={'height'}>
            {renderwebView()}
          </KeyboardAvoidingView>
        ) : (
          renderwebView()
        )}
      </SafeAreaView>
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
