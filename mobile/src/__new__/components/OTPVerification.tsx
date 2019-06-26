import React, { Component, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View, TextInput } from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import CodeInput from 'react-native-confirmation-code-input';
import { theme } from 'app/src/__new__/theme/theme';
import { string } from 'app/src/__new__/strings/string';
import { AppRoutes } from 'app/src/__new__/components/AppNavigatorContainer';
import { NavigationScreenProps } from 'react-navigation';
import { Card } from 'app/src/__new__/components/ui/Card';
import { number } from 'prop-types';
import OTPTextView from 'react-native-otp-textinput';
import firebase from 'react-native-firebase';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
    paddingTop: 2,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
    paddingRight: 6,
  },
  inputView: {
    flexDirection: 'row',
    // alignItems: 'space-between',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: 4,
  },
  errorText: {
    color: theme.colors.INPUT_FAILURE_TEXT,
    ...theme.fonts.IBMPlexSansMedium(12),
    paddingTop: 10,
  },
  bottomDescription: {
    fontSize: 12,
    color: theme.colors.INPUT_INFO,
    paddingVertical: 10,
    ...theme.fonts.IBMPlexSansSemiBold(12),
  },
  codeInputStyle: {
    borderBottomWidth: 2,
    width: '16%',
    height: 48,
    shadowColor: 'rgba(96, 125, 139, 0.25)',
    shadowRadius: 5,
    shadowOpacity: 2,
    shadowOffset: { width: 0, height: 2 },
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    ...theme.fonts.IBMPlexSansMedium(18),
  },
});

export interface OTPVerificationProps extends NavigationScreenProps {}

const isPhoneNumberValid = (number: string) => {
  const isValidNumber =
    number.replace(/^0+/, '').length !== 10 && number.length !== 0 ? false : true;
  return isValidNumber;
};

export const OTPVerification: React.FC<OTPVerificationProps> = (props) => {
  const codeInputRef = React.useRef<any>(null);
  useEffect(() => {
    console.log('wertyucvbnmfgik mounted');
    const verificationCode = '1234';
    const tmp = [...verificationCode];
    // codeInputRef.setState({ codeArr: tmp, currentIndex: 3 });
    const subscriptionId = SmsListener.addListener((message: any) => {
      console.log(message, 'message');
    });
    setSubscriptionId(subscriptionId);
  }, []);

  useEffect(() => {
    return () => {
      subscriptionId && subscriptionId.remove();
    };
  }, []);

  const _onFulfill = (isValidOTP: boolean) => {
    console.log(isValidOTP, 'obj');
    setIsValidOTP(isValidOTP);
    setShowErrorMsg(!isValidOTP);
    setInvalidOtpCount(invalidOtpCount + 1);
    if (invalidOtpCount === 3 && !isValidOTP) {
      const intervalId = setInterval(() => setTimer(timer - 1), 1000);
      setIntervalId(intervalId);
    }
  };

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const phoneNumberIsValid = isPhoneNumberValid(phoneNumber);
  const [subscriptionId, setSubscriptionId] = useState<any>();
  const [isValidOTP, setIsValidOTP] = useState<boolean>(false);
  const [invalidOtpCount, setInvalidOtpCount] = useState<number>(0);
  const [showErrorMsg, setShowErrorMsg] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(180);
  const [intervalId, setIntervalId] = useState<number>(0);
  const [otp, setOtp] = useState<number>(0);

  useEffect(() => {
    if (timer === 0) {
      setTimer(180);
      setShowErrorMsg(false);
      setInvalidOtpCount(0);

      clearInterval(intervalId);
    }
  }, [timer, intervalId]);
  const minutes = Math.floor(timer / 60);
  const seconds = timer - minutes * 60;

  useEffect(() => {
    firebase.analytics().setCurrentScreen('OTPVerification');
  });

  return (
    <View style={styles.container}>
      {invalidOtpCount === 3 && !isValidOTP ? (
        <Card
          heading={string.LocalStrings.oops}
          description={string.LocalStrings.incorrect_otp_message}
          buttonIcon={isValidOTP ? 'ic_ok' : 'ok_disabled'}
          onClickButton={() => props.navigation.navigate(AppRoutes.SignUp)}
          disableButton={isValidOTP ? false : true}
          descriptionTextStyle={{ paddingBottom: Platform.OS === 'ios' ? 7 : 30 }}
        >
          <View style={styles.inputView}>
            <CodeInput
              ref={codeInputRef}
              keyboardType="numeric"
              compareWithCode="4321"
              activeColor="#000"
              inactiveColor="rgba(96, 125, 139, 0.25)"
              autoFocus={false}
              ignoreCase={true}
              codeLength={4}
              inputPosition="center"
              size={50}
              containerStyle={{ marginTop: 0, justifyContent: 'center', backgroundColor: 'green' }}
              codeInputStyle={[styles.codeInputStyle, { borderColor: 'rgba(0, 179, 142,0.31)' }]}
              onFulfill={_onFulfill}
              className="border-b"
              secureTextEntry
            />
          </View>
          <Text style={[styles.errorText, { paddingBottom: 55 }]}>
            Try again after — {minutes} : {seconds}
          </Text>
        </Card>
      ) : (
        <Card
          heading={string.LocalStrings.great}
          description={string.LocalStrings.type_otp_text}
          buttonIcon={isValidOTP ? 'ic_ok' : 'ok_disabled'}
          onClickButton={() => props.navigation.navigate(AppRoutes.SignUp)}
          disableButton={isValidOTP ? false : true}
          descriptionTextStyle={{ paddingBottom: Platform.OS === 'ios' ? 7 : 30 }}
        >
          <View style={styles.inputView}>
            <OTPTextView
              containerStyle={{ marginTop: 3 }}
              handleTextChange={(otp: any) => setOtp(otp)}
              inputCount={5}
              keyboardType="numeric"
              defaultValue="12345"
              secureTextEntry={true}
              textInputStyle={styles.codeInputStyle}
            />
            {/* <CodeInput
              keyboardType="numeric"
              compareWithCode="4321"
              activeColor="#000"
              inactiveColor="rgba(96, 125, 139, 0.25)"
              autoFocus={true}
              ignoreCase={true}
              codeLength={4}
              inputPosition="center"
              size={50}
              containerStyle={{ marginTop: 8 }}
              codeInputStyle={styles.codeInputStyle}
              onFulfill={_onFulfill}
              className="border-b"
              secureTextEntry
            /> */}
          </View>
          {showErrorMsg && (
            <Text style={styles.errorText}>{string.LocalStrings.enter_correct_opt}</Text>
          )}
          {
            <Text style={styles.bottomDescription} onPress={() => {}}>
              {!isValidOTP ? string.LocalStrings.resend_opt : ' '}
            </Text>
          }
          <View style={{ paddingBottom: showErrorMsg ? 14 : 40 }} />
        </Card>
      )}
    </View>
  );
};
