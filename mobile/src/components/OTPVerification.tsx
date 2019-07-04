import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { Card } from 'app/src/components/ui/Card';
import { BackArrow, OkText, OkTextDisabled } from 'app/src/components/ui/Icons';
import { string } from 'app/src/strings/string';
import { theme } from 'app/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
  Alert,
  BackHandler,
  AsyncStorage,
} from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
// import OTPTextView from 'react-native-otp-textinput';
import { OTPTextView } from './ui/OTPTextView';
import { NavigationScreenProps } from 'react-navigation';
import { useAuth } from '../hooks/authHooks';
import { PhoneNumberVerificationCredential } from './AuthProvider';
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
let backHandler: any;

export interface OTPVerificationProps
  extends NavigationScreenProps<{
    phoneNumberVerificationCredential: PhoneNumberVerificationCredential;
    otpString: string;
    phoneNumber: string;
  }> {}
export const OTPVerification: React.FC<OTPVerificationProps> = (props) => {
  const [subscriptionId, setSubscriptionId] = useState<any>();
  const [isValidOTP, setIsValidOTP] = useState<boolean>(true);
  const [invalidOtpCount, setInvalidOtpCount] = useState<number>(0);
  const [showErrorMsg, setShowErrorMsg] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const [intervalId, setIntervalId] = useState<any>(0);
  const [otp, setOtp] = useState<string>('');
  const [hideBackArrow, setHideBackArrow] = useState<boolean>(true);
  const [errorAuth, setErrorAuth] = useState<boolean>(true);

  const { signIn, callApiWithToken, authError } = useAuth();
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const startInterval = (timer: number) => {
    const intervalId = setInterval(() => {
      timer = timer - 1;
      setRemainingTime(timer);
      console.log('descriptionTextStyle', remainingTime);
      if (timer == 0) {
        console.log('descriptionTextStyle remainingTime', remainingTime);
        setRemainingTime(0);
        clearInterval(intervalId);
      }
    }, 1000);
  };
  useEffect(() => {
    const { otpString } = props.navigation.state.params!;
    setOtp(otpString);
    console.log('OTPVerification otpString', otpString);
    _getData();
  }, []);

  const _getData = async () => {
    try {
      const data = await AsyncStorage.getItem('timeOutData');
      if (data) {
        const timeOutData = JSON.parse(data);
        console.log(timeOutData);
        timeOutData.map((obj) => {
          if (obj.phoneNumber === obj.phoneNumber) {
            const t1 = new Date();
            const t2 = new Date(obj.startTime);
            const dif = t1.getTime() - t2.getTime();

            const seconds = Math.round(dif / 1000);
            console.log(seconds, 'seconds');
            if (seconds < 900) {
              setInvalidOtpCount(3);
              setIsValidOTP(false);
              timer = 900 - seconds;
              console.log(timer, 'timertimer');
              setRemainingTime(timer);
              startInterval(timer);
            }
          }
        });
      }
    } catch (error) {
      // Error retrieving data
      console.log(error.message);
    }
  };
  useEffect(() => {
    setErrorAuth(authError);
    console.log('authError OTPVerification', authError);
    if (authError) {
      setVerifyingOtp(false);
      Alert.alert('Error', 'Unable to connect the server at the moment.');
    }
  }, [authError]);

  const _storeData = async () => {
    try {
      const { phoneNumber } = props.navigation.state.params!;

      const timeOutData = [
        {
          startTime: new Date().toString(),
          phoneNumber: phoneNumber,
        },
      ];
      await AsyncStorage.setItem('timeOutData', JSON.stringify(timeOutData));
    } catch (error) {
      console.log(error, 'error');
      // Error saving data
    }
  };

  const onClickOk = () => {
    const { phoneNumberVerificationCredential } = props.navigation.state.params!;
    setVerifyingOtp(true);
    Keyboard.dismiss();

    const credential = firebase.auth.PhoneAuthProvider.credential(
      phoneNumberVerificationCredential,
      otp
    );

    signIn(credential)
      .then((otpCredenntial: void) => {
        console.log('otpCredenntial', otpCredenntial);
        firebase.auth().onAuthStateChanged(async (updatedUser) => {
          if (updatedUser) {
            const token = await updatedUser!.getIdToken();
            const patientSign = await callApiWithToken(token);
            const patient = patientSign.data.patientSignIn.patients[0];
            const errMsg =
              patientSign.data.patientSignIn.errors &&
              patientSign.data.patientSignIn.errors.messages[0];
            setVerifyingOtp(false);
            console.log('patient', patient);

            if (errMsg) {
              Alert.alert('Error', errMsg);
            } else {
              if (patient && patient.uhid && patient.uhid !== '') {
                props.navigation.navigate(AppRoutes.MultiSignup);
              } else {
                props.navigation.navigate(AppRoutes.SignUp);
              }
            }
          } else {
            console.log('no new user');
          }
        });
      })
      .catch((error: any) => {
        console.log('error', error);
        setVerifyingOtp(false);

        if (invalidOtpCount + 1 === 3) {
          _storeData();

          setShowErrorMsg(true);
          setIsValidOTP(false);
          setHideBackArrow(false);
          setOtp('');

          // textInputRef.current.inputs && textInputRef.current.inputs[5].blur();
          startInterval(timer);
          setIntervalId(intervalId);
        } else {
          setShowErrorMsg(true);
          setIsValidOTP(true);
        }
        setInvalidOtpCount(invalidOtpCount + 1);
        console.log(invalidOtpCount);
        setOtp('');
        for (let i = 0; i < 6; i++) {
          // textInputRef.current.inputs && textInputRef.current.onTextChange('', i);
        }
        // textInputRef.current.inputs && textInputRef.current.inputs[0].focus();
      });
  };

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;
  const textInputRef = React.useRef<any>(null);

  useEffect(() => {
    const subscriptionId = SmsListener.addListener((message: any) => {
      const newOtp = message.body.match(/-*[0-9]+/);
      const otpString = newOtp ? newOtp[0] : '';
      setOtp(otpString);
      setIsValidOTP(true);
    });
    setSubscriptionId(subscriptionId);
    // textInputRef.current.inputs && textInputRef.current.inputs[0].focus();
    backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('hardwareBackPress');
      return false;
    });
  }, []);

  useEffect(() => {
    return () => {
      subscriptionId && subscriptionId.remove();
      backHandler && backHandler.remove();
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
      setHideBackArrow(true);
      // setTimeout(() => textInputRef.current.inputs && textInputRef.current.inputs[0].focus(), 500);
    }
  }, [timer, intervalId]);

  const isOtpValid = (otp: any) => {
    setOtp(otp);
    if (otp.length === 6) {
      setIsValidOTP(true);
    } else {
      setIsValidOTP(false);
    }
  };

  const onClickResend = () => {
    setOtp('');
    Keyboard.dismiss();
    for (let i = 0; i < 6; i++) {
      // textInputRef.current && textInputRef.current.onTextChange('', i);
    }
    // textInputRef.current.inputs && textInputRef.current.inputs[0].focus();
    const { phoneNumber } = props.navigation.state.params!;
    console.log('onClickResend', phoneNumber);
    setVerifyingOtp(true);

    setTimeout(() => {
      firebase
        .auth()
        .signInWithPhoneNumber(phoneNumber)
        .then((confirmResult) => {
          setVerifyingOtp(false);
          props.navigation.navigate(AppRoutes.OTPVerification, {
            phoneNumberVerificationCredential: confirmResult.verificationId,
          });
          // setTimeout(
          //   // () => textInputRef.current.inputs && textInputRef.current.inputs[0].focus(),
          //   10
          // );
        })
        .catch((error) => {
          setVerifyingOtp(false);
          console.log(error, 'error');
        });
    }, 50);
  };

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
            {/* {hideBackArrow ? <BackArrow /> : null} */}
          </TouchableOpacity>
        </View>
        {invalidOtpCount === 3 && !isValidOTP ? (
          <Card
            key={1}
            cardContainer={{ marginTop: 0, height: 270 }}
            heading={string.LocalStrings.oops}
            description={string.LocalStrings.incorrect_otp_message}
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
                offTintColor={'rgba(0, 179, 142, 0.4)'}
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
            heading={string.LocalStrings.great}
            description={string.LocalStrings.type_otp_text}
            buttonIcon={isValidOTP && otp.length === 6 ? <OkText /> : <OkTextDisabled />}
            onClickButton={onClickOk}
            disableButton={isValidOTP && otp.length === 6 ? false : true}
            descriptionTextStyle={{ paddingBottom: Platform.OS === 'ios' ? 0 : 1 }}
          >
            <View style={styles.inputView}>
              <OTPTextView
                ref={textInputRef}
                handleTextChange={isOtpValid}
                inputCount={6}
                keyboardType="numeric"
                defaultValue={otp}
                textInputStyle={styles.codeInputStyle}
                tintColor={
                  isValidOTP && (otp.length === 0 || otp.length === 6)
                    ? theme.colors.INPUT_BORDER_SUCCESS
                    : theme.colors.INPUT_BORDER_FAILURE
                }
                offTintColor={
                  isValidOTP && (otp.length === 0 || otp.length === 6)
                    ? theme.colors.INPUT_BORDER_SUCCESS
                    : theme.colors.INPUT_BORDER_FAILURE
                }
                containerStyle={{ flex: 1 }}
                textContentType={'oneTimeCode'}
              />
            </View>
            {showErrorMsg && (
              <Text style={styles.errorText}>
                Incorrect OTP. You have {3 - invalidOtpCount} more tries.
              </Text>
            )}
            {
              <TouchableOpacity onPress={onClickResend}>
                <Text style={styles.bottomDescription}>
                  {string.LocalStrings.resend_opt}
                  {/* {!isValidOTP || otp.length === 0 ? string.LocalStrings.resend_opt : ' '} */}
                </Text>
              </TouchableOpacity>
            }
          </Card>
        )}
      </SafeAreaView>
      {verifyingOtp ? (
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
          <ActivityIndicator animating={verifyingOtp} size="large" color="green" />
        </View>
      ) : null}
    </View>
  );
};
