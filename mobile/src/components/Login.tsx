import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { Card } from 'app/src/components/ui/Card';
import { ArrowDisabled, ArrowYellow } from 'app/src/components/ui/Icons';
import { string } from 'app/src/strings/string';
import { theme } from 'app/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useAuth } from '../hooks/authHooks';
import SmsListener from 'react-native-android-sms-listener';
import firebase from 'react-native-firebase';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
    paddingRight: 6,
    lineHeight: 28,
    paddingBottom: Platform.OS === 'ios' ? 5 : 0,
  },
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    width: '80%',
    color: theme.colors.INPUT_TEXT,
    paddingBottom: 4,
  },
  inputValidView: {
    borderBottomColor: theme.colors.INPUT_BORDER_SUCCESS,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 0,
  },
  inputView: {
    borderBottomColor: theme.colors.INPUT_BORDER_FAILURE,
    borderBottomWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 0,
  },
  bottomDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_FAILURE_TEXT,
    opacity: 0.6,
    paddingVertical: 10,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  bottomValidDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_SUCCESS_TEXT,
    opacity: 0.6,
    paddingVertical: 10,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
});

export interface LoginProps extends NavigationScreenProps {}

const isPhoneNumberValid = (number: string) => {
  const isValidNumber =
    (number.replace(/^0+/, '').length !== 10 && number.length !== 0) ||
    !/^[6-9]{1}\d{9}$/.test(number)
      ? false
      : true;
  return isValidNumber;
};

let otpString = '';
export const Login: React.FC<LoginProps> = (props) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const [verifyingPhoneNumber, setVerifyingPhonenNumber] = useState(false);
  const { analytics, currentUser } = useAuth();
  const [subscriptionId, setSubscriptionId] = useState<any>();

  useEffect(() => {
    analytics.setCurrentScreen(AppRoutes.Login);
    setVerifyingPhonenNumber(false);
    console.log('login currentUser', currentUser);
  }, [analytics, verifyingPhoneNumber, currentUser]);

  useEffect(() => {
    const subscriptionId = SmsListener.addListener((message: any) => {
      const newOtp = message.body.match(/-*[0-9]+/);
      console.log(newOtp[0], 'wertyuio');
      otpString = newOtp && newOtp.length > 0 ? newOtp[0] : '';
    });
    setSubscriptionId(subscriptionId);
  }, [subscriptionId]);

  useEffect(() => {
    return () => {
      subscriptionId && subscriptionId.remove();
    };
  }, [subscriptionId]);

  const validateAndSetPhoneNumber = (number: string) => {
    if (/^\d+$/.test(number) || number == '') {
      setPhoneNumber(number);
      if (number.length == 10) {
        setPhoneNumberIsValid(isPhoneNumberValid(number));
      }
    } else {
      return false;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={{ height: 56 }} />
        <Card
          cardContainer={{ marginTop: 0, height: 270 }}
          heading={string.LocalStrings.hello}
          description={string.LocalStrings.please_enter_no}
          buttonIcon={
            phoneNumberIsValid && phoneNumber.replace(/^0+/, '').length === 10 ? (
              <ArrowYellow />
            ) : (
              <ArrowDisabled />
            )
          }
          onClickButton={() => {
            Keyboard.dismiss();
            if (!(phoneNumber.length == 10 && phoneNumberIsValid)) {
              null;
            } else {
              setVerifyingPhonenNumber(true);
              firebase
                .auth()
                .signInWithPhoneNumber('+91' + phoneNumber)
                .then((confirmResult) => {
                  setVerifyingPhonenNumber(false);
                  props.navigation.navigate(AppRoutes.OTPVerification, {
                    phoneNumberVerificationCredential: confirmResult.verificationId,
                    confirmResult,
                    otpString,
                    phoneNumber: '+91' + phoneNumber,
                  });
                  console.log(confirmResult, 'confirmResult');
                })
                .catch((error) => {
                  console.log(error, 'error');
                  setVerifyingPhonenNumber(false);
                });
            }
            // setVerifyingPhonenNumber(true);
            // verifyPhoneNumber('+91' + phoneNumber).then((phoneNumberVerificationCredential) => {
            //   setVerifyingPhonenNumber(false);
            //   props.navigation.navigate(AppRoutes.OTPVerification, {
            //     phoneNumberVerificationCredential,
            //     otpString,
            //     phoneNumber: '+91' + phoneNumber,
            //   });
            // });
          }}
          disableButton={phoneNumberIsValid && phoneNumber.length === 10 ? false : true}
        >
          <View
            style={[
              { height: 56, paddingTop: 20 },
              phoneNumber == '' || phoneNumber.length < 10 || phoneNumberIsValid
                ? styles.inputValidView
                : styles.inputView,
            ]}
          >
            <Text style={styles.inputTextStyle}>{string.LocalStrings.numberPrefix}</Text>
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
              phoneNumber == '' || phoneNumber.length < 10 || phoneNumberIsValid
                ? styles.bottomValidDescription
                : styles.bottomDescription
            }
          >
            {phoneNumber == '' || phoneNumber.length < 10 || phoneNumberIsValid
              ? string.LocalStrings.otp_sent_to
              : string.LocalStrings.wrong_number}
          </Text>
        </Card>
      </SafeAreaView>
      {verifyingPhoneNumber ? (
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
          <ActivityIndicator animating={verifyingPhoneNumber} size="large" color="green" />
        </View>
      ) : null}
    </View>
  );
};
