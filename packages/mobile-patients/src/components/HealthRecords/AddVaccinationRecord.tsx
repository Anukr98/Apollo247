import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { MedicalRecordType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { WebEngageEventName } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  g,
  postWebEngagePHR,
  handleGraphQlError,
  postWebEngageIfNewSession,
  removeObjectProperty,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';

import _ from 'lodash';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import moment from 'moment';
import { TextInput } from 'react-native-gesture-handler';
import { isValidText } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { NavigationScreenProps } from 'react-navigation';
import { CalendarBlackIcon, DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { useApolloClient } from 'react-apollo-hooks';
import {
  addPatientImmunizationRecord,
  addPatientImmunizationRecordVariables,
} from '@aph/mobile-patients/src/graphql/types/addPatientImmunizationRecord';
import { GET_IMMUNIZATION_DETAILS } from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';

type PickerImage = any;

const styles = StyleSheet.create({
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  uploadHealthRecordBtn: {
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderRadius: 8,
  },
  fieldName: {
    ...theme.fonts.IBMPlexSansMedium(15),
    color: '#000000',
    bottom: 3,
  },
  fieldTitle: {
    ...theme.fonts.IBMPlexSansMedium(13),
    color: '#01475B',
  },
  uploadHealthRecordText: {
    ...theme.fonts.IBMPlexSansMedium(15),
    left: 15,
    color: '#01475B',
  },
  recordCalendar: {
    ...theme.fonts.IBMPlexSansMedium(15),
    bottom: 3,
    color: 'grey',
  },
  doctorInputContainer: {
    ...theme.fonts.IBMPlexSansMedium(15),
    color: 'grey',
    width: '100%',
  },
  recordBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderRadius: 8,
  },
  recordNameContainer: {
    flexDirection: 'column',
    marginTop: 40,
    height: 55,
    width: '90%',
    left: 5,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderColor: '#00B38E',
    borderBottomWidth: 2,
  },
  dropDownContainer: {
    flexDirection: 'column',
    marginTop: 40,
    height: 55,
    width: '90%',
    left: 5,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  doctorNameContainer: {
    flexDirection: 'column',
    marginTop: 40,
    height: 55,
    width: '90%',
    left: 5,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderColor: '#00B38E',
    borderBottomWidth: 2,
    bottom: 3,
  },
  recordFieldContainer: {
    flexDirection: 'column',
    marginTop: 60,
    height: 55,
    width: '90%',
    left: 5,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderColor: '#00B38E',
    borderBottomWidth: 2,
  },
  menuContainerStyle: {
    alignItems: 'center',
    marginTop: 30,
  },
  plusTextStyle: {
    ...theme.viewStyles.text('R', 24, theme.colors.LIGHT_BLUE, 1, 31.2),
    textAlign: 'center',
    paddingTop: 5,
  },
  itemTextStyle: {
    ...theme.viewStyles.text('M', 16, '#01475b'),
    paddingHorizontal: 0,
  },
  selectedTextStyle: {
    ...theme.viewStyles.text('M', 16, '#00b38e'),
    alignSelf: 'flex-start',
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    ...theme.viewStyles.text('M', 14, 'grey'),
  },
  overlayViewStyle: {
    flexGrow: 1,
    backgroundColor: 'transparent',
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
  mainContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignContent: 'space-around',
    left: 15,
  },
  ensureTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE, 1, 15.6),
    textAlign: 'center',
  },
  imageBtnContainer: {
    flexDirection: 'row',
    top: 30,
    height: 70,
    justifyContent: 'center',
    marginBottom: 20,
    width: '30%',
  },
  reviewPhotoDetailsViewStyle: {
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    justifyContent: 'center',
    marginTop: 23,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    overflow: 'hidden',
    elevation: 0,
  },
  bottonButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    paddingTop: 24,
    paddingBottom: 20,
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  addMoreTextStyle: {
    ...theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE, 1, 13),
    textAlign: 'center',
    flex: 1,
  },
  bottomWhiteButtonStyle: {
    flex: 1,
    backgroundColor: 'transparent',
    borderColor: theme.colors.APP_YELLOW,
    borderWidth: 1,
    elevation: 0,
  },
  reviewPhotoImageStyle: {
    height: 350,
    width: '100%',
  },
  imageListViewStyle: {
    marginTop: 6,
    marginHorizontal: 21,
    marginBottom: 100,
    flexDirection: 'row',
  },
  bottomWhiteButtonTextStyle: {
    color: theme.colors.APP_YELLOW,
  },
  calendarIcon: {
    width: 20,
    height: 20,
    right: 10,
    bottom: 3,
    left: 0,
  },
  addMoreImageViewStyle: { width: 82, height: 82, paddingTop: 10 },
});

