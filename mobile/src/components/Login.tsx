import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { Card } from 'app/src/components/ui/Card';
import { ArrowDisabled, ArrowYellow } from 'app/src/components/ui/Icons';
import { string } from 'app/src/strings/string';
import { theme } from 'app/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useAuth } from '../hooks/authHooks';

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
    number.replace(/^0+/, '').length !== 10 && number.length !== 0 ? false : true;
  return isValidNumber;
};

export const Login: React.FC<LoginProps> = (props) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const phoneNumberIsValid = isPhoneNumberValid(phoneNumber);
  const [verifyingPhoneNumber, setVerifyingPhonenNumber] = useState(false);
  const { verifyPhoneNumber, analytics } = useAuth();

  useEffect(() => analytics.setCurrentScreen(AppRoutes.Login), []);

  return (
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
          setVerifyingPhonenNumber(true);
          verifyPhoneNumber('+91' + phoneNumber).then((phoneNumberVerificationCredential) => {
            setVerifyingPhonenNumber(false);
            props.navigation.navigate(AppRoutes.OTPVerification, {
              phoneNumberVerificationCredential,
            });
          });
        }}
        disableButton={phoneNumberIsValid ? false : true}
      >
        <View
          style={[
            { height: 56, paddingTop: 20 },
            phoneNumberIsValid ? styles.inputValidView : styles.inputView,
          ]}
        >
          <Text style={styles.inputTextStyle}>{string.LocalStrings.numberPrefix}</Text>
          <TextInput
            autoFocus
            style={styles.inputStyle}
            keyboardType="numeric"
            maxLength={10}
            value={phoneNumber}
            onChangeText={(value) => setPhoneNumber(value)}
          />
        </View>
        <Text style={phoneNumberIsValid ? styles.bottomValidDescription : styles.bottomDescription}>
          {phoneNumberIsValid ? string.LocalStrings.otp_sent_to : string.LocalStrings.wrong_number}
        </Text>
      </Card>
    </SafeAreaView>
  );
};
