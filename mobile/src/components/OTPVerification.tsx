import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { Card } from 'app/src/components/ui/Card';
import { BackArrow, OkText, OkTextDisabled } from 'app/src/components/ui/Icons';
import { string } from 'app/src/strings/string';
import { theme } from 'app/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SmsListener from 'react-native-android-sms-listener';
import OTPTextView from 'react-native-otp-textinput';
import { NavigationScreenProps } from 'react-navigation';
import firebase from 'react-native-firebase';
import { PATIENT_SIGN_IN } from 'app/src/graphql/profiles';
import { useMutation } from 'react-apollo-hooks';

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
  },
  inputView: {
    flexDirection: 'row',
    justifyContent: 'center',
    // width: '100%',
    height: 56,
    marginBottom: 8,
    paddingTop: 2,
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
    width: '14%',
    margin: 0,
    height: 48,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    ...theme.fonts.IBMPlexSansMedium(18),
  },
});

let timer = 5;
export interface OTPVerificationProps extends NavigationScreenProps {}
export const OTPVerification: React.FC<OTPVerificationProps> = (props) => {
  const [subscriptionId, setSubscriptionId] = useState<any>();
  const [isValidOTP, setIsValidOTP] = useState<boolean>(true);
  const [invalidOtpCount, setInvalidOtpCount] = useState<number>(0);
  const [showErrorMsg, setShowErrorMsg] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(900);
  const [intervalId, setIntervalId] = useState<any>();
  const [otp, setOtp] = useState<string>('');
  const [IdToken, setIdToken] = useState<string>('');

  const patientSignIn = useMutation(PATIENT_SIGN_IN, {
    variables: {
      jwt: IdToken,
    },
  });

  const onClickOk = async () => {
    const verificationId = props.navigation.state.params.confirmResult;
    console.log('verificationId', verificationId);

    const credential = await firebase.auth.PhoneAuthProvider.credential(verificationId, otp);
    firebase.auth().signInWithCredential(credential);
    firebase.auth().onAuthStateChanged(async (updatedUser) => {
      if (updatedUser) {
        const result = await updatedUser!.getIdTokenResult();
        console.log('await IdToken', IdToken);

        if (result) {
          setIdToken(result.token);

          const { data, error, loading } = patientSignIn();
          console.log('data', data);
          console.log('error', error);
          console.log('loading', loading);
        }
      }
    });
  };

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime - minutes * 60;
  const textInputRef = React.useRef<any>(null);
  useEffect(() => {
    const subscriptionId = SmsListener.addListener((message) => {
      console.log('message', message);
    });
    setSubscriptionId(subscriptionId);
    textInputRef.current.inputs && textInputRef.current.inputs[0].focus();
    console.log('useeffect', textInputRef);
  }, []);

  useEffect(() => {
    return () => {
      subscriptionId && subscriptionId.remove();
    };
  }, [subscriptionId]);
  useEffect(() => {
    if (timer === 0) {
      console.log('timer', 'wedfrtgy5u676755ertyuiojkhgfghjkgf');
      timer = 900;
      setRemainingTime(900);
      setShowErrorMsg(false);
      setInvalidOtpCount(0);
      setIsValidOTP(true);
      clearInterval(intervalId);
      setTimeout(() => textInputRef.current.inputs && textInputRef.current.inputs[0].focus(), 1000);
    }
  }, [timer, intervalId]);

  const verifyOtp = (otp: any) => {
    setOtp(otp);
    console.log(otp, 'ooottppppp');
    if (otp.length === 6) {
      setIsValidOTP(true);
    } else {
      setIsValidOTP(false);
    }
  };

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
          key={1}
          cardContainer={{ marginTop: 0, height: 270 }}
          heading={string.LocalStrings.oops}
          description={string.LocalStrings.incorrect_otp_message}
          // buttonIcon={isValidOTP ? <OkText /> : <OkTextDisabled />}
          // onClickButton={onClickOk}
          disableButton={isValidOTP ? false : true}
          descriptionTextStyle={{ paddingBottom: Platform.OS === 'ios' ? 0 : 30 }}
        >
          <View style={styles.inputView}>
            <OTPTextView
              handleTextChange={(otp: string) => setOtp(otp)}
              inputCount={6}
              keyboardType="numeric"
              defaultValue={otp}
              textInputStyle={styles.codeInputStyle}
              tintColor={'rgba(0, 179, 142, 0.4)'}
              offTintColor={'rgba(0, 179, 142, 0.4)'}
              containerStyle={{ flex: 1 }}
              editable={false}
            />
          </View>
          <Text style={[styles.errorText]}>
            Try again after — {minutes} : {seconds}
          </Text>
        </Card>
      ) : (
        <Card
          key={2}
          cardContainer={{ marginTop: 0, height: 270 }}
          heading={string.LocalStrings.great}
          description={string.LocalStrings.type_otp_text}
          buttonIcon={isValidOTP && otp.length === 6 ? <OkText /> : <OkTextDisabled />}
          onClickButton={onClickOk}
          disableButton={isValidOTP && otp.length === 6 ? false : true}
          descriptionTextStyle={{ paddingBottom: Platform.OS === 'ios' ? 0 : 30 }}
        >
          <View style={styles.inputView}>
            <OTPTextView
              ref={textInputRef}
              handleTextChange={verifyOtp}
              inputCount={6}
              keyboardType="numeric"
              defaultValue={otp}
              textInputStyle={styles.codeInputStyle}
              tintColor={
                isValidOTP && otp.length === 0
                  ? theme.colors.INPUT_BORDER_SUCCESS
                  : theme.colors.INPUT_BORDER_FAILURE
              }
              offTintColor={
                isValidOTP && otp.length === 0
                  ? theme.colors.INPUT_BORDER_SUCCESS
                  : theme.colors.INPUT_BORDER_FAILURE
              }
              containerStyle={{ flex: 1 }}
            />
          </View>
          {showErrorMsg && (
            <Text style={styles.errorText}>
              Incorrect OTP. You have {3 - invalidOtpCount} more tries.
            </Text>
          )}
          {
            <Text style={styles.bottomDescription} onPress={onClickOk}>
              {!isValidOTP ? string.LocalStrings.resend_opt : ' '}
            </Text>
          }
        </Card>
      )}
    </SafeAreaView>
  );
};