export interface AAddVaccinationRecordProps
  extends NavigationScreenProps<{
    onRecordAdded: () => void;
  }> {}

export const AddVaccinationRecord: React.FC<AAddVaccinationRecordProps> = (props) => {
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const { width, height } = Dimensions.get('window');
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const [vaccinationName, setVaccinationName] = useState<string>('');
  const [doseCount, setDoseCount] = useState<string>('');
  const [registrationID, setRegistrationID] = useState<string>('');
  const [vaccinationCener, setVaccinationCener] = useState<string>('');
  const [showTime, setShowTime] = useState<boolean>(false);
  const [dateOfTest, setdateOfTest] = useState<string>('');
  const { showAphAlert } = useUIElements();
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { phrSession, setPhrSession } = useAppCommonData();
  const covidType = ['Covisheild', 'Covaxin', 'Sputnik', 'Pfizer'];
  const doseType = ['Dose 1', 'Dose 2'];

  const renderBottomButton = () => {
    return (
      <Button
        title={string.common.uploadVaccinationText}
        style={{ width: '70%', alignSelf: 'center', marginBottom: 20 }}
        onPress={() => onSavePress()}
      />
    );
  };

  const gotoHealthRecordsHomeScreen = () => {
    props.navigation.state.params?.onRecordAdded();
    props.navigation.goBack();
  };

  const onSavePress = () => {
    if (!registrationID) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please include Registration ID',
      });
    }
    if (!vaccinationCener) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please include Vaccination Center',
      });
    }
    if (!doseCount) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please include Vaccination Dose',
      });
    }
    if (!vaccinationName) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please include Vaccination Name',
      });
    }

    if (!dateOfTest) {
      showAphAlert!({
        title: 'Alert!',
        description: 'Please select date',
      });
    }
    if (
      registrationID &&
      vaccinationCener &&
      doseCount &&
      vaccinationName &&
      doseCount &&
      dateOfTest
    ) {
      setshowSpinner(true);
      const formatDate = moment(dateOfTest).format('YYYY-MM-DD');
      const doseType = doseCount === 'Dose 1' ? '1' : '2';
      client
        .mutate<addPatientImmunizationRecord, addPatientImmunizationRecordVariables>({
          mutation: GET_IMMUNIZATION_DETAILS,
          variables: {
            addImmunizationRecordInput: {
              patientId: currentPatient?.id,
              recordType: MedicalRecordType.IMMUNIZATION,
              immunizationName: 'COVID',
              vaccineName: vaccinationName,
              source: '247self',
              batchno: doseType,
              vaccine_location: vaccinationCener,
              registrationId: registrationID,
              dateOfImmunization: formatDate,
            },
          },
        })
        .then(({ data }) => {
          const eventInputData = removeObjectProperty(vaccinationCener, 'vaccinationResultFiles');
          postWebEngagePHR(
            currentPatient,
            WebEngageEventName.PHR_ADD_TEST_REPORT,
            'Vaccination',
            eventInputData
          );
          postWebEngageIfNewSession(
            'Vaccination',
            currentPatient,
            eventInputData,
            phrSession,
            setPhrSession
          );
          if (data?.addPatientImmunizationRecord.status) {
            gotoHealthRecordsHomeScreen();
          }
        })
        .catch((e) => {
          setshowSpinner(false);
          showAphAlert?.({
            title: 'Network Error!',
            description: 'Please try again later.',
          });
          CommonBugFender('AddVaccinationRecord_addPatientImmunizationRecord', e);
        });
    }
  };

  const renderDatePicker = () => {
    Keyboard.dismiss();
    setIsDateTimePickerVisible(true);
    setShowTime(false);
  };

  const renderDropDownContainer = () => {
    return (
      <MaterialMenu
        options={covidType.map((item) => ({
          key: item,
          value: item,
        }))}
        menuContainerStyle={{ alignItems: 'flex-end', marginLeft: width / 2 - 95 }}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: width / 2 }}
        selectedTextStyle={{
          ...theme.viewStyles.text('M', 14, '#00b38e'),
          alignSelf: 'flex-start',
        }}
        bottomPadding={{ paddingBottom: 20 }}
        lastContainerStyle={{ borderBottomWidth: 0 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 14, '#01475b') }}
        onPress={(item) => {
          setVaccinationName(item.key);
        }}
      >
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={styles.placeholderViewStyle}>
            <Text style={[styles.placeholderTextStyle]}>
              {vaccinationName ? vaccinationName : 'Vaccination Name'}
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };

  const renderDropDownForDose = () => {
    return (
      <MaterialMenu
        options={doseType.map((item) => ({
          key: item,
          value: item,
        }))}
        menuContainerStyle={{ alignItems: 'flex-end', marginLeft: width / 2 - 95 }}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: width / 2 }}
        selectedTextStyle={{
          ...theme.viewStyles.text('M', 14, '#00b38e'),
          alignSelf: 'flex-start',
        }}
        bottomPadding={{ paddingBottom: 20 }}
        lastContainerStyle={{ borderBottomWidth: 0 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 14, '#01475b') }}
        onPress={(item) => {
          setDoseCount(item.key);
        }}
      >
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={styles.placeholderViewStyle}>
            <Text style={[styles.placeholderTextStyle]}>
              {doseCount ? doseCount : 'Vaccination Dose'}
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    );
  };

  return (
    <View style={{ ...theme.viewStyles.container }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header
          container={styles.headerContainerStyle}
          title={string.common.addVaccinationText}
          leftIcon="backArrow"
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <KeyboardAvoidingView behavior={undefined} style={{ flex: 1 }}>
          <ScrollView bounces={false} keyboardShouldPersistTaps={'handled'}>
            <View style={styles.mainContainer}>
              <View style={styles.recordFieldContainer}>
                <Text style={styles.fieldTitle}>{'Record For'}</Text>
                <Text style={styles.fieldName}>
                  {_.capitalize(currentPatient?.firstName) || ''}
                </Text>
              </View>
              <View style={styles.recordNameContainer}>
                <Text style={styles.fieldTitle}>{`${'Vaccination Date'}*`}</Text>
                <TouchableOpacity style={styles.recordBtn} onPress={() => renderDatePicker()}>
                  <Text style={styles.recordCalendar}>
                    {dateOfTest !== '' ? dateOfTest : 'DD/MM/YYYY'}
                  </Text>
                  <CalendarBlackIcon style={styles.calendarIcon} />
                </TouchableOpacity>
              </View>
              <View style={styles.dropDownContainer}>
                <Text style={[styles.fieldTitle, { bottom: 10 }]}>{`${'Vaccination name'}*`}</Text>
                {renderDropDownContainer()}
              </View>
              <View style={styles.dropDownContainer}>
                <Text style={[styles.fieldTitle, { bottom: 10 }]}>{`${'Vaccination Dose'}*`}</Text>
                {renderDropDownForDose()}
              </View>
              <View style={styles.recordNameContainer}>
                <Text style={styles.fieldTitle}>{`${'Vaccination Center'}`}</Text>
                <TextInput
                  placeholder={'Hospital/Clinic name'}
                  style={styles.doctorInputContainer}
                  numberOfLines={1}
                  value={vaccinationCener}
                  onChangeText={(vaccCenter) => {
                    if (isValidText(vaccCenter)) {
                      setVaccinationCener(vaccCenter);
                    }
                  }}
                ></TextInput>
              </View>
              <View style={styles.recordNameContainer}>
                <Text style={styles.fieldTitle}>{`${'Registration ID'}`}</Text>
                <TextInput
                  placeholder={'Reg. no'}
                  style={styles.doctorInputContainer}
                  numberOfLines={1}
                  value={registrationID}
                  onChangeText={(regId) => {
                    if (isValidText(regId)) {
                      setRegistrationID(regId);
                    }
                  }}
                ></TextInput>
              </View>
            </View>
            <View style={{ height: 60 }} />
            <DatePicker
              time={showTime}
              isDateTimePickerVisible={isDateTimePickerVisible}
              handleDatePicked={(date) => {
                const formatDate = moment(date).format(string.common.date_placeholder_text);
                setdateOfTest(formatDate);
                setIsDateTimePickerVisible(false);
                Keyboard.dismiss();
              }}
              hideDateTimePicker={() => {
                setIsDateTimePickerVisible(false);
                Keyboard.dismiss();
              }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
        {renderBottomButton()}
      </SafeAreaView>
      {showSpinner && <Spinner />}
      {showPopUp && (
        <BottomPopUp
          title={`Hi ${(currentPatient && currentPatient.firstName!.toLowerCase()) || ''},`}
          description={'Please select images first'}
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.gotItStyles}
              onPress={() => {
                setshowPopUp(false);
              }}
            >
              <Text style={styles.gotItTextStyles}>{string.home.welcome_popup.cta_label}</Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
    </View>
  );
};
