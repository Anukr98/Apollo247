import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { CountDownTimer } from '@aph/mobile-patients/src/components/ui/CountDownTimer';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ArrowDisabled,
  ArrowYellow,
  BackArrow,
  Loader,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { LandingDataView } from '@aph/mobile-patients/src/components/ui/LandingDataView';
import { LoginCard } from '@aph/mobile-patients/src/components/ui/LoginCard';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import {
  getNetStatus,
  postAppsFlyerEvent,
  postWebEngageEvent,
  SetAppsFlyerCustID,
  UnInstallAppsFlyer,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  AppState,
  AppStateStatus,
  BackHandler,
  Dimensions,
  EmitterSubscription,
  ImageBackground,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import firebase from 'react-native-firebase';
import Hyperlink from 'react-native-hyperlink';
import SmsRetriever from 'react-native-sms-retriever';
import { WebView } from 'react-native-webview';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { resendOTP, verifyOTP } from '@aph/mobile-patients/src/helpers/loginCalls';
import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  inputView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    height: 56,
    // marginBottom: 8,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  errorText: {
    lineHeight: 24,
    color: theme.colors.INPUT_FAILURE_TEXT,
    ...theme.fonts.IBMPlexSansMedium(12),
    paddingBottom: 3,
    paddingHorizontal: 16,
  },
  bottomDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_INFO,
    ...theme.fonts.IBMPlexSansSemiBold(12),
  },
  codeInputStyle: {
    borderBottomWidth: 2,
    width: '80%',
    margin: 0,
    height: 48,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.LIGHT_BLUE,
    // letterSpacing: 28, // 26
    // paddingLeft: 12, // 25
  },
  viewAbsoluteStyles: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 20,
  },
  gotItStyles: {
    height: 60,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  bannerTitle: {
    color: theme.colors.WHITE,
    ...theme.fonts.IBMPlexSansBold(15),
    marginLeft: 24,
  },
  bannerDescription: {
    ...theme.fonts.IBMPlexSansRegular(12),
    color: theme.colors.WHITE,
    lineHeight: 15,
    marginLeft: 24,
    marginTop: 8,
  },
  bannerWelcome: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    lineHeight: 15,
    color: '#fcb717',
  },
  bannerBoldText: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: theme.colors.WHITE,
    lineHeight: 15,
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
    loginId: string;
  }> {}

