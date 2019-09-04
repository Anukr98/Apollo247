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
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps } from 'react-navigation';
import Moment from 'moment';
import { useAuth, useAllCurrentPatients } from '../hooks/authHooks';
import {
  updatePatientVariables,
  updatePatient,
} from '@aph/mobile-patients/src/graphql/types/updatePatient';
import { Relation, Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { UPDATE_PATIENT } from '@aph/mobile-patients/src/graphql/profiles';
import { Mutation } from 'react-apollo';

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
    value == ' ' ? false : value == '' || /^[a-zA-Z ]+$/.test(value) ? true : false;
  const isSatisfyingEmailRegex = (value: string) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      value
    );

  const _setEmail = (value: string) => {
    setEmail(value);
    setEmailValidation(isSatisfyingEmailRegex(value));
  };

  const _setFirstName = (value: string) => {
    if (isSatisfyingNameRegex(value)) {
      setFirstName(value);
    } else {
      return false;
    }
  };
  const _setlastName = (value: string) => {
    if (isSatisfyingNameRegex(value)) {
      setLastName(value);
    } else {
      return false;
    }
  };

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

  console.log(isDateTimePickerVisible, 'isDateTimePickerVisible');
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView style={styles.container} extraScrollHeight={50} bounces={false}>
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
              onChangeText={(text: string) =>
                _setFirstName(text.trim().length === 0 ? text.trim() : text)
              }
              value={firstName}
              autoCorrect={false}
              textInputprops={{
                maxLength: 50,
              }}
            />
            <TextInputComponent
              placeholder={'Last Name'}
              onChangeText={(text: string) =>
                _setlastName(text.trim().length === 0 ? text.trim() : text)
              }
              value={lastName}
              autoCorrect={false}
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
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}
            >
              {GenderOptions.map((option) => (
                <Button
                  key={option.name}
                  title={option.name}
                  style={[
                    styles.buttonViewStyle,
                    gender === option.name ? styles.selectedButtonViewStyle : null,
                  ]}
                  titleTextStyle={
                    gender === option.name
                      ? styles.selectedButtonTitleStyle
                      : styles.buttonTitleStyle
                  }
                  onPress={() => setGender(option.name)}
                />
              ))}
            </View>
            <TextInputComponent
              label={'Email Address (Optional)'}
              placeholder={'name@email.com'}
              onChangeText={(text: string) => _setEmail(text)}
              value={email}
              autoCorrect={false}
              textInputprops={{
                autoCapitalize: 'none',
              }}
            />
            <View style={{ height: 80 }} />
          </Card>
        </KeyboardAwareScrollView>
        <StickyBottomComponent>
          <Mutation<updatePatient, updatePatientVariables> mutation={UPDATE_PATIENT}>
            {(mutate, { loading, data, error }) => (
              <Button
                title={'SUBMIT'}
                style={{ width: '100%', flex: 1, marginHorizontal: 40 }}
                disabled={!firstName || !lastName || !date || !gender}
                onPress={async () => {
                  let validationMessage = '';
                  if (!firstName) {
                    validationMessage = 'Enter valid first name';
                  } else if (!lastName) {
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
                      firstName: firstName,
                      lastName: lastName,
                      relation: Relation.ME,
                      gender:
                        gender === 'Female'
                          ? Gender['FEMALE']
                          : gender === 'Male'
                          ? Gender['MALE']
                          : Gender['OTHER'], //gender.toUpperCase(),
                      uhid: '',
                      dateOfBirth: formatDate,
                      emailAddress: email,
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
                    props.navigation.replace(AppRoutes.ConsultRoom))
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
                    props.navigation.replace(AppRoutes.Login))
                  : null}
              </Button>
            )}
          </Mutation>
        </StickyBottomComponent>
      </SafeAreaView>
      {verifyingPhoneNumber ? (
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0, 0.2)',
            alignSelf: 'center',
            justifyContent: 'center',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            elevation: 3,
            zIndex: 3,
          }}
        >
          <ActivityIndicator animating={verifyingPhoneNumber} size="large" color="green" />
        </View>
      ) : null}
    </View>
  );
};
