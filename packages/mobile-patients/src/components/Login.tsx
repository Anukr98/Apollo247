import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { timeOutDataType } from '@aph/mobile-patients/src/components/OTPVerification';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppSignature } from '@aph/mobile-patients/src/helpers/AppSignature';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  getNetStatus,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  SetAppsFlyerCustID,
  onCleverTapUserLogin,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { loginAPI } from '@aph/mobile-patients/src/helpers/loginCalls';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { fonts } from '@aph/mobile-patients/src/theme/fonts';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState, useRef } from 'react';
import {
  Dimensions,
  EmitterSubscription,
  Keyboard,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  ImageBackground,
  Image,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import WebEngage from 'react-native-webengage';
import {
  NavigationEventSubscription,
  NavigationScreenProps,
  NavigationActions,
  StackActions,
} from 'react-navigation';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { AuthButton } from '@aph/mobile-patients/src/components/ui/AuthButton';
import { VERIFY_TRUECALLER_PROFILE } from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import { timeDifferenceInDays } from '@aph/mobile-patients/src/utils/dateUtil';
import {
  verifyTrueCallerProfile,
  verifyTrueCallerProfileVariables,
} from '@aph/mobile-patients/src/graphql/types/verifyTrueCallerProfile';
import { FetchingDetails } from '@aph/mobile-patients/src/components/ui/FetchingDetails';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { LOGIN_PROFILE } from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import {
  saveTokenDevice,
  phrNotificationCountApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount } from '@aph/mobile-patients/src/graphql/types/getUserNotifyEvents';
import { truecallerWEBEngage } from '@aph/mobile-patients/src/helpers/CommonEvents';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { LoginCarousel } from '@aph/mobile-patients/src/components/ui/LoginCarousel';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import SmsRetriever from 'react-native-sms-retriever';
import LinearGradient from 'react-native-linear-gradient';

let TRUECALLER: any;

if (Platform.OS === 'android') {
  TRUECALLER = require('react-native-truecaller-sdk').default;
}

const { height, width } = Dimensions.get('window');

export interface LoginProps extends NavigationScreenProps {}

const isPhoneNumberValid = (number: string) => {
  const isValidNumber = !/^[6-9]{1}\d{0,9}$/.test(number)
    ? !/^(234){1}\d{0,9}$/.test(number)
      ? false
      : true
    : true;
  return isValidNumber;
};

let otpString = '';
let didBlurSubscription: NavigationEventSubscription;

export const Login: React.FC<LoginProps> = (props) => {
  const [isTandCSelected, setTandC] = useState<boolean>(true);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const { signOut, getFirebaseToken, getPatientApiCall, getPatientByPrism, sendOtp } = useAuth();
  const [subscriptionId, setSubscriptionId] = useState<EmitterSubscription>();
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [appSign, setAppSign] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [paginationSpace] = useState(new Animated.Value(30));
  const [floatingLabelSpace] = useState(new Animated.Value(10));
  const inputRef = useRef();

  const isAndroid = Platform.OS === 'android';
  const client = useApolloClient();
  const [openFillerView, setOpenFillerView] = useState<boolean>(false);
  const { setPhrNotificationData } = useAppCommonData();
  const enableTrueCaller: boolean = AppConfig.Configuration.TrueCaller_Login_Enabled;

  const { setLoading, showAphAlert } = useUIElements();
  const webengage = new WebEngage();
  const oneTimeApiCall = useRef<boolean>(true);

  const styles = StyleSheet.create({
    container: {
      ...theme.viewStyles.container,
    },
    inputTextStyle: {
      ...theme.fonts.IBMPlexSansMedium(15),
      color: theme.colors.INPUT_TEXT,
      paddingRight: 6,
      letterSpacing: 0.5,
      paddingBottom: Platform.OS === 'ios' ? 5 : 3,
      width: '30%',
      textAlign: 'right',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '85%',
      alignSelf: 'center',
      borderBottomWidth: 2,
    },
    inputStyle: {
      ...theme.fonts.IBMPlexSansMedium(16),
      width: '100%',
      color: theme.colors.INPUT_TEXT,
      height: 40,
      textAlign: 'center',
    },
    inputValidView: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'center',
    },
    inputView: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'center',
    },
    bottomDescription: {
      lineHeight: 24,
      color: theme.colors.INPUT_FAILURE_TEXT,
      paddingTop: 8,
      paddingBottom: 12,
      ...theme.fonts.IBMPlexSansMedium(12),
      letterSpacing: 0.04,
      paddingHorizontal: 16,
    },
    bottomValidDescription: {
      lineHeight: 24,
      color: theme.colors.INPUT_SUCCESS_TEXT,
      opacity: 0.6,
      paddingTop: 8,
      letterSpacing: 0.04,
      paddingHorizontal: 16,
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
    hyperlink: {
      color: theme.colors.PURPLE,
      ...fonts.IBMPlexSansBold(10),
      textDecorationLine: 'underline',
    },
    checkBoxContainer: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      margin: 0,
    },
    checkBoxStyle: {
      resizeMode: 'contain',
      width: 14,
      height: 14,
    },
    uncheckedBoxStyle: {
      width: 17,
      height: 17,
    },
    leftSeperatorLine: {
      width: '40%',
      height: 0.5,
      backgroundColor: theme.colors.BORDER_BOTTOM_COLOR,
    },
    rightSeperatorLine: {
      width: '43%',
      height: 0.5,
      backgroundColor: theme.colors.BORDER_BOTTOM_COLOR,
    },
    authContainer: {
      marginTop: 25,
      marginHorizontal: 20,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    submitButtonContainer: {
      width: '85%',
      alignSelf: 'center',
    },
    submitButton: {
      width: '100%',
      backgroundColor: colors.ORANGE_ENABLED,
      alignItems: 'center',
      justifyContent: 'center',
      height: 40,
      borderRadius: 5,
    },
    logoContainer: {
      justifyContent: 'center',
      paddingTop: 10,
      alignSelf: 'center',
      width: '100%',
      alignItems: 'center',
    },
    bottomContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      justifyContent: 'center',
    },
    errorText: {
      ...theme.viewStyles.text('M', 13, colors.REMOVE_RED),
    },
    useNumberButton: {
      backgroundColor: colors.ORANGE_ENABLED,
      width: '90%',
      alignItems: 'center',
      justifyContent: 'center',
      height: 40,
      borderRadius: 7,
    },
    useNumberButtonText: {
      ...theme.viewStyles.text('B', 16, colors.WHITE),
    },
    errorContainer: {
      alignItems: 'center',
      marginBottom: 20,
      marginTop: isFocused ? 7 : 0,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxInnerContainer: {
      width: 15,
      height: 15,
      borderColor: theme.colors.LIGHT_BLUE,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
      marginRight: 8,
    },
  });

  useEffect(() => {
    isAndroid && initializeTruecaller();
    isAndroid && truecallerEventListeners();
    // isAndroid && renderNumberPopup(); // Anubhav will look in this
    const eventAttributes: WebEngageEvents[WebEngageEventName.MOBILE_ENTRY] = {};
    postWebEngageEvent(WebEngageEventName.MOBILE_ENTRY, eventAttributes);
    postFirebaseEvent(FirebaseEventName.MOBILE_ENTRY, eventAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.MOBILE_ENTRY, eventAttributes);
    const backHandler = Keyboard.addListener('keyboardDidHide', handleBackButtonPress);
    return () => backHandler.remove();
  }, []);

  const handleBackButtonPress = () => {
    inputRef?.current?.blur();
  };

  useEffect(() => {
    try {
      fireBaseFCM();
      setLoading && setLoading(false);
      if (isAndroid) {
        AppSignature.getAppSignature().then((sign: string[]) => {
          setAppSign(sign[0] || '');
        });
      }
    } catch (error) {
      CommonBugFender('Login_useEffect_try', error);
    }
  }, []);

  const renderNumberPopup = async () => {
    try {
      if (!phoneNumber) {
        const phone = await SmsRetriever.requestPhoneNumber();
        validateAndSetPhoneNumber(phone?.slice(3));
        onBlur();
      }
    } catch (err) {
      console.log(JSON.stringify({ err }));
    }
  };

  const initializeTruecaller = () => {
    TRUECALLER.initializeClient(
      'CONSENT_MODE_POPUP',
      'SDK_CONSENT_TITLE_LOG_IN',
      'FOOTER_TYPE_SKIP'
    );
  };

  const truecallerEventListeners = () => {
    // For handling the success event
    TRUECALLER.on('profileSuccessReponse', (profile: any) => {
      setLoading?.(false);
      cleverTapEventForUserContinueThroughTrueCallerLogin();
      // add other logic here related to login/sign-up as per your use-case.
      oneTimeApiCall.current && verifyTrueCallerProfile(profile);
    });

    // For handling the reject event
    TRUECALLER.on('profileErrorReponse', (error: any) => {
      setLoading?.(false);
      if (error && error.errorCode) {
        let errorAttributes: any = {
          'Error Code': error?.errorCode,
        };

        oneTimeApiCall.current = true;
        switch (error.errorCode) {
          case 1: {
            showAphAlert!({
              title: string.truecaller.errorTitle,
              description: string.truecaller.networkProblem,
            });
            errorAttributes = {
              ...errorAttributes,
              'Error Message': 'Network Failure',
            };
            truecallerWEBEngage(null, 'sdk error', errorAttributes);
            break;
          }
          case 2: {
            errorAttributes = {
              ...errorAttributes,
              'Error Message': 'User pressed back button',
            };
            truecallerWEBEngage(null, 'sdk error', errorAttributes);
            break;
          }
          case 3: {
            errorAttributes = {
              ...errorAttributes,
              'Error Message': 'Incorrect Partner Key',
            };
            truecallerWEBEngage(null, 'sdk error', errorAttributes);
            break;
          }
          case 4:
          case 10: {
            showAphAlert!({
              title: string.truecaller.errorTitle,
              description: string.truecaller.userNotVerified,
            });
            errorAttributes = {
              ...errorAttributes,
              'Error Message': string.truecaller.userNotVerified,
            };
            truecallerWEBEngage(null, 'sdk error', errorAttributes);
            break;
          }
          case 5: {
            errorAttributes = {
              ...errorAttributes,
              'Error Message': 'Truecaller App Internal Error',
            };
            truecallerWEBEngage(null, 'sdk error', errorAttributes);
            break;
          }
          case 11: {
            showAphAlert!({
              title: string.truecaller.errorTitle,
              description: string.truecaller.appNotInstalledOrUserNotLoggedIn,
            });
            errorAttributes = {
              ...errorAttributes,
              'Error Message': string.truecaller.appNotInstalledOrUserNotLoggedIn,
            };
            truecallerWEBEngage(null, 'sdk error', errorAttributes);
            break;
          }
          case 13: {
            errorAttributes = {
              ...errorAttributes,
              'Error Message': 'User pressed back while verification in process',
            };
            truecallerWEBEngage(null, 'sdk error', errorAttributes);
            break;
          }
          case 14: {
            errorAttributes = {
              ...errorAttributes,
              'Error Message': 'User pressed SKIP or USE ANOTHER NUMBER',
            };
            cleverTapEventForUserSkippedFromTrueCallerLogin();
            truecallerWEBEngage(null, 'sdk error', errorAttributes);
            break;
          }
          default:
            errorAttributes = {
              ...errorAttributes,
              'Error Message': 'Unknown Error',
            };
            truecallerWEBEngage(null, 'sdk error', errorAttributes);
            break;
        }
      }
    });
  };

  const verifyTrueCallerProfile = async (profile: any) => {
    oneTimeApiCall.current = false;
    AsyncStorage.setItem('phoneNumber', profile?.phoneNumber?.substring(3)); // to ignore +91
    setOpenFillerView(true);
    try {
      const res = await client.mutate<verifyTrueCallerProfile, verifyTrueCallerProfileVariables>({
        mutation: VERIFY_TRUECALLER_PROFILE,
        variables: {
          profile,
        },
        fetchPolicy: 'no-cache',
      });
      const authToken = res?.data?.verifyTrueCallerProfile?.authToken;
      if (authToken) {
        sendOtp(authToken)
          .then(() => {
            getAuthToken();
          })
          .catch((e) => {
            showLoginError('signInWithCustomToken', e);
            CommonBugFender('OTPVerification_sendOtp', e);
          });
      }
    } catch (error) {
      showLoginError('verifyTrueCallerProfile', error);
      CommonBugFender('Login_verifyTrueCallerProfile', error);
    }
  };

  const showLoginError = (apiName: string, error: any) => {
    oneTimeApiCall.current = true;
    setOpenFillerView(false);
    showAphAlert!({
      title: string.truecaller.errorTitle,
      description: string.truecaller.tryAgainLater,
    });
    const errorAttributes = {
      'Api Name': apiName,
      Error: error,
    };
    truecallerWEBEngage(null, 'login error', errorAttributes);
  };

  const getAuthToken = async () => {
    try {
      const res = await getFirebaseToken?.();
      if (res) {
        getOTPPatientApiCall();
      }
    } catch (error) {
      CommonBugFender('Login_getFirebaseToken', error);
      showLoginError('getFirebaseToken', error);
    }
  };

  const getOTPPatientApiCall = async () => {
    try {
      const res = await getPatientApiCall();
      AsyncStorage.setItem('currentPatient', JSON.stringify(res));
      AsyncStorage.setItem('callByPrism', 'false');
      dataFetchFromMobileNumber(res);
    } catch (error) {
      CommonBugFender('OTPVerification_getOTPPatientApiCall', error);
      showLoginError('getPatientByMobileNumber', error);
    }
  };

  const dataFetchFromMobileNumber = async (data: any) => {
    const profileData = data?.data?.getPatientByMobileNumber?.patients;
    if (profileData && profileData.length === 0) {
      try {
        const res = await getPatientByPrism();
        if (res) {
          const allPatients = res?.data?.getCurrentPatients?.patients || null;
          const mePatient =
            allPatients?.find((patient: any) => patient?.relation === Relation.ME) ||
            allPatients[0] ||
            null;
          moveScreenForward(mePatient, allPatients);
        }
      } catch (error) {
        showLoginError('GetCurrentPatients', error);
      }
    } else {
      const mePatient =
        profileData?.find((patient: any) => patient?.relation === Relation.ME) ||
        profileData[0] ||
        null;
      moveScreenForward(mePatient, profileData);
    }
  };

  const moveScreenForward = async (mePatient: any, allPatients: any) => {
    AsyncStorage.setItem('logginHappened', 'true');
    // commenting this to avoid setting of AppFlyerCustId twice
    // SetAppsFlyerCustID(mePatient.primaryPatientId);
    mePatient && (await AsyncStorage.setItem(LOGIN_PROFILE, JSON.stringify(mePatient)));
    if (mePatient && mePatient.uhid && mePatient.uhid !== '') {
      if (mePatient.relation == null) {
        // prism user
        navigateTo(AppRoutes.MultiSignup);
      } else {
        if (!mePatient?.dateOfBirth) {
          // New user since we dont get dateOfBirth from truecaller profile and it will always be null or empty for new user
          navigateTo(AppRoutes.SignUp, mePatient);
        } else {
          // existing user
          AsyncStorage.setItem('userLoggedIn', 'true');
          onCleverTapUserLogin(mePatient);
          deviceTokenAPI(mePatient?.id);
          callPhrNotificationApi(mePatient?.id);
          truecallerWEBEngage(mePatient, 'login', null, allPatients);
          props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              key: null,
              actions: [
                NavigationActions.navigate({
                  routeName: AppRoutes.HomeScreen,
                  params: {
                    previousRoute: 'Login',
                  },
                }),
              ],
            })
          );
        }
      }
    } else {
      navigateTo(AppRoutes.SignUp);
    }
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
          saveTokenDevice(client, token, patientId)
            ?.then((resp) => {
              AsyncStorage.setItem('deviceTokenTimeStamp', JSON.stringify(new Date().getTime()));
            })
            .catch((e) => {
              CommonBugFender('Login_saveTokenDevice', e);
              AsyncStorage.setItem('deviceToken', '');
            });
        })
        .catch((e) => {
          CommonBugFender('Login_getDeviceToken', e);
        });
    } else {
      saveTokenDevice(client, deviceToken2, patientId)
        ?.then((resp) => {})
        .catch((e) => {
          CommonBugFender('Login_saveTokenDevice', e);
          AsyncStorage.setItem('deviceToken', '');
        });
    }
  };

  const navigateTo = (routeName: AppRoutes, patient?: any) => {
    oneTimeApiCall.current = true;
    props.navigation.navigate(routeName, { patient });
    setOpenFillerView(false);
  };

  const fireBaseFCM = async () => {
    try {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) {
        await messaging().requestPermission();
      }
    } catch (error) {
      CommonBugFender('Login_FireBaseFCM_Error', error);
    }
  };

  useEffect(() => {
    getStoredMobileNumber();
  }, []);

  const getStoredMobileNumber = async () => {
    const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
    if (storedPhoneNumber) {
      setPhoneNumber(storedPhoneNumber);
      validateAndSetPhoneNumber(storedPhoneNumber);
    }
  };

  useEffect(() => {
    return () => {
      subscriptionId && subscriptionId.remove();
      didBlurSubscription && didBlurSubscription.remove();
    };
  }, [subscriptionId]);

  const validateAndSetPhoneNumber = (number: string) => {
    setError('');
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
            if (obj.invalidAttems === 3) {
              if (seconds < 900) {
                isNoBlocked = true;
              }
            }
          }
        });
      }
    } catch (error) {
      CommonBugFender('Login_getTimerData_try', error);
    }
    return isNoBlocked;
  };

  const onClickOkay = () => {
    try {
      if (!phoneNumberIsValid || phoneNumber.length != 10) setError(string.login.wrong_number);
      else if (!isTandCSelected) setError(string.login.accept_tnc);
      else {
        webengage.user.login(`+91${phoneNumber}`);
        CommonLogEvent(AppRoutes.Login, 'Login clicked');
        const eventAttributes: FirebaseEvents[FirebaseEventName.OTP_DEMANDED] = {
          mobilenumber: phoneNumber,
        };
        postFirebaseEvent(FirebaseEventName.OTP_DEMANDED, eventAttributes);
        postAppsFlyerEvent(AppsFlyerEventName.OTP_DEMANDED, eventAttributes);
        setTimeout(() => {
          const eventAttributes: WebEngageEvents[WebEngageEventName.MOBILE_NUMBER_ENTERED] = {
            mobilenumber: phoneNumber,
          };
          postWebEngageEvent(WebEngageEventName.MOBILE_NUMBER_ENTERED, eventAttributes);
          const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.MOBILE_NUMBER_ENTERED] = {
            'Mobile Number': phoneNumber,
            'Nav src': 'App login screen',
            'Page Name': 'Login Screen',
          };
          postCleverTapEvent(CleverTapEventName.MOBILE_NUMBER_ENTERED, cleverTapEventAttributes);
        }, 3000);

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

                loginAPI('+91' + phoneNumber, appSign)
                  .then((confirmResult: any) => {
                    setShowSpinner(false);

                    const eventAttributes: FirebaseEvents[FirebaseEventName.LOGIN] = {
                      mobilenumber: phoneNumber,
                    };
                    postFirebaseEvent(FirebaseEventName.LOGIN, eventAttributes);

                    try {
                      signOut();
                    } catch (error) {}

                    props.navigation.navigate(AppRoutes.OTPVerification, {
                      otpString,
                      phoneNumber: phoneNumber,
                      loginId: confirmResult.loginId,
                    });
                  })
                  .catch((error: Error) => {
                    setShowSpinner(false);

                    CommonLogEvent('OTP_SEND_FAIL', error.message);
                    CommonBugFender('OTP_SEND_FAIL', error);
                  });
              }
            }
          } else {
            setshowOfflinePopup(true);
            setShowSpinner(false);
          }
        });
      }
    } catch (error) {}
  };

  const openWebViewTandC = () => {
    CommonLogEvent(AppRoutes.Login, 'Terms  Conditions clicked');
    Keyboard.dismiss();
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.APOLLO_TERMS_CONDITIONS,
      isGoBack: true,
    });
  };

  const openWebViewPrivacyPolicy = () => {
    CommonLogEvent(AppRoutes.Login, 'Privacy Policy clicked');
    Keyboard.dismiss();
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.APOLLO_PRIVACY_POLICY,
      isGoBack: true,
    });
  };

  const renderTruecallerButton = () => {
    return (
      <View style={styles.authContainer}>
        <View style={styles.row}>
          <View style={styles.leftSeperatorLine} />
          <Text style={{ ...theme.viewStyles.text('R', 10, theme.colors.BORDER_BOTTOM_COLOR) }}>
            Or
          </Text>
          <View style={styles.rightSeperatorLine} />
        </View>
        <AuthButton onPress={loginWithTruecaller} />
      </View>
    );
  };

  const loginWithTruecaller = () => {
    setLoading?.(true);
    cleverTapEventForLoginViaTrueCaller();
    /**
     * If you are checking in local, then you need to change truecaller_appkey(debug key) from strings.xml file
     */
    postWebEngageEvent(WebEngageEventName.LOGIN_WITH_TRUECALLER_CLICKED, {});
    postCleverTapEvent(CleverTapEventName.LOGIN_WITH_TRUECALLER_CLICKED, {});
    TRUECALLER.isUsable((result: boolean) => {
      if (result) {
        // Authenticate via truecaller flow can be used
        TRUECALLER.requestTrueProfile();
      } else {
        setLoading?.(false);
        showAphAlert!({
          title: string.truecaller.errorTitle,
          description: string.truecaller.appNotInstalledOrUserNotLoggedIn,
        });
      }
    });
  };

  const cleverTapEventForLoginViaTrueCaller = () => {
    let eventAttributes = {
      'Nav src': 'App login screen',
      'Page Name': 'Login Screen',
    };
    postCleverTapEvent(CleverTapEventName.LOGIN_VIA_TRUECALLER, eventAttributes);
  };

  const cleverTapEventForUserSkippedFromTrueCallerLogin = () => {
    let eventAttributes = {
      'Nav src': 'App login screen',
      'Page Name': 'Login Screen',
    };
    postCleverTapEvent(CleverTapEventName.LOGIN_WITH_TRUECALLER_SKIPPED, eventAttributes);
  };

  const cleverTapEventForUserContinueThroughTrueCallerLogin = () => {
    let eventAttributes = {
      'Nav src': 'App login screen',
      'Page Name': 'Login Screen',
    };
    postCleverTapEvent(CleverTapEventName.LOGIN_WITH_TRUECALLER_CONTINUE, eventAttributes);
  };

  const onFocus = async () => {
    setIsFocused(true);
    Animated.timing(floatingLabelSpace, {
      toValue: 10,
      duration: 500,
    }).start();
    Animated.timing(paginationSpace, {
      toValue: 5,
      duration: 500,
    }).start();
  };

  const onBlur = () => {
    setIsFocused(false);
    Animated.timing(paginationSpace, {
      toValue: 30,
      duration: 500,
    }).start();
    Animated.timing(floatingLabelSpace, {
      toValue: 0,
      duration: 500,
    }).start();
  };

  const renderManualForm = () => (
    <>
      <Animated.View
        style={{
          alignItems: 'center',
          marginTop: isFocused ? 5 : 0,
        }}
      >
        <Text style={[theme.viewStyles.text('R', 12, colors.LIGHT_BLUE), { opacity: 0.65 }]}>
          {string.login.mobile_number_label}
        </Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderBottomColor: !isFocused
              ? colors.CARD_HEADER
              : phoneNumberIsValid || phoneNumber == ''
              ? theme.colors.INPUT_BORDER_SUCCESS
              : theme.colors.INPUT_BORDER_FAILURE,
            marginTop: !isFocused ? -2 : paginationSpace,
          },
        ]}
      >
        <TextInput
          style={styles.inputStyle}
          keyboardType="numeric"
          maxLength={10}
          value={phoneNumber}
          onChangeText={(value: string) => validateAndSetPhoneNumber(value)}
          placeholder={string.login.mobile_placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onClickOkay}
          ref={inputRef}
          multiline
        />
      </Animated.View>
      <View style={[styles.submitButtonContainer, { marginTop: !isFocused ? '6%' : '3%' }]}>
        <TouchableOpacity activeOpacity={0.5} style={styles.submitButton} onPress={onClickOkay}>
          <Text
            style={[theme.fonts.IBMPlexSansBold(12), { color: colors.WHITE, letterSpacing: 1 }]}
          >
            {string.common.continue}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <Animated.View style={{ flex: 1, backgroundColor: colors.CALL_BG_GRAY }}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.WHITE }]}>
        <LinearGradient colors={[colors.LIGHT_GREEN_ONE, colors.HEX_WHITE]} style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.logoContainer}>
              <ApolloLogo style={{ width: 55, height: 47 }} resizeMode="contain" />
            </View>
            <LoginCarousel focused={isFocused} />

            <Animated.View style={{ height: paginationSpace }} />

            <Animated.View style={{ alignItems: 'center', marginBottom: paginationSpace }}>
              <Text style={[theme.fonts.IBMPlexSansSemiBold(18), { color: colors.CARD_HEADER }]}>
                {string.login.signin_signup}
              </Text>
            </Animated.View>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={{ flex: 1 }}>
              <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false}>
                <View style={{ width }}>{renderManualForm()}</View>
              </ScrollView>
            </View>
          </ScrollView>
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              activeOpacity={0.5}
              style={styles.checkboxContainer}
              onPress={() => setTandC(!isTandCSelected)}
            >
              <View style={styles.checkboxInnerContainer}>
                {isTandCSelected && (
                  <Image
                    source={require('@aph/mobile-patients/src/components/ui/icons/checkBlack.webp')}
                    style={{ width: 11, height: 11, tintColor: theme.colors.LIGHT_BLUE }}
                    resizeMode="contain"
                  />
                )}
              </View>
            </TouchableOpacity>
            <Text
              style={{
                color: '#02475b',
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
        </LinearGradient>
      </SafeAreaView>
      {showSpinner ? <Spinner /> : null}
      {openFillerView && <FetchingDetails />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </Animated.View>
  );
};
