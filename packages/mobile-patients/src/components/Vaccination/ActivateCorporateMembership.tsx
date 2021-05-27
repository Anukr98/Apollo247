import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  NavigationScreenProps,
  ScrollView,
  StackActions,
  NavigationActions,
} from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { GrayEditIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  dataSavedUserID,
  isSatisfyingEmailRegex,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '../UIElementsProvider';
import { useApolloClient } from 'react-apollo-hooks';
import { getCMSIdentifierByDomain } from '../../graphql/types/getCMSIdentifierByDomain';
import {
  VALIDATE_CORPORATE_DOMAIN,
  GENERATE_CORPORATE_OTP_MAIL,
  VERIFY_CORPORATE_EMAIL_OTP_AND_SUBSCRIBE,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GenerateOtpEmailId } from '../../graphql/types/GenerateOtpEmailId';
import { verifyCorporateEmailOtpAndSubscribe } from '../../graphql/types/verifyCorporateEmailOtpAndSubscribe';
import AsyncStorage from '@react-native-community/async-storage';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import string from '@aph/mobile-patients/src/strings/strings.json';

const styles = StyleSheet.create({
  headerContainer: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  safeAreaStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
  },
  labelStyle: {
    ...theme.viewStyles.text('SB', 14, '#02475B', 1, 20, 0.35),
    paddingBottom: 10,
  },
  verifyButton: {
    ...theme.viewStyles.text('SB', 14, '#FC9916', 1, 30, 0.35),
    textAlign: 'right',
  },
  otpSentToMail: {
    ...theme.viewStyles.text('M', 14, '#02475B', 0.5, 20, 0.35),
  },
});

export interface ActivateCorporateMembershipProps extends NavigationScreenProps {}

