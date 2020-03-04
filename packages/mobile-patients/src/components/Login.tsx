import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
// import SmsListener from 'react-native-android-sms-listener';
import { timeOutDataType } from '@aph/mobile-patients/src/components/OTPVerification';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { ArrowDisabled, ArrowYellow } from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonBugFender,
  CommonLogEvent,
  CommonSetUserBugsnag,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getNetStatus,
  handleGraphQlError,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  AsyncStorage,
  EmitterSubscription,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
} from 'react-native';
//import { WebView } from 'react-native-webview';
import firebase from 'react-native-firebase';
import { NavigationEventSubscription, NavigationScreenProps } from 'react-navigation';
import { useUIElements } from './UIElementsProvider';
import moment from 'moment';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import HyperLink from 'react-native-hyperlink';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { loginAPI } from '../helpers/loginCalls';
import { WebView } from 'react-native-webview';
import { WebEngageEvents } from '@aph/mobile-patients/src/helpers/webEngageEvents';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
    paddingRight: 6,
    lineHeight: 28,
    paddingTop: Platform.OS === 'ios' ? 0 : 6,
    paddingBottom: Platform.OS === 'ios' ? 5 : 0,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '80%',
    color: theme.colors.INPUT_TEXT,
    paddingBottom: 4,
  },
  inputValidView: {
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 0,
  },
  inputView: {
    borderBottomColor: theme.colors.INPUT_BORDER_FAILURE,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 0,
  },
  bottomDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_FAILURE_TEXT,
    paddingTop: 8,
    paddingBottom: 12,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  bottomValidDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_SUCCESS_TEXT,
    opacity: 0.6,
    paddingTop: 8,
    paddingBottom: 12,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  viewWebStyles: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 20,
  },
});

export interface LoginProps extends NavigationScreenProps {}

const isPhoneNumberValid = (number: string) => {
  const isValidNumber = !/^[6-9]{1}\d{0,9}$/.test(number) ? false : true;
  return isValidNumber;
};

let otpString = '';
let didBlurSubscription: NavigationEventSubscription;

