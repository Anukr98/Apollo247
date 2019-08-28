import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { OkText, OkTextDisabled } from '@aph/mobile-doctors/src/components/ui/Icons';
import { OtpCard } from '@aph/mobile-doctors/src/components/ui/OtpCard';
import { TimeOutData } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { string } from '@aph/mobile-doctors/src/strings/string';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { NavigationScreenProps } from 'react-navigation';
import { OTPTextView } from './ui/OTPTextView';
import { RNFirebase } from 'react-native-firebase';

const styles = StyleSheet.create({
  container: {
    //...theme.viewStyles.container,
    flex: 1,
    width: '100%',
    height: 600,
    backgroundColor: '#f0f4f5',
  },
  inputView: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 56,
    marginBottom: 8,
    paddingTop: 2,
    marginTop: 8,
  },
  errorTextfincal: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(12),
    paddingBottom: 3,
    opacity: 0.5,
  },
  gethelpText: {
    ...Platform.select({
      ios: { marginTop: 22 },
      android: { marginTop: 10 },
    }),
    color: '#fc9916',
    ...theme.fonts.IBMPlexSansBold(12),
    marginBottom: 5,
  },
  bottomDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_INFO,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    marginTop: 15,
  },
  codeInputStyle: {
    borderBottomWidth: 2,
    width: '14%',
    margin: 0,
    height: 48,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    ...theme.fonts.IBMPlexSansMedium(18),
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
  errorText: {
    color: '#890000',
    ...theme.fonts.IBMPlexSansMedium(12),
    paddingBottom: 3,
  },
  otpbuttonview: {
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
  },
});

let timer = 900;

type ReceivedSmsMessage = {
  originatingAddress: string;
  body: string;
};

