import { AppRoutes } from 'app/src/components/AppNavigatorContainer';
import { Card } from 'app/src/components/ui/Card';
import { BackArrow, OkText, OkTextDisabled } from 'app/src/components/ui/Icons';
import { string } from 'app/src/strings/string';
import { theme } from 'app/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import OTPTextView from 'react-native-otp-textinput';
import { NavigationScreenProps } from 'react-navigation';
const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  inputView: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    marginBottom: 8,
  },
  errorText: {
    lineHeight: 24,
    color: theme.colors.INPUT_FAILURE_TEXT,
    ...theme.fonts.IBMPlexSansMedium(12),
    paddingBottom: 3,
  },
  bottomDescription: {
    lineHeight: 24,
    color: theme.colors.INPUT_INFO,
    ...theme.fonts.IBMPlexSansSemiBold(12),
  },
  codeInputStyle: {
    borderBottomWidth: 2,
    width: '15%',
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

export const OTPVerification: React.FC<OTPVerificationProps> = (props) => {
  const [subscriptionId, setSubscriptionId] = useState<any>();
  const [isValidOTP] = useState<boolean>(false);
  const [invalidOtpCount, setInvalidOtpCount] = useState<number>(0);
  const [showErrorMsg, setShowErrorMsg] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(900);
  const [intervalId] = useState<number>(0);
  const [otp, setOtp] = useState<string>('');
  useEffect(() => {
    const subscriptionId = SmsListener.addListener((message: any) => {});
    setSubscriptionId(subscriptionId);
  }, []);

  useEffect(() => {
    return () => {
      subscriptionId && subscriptionId.remove();
    };
  }, [subscriptionId]);

  useEffect(() => {
    if (timer === 0) {
      setTimer(900);
      setShowErrorMsg(false);
      setInvalidOtpCount(0);

      clearInterval(intervalId);
    }
  }, [timer, intervalId]);
  const minutes = Math.floor(timer / 60);
  const seconds = timer - minutes * 60;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: 56, justifyContent: 'center', paddingLeft: 20 }}>
        <TouchableOpacity
          style={{ height: 25, width: 25, justifyContent: 'center' }}
          onPress={() => props.navigation.navigate(AppRoutes.Login)}
        >
          <BackArrow />
        </TouchableOpacity>
      </View>
      {invalidOtpCount === 3 && !isValidOTP ? (
        <Card
          cardContainer={{ marginTop: 0, height: 270 }}
          heading={string.LocalStrings.oops}
          description={string.LocalStrings.incorrect_otp_message}
          buttonIcon={isValidOTP ? <OkText /> : <OkTextDisabled />}
          onClickButton={() => props.navigation.navigate(AppRoutes.SignUp)}
          disableButton={isValidOTP ? false : true}
          descriptionTextStyle={{ paddingBottom: Platform.OS === 'ios' ? 7 : 30 }}
        >
          <View style={styles.inputView}>
            <OTPTextView
              handleTextChange={(otp: string) => setOtp(otp)}
              inputCount={5}
              keyboardType="numeric"
              defaultValue={otp}
              textInputStyle={styles.codeInputStyle}
              tintColor={theme.colors.INPUT_BORDER_SUCCESS}
              offTintColor={theme.colors.INPUT_BORDER_SUCCESS}
            />
          </View>
          <Text style={[styles.errorText]}>
            Try again after — {minutes} : {seconds}
          </Text>
        </Card>
      ) : (
        <Card
          cardContainer={{ marginTop: 0, height: 270 }}
          heading={string.LocalStrings.great}
          description={string.LocalStrings.type_otp_text}
          buttonIcon={isValidOTP ? <OkText /> : <OkTextDisabled />}
          onClickButton={() => props.navigation.navigate(AppRoutes.SignUp)}
          disableButton={isValidOTP ? false : true}
          descriptionTextStyle={{ paddingBottom: Platform.OS === 'ios' ? 0 : 30 }}
        >
          <View style={styles.inputView}>
            <OTPTextView
              handleTextChange={(otp: any) => setOtp(otp)}
              inputCount={5}
              keyboardType="numeric"
              defaultValue={otp}
              textInputStyle={styles.codeInputStyle}
              tintColor={theme.colors.INPUT_BORDER_SUCCESS}
              offTintColor={theme.colors.INPUT_BORDER_SUCCESS}
            />
          </View>
          {showErrorMsg && (
            <Text style={styles.errorText}>
              Incorrect OTP. You have {3 - invalidOtpCount} more tries.
            </Text>
          )}
          {
            <Text style={styles.bottomDescription} onPress={() => {}}>
              {!isValidOTP ? string.LocalStrings.resend_opt : ' '}
            </Text>
          }
        </Card>
      )}
    </SafeAreaView>
  );
};
