import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { GrayEditIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import DeviceInfo from 'react-native-device-info';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  BackHandler,
  View,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { NavigationScreenProps } from 'react-navigation';
import { useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import { GET_OTP_COWIN } from '@aph/mobile-patients/src/graphql/profiles';
import { CowinLoginVerify } from '@aph/mobile-patients/src/graphql/types/CowinLoginVerify';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import _ from 'lodash';
import { OperationType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { isValidText } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { buildVaccineApolloClient } from '@aph/mobile-patients/src/components/Vaccination/VaccinationApolloClient';

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

export interface CowinCertificateOTPScreenProps extends NavigationScreenProps {}

export const CowinCertificateOTPScreen: React.FC<CowinCertificateOTPScreenProps> = (props) => {
  const { authToken } = useAuth();
  const apolloVaccineClient = buildVaccineApolloClient(authToken);
  const [phoneNo, setPhoneNo] = useState<string>('');
  const [showSpinner, setshowSpinner] = useState<boolean>(false);

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
    return (
      <>
        <View style={styles.cardViewStyle}>
          <View style={styles.otpContainer}>
            <Text style={{ ...viewStyles.text('M', 13, '#02475B', 1, 21) }}>
              {'An OTP will be sent to this number'}
            </Text>
            <Text style={[styles.enterNumberText]}>{'Enter Phone Number'}</Text>
          </View>
          <View
            style={[
              styles.recordNameContainer,
              {
                flexDirection: 'row',
                marginTop: Platform.OS === 'android' ? 5 : 20,
              },
            ]}
          >
            <TextInput
              placeholder={'Enter Phone Number'}
              keyboardType="number-pad"
              maxLength={10}
              style={[styles.doctorInputContainer, { bottom: Platform.OS === 'android' ? 0 : 5 }]}
              numberOfLines={1}
              returnKeyType="done"
              onSubmitEditing={() => getOTPFromCOWIN(phoneNo)}
              value={phoneNo}
              onChangeText={(phoneNo) => {
                if (isValidText(phoneNo)) {
                  setPhoneNo(phoneNo);
                }
              }}
            ></TextInput>
            <GrayEditIcon
              style={[
                styles.iconContainer,
                {
                  bottom: Platform.OS === 'android' ? 0 : 5,
                  top: Platform.OS === 'android' ? 10 : undefined,
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.warningMessageContainer,
              { marginTop: Platform.OS === 'android' ? 10 : 15 },
            ]}
          >
            {string.common.cowinPhoneAlertMessage}
          </Text>
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

  const getOTPFromCOWIN = (phoneNum: any) => {
    const prefixNumber = `+91${phoneNum}`;
    setshowSpinner!(true);
    if (phoneNum) {
      apolloVaccineClient
        .query<CowinLoginVerify>({
          query: GET_OTP_COWIN,
          variables: {
            cowinLoginVerify: {
              operationType: OperationType.GENERATE_OTP,
              mobileNumber: prefixNumber,
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
          props.navigation.navigate(AppRoutes.CowinCertificateGetOTP, {
            phoneNo: prefixNumber,
            taxationID: response?.data?.cowinLoginVerify?.response?.txnId,
          });
        })
        .catch((error: any) => {
          setshowSpinner!(false);
          Alert.alert(string.login.oops, string.common.phr_api_error_text);
        })
        .finally(() => {
          setshowSpinner!(false);
        });
    }
  };

  const onGoBack = () => {
    props.navigation.state.params?.onPressBack && props.navigation.state.params?.onPressBack();
    props.navigation.goBack();
  };
  const renderDownloadCowinCertificate = () => {
    const enableButton = phoneNo.length >= 10 ? false : true;
    return (
      <View style={styles.submitBtn}>
        <Button disabled={enableButton} title={'SUBMIT'} onPress={() => getOTPFromCOWIN(phoneNo)} />
      </View>
    );
  };
  return (
    <View style={styles.mainViewStyle}>
      <SafeAreaView style={styles.safeAreaViewStyle}>
        <Header
          title={'Download CoWin Certificate'}
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
