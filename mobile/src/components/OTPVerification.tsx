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
} from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import OTPTextView from 'react-native-otp-textinput';
import { NavigationScreenProps } from 'react-navigation';
import { useAuth } from '../hooks/authHooks';
import { PhoneNumberVerificationCredential } from './AuthProvider';

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
  const {
    isAuthenticating,
    currentUser,
    signIn,
    verifyOtp,
    verifyPhoneNumber,
    signOut,
  } = useAuth();
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    const { otpString } = props.navigation.state.params!;
    setOtp(otpString);

    // textInputRef.current.inputs && textInputRef.current.inputs[5].focus();
    console.log('OTPVerification otpString', otpString);
  }, []);

  const onClickOk = () => {
    const { phoneNumberVerificationCredential } = props.navigation.state.params!;
    console.log(props.navigation.state.params);
    console.log('otp', otp);

    setVerifyingOtp(true);
    verifyOtp(phoneNumberVerificationCredential, otp)
      .then((otpVerificationCredential) => {
        setVerifyingOtp(false);
        signIn(otpVerificationCredential).then;

        if (currentUser) {
          console.log('currentUser', currentUser);

          if (currentUser.uhid && currentUser.uhid !== '') {
            props.navigation.navigate(AppRoutes.MultiSignup);
          } else {
            props.navigation.navigate(AppRoutes.SignUp);
          }
        } else {
          // textInputRef.current.inputs && textInputRef.current.inputs[0].focus();
          // setOtp('');
          // setIsValidOTP(false);
          // setVerifyingOtp(false);

          if (invalidOtpCount + 1 === 3) {
            setShowErrorMsg(true);
            setIsValidOTP(false);
            setOtp('');
            textInputRef.current.inputs && textInputRef.current.inputs[5].blur();
            const intervalId = setInterval(() => {
              // console.log('descriptionTextStyle', remainingTime);
              timer = timer - 1;
              setRemainingTime(timer);
              console.log('descriptionTextStyle', timer);
            }, 1000);
            setIntervalId(intervalId);
          } else {
            setShowErrorMsg(true);
            setIsValidOTP(true);
          }
          setInvalidOtpCount(invalidOtpCount + 1);
          console.log(invalidOtpCount);
          setOtp('');
          for (let i = 0; i < 6; i++) {
            textInputRef.current.inputs && textInputRef.current.onTextChange('', i);
          }
          textInputRef.current.inputs && textInputRef.current.inputs[0].focus();
        }
      })
      .catch((error) => {
        setVerifyingOtp(false);
        console.log(error, 'errorerrorerrorerror');
      });
  };

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;
  const textInputRef = React.useRef<any>(null);

  useEffect(() => {
    const subscriptionId = SmsListener.addListener((message) => {
      console.log('Login message', message);
      var newOtp = message.body.match(/-*[0-9]+/);
      console.log(newOtp[0], 'wertyuio');
      const otpString = newOtp ? newOtp[0] : '';
      setOtp(otpString);
      setIsValidOTP(true);
      console.log('message', message);
    });
    setSubscriptionId(subscriptionId);
    textInputRef.current.inputs && textInputRef.current.inputs[0].focus();
  }, []);

  useEffect(() => {
    return () => {
      subscriptionId && subscriptionId.remove();
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
      setTimeout(() => textInputRef.current.inputs && textInputRef.current.inputs[0].focus(), 1000);
    }
  }, [timer, intervalId]);

  const isOtpValid = (otp: any) => {
    setOtp(otp);
    console.log(otp, 'ooottppppp');
    if (otp.length === 6) {
      setIsValidOTP(true);
    } else {
      setIsValidOTP(false);
    }
  };

  const onClickResend = () => {
    setOtp('');
    setInvalidOtpCount(0);
    Keyboard.dismiss();
    const { phoneNumber } = props.navigation.state.params!;
    console.log('onClickResend', phoneNumber);
    setVerifyingOtp(true);
    // signOut();

    verifyPhoneNumber('+91' + phoneNumber)
      .then((phoneNumberVerificationCredential) => {
        setVerifyingOtp(false);
        console.log(
          'onClickResend phoneNumberVerificationCredential',
          phoneNumberVerificationCredential
        );
        props.navigation.setParams({ phoneNumberVerificationCredential });
      })
      .catch((error) => {
        console.log('onClickResend error', error);
        setVerifyingOtp(false);
      });
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
                defaultValue={otp}
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
                // textContentType={'oneTimeCode'}
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
                  {!isValidOTP || otp.length === 0 ? string.LocalStrings.resend_opt : ' '}
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
