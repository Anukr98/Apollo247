import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';

interface CancelAppointmentProps {
  title: string;
  onPressBack: () => void;
  onPressReschedule: () => void;
  onPressCancel: () => void;
  customTitle?: string;
}

export const CancelAppointmentPopup: React.FC<CancelAppointmentProps> = (props) => {
  const { title, onPressBack, onPressReschedule, onPressCancel, customTitle } = props;
  const { currentPatient } = useAllCurrentPatients();

  return (
    <BottomPopUp
      title={customTitle || `Hi, ${currentPatient?.firstName} ${currentPatient?.lastName} :)`}
      description={title}
      onPressBack={onPressBack}
    >
      <View style={styles.container}>
        <View style={{ height: 60 }}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.gotItStyles}
            onPress={() => {
              onPressReschedule();
            }}
          >
            <Text style={styles.gotItTextStyles}>{'RESCHEDULE INSTEAD'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 60 }}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.gotItStyles}
            onPress={() => {
              onPressCancel();
            }}
          >
            <Text style={styles.gotItTextStyles}>{'CANCEL CONSULT'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomPopUp>
  );
};

const styles = StyleSheet.create({
  gotItStyles: {
    height: 60,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  container: {
    flexDirection: 'row',
    marginHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
});
