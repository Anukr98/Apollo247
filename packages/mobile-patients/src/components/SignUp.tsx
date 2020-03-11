import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { Mascot, WhiteTickIcon, Gift } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  SafeAreaView,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  AsyncStorage,
  BackHandler,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  NavigationScreenProps,
  ScrollView,
  NavigationActions,
  StackActions,
} from 'react-navigation';
import Moment from 'moment';
import { useAuth, useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  updatePatientVariables,
  updatePatient,
} from '@aph/mobile-patients/src/graphql/types/updatePatient';
import {
  Relation,
  Gender,
  UpdatePatientInput,
  DEVICE_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { UPDATE_PATIENT } from '@aph/mobile-patients/src/graphql/profiles';
import { Mutation } from 'react-apollo';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  handleGraphQlError,
  postWebEngageEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { WebEngageEvents } from '@aph/mobile-patients/src/helpers/webEngageEvents';

const { height } = Dimensions.get('window');

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
  // {
  //   name: 'Other',
  // },
];

let backPressCount = 0;

export interface SignUpProps extends NavigationScreenProps {}
export const SignUp: React.FC<SignUpProps> = (props) => {
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
  const { signOut, getPatientApiCall, getPatientByPrism } = useAuth();
  // const [referredBy, setReferredBy] = useState<string>();
  const [isValidReferral, setValidReferral] = useState<boolean>(false);

  useEffect(() => {
    const isValidReferralCode = /^[a-zA-Z]{4}[0-9]{4}$/.test(referral);
    setValidReferral(isValidReferralCode);
  }, [referral]);

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

  // const isSatisfyingEmailRegex = (value: string) =>
  //   /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(value);

  const _setEmail = (value: string) => {
    const trimmedValue = (value || '').trim();
    setEmail(trimmedValue);
    setEmailValidation(isSatisfyingEmailRegex(trimmedValue));
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
    if (!currentPatient) {
      console.log('No current patients available');
      // getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    AsyncStorage.setItem('signUp', 'true');
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      try {
        if (backPressCount === 1) {
          BackHandler.exitApp();
        } else {
          backPressCount++;
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
            maxLength={8}
            label={
              'Do You Have A Referral Code? (Optional)'
              // referredBy
              //   ? `${referredBy} Has Sent You A Referral Code!`
              //   : 'Do You Have A Referral Code? (Optional)'
            }
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
            icon={isValidReferral ? <WhiteTickIcon /> : null}
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
          headingTextStyle={{ paddingBottom: 20 }}
          heading={string.login.welcome_text}
          description={string.login.welcome_desc}
          descriptionTextStyle={{ paddingBottom: 45 }}
        >
          <View style={styles.mascotStyle}>
            <Mascot />
          </View>
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
            isDateTimePickerVisible={isDateTimePickerVisible}
            handleDatePicked={(date) => {
              const formatDate = Moment(date).format('DD/MM/YYYY');
              setDate(formatDate);
              setIsDateTimePickerVisible(false);
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
            textInputprops={{
              autoCapitalize: 'none',
            }}
          />
          {/* <View style={{ height: 80 }} /> */}
          {renderReferral()}
        </Card>
      </View>
    );
  };

  const keyboardVerticalOffset = Platform.OS === 'android' ? { keyboardVerticalOffset: 20 } : {};
  console.log(isDateTimePickerVisible, 'isDateTimePickerVisible');
  const _postWebEngageEvent = () => {
    const eventAttributes: WebEngageEvents['Registration Done'] = {
      'Customer ID': currentPatient ? currentPatient.id : '',
      'Customer First Name': firstName.trim(),
      'Customer Last Name': lastName.trim(),
      'Date of Birth': Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
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
      eventAttributes['Referral Code'] = referral;
    }

    postWebEngageEvent('Registration Done', eventAttributes);
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
            // scrollEnabled={true}
            // enableAutomaticScroll={Platform.OS === 'ios'}
            // extraScrollHeight={50}
            // enableOnAndroid={true}
            bounces={false}
            // extraHeight={130}
          >
            {renderCard()}
          </ScrollView>
          <StickyBottomComponent position={false}>
            <Mutation<updatePatient, updatePatientVariables> mutation={UPDATE_PATIENT}>
              {(mutate, { loading, data, error }) => (
                <Button
                  title={'SUBMIT'}
                  style={{ marginHorizontal: 40, width: '70%' }}
                  // style={{ width: '100%', flex: 1, marginHorizontal: 40 }}
                  disabled={!firstName || !lastName || !date || !gender}
                  onPress={async () => {
                    Keyboard.dismiss();
                    CommonLogEvent(AppRoutes.SignUp, 'Sign button clicked');
                    let validationMessage = '';
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
                      if (!isValidReferral) {
                        validationMessage = 'Enter valid referral code';
                      }
                    }
                    if (validationMessage) {
                      Alert.alert('Error', validationMessage);
                    } else {
                      setVerifyingPhoneNumber(true);
                      const formatDate = Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');
                      console.log('signup currentPatient', currentPatient);

                      const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
                      const item = JSON.parse(retrievedItem);

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
                        referralCode: referral ? referral : null,
                      };
                      console.log('patientsDetails', patientsDetails);
                      mutate({
                        variables: {
                          patientInput: patientsDetails,
                        },
                      });
                    }
                  }}
                >
                  {data
                    ? (console.log('data', data.updatePatient.patient),
                      getPatientApiCall(),
                      _postWebEngageEvent(),
                      AsyncStorage.setItem('userLoggedIn', 'true'),
                      AsyncStorage.setItem('signUp', 'false'),
                      AsyncStorage.setItem('gotIt', 'false'),
                      CommonLogEvent(AppRoutes.SignUp, 'Navigating to Consult Room'),
                      setTimeout(() => {
                        setVerifyingPhoneNumber(false),
                          props.navigation.dispatch(
                            StackActions.reset({
                              index: 0,
                              key: null,
                              actions: [
                                NavigationActions.navigate({
                                  routeName: AppRoutes.ConsultRoom,
                                }),
                              ],
                            })
                          );
                      }, 500))
                    : null}
                  {/* {loading ? setVerifyingPhoneNumber(false) : null} */}
                  {error
                    ? (signOut(),
                      // handleGraphQlError(error),
                      console.log('updatePatient error', error),
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
