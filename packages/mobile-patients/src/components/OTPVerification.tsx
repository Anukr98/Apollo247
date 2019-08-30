import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { BackArrow, OkText, OkTextDisabled } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AsyncStorage,
  EmitterSubscription,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import { NavigationScreenProps } from 'react-navigation';
import { useAllCurrentPatients, useAuth } from '../hooks/authHooks';
import { OTPTextView } from './ui/OTPTextView';
import firebase from 'react-native-firebase';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  inputView: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 56,
    marginBottom: 8,
    paddingTop: 2,
  },
  errorText: {
    lineHeight: 24,
    color: theme.colors.INPUT_FAILURE_TEXT,
    ...theme.fonts.IBMPlexSansMedium(12),
    paddingBottom: 3,
  },
  bottomDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_INFO,
    ...theme.fonts.IBMPlexSansSemiBold(12),
  },
  codeInputStyle: {
    borderBottomWidth: 2,
    width: '14%',
    margin: 0,
    height: 48,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    ...theme.fonts.IBMPlexSansMedium(18),
  },
});

let timer = 900;
export type ReceivedSmsMessage = {
  originatingAddress: string;
  body: string;
};
export type timeOutDataType = { phoneNumber: string; invalidAttems: number; startTime: string };

export interface OTPVerificationProps
  extends NavigationScreenProps<{
    otpString: string;
    phoneNumber: string;
  }> {}
