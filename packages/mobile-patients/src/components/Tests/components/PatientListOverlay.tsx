import { getAge } from '@aph/mobile-patients/src//helpers/helperFunctions';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Overlay } from 'react-native-elements';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';

const { SHERPA_BLUE, APP_YELLOW, CARD_BG, WHITE, APP_GREEN, CLEAR } = theme.colors;

interface PatientListOverlayProps {
  onPressAddNewProfile: () => void;
  onPressDone: (selectedPatient: any) => void;
  onPressClose: () => void;
  onPressAndroidBack: () => void;
  patientSelected?: any;
  title?: string;
  subTitle?: string;
  excludeProfileListIds?: string[];
  showCloseIcon: boolean;
  onCloseIconPress: () => void;
}

export const PatientListOverlay: React.FC<PatientListOverlayProps> = (props) => {
  const {
    onPressDone,
    onPressAddNewProfile,
    onPressClose,
    onPressAndroidBack,
    patientSelected,
  } = props;
  const { allCurrentPatients } = useAllCurrentPatients();
  const [selectedPatient, setSelectedPatient] = useState<any>(patientSelected);

  const renderPatientListItem = ({ index, item }) => {
    if (props.excludeProfileListIds?.includes(item?.uhid)) {
      return null;
    }

    const patientName = `${item?.firstName || ''} ${item?.lastName || ''}`;
    const genderAgeText = `${item?.gender || ''}, ${
      item?.dateOfBirth ? getAge(item?.dateOfBirth) || '' : ''
    }`;
    const showGreenBg = selectedPatient?.id === item?.id;

    const itemViewStyle = [
      styles.patientItemViewStyle,
      index === 0 && { marginTop: 12 },
      showGreenBg && { backgroundColor: APP_GREEN },
    ];
    return item?.id === '+ADD MEMBER' ? null : (
      <TouchableOpacity
        activeOpacity={1}
        style={itemViewStyle}
        onPress={() => setSelectedPatient(item)}
      >
        <Text style={[styles.patientNameTextStyle, showGreenBg && { color: WHITE }]}>
          {patientName}
        </Text>
        <Text style={[styles.genderAgeTextStyle, showGreenBg && { color: WHITE }]}>
          {genderAgeText}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Overlay
      isVisible
      onRequestClose={() => (patientSelected?.id ? onPressClose() : onPressAndroidBack())}
      windowBackgroundColor={'rgba(0, 0, 0, 0.6)'}
      containerStyle={{ marginBottom: 0 }}
      fullScreen
      transparent
      overlayStyle={styles.phrOverlayStyle}
    >
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => (patientSelected?.id ? onPressClose() : {})}
        />
        <View style={styles.overlayViewStyle}>
          <SafeAreaView style={styles.overlaySafeAreaViewStyle}>
            {props.showCloseIcon && (
              <View style={{ alignSelf: 'flex-end' }}>
                <TouchableOpacity
                  style={{ width: 40, height: 40 }}
                  onPress={props.onCloseIconPress}
                >
                  <CrossPopup style={{ width: 28, height: 28 }} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.mainViewStyle}>
              <View style={styles.selectPatientNameViewStyle}>
                <Text style={styles.selectPatientNameTextStyle}>
                  {props.title || string.diagnostics.selectPatientNameText}
                </Text>
                <Text style={styles.addMemberText} onPress={onPressAddNewProfile}>
                  {string.diagnostics.addMemberText}
                </Text>
              </View>
              <Text style={styles.patientOrderTestMsgTextStyle}>
                {props.subTitle || string.diagnostics.patientTestOrderMsg}
              </Text>
              <View style={styles.patientListCardStyle}>
                <FlatList
                  bounces={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  keyExtractor={(_, index) => index.toString()}
                  data={allCurrentPatients || []}
                  renderItem={renderPatientListItem}
                />
              </View>
              <Button
                title={'DONE'}
                disabled={!selectedPatient?.id}
                onPress={() => onPressDone(selectedPatient)}
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
  addMemberText: {
    ...text('B', 13, APP_YELLOW, 1, 24),
  },
  patientOrderTestMsgTextStyle: {
    ...text('R', 12, SHERPA_BLUE, 1, 18),
  },
  patientListCardStyle: {
    ...cardViewStyle,
    height: 180,
    backgroundColor: CARD_BG,
    marginTop: 12,
    marginBottom: 35,
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
    minHeight: 45,
  },
  patientNameTextStyle: {
    ...text('M', 16, APP_GREEN, 1, 20.8, -0.36),
    width: '75%',
  },
  genderAgeTextStyle: {
    ...text('M', 12, APP_GREEN, 1, 15.6, -0.36),
  },
});
