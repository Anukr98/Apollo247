import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { OtpCard } from '@aph/mobile-doctors/src/components/ui/OtpCard';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
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
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import NeedHelpStyles from '@aph/mobile-doctors/src/components/NeedHelp.styles';

const styles = NeedHelpStyles;

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
        <View style={styles.needHeight} />
        <OtpCard
          cardContainer={{ marginTop: 0, height: 300 }}
          heading={strings.login.needhelp}
          description={strings.login.callback}
          onPress={() => props.navigation.goBack()}
        >
          <View
            style={[
              { height: 56, paddingTop: 20 },
              phoneNumber == '' || phoneNumberIsValid ? styles.inputValidView : styles.inputView,
            ]}
          >
            <Text style={styles.inputTextStyle}>{strings.login.numberPrefix}</Text>
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
            title={strings.buttons.call_me}
            titleTextStyle={styles.titleTextStyle}
            style={
              phoneNumber == '' || phoneNumberIsValid ? styles.buttonViewfull : styles.buttonView
            }
            onPress={() => props.navigation.push(AppRoutes.NeedHelpDonePage)}
            disabled={phoneNumberIsValid && phoneNumber.length === 10 ? false : true}
          />
        </OtpCard>
      </SafeAreaView>
      {verifyingPhoneNumber ? (
        <View style={styles.needhelpview}>
          <ActivityIndicator animating={verifyingPhoneNumber} size="large" color="green" />
        </View>
      ) : null}
    </View>
  );
};
