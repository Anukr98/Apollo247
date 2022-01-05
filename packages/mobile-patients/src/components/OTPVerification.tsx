import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { LoginCard } from '@aph/mobile-patients/src/components/ui/LoginCard';
import { CountDownTimer } from '@aph/mobile-patients/src/components/ui/CountDownTimer';
import {
  BackArrow,
  Loader,
  ArrowDisabled,
  ArrowYellow,
  WhiteCallIcon,
  CheckBox as CheckBoxEmpty,
  CheckBoxFilled,
} from '@aph/mobile-patients/src/components/ui/Icons';
import LandingDataView from '@aph/mobile-patients/src/components/ui/LandingDataView';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonBugFender,
  CommonLogEvent,
  setBugFenderLog,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getNetStatus,
  postWebEngageEvent,
  postAppsFlyerEvent,
  SetAppsFlyerCustID,
  UnInstallAppsFlyer,
  postFirebaseEvent,
  setFirebaseUserId,
  setCrashlyticsAttributes,
  onCleverTapUserLogin,
  postCleverTapEvent,
  deferredDeepLinkRedirectionData,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useCallback, useEffect, useState } from 'react';
import { CheckBox } from 'react-native-elements';
import {
  Alert,
  BackHandler,
  Dimensions,
  EmitterSubscription,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AppState,
  AppStateStatus,
  TextInput,
} from 'react-native';
import { timeDifferenceInDays } from '@aph/mobile-patients/src/utils/dateUtil';
import firebaseAuth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { verifyOTP, resendOTP, getOtpOnCall } from '@aph/mobile-patients/src/helpers/loginCalls';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { useApolloClient } from 'react-apollo-hooks';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import AsyncStorage from '@react-native-community/async-storage';
import SmsRetriever from 'react-native-sms-retriever';
import {
  saveTokenDevice,
  phrNotificationCountApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount } from '@aph/mobile-patients/src/graphql/types/getUserNotifyEvents';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { FetchingDetails } from '@aph/mobile-patients/src/components/ui/FetchingDetails';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { colors } from '../theme/colors';
import OTPInputView from '@twotalltotems/react-native-otp-input'

const { height, width } = Dimensions.get('window');



