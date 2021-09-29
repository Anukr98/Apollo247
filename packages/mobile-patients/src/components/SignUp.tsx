import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import {
  Gift,
  Mascot,
  WhiteTickIcon,
  BackArrow,
  WhatsApp,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { UPDATE_PATIENT, CREATE_ONE_APOLLO_USER } from '@aph/mobile-patients/src/graphql/profiles';
import {
  Gender,
  Relation,
  UpdatePatientInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  updatePatient,
  updatePatientVariables,
} from '@aph/mobile-patients/src/graphql/types/updatePatient';
import {
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  postWEGReferralCodeEvent,
  onCleverTapUserLogin,
  postCleverTapEvent,
  deferredDeepLinkRedirectionData,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  ProductPageViewedSource,
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import { default as Moment, default as moment } from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import { Mutation } from 'react-apollo';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Alert,
  BackHandler,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {
  NavigationActions,
  NavigationScreenProps,
  ScrollView,
  StackActions,
} from 'react-navigation';
import { AppsFlyerEventName, AppsFlyerEvents } from '../helpers/AppsFlyerEvents';
import { getDeviceTokenCount } from '../helpers/clientCalls';
import { FirebaseEventName, FirebaseEvents } from '../helpers/firebaseEvents';
import {
  createOneApolloUser,
  createOneApolloUserVariables,
} from '@aph/mobile-patients/src/graphql/types/createOneApolloUser';
import { handleOpenURL, pushTheView } from '@aph/mobile-patients/src/helpers/deeplinkRedirection';
import { getPatientByMobileNumber_getPatientByMobileNumber_patients } from '@aph/mobile-patients/src/graphql/types/getPatientByMobileNumber';
import _ from 'lodash';
import { LOGIN_PROFILE } from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { CheckBox } from 'react-native-elements'

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
    backgroundColor: theme.colors.WHITE,
    paddingTop: 2,
  },
  mascotStyle: {
    position: 'absolute',
    top: -32,
    right: 20,
    height: 64,
    width: 64,
    zIndex: 2,
    elevation: 2,
  },
  buttonViewStyle: {
    width: '30%',
    backgroundColor: 'white',
    marginRight: 20,
  },
  selectedButtonViewStyle: {
    backgroundColor: theme.colors.APP_GREEN,
  },
  buttonTitleStyle: {
    color: theme.colors.APP_GREEN,
  },
  selectedButtonTitleStyle: {
    color: theme.colors.WHITE,
  },
  placeholderTextStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 0,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  backArrowStyles: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
    marginLeft: 12,
    marginTop: 15,
    position: 'absolute',
  },
  whatsAppOptinContainer: {
    marginVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: -15
  },
  whatsAppOptinCheckboxContainer: {
    width: "90%",
    flexDirection: "row",
    alignItems: "center"
  }
});

type genderOptions = {
  name: string;
};

const GenderOptions: genderOptions[] = [
  {
    name: 'Male',
  },
  {
    name: 'Female',
  },
];

let backPressCount = 0;

