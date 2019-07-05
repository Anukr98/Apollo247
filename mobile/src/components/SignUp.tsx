import { ApolloLogo } from 'app/src/components/ApolloLogo';
import { AppRoutes } from 'app/src/components/NavigatorContainer';
import { Button } from 'app/src/components/ui/Button';
import { Card } from 'app/src/components/ui/Card';
import { DatePicker } from 'app/src/components/ui/DatePicker';
import { Mascot } from 'app/src/components/ui/Icons';
import { StickyBottomComponent } from 'app/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from 'app/src/components/ui/TextInputComponent';
import { string } from 'app/src/strings/string';
import { theme } from 'app/src/theme/theme';
import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  SafeAreaView,
  StyleSheet,
  View,
  Alert,
  BackHandler,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps } from 'react-navigation';
import Moment from 'moment';
import { useAuth } from '../hooks/authHooks';
import { updatePatient_updatePatient_patient } from 'app/src/graphql/types/updatePatient';
import { Relation, Sex } from 'app/src/graphql/types/globalTypes';

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

type updatePateint = {
  id: string;
  mobileNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  relation: Relation | null;
  sex: string | null;
  uhid: string | null;
  dateOfBirth: string | null;
  emailAddress: string | null;
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

let backHandler: any;

export interface SignUpProps extends NavigationScreenProps {}
export const SignUp: React.FC<SignUpProps> = (props) => {
  const [gender, setGender] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [emailValidation, setEmailValidation] = useState<boolean>(false);
  const [firstNameValidation, setfirstNameValidation] = useState<boolean>(false);
  const [lastNameValidation, setLastNameValidation] = useState<boolean>(false);
  const { callUpdatePatient, currentUser } = useAuth();
  const [verifyingPhoneNumber, setVerifyingPhonenNumber] = useState(false);

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
      setfirstNameValidation(isSatisfyingNameRegex(value));
      setFirstName(value);
    } else {
      return false;
    }
  };
  const _setlastName = (value: string) => {
    if (isSatisfyingNameRegex(value)) {
      setLastNameValidation(isSatisfyingNameRegex(value));
      setLastName(value);
    } else {
      return false;
    }
  };

  // useEffect(() => {
  //   backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
  //     console.log('hardwareBackPress');
  //     return true;
  //   });
  // }, []);

  // useEffect(() => {
  //   return () => {
  //     backHandler && backHandler.remove();
  //   };
  // }, []);

  console.log(isDateTimePickerVisible, 'isDateTimePickerVisible');
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAwareScrollView style={styles.container} extraScrollHeight={50}>
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
            }}
            heading={string.LocalStrings.welcome_text}
            description={string.LocalStrings.welcome_desc}
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
          <Button
            title={'SUBMIT'}
            style={{ width: '100%', flex: 1, marginHorizontal: 40 }}
            disabled={!firstName || !lastName || !date || !gender}
            onPress={async () => {
              setVerifyingPhonenNumber(true);
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
                // const formatDate = Moment(date).format('MM/DD/YYYY');
                const formatDate = Moment(date, 'DD/MM/YYYY').format('MM/DD/YYYY');

                const patientsDetails: updatePateint = {
                  id: currentUser.id,
                  mobileNumber: currentUser.mobileNumber,
                  firstName: firstName,
                  lastName: lastName,
                  relation: Relation.ME,
                  sex: gender.toUpperCase(),
                  uhid: '',
                  dateOfBirth: formatDate,
                  emailAddress: email,
                };
                console.log('patientsDetails', patientsDetails);

                const patientUpdateDetails = await callUpdatePatient(patientsDetails);
                const patientDetails = patientUpdateDetails.data.updatePatient.patient;
                const errMsg =
                  patientUpdateDetails.data.updatePatient.errors &&
                  patientUpdateDetails.data.updatePatient.errors.messages[0];

                setVerifyingPhonenNumber(true);

                if (errMsg) {
                  Alert.alert('Error', errMsg);
                } else {
                  if (patientDetails) {
                    props.navigation.navigate(AppRoutes.TabBar);
                  }
                }
              }
            }}
          />
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
          }}
        >
          <ActivityIndicator animating={verifyingPhoneNumber} size="large" color="green" />
        </View>
      ) : null}
    </View>
  );
};
