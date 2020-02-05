import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { timeOutDataType } from '@aph/mobile-doctors/src/components/OTPVerification';
import { Card } from '@aph/mobile-doctors/src/components/ui/Card';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { ArrowDisabled, ArrowYellow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-doctors/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { getNetStatus } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import string from '@aph/mobile-doctors/src/strings/strings.json';
import { fonts } from '@aph/mobile-doctors/src/theme/fonts';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  AsyncStorage,
  Dimensions,
  EmitterSubscription,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import firebase from 'react-native-firebase';
import HyperLink from 'react-native-hyperlink';
import { WebView } from 'react-native-webview';
import { NavigationEventSubscription, NavigationScreenProps } from 'react-navigation';
import { loginAPI } from '../helpers/loginCalls';

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
let dbChildKey: string = '';

export const Login: React.FC<LoginProps> = (props) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const [subscriptionId, setSubscriptionId] = useState<EmitterSubscription>();
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [onClickOpen, setonClickOpen] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const { setLoading } = useUIElements();
  const client = useApolloClient();

  useEffect(() => {
    try {
      fireBaseFCM();
      // signOut();
      setLoading && setLoading(false);
    } catch (error) {}
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
        console.log('not enabled error', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      subscriptionId && subscriptionId.remove();
      didBlurSubscription && didBlurSubscription.remove();
    };
  }, [subscriptionId]);

  // useEffect(() => {
  //   const subscriptionId = SmsListener.addListener((message: ReceivedSmsMessage) => {
  //     const newOtp = message.body.match(/-*[0-9]+/);
  //     otpString = newOtp && newOtp.length > 0 ? newOtp[0] : '';
  //   });
  //   setSubscriptionId(subscriptionId);

  //   didBlurSubscription = props.navigation.addListener('didBlur', (payload) => {
  //     setPhoneNumber('');
  //   });
  // }, [subscriptionId]);

  // useEffect(() => {
  //   return () => {
  //     subscriptionId && subscriptionId.remove();
  //     didBlurSubscription && didBlurSubscription.remove();
  //   };
  // }, [subscriptionId]);

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
            AsyncStorage.setItem('phoneNumber', phoneNumber);
            setShowSpinner(true);

            loginAPI('+91' + phoneNumber)
              .then((confirmResult: any) => {
                console.log(confirmResult, 'confirmResult');
                setShowSpinner(false);
                console.log('confirmResult login', confirmResult);
                props.navigation.navigate(AppRoutes.OTPVerification, {
                  otpString,
                  phoneNumber: phoneNumber,
                  dbChildKey,
                  loginId: confirmResult.loginId,
                });
              })
              .catch((error: Error) => {
                console.log(error, 'error');
                console.log(error.message, 'errormessage');
                setShowSpinner(false);
                Alert.alert(
                  'Error',
                  (error && error.message) || 'The interaction was cancelled by the user.'
                );
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
    Keyboard.dismiss();
    return (
      <View style={styles.viewWebStyles}>
        <Header
          headerText={'Terms & Conditions'}
          leftIcon="close"
          containerStyle={{
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
              uri: 'https://www.apollo247.com/TnC.html',
            }}
            style={{
              flex: 1,
              backgroundColor: 'white',
            }}
            // useWebKit={true}
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
                By signing up, I agree to the https://www.apollo247.com/TnC.html of Apollo24x7
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