export const OTPVerification: React.FC<OTPVerificationProps> = (props) => {
  const [subscriptionId, setSubscriptionId] = useState<EmitterSubscription>();
  const [isValidOTP, setIsValidOTP] = useState<boolean>(false);
  const [invalidOtpCount, setInvalidOtpCount] = useState<number>(0);
  const [showErrorMsg, setShowErrorMsg] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const [intervalId, setIntervalId] = useState<number>(0);
  const [otp, setOtp] = useState<string>('');
  const [isresent, setIsresent] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [onOtpClick, setOnOtpClick] = useState<boolean>(false);
  const [onClickOpen, setonClickOpen] = useState<boolean>(false);
  const [errorpopup, setErrorpopup] = useState<boolean>(false);
  const [showResentTimer, setShowResentTimer] = useState<boolean>(false);
  const [showErrorBottomLine, setshowErrorBottomLine] = useState<boolean>(false);
  const [openFillerView, setOpenFillerView] = useState<boolean>(false);

  const {
    sendOtp,
    signInError,
    getPatientByPrism,
    getFirebaseToken,
    getPatientApiCall,
    setMobileAPICalled,
    setAllPatients,
  } = useAuth();
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);

  const { currentPatient } = useAllCurrentPatients();
  const [isAuthChanged, setAuthChanged] = useState<boolean>(false);

  const client = useApolloClient();

  const handleBack = async () => {
    setonClickOpen(false);
    setOpenFillerView(false);
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    return true;
  };

  useEffect(() => {
    const _didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });

    const _willBlurSubscription = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });

    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, []);

  // const startInterval = useCallback(
  //   (timer: number) => {
  //     const intervalId = setInterval(() => {
  //       timer = timer - 1;
  //       setRemainingTime(timer);
  //       if (timer == 0) {
  //         console.log('descriptionTextStyle remainingTime', remainingTime);
  //         setRemainingTime(0);
  //         setInvalidOtpCount(0);
  //         setIsValidOTP(true);
  //         clearInterval(intervalId);
  //       }
  //     }, 1000);
  //   },
  //   [remainingTime]
  // );

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
      CommonBugFender('OTPVerification_removeFromStore_try', error);
      // setBugFenderLog('OTPVerification_removeFromStore_try', error);
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
      CommonBugFender('OTPVerification_getTimerData_try', error);
      // setBugFenderLog('OTPVerification_getTimerData_try', error);

      // Error retrieving data
      console.log(error.message);
    }
  }, [_removeFromStore, props.navigation.state.params]);

  useEffect(() => {
    // const { otpString } = props.navigation.state.params!;
    // setOtp(otpString);
    // console.log('OTPVerification otpString', otpString);
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
      CommonBugFender('OTPVerification__storeTimerData_try', error);
      // setBugFenderLog('OTPVerification__storeTimerData_try', error);

      console.log(error, 'error');
      // Error saving data
    }
  };

  const navigateTo = (routeName: AppRoutes) => {
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [
          NavigationActions.navigate({
            routeName: routeName,
          }),
        ],
      })
    );
    // props.navigation.replace(AppRoutes.ConsultRoom);
  };

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

  const postOtpSuccessEvent = () => {
    const phoneNumberFromParams = `+91${props.navigation.getParam('phoneNumber')}`;
    const eventAttributes: WebEngageEvents[WebEngageEventName.OTP_VERIFICATION_SUCCESS] = {
      'Mobile Number': phoneNumberFromParams,
    };
    postWebEngageEvent(WebEngageEventName.OTP_VERIFICATION_SUCCESS, eventAttributes);
  };

  const onClickOk = (readOtp?: string) => {
    CommonLogEvent(AppRoutes.OTPVerification, 'OTPVerification clicked');
    const eventAttributes: WebEngageEvents[WebEngageEventName.OTP_ENTERED] = { value: 'Yes' };
    postWebEngageEvent(WebEngageEventName.OTP_ENTERED, eventAttributes);

    try {
      Keyboard.dismiss();

      getNetStatus()
        .then(async (status) => {
          if (status) {
            console.log('otp OTPVerification', otp, otp.length, 'length');
            setshowSpinner(true);
            const { loginId } = props.navigation.state.params!;

            verifyOTP(loginId, readOtp || otp)
              .then((data: any) => {
                console.log(data.status === true, data.status, 'status');

                if (data.status === true) {
                  postOtpSuccessEvent();
                  CommonLogEvent('OTP_ENTERED_SUCCESS', 'SUCCESS');
                  CommonBugFender('OTP_ENTERED_SUCCESS', data as Error);

                  _removeFromStore();
                  setOnOtpClick(true);
                  console.log('error', data.authToken);
                  setshowSpinner(false);
                  setOpenFillerView(true);

                  sendOtp(data.authToken)
                    .then(() => {
                      getAuthToken();
                    })
                    .catch((e) => {
                      CommonBugFender('OTPVerification_sendOtp', e);
                      // setBugFenderLog('OTPVerification_sendOtp', e);
                    });
                } else {
                  console.log('else error');
                  // setBugFenderLog('OTP_ENTERED_WRONG', data.reason as Error);

                  try {
                    setshowErrorBottomLine(true);
                    setOnOtpClick(false);
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
                    CommonBugFender('OTP_ENTERED_try', error);
                    // setBugFenderLog('OTP_ENTERED_try', error);

                    setshowSpinner(false);
                    // console.log(error);
                  }
                }
              })
              .catch((error: Error) => {
                try {
                  console.log({
                    error,
                  });
                  // setBugFenderLog('OTP_ENTERED_FAIL', error);

                  setshowErrorBottomLine(true);
                  setOnOtpClick(false);
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

                  CommonBugFender('OTP_ENTERED_FAIL', error);
                  CommonLogEvent('OTP_ENTERED_FAIL', JSON.stringify(error));
                } catch (error) {
                  CommonBugFender('OTP_ENTERED_FAIL_try', error);
                  // setBugFenderLog('OTP_ENTERED_FAIL_try', error);

                  setshowSpinner(false);
                  console.log(error);
                }
              });
          } else {
            setshowOfflinePopup(true);
          }
        })
        .catch((e) => {
          CommonBugFender('OTPVerification_getNetStatus_onClickOk', e);
          // setBugFenderLog('OTPVerification_getNetStatus_onClickOk', e);
        });
    } catch (error) {
      CommonBugFender('OTPVerification_KEYBOARD_DISMISS', error);
      // setBugFenderLog('OTPVerification_KEYBOARD_DISMISS', error);
    }
  };

  const getAuthToken = () => {
    getFirebaseToken &&
      getFirebaseToken()
        .then((token: any) => {
          console.log('OTPVerificationToken', token);
          getOTPPatientApiCall();
        })
        .catch(async (error) => {
          setOpenFillerView(false);
        });
  };

  const getOTPPatientApiCall = async () => {
    console.log('getOTPPatientApiCall');

    getPatientApiCall()
      .then((data: any) => {
        console.log('getOTPPatientApiCall_OTPVerification', data);
        AsyncStorage.setItem('currentPatient', JSON.stringify(data));
        AsyncStorage.setItem('callByPrism', 'false');
        dataFetchFromMobileNumber(data);
      })
      .catch(async (error) => {
        CommonBugFender('OTPVerification_getOTPPatientApiCall', error);
        console.log('getOTPPatientApiCallerror', error);
        setOpenFillerView(false);
        // setBugFenderLog('OTPVerification_getOTPPatientApiCall', error);
      });
  };

  const dataFetchFromMobileNumber = async (data: any) => {
    const profileData =
      data.data.getPatientByMobileNumber && data.data.getPatientByMobileNumber.patients;
    console.log('dataFetchFromMobileNumber', data);
    if (profileData && profileData.length === 0) {
      getPatientByPrism()
        .then((data: any) => {
          const allPatients =
            data && data.data && data.data.getCurrentPatients
              ? data.data.getCurrentPatients.patients
              : null;

          const mePatient = allPatients
            ? allPatients.find((patient: any) => patient.relation === Relation.ME) || allPatients[0]
            : null;
          // setMobileAPICalled && setMobileAPICalled(true);
          // setAllPatients(allPatients);

          moveScreenForward(mePatient);
        })
        .catch(async (error) => {
          setOpenFillerView(false);
        });
    } else {
      const mePatient = profileData
        ? profileData.find((patient: any) => patient.relation === Relation.ME) || profileData[0]
        : null;
      // setAllPatients(profileData);
      // setMobileAPICalled && setMobileAPICalled(false);

      moveScreenForward(mePatient);
    }
  };

  const postOtpSuccessAppsflyerEvet = (id: string) => {
    const appsflyerEventAttributes: AppsFlyerEvents[AppsFlyerEventName.OTP_VERIFICATION_SUCCESS] = {
      'customer id': id,
    };
    postAppsFlyerEvent(AppsFlyerEventName.OTP_VERIFICATION_SUCCESS, appsflyerEventAttributes);
  };

  const moveScreenForward = (mePatient: any) => {
    AsyncStorage.setItem('logginHappened', 'true');
    setOpenFillerView(false);
    console.log('mePatient-----------------------', mePatient);
    SetAppsFlyerCustID(mePatient.primaryPatientId);
    postOtpSuccessAppsflyerEvet(mePatient.primaryPatientId);
    if (mePatient && mePatient.uhid && mePatient.uhid !== '') {
      if (mePatient.relation == null) {
        const eventAttributes: WebEngageEvents[WebEngageEventName.PRE_APOLLO_CUSTOMER] = {
          value: 'Yes',
        };
        postWebEngageEvent(WebEngageEventName.PRE_APOLLO_CUSTOMER, eventAttributes);
        navigateTo(AppRoutes.MultiSignup);
      } else {
        AsyncStorage.setItem('userLoggedIn', 'true');
        navigateTo(AppRoutes.ConsultRoom);
      }
    } else {
      if (mePatient.firstName == '') {
        const eventAttributes: WebEngageEvents[WebEngageEventName.PRE_APOLLO_CUSTOMER] = {
          value: 'No',
        };
        postWebEngageEvent(WebEngageEventName.PRE_APOLLO_CUSTOMER, eventAttributes);
        navigateTo(AppRoutes.SignUp);
      } else {
        AsyncStorage.setItem('userLoggedIn', 'true');
        navigateTo(AppRoutes.ConsultRoom);
      }
    }
  };

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log('nextAppState :' + nextAppState);
    if (nextAppState === 'active') {
      getTimerData();
    }
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
    getDeviceToken();
    AppState.addEventListener('change', _handleAppStateChange);
    if (Platform.OS === 'android') {
      smsListenerAndroid();
    }
    return () => {
      if (Platform.OS === 'android') {
        SmsRetriever.removeSmsListener();
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      subscriptionId && subscriptionId.remove();
      // backHandler && backHandler.remove();
    };
  }, [subscriptionId]);

  const getDeviceToken = () => {
    firebase
      .messaging()
      .getToken()
      .then((token) => {
        console.log('token', token);
        AsyncStorage.setItem('deviceToken', JSON.stringify(token));
        UnInstallAppsFlyer(token);
      })
      .catch((e) => {
        CommonBugFender('OTPVerification_getDeviceToken', e);
      });
  };

  const onStopTimer = () => {
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
    try {
      CommonLogEvent(AppRoutes.OTPVerification, 'Resend Otp clicked');

      getNetStatus()
        .then((status) => {
          if (status) {
            setIsresent(true);
            setOtp('');
            Keyboard.dismiss();
            const { phoneNumber } = props.navigation.state.params!;
            console.log('onClickResend', phoneNumber);

            const { loginId } = props.navigation.state.params!;

            resendOTP('+91' + phoneNumber, loginId)
              .then((resendResult: any) => {
                console.log('resendOTP ', resendResult.loginId);

                props.navigation.setParams({ loginId: resendResult.loginId });

                CommonBugFender('OTP_RESEND_SUCCESS', resendResult as Error);
                // setBugFenderLog('OTP_RESEND_SUCCESS', resendResult as Error);

                setShowResentTimer(true);
                console.log('confirmResult login', resendResult);
              })
              .catch((error: Error) => {
                console.log(error, 'error');
                console.log(error.message, 'errormessage');
                CommonBugFender('OTP_RESEND_FAIL', error);
                // setBugFenderLog('OTP_RESEND_FAIL', error);

                Alert.alert('Error', 'The interaction was cancelled by the user.');
              });
          } else {
            setshowOfflinePopup(true);
          }
        })
        .catch((e) => {
          CommonBugFender('OTPVerification_getNetStatus', e);
          // setBugFenderLog('OTPVerification_getNetStatus', e);
        });
    } catch (error) {}
  };

  const openWebView = () => {
    CommonLogEvent(AppRoutes.OTPVerification, 'Terms  Conditions clicked');
    Keyboard.dismiss();
    return (
      <View style={styles.viewAbsoluteStyles}>
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
              uri: 'https://www.apollo247.com/terms',
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
          marginTop: 12,
          marginHorizontal: 16,
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
            By signing up, I agree to the https://www.apollo247.com/TnC.html of Apollo247
          </Text>
        </Hyperlink>
      </View>
    );
  };

  const fillerView = () => {
    return (
      <View style={styles.viewAbsoluteStyles}>
        <View
          style={{
            flex: 1,
            overflow: 'hidden',
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ApolloLogo />
          <Loader style={{ marginTop: 12, height: 26, width: 76 }} />
          <Text
            style={{
              marginTop: 22,
              color: '#02475b',
              ...theme.fonts.IBMPlexSansBold(17),
              lineHeight: 24,
              textAlign: 'center',
            }}
          >
            Please Wait!
          </Text>
          <Text
            style={{
              marginTop: 4,
              color: '#02475b',
              ...theme.fonts.IBMPlexSansRegular(17),
              lineHeight: 24,
              textAlign: 'center',
            }}
          >
            {`While we're fetching\nyour details`}
          </Text>
        </View>
      </View>
    );
  };

  const banner_image = require('@aph/mobile-patients/src/images/onboard/onboard_banner.png');
  const banner = () => {
    return (
      <ImageBackground
        source={banner_image}
        style={{ height: 105, marginTop: 20, marginHorizontal: 10 }}
      >
        <View style={{ padding: 16 }}>
          <Text style={styles.bannerTitle}>Specially for you :)</Text>
          <Text style={styles.bannerDescription}>
            Use coupon code ‘<Text style={styles.bannerWelcome}>CARE247</Text>
            {'’ for\n'}
            <Text style={styles.bannerBoldText}>Rs. 149 off</Text> on your 1st doctor
            {'\n'}consultation, <Text style={styles.bannerBoldText}> 10% off</Text> on medicines
          </Text>
        </View>
      </ImageBackground>
    );
  };

  // const renderTime = () => {
  //   console.log(remainingTime, 'remainingTime', timer, 'timer');

  //   const minutes = Math.floor(timer / 60);
  //   const seconds = timer - minutes * 60;

  //   return `${minutes.toString().length < 2 ? '0' + minutes : minutes} : ${
  //     seconds.toString().length < 2 ? '0' + seconds : seconds
  //   }`;
  // };
  // console.log(isSigningIn, currentPatient, isVerifyingOtp);
  const { phoneNumber } = props.navigation.state.params!;
  const descriptionPhoneText = `Now enter the OTP sent to +91 ${phoneNumber} for authentication`;
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
            }}
          >
            <BackArrow />
          </TouchableOpacity>
        </View>
        {invalidOtpCount === 3 && !isValidOTP ? (
          <LoginCard
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
              {/* <OTPTextView
                handleTextChange={(otp: string) => setOtp(otp)}
                inputCount={6}
                keyboardType="numeric"
                value={otp}
                textInputStyle={styles.codeInputStyle}
                tintColor={'rgba(0, 179, 142, 0.4)'}
                containerStyle={{
                  flex: 1,
                }}
                editable={false}
              /> */}
            </View>

            <Text style={[styles.errorText]}>
              Try again after —{' '}
              <CountDownTimer
                timer={remainingTime}
                style={[styles.errorText]}
                onStopTimer={onStopTimer}
              />
            </Text>
            {renderHyperLink()}
          </LoginCard>
        ) : (
          <LoginCard
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
            description={isresent ? string.login.resend_otp_text : descriptionPhoneText}
            buttonIcon={
              isValidOTP && otp.length === 6 ? (
                <ArrowYellow size="md_l" />
              ) : (
                <ArrowDisabled size="md_l" />
              )
            }
            onClickButton={() => onClickOk()}
            buttonStyle={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 156 : 164,
              right: -3,
              height: 64,
              width: 64,
              zIndex: 20,
            }}
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
                maxLength={6}
              />
              {/* <OTPTextView
                handleTextChange={isOtpValid}
                inputCount={6}
                keyboardType="numeric"
                value={otp}
                textInputStyle={styles.codeInputStyle}
                tintColor={
                  otp.length != 6 && invalidOtpCount >= 1
                    ? theme.colors.INPUT_BORDER_FAILURE
                    : theme.colors.INPUT_BORDER_SUCCESS
                }
                containerStyle={{
                  flex: 1,
                }}
              /> */}
            </View>
            {showErrorMsg && (
              <Text style={styles.errorText}>
                Incorrect OTP. You have {3 - invalidOtpCount} more{' '}
                {invalidOtpCount == 2 ? 'try' : 'tries'}.
              </Text>
            )}
            {
              <TouchableOpacity
                activeOpacity={1}
                onPress={showResentTimer ? () => {} : onClickResend}
                style={{ width: '50%', paddingLeft: 16, paddingTop: 12 }}
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
          </LoginCard>
        )}
        <ScrollView bounces={false}>
          {/* <View> */}
          {banner()}
          <LandingDataView />
          {/* </View> */}
        </ScrollView>
        {onClickOpen && openWebView()}
        {openFillerView && fillerView()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
      {errorpopup && (
        <BottomPopUp
          title={`Hi :(`}
          description={
            'The sms code has expired. Please re-send the verification code to try again.'
          }
        >
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 20,
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
            }}
          >
            <View
              style={{
                height: 60,
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={styles.gotItStyles}
                onPress={() => {
                  setErrorpopup(false);
                }}
              >
                <Text style={styles.gotItTextStyles}>{'OK, GOT IT'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomPopUp>
      )}
    </View>
  );
};