export const Login: React.FC<LoginProps> = (props) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const { signOut } = useAuth();
  const [subscriptionId, setSubscriptionId] = useState<EmitterSubscription>();
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [onClickOpen, setonClickOpen] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const { setLoading } = useUIElements();

  useEffect(() => {
    try {
      fireBaseFCM();
      // if (firebase.auth().currentUser) {
      //   console.log('login auth', firebase.auth().currentUser);
      //   signOut();
      // }
      setLoading && setLoading(false);
      firebase.auth().appVerificationDisabledForTesting = true;
    } catch (error) {
      CommonBugFender('Login_useEffect_try', error);
    }
  }, []);

  const fireBaseFCM = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      // user has permissions
      console.log('enabled', enabled);
    } else {
      // user doesn't have permission
      console.log('not enabled');
      try {
        await firebase.messaging().requestPermission();
        console.log('authorized');

        // User has authorised
      } catch (error) {
        // User has rejected permissions
        CommonBugFender('Login_fireBaseFCM_try', error);
        console.log('not enabled error', error);
      }
    }
  };

  // const requestReadSmsPermission = async () => {
  //   try {
  //     const resuts = await PermissionsAndroid.requestMultiple([
  //       PermissionsAndroid.PERMISSIONS.READ_SMS,
  //       PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
  //     ]);
  //     if (resuts[PermissionsAndroid.PERMISSIONS.READ_SMS] !== PermissionsAndroid.RESULTS.GRANTED) {
  //       console.log(resuts, 'READ_SMS');
  //     }
  //     if (
  //       resuts[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] !== PermissionsAndroid.RESULTS.GRANTED
  //     ) {
  //       console.log(resuts, 'RECEIVE_SMS');
  //     }
  //     if (resuts) {
  //       console.log(resuts, 'RECEIVE_SMS');
  //     }
  //   } catch (error) {
  //     console.log('error', error);
  //   }
  // };

  useEffect(() => {
    console.log('didmout');
    // Platform.OS === 'android' && requestReadSmsPermission();
  }, []);

  // useEffect(() => {
  //   const subscriptionId = SmsListener.addListener((message: ReceivedSmsMessage) => {
  //     const newOtp = message.body.match(/-*[0-9]+/);
  //     otpString = newOtp && newOtp.length > 0 ? newOtp[0] : '';
  //   });
  //   setSubscriptionId(subscriptionId);
  //   didBlurSubscription = props.navigation.addListener('didBlur', () => {
  //     setPhoneNumber('');
  //   });
  // }, [props.navigation, subscriptionId]);

  useEffect(() => {
    return () => {
      subscriptionId && subscriptionId.remove();
      didBlurSubscription && didBlurSubscription.remove();
    };
  }, [subscriptionId]);

  const validateAndSetPhoneNumber = (number: string) => {
    if (/^\d+$/.test(number) || number == '') {
      setPhoneNumber(number);
      setPhoneNumberIsValid(isPhoneNumberValid(number));
    } else {
      return false;
    }
  };

  const _getTimerData = async () => {
    let isNoBlocked = false;
    try {
      const data = await AsyncStorage.getItem('timeOutData');
      if (data) {
        const timeOutData = JSON.parse(data);
        timeOutData.map((obj: timeOutDataType) => {
          if (obj.phoneNumber === `+91${phoneNumber}`) {
            const t1 = new Date();
            const t2 = new Date(obj.startTime);
            const dif = t1.getTime() - t2.getTime();

            const seconds = Math.round(dif / 1000);
            console.log(seconds, 'seconds');
            if (obj.invalidAttems === 3) {
              if (seconds < 900) {
                isNoBlocked = true;
              }
            }
          }
        });
      }
    } catch (error) {
      CommonBugFender('Login_getTimerData_try', error);
      console.log(error.message);
    }
    return isNoBlocked;
  };

  const onClickOkay = () => {
    CommonLogEvent(AppRoutes.Login, 'Login clicked');
    const eventAttributes: WebEngageEvents['Mobile Number Entered'] = { mobilenumber: phoneNumber };
    postWebEngageEvent('Mobile Number Entered', eventAttributes);

    Keyboard.dismiss();
    getNetStatus().then(async (status) => {
      if (status) {
        if (!(phoneNumber.length == 10 && phoneNumberIsValid)) {
          null;
        } else {
          const isBlocked = await _getTimerData();
          if (isBlocked) {
            props.navigation.navigate(AppRoutes.OTPVerification, {
              otpString,
              phoneNumber: phoneNumber,
            });
          } else {
            CommonSetUserBugsnag(phoneNumber);
            AsyncStorage.setItem('phoneNumber', phoneNumber);
            setShowSpinner(true);

            loginAPI('+91' + phoneNumber)
              .then((confirmResult: any) => {
                console.log(confirmResult, 'confirmResult');
                setShowSpinner(false);

                CommonLogEvent(AppRoutes.Login, 'OTP_SENT');

                console.log('confirmResult login', confirmResult);
                try {
                  signOut();
                } catch (error) {}

                props.navigation.navigate(AppRoutes.OTPVerification, {
                  otpString,
                  phoneNumber: phoneNumber,
                  loginId: confirmResult.loginId,
                });
              })
              .catch((error: Error) => {
                console.log(error, 'error');
                setShowSpinner(false);

                CommonLogEvent('OTP_SEND_FAIL', error.message);
                CommonBugFender('OTP_SEND_FAIL', error);
                handleGraphQlError(error);
              });
          }
        }
      } else {
        setshowOfflinePopup(true);
        setShowSpinner(false);
      }
    });
  };

  const openWebView = () => {
    CommonLogEvent(AppRoutes.OTPVerification, 'Terms  Conditions clicked');
    Keyboard.dismiss();
    return (
      <View style={styles.viewWebStyles}>
        <Header
          title={'Terms & Conditions'}
          leftIcon="close"
          container={{
            borderBottomWidth: 0,
          }}
          onPressLeftIcon={() => setonClickOpen(false)}
        />
        <View
          style={{
            flex: 1,
            overflow: 'hidden',
            backgroundColor: 'white',
          }}
        >
          <WebView
            source={{
              uri: 'https://www.apollo247.com/termsandconditions.html',
            }}
            style={{
              flex: 1,
              backgroundColor: 'white',
            }}
            onLoadStart={() => {
              console.log('onLoadStart');
              setShowSpinner(true);
            }}
            onLoadEnd={() => {
              console.log('onLoadEnd');
              setShowSpinner(false);
            }}
            onLoad={() => {
              console.log('onLoad');
              setShowSpinner(false);
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={{ height: 56 }} />
        <Card
          cardContainer={{ marginTop: 0, paddingBottom: 12 }}
          heading={string.login.hello}
          description={string.login.please_enter_no}
          buttonIcon={
            phoneNumberIsValid && phoneNumber.replace(/^0+/, '').length === 10 ? (
              <ArrowYellow />
            ) : (
              <ArrowDisabled />
            )
          }
          onClickButton={onClickOkay}
          disableButton={phoneNumberIsValid && phoneNumber.length === 10 ? false : true}
        >
          <View
            style={[
              { paddingTop: Platform.OS === 'ios' ? 22 : 15 },
              phoneNumber == '' || phoneNumberIsValid ? styles.inputValidView : styles.inputView,
            ]}
          >
            <Text style={styles.inputTextStyle}>{string.login.numberPrefix}</Text>
            <TextInput
              autoFocus
              style={styles.inputStyle}
              keyboardType="numeric"
              maxLength={10}
              value={phoneNumber}
              onChangeText={(value) => validateAndSetPhoneNumber(value)}
            />
          </View>
          <Text
            style={
              phoneNumber == '' || phoneNumberIsValid
                ? styles.bottomValidDescription
                : styles.bottomDescription
            }
          >
            {phoneNumber == '' || phoneNumberIsValid
              ? string.login.otp_sent_to
              : string.login.wrong_number}
          </Text>

          <View
            style={{
              marginRight: 32,
            }}
          >
            <HyperLink
              linkStyle={{
                color: '#02475b',
                ...fonts.IBMPlexSansBold(10),
                lineHeight: 16,
                letterSpacing: 0,
              }}
              linkText={(url) =>
                url === 'https://www.apollo247.com/TnC.html' ? 'Terms and Conditions' : url
              }
              onPress={(url, text) => setonClickOpen(true)}
            >
              <Text
                style={{
                  color: '#02475b',
                  ...fonts.IBMPlexSansMedium(10),
                  lineHeight: 16,
                  letterSpacing: 0,
                }}
              >
                By signing up, I agree to the https://www.apollo247.com/TnC.html of Apollo247
              </Text>
            </HyperLink>
          </View>
        </Card>
        {onClickOpen && openWebView()}
      </SafeAreaView>
      {showSpinner ? <Spinner /> : null}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