export const ActivateCorporateMembership: React.FC<ActivateCorporateMembershipProps> = (props) => {
  const [email, setEmail] = useState<string>('');
  const [isEmailVerified, setEmailVerified] = useState<boolean>(false);
  const [isOTPSent, setOTPSent] = useState<boolean>(false);
  const [otp, setOTP] = useState<string>('');
  const { showAphAlert, hideAphAlert } = useUIElements();
  const [loading, setLoading] = useState<boolean>(false);
  const [loginId, setLoginId] = useState<string>('');

  const client = useApolloClient();

  const validateCorporateDomain = (emailId: string) => {
    setLoading!(true);
    client
      .query<getCMSIdentifierByDomain>({
        query: VALIDATE_CORPORATE_DOMAIN,
        variables: {
          email: emailId || '',
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        if (response?.data?.getCMSIdentifierByDomain?.success == true) {
          //call next api
          setEmailVerified(true);
          generateCorporateOTPEmail(emailId);
        } else {
          //show message corporate domain is not valid with us.
          showAlertMessage('Oops !', string.vaccineBooking.not_eligible_for_corporate_benefits);
        }
      })
      .catch((error) => {
        showAlertMessage('Oops !', string.vaccineBooking.not_eligible_for_corporate_benefits);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const generateCorporateOTPEmail = (emailId: string) => {
    setLoading(true);
    client
      .query<GenerateOtpEmailId>({
        query: GENERATE_CORPORATE_OTP_MAIL,
        variables: {
          email: emailId || '',
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        if (response?.data?.GenerateOtpEmailId?.status == true) {
          setLoginId(response?.data?.GenerateOtpEmailId?.loginId || '');

          setOTPSent(true);

          showAlertMessage('Great !', string.vaccineBooking.sent_an_otp);
        } else {
          //show message corporate domain is not valid with us.
          showAlertMessage('Alert!', string.vaccineBooking.not_able_sent_otp);
        }
      })
      .catch((error) => {
        showAlertMessage('Alert!', string.vaccineBooking.not_able_sent_otp);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const verifyCorporateEmailOTPAndSubscribe = (otpString: string) => {
    setLoading(true);

    const corporateEmailOtpInput = {
      id: loginId,
      otp: otpString,
      loginType: 'EMAIL',
    };

    client
      .query<verifyCorporateEmailOtpAndSubscribe>({
        query: VERIFY_CORPORATE_EMAIL_OTP_AND_SUBSCRIBE,
        variables: {
          corporateEmailOtpInput: corporateEmailOtpInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((response) => {
        if (response?.data?.verifyCorporateEmailOtpAndSubscribe?.status == true) {
          //save data about sucecess, to be used by privious screen
          AsyncStorage.setItem('verifyCorporateEmailOtpAndSubscribe', 'true');

          showAphAlert &&
            showAphAlert({
              title: 'Congratulations !',
              description: string.vaccineBooking.benefit_activated,
              onPressOk: () => {
                hideAphAlert!();
                props.navigation.dispatch(
                  StackActions.reset({
                    index: 1,
                    key: null,
                    actions: [
                      NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom }),
                      NavigationActions.navigate({
                        routeName: AppRoutes.MembershipDetails,
                        params: {
                          membershipType: '',
                          isActive: true,
                          isCorporatePlan: true,
                          planId: '',
                        },
                      }),
                    ],
                  })
                );
              },
            });
        } else {
          showAlertMessage('Invalid OTP!', string.vaccineBooking.wrong_otp);
        }
      })
      .catch((error) => {
        showAlertMessage('Alert!', string.vaccineBooking.unable_to_validate);
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  const isOtpValid = (otp: string) => {
    if (otp.match(/[0-9]/) || otp != '') {
      if (otp.length == 6) {
        return true;
      }
      return false;
    } else {
      return false;
    }
  };

  const showAlertMessage = (title: string, message: string) => {
    showAphAlert &&
      showAphAlert({
        title: title,
        unDismissable: true,
        description: message,
        onPressOk: () => {
          hideAphAlert!();
        },
      });
  };

  const rightIcon = () => {
    return isOTPSent ? (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          setOTPSent(false);
        }}
      >
        <GrayEditIcon />
      </TouchableOpacity>
    ) : null;
  };

  const renderEmailInput = () => (
    <View>
      <TextInputComponent
        label={'Enter email id'}
        value={`${email}`}
        editable={!isOTPSent}
        inputStyle={{ color: '#01475B' }}
        onChangeText={(emailid) => setEmail(emailid)}
        placeholder={'Enter your corporate email id'}
        keyboardType={'email-address'}
        icon={rightIcon()}
      />
      <Text style={styles.otpSentToMail}>OTP will be sent to this email id</Text>
      {!isOTPSent ? (
        <TouchableOpacity
          onPress={() => {
            if (isSatisfyingEmailRegex(email)) {
              setEmail(email);
              // setOTPSent(true);
              validateCorporateDomain(email);
            } else {
              showAlertMessage('Alert!', 'Please recheck your corporate email id.');
            }
          }}
        >
          <Text style={styles.verifyButton}>VERIFY</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderOTPInput = () =>
    isOTPSent ? (
      <View>
        <TextInputComponent
          label={'OTP'}
          value={`${otp}`}
          editable={true}
          inputStyle={{ color: '#01475B' }}
          onChangeText={(enteredOTP) => setOTP(enteredOTP)}
          placeholder={'Enter OTP sent to your email'}
          keyboardType={'numeric'}
          maxLength={6}
        />
        <TouchableOpacity
          onPress={() => {
            if (isOtpValid(otp)) {
              verifyCorporateEmailOTPAndSubscribe(otp);
            } else {
              showAlertMessage('Alert!', 'Invalid OTP.Please check ');
            }
          }}
        >
          <Text style={styles.verifyButton}>SUBMIT</Text>
        </TouchableOpacity>
      </View>
    ) : null;

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={'ACTIVATE CORPORATE PACKAGE'}
          container={styles.headerContainer}
          onPressLeftIcon={() => {
            props.navigation.goBack();
          }}
        />

        <ScrollView bounces={false}>
          <View
            style={{
              padding: 20,
            }}
          >
            {renderEmailInput()}
            {renderOTPInput()}
          </View>
        </ScrollView>
        {loading && <Spinner />}
      </SafeAreaView>
    </View>
  );
};
