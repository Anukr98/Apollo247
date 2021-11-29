import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
const { width, height } = Dimensions.get('window');
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import { statusBarHeight } from '@aph/mobile-patients/src/helpers/helperFunctions';

interface RescheduleCancelProps {
  onPressCancelAppointment: () => void;
  onPressRescheduleAppointment: () => void;
  closeModal: () => void;
  appointmentDiffMin: number;
  appointmentDateTime: string;
  isAppointmentExceedsTenMin: boolean;
  isAppointmentStartsInFifteenMin: boolean;
}
export const RescheduleCancelPopup: React.FC<RescheduleCancelProps> = (props) => {
  const {
    onPressCancelAppointment,
    closeModal,
    onPressRescheduleAppointment,
    appointmentDiffMin,
    appointmentDateTime,
    isAppointmentExceedsTenMin,
    isAppointmentStartsInFifteenMin,
  } = props;

  const btnDisable = isAppointmentStartsInFifteenMin || isAppointmentExceedsTenMin;
  const btnTextColor = btnDisable ? theme.colors.DISABLE_TEXT : theme.colors.APP_YELLOW;
  const postTenMinAppointmentTime = moment(appointmentDateTime)
    .add(10, 'minutes')
    .toDate();
  let appointmentInfoText = '';
  if (isAppointmentStartsInFifteenMin) {
    appointmentInfoText = 'Appointment starts in less than 15 minutes';
  } else if (isAppointmentExceedsTenMin) {
    appointmentInfoText = `Please wait till ${moment(postTenMinAppointmentTime).format(
      'h:mm a'
    )} for doctor to start consult.`;
  }
  return (
    <View style={[styles.container, { top: statusBarHeight() + 15 }]}>
      <TouchableOpacity
        onPress={() => {
          closeModal();
        }}
      >
        <View style={styles.cancelMainView}>
          <View style={styles.cancelPopupView}>
            <TouchableOpacity disabled={btnDisable} onPress={() => onPressRescheduleAppointment()}>
              <View style={styles.reschdeuleView}>
                <Text style={[styles.cancelText, { color: btnTextColor }]}>
                  Reschedule Appointment
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity disabled={btnDisable} onPress={() => onPressCancelAppointment()}>
              <View style={[styles.cancelViewStyles, { marginTop: 0 }]}>
                <Text style={[styles.cancelText, { color: btnTextColor }]}>Cancel Appointment</Text>
                {appointmentInfoText ? (
                  <Text style={styles.info}>{appointmentInfoText}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: height,
    width: width,
    flex: 1,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  calenderIcon: {
    width: 20,
    height: 22,
  },
  cancelMainView: {
    margin: 0,
    height: height,
    width: width,
    backgroundColor: 'transparent',
  },
  cancelPopupView: {
    ...theme.viewStyles.shadowStyle,
  },
  cancelViewStyles: {
    backgroundColor: 'white',
    width: 210,
    marginLeft: width - 230,
    padding: 12,
    marginTop: 40,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  reschdeuleView: {
    backgroundColor: 'white',
    width: 210,
    marginLeft: width - 230,
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#DADADA',
  },
  networkConnectivityTestView: {
    backgroundColor: 'white',
    width: 210,
    marginLeft: width - 230,
    marginTop: 40,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#DADADA',
  },
  cancelText: {
    backgroundColor: 'white',
    color: theme.colors.APP_YELLOW,
    ...theme.fonts.IBMPlexSansMedium(15),
  },
  info: {
    marginTop: 7,
    ...theme.viewStyles.text('M', 12, theme.colors.RED),
  },
});
