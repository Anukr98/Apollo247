import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import NeedHelpStyles from '@aph/mobile-doctors/src/components/NeedHelp.styles';
import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { OtpCard } from '@aph/mobile-doctors/src/components/ui/OtpCard';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

const styles = NeedHelpStyles;

export interface NeedHelpProps extends NavigationScreenProps {}

const isPhoneNumberValid = (number: string) => {
  const isValidNumber = /^[6-9]{1}\d{0,9}$/.test(number);
  return isValidNumber;
};

export const NeedHelp: React.FC<NeedHelpProps> = (props) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneNumberIsValid, setPhoneNumberIsValid] = useState<boolean>(false);

  const validateAndSetPhoneNumber = (number: string) => {
    if (/^\d+$/.test(number) || number == '') {
      setPhoneNumber(number);
      setPhoneNumberIsValid(isPhoneNumberValid(number));
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
            disabled={!(phoneNumberIsValid && phoneNumber.length === 10)}
          />
        </OtpCard>
      </SafeAreaView>
    </View>
  );
};