export interface SignUpProps extends NavigationScreenProps {
  patient?: getPatientByMobileNumber_getPatientByMobileNumber_patients;
}
const SignUp: React.FC<SignUpProps> = (props) => {
  const patient = props.navigation.getParam('patient');
  const [gender, setGender] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [emailValidation, setEmailValidation] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const [verifyingPhoneNumber, setVerifyingPhoneNumber] = useState<boolean>(false);
  const [referral, setReferral] = useState<string>('');
  const { signOut, getPatientApiCall } = useAuth();
  const [isValidReferral, setValidReferral] = useState<boolean>(false);
  const [deviceToken, setDeviceToken] = useState<string>('');
  const [showReferralCode, setShowReferralCode] = useState<boolean>(false);
  const [oneApolloRegistrationCalled, setoneApolloRegistrationCalled] = useState<boolean>(false);
  const [whatsAppOptIn, setWhatsAppOptIn] = useState<boolean>(false)
  const isOneTimeUpdate = useRef<boolean>(false);

  useEffect(() => {
    const isValidReferralCode = /^[a-zA-Z]{4}[0-9]{4}$/.test(referral);
    setValidReferral(isValidReferralCode);
  }, [referral]);

  const checkPatientData = async () => {
    const storedPatient = await AsyncStorage.getItem(LOGIN_PROFILE);
    const parsedPatient = storedPatient && JSON.parse(storedPatient);
    if (!isOneTimeUpdate.current && (patient || parsedPatient)) {
      isOneTimeUpdate.current = true;
      setFirstName(patient?.firstName || parsedPatient?.firstName);
      setLastName(patient?.lastName || parsedPatient?.lastName);
      const email = patient?.emailAddress || parsedPatient?.emailAddress;
      const trimmedValue = (email || '').trim();
      setEmail(trimmedValue);
      setEmailValidation(isSatisfyEmailRegex(trimmedValue));
      const patientGender = patient?.gender || parsedPatient?.gender || '';
      patientGender?.toUpperCase() !== Gender.OTHER?.toUpperCase() &&
        setGender(_.capitalize(patientGender));
      if (patient?.dateOfBirth || parsedPatient?.dateOfBirth) {
        const formatDate = Moment(patient?.dateOfBirth || parsedPatient?.dateOfBirth).format(
          'DD/MM/YYYY'
        );
        setDate(formatDate);
      }
    }
  };

  const isSatisfyingNameRegex = (value: string) =>
    value == ' '
      ? false
      : value == '' || /^[a-zA-Z]+((['’ ][a-zA-Z])?[a-zA-Z]*)*$/.test(value)
      ? true
      : false;

  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const isSatisfyEmailRegex = (value: string) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);

  const _setEmail = (value: string) => {
    const trimmedValue = (value || '').trim();
    setEmail(trimmedValue);
    setEmailValidation(isSatisfyingEmailRegex(trimmedValue));
    setEmailValidation(isSatisfyEmailRegex(trimmedValue));
  };

  const _setFirstName = (value: string) => {
    if (/^[a-zA-Z'’ ]*$/.test(value)) {
      setFirstName(value);
    } else {
      return false;
    }
  };
  const _setlastName = (value: string) => {
    if (/^[a-zA-Z'’ ]*$/.test(value)) {
      setLastName(value);
    } else {
      return false;
    }
  };

  useEffect(() => {
    checkPatientData();
    getDeviceCountAPICall();
    getPrefillReferralCode();
  }, []);

  const getPrefillReferralCode = async () => {
    const deeplinkReferalCode: any = await AsyncStorage.getItem('deeplinkReferalCode');

    if (deeplinkReferalCode !== null && deeplinkReferalCode !== undefined) {
      setReferral(deeplinkReferalCode);
    }
  };

  const client = useApolloClient();

  async function createOneApolloUser(patientId: string) {
    setoneApolloRegistrationCalled(true);
    if (!oneApolloRegistrationCalled) {
      try {
        const response = await client.mutate<createOneApolloUser, createOneApolloUserVariables>({
          mutation: CREATE_ONE_APOLLO_USER,
          variables: { patientId: patientId },
        });
      } catch (error) {
        CommonBugFender('oneApollo Registration', error);
      }
    }
  }

  const getDeviceCountAPICall = async () => {
    const uniqueId = await DeviceInfo.getUniqueId();
    setDeviceToken(uniqueId);

    getDeviceTokenCount(client, uniqueId.trim())
      .then(({ data }: any) => {
        if (parseInt(data.data.getDeviceCodeCount.deviceCount, 10) < 2) {
          setShowReferralCode(true);
        } else {
          setShowReferralCode(false);
          setReferral('');
        }
      })
      .catch((e) => {});
  };

  useEffect(() => {
    AsyncStorage.setItem('signUp', 'true');
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      try {
        if (patient) {
          props.navigation.goBack();
        } else {
          if (backPressCount === 1) {
            BackHandler.exitApp();
          } else {
            backPressCount++;
          }
        }
        return true;
      } catch (e) {
        CommonBugFender('Sign_up_backpressed', e);
      }
    });
    return function cleanup() {
      backHandler.remove();
    };
  }, []);

  const renderReferral = () => {
    return (
      <View
        style={{
          backgroundColor: theme.colors.SKY_BLUE,
          marginHorizontal: -20,
          paddingVertical: 18,
          marginTop: 20,
        }}
      >
        <View style={{ marginHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start' }}>
          <Gift style={{ marginRight: 20, marginTop: 12 }} />
          <TextInputComponent
            maxLength={25}
            label={'Do You Have A Referral Code? (Optional)'}
            labelStyle={{ ...theme.viewStyles.text('M', 14, '#ffffff'), marginBottom: 12 }}
            placeholder={'Enter referral code'}
            placeholderTextColor={'rgba(255,255,255,0.6)'}
            inputStyle={{
              borderColor: theme.colors.WHITE,
              color: theme.colors.WHITE,
            }}
            conatinerstyles={{ width: '78%' }}
            value={referral}
            onChangeText={(text) => setReferral(text)}
            icon={referral.length > 0 ? <WhiteTickIcon /> : null}
          />
        </View>
      </View>
    );
  };

  const renderCard = () => {
    return (
      <View>
        <View style={{ justifyContent: 'center', marginTop: 20, marginLeft: 20 }}>
          <ApolloLogo />
        </View>
        <Card
          cardContainer={{
            marginHorizontal: 0,
            marginTop: 20,
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
            backgroundColor: theme.colors.WHITE,
          }}
          headingTextStyle={{ paddingBottom: 20, marginTop: 25 }}
          heading={string.login.welcome_text}
          description={string.login.welcome_desc}
          descriptionTextStyle={{ paddingBottom: 45 }}
        >
          <View style={styles.mascotStyle}>
            <Mascot />
          </View>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.backArrowStyles}
            onPress={() => {
              props.navigation.dispatch(
                StackActions.reset({
                  index: 0,
                  key: null,
                  actions: [
                    NavigationActions.navigate({
                      routeName: AppRoutes.Login,
                    }),
                  ],
                })
              );
            }}
          >
            <BackArrow />
          </TouchableOpacity>
          <TextInputComponent
            label={'Full Name'}
            placeholder={'First Name'}
            onChangeText={(text: string) => _setFirstName(text)}
            value={firstName}
            textInputprops={{
              maxLength: 50,
            }}
          />
          <TextInputComponent
            placeholder={'Last Name'}
            onChangeText={(text: string) => _setlastName(text)}
            value={lastName}
            textInputprops={{
              maxLength: 50,
            }}
          />
          <TextInputComponent label={'Date Of Birth'} noInput={true} />
          <View style={{ marginTop: -5 }}>
            <View style={{ paddingTop: 0, paddingBottom: 10 }}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.placeholderViewStyle}
                onPress={() => {
                  CommonLogEvent(AppRoutes.SignUp, 'Date picker display');

                  Keyboard.dismiss();
                  setIsDateTimePickerVisible(true);
                }}
              >
                <Text
                  style={[
                    styles.placeholderTextStyle,
                    ,
                    date !== '' ? null : styles.placeholderStyle,
                  ]}
                >
                  {date !== '' ? date : 'dd/mm/yyyy'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <DatePicker
            date={
              date
                ? moment(date, 'DD/MM/YYYY').toDate()
                : moment()
                    .subtract(25, 'years')
                    .toDate()
            }
            isDateTimePickerVisible={isDateTimePickerVisible}
            handleDatePicked={(date) => {
              setIsDateTimePickerVisible(false);
              const formatDate = Moment(date).format('DD/MM/YYYY');
              setDate(formatDate);
              Keyboard.dismiss();
            }}
            hideDateTimePicker={() => {
              setIsDateTimePickerVisible(false);
              Keyboard.dismiss();
            }}
          />
          <TextInputComponent label={'Gender'} noInput={true} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10 }}>
            {GenderOptions.map((option) => (
              <Button
                key={option.name}
                title={option.name}
                style={[
                  styles.buttonViewStyle,
                  gender === option.name ? styles.selectedButtonViewStyle : null,
                ]}
                titleTextStyle={
                  gender === option.name ? styles.selectedButtonTitleStyle : styles.buttonTitleStyle
                }
                onPress={() => (
                  CommonLogEvent(AppRoutes.SignUp, 'set gender clicked'), setGender(option.name)
                )}
              />
            ))}
          </View>
          <TextInputComponent
            label={'Email Address'}
            placeholder={'name@email.com'}
            onChangeText={(text: string) => _setEmail(text)}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style = {styles.whatsAppOptinContainer}>
            <View style = {styles.whatsAppOptinCheckboxContainer}>
              <CheckBox
                checked = {whatsAppOptIn}
                onPress = {() => setWhatsAppOptIn(!whatsAppOptIn)}
                size = {15}
              />
              <Text style = {{ marginLeft: -10 }}>Send me personalised health tips and offers on</Text>
            </View>
            <View style = {{ width: "10%" }}>
              <WhatsApp />
            </View>
          </View>
          {showReferralCode && renderReferral()}
        </Card>
      </View>
    );
  };

  const keyboardVerticalOffset = Platform.OS === 'android' ? { keyboardVerticalOffset: 20 } : {};

  const [isSignupEventFired, setSignupEventFired] = useState(false);

  const _postWebEngageEvent = () => {
    if (isSignupEventFired) {
      return;
    }
    try {
      const eventAttributes: WebEngageEvents[WebEngageEventName.REGISTRATION_DONE] = {
        'Customer ID': currentPatient ? currentPatient.id : '',
        'Customer First Name': firstName.trim(),
        'Customer Last Name': lastName.trim(),
        'Date of Birth': currentPatient?.dateOfBirth || Moment(date, 'DD/MM/YYYY').toDate(),
        Gender:
          gender === 'Female'
            ? Gender['FEMALE']
            : gender === 'Male'
            ? Gender['MALE']
            : Gender['OTHER'],
        Email: email.trim(),
        'Mobile Number': currentPatient?.mobileNumber,
      };
      const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.REGISTRATION_DONE] = {
        'Customer ID': currentPatient ? currentPatient.id : '',
        'Full Name': firstName?.trim() + ' ' + lastName?.trim(),
        DOB: currentPatient?.dateOfBirth || Moment(date, 'DD/MM/YYYY').toDate(),
        Gender:
          gender === 'Female'
            ? Gender['FEMALE']
            : gender === 'Male'
            ? Gender['MALE']
            : Gender['OTHER'],
        'Email ID': email?.trim(),
        'Mobile Number': currentPatient?.mobileNumber,
        'Nav src': 'App login screen',
        'Page Name': 'Signup Screen',
      };
      if (referral) {
        // only send if referral has a value
        eventAttributes['Referral Code'] = referral;
        cleverTapEventAttributes['Referral Code'] = referral;
      }

      const eventFirebaseAttributes: FirebaseEvents[FirebaseEventName.SIGN_UP] = {
        Customer_ID: currentPatient ? currentPatient.id : '',
        Customer_First_Name: firstName.trim(),
        Customer_Last_Name: lastName.trim(),
        Date_of_Birth: Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        Gender:
          gender === 'Female'
            ? Gender['FEMALE']
            : gender === 'Male'
            ? Gender['MALE']
            : Gender['OTHER'],
        Email: email.trim(),
      };
      if (referral) {
        // only send if referral has a value
        eventFirebaseAttributes['Referral_Code'] = referral;
        postWEGReferralCodeEvent(referral);
      }

      postWebEngageEvent(WebEngageEventName.REGISTRATION_DONE, eventAttributes);
      postCleverTapEvent(CleverTapEventName.REGISTRATION_DONE, cleverTapEventAttributes);
      const appsflyereventAttributes = {
        af_customer_user_id: currentPatient ? currentPatient.id : '',
      };
      if (referral) {
        // only send if referral has a value
        appsflyereventAttributes['referral code'] = referral;
      }
      postAppsFlyerEvent(AppsFlyerEventName.REGISTRATION_DONE, appsflyereventAttributes);
      postFirebaseEvent(FirebaseEventName.SIGN_UP, eventFirebaseAttributes);
      setSignupEventFired(true);
    } catch (error) {}
  };

  const handleOpenURLs = async () => {
    try {
      deferredDeepLinkRedirectionData(props.navigation, async () => {
        const event: any = await AsyncStorage.getItem('deeplink');
        const data = handleOpenURL(event);
        const { routeName, id, isCall, timeout, mediaSource } = data;
        pushTheView(
          props.navigation,
          routeName,
          id ? id : undefined,
          isCall,
          undefined,
          undefined,
          mediaSource
        );
      });
    } catch (error) {}
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          {...keyboardVerticalOffset}
        >
          <ScrollView
            style={styles.container} //extraScrollHeight={50}
            bounces={false}
          >
            {renderCard()}
          </ScrollView>
          <StickyBottomComponent position={false}>
            <Mutation<updatePatient, updatePatientVariables> mutation={UPDATE_PATIENT}>
              {(mutate, { loading, data, error }) => (
                <Button
                  title={'SUBMIT'}
                  style={{ marginHorizontal: 40, width: '70%' }}
                  disabled={!firstName || !lastName || !date || !gender}
                  onPress={async () => {
                    Keyboard.dismiss();
                    CommonLogEvent(AppRoutes.SignUp, 'Sign button clicked');
                    let validationMessage = '';
                    let trimReferral = referral;
                    if (!(firstName && isSatisfyingNameRegex(firstName.trim()))) {
                      validationMessage = 'Enter valid first name';
                    } else if (!(lastName && isSatisfyingNameRegex(lastName.trim()))) {
                      validationMessage = 'Enter valid last name';
                    } else if (!date) {
                      validationMessage = 'Enter valid date of birth';
                    } else if (email) {
                      if (!emailValidation) {
                        validationMessage = 'Enter valid email';
                      }
                    } else if (!gender) {
                      validationMessage = 'Please select gender';
                    } else if (referral !== '') {
                      trimReferral = trimReferral.trim();
                    }
                    if (validationMessage) {
                      Alert.alert('Error', validationMessage);
                    } else {
                      setVerifyingPhoneNumber(true);
                      const formatDate = Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');

                      const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
                      const item = JSON.parse(retrievedItem || 'null');

                      const callByPrism: any = await AsyncStorage.getItem('callByPrism');
                      let allPatients;

                      if (callByPrism === 'true') {
                        allPatients =
                          item && item.data && item.data.getCurrentPatients
                            ? item.data.getCurrentPatients.patients
                            : null;
                      } else {
                        allPatients =
                          item && item.data && item.data.getPatientByMobileNumber
                            ? item.data.getPatientByMobileNumber.patients
                            : null;
                      }

                      const mePatient = allPatients
                        ? allPatients.find((patient: any) => patient.relation === Relation.ME) ||
                          allPatients[0]
                        : null;

                      const patientsDetails: UpdatePatientInput = {
                        id: mePatient.id,
                        whatsAppOptIn: whatsAppOptIn,
                        mobileNumber: mePatient.mobileNumber,
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        relation: Relation.ME,
                        gender:
                          gender === 'Female'
                            ? Gender['FEMALE']
                            : gender === 'Male'
                            ? Gender['MALE']
                            : Gender['OTHER'], //gender.toUpperCase(),
                        uhid: '',
                        dateOfBirth: formatDate,
                        emailAddress: email.trim(),
                        referralCode: trimReferral ? trimReferral : null,
                        deviceCode: deviceToken,
                      };
                      mutate({
                        variables: {
                          patientInput: patientsDetails,
                        },
                      });
                    }
                  }}
                >
                  {data
                    ? (getPatientApiCall(),
                      _postWebEngageEvent(),
                      AsyncStorage.setItem('userLoggedIn', 'true'),
                      AsyncStorage.setItem('signUp', 'false'),
                      AsyncStorage.setItem('gotIt', patient ? 'true' : 'false'),
                      onCleverTapUserLogin(data?.updatePatient?.patient),
                      createOneApolloUser(data?.updatePatient?.patient?.id!),
                      handleOpenURLs())
                    : null}
                  {error
                    ? (signOut(),
                      AsyncStorage.setItem('userLoggedIn', 'false'),
                      AsyncStorage.setItem('multiSignUp', 'false'),
                      AsyncStorage.setItem('signUp', 'false'),
                      CommonLogEvent(AppRoutes.SignUp, 'Error going back to login'),
                      setTimeout(() => {
                        setVerifyingPhoneNumber(false),
                          props.navigation.dispatch(
                            StackActions.reset({
                              index: 0,
                              key: null,
                              actions: [
                                NavigationActions.navigate({
                                  routeName: AppRoutes.Login,
                                }),
                              ],
                            })
                          );
                      }, 0))
                    : null}
                </Button>
              )}
            </Mutation>
          </StickyBottomComponent>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {verifyingPhoneNumber ? <Spinner /> : null}
    </View>
  );
};

export default React.memo(SignUp);
