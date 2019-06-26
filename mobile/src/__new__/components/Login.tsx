import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput } from 'react-native';
import { theme } from 'app/src/__new__/theme/theme';
import { string } from 'app/src/__new__/strings/string';
import { NavigationScreenProps } from 'react-navigation';
import { Card } from 'app/src/__new__/components/ui/Card';
import { AppRoutes } from 'app/src/__new__/components/AppNavigatorContainer';
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
  inputStyle: {
    ...theme.fonts.IBMPlexSansMedium(18),
    // height: 28,
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
    color: theme.colors.INPUT_FAILURE_TEXT,
    opacity: 0.6,
    paddingVertical: 10,
    paddingBottom: 55,
    ...theme.fonts.IBMPlexSansMedium(12),
  },
  bottomValidDescription: {
    color: theme.colors.INPUT_SUCCESS_TEXT,
    opacity: 0.6,
    paddingVertical: 10,
    paddingBottom: 55,
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
    firebase.analytics().setCurrentScreen('Login');
  });

  return (
    <View style={styles.container}>
      <Card
        heading={string.LocalStrings.hello}
        description={string.LocalStrings.please_enter_no}
        buttonIcon={
          phoneNumberIsValid && phoneNumber.replace(/^0+/, '').length === 10
            ? 'arrow_yellow'
            : 'arrow_disabled'
        }
        onClickButton={() => props.navigation.navigate(AppRoutes.OTPVerification)}
        disableButton={phoneNumberIsValid ? false : true}
      >
        <View style={phoneNumberIsValid ? styles.inputValidView : styles.inputView}>
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
    </View>
  );
};
