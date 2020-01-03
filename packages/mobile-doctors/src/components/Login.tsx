import { AuthContext } from '@aph/mobile-doctors/src/components/AuthProvider';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Card } from '@aph/mobile-doctors/src/components/ui/Card';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { ArrowDisabled, ArrowYellow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { TimeOutData } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { setOnboardingDone } from '@aph/mobile-doctors/src/helpers/localStorage';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  AsyncStorage,
  Dimensions,
  Keyboard,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  WebView,
} from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import { RNFirebase } from 'react-native-firebase';
import Hyperlink from 'react-native-hyperlink';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationEventSubscription, NavigationScreenProps } from 'react-navigation';
import { useAuth } from '../hooks/authHooks';

const { height, width } = Dimensions.get('window');

// import { isMobileNumberValid } from '@aph/universal/src/aphValidators';
const isMobileNumberValid = (phoneNumber: string) => true;

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
  bottomValidDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_SUCCESS_TEXT,
    opacity: 0.6,
    paddingVertical: 10,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  gethelpText: {
    marginTop: 22,
    color: '#fc9916',
    ...theme.fonts.IBMPlexSansSemiBold(12),
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

type ReceivedSmsMessage = {
  originatingAddress: string;
  body: string;
};

export interface LoginProps extends NavigationScreenProps {}

const isPhoneNumberValid = (number: string) => {
  const isValidNumber =
    // (number.replace(/^0+/, '').length !== 10 && number.length !== 0) ||
    !/^[6-9]{1}\d{0,9}$/.test(number) ? false : true;
  return isValidNumber;
};

let otpString = '';
let didBlurSubscription: NavigationEventSubscription;

export const Login: React.FC<LoginProps> = (props) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const [verifyingPhoneNumber, setVerifyingPhonenNumber] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<any>();
  const [showTAC, setshowTAC] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);

  const { analytics } = useAuth();

  const sendOtp = useContext(AuthContext).sendOtp;

  useEffect(() => {
    setOnboardingDone(true);
    analytics && analytics.setCurrentScreen(AppRoutes.Login);
    Platform.OS === 'android' && requestReadSmsPermission();
  }, []);

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
    const subscriptionId = SmsListener.addListener((message: ReceivedSmsMessage) => {
      const newOtp = message.body.match(/-*[0-9]+/);
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
        const timeOutData: TimeOutData[] = JSON.parse(data);
        timeOutData.map((obj) => {
          if (obj.phoneNumber === `${phoneNumber}`) {
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

  const openWebView = () => {
    Keyboard.dismiss();
    return (
      <View style={styles.viewWebStyles}>
        <Header
          headerText={'Terms & Conditions'}
          // leftIcon="close"
          containerStyle={{
            borderBottomWidth: 0,
          }}
          // onPressLeftIcon={() => setshowTAC(false)}
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
              uri: 'https://www.apollo247.com/TnC.html',
            }}
            style={{
              flex: 1,
              backgroundColor: 'white',
            }}
            useWebKit={true}
            onLoadStart={() => {
              console.log('onLoadStart');
              setshowSpinner(true);
            }}
            onLoadEnd={() => {
              console.log('onLoadEnd');
              setshowSpinner(false);
            }}
            onLoad={() => {
              console.log('onLoad');
              setshowSpinner(false);
            }}
          />
        </View>
      </View>
    );
  };

  const isValid = phoneNumber == '' || phoneNumberIsValid;

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
                  phoneNumber: phoneNumber,
                });
              } else {
                setVerifyingPhonenNumber(true);
                sendOtp &&
                  sendOtp(phoneNumber)
                    .then((confirmResult) => {
                      setVerifyingPhonenNumber(false);
                      console.log(confirmResult, 'confirmResult');

                      props.navigation.navigate(AppRoutes.OTPVerification, {
                        // phoneNumberVerificationCredential: confirmResult.verificationId,
                        // confirmResult,
                        otpString,
                        phoneNumber: phoneNumber,
                      });
                      setPhoneNumber('');
                    })
                    .catch((error: RNFirebase.RnError) => {
                      console.log(error, 'error');
                      setVerifyingPhonenNumber(false);
                      Alert.alert(
                        'Error',
                        (error && error.message) || 'The interaction was cancelled by the user.'
                      );
                    });
              }
            }
          }}
          disableButton={phoneNumberIsValid && phoneNumber.length === 10 ? false : true}
        >
          <View
            style={[
              { height: 56, paddingTop: 20 },
              isValid ? styles.inputValidView : styles.inputView,
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
              selectionColor={theme.colors.INPUT_BORDER_SUCCESS}
            />
          </View>
          <Text style={isValid ? styles.bottomValidDescription : styles.bottomDescription}>
            {isValid ? string.LocalStrings.otp_sent_to : string.LocalStrings.wrong_number}
          </Text>
          {isValid ? (
            <View
              style={{
                marginRight: 32,
              }}
            >
              <Hyperlink
                linkStyle={{
                  color: '#02475b',
                  ...theme.fonts.IBMPlexSansBold(11), //fonts.IBMPlexSansBold(11),
                  lineHeight: 16,
                  letterSpacing: 0,
                }}
                linkText={(url) =>
                  url === 'https://www.apollo247.com/TnC.html' ? 'Terms and Conditions' : url
                }
                onPress={(url, text) => setshowTAC(true)}
              >
                <Text
                  style={{
                    color: '#02475b',
                    ...theme.fonts.IBMPlexSans(11),
                    lineHeight: 16,
                    letterSpacing: 0,
                  }}
                >
                  By logging in, you agree to our https://www.apollo247.com/TnC.html
                </Text>
              </Hyperlink>
            </View>
          ) : (
            // <View style={{ height: 28 }} />
            <TouchableOpacity
              onPress={() => props.navigation.push(AppRoutes.HelpScreen)}
              style={{ marginTop: -10 }}
            >
              <Text style={[styles.gethelpText]}>{string.LocalStrings.gethelp}</Text>
            </TouchableOpacity>
          )}
        </Card>
        {showTAC && openWebView()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
      {verifyingPhoneNumber ? <Spinner /> : null}
    </View>
  );
};
