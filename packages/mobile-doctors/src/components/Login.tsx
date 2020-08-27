import LoginStyles from '@aph/mobile-doctors/src/components/Login.styles';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { timeOutDataType } from '@aph/mobile-doctors/src/components/OTPVerification';
import { Card } from '@aph/mobile-doctors/src/components/ui/Card';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { ArrowDisabled, ArrowYellow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-doctors/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-doctors/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { getNetStatus } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import {
  default as string,
  default as strings,
} from '@aph/mobile-doctors/src/strings/strings.json';
import { fonts } from '@aph/mobile-doctors/src/theme/fonts';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  View,
  Linking,
} from 'react-native';
import firebase from 'react-native-firebase';
import HyperLink from 'react-native-hyperlink';

import { NavigationScreenProps } from 'react-navigation';
import { loginAPI } from '../helpers/loginCalls';
import AsyncStorage from '@react-native-community/async-storage';
import { AppSignature } from '@aph/mobile-doctors/src/helpers/AppSignature';

const styles = LoginStyles;

export interface LoginProps extends NavigationScreenProps {}

const isPhoneNumberValid = (number: string) => {
  const isValidNumber = /^[6-9]{1}\d{0,9}$/.test(number);
  return isValidNumber;
};

export const Login: React.FC<LoginProps> = (props) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [onClickOpen, setonClickOpen] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const { setDoctorDetailsError, setDoctorDetails, clearFirebaseUser } = useAuth();
  const [appSign, setAppSign] = useState<string>('');

  useEffect(() => {
    try {
      fireBaseFCM();
      clearFirebaseUser && clearFirebaseUser();
      setLoading && setLoading(false);
      if (Platform.OS === 'android')
        AppSignature.getAppSignature().then((sign: string[]) => {
          setAppSign(sign[0] || '');
        });
    } catch (error) {}
  }, []);

  const fireBaseFCM = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      // user has permissions
      console.log('enabled', enabled);
    } else {
      // user doesn't have permission
      console.log('not enabled');
      try {
        await firebase.messaging().requestPermission();
        console.log('authorized');

        // User has authorised
      } catch (error) {
        // User has rejected permissions
        console.log('not enabled error', error);
      }
    }
  };

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
            console.log(seconds, 'seconds');
            if (obj.invalidAttems === 3) {
              if (seconds < 900) {
                isNoBlocked = true;
              }
            }
          }
        });
      }
    } catch (error) {
      console.log(error.message);
    }
    return isNoBlocked;
  };

  const onClickOkay = () => {
    setDoctorDetailsError && setDoctorDetailsError(false);
    setDoctorDetails && setDoctorDetails(null);
    Keyboard.dismiss();
    getNetStatus().then(async (status) => {
      if (status) {
        if (!(phoneNumber.length == 10 && phoneNumberIsValid)) {
          return;
        } else {
          const isBlocked = await _getTimerData();
          if (isBlocked) {
            props.navigation.navigate(AppRoutes.OTPVerification, {
              phoneNumber: phoneNumber,
            });
          } else {
            AsyncStorage.setItem('phoneNumber', phoneNumber);
            setShowSpinner(true);
            firebase.analytics().logEvent('Doctor_login', { phoneNumber: phoneNumber });
            loginAPI('+91' + phoneNumber, appSign)
              .then((confirmResult) => {
                console.log(confirmResult, 'confirmResult');
                setShowSpinner(false);
                console.log('confirmResult login', confirmResult);
                props.navigation.navigate(AppRoutes.OTPVerification, {
                  phoneNumber: phoneNumber,
                  loginId: confirmResult.loginId,
                });
              })
              .catch((error) => {
                setShowSpinner(false);
                const errorMessage = error.graphQLErrors[0].message;
                if (errorMessage === 'NOT_A_DOCTOR') {
                  showAphAlert &&
                    showAphAlert({
                      title: strings.common.alert,
                      description: strings.login.not_doctor_message,
                      CTAs: [
                        {
                          text: strings.login.contact,
                          onPress: () => {
                            Linking.openURL(`mailto:${strings.common.contact_mailId}`).finally(
                              () => {
                                hideAphAlert && hideAphAlert();
                              }
                            );
                          },
                        },
                        {
                          text: strings.login.download_patients,
                          onPress: () => {
                            Linking.openURL(strings.login.download_URL).finally(() => {
                              hideAphAlert && hideAphAlert();
                            });
                          },
                        },
                      ],
                    });
                } else {
                  Alert.alert(
                    strings.common.error,
                    (error && error.message) || strings.login.interaction_cancelled_by_user
                  );
                }
              });
          }
        }
      } else {
        setshowOfflinePopup(true);
        setShowSpinner(false);
      }
    });
  };

  const openWebView = () => {
    Keyboard.dismiss();
    Linking.openURL('https://www.apollo247.com/terms');
    // return (
    //   <View style={styles.viewWebStyles}>
    //     <Header
    //       headerText={strings.login.terms_conditions}
    //       leftIcon="close"
    //       containerStyle={{
    //         borderBottomWidth: 0,
    //       }}
    //       onPressLeftIcon={() => setonClickOpen(false)}
    //     />
    //     <View
    //       style={{
    //         flex: 1,
    //         overflow: 'hidden',
    //         backgroundColor: 'white',
    //       }}
    //     >
    //       <WebView
    //         source={{
    //           uri: 'https://www.apollo247.com/TnC.html',
    //         }}
    //         style={{
    //           flex: 1,
    //           backgroundColor: 'white',
    //         }}
    //         // useWebKit={true}
    //         onLoadStart={() => {
    //           console.log('onLoadStart');
    //           setShowSpinner(true);
    //         }}
    //         onLoadEnd={() => {
    //           console.log('onLoadEnd');
    //           setShowSpinner(false);
    //         }}
    //         onLoad={() => {
    //           console.log('onLoad');
    //           setShowSpinner(false);
    //         }}
    //       />
    //     </View>
    //   </View>
    // );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={{ height: 56 }} />
        <Card
          cardContainer={{ marginTop: 0, paddingBottom: 12 }}
          heading={string.login.hello}
          description={string.login.please_enter_no}
          buttonIcon={
            phoneNumberIsValid && phoneNumber.replace(/^0+/, '').length === 10 ? (
              <ArrowYellow />
            ) : (
              <ArrowDisabled />
            )
          }
          onClickButton={onClickOkay}
          disableButton={!(phoneNumberIsValid && phoneNumber.length === 10)}
        >
          <View
            style={[
              { paddingTop: Platform.OS === 'ios' ? 22 : 15 },
              phoneNumber == '' || phoneNumberIsValid ? styles.inputValidView : styles.inputView,
            ]}
          >
            <Text style={styles.inputTextStyle}>{string.login.numberPrefix}</Text>
            <TextInput
              autoFocus
              style={styles.inputStyle}
              keyboardType="numeric"
              maxLength={10}
              value={phoneNumber}
              onChangeText={(value) => validateAndSetPhoneNumber(value)}
            />
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

          <View
            style={{
              marginRight: 32,
            }}
          >
            <HyperLink
              linkStyle={{
                color: '#02475b',
                ...fonts.IBMPlexSansBold(10),
                lineHeight: 16,
                letterSpacing: 0,
              }}
              linkText={(url) =>
                url === 'https://www.apollo247.com/terms' ? 'Terms and Conditions' : url
              }
              onPress={(url, text) => openWebView()}
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
            </HyperLink>
          </View>
        </Card>
        {/* {onClickOpen && openWebView()} */}
      </SafeAreaView>
      {showSpinner ? <Spinner /> : null}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
    </View>
  );
};
