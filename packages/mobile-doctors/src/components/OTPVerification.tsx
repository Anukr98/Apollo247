import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import OTPVerificationStyles from '@aph/mobile-doctors/src/components/OTPVerification.styles';
import { Card } from '@aph/mobile-doctors/src/components/ui/Card';
import { CountDownTimer } from '@aph/mobile-doctors/src/components/ui/CountDownTimer';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, OkText, OkTextDisabled } from '@aph/mobile-doctors/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-doctors/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { getNetStatus } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { setDoctorDetails } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import {
  default as string,
  default as strings,
} from '@aph/mobile-doctors/src/strings/strings.json';
import { fonts } from '@aph/mobile-doctors/src/theme/fonts';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  BackHandler,
  Keyboard,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Hyperlink from 'react-native-hyperlink';
import { WebView } from 'react-native-webview';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { resendOTP, verifyOTP } from '../helpers/loginCalls';
import SmsRetriever from 'react-native-sms-retriever';
import AsyncStorage from '@react-native-community/async-storage';

const styles = OTPVerificationStyles;

let timer = 900;
export type ReceivedSmsMessage = {
  originatingAddress: string;
  body: string;
};
export type timeOutDataType = { phoneNumber: string; invalidAttems: number; startTime: string };

export interface OTPVerificationProps
  extends NavigationScreenProps<{
    phoneNumber: string;
    loginId: string;
  }> {}

let errorAlertShown = false;