export interface OTPVerificationProps extends NavigationScreenProps {
  // phoneNumberVerificationCredential: PhoneNumberVerificationCredential;
  // otpString: string;
  phoneNumber: string;
}
export const OTPVerification: React.FC<OTPVerificationProps> = (props) => {
  const [isValidOTP, setIsValidOTP] = useState<boolean>(true);
  const [invalidOtpCount, setInvalidOtpCount] = useState<number>(0);
  const [showErrorMsg, setShowErrorMsg] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const [intervalId, setIntervalId] = useState<any>(0);
  const [otp, setOtp] = useState<string>('');
  const [isresent, setIsresent] = useState<boolean>(false);
  // const [errorAuth, setErrorAuth] = useState<boolean>(true);
  const { sendOtp, verifyOtp } = useAuth();
  // const client = useApolloClient();

  const [isLoading, setIsLoading] = useState(false);

  // const [androidSignedIn, setAndroidSignedIn] = useState(false);

  useEffect(() => {
    _getTimerData();
  }, []);

  // useEffect(() => {
  //   setErrorAuth(authError);
  //   console.log('authError OTPVerification', authError);
  //   if (authError) {
  //     clearCurrentUser();
  //     setIsLoading(false);
  //     //Alert.alert('Error', 'Unable to connect the server at the moment.');
  //   }
  // }, [authError]);

  useEffect(() => {
    const smsListener = SmsListener.addListener((message: ReceivedSmsMessage) => {
      const newOtp = message.body.match(/-*[0-9]+/);
      const otpString = newOtp ? newOtp[0] : '';
      setOtp(otpString);
      setIsValidOTP(true);
    });
    return () => {
      smsListener && smsListener.remove();
    };
  }, []);

  useEffect(() => {
    if (timer === 0) {
      timer = 900;
      setRemainingTime(900);
      setShowErrorMsg(false);
      setInvalidOtpCount(0);
      setIsValidOTP(true);
      clearInterval(intervalId);
      _removeFromStore();
    }
  }, [timer, intervalId]);

  const startInterval = (timer: number) => {
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
  };

  const _getTimerData = async () => {
    try {
      const data = await AsyncStorage.getItem('timeOutData');
      if (data) {
        const timeOutData: TimeOutData[] = JSON.parse(data);
        console.log(timeOutData);
        const { phoneNumber } = props.navigation.state.params!;

        timeOutData.map((obj) => {
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
  };

  const _removeFromStore = async () => {
    try {
      const { phoneNumber } = props.navigation.state.params!;
      const getData = await AsyncStorage.getItem('timeOutData');
      if (getData) {
        const timeOutData: TimeOutData[] = JSON.parse(getData);
        const filteredData = timeOutData.filter((el) => el.phoneNumber !== phoneNumber);
        console.log(filteredData, 'filteredData');
        await AsyncStorage.setItem('timeOutData', JSON.stringify(filteredData));
      }
    } catch (error) {
      console.log(error, 'error');
      // Error removing data
    }
  };

  const _storeTimerData = async (invalidAttems: number) => {
    try {
      const { phoneNumber } = props.navigation.state.params!;
      let timeOutData: TimeOutData[] = [];
      const getData = await AsyncStorage.getItem('timeOutData');
      if (getData) {
        timeOutData = JSON.parse(getData);
        let index: number = 0;
        timeOutData.map((item, i) => {
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

  const redirectToProfileSetup = (phoneNumber: string) => {
    console.log('redirectToProfileSetup called');
    props.navigation.replace(AppRoutes.OTPVerificationApiCall, { phoneNumber });
  };

  const onClickOk = async () => {
    Keyboard.dismiss();
    setIsLoading(true);
    verifyOtp &&
      verifyOtp(otp)
        .then((user: RNFirebase.User | unknown) => {
          _removeFromStore();
          redirectToProfileSetup((user as RNFirebase.User).phoneNumber || '');
        })
        .catch(async (error) => {
          setIsLoading(false);
          setOtp('');
          console.log('firebaseOtpError');
          // user entered wrong otp
          _storeTimerData(invalidOtpCount + 1);
          setShowErrorMsg(true);
          if (invalidOtpCount + 1 === 3) {
            setIsValidOTP(false);
            startInterval(timer);
            setIntervalId(intervalId);
          } else {
            setIsValidOTP(true);
          }
          setInvalidOtpCount(invalidOtpCount + 1);
        });
  };

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;

  const isOtpValid = (otp: string) => {
    setOtp(otp);
    if (otp.length === 6 || otp.length === 0) {
      setIsValidOTP(true);
    } else {
      setIsValidOTP(false);
    }
  };

  const onClickResend = () => {
    const { phoneNumber } = props.navigation.state.params!;
    setIsresent(true);
    setOtp('');
    Keyboard.dismiss();
    console.log('onClickResend', phoneNumber);
    setIsLoading(true);
    sendOtp &&
      sendOtp(phoneNumber)
        .then((_) => {
          setIsLoading(false);
        })
        .catch((error) => {
          setIsLoading(false);
          console.log(error, 'error');
          // Alert.alert('Error', 'Unable to connect the server at the moment.');
        });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.statusBarBg} />
      <SafeAreaView style={styles.container}>
        {invalidOtpCount === 3 && !isValidOTP ? (
          <OtpCard
            key={1}
            cardContainer={{ marginTop: 56, height: 300 }}
            heading={string.LocalStrings.oops}
            description={string.LocalStrings.incorrect_otp_message}
            // disableButton={isValidOTP ? false : true}
            buttonIcon={isValidOTP && otp.length === 6 ? <OkText /> : <OkTextDisabled />}
            disableButton={isValidOTP && otp.length === 6 ? false : true}
            descriptionTextStyle={{ paddingBottom: Platform.OS === 'ios' ? 0 : 1 }}
            onPress={() => props.navigation.push(AppRoutes.Login)}
          >
            <View style={styles.inputView}>
              <OTPTextView
                handleTextChange={(otp: string) => setOtp(otp)}
                inputCount={6}
                value={otp}
                textInputStyle={styles.codeInputStyle}
                tintColor="rgba(2, 71, 91, 0.3)" //"#4c02475b" //{'rgba(0, 179, 142, 0.4)'}
                offTintColor="rgba(2, 71, 91, 0.3)" //"#4c02475b" //{'rgba(0, 179, 142, 0.4)'}
                containerStyle={{ flex: 1 }}
                editable={false}
              />
            </View>
            <Text style={[styles.errorTextfincal]}>
              Try again after {minutes} : {seconds.toString().length < 2 ? '0' + seconds : seconds}
            </Text>
            <TouchableOpacity onPress={() => props.navigation.push(AppRoutes.HelpScreen)}>
              <Text style={[styles.gethelpText]}>GET HELP</Text>
            </TouchableOpacity>
          </OtpCard>
        ) : (
          <OtpCard
            key={2}
            cardContainer={{ marginTop: 56, height: 300 }}
            heading={string.LocalStrings.great}
            description={
              isresent ? string.LocalStrings.type_otp_text : string.LocalStrings.resend_otp_text
            }
            buttonIcon={isValidOTP && otp.length === 6 ? <OkText /> : <OkTextDisabled />}
            onClickButton={onClickOk}
            disableButton={isValidOTP && otp.length === 6 ? false : true}
            descriptionTextStyle={{ paddingBottom: Platform.OS === 'ios' ? 0 : 1 }}
            onPress={() => props.navigation.goBack()}
          >
            <View style={styles.inputView}>
              <OTPTextView
                handleTextChange={isOtpValid}
                inputCount={6}
                value={otp}
                textInputStyle={styles.codeInputStyle}
                tintColor={
                  invalidOtpCount > 0 && otp.length === 0
                    ? theme.colors.INPUT_BORDER_FAILURE
                    : isValidOTP && otp.length === 6
                    ? theme.colors.INPUT_BORDER_SUCCESS
                    : '#000000'
                }
                offTintColor={
                  invalidOtpCount > 0 && otp.length === 0
                    ? theme.colors.INPUT_BORDER_FAILURE
                    : isValidOTP && otp.length === 6
                    ? theme.colors.INPUT_BORDER_SUCCESS
                    : '#000000'
                }
                containerStyle={{ flex: 1 }}
              />
            </View>
            {showErrorMsg && (
              <Text style={styles.errorText}>
                Incorrect OTP, {3 - invalidOtpCount} attempt{3 - invalidOtpCount > 1 ? 's' : ''}{' '}
                {invalidOtpCount == 2 ? 'left' : 'left'}
              </Text>
            )}
            {
              <TouchableOpacity onPress={onClickResend}>
                <Text style={styles.bottomDescription}>{string.LocalStrings.resend_opt}</Text>
              </TouchableOpacity>
            }
          </OtpCard>
        )}
      </SafeAreaView>
      {isLoading ? (
        <View style={styles.otpbuttonview}>
          <ActivityIndicator animating={isLoading} size="large" color="green" />
        </View>
      ) : null}
    </View>
  );
};
