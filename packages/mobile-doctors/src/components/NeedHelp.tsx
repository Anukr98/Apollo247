import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { OtpCard } from 'app/src/components/ui/OtpCard';
import { Button } from 'app/src/components/ui/Button';
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
  Alert,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { useAuth } from '../hooks/authHooks';
import { ifIphoneX } from 'react-native-iphone-x-helper';

const styles = StyleSheet.create({
  container: {
    //...theme.viewStyles.container,
    flex: 1,
    width: '100%',
    height: 600,
    backgroundColor: '#f0f4f5',
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

  statusBarBg: {
    width: '100%',
    opacity: 0.05,
    backgroundColor: '#000000',
    ...ifIphoneX(
      {
        height: 44,
      },
      {
        height: 24,
      }
    ),
  },
  buttonView: {
    height: 40,
    borderRadius: 5,
    backgroundColor: '#fed6a2',
    width: 200,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 32,
  },

  titleTextStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.BUTTON_TEXT,
  },
});

export interface NeedHelpProps extends NavigationScreenProps {}

const isPhoneNumberValid = (number: string) => {
  const isValidNumber =
    // (number.replace(/^0+/, '').length !== 10 && number.length !== 0) ||
    !/^[6-9]{1}\d{0,9}$/.test(number) ? false : true;
  return isValidNumber;
};

export const NeedHelp: React.FC<NeedHelpProps> = (props) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);
  const [verifyingPhoneNumber, setVerifyingPhonenNumber] = useState(false);
  const { analytics, currentUser, authError, clearCurrentUser } = useAuth();

  useEffect(() => {
    //  analytics.setCurrentScreen(AppRoutes.Login);
    // setVerifyingPhonenNumber(false);
    console.log('login currentUser', currentUser);
  }, [analytics, currentUser]);

  useEffect(() => {
    console.log('login Screen');
  }, []);

  useEffect(() => {
    console.log('authError Login', authError);
    if (authError) {
      clearCurrentUser();
      setVerifyingPhonenNumber(false);
      Alert.alert('Error', 'Unable to connect the server at the moment.');
    }
  }, [authError]);

  const validateAndSetPhoneNumber = (number: string) => {
    if (/^\d+$/.test(number) || number == '') {
      setPhoneNumber(number);
      // if (number.length == 10) {
      setPhoneNumberIsValid(isPhoneNumberValid(number));
      // }
    } else {
      return false;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusBarBg} />
      <SafeAreaView style={styles.container}>
        <View style={{ height: 56 }} />
        <OtpCard
          cardContainer={{ marginTop: 0, height: 300 }}
          heading={string.LocalStrings.needhelp}
          description={string.LocalStrings.callback}
          onPress={() => props.navigation.goBack()}
          // disableButton={phoneNumberIsValid && phoneNumber.length === 10 ? false : true}
        >
          <View
            style={[
              { height: 56, paddingTop: 20 },
              phoneNumber == '' || phoneNumberIsValid ? styles.inputValidView : styles.inputView,
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
          <Button
            title="CALL ME"
            titleTextStyle={styles.titleTextStyle}
            style={styles.buttonView}
            //onPress={() => props.navigation.push(AppRoutes.OnBoardingPage)}
          />
        </OtpCard>
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
