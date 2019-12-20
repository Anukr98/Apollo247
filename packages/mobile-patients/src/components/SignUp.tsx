import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { Mascot } from '@aph/mobile-patients/src/components/ui/Icons';
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
import { Relation, Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { UPDATE_PATIENT } from '@aph/mobile-patients/src/graphql/profiles';
import { Mutation } from 'react-apollo';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

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
  {
    name: 'Other',
  },
];

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
  const [backPressCount, setbackPressCount] = useState<number>(0);

  const { signOut, getPatientApiCall } = useAuth();

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
    setEmail(value);
    setEmailValidation(isSatisfyingEmailRegex(value));
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
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    AsyncStorage.setItem('signUp', 'true');
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      setbackPressCount(backPressCount + 1);
      if (backPressCount === 1) {
        BackHandler.exitApp();
      }
      return true;
    });
    return function cleanup() {
      backHandler.remove();
    };
  }, [backPressCount]);

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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
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
            label={'Email Address (Optional)'}
            placeholder={'name@email.com'}
            onChangeText={(text: string) => _setEmail(text)}
            value={email}
            textInputprops={{
              autoCapitalize: 'none',
            }}
          />
          {/* <View style={{ height: 80 }} /> */}
        </Card>
      </View>
    );
  };

  const keyboardVerticalOffset = Platform.OS === 'android' ? { keyboardVerticalOffset: 20 } : {};
  console.log(isDateTimePickerVisible, 'isDateTimePickerVisible');
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }} {...keyboardVerticalOffset}>
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
                    }
                    if (validationMessage) {
                      Alert.alert('Error', validationMessage);
                    } else {
                      setVerifyingPhoneNumber(true);

                      const formatDate = Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');
                      console.log('signup currentPatient', currentPatient);

                      const patientsDetails = {
                        id: currentPatient ? currentPatient.id : '',
                        mobileNumber: currentPatient ? currentPatient.mobileNumber : '',
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
                    ? (setVerifyingPhoneNumber(false),
                      console.log('data', data.updatePatient.patient),
                      getPatientApiCall(),
                      AsyncStorage.setItem('userLoggedIn', 'true'),
                      AsyncStorage.setItem('signUp', 'false'),
                      AsyncStorage.setItem('gotIt', 'false'),
                      CommonLogEvent(AppRoutes.SignUp, 'Navigating to Consult Room'),
                      setTimeout(() => {
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
                    ? (setVerifyingPhoneNumber(false),
                      signOut(),
                      Alert.alert('Apollo', error.message),
                      console.log('updatePatient error', error),
                      AsyncStorage.setItem('userLoggedIn', 'false'),
                      AsyncStorage.setItem('multiSignUp', 'false'),
                      AsyncStorage.setItem('signUp', 'false'),
                      CommonLogEvent(AppRoutes.SignUp, 'Error going back to login'),
                      setTimeout(() => {
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
