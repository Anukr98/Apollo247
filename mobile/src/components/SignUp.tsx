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
import React, { useState } from 'react';
import { Keyboard, SafeAreaView, StyleSheet, View, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { NavigationScreenProps } from 'react-navigation';
import Moment from 'moment';
import { useAuth } from '../hooks/authHooks';
import { updatePatient_updatePatient_patient } from 'app/src/graphql/types/updatePatient';

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
  const [firstNameValidation, setfirstNameValidation] = useState<boolean>(false);
  const [lastNameValidation, setLastNameValidation] = useState<boolean>(false);
  const { callUpdatePatient } = useAuth();

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
  console.log(isDateTimePickerVisible, 'isDateTimePickerVisible');
  return (
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
            onChangeText={(text: string) => _setFirstName(text)}
            value={firstName}
            autoCorrect={false}
            textInputprops={{
              maxLength: 50,
            }}
          />
          <TextInputComponent
            placeholder={'Last Name'}
            onChangeText={(text: string) => _setlastName(text)}
            value={lastName}
            autoCorrect={false}
            textInputprops={{
              maxLength: 50,
            }}
          />
          <TextInputComponent
            label={'Date Of Birth'}
            value={date}
            placeholder={'dd/mm/yyyy'}
            onFocus={() => {
              Keyboard.dismiss();
              setIsDateTimePickerVisible(true);
            }}
          />
          <DatePicker
            isDateTimePickerVisible={isDateTimePickerVisible}
            handleDatePicked={(date) => {
              const formatDate = Moment(date).format('DD/MM/YYYY');
              setDate(formatDate);
              setIsDateTimePickerVisible(false);
            }}
            hideDateTimePicker={() => {
              setIsDateTimePickerVisible(false);
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
              // const patientsDetails: updatePatient_updatePatient_patient = {
              // id =;
              // mobileNumber: string | null;
              // firstName: string | null;
              // lastName: string | null;
              // relation: Relation | null;
              // sex: Sex | null;
              // uhid: string | null;
              // dateOfBirth: string | null;
              // };

              // const patientUpdateDetails = await callUpdatePatient(patientsDetails);

              props.navigation.navigate(AppRoutes.TabBar);
            }
          }}
        />
      </StickyBottomComponent>
    </SafeAreaView>
  );
};
