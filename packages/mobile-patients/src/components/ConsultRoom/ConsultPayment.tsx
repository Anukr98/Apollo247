import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  NavState,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  getParameterByName,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { WebView } from 'react-native-webview';
import { WebEngageEvents } from '@aph/mobile-patients/src/helpers/webEngageEvents';

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

export interface ConsultPaymentProps extends NavigationScreenProps {
  doctorName: string;
  appointmentId: string;
  price: number;
  webEngageEventAttributes: WebEngageEvents['Consult- Consultation booked'];
}
{
}

export const ConsultPayment: React.FC<ConsultPaymentProps> = (props) => {
  const price = props.navigation.getParam('price');
  const appointmentId = props.navigation.getParam('appointmentId');
  const doctorName = props.navigation.getParam('doctorName');
  const webEngageEventAttributes = props.navigation.getParam('webEngageEventAttributes');
  const { currentPatient } = useAllCurrentPatients();
  const currentPatiendId = currentPatient && currentPatient.id;
  const [loading, setLoading] = useState(true);
  // const name = currentPatient && currentPatient.firstName;
  const { showAphAlert, hideAphAlert } = useUIElements();

  // useEffect(() => {
  //   const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
  //     BackHandler.addEventListener('hardwareBackPress', handleBack);
  //   });

  //   const _willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
  //     BackHandler.removeEventListener('hardwareBackPress', handleBack);
  //   });

  //   return () => {
  //     _didFocusSubscription && _didFocusSubscription.remove();
  //     _willBlurSubscription && _willBlurSubscription.remove();
  //   };
  // }, []);

  const handleBack = async () => {
    // BackHandler.removeEventListener('hardwareBackPress', handleBack);
    Alert.alert('Alert', 'Do you want to go back?', [
      { text: 'No' },
      { text: 'Yes', onPress: () => props.navigation.goBack() },
    ]);
  };

  const handleOrderSuccess = async () => {
    // BackHandler.removeEventListener('hardwareBackPress', handleBack);
    postWebEngageEvent('Consult- Consultation booked', webEngageEventAttributes);
    setLoading!(false);
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
      })
    );
    showAphAlert!({
      unDismissable: true,
      title: 'Appointment Confirmation',
      description: `Your appointment has been successfully booked with Dr. ${doctorName}. Please go to consult room 10-15 minutes prior to your appointment. Answering a few medical questions in advance will make your appointment process quick and smooth :)`,
      children: (
        <View style={{ height: 60, alignItems: 'flex-end' }}>
          <TouchableOpacity
            activeOpacity={1}
            style={{
              height: 60,
              paddingRight: 25,
              backgroundColor: 'transparent',
              justifyContent: 'center',
            }}
            onPress={() => {
              hideAphAlert!();
              props.navigation.navigate(AppRoutes.TabBar);
              CommonLogEvent(
                AppRoutes.ConsultPayment,
                'Navigate to consult room after bokking payment sucess.'
              );
            }}
          >
            <Text style={theme.viewStyles.yellowTextStyle}>GO TO CONSULT ROOM</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  };

  const handleOrderFailure = () => {
    props.navigation.goBack();
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `We're sorry but the payment failed.`,
      unDismissable: true,
    });
  };

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
      const tk = getParameterByName('tk', redirectedUrl!);
      const status = getParameterByName('status', redirectedUrl!);
      console.log({ tk, status });
      handleOrderSuccess();
    }
    if (isMatchesFailUrl) {
      // BOOKING FAILED
      handleOrderFailure();
    }
  };

  const renderWebView = () => {
    const baseUrl = AppConfig.Configuration.CONSULT_PG_BASE_URL;
    const url = `${baseUrl}/consultpayment?appointmentId=${appointmentId}&patientId=${currentPatiendId}&price=${price}`;
    console.log(`%cCONSULT_PG_URL:\t${url}`, 'color: #bada55');
    // PATH: /consultpayment?appointmentId=&patientId=&price=
    // comment below line
    // return null;

    return (
      <WebView
        onLoadStart={() => setLoading!(true)}
        onLoadEnd={() => setLoading!(false)}
        bounces={false}
        useWebKit={true}
        source={{ uri: url }}
        onNavigationStateChange={onWebViewStateChange}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          title="PAYMENT"
          leftText={{
            isBack: false,
            title: 'Cancel',
            onPress: handleBack,
          }}
        />
        <View style={{ flex: 1, overflow: 'hidden' }}>{renderWebView()}</View>
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
