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
import WebEngage from 'react-native-webengage';
import { NavigationEventSubscription, NavigationScreenProps } from 'react-navigation';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { AuthButton } from '@aph/mobile-patients/src/components/ui/AuthButton';
// let TRUECALLER: any;

// if (Platform.OS === 'android') {
//   TRUECALLER = require('react-native-truecaller-sdk').default;
// }

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
  const { signOut } = useAuth();
  const [subscriptionId, setSubscriptionId] = useState<EmitterSubscription>();
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [appSign, setAppSign] = useState<string>('');
  const isAndroid = Platform.OS === 'android';

  const { setLoading, showAphAlert } = useUIElements();
  const webengage = new WebEngage();

  useEffect(() => {
    // isAndroid && initializeTruecaller();
    // isAndroid && truecallerEventListeners();
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

  // const initializeTruecaller = () => {
  //   TRUECALLER.initializeClient(
  //     'CONSENT_MODE_POPUP',
  //     'SDK_CONSENT_TITLE_LOG_IN',
  //     'FOOTER_TYPE_SKIP'
  //   );
  // };

  // const truecallerEventListeners = () => {
  //   // For handling the success event
  //   TRUECALLER.on('profileSuccessReponse', (profile: any) => {
  //     setLoading?.(false);
  //     // add other logic here related to login/sign-up as per your use-case.
  //   });

  //   // For handling the reject event
  //   TRUECALLER.on('profileErrorReponse', (error: any) => {
  //     setLoading?.(false);
  //     if (error && error.errorCode) {
  //       switch (error.errorCode) {
  //         case 1: {
  //           showAphAlert!({
  //             title: 'Uh oh.. :(',
  //             description: string.truecaller.networkProblem,
  //           });
  //           break;
  //         }
  //         case 4:
  //         case 10: {
  //           showAphAlert!({
  //             title: 'Uh oh.. :(',
  //             description: string.truecaller.userNotVerified,
  //           });
  //           break;
  //         }
  //         case 11: {
  //           showAphAlert!({
  //             title: 'Uh oh.. :(',
  //             description: string.truecaller.appNotInstalledOrUserNotLoggedIn,
  //           });
  //           break;
  //         }
  //       }
  //     }
  //   });
  // };

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

  // const renderTruecallerButton = () => {
  //   return (
  //     <View style={styles.authContainer}>
  //       <View style={styles.row}>
  //         <View style={styles.leftSeperatorLine} />
  //         <Text style={{ ...theme.viewStyles.text('R', 10, theme.colors.BORDER_BOTTOM_COLOR) }}>
  //           Or
  //         </Text>
  //         <View style={styles.rightSeperatorLine} />
  //       </View>
  //       <AuthButton onPress={loginWithTruecaller} />
  //     </View>
  //   );
  // };

  // const loginWithTruecaller = () => {
  //   setLoading?.(true);
  //   TRUECALLER.isUsable((result: boolean) => {
  //     if (result) {
  //       // Authenticate via truecaller flow can be used
  //       TRUECALLER.requestTrueProfile();
  //     } else {
  //       setLoading?.(false);
  //       showAphAlert!({
  //         title: 'Uh oh.. :(',
  //         description: string.truecaller.appNotInstalledOrUserNotLoggedIn,
  //       });
  //     }
  //   });
  // };

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
            <Text
              style={{
                color: '#02475b',
                ...fonts.IBMPlexSansMedium(10),
              }}
            >
              By signing up, I agree to the{' '}
              <Text style={styles.hyperlink}>Terms and Conditions</Text> of Apollo247
            </Text>
          </TouchableOpacity>
        </LoginCard>
        <ScrollView>
          {/** Truecaller integration will come in next phase */}
          {/* {isAndroid && renderTruecallerButton()} */}
          <LandingDataView />
        </ScrollView>
      </SafeAreaView>
      {showSpinner ? <Spinner /> : null}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
