import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  DeviceHelper,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Moment from 'moment';
import React, { useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { Gender, Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useApolloClient } from 'react-apollo-hooks';
import { addNewProfile } from '@aph/mobile-patients/src/graphql/types/addNewProfile';
import { ADD_NEW_PROFILE } from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { handleGraphQlError } from '@aph/mobile-patients/src/helpers/helperFunctions';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  yellowTextStyle: {
    ...theme.viewStyles.yellowTextStyle,
    padding: 16,
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
  },
  buttonStyle: {
    width: 'auto',
    marginRight: 8,
    marginTop: 12,
    backgroundColor: theme.colors.WHITE,
  },
  buttonTextStyle: {
    paddingHorizontal: 12,
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(15),
  },
  stickyBottomStyle: {
    height: 'auto',
  },
  bottonButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 0,
    paddingTop: 14,
    paddingBottom: 20,
  },
  bottomButtonStyle: {
    flex: 1,
  },
  bottomWhiteButtonStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
  },
  bottomWhiteButtonTextStyle: {
    color: theme.colors.APP_YELLOW,
  },
  buttonSeperatorStyle: {
    width: 16,
  },
  buttonViewStyle: {
    width: '30%',
    marginRight: 16,
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
  placeholderTextStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
  },
});

type genderOptions = {
  name: Gender;
  title: string;
};

const GenderOptions: genderOptions[] = [
  {
    name: Gender.MALE,
    title: 'Male',
  },
  {
    name: Gender.FEMALE,
    title: 'Female',
  },
  // {
  //   name: Gender.OTHER,
  //   title: 'Other',
  // },
];

export interface AddProfileProps {
  setdisplayoverlay: (args0: boolean) => void;
  setProfile: (args0: GetCurrentPatients_getCurrentPatients_patients) => void;
}

export const AddProfile: React.FC<AddProfileProps> = (props) => {
  const client = useApolloClient();
  const { allCurrentPatients, setCurrentPatientId, currentPatient } = useAllCurrentPatients();
  const { setLoading } = useUIElements();

  const { getPatientApiCall } = useAuth();
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const { isIphoneX } = DeviceHelper();
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

  const _setFirstName = (value: string) => {
    if (/^[a-zA-Z'’ ]*$/.test(value)) {
      setFirstName(value);
    } else {
      return false;
    }
  };
  const _setLastName = (value: string) => {
    if (/^[a-zA-Z'’ ]*$/.test(value)) {
      setLastName(value);
    } else {
      return false;
    }
  };

  const isValidProfile =
    firstName &&
    isSatisfyingNameRegex(firstName) &&
    lastName &&
    isSatisfyingNameRegex(lastName) &&
    date &&
    gender;

  const newProfile = () => {
    setLoading!(true);
    client
      .mutate<addNewProfile, any>({
        mutation: ADD_NEW_PROFILE,
        variables: {
          PatientProfileInput: {
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: Moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            gender: gender,
            relation: Relation.OTHER,
            emailAddress: '',
            photoUrl: '',
            mobileNumber: currentPatient!.mobileNumber,
          },
        },
      })
      .then((data) => {
        props.setProfile(
          data.data!.addNewProfile.patient as GetCurrentPatients_getCurrentPatients_patients
        );
        getPatientApiCall();
        props.setdisplayoverlay(false);
      })
      .catch((e) => {
        CommonBugFender('AddProfile_newProfile', e);
        handleGraphQlError(e);
      })
      .finally(() => {
        setLoading!(false);
      });
  };

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'Add New Profile'}
        onPressLeftIcon={() => props.setdisplayoverlay(false)}
      />
    );
  };
  const renderButtons = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomStyle} defaultBG>
        <View style={styles.bottonButtonContainer}>
          <Button
            onPress={() => {
              props.setdisplayoverlay(false);
            }}
            title={'CANCEL'}
            style={styles.bottomWhiteButtonStyle}
            titleTextStyle={styles.bottomWhiteButtonTextStyle}
          />
          <View style={styles.buttonSeperatorStyle} />
          <Button
            onPress={() => {
              let validationMessage = '';
              if (!(firstName && isSatisfyingNameRegex(firstName))) {
                validationMessage = 'Enter valid first name';
              } else if (!(lastName && isSatisfyingNameRegex(lastName))) {
                validationMessage = 'Enter valid last name';
              } else if (!date) {
                validationMessage = 'Enter valid date of birth';
              } else if (!gender) {
                validationMessage = 'Select a geder';
              }
              if (validationMessage) {
                Alert.alert('Error', validationMessage);
              } else {
                newProfile();
              }
            }}
            // disabled={!isValidProfile}
            title={'SAVE & USE'}
            style={styles.bottomButtonStyle}
          />
        </View>
      </StickyBottomComponent>
    );
  };
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, .8)',
        zIndex: 5,
      }}
    >
      <View
        style={{
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => props.setdisplayoverlay(false)}
            style={{
              marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 14,
              backgroundColor: 'white',
              height: 28,
              width: 28,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              marginRight: 0,
            }}
          >
            <CrossPopup />
          </TouchableOpacity>
        </View>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginTop: 16,
            height: 'auto',
            maxHeight: height - 108,
            overflow: 'hidden',
          }}
        >
          {renderHeader()}
          <ScrollView bounces={false} style={{ backgroundColor: '#f7f8f5', padding: 16 }}>
            <TextInputComponent
              label={'Full Name'}
              value={`${firstName}`}
              onChangeText={(fname) => _setFirstName(fname)}
              placeholder={'First Name'}
            />
            <TextInputComponent
              value={`${lastName}`}
              onChangeText={(lname) => _setLastName(lname)}
              placeholder={'Last Name'}
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
                    {date !== '' ? date : 'DD/MM/YYYY'}
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
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                marginBottom: 10,
                paddingHorizontal: 2,
              }}
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
            <View style={{ height: 96 }} />
          </ScrollView>
          {renderButtons()}
        </View>
      </View>
    </View>
  );
};
