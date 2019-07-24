import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Card } from '@aph/mobile-doctors/src/components/ui/Card';
import { ArrowDisabled, ArrowYellow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { setOnboardingDone } from '@aph/mobile-doctors/src/helpers/localStorage';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AsyncStorage,
  Keyboard,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import firebase from 'react-native-firebase';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProps } from 'react-navigation';
import { useAuth } from '../hooks/authHooks';
import { isMobileNumberValid } from '@aph/universal/src/aphValidators';

const styles = StyleSheet.create({
  container: {
    //...theme.viewStyles.container,
    flex: 1,
    width: '100%',
    height: 600,
    backgroundColor: '#f0f4f5',
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
    paddingRight: 6,
    lineHeight: 28,
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
    color: '#890000', //theme.colors.INPUT_FAILURE_TEXT,
    // opacity: 0.6,
    paddingVertical: 10,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  gethelpText: {
    marginTop: 22,
    color: '#fc9916',
    ...theme.fonts.IBMPlexSansSemiBold(12),
  },
  bottomValidDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_SUCCESS_TEXT,
    opacity: 0.6,
    paddingVertical: 10,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  statusBarBg: {
    width: '100%',
    opacity: 0.05,
    backgroundColor: '#000000',
    ...ifIphoneX(
      {
        height: 44,
      },
      {
        height: 24,
      }
    ),
  },
});

export interface LoginProps extends NavigationScreenProps {}

const isPhoneNumberValid = (number: string) => {
  const isValidNumber =
    // (number.replace(/^0+/, '').length !== 10 && number.length !== 0) ||
    !/^[6-9]{1}\d{0,9}$/.test(number) ? false : true;
  return isValidNumber;
};

let otpString = '';
let backHandler: any;
let didBlurSubscription: any;

export const Login: React.FC<LoginProps> = (props) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const [verifyingPhoneNumber, setVerifyingPhonenNumber] = useState(false);
  const { analytics, currentUser } = useAuth();
  const [subscriptionId, setSubscriptionId] = useState<any>();

  useEffect(() => {
    setOnboardingDone(true);
  }, []);

  useEffect(() => {
    analytics.setCurrentScreen(AppRoutes.Login);
  }, [analytics, currentUser]);

  useEffect(() => {
    Platform.OS === 'android' && requestReadSmsPermission();
  }, []);

  // useEffect(() => {
  //   console.log('authError Login', authError);
  //   if (authError) {
  //     clearCurrentUser();
  //     setVerifyingPhonenNumber(false);
  //     //Alert.alert('Error', 'Unable to connect the server at the moment.');
  //   }
  // }, [authError, clearCurrentUser]);

  const requestReadSmsPermission = () => {
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    ])
      .then((results) => {
        console.log('granted READ_SMS?', results['android.permission.READ_SMS'] == 'granted');
        console.log('granted RECEIVE_SMS?', results['android.permission.RECEIVE_SMS'] == 'granted');
      })
      .catch((e) => {
        console.log('Android ask permission error', e);
      });
  };

  useEffect(() => {
    const subscriptionId = SmsListener.addListener((message: any) => {
      const newOtp = message.body.match(/-*[0-9]+/);
      console.log(newOtp[0], 'wertyuio');
      otpString = newOtp && newOtp.length > 0 ? newOtp[0] : '';
    });
    setSubscriptionId(subscriptionId);

    didBlurSubscription = props.navigation.addListener('didBlur', (payload) => {
      setPhoneNumber('');
    });
  }, [subscriptionId]);

  useEffect(() => {
    return () => {
      subscriptionId && subscriptionId.remove();
      didBlurSubscription && didBlurSubscription.remove();
    };
  }, [subscriptionId]);

  const validateAndSetPhoneNumber = (number: string) => {
    if (/^\d+$/.test(number) || number == '') {
      setPhoneNumber(number);
      // if (number.length == 10) {
      setPhoneNumberIsValid(isPhoneNumberValid(number));
      // }
    } else {
      return false;
    }
  };

  type TimeOutData = {
    phoneNumber: string;
    startTime: string;
    invalidAttems: number;
  };

  const _getTimerData = async () => {
    let isNoBlocked = false;
    try {
      const data = await AsyncStorage.getItem('timeOutData');
      if (data) {
        const timeOutData: TimeOutData[] = JSON.parse(data);
        timeOutData.map((obj) => {
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
    console.log(isNoBlocked, 'isNoBlocked');

    return isNoBlocked;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBarBg} />
      <SafeAreaView style={styles.container}>
        <View style={{ height: 56 }} />
        <Card
          cardContainer={{ marginTop: 0, height: 300 }}
          heading={string.LocalStrings.hello}
          description={string.LocalStrings.please_enter_no}
          buttonIcon={
            phoneNumberIsValid && phoneNumber.replace(/^0+/, '').length === 10 ? (
              <ArrowYellow />
            ) : (
              <ArrowDisabled />
            )
          }
          onClickButton={async () => {
            Keyboard.dismiss();
            if (
              !(phoneNumber.length == 10 && phoneNumberIsValid && isMobileNumberValid(phoneNumber))
            ) {
              return null;
            } else {
              const isBlocked = await _getTimerData();
              console.log('isBlocked', isBlocked);

              if (isBlocked) {
                props.navigation.navigate(AppRoutes.OTPVerification, {
                  phoneNumberVerificationCredential: '',
                  otpString,
                  phoneNumber: '+91' + phoneNumber,
                });
              } else {
                setVerifyingPhonenNumber(true);
                firebase
                  .auth()
                  .signInWithPhoneNumber('+91' + phoneNumber)
                  .then((confirmResult) => {
                    setVerifyingPhonenNumber(false);
                    console.log(confirmResult, 'confirmResult');

                    props.navigation.navigate(AppRoutes.OTPVerification, {
                      phoneNumberVerificationCredential: confirmResult.verificationId,
                      confirmResult,
                      otpString,
                      phoneNumber: '+91' + phoneNumber,
                    });
                  })
                  .catch((error) => {
                    console.log(error, 'error');
                    setVerifyingPhonenNumber(false);
                    Alert.alert('Error', 'The interaction was cancelled by the user.');
                  });
              }
            }
          }}
          disableButton={phoneNumberIsValid && phoneNumber.length === 10 ? false : true}
        >
          <View
            style={[
              { height: 56, paddingTop: 20 },
              phoneNumber == '' || phoneNumberIsValid ? styles.inputValidView : styles.inputView,
            ]}
          >
            <Text style={styles.inputTextStyle}>{string.LocalStrings.numberPrefix}</Text>
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
              ? string.LocalStrings.otp_sent_to
              : string.LocalStrings.wrong_number}
          </Text>
          {phoneNumber == '' || phoneNumberIsValid ? null : (
            <TouchableOpacity
              onPress={() => props.navigation.push(AppRoutes.NeedHelp)}
              style={{ marginTop: -10 }}
            >
              <Text style={[styles.gethelpText]}>{string.LocalStrings.gethelp}</Text>
            </TouchableOpacity>
          )}
        </Card>
      </SafeAreaView>
      {verifyingPhoneNumber ? (
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0, 0.2)',
            alignSelf: 'center',
            justifyContent: 'center',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <ActivityIndicator animating={verifyingPhoneNumber} size="large" color="green" />
        </View>
      ) : null}
    </View>
  );
};