export const OTPVerification: React.FC<OTPVerificationProps> = (props) => {
  const [subscriptionId, setSubscriptionId] = useState<EmitterSubscription>();
  const [isValidOTP, setIsValidOTP] = useState<boolean>(true);
  const [invalidOtpCount, setInvalidOtpCount] = useState<number>(0);
  const [showErrorMsg, setShowErrorMsg] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const [intervalId, setIntervalId] = useState<number>(0);
  const [otp, setOtp] = useState<string>('');
  const [isresent, setIsresent] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [onOtpClick, setOnOtpClick] = useState<boolean>(false);

  const { verifyOtp, sendOtp, isSigningIn, isVerifyingOtp, signInError } = useAuth();
  const { currentPatient } = useAllCurrentPatients();
  const [isAuthChanged, setAuthChanged] = useState<boolean>(false);

  const startInterval = useCallback(
    (timer: number) => {
      const intervalId = setInterval(() => {
        timer = timer - 1;
        setRemainingTime(timer);
        if (timer == 0) {
          console.log('descriptionTextStyle remainingTime', remainingTime);
          setRemainingTime(0);
          setInvalidOtpCount(0);
          setIsValidOTP(true);
          clearInterval(intervalId);
        }
      }, 1000);
    },
    [remainingTime]
  );

  const _removeFromStore = useCallback(async () => {
    try {
      const { phoneNumber } = props.navigation.state.params!;
      const getData = await AsyncStorage.getItem('timeOutData');
      if (getData) {
        const timeOutData = JSON.parse(getData);
        const filteredData = timeOutData.filter(
          (el: timeOutDataType) => el.phoneNumber !== phoneNumber
        );
        console.log(filteredData, 'filteredData');
        await AsyncStorage.setItem('timeOutData', JSON.stringify(filteredData));
      }
    } catch (error) {
      console.log(error, 'error');
      // Error removing data
    }
  }, [props.navigation.state.params]);

  const getTimerData = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('timeOutData');
      if (data) {
        const timeOutData = JSON.parse(data);
        console.log(timeOutData);
        const { phoneNumber } = props.navigation.state.params!;

        timeOutData.map((obj: timeOutDataType) => {
          if (obj.phoneNumber === phoneNumber) {
            const t1 = new Date();
            const t2 = new Date(obj.startTime);
            const dif = t1.getTime() - t2.getTime();

            const seconds = Math.round(dif / 1000);
            console.log(seconds, 'seconds');
            if (obj.invalidAttems === 3) {
              if (seconds < 900) {
                setInvalidOtpCount(3);
                setIsValidOTP(false);
                timer = 900 - seconds;
                console.log(timer, 'timertimer');
                setRemainingTime(timer);
                startInterval(timer);
              } else {
                _removeFromStore();
              }
            } else {
              setShowErrorMsg(true);
              setInvalidOtpCount(obj.invalidAttems);
            }
          }
        });
      }
    } catch (error) {
      // Error retrieving data
      console.log(error.message);
    }
  }, [_removeFromStore, props.navigation.state.params, startInterval]);

  useEffect(() => {
    const { otpString } = props.navigation.state.params!;
    setOtp(otpString);
    console.log('OTPVerification otpString', otpString);
    getTimerData();
  }, [props.navigation, getTimerData]);

  const _storeTimerData = async (invalidAttems: number) => {
    try {
      const { phoneNumber } = props.navigation.state.params!;
      const getData = await AsyncStorage.getItem('timeOutData');
      let timeOutData: timeOutDataType[] = [];
      if (getData) {
        timeOutData = JSON.parse(getData);
        let index: number = 0;
        timeOutData.map((item: timeOutDataType, i: number) => {
          if (item.phoneNumber === phoneNumber) {
            index = i + 1;
          }
        });
        if (index !== 0) {
          timeOutData[index - 1]['startTime'] = new Date().toString();
          timeOutData[index - 1]['invalidAttems'] = invalidAttems;
        } else {
          timeOutData.push({
            startTime: new Date().toString(),
            phoneNumber: phoneNumber,
            invalidAttems,
          });
        }
      } else {
        timeOutData = [
          {
            startTime: new Date().toString(),
            phoneNumber: phoneNumber,
            invalidAttems,
          },
        ];
      }
      console.log(getData, 'getData', timeOutData);

      await AsyncStorage.setItem('timeOutData', JSON.stringify(timeOutData));
    } catch (error) {
      console.log(error, 'error');
      // Error saving data
    }
  };

  useEffect(() => {
    if (onOtpClick) {
      if (currentPatient) {
        if (currentPatient && currentPatient.uhid && currentPatient.uhid !== '') {
          if (currentPatient.relation == null) {
            props.navigation.replace(AppRoutes.MultiSignup);
          } else {
            AsyncStorage.setItem('userLoggedIn', 'true');
            props.navigation.replace(AppRoutes.ConsultRoom);
          }
        } else {
          if (currentPatient.firstName == '') {
            props.navigation.replace(AppRoutes.SignUp);
          } else {
            AsyncStorage.setItem('userLoggedIn', 'true');
            props.navigation.replace(AppRoutes.ConsultRoom);
          }
        }
      }
    }
  }, [props.navigation, currentPatient, onOtpClick]);

  useEffect(() => {
    if (signInError && otp.length === 6) {
      // Alert.alert('Apollo', 'Something went wrong. Please try again.');
      // props.navigation.replace(AppRoutes.Login);
    }
  }, [signInError, props.navigation, otp.length]);

  useEffect(() => {
    const authListener = firebase.auth().onAuthStateChanged((user) => {
      const phoneNumberFromParams = `+91${props.navigation.getParam('phoneNumber')}`;
      const phoneNumberLoggedIn = user && user.phoneNumber;
      if (phoneNumberFromParams == phoneNumberLoggedIn) {
        setAuthChanged(true);
      }
    });
    () => authListener();
  });

  const onClickOk = async () => {
    console.log('otp OTPVerification', otp);
    Keyboard.dismiss();
    setshowSpinner(true);

    verifyOtp(otp)
      .then(() => {
        _removeFromStore();
        setOnOtpClick(true);
      })
      .catch((error) => {
        console.log({ error });
        setTimeout(() => {
          if (isAuthChanged) {
            _removeFromStore();
            setOnOtpClick(true);
          } else {
            setOnOtpClick(false);
            setshowSpinner(false);
            // console.log('error', error);
            _storeTimerData(invalidOtpCount + 1);

            if (invalidOtpCount + 1 === 3) {
              setShowErrorMsg(true);
              setIsValidOTP(false);
              startInterval(timer);
              setIntervalId(intervalId);
            } else {
              setShowErrorMsg(true);
              setIsValidOTP(true);
            }
            setInvalidOtpCount(invalidOtpCount + 1);
            setOtp('');
          }
        }, 1000);
      });
  };

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;

  useEffect(() => {
    const subscriptionId = SmsListener.addListener((message: ReceivedSmsMessage) => {
      const newOtp = message.body.match(/-*[0-9]+/);
      const otpString = newOtp ? newOtp[0] : '';
      console.log(otpString, otpString.length, 'otpString');
      setOtp(otpString.trim());
      setIsValidOTP(true);
    });
    setSubscriptionId(subscriptionId);
    // textInputRef.current.inputs && textInputRef.current.inputs[0].focus();
    // backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    //   console.log('hardwareBackPress');
    //   return false;
    // });
  }, []);

  useEffect(() => {
    return () => {
      subscriptionId && subscriptionId.remove();
      // backHandler && backHandler.remove();
    };
  }, [subscriptionId]);

  useEffect(() => {
    if (timer === 0) {
      console.log('timer', 'wedfrtgy5u676755ertyuiojkhgfghjkgf');
      timer = 900;
      setRemainingTime(900);
      setShowErrorMsg(false);
      setInvalidOtpCount(0);
      setIsValidOTP(true);
      clearInterval(intervalId);
      _removeFromStore();
    }
  }, [intervalId, _removeFromStore]);

  const isOtpValid = (otp: string) => {
    setOtp(otp);
    if (otp.length === 6) {
      setIsValidOTP(true);
    } else {
      setIsValidOTP(false);
    }
  };

  const onClickResend = () => {
    setIsresent(true);
    setOtp('');
    Keyboard.dismiss();
    const { phoneNumber } = props.navigation.state.params!;
    console.log('onClickResend', phoneNumber);

    sendOtp(phoneNumber)
      .then((confirmResult) => {
        console.log('confirmResult login', confirmResult);
      })
      .catch((error) => {
        Alert.alert('Error', 'The interaction was cancelled by the user.');
      });
  };
  // console.log(isSigningIn, currentPatient, isVerifyingOtp);
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={{ height: 56, justifyContent: 'center', paddingLeft: 20 }}>
          <TouchableOpacity
            style={{ height: 25, width: 25, justifyContent: 'center' }}
            onPress={() => {
              props.navigation.goBack();
              intervalId && clearInterval(intervalId);
            }}
          >
            <BackArrow />
          </TouchableOpacity>
        </View>
        {invalidOtpCount === 3 && !isValidOTP ? (
          <Card
            key={1}
            cardContainer={{ marginTop: 0, height: 270 }}
            heading={string.login.oops}
            description={string.login.incorrect_otp_message}
            disableButton={isValidOTP ? false : true}
            descriptionTextStyle={{ paddingBottom: Platform.OS === 'ios' ? 0 : 1 }}
          >
            <View style={styles.inputView}>
              <OTPTextView
                handleTextChange={(otp: string) => setOtp(otp)}
                inputCount={6}
                keyboardType="numeric"
                value={otp}
                textInputStyle={styles.codeInputStyle}
                tintColor={'rgba(0, 179, 142, 0.4)'}
                containerStyle={{ flex: 1 }}
                editable={false}
              />
            </View>
            <Text style={[styles.errorText]}>
              Try again after — {minutes} : {seconds}
            </Text>
          </Card>
        ) : (
          <Card
            key={2}
            cardContainer={{ marginTop: 0, height: 270 }}
            heading={string.login.great}
            description={isresent ? string.login.resend_otp_text : string.login.type_otp_text}
            buttonIcon={isValidOTP && otp.length === 6 ? <OkText /> : <OkTextDisabled />}
            onClickButton={onClickOk}
            disableButton={isValidOTP && otp.length === 6 ? false : true}
            descriptionTextStyle={{ paddingBottom: Platform.OS === 'ios' ? 0 : 1 }}
          >
            <View style={styles.inputView}>
              <OTPTextView
                handleTextChange={isOtpValid}
                inputCount={6}
                keyboardType="numeric"
                value={otp}
                textInputStyle={styles.codeInputStyle}
                tintColor={
                  otp.length === 0 && invalidOtpCount > 0
                    ? theme.colors.INPUT_BORDER_FAILURE
                    : theme.colors.INPUT_BORDER_SUCCESS
                }
                containerStyle={{ flex: 1 }}
              />
            </View>
            {showErrorMsg && (
              <Text style={styles.errorText}>
                Incorrect OTP. You have {3 - invalidOtpCount} more{' '}
                {invalidOtpCount == 2 ? 'try' : 'tries'}.
              </Text>
            )}
            {
              <TouchableOpacity onPress={onClickResend}>
                <Text style={styles.bottomDescription}>{string.login.resend_opt}</Text>
              </TouchableOpacity>
            }
          </Card>
        )}
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
