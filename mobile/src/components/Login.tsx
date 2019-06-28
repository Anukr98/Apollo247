import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, SafeAreaView } from 'react-native';
import { theme } from 'app/src/theme/theme';
import { string } from 'app/src/strings/string';
import { NavigationScreenProps } from 'react-navigation';
import { Card } from 'app/src/components/ui/Card';
import { AppRoutes } from 'app/src/components/NavigatorContainer';
import firebase from 'react-native-firebase';
import { ArrowYellow, ArrowDisabled } from 'app/src/components/ui/Icons';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  inputTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.INPUT_TEXT,
    paddingRight: 6,
    lineHeight: 28,
    paddingBottom: 5,
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
    paddingVertical: 8,
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

  useEffect(() => {
    // firebase.analytics().setCurrentScreen('Login');
  });

  const onClickOk = () => {
    // props.navigation.navigate(AppRoutes.OTPVerification);
    firebase
      .auth()
      .signInWithPhoneNumber('+918328610737')
      .then((confirmResult) => {
        props.navigation.navigate(AppRoutes.OTPVerification, { confirmResult: confirmResult });
      }) // save confirm result to use with the manual verification code)
      .catch((error) => {
        console.log(error);
      });
    // firebase
    //   .auth()
    //   .verifyPhoneNumber('+91' + phoneNumber)
    //   .on(
    //     'state_changed',
    //     (phoneAuthSnapshot) => {
    //       switch (phoneAuthSnapshot.state) {
    //         case firebase.auth.PhoneAuthState.CODE_SENT:
    //           console.log('code sent', phoneAuthSnapshot);
    //           props.navigation.navigate(AppRoutes.OTPVerification);
    //           break;
    //         case firebase.auth.PhoneAuthState.ERROR:
    //           console.log('verification error');
    //           console.log(phoneAuthSnapshot.error);
    //           break;
    //       }
    //     },
    //     (error) => {
    //       console.log(error);
    //     }
    //   );
  };

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
        onClickButton={onClickOk}
        disableButton={phoneNumberIsValid ? false : true}
      >
        <View
          style={[{ height: 56 }, phoneNumberIsValid ? styles.inputValidView : styles.inputView]}
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