export const OTPVerification: React.FC<OTPVerificationProps> = (props) => {
  const [isValidOTP, setIsValidOTP] = useState<boolean>(false);
  const [invalidOtpCount, setInvalidOtpCount] = useState<number>(0);
  const [showErrorMsg, setShowErrorMsg] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const [intervalId, setIntervalId] = useState<number>(0);
  const [otp, setOtp] = useState<string>('');
  const [isresent, setIsresent] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [onClickOpen, setonClickOpen] = useState<boolean>(false);
  const [showResentTimer, setShowResentTimer] = useState<boolean>(false);
  const [showErrorBottomLine, setshowErrorBottomLine] = useState<boolean>(false);

  const {
    sendOtp,
    doctorDetails,
    getDoctorDetailsError,
    clearFirebaseUser,
    setDoctorDetails: setContextDoctorDetails,
  } = useAuth();
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [isOtpVerified, setisOtpVerified] = useState<boolean>(false);

  const phoneNumber = props.navigation.getParam('phoneNumber');

  const handleBack = async () => {
    setonClickOpen(false);
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    return true;
  };

  const smsListenerAndroid = async () => {
    if (Platform.OS === 'android') {
      try {
        const registered = await SmsRetriever.startSmsRetriever();
        if (registered) {
          SmsRetriever.addSmsListener((event) => {
            console.log(event.message, 'otp message');
            if (event.message) {
              const messageOTP = event.message.match(/[0-9]{6}/g);
              if (messageOTP) {
                isOtpValid(messageOTP[0]);
                // onClickOk(messageOTP[0]);
              }
            }
            SmsRetriever.removeSmsListener();
          });
        }
      } catch (error) {
        console.log('Message listining error');
      }
    }
  };

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);
    const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });

    const _willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    if (Platform.OS === 'android') {
      smsListenerAndroid();
    }
    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
      if (Platform.OS === 'android') {
        SmsRetriever.removeSmsListener();
      }
      AppState.removeEventListener('change', _handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    console.log(getDoctorDetailsError, doctorDetails, 'getDoctorDetailsError');
    async function OtpCheck() {
      const isProfileFlowDone = await AsyncStorage.getItem('isProfileFlowDone');
      console.log(isProfileFlowDone, 'isProfileFlowDone');

      if (isOtpVerified) {
        setTimeout(() => {
          if (isProfileFlowDone === 'true') {
            props.navigation.dispatch(
              StackActions.reset({
                index: 0,
                key: null,
                actions: [NavigationActions.navigate({ routeName: AppRoutes.TabBar })],
              })
            );
          } else {
            if (doctorDetails && doctorDetails.id) {
              console.log(
                doctorDetails,
                'doctorDetails doctorType',
                doctorDetails.doctorType,
                doctorDetails.doctorType != 'JUNIOR'
              );
              if (doctorDetails.doctorType !== 'JUNIOR') {
                console.log('doctorType JUNIOR');

                props.navigation.dispatch(
                  StackActions.reset({
                    index: 0,
                    key: null,
                    actions: [NavigationActions.navigate({ routeName: AppRoutes.ProfileSetup })],
                  })
                );
              } else if (!errorAlertShown) {
                errorAlertShown = true;
                console.log('doctorType JUNIOR else');

                AsyncStorage.setItem('isLoggedIn', 'false');
                setDoctorDetails(null);
                clearFirebaseUser && clearFirebaseUser();
                Alert.alert(strings.common.error, strings.otp.reach_out_admin, [
                  {
                    text: 'OK',
                    onPress: () => {
                      console.log('OK Pressed');
                      errorAlertShown = false;
                    },
                  },
                ]);
                setshowSpinner(false);
              }
            } else {
              console.log(getDoctorDetailsError, 'getDoctorDetailsError else');

              if (getDoctorDetailsError === true && !errorAlertShown) {
                errorAlertShown = true;
                AsyncStorage.setItem('isLoggedIn', 'false');
                setDoctorDetails(null);
                clearFirebaseUser && clearFirebaseUser();
                Alert.alert(strings.common.error, strings.otp.reach_out_admin, [
                  {
                    text: 'OK',
                    onPress: () => {
                      console.log('OK Pressed');
                      errorAlertShown = false;
                    },
                  },
                ]);
                setshowSpinner(false);
              }
            }
          }
        }, 2000);
      }
    }

    OtpCheck();
  }, [doctorDetails, isOtpVerified, props.navigation, getDoctorDetailsError, clearFirebaseUser]);

  const _removeFromStore = useCallback(async () => {
    try {
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
  }, [phoneNumber]);

  const getTimerData = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('timeOutData');
      if (data) {
        const timeOutData = JSON.parse(data);
        console.log(timeOutData);

        timeOutData.map((obj: timeOutDataType) => {
          if (obj.phoneNumber === phoneNumber) {
            const t1 = new Date();
            const t2 = new Date(obj.startTime);
            const dif = t1.getTime() - t2.getTime();

            const seconds = Math.ceil(dif / 1000);
            console.log(seconds, 'seconds');
            if (obj.invalidAttems === 3) {
              if (seconds < 900) {
                setInvalidOtpCount(3);
                setIsValidOTP(false);
                timer = 900 - seconds;
                console.log(timer, 'timertimer');
                setRemainingTime(timer);
                // startInterval(timer);
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
  }, [_removeFromStore, phoneNumber]);

  useEffect(() => {
    getTimerData();
  }, [props.navigation, getTimerData]);

  const _storeTimerData = async (invalidAttems: number) => {
    try {
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

  const onClickOk = (readOtp?: string) => {
    try {
      Keyboard.dismiss();
    } catch (error) {}
    getNetStatus().then(async (status) => {
      if (status) {
        console.log('otp OTPVerification', otp, otp.length, 'length');
        setshowSpinner(true);

        const { loginId } = props.navigation.state.params!;

        verifyOTP(loginId, readOtp || otp)
          .then((data: any) => {
            console.log(data.status === true, data.status, 'status');

            if (data.status === true) {
              // props.navigation.replace(AppRoutes.OTPVerificationApiCall, {
              //   phoneNumber,
              // });
              _removeFromStore();
              console.log('error', data.authToken);

              sendOtp &&
                sendOtp(data.authToken).then((data) => {
                  // setshowSpinner(true);
                  setisOtpVerified(true);
                  //set isloggedin to true
                  AsyncStorage.setItem('isLoggedIn', 'true');
                });
            } else {
              console.log('else error');
              try {
                setshowErrorBottomLine(true);
                setshowSpinner(false);
                _storeTimerData(invalidOtpCount + 1);

                if (invalidOtpCount + 1 === 3) {
                  setShowErrorMsg(true);
                  setIsValidOTP(false);
                  setIntervalId(intervalId);
                } else {
                  setShowErrorMsg(true);
                  setIsValidOTP(true);
                }
                setInvalidOtpCount(invalidOtpCount + 1);
              } catch (error) {
                // setshowSpinner(false);
                // console.log(error);
              }
            }
          })
          .catch((error: Error) => {
            try {
              console.log({
                error,
              });
              setshowErrorBottomLine(true);
              setshowSpinner(false);
              // console.log('error', error);
              _storeTimerData(invalidOtpCount + 1);

              if (invalidOtpCount + 1 === 3) {
                setShowErrorMsg(true);
                setIsValidOTP(false);
                // startInterval(timer);
                setIntervalId(intervalId);
              } else {
                setShowErrorMsg(true);
                setIsValidOTP(true);
              }
              setInvalidOtpCount(invalidOtpCount + 1);
            } catch (error) {
              setshowSpinner(false);
              console.log(error);
            }
          });
      } else {
        setshowOfflinePopup(true);
      }
    });
  };

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log('nextAppState :' + nextAppState);
    if (nextAppState === 'active') {
      getTimerData();
    }
  };

  const onStopTimer = () => {
    // timer = 900;
    setRemainingTime(900);
    setShowErrorMsg(false);
    setInvalidOtpCount(0);
    setIsValidOTP(true);
    clearInterval(intervalId);
    _removeFromStore();
  };

  const onStopResendTimer = () => {
    setShowResentTimer(false);
  };

  const isOtpValid = (otp: string) => {
    if (otp.match(/[0-9]/) || otp === '') {
      showErrorBottomLine && setshowErrorBottomLine(false);
      setOtp(otp);
      if (otp.length === 6) {
        setIsValidOTP(true);
      } else {
        setIsValidOTP(false);
      }
    }
  };

  const onClickResend = () => {
    getNetStatus().then((status) => {
      if (status) {
        setIsresent(true);
        setOtp('');
        Keyboard.dismiss();
        console.log('onClickResend', phoneNumber);

        const loginId = props.navigation.getParam('loginId');

        resendOTP('+91' + phoneNumber, loginId)
          .then((resendResult: any) => {
            console.log('resendOTP ', resendResult.loginId);

            props.navigation.setParams({
              loginId: resendResult.loginId,
            });
            console.log('confirmResult login', resendResult);
            smsListenerAndroid();
          })
          .catch((error: Error) => {
            console.log(error, 'error');
            console.log(error.message, 'errormessage');
            Alert.alert(strings.common.error, 'The interaction was cancelled by the user.');
          });
      } else {
        setshowOfflinePopup(true);
      }
    });
  };

  const openWebView = () => {
    Keyboard.dismiss();
    return (
      <View style={styles.viewWebStyles}>
        <Header
          headerText={strings.login.terms_conditions}
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

  const renderHyperLink = () => {
    return (
      <View
        style={{
          marginRight: 32,
          marginTop: 12,
        }}
      >
        <Hyperlink
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
            {strings.login.by_signingup_descr}
          </Text>
        </Hyperlink>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View
          style={{
            height: 56,
            justifyContent: 'center',
            paddingLeft: 20,
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              height: 25,
              width: 25,
              justifyContent: 'center',
            }}
            onPress={() => {
              props.navigation.goBack();
              intervalId && clearInterval(intervalId);
              setContextDoctorDetails && setContextDoctorDetails(null);
            }}
          >
            <BackArrow />
          </TouchableOpacity>
        </View>
        {invalidOtpCount === 3 && !isValidOTP ? (
          <Card
            key={1}
            cardContainer={{
              marginTop: 0,
              // height: 290,
              paddingBottom: 12,
            }}
            headingTextStyle={{
              marginTop: 10,
            }}
            heading={string.login.oops}
            description={string.login.incorrect_otp_message}
            disableButton={isValidOTP ? false : true}
            descriptionTextStyle={{
              paddingBottom: Platform.OS === 'ios' ? 0 : 1,
            }}
          >
            <View style={styles.inputView}>
              <TextInput
                style={[
                  styles.codeInputStyle,
                  {
                    borderColor: 'rgba(0, 179, 142, 0.4)',
                  },
                ]}
                value={otp}
                onChangeText={(otp: string) => setOtp(otp)}
                editable={false}
                textContentType={'oneTimeCode'}
              />
            </View>

            <Text style={[styles.errorText]}>
              {strings.otp.try_again}{' '}
              <CountDownTimer
                timer={remainingTime}
                style={[styles.errorText]}
                onStopTimer={onStopTimer}
              />
            </Text>
            {renderHyperLink()}
          </Card>
        ) : (
          <Card
            key={2}
            cardContainer={{
              marginTop: 0,
              // height: 260,
              paddingBottom: 12,
            }}
            headingTextStyle={{
              marginTop: 10,
            }}
            heading={string.login.great}
            description={isresent ? string.login.resend_otp_text : string.login.type_otp_text}
            buttonIcon={isValidOTP && otp.length === 6 ? <OkText /> : <OkTextDisabled />}
            onClickButton={() => onClickOk()}
            disableButton={isValidOTP && otp.length === 6 ? false : true}
            descriptionTextStyle={{
              paddingBottom: Platform.OS === 'ios' ? 0 : 1,
            }}
          >
            <View style={styles.inputView}>
              <TextInput
                style={[
                  styles.codeInputStyle,
                  {
                    borderColor: showErrorBottomLine
                      ? theme.colors.INPUT_BORDER_FAILURE
                      : theme.colors.INPUT_BORDER_SUCCESS,
                  },
                ]}
                value={otp}
                onChangeText={isOtpValid}
                keyboardType="numeric"
                textContentType={'oneTimeCode'}
                autoFocus
                maxLength={6}
              />
            </View>
            {showErrorMsg && (
              <Text style={styles.errorText}>
                {strings.otp.incorrect_otp} {3 - invalidOtpCount} {strings.otp.more}{' '}
                {invalidOtpCount == 2 ? 'try' : 'tries'}.
              </Text>
            )}
            {
              <TouchableOpacity
                activeOpacity={1}
                onPress={showResentTimer ? () => {} : onClickResend}
              >
                <Text
                  style={[
                    styles.bottomDescription,
                    showResentTimer
                      ? {
                          opacity: 0.5,
                        }
                      : {},
                  ]}
                >
                  {string.login.resend_opt}
                  {showResentTimer && ' '}
                  {showResentTimer && (
                    <CountDownTimer
                      timer={30}
                      style={{
                        color: theme.colors.LIGHT_BLUE,
                      }}
                      onStopTimer={onStopResendTimer}
                    />
                  )}
                </Text>
              </TouchableOpacity>
            }
            {renderHyperLink()}
          </Card>
        )}
        {onClickOpen && openWebView()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
