import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Text, FlatList, TouchableOpacity } from 'react-native';
import { NavigationRoute, NavigationScreenProp, NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import moment from 'moment';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';

interface ConsultPatientSelectorProps extends NavigationScreenProps {
  navigation: NavigationScreenProp<NavigationRoute<{}>, {}>;
  visiblity: boolean;
  setPatient: (patient: object) => void;
  onCloseClicked: () => void;
}

export const ConsultPatientSelector: React.FC<ConsultPatientSelectorProps> = (props) => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [visiblity, setVisiblity] = useState<boolean>(props.visiblity);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();

  useEffect(() => {
    setVisiblity(props.visiblity);
  }, [props.visiblity]);

  const renderPatientRow = (item: any) => {
    const { firstName, lastName, gender, dateOfBirth } = item;
    const isSelected = selectedPatient?.id == item.id;
    return (
      <TouchableOpacity
        onPress={() => setSelectedPatient(item)}
        style={isSelected ? styles.selectedPatientRow : styles.patientRow}
      >
        <Text style={isSelected ? styles.selectedNameText : styles.nameText}>
          {`${firstName} ${lastName}`}
        </Text>
        <Text style={isSelected ? styles.selectedNameText : styles.nameText}>
          {`${gender}, ${moment().diff(dateOfBirth, 'years')}`}
        </Text>
      </TouchableOpacity>
    );
  };

  const addNewMember = () => {
    props.navigation.navigate(AppRoutes.EditProfile, {
      isEdit: false,
      screenName: string.consult,
      mobileNumber: currentPatient && currentPatient!.mobileNumber,
    });
  };

  const getPatientData = () => {
    let patientList = allCurrentPatients?.filter((item: any) => item?.id != '+ADD MEMBER');
    return patientList;
  };
  return (
    <Modal
      animationType={'none'}
      transparent={true}
      visible={visiblity}
      presentationStyle={'overFullScreen'}
      onRequestClose={() => {}}
      onDismiss={() => {}}
    >
      <View style={styles.parentOverlay}>
        <TouchableOpacity
          style={{ alignSelf: 'flex-end' }}
          onPress={() => {
            props.onCloseClicked();
          }}
        >
          <CrossPopup style={{ width: 18, height: 18, marginRight: 10, marginBottom: 10 }} />
        </TouchableOpacity>
        <View style={styles.overlayView}>
          <View style={styles.addMemberView}>
            <Text style={styles.selectPatientText}>{string.consultPackages.selectPatient}</Text>
            <Text style={styles.addMemberText} onPress={addNewMember}>
              {string.diagnostics.addMemberText}
            </Text>
          </View>
          <Text style={styles.infoText}>{string.consultPackages.patientSelectionGuide}</Text>
          <FlatList
            data={getPatientData()}
            keyExtractor={(_, index) => `${index}`}
            renderItem={({ item }) => renderPatientRow(item)}
          />
          <Button
            style={styles.submitBtn}
            onPress={() => {
              props.setPatient(selectedPatient);
            }}
            disabled={!selectedPatient}
            title={string.submit}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  parentOverlay: {
    flex: 1,
    backgroundColor: theme.colors.DIM_BLACK,
    justifyContent: 'flex-end',
  },
  overlayView: {
    backgroundColor: theme.colors.CARD_BG,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 500,
  },
  addMemberView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 21,
    alignItems: 'center',
    paddingBottom: 2,
  },
  selectPatientText: {
    ...theme.viewStyles.text('M', 17, theme.colors.SHERPA_BLUE, undefined, 24),
  },
  addMemberText: {
    ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_ORANGE, undefined, 24),
  },
  infoText: {
    ...theme.viewStyles.text('M', 12, theme.colors.SKY_BLUE, undefined, 20),
    paddingVertical: 6,
  },
  patientRow: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    justifyContent: 'space-between',
    marginVertical: 4,
    padding: 12,
    marginHorizontal: 6,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 10,
  },
  nameText: {
    ...theme.viewStyles.text('M', 16, theme.colors.APP_GREEN, undefined, 21),
  },
  selectedPatientRow: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: theme.colors.APP_GREEN,
    justifyContent: 'space-between',
    marginVertical: 4,
    padding: 12,
    marginHorizontal: 6,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 10,
  },
  selectedNameText: {
    ...theme.viewStyles.text('M', 16, theme.colors.WHITE, undefined, 21),
  },
  submitBtn: {
    width: 100,
    height: 40,
    alignSelf: 'center',
    marginVertical: 24,
  },
});
