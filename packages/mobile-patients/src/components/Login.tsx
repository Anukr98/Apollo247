import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { timeOutDataType } from '@aph/mobile-patients/src/components/OTPVerification';
import { ArrowDisabled, ArrowYellow } from '@aph/mobile-patients/src/components/ui/Icons';
import LandingDataView from '@aph/mobile-patients/src/components/ui/LandingDataView';
import { LoginCard } from '@aph/mobile-patients/src/components/ui/LoginCard';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
  CommonSetUserBugsnag,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppSignature } from '@aph/mobile-patients/src/helpers/AppSignature';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  getNetStatus,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  SetAppsFlyerCustID,
  setFirebaseUserId,
  setCrashlyticsAttributes,
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
import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import HyperLink from 'react-native-hyperlink';
import WebEngage from 'react-native-webengage';
import {
  NavigationEventSubscription,
  NavigationScreenProps,
  StackActions,
  NavigationActions,
} from 'react-navigation';
import {
  AppsFlyerEventName,
  AppsFlyerEvents,
} from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { AuthButton } from '@aph/mobile-patients/src/components/ui/AuthButton';
import { VERIFY_TRUECALLER_PROFILE } from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import {
  verifyTrueCallerProfile,
  verifyTrueCallerProfileVariables,
} from '@aph/mobile-patients/src/graphql/types/verifyTrueCallerProfile';
import { FetchingDetails } from '@aph/mobile-patients/src/components/ui/FetchingDetails';
import { Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  saveTokenDevice,
  phrNotificationCountApi,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount } from '@aph/mobile-patients/src/graphql/types/getUserNotifyEvents';

let TRUECALLER: any;

if (Platform.OS === 'android') {
  TRUECALLER = require('react-native-truecaller-sdk').default;
}

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
    paddingRight: 6,
    letterSpacing: 0.5,
    lineHeight: 28,
    paddingTop: Platform.OS === 'ios' ? 0 : 6,
    paddingBottom: Platform.OS === 'ios' ? 5 : 0,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '76%',
    color: theme.colors.INPUT_TEXT,
    paddingBottom: 4,
  },
  inputValidView: {
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: width - 135,
    paddingBottom: 0,
  },
  inputView: {
    borderBottomColor: theme.colors.INPUT_BORDER_FAILURE,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: width - 135,
    paddingBottom: 0,
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
});

export interface LoginProps extends NavigationScreenProps {}

