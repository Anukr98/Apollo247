import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import moment from 'moment';
import { DatePicker } from '@aph/mobile-patients/src/components/ui/DatePicker';
import { CalenderBlueIcon, TestInfoIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Gender } from '@aph/mobile-patients/src/graphql/types/globalTypes';

const {
  SHERPA_BLUE,
  INPUT_BORDER_SUCCESS,
  placeholderTextColor,
  WHITE,
  APP_GREEN,
  CLEAR,
} = theme.colors;

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
];

interface PatientDetailsOverlayProps {
  selectedPatient: any;
  onPressDone: (date: Date, gender: Gender, selectedPatient: any) => void;
  onPressClose: () => void;
}

export const PatientDetailsOverlay: React.FC<PatientDetailsOverlayProps> = (props) => {
  const { onPressDone, onPressClose, selectedPatient } = props;
  const [date, setDate] = useState<Date | undefined>(
    selectedPatient?.dateOfBirth ? new Date(selectedPatient?.dateOfBirth) : undefined
  );
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState<boolean>(false);
  const [gender, setGender] = useState<Gender>(selectedPatient?.gender || undefined);
  const patientDetailsText = `Details for ${selectedPatient?.firstName ||
    selectedPatient?.lastName ||
    ''}`;
  const patientMissingDetailsText =
    !date && !gender
      ? 'Date of Birth and Gender is Missing'
      : !date
      ? 'Date of Birth is Missing'
      : !gender
      ? 'Gender is Missing'
      : '';
  const patientFullName = `${selectedPatient?.firstName || ''} ${selectedPatient?.lastName}`;
  const dateOfBirth = moment(date).format('DD/MM/YYYY');

  const renderDatePicker = () => {
    const dateTextStyle = [
      styles.placeholderTextStyle,
      date !== undefined ? null : styles.placeholderStyle,
      date && styles.placeholderStyle,
    ];
    return (
      <View>
        <View style={{ marginTop: -5 }}>
          <View style={{ paddingTop: 0, paddingBottom: 10 }}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.placeholderViewStyle}
              onPress={() => {
                Keyboard.dismiss();
                !selectedPatient?.dateOfBirth && setIsDateTimePickerVisible(true);
              }}
            >
              <Text style={dateTextStyle}>{date !== undefined ? dateOfBirth : 'dd/mm/yyyy'}</Text>
              <CalenderBlueIcon />
            </TouchableOpacity>
          </View>
        </View>
        <DatePicker
          date={
            date ||
            moment()
              .subtract(25, 'years')
              .toDate()
          }
          isDateTimePickerVisible={isDateTimePickerVisible}
          handleDatePicked={(date) => {
            setIsDateTimePickerVisible(false);
            setDate(date);
            Keyboard.dismiss();
          }}
          hideDateTimePicker={() => {
            setIsDateTimePickerVisible(false);
            Keyboard.dismiss();
          }}
        />
      </View>
    );
  };

  const renderGender = () => {
    return (
      <View style={styles.genderViewStyle}>
        {GenderOptions.map((option) => {
          return (
            <Button
              key={option.name}
              title={option.title}
              style={[
                styles.buttonViewStyle,
                gender === option.name ? styles.selectedButtonViewStyle : null,
              ]}
              titleTextStyle={
                gender === option.name ? styles.selectedButtonTitleStyle : styles.buttonTitleStyle
              }
              onPress={() => setGender(option.name)}
            />
          );
        })}
      </View>
    );
  };

  const _onPressClose = () => {
    return !selectedPatient?.dateOfBirth || !selectedPatient?.gender ? {} : onPressClose();
  };

  return (
    <Overlay
      isVisible
      onRequestClose={_onPressClose}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={_onPressClose} />
        <View style={styles.overlayViewStyle}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            <View style={styles.mainViewStyle}>
              <Text style={styles.selectPatientNameTextStyle}>{patientDetailsText}</Text>
              {patientMissingDetailsText ? (
                <View style={styles.missingTextViewStyle}>
                  <TestInfoIcon style={styles.timeIconStyle} />
                  <Text style={styles.missingTextStyle}>{patientMissingDetailsText}</Text>
                </View>
              ) : null}
              <TextInputComponent
                editable={false}
                value={patientFullName}
                inputStyle={{ color: placeholderTextColor }}
                label={'Full Name'}
                placeholder={'First Last Name'}
              />
              <TextInputComponent label={'Date Of Birth'} noInput={true} />
              {renderDatePicker()}
              <TextInputComponent label={'Gender'} noInput={true} />
              {renderGender()}
              <Button
                title={'DONE'}
                disabled={!date || !gender}
                onPress={() => onPressDone(date!, gender, selectedPatient)}
                style={styles.doneButtonViewStyle}
              />
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Overlay>
  );
};

const { text, cardViewStyle } = theme.viewStyles;
const styles = StyleSheet.create({
  phrOverlayStyle: {
    padding: 0,
    margin: 0,
    width: '100%',
    height: '100%',
    backgroundColor: CLEAR,
    overflow: 'hidden',
    elevation: 0,
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle: {
    width: '100%',
    backgroundColor: CLEAR,
    bottom: 0,
    position: 'absolute',
  },
  overlayViewStyle1: {
    flexGrow: 1,
    backgroundColor: CLEAR,
  },
  overlaySafeAreaViewStyle: {
    flex: 1,
    backgroundColor: CLEAR,
  },
  mainViewStyle: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  selectPatientNameViewStyle: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectPatientNameTextStyle: {
    ...text('M', 17, SHERPA_BLUE, 1, 24),
  },
  doneButtonViewStyle: { width: '90%', alignSelf: 'center', marginBottom: 16 },
  patientItemViewStyle: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...cardViewStyle,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 0,
    paddingBottom: 3,
    borderColor: INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: placeholderTextColor,
  },
  placeholderTextStyle: {
    ...text('M', 18, SHERPA_BLUE),
  },
  genderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  buttonViewStyle: {
    width: '30%',
    marginRight: 16,
    backgroundColor: WHITE,
  },
  selectedButtonViewStyle: {
    backgroundColor: APP_GREEN,
  },
  buttonTitleStyle: {
    color: SHERPA_BLUE,
  },
  selectedButtonTitleStyle: {
    color: WHITE,
  },
  timeIconStyle: {
    width: 16,
    height: 16,
  },
  missingTextStyle: {
    ...text('M', 10, SHERPA_BLUE, 0.6, 16),
    marginLeft: 8,
  },
  missingTextViewStyle: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
    marginTop: 8,
  },
});
