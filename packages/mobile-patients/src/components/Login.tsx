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
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
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
} from 'react-native';
import firebase, { RNFirebase } from 'react-native-firebase';
import { NavigationEventSubscription, NavigationScreenProps } from 'react-navigation';

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
    opacity: 0.6,
    paddingVertical: 10,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  bottomValidDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_SUCCESS_TEXT,
    opacity: 0.6,
    paddingVertical: 10,
    ...theme.fonts.IBMPlexSansMedium(12),
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
  const [phoneNumber, setPhoneNumber] = useState<string>(props.phoneNumber || '');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const { analytics, sendOtp, isSendingOtp, signOut } = useAuth();
  const [subscriptionId, setSubscriptionId] = useState<EmitterSubscription>();
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);

  useEffect(() => {
    firebase.analytics().setAnalyticsCollectionEnabled(true);
    analytics && analytics.setCurrentScreen(AppRoutes.Login, AppRoutes.Login);
    fireBaseFCM();
    signOut && signOut();
  }, [analytics, signOut]);

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
      console.log(error.message);
    }
    return isNoBlocked;
  };

  const onClickOkay = () => {
    // firebase.analytics().logEvent(AppRoutes.Login, {
    //   Button_Action: 'Login clicked',
    // });
    CommonLogEvent(AppRoutes.Login, 'Login clicked');

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
            sendOtp(phoneNumber)
              .then((confirmResult) => {
                CommonLogEvent(AppRoutes.Login, 'OTP_SENT');
                console.log('confirmResult login', confirmResult);
                props.navigation.navigate(AppRoutes.OTPVerification, {
                  otpString,
                  phoneNumber: phoneNumber,
                });
              })
              .catch((error: RNFirebase.RnError) => {
                console.log(error, 'error');
                console.log(error.message, 'errormessage');

                CommonLogEvent(AppRoutes.Login, error.message);
                CommonBugFender(AppRoutes.Login, error);
                Alert.alert(
                  'Error',
                  (error && error.message) || 'The interaction was cancelled by the user.'
                );
              });
          }
        }
      } else {
        setshowOfflinePopup(true);
      }
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={{ height: 56 }} />
        <Card
          cardContainer={{ marginTop: 0, height: 270 }}
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
              { paddingTop: Platform.OS === 'ios' ? 20 : 15 },
              phoneNumber == '' || phoneNumberIsValid ? styles.inputValidView : styles.inputView,
            ]}
          >
            <Text style={styles.inputTextStyle}>{string.login.numberPrefix}</Text>
            <TextInput
              testID="phoneNumber"
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
        </Card>
      </SafeAreaView>
      {isSendingOtp ? <Spinner /> : null}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