const isPhoneNumberValid = (number: string) => {
  // const isValidNumber = !/^[6-9]{1}\d{0,9}$/.test(number) ? false : true;
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
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const { signOut, getFirebaseToken, getPatientApiCall, getPatientByPrism, sendOtp } = useAuth();
  const [subscriptionId, setSubscriptionId] = useState<EmitterSubscription>();
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [appSign, setAppSign] = useState<string>('');
  const isAndroid = Platform.OS === 'android';
  const client = useApolloClient();
  const [openFillerView, setOpenFillerView] = useState<boolean>(false);
  const { setPhrNotificationData } = useAppCommonData();

  const { setLoading, showAphAlert } = useUIElements();
  const webengage = new WebEngage();

  useEffect(() => {
    isAndroid && initializeTruecaller();
    isAndroid && truecallerEventListeners();
    const eventAttributes: WebEngageEvents[WebEngageEventName.MOBILE_ENTRY] = {};
    postWebEngageEvent(WebEngageEventName.MOBILE_ENTRY, eventAttributes);
    postFirebaseEvent(FirebaseEventName.MOBILE_ENTRY, eventAttributes);
    postAppsFlyerEvent(AppsFlyerEventName.MOBILE_ENTRY, eventAttributes);
  }, []);

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
      // add other logic here related to login/sign-up as per your use-case.
      verifyTrueCallerProfile(profile);
    });

    // For handling the reject event
    TRUECALLER.on('profileErrorReponse', (error: any) => {
      setLoading?.(false);
      if (error && error.errorCode) {
        switch (error.errorCode) {
          case 1: {
            showAphAlert!({
              title: 'Uh oh.. :(',
              description: string.truecaller.networkProblem,
            });
            break;
          }
          case 4:
          case 10: {
            showAphAlert!({
              title: 'Uh oh.. :(',
              description: string.truecaller.userNotVerified,
            });
            break;
          }
          case 11: {
            showAphAlert!({
              title: 'Uh oh.. :(',
              description: string.truecaller.appNotInstalledOrUserNotLoggedIn,
            });
            break;
          }
          default:
            showAphAlert!({
              title: 'Uh oh.. :(',
              description: string.truecaller.tryAgainLater,
            });
            break;
        }
      }
    });
  };

  const verifyTrueCallerProfile = async (profile: any) => {
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
            CommonBugFender('OTPVerification_sendOtp', e);
            // setBugFenderLog('OTPVerification_sendOtp', e);
          });
        getAuthToken();
      }
    } catch (error) {
      CommonBugFender('Login_verifyTrueCallerProfile', error);
    }
  };

  const getAuthToken = async () => {
    try {
      const res = await getFirebaseToken?.();
      if (res) {
        getOTPPatientApiCall();
      }
    } catch (error) {
      CommonBugFender('Login_getFirebaseToken', error);
      setOpenFillerView(false);
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
      setOpenFillerView(false);
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
          moveScreenForward(mePatient);
        }
      } catch (error) {
        setOpenFillerView(false);
      }
    } else {
      const mePatient =
        profileData?.find((patient: any) => patient?.relation === Relation.ME) ||
        profileData[0] ||
        null;
      moveScreenForward(mePatient);
    }
  };

  const moveScreenForward = (mePatient: any) => {
    AsyncStorage.setItem('logginHappened', 'true');
    setOpenFillerView(false);
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
        deviceTokenAPI(mePatient.id);
        callPhrNotificationApi(mePatient?.id);
        fireUserLoggedInEvent(mePatient, 'Login');
        navigateTo(AppRoutes.ConsultRoom);
      }
    } else {
      if (mePatient.firstName == '') {
        const eventAttributes: WebEngageEvents[WebEngageEventName.PRE_APOLLO_CUSTOMER] = {
          value: 'No',
        };
        postWebEngageEvent(WebEngageEventName.PRE_APOLLO_CUSTOMER, eventAttributes);
        navigateTo(AppRoutes.SignUp);
        fireUserLoggedInEvent(mePatient, 'Registration');
      } else {
        AsyncStorage.setItem('userLoggedIn', 'true');
        deviceTokenAPI(mePatient.id);
        callPhrNotificationApi(mePatient?.id);
        navigateTo(AppRoutes.ConsultRoom);
        fireUserLoggedInEvent(mePatient, 'Login');
      }
    }
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

  const callPhrNotificationApi = async (currentPatient: any) => {
    try {
      const res = await phrNotificationCountApi(client, currentPatient || '');
      if (res) {
        setPhrNotificationData &&
          setPhrNotificationData(
            res! as getUserNotifyEvents_getUserNotifyEvents_phr_newRecordsCount
          );
      }
    } catch (error) {
      CommonBugFender('Login_callPhrNotificationApi', error);
    }
  };

  const deviceTokenAPI = async (patientId: string) => {
    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const deviceToken2 = deviceToken ? JSON.parse(deviceToken) : '';
    saveTokenDevice(client, deviceToken2, patientId);
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
  };

  const postOtpSuccessAppsflyerEvet = (id: string) => {
    const appsflyerEventAttributes: AppsFlyerEvents[AppsFlyerEventName.OTP_VERIFICATION_SUCCESS] = {
      'customer id': id,
    };
    postAppsFlyerEvent(AppsFlyerEventName.OTP_VERIFICATION_SUCCESS, appsflyerEventAttributes);
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
              CommonSetUserBugsnag(phoneNumber);
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
    } catch (error) {}
  };

  const openWebView = () => {
    CommonLogEvent(AppRoutes.Login, 'Terms  Conditions clicked');
    Keyboard.dismiss();
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.APOLLO_TERMS_CONDITIONS,
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
    /**
     * If you are checking in local, then you need to change truecaller_appkey(debug key) from strings.xml file
     */
    TRUECALLER.isUsable((result: boolean) => {
      if (result) {
        // Authenticate via truecaller flow can be used
        TRUECALLER.requestTrueProfile();
      } else {
        setLoading?.(false);
        showAphAlert!({
          title: 'Uh oh.. :(',
          description: string.truecaller.appNotInstalledOrUserNotLoggedIn,
        });
      }
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={{ justifyContent: 'center', marginTop: 20, marginLeft: 20 }}>
          <ApolloLogo style={{ width: 55, height: 47 }} resizeMode="contain" />
        </View>
        <View style={{ height: 16 }} />
        <LoginCard
          cardContainer={{ marginTop: 0, paddingBottom: 12 }}
          description={string.login.please_enter_no}
          buttonIcon={
            phoneNumberIsValid && phoneNumber.replace(/^0+/, '').length === 10 ? (
              <ArrowYellow size="md_l" />
            ) : (
              <ArrowDisabled size="md_l" />
            )
          }
          onClickButton={onClickOkay}
          disableButton={phoneNumberIsValid && phoneNumber.length === 10 ? false : true}
        >
          <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>
            <View
              style={[
                {
                  paddingTop: Platform.OS === 'ios' ? 22 : 15,
                  // flex: 1
                },
                phoneNumber == '' || phoneNumberIsValid ? styles.inputValidView : styles.inputView,
              ]}
            >
              <Text style={styles.inputTextStyle}>{string.login.numberPrefix}</Text>
              <TextInput
                style={styles.inputStyle}
                keyboardType="numeric"
                maxLength={10}
                value={phoneNumber}
                onChangeText={(value) => validateAndSetPhoneNumber(value)}
              />
            </View>
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

          <TouchableOpacity
            onPress={() => openWebView()}
            style={{
              marginHorizontal: 16,
            }}
          >
            <HyperLink
              linkStyle={styles.hyperlink}
              linkText={(url) =>
                url === 'https://www.apollo247.com/TnC.html' ? 'Terms and Conditions' : url
              }
              onPress={(url, text) => openWebView()}
            >
              <Text
                style={{
                  color: '#02475b',
                  ...fonts.IBMPlexSansMedium(10),
                }}
              >
                By signing up, I agree to the https://www.apollo247.com/TnC.html of Apollo247
              </Text>
            </HyperLink>
          </TouchableOpacity>
        </LoginCard>
        <ScrollView>
          {/** Truecaller integration will come in next phase */}
          {isAndroid && renderTruecallerButton()}
          <LandingDataView />
        </ScrollView>
      </SafeAreaView>
      {showSpinner ? <Spinner /> : null}
      {openFillerView && <FetchingDetails />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
