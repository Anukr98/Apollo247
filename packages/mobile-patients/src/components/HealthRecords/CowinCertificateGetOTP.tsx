import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import DeviceInfo from 'react-native-device-info';
import { OperationType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  BackHandler,
  View,
  TextInput,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { NavigationScreenProps } from 'react-navigation';
import { useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import _ from 'lodash';
import { GET_BENEFICIARY_PROFILES, GET_OTP_COWIN } from '@aph/mobile-patients/src/graphql/profiles';
import { CowinLoginVerify } from '@aph/mobile-patients/src/graphql/types/CowinLoginVerify';
import { isValidText } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { buildVaccineApolloClient } from '@aph/mobile-patients/src/components/Vaccination/VaccinationApolloClient';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { GetCowinBeneficiary } from '@aph/mobile-patients/src/graphql/types/GetCowinBeneficiary';

const styles = StyleSheet.create({
  cardViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    marginBottom: 15,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 29,
  },
  registrationID: {
    ...viewStyles.text('R', 14, '#0087BA', 1, 21),
    top: 5,
  },
  labelTextStyle: {
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 18,
    ...theme.fonts.IBMPlexSansRegular(14),
    paddingRight: 10,
  },
  valuesTextStyle: {
    color: theme.colors.SKY_BLUE,
    lineHeight: 16,
    textAlign: 'right',
    flex: 1,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  safeAreaViewStyle: {
    ...theme.viewStyles.container,
  },
  mainViewStyle: {
    flex: 1,
  },
  stickyBottomComponentStyle: {
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 30,
  },
  recordNameContainer: {
    flexDirection: 'column',
    marginTop: 20,
    width: '95%',
    left: 5,
    justifyContent: 'space-between',
    borderColor: '#00B38E',
    borderBottomWidth: 2,
  },
  doctorInputContainer: {
    ...theme.fonts.IBMPlexSansMedium(15),
    color: 'grey',
    width: '100%',
  },
  fieldTitle: {
    ...theme.fonts.IBMPlexSansMedium(13),
    color: '#01475B',
  },
  otpContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    left: 5,
  },
  enterNumberText: {
    ...viewStyles.text('M', 16, '#02475B', 1, 21),
    marginTop: 20,
  },
  iconContainer: {
    right: 25,
    alignContent: 'center',
  },
  warningMessageContainer: {
    ...viewStyles.text('M', 13, '#01475B', 1, 21),
    left: 5,
  },
  warningMessage: {
    marginTop: 5,
    width: '85%',
    justifyContent: 'center',
    left: 30,
  },
  submitBtn: {
    marginTop: 25,
    width: '40%',
    left: 120,
  },
});

export interface CowinCertificateGetOTPProps extends NavigationScreenProps {}

export const CowinCertificateGetOTP: React.FC<CowinCertificateGetOTPProps> = (props) => {
  const { authToken } = useAuth();
  const apolloVaccineClient = buildVaccineApolloClient(authToken);
  const [enterOTP, setEnterOTP] = useState<string>('');
  const [phoneNum, setPhoneNum] = useState<any>(
    props.navigation.state.params.phoneNo ? props.navigation.state.params.phoneNo : ''
  );
  const [txtID, setTxtID] = useState<any>(
    props.navigation.state.params.taxationID ? props.navigation.state.params.taxationID : ''
  );
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(60);
  const [startCountdown, setStartCountdown] = useState<boolean>(false);

  useEffect(() => {
    if (startCountdown) {
      const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
      if (counter === 0) {
        setStartCountdown(false);
        setCounter(60);
      }

      return () => clearInterval(timer);
    }
  }, [counter, startCountdown]);

  const getOTPFromPrism = () => {
    setStartCountdown(true);
    if (phoneNum) {
      resendOTP();
    }
  };

  const resendOTP = () => {
    setshowSpinner!(true);
    if (phoneNum) {
      apolloVaccineClient
        .query<CowinLoginVerify>({
          query: GET_OTP_COWIN,
          variables: {
            cowinLoginVerify: {
              operationType: OperationType.GENERATE_OTP,
              mobileNumber: phoneNum,
              otp: '',
              txnId: '',
            },
          },
          fetchPolicy: 'no-cache',
          context: {
            headers: { 'x-app-OS': Platform.OS, 'x-app-version': DeviceInfo.getVersion() },
          },
        })
        .then((response: any) => {
          setshowSpinner!(false);
          Alert.alert('OK', 'OTP has been sent to your mobile');
        })
        .catch((error: any) => {
          setshowSpinner!(false);
          Alert.alert(string.login.oops, string.common.phr_api_error_text);
          console.log(error, 'errr');
        })
        .finally(() => {
          setshowSpinner!(false);
        });
    }
  };

  const verifyOTPFromCowin = () => {
    if (!enterOTP) {
      return Alert.alert('Warning', 'Please enter your OTP to proceed');
    }
    setshowSpinner!(true);
    apolloVaccineClient
      .query<CowinLoginVerify>({
        query: GET_OTP_COWIN,
        variables: {
          cowinLoginVerify: {
            operationType: OperationType.VERIFY_OTP,
            mobileNumber: phoneNum,
            otp: enterOTP,
            txnId: txtID,
          },
        },
        fetchPolicy: 'no-cache',
        context: { headers: { 'x-app-OS': Platform.OS, 'x-app-version': DeviceInfo.getVersion() } },
      })
      .then((response) => {
        if (response?.data?.cowinLoginVerify?.code === 401) {
          return Alert.alert('Oh Sorry... :(', 'Please relogin again!!', [
            {
              text: 'OK',
              onPress: () => props.navigation.navigate(AppRoutes.CowinCertificateOTPScreen),
            },
          ]);
        } else if (response?.data?.cowinLoginVerify?.code === 400) {
          return Alert.alert(string.login.oops, 'Invalid OTP');
        }
        getBeneficiaryID(response?.data?.cowinLoginVerify?.response?.token);
      })
      .catch((error) => {
        setshowSpinner!(false);
        Alert.alert(string.login.oops, string.common.phr_api_error_text);
      })
      .finally(() => {
        setshowSpinner!(false);
      });
  };

  const getBeneficiaryID = (token: any) => {
    if (enterOTP) {
      apolloVaccineClient
        .query<GetCowinBeneficiary>({
          query: GET_BENEFICIARY_PROFILES,
          variables: {
            getCowinBeneficiary: {
              mobileNumber: phoneNum,
            },
          },
          fetchPolicy: 'no-cache',
          context: {
            headers: { 'x-app-OS': Platform.OS, 'x-app-version': DeviceInfo.getVersion() },
          },
        })
        .then((response) => {
          if (response?.data?.getCowinBeneficiary?.response?.length > 0) {
            props.navigation.navigate(AppRoutes.CowinProfileSelection, {
              beneficiaryIDData: response?.data?.getCowinBeneficiary?.response,
              cowinToken: token,
            });
          } else {
            Alert.alert('OOPS', 'it seems that you dont have any beneficiaries');
          }
          setshowSpinner!(false);
        })
        .catch((error) => {
          setshowSpinner!(false);
          Alert.alert(string.login.oops, string.common.phr_api_error_text);
        })
        .finally(() => {
          setshowSpinner!(false);
        });
    }
  };

  const handleBack = async () => {
    BackHandler.removeEventListener('hardwareBackPress', handleBack);
    onGoBack();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    };
  }, []);

  const renderTopDetailsView = () => {
    var string = phoneNum?.replace(/^.{8}/g, 'XXXXXXXX');
    return (
      <>
        <View style={styles.cardViewStyle}>
          <View style={styles.otpContainer}>
            <Text style={{ ...viewStyles.text('M', 13, '#02475B', 1, 21) }}>
              {`${'An OTP has been sent to ' + string}`}
            </Text>
            <Text style={styles.enterNumberText}>{'OTP'}</Text>
          </View>
          <View
            style={[
              styles.recordNameContainer,
              { flexDirection: 'row', marginTop: Platform.OS === 'android' ? 5 : 20 },
            ]}
          >
            <TextInput
              placeholder={'Enter the OTP'}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={6}
              style={[styles.doctorInputContainer, { bottom: Platform.OS === 'android' ? 0 : 5 }]}
              numberOfLines={1}
              value={enterOTP}
              onChangeText={(OTP) => {
                if (isValidText(OTP)) {
                  setEnterOTP(OTP);
                }
              }}
            ></TextInput>
          </View>
          {startCountdown === false ? (
            <TouchableOpacity
              style={{ marginTop: Platform.OS === 'android' ? 10 : 15 }}
              onPress={() => getOTPFromPrism()}
            >
              <Text style={{ ...viewStyles.text('M', 13, '#FC9916', 1, 21), left: 5 }}>
                {'RESEND OTP'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text
              style={[
                styles.warningMessageContainer,
                { marginTop: Platform.OS === 'android' ? 10 : 15 },
              ]}
            >
              {'Resend OTP in 0:' + `${counter}`}
            </Text>
          )}
        </View>
        {renderWarningMessage()}
        {renderDownloadCowinCertificate()}
      </>
    );
  };

  const renderWarningMessage = () => {
    return (
      <View style={styles.warningMessage}>
        <Text style={{ ...viewStyles.text('R', 14, '#979797', 1, 21) }}>
          {string.common.cowinDelayMessage}
        </Text>
      </View>
    );
  };

  const onGoBack = () => {
    props.navigation.state.params?.onPressBack && props.navigation.state.params?.onPressBack();
    props.navigation.goBack();
  };
  const renderDownloadCowinCertificate = () => {
    return (
      <View style={styles.submitBtn}>
        <Button
          title={'SUBMIT'}
          disabled={!enterOTP}
          onPress={() => {
            verifyOTPFromCowin();
          }}
        />
      </View>
    );
  };
  return (
    <View style={styles.mainViewStyle}>
      <SafeAreaView style={styles.safeAreaViewStyle}>
        <Header
          title={'CoWin OTP VERIFICATION'}
          leftIcon="backArrow"
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={onGoBack}
        />
        <ScrollView bounces={false}>{renderTopDetailsView()}</ScrollView>
        {showSpinner && <Spinner />}
      </SafeAreaView>
    </View>
  );
};