let timer = 120;
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
  const [isTandCSelected, setTandC] = useState<boolean>(true);
  const [isValidOTP, setIsValidOTP] = useState<boolean>(false);
  const [invalidOtpCount, setInvalidOtpCount] = useState<number>(0);
  const [showErrorMsg, setShowErrorMsg] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(30);
  const [intervalId, setIntervalId] = useState<number>(0);
  const [otp, setOtp] = useState<string>('');
  const [isresent, setIsresent] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [onOtpClick, setOnOtpClick] = useState<boolean>(false);
  const [errorpopup, setErrorpopup] = useState<boolean>(false);
  const [showResentTimer, setShowResentTimer] = useState<boolean>(false);
  const [showErrorBottomLine, setshowErrorBottomLine] = useState<boolean>(false);
  const [openFillerView, setOpenFillerView] = useState<boolean>(false);
  const [disableOtpOnCallCta, setDisableOtpOnCallCta] = useState<boolean>(false);
  const [showOtpOnCallCta, setShowOtpOnCallCta] = useState<boolean>(false);
  const [resendOtpSection, setResendOtpSection] = useState<boolean>(false)
  const [otpStatus, setOtpStatus] = useState<string>(string.login.otp_sent_to)

  const styles = StyleSheet.create({
    container: {
      ...theme.viewStyles.container,
      backgroundColor: colors.WHITE
    },
    inputView: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      height: 56,
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
      width: width - 135,
      margin: 0,
      height: 48,
      borderColor: theme.colors.INPUT_BORDER_SUCCESS,
      ...theme.fonts.IBMPlexSansMedium(18),
      color: theme.colors.LIGHT_BLUE,
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
    hyperlink: {
      color: theme.colors.PURPLE,
      ...fonts.IBMPlexSansBold(10),
      textDecorationLine: 'underline',
    },
    otpOnCallContainer: {
      marginTop: 15,
    },
    otpOnCallButton: {
      ...theme.viewStyles.cardViewStyle,
      flexDirection: 'row',
      borderColor: '#FCB716',
      borderWidth: 2,
      paddingVertical: 4,
      justifyContent: 'center',
      paddingHorizontal: 10,
      elevation: 0,
      shadowColor: colors.WHITE,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0,
      shadowOpacity: 0
    },
    otpOnCallIcon: {
      resizeMode: 'contain',
      width: 25,
      height: 25,
      transform: [{ rotate: '230deg' }],
      marginRight: 10,
    },
    otpOnCallText: {
      ...theme.viewStyles.text('B', 14, '#FFFFFF', 1, 25, 0.35),
      textAlign: 'center',
      color: '#FCB716'
    },
    horizontalLine: {
      borderBottomColor: 'black',
      opacity: 0.35,
      borderBottomWidth: 0.5,
      width: '45%',
      marginVertical: 10,
    },
    checkBoxContainer: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      margin: 0,
    },
    checkBoxStyle: {
      resizeMode: 'contain',
      width: 20,
      height: 20,
    },
    inputContainer: {
      borderWidth: 1,
      borderColor: colors.LIGHT_BLUE,
      borderRadius: 4,
      color: colors.LIGHT_BLUE
    },
    otpTitle: {
      ...theme.viewStyles.text('B', 18, colors.LIGHT_BLUE, 1)
    },
    otpDescription: {
      ...theme.viewStyles.text('R', 14, colors.SLATE_GRAY, 1),
      textAlign: 'center'
    },
    otpStatus: {
      ...theme.viewStyles.text(
        'M',
        otpStatus === (string.login.otp_sent_to || string.login.otp_resent_on_sms || string.login.otp_resent_on_call) ? 14 : 12,
        (otpStatus === string.login.otp_sent_to || otpStatus === string.login.auto_verfying_otp) ? colors.LIGHT_BLUE : (otpStatus === string.login.otp_resent_on_sms || otpStatus === string.login.otp_resent_on_call) ? colors.GREEN : theme.colors.INPUT_FAILURE_TEXT
      )
    }
  });

  const {
    sendOtp,
    signInError,
    getPatientByPrism,
    getFirebaseToken,
    getPatientApiCall,
  } = useAuth();
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);

  const [isAuthChanged, setAuthChanged] = useState<boolean>(false);

  const client = useApolloClient();
  const { setPhrNotificationData } = useAppCommonData();

  const handleBack = async () => {
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

  const _removeFromStore = useCallback(async () => {
    try {
      const { phoneNumber } = props.navigation.state.params!;
      const getData = await AsyncStorage.getItem('timeOutData');
      if (getData) {
        const timeOutData = JSON.parse(getData);
        const filteredData = timeOutData.filter(
          (el: timeOutDataType) => el.phoneNumber !== phoneNumber
        );
        await AsyncStorage.setItem('timeOutData', JSON.stringify(filteredData));
      }
    } catch (error) {
      CommonBugFender('OTPVerification_removeFromStore_try', error);
    }
  }, [props.navigation.state.params]);

  const getTimerData = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('timeOutData');
      if (data) {
        const timeOutData = JSON.parse(data);
        const { phoneNumber } = props.navigation.state.params!;

        timeOutData.map((obj: timeOutDataType) => {
          if (obj.phoneNumber === phoneNumber) {
            const t1 = new Date();
            const t2 = new Date(obj.startTime);
            const dif = t1.getTime() - t2.getTime();

            const seconds = Math.ceil(dif / 1000);
            if (obj.invalidAttems === 3) {
              if (seconds < 120) {
                setInvalidOtpCount(3);
                setIsValidOTP(false);
                timer = 120 - seconds;
                setRemainingTime(30);
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
    }
  }, [_removeFromStore, props.navigation.state.params]);

  useEffect(() => {
    setTimeout(() => {
      setShowOtpOnCallCta(true);
    }, 10000);
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

      await AsyncStorage.setItem('timeOutData', JSON.stringify(timeOutData));
    } catch (error) {
      CommonBugFender('OTPVerification__storeTimerData_try', error);
    }
  };

  const navigateTo = (
    routeName: AppRoutes,
    parmas?: { previousRoute: string } | null | undefined,
    signup?: boolean
  ) => {
    if (signup === true) {
      setOpenFillerView(false);
      props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          key: null,
          actions: [
            NavigationActions.navigate({
              routeName: routeName,
              params: parmas ? parmas : {},
            }),
          ],
        })
      );
    } else {
      deferredDeepLinkRedirectionData(
        props.navigation,
        () => {
          setOpenFillerView(false);
          props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              key: null,
              actions: [
                NavigationActions.navigate({
                  routeName: routeName,
                  params: parmas ? parmas : {},
                }),
              ],
            })
          );
        },
        () => {
          setOpenFillerView(false);
        }
      );
    }
  };

  useEffect(() => {
    if (signInError && otp.length === 6) {
    }
  }, [signInError, props.navigation, otp.length]);

  useEffect(() => {
    const authListener = firebaseAuth().onAuthStateChanged((user) => {
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
    AsyncStorage.setItem('APP_OPENED', 'true');
    postWebEngageEvent(WebEngageEventName.OTP_VERIFICATION_SUCCESS, eventAttributes);
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.OTP_VERIFICATION_SUCCESS] = {
      'Mobile Number': phoneNumberFromParams,
      'Nav src': 'App login screen',
      'Page Name': 'OTP Verification Screen',
    };
    postCleverTapEvent(CleverTapEventName.OTP_VERIFICATION_SUCCESS, cleverTapEventAttributes);
  };

  const onClickOk = (readOtp?: string) => {
    CommonLogEvent(AppRoutes.OTPVerification, 'OTPVerification clicked');
    const eventAttributes: WebEngageEvents[WebEngageEventName.OTP_ENTERED] = { value: 'Yes' };
    const phoneNumberFromParams = `+91${props.navigation.getParam('phoneNumber')}`;
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.OTP_ENTERED] = {
      'Mobile Number': phoneNumberFromParams,
      'Nav src': 'App login screen',
      'Page Name': 'OTP Verification Screen',
      value: 'Yes',
    };
    postCleverTapEvent(CleverTapEventName.OTP_ENTERED, cleverTapEventAttributes);
    postWebEngageEvent(WebEngageEventName.OTP_ENTERED, eventAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.OTP_ENTERED, eventAttributes);
    postFirebaseEvent(FirebaseEventName.OTP_ENTERED, eventAttributes);
    try {
      Keyboard.dismiss();

      getNetStatus()
        .then(async (status) => {
          if (status) {
            setshowSpinner(true);
            const { loginId } = props.navigation.state.params!;

            verifyOTP(loginId, readOtp || otp)
              .then((data: any) => {
                if (data.status === true) {
                  postOtpSuccessEvent();
                  CommonLogEvent('OTP_ENTERED_SUCCESS', 'SUCCESS');
                  CommonBugFender('OTP_ENTERED_SUCCESS', data as Error);

                  _removeFromStore();
                  setOnOtpClick(true);
                  setshowSpinner(false);
                  setOpenFillerView(true);

                  sendOtp(data.authToken)
                    .then(() => {
                      getAuthToken();
                    })
                    .catch((e) => {
                      CommonBugFender('OTPVerification_sendOtp', e);
                    });
                } else {
                  try {
                    setOtpStatus(`Incorrect OTP. You have ${3 - invalidOtpCount} more ${invalidOtpCount == 2 ? 'try' : 'tries'}.`)
                    setshowErrorBottomLine(true);
                    setOnOtpClick(false);
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
                    CommonBugFender('OTP_ENTERED_try', error);
                    setshowSpinner(false);
                  }
                }
              })
              .catch((error: Error) => {
                try {
                  postFirebaseEvent(FirebaseEventName.OTP_VALIDATION_FAILED, {});
                  postAppsFlyerEvent(AppsFlyerEventName.OTP_VALIDATION_FAILED, {});
                  setshowErrorBottomLine(true);
                  setOnOtpClick(false);
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

                  CommonBugFender('OTP_ENTERED_FAIL', error);
                  CommonLogEvent('OTP_ENTERED_FAIL', JSON.stringify(error));
                } catch (error) {
                  CommonBugFender('OTP_ENTERED_FAIL_try', error);
                  setshowSpinner(false);
                }
              });
          } else {
            setshowOfflinePopup(true);
          }
        })
        .catch((e) => {
          CommonBugFender('OTPVerification_getNetStatus_onClickOk', e);
        });
    } catch (error) {
      CommonBugFender('OTPVerification_KEYBOARD_DISMISS', error);
    }
  };

  const getAuthToken = () => {
    getFirebaseToken &&
      getFirebaseToken()
        .then((token: any) => {
          getOTPPatientApiCall();
        })
        .catch(async (error) => {
          setOpenFillerView(false);
        });
  };

  const getOTPPatientApiCall = async () => {
    getPatientApiCall()
      .then((data: any) => {
        AsyncStorage.setItem('currentPatient', JSON.stringify(data));
        AsyncStorage.setItem('callByPrism', 'false');
        dataFetchFromMobileNumber(data);
      })
      .catch(async (error) => {
        CommonBugFender('OTPVerification_getOTPPatientApiCall', error);
        setOpenFillerView(false);
      });
  };

  const dataFetchFromMobileNumber = async (data: any) => {
    const profileData =
      data.data.getPatientByMobileNumber && data.data.getPatientByMobileNumber.patients;
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
          moveScreenForward(mePatient);
        })
        .catch(async (error) => {
          setOpenFillerView(false);
        });
    } else {
      const mePatient = profileData
        ? profileData.find((patient: any) => patient.relation === Relation.ME) || profileData[0]
        : null;
      moveScreenForward(mePatient);
    }
  };

  const postOtpSuccessAppsflyerEvet = (id: string) => {
    const appsflyerEventAttributes: AppsFlyerEvents[AppsFlyerEventName.OTP_VERIFICATION_SUCCESS] = {
      'customer id': id,
    };
    postAppsFlyerEvent(AppsFlyerEventName.OTP_VERIFICATION_SUCCESS, appsflyerEventAttributes);
  };

  const callPhrNotificationApi = async (currentPatient: any) => {
    phrNotificationCountApi(client, currentPatient || '')
      .then((newRecordsCount) => {
        if (newRecordsCount) {
          setPhrNotificationData &&
            setPhrNotificationData(
              newRecordsCount! as getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount
            );
        }
      })
      .catch((error) => {
        CommonBugFender('SplashcallPhrNotificationApi', error);
      });
  };
  const fireUserLoggedInEvent = (mePatient: any, type: 'Registration' | 'Login') => {
    setFirebaseUserId(mePatient.id);
    setCrashlyticsAttributes(mePatient);
    const firebaseAttributes: FirebaseEvents[FirebaseEventName.USER_LOGGED_IN] = {
      Type: type,
      userId: mePatient.id,
    };
    postFirebaseEvent(FirebaseEventName.USER_LOGGED_IN, firebaseAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.USER_LOGGED_IN, firebaseAttributes);
  };

  const moveScreenForward = (mePatient: any) => {
    AsyncStorage.setItem('logginHappened', 'true');
    // commenting this to avoid setting of AppFlyerCustId twice
    // SetAppsFlyerCustID(mePatient.primaryPatientId);
    postOtpSuccessAppsflyerEvet(mePatient.primaryPatientId);
    if (mePatient && mePatient.uhid && mePatient.uhid !== '') {
      if (mePatient.relation == null) {
        const eventAttributes: WebEngageEvents[WebEngageEventName.PRE_APOLLO_CUSTOMER] = {
          value: 'Yes',
        };
        postWebEngageEvent(WebEngageEventName.PRE_APOLLO_CUSTOMER, eventAttributes);
        navigateTo(AppRoutes.MultiSignup, null, true);
      } else {
        AsyncStorage.setItem('userLoggedIn', 'true');
        onCleverTapUserLogin(mePatient);
        deviceTokenAPI(mePatient.id);
        callPhrNotificationApi(mePatient?.id);
        fireUserLoggedInEvent(mePatient, 'Login');
        navigateTo(AppRoutes.HomeScreen, {
          previousRoute: 'Login',
        });
      }
    } else {
      if (mePatient.firstName == '') {
        const eventAttributes: WebEngageEvents[WebEngageEventName.PRE_APOLLO_CUSTOMER] = {
          value: 'No',
        };
        postWebEngageEvent(WebEngageEventName.PRE_APOLLO_CUSTOMER, eventAttributes);
        navigateTo(AppRoutes.SignUp, null, true);
        fireUserLoggedInEvent(mePatient, 'Registration');
      } else {
        AsyncStorage.setItem('userLoggedIn', 'true');
        onCleverTapUserLogin(mePatient);
        deviceTokenAPI(mePatient.id);
        callPhrNotificationApi(mePatient?.id);
        navigateTo(AppRoutes.HomeScreen, {
          previousRoute: 'Login',
        });
        fireUserLoggedInEvent(mePatient, 'Login');
      }
    }
  };

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
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
            if (event.message) {
              const messageOTP = event.message.match(/[0-9]{6}/g);
              if (messageOTP) {
                setOtpStatus(string.login.auto_verfying_otp)
                isOtpValid(messageOTP[0]);
                onClickOk(messageOTP[0]);
              }
            }
            SmsRetriever.removeSmsListener();
          });
        }
      } catch (error) {}
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
    };
  }, [subscriptionId]);

  const getDeviceToken = async () => {
    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const currentDeviceToken = deviceToken ? JSON.parse(deviceToken) : '';
    const deviceTokenTimeStamp = (await AsyncStorage.getItem('deviceTokenTimeStamp')) || '';
    const currentDeviceTokenTimeStamp = deviceTokenTimeStamp
      ? JSON.parse(deviceTokenTimeStamp)
      : '';
    if (
      !currentDeviceToken ||
      typeof currentDeviceToken != 'string' ||
      typeof currentDeviceToken == 'object' ||
      !currentDeviceTokenTimeStamp ||
      currentDeviceTokenTimeStamp === '' ||
      currentDeviceTokenTimeStamp?.length == 0 ||
      typeof currentDeviceTokenTimeStamp != 'number' ||
      timeDifferenceInDays(new Date().getTime(), currentDeviceTokenTimeStamp) > 6
    ) {
      messaging()
        .getToken()
        .then((token) => {
          AsyncStorage.setItem('deviceToken', JSON.stringify(token));
          AsyncStorage.setItem('deviceTokenTimeStamp', JSON.stringify(new Date().getTime()));
          UnInstallAppsFlyer(token);
        })
        .catch((e) => {
          CommonBugFender('OTPVerification_getDeviceToken', e);
        });
    }
  };

  const deviceTokenAPI = async (patientId: string) => {
    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const deviceToken2 = deviceToken ? JSON.parse(deviceToken) : '';
    const deviceTokenTimeStamp = (await AsyncStorage.getItem('deviceTokenTimeStamp')) || '';
    const currentDeviceTokenTimeStamp = deviceTokenTimeStamp
      ? JSON.parse(deviceTokenTimeStamp)
      : '';
    if (
      !deviceToken2 ||
      deviceToken2 === '' ||
      deviceToken2.length == 0 ||
      typeof deviceToken2 != 'string' ||
      typeof deviceToken2 == 'object' ||
      !currentDeviceTokenTimeStamp ||
      currentDeviceTokenTimeStamp === '' ||
      currentDeviceTokenTimeStamp?.length == 0 ||
      typeof currentDeviceTokenTimeStamp != 'number' ||
      timeDifferenceInDays(new Date().getTime(), currentDeviceTokenTimeStamp) > 6
    ) {
      messaging()
        .getToken()
        .then((token) => {
          AsyncStorage.setItem('deviceToken', JSON.stringify(token));
          saveTokenDevice(client, token, patientId)
            ?.then((resp) => {
              AsyncStorage.setItem('deviceTokenTimeStamp', JSON.stringify(new Date().getTime()));
            })
            .catch((e) => {
              CommonBugFender('OTPVerification_saveTokenDevice', e);
              AsyncStorage.setItem('deviceToken', '');
            });
        })
        .catch((e) => {
          CommonBugFender('OTPVerification_getDeviceToken', e);
        });
    } else {
      saveTokenDevice(client, deviceToken2, patientId)
        ?.then((resp) => {})
        .catch((e) => {
          CommonBugFender('OTPVerification_saveTokenDevice', e);
          AsyncStorage.setItem('deviceToken', '');
        });
    }
  };

  const onStopTimer = () => {
    setRemainingTime(30);
    setShowErrorMsg(false);
    setInvalidOtpCount(0);
    setIsValidOTP(true);
    clearInterval(intervalId);
    _removeFromStore();
    setResendOtpSection(true)
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
            setResendOtpSection(false)
            setIsresent(true);
            setOtp('');
            Keyboard.dismiss();
            const { phoneNumber } = props.navigation.state.params!;
            const { loginId } = props.navigation.state.params!;

            resendOTP('+91' + phoneNumber, loginId)
              .then((resendResult: any) => {
                props.navigation.setParams({ loginId: resendResult.loginId });
                setOtpStatus(string.login.otp_resent_on_sms)
                CommonBugFender('OTP_RESEND_SUCCESS', resendResult as Error);
                setShowResentTimer(true);
                setTimeout(() => {
                  setOtpStatus(string.login.auto_verfying_otp)
                }, 1500);
              })
              .catch((error: Error) => {
                CommonBugFender('OTP_RESEND_FAIL', error);

                Alert.alert('Error', 'The interaction was cancelled by the user.');
              });
          } else {
            setshowOfflinePopup(true);
          }
        })
        .catch((e) => {
          CommonBugFender('OTPVerification_getNetStatus', e);
        });
    } catch (error) {}
  };

  const onGetOtpOnCall = () => {
    try {
      setDisableOtpOnCallCta(true);
      CommonLogEvent(AppRoutes.OTPVerification, 'Get OTP On Call Clicked');
      getNetStatus()
        .then((status) => {
          if (status) {
            setResendOtpSection(false)
            setOtp('');
            Keyboard.dismiss();
            const { phoneNumber } = props.navigation.state.params!;
            const { loginId } = props.navigation.state.params!;
            cleverTapEventForGetOTPonCall({
              mobileNumber: phoneNumber,
              loginId,
            });
            getOtpOnCall('+91' + phoneNumber, loginId)
              .then((otpOnCallResult: any) => {
                const phoneNumberFromParams = `+91${props.navigation.getParam('phoneNumber')}`;
                const eventAttributes: WebEngageEvents[WebEngageEventName.OTP_ON_CALL_CLICK] = {
                  'Mobile Number': phoneNumberFromParams,
                };
                postWebEngageEvent(WebEngageEventName.OTP_ON_CALL_CLICK, eventAttributes);
                if (otpOnCallResult?.status) {
                  setOtpStatus(string.login.otp_resent_on_call)
                  CommonBugFender('GET_OTP_ON_CALL_SUCCESS', otpOnCallResult);
                  setBugFenderLog('GET_OTP_ON_CALL_SUCCESS', otpOnCallResult);
                  props.navigation.setParams({ loginId: otpOnCallResult?.loginId });
                  setTimeout(() => {
                    setDisableOtpOnCallCta(false);
                  }, 10000);
                } else {
                  CommonBugFender('GET_OTP_ON_CALL_FAIL', otpOnCallResult);
                  setBugFenderLog('GET_OTP_ON_CALL_FAIL', otpOnCallResult);
                  setDisableOtpOnCallCta(false);
                  Alert.alert('Error', 'Something went wrong, please try again after sometime');
                }
              })
              .catch((error: Error) => {
                setDisableOtpOnCallCta(false);
                CommonBugFender('GET_OTP_ON_CALL_FAIL', error);
                setBugFenderLog('GET_OTP_ON_CALL_FAIL', error);
                Alert.alert('Error', 'The interaction was cancelled by the user.');
              });
          } else {
            setDisableOtpOnCallCta(false);
            setshowOfflinePopup(true);
          }
        })
        .catch((e) => {
          setDisableOtpOnCallCta(false);
          CommonBugFender('onGetOtpOnCall_getNetStatus', e);
          setBugFenderLog('onGetOtpOnCall_getNetStatus', e);
        });
    } catch (error) {
      setDisableOtpOnCallCta(false);
    }
  };

  const cleverTapEventForGetOTPonCall = (data: {
    mobileNumber?: string | number;
    loginId?: string | number;
  }) => {
    let eventAttributes = {
      'Mobile Number': data.mobileNumber,
      'Nav Source': 'Login Screen',
    };
    postCleverTapEvent(CleverTapEventName.GET_OTP_ON_CALL, eventAttributes);
  };

  const openWebViewTandC = () => {
    CommonLogEvent(AppRoutes.OTPVerification, 'Terms  Conditions clicked');
    Keyboard.dismiss();
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.APOLLO_TERMS_CONDITIONS,
      isGoBack: true,
    });
  };

  const openWebViewPrivacyPolicy = () => {
    CommonLogEvent(AppRoutes.OTPVerification, 'Privacy Policy clicked');
    Keyboard.dismiss();
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.APOLLO_PRIVACY_POLICY,
      isGoBack: true,
    });
  };

  const renderHyperLink = () => {
    return (
      <View style={{ flexDirection: 'row', marginLeft: 5, marginTop: 12}}>
      <CheckBox
        checked={isTandCSelected}
        onPress={() => setTandC(!isTandCSelected)}
        checkedIcon={<CheckBoxFilled  style={styles.checkBoxStyle} />}
        uncheckedIcon={<CheckBoxEmpty style={styles.checkBoxStyle} />}
        containerStyle={styles.checkBoxContainer}
      />
      <Text
        style={{
          color: '#02475b',
          marginEnd: 45,
          ...fonts.IBMPlexSansMedium(10),
        }}
      >
        {string.login.bySigningUp}{' '}
        <Text style={styles.hyperlink} onPress={() => openWebViewTandC()}>
          {string.login.termsAndCondition}
        </Text>{' '}
        {string.login.and}{' '}
        <Text style={styles.hyperlink} onPress={() => openWebViewPrivacyPolicy()}>
          {string.login.privacyPolicy}
        </Text>{' '}
        {string.login.ofApollo247}
      </Text>
    </View>
    );
  };

  const renderOtpOnCall = () => (
    <View style={styles.otpOnCallContainer}>
      <TouchableOpacity
        disabled={disableOtpOnCallCta}
        onPress={onGetOtpOnCall}
        activeOpacity={0.5}
        style={[
          styles.otpOnCallButton,
        ]}
      >
        <Text
          style={[
            styles.otpOnCallText,
          ]}
        >
          Resend on Call
        </Text>
      </TouchableOpacity>
    </View>
  );

  const { phoneNumber } = props.navigation.state.params!;
  const descriptionPhoneText = `Now enter the OTP sent to +91 ${phoneNumber} for authentication`;
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={{ alignItems: 'center', paddingTop: 10 }}>
          <ApolloLogo style={{ width: 55, height: 47 }} resizeMode="contain" />
        </View>
        <View style={{ width: '90%', alignSelf: 'center' }}>
          <View style={{ marginTop: "10%", alignItems: 'center' }}>
            <View><Text style={styles.otpTitle}>Enter OTP</Text></View>
            <View style={{ marginTop: '3%' }}>
              <Text style={styles.otpDescription}>{string.login.otp_placeholder}</Text>
            </View>
          </View>
          <View style={{ marginTop: '12%' }}>
            <Text style={styles.otpStatus}>{otpStatus}</Text>
          </View>
          <View>
            <OTPInputView
              style={{ width: '100%', height: 100 }}
              pinCount={6}
              autoFocusOnLoad
              code={otp}
              onCodeFilled={onClickOk}
              codeInputFieldStyle={styles.inputContainer}
              onCodeChanged={code => setOtp(code)}
              editable={invalidOtpCount <= 3}
            />
          </View>
          {/* {showErrorMsg && (
            <Text style={styles.errorText}>
              Incorrect OTP. You have {3 - invalidOtpCount} more{' '}
              {invalidOtpCount == 2 ? 'try' : 'tries'}.
            </Text>
          )} */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {
              !resendOtpSection ? (
                <>
                <Text style={theme.viewStyles.text('M', 14, colors.LIGHT_BLUE, 1)}>Resend the OTP in</Text>
                <CountDownTimer
                  timer={remainingTime}
                  style={theme.viewStyles.text('M', 12, colors.LIGHT_BLUE, 1)}
                  onStopTimer={onStopTimer}
                  showSeconds
                />
                </>
              ) : (
                <View style={{ width: '100%' }}>
                  <Text style={theme.viewStyles.text('M', 15, colors.LIGHT_BLUE, 1)}>{string.login.otp_not_received}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    {renderOtpOnCall()}
                    <View style={styles.otpOnCallContainer}>
                      <TouchableOpacity
                        style={styles.otpOnCallButton}
                        onPress={onClickResend}
                        activeOpacity={.5}
                      >
                        <Text style={styles.otpOnCallText}>Resend on SMS</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            }
          </View>
        </View>
        {/* <View
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
        </View> */}

        {/* {invalidOtpCount === 3 && !isValidOTP ? (
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
              paddingBottom: 12,
            }}
            headingTextStyle={{
              marginTop: 10,
            }}
            heading={string.login.great}
            description={isresent ? string.login.resend_otp_text : descriptionPhoneText}
            buttonIcon={
              isValidOTP && otp.length === 6 && isTandCSelected ? (
                <ArrowYellow size="md_l" />
              ) : (
                <ArrowDisabled size="md_l" />
              )
            }
            onClickButton={() => onClickOk()}
            disableButton={isValidOTP && otp.length === 6 && isTandCSelected ? false : true}
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
        )} */}
        {/* {showOtpOnCallCta && renderOtpOnCall()} */}
        {/* <LandingDataView /> */}
        {openFillerView && <FetchingDetails />}
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
