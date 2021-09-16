import { DoctorPlaceholderImage } from '@aph/mobile-patients/src/components/ui/Icons';
import { GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments } from '@aph/mobile-patients/src/graphql/types/GetPatientAllAppointmentsForHelp';
import { APPOINTMENT_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image, ListItem } from 'react-native-elements';

export interface Props {
  consult: GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments;
  onPress: () => void;
  onPressHelp: () => void;
}

export const ConsultCard: React.FC<Props> = ({ consult, onPress, onPressHelp }) => {
  const renderDetails = () => {
    const consultId = `#${consult?.displayId}`;
    const displayName = consult?.doctorInfo?.displayName;
    const specialty = consult?.doctorInfo?.specialty?.name;
    const experience = consult?.doctorInfo?.experience;
    const specialtyAndExp = `${specialty} | ${experience}YRS`;
    const facility = consult?.doctorInfo?.doctorHospital?.[0]?.facility;
    const hospital = `${facility?.name}, ${facility?.city}  | `;
    const amount = `₹${consult?.actualAmount}`;

    return (
      <View>
        <Text style={styles.consultId}>{consultId}</Text>
        <Text style={styles.orderTitle} onPress={onPress}>
          {displayName}
        </Text>
        <Text style={styles.specialtyAndExp}>{specialtyAndExp}</Text>
        <Text style={styles.hospitalAndAmount}>
          <Text style={styles.hospital}>{hospital}</Text>
          <Text style={styles.amount}>{amount}</Text>
        </Text>
        {renderConsultTypeAndHelp()}
      </View>
    );
  };

  const renderConsultTypeAndHelp = () => {
    const isOnlineConsult = consult?.appointmentType === APPOINTMENT_TYPE.ONLINE;
    return (
      <View style={styles.linkContainer}>
        <View style={styles.statusContainer}>
          <Text onPress={onPressHelp} style={styles.consultType}>
            {'Consult Type:'}
          </Text>
          <Text onPress={onPressHelp} style={styles.consultTypeValue}>
            {isOnlineConsult ? 'Online' : 'In-Person'}
          </Text>
        </View>
        <Text onPress={onPressHelp} style={styles.link}>
          {string.help.toUpperCase()}
        </Text>
      </View>
    );
  };

  const renderDate = () => {
    const date = moment(consult?.appointmentDateTime).format('DD MMM YYYY, hh:mm A');
    return (
      <View style={styles.dateContainer}>
        <Text style={styles.date}>{date}</Text>
      </View>
    );
  };

  const renderImage = () => {
    return (
      <View style={styles.imgContainer}>
        <Image
          source={{ uri: consult?.doctorInfo?.thumbnailUrl! }}
          PlaceholderContent={<DoctorPlaceholderImage style={styles.doctorPlaceholder} />}
          style={styles.doctorPlaceholder}
        />
      </View>
    );
  };

  return (
    <ListItem
      title={renderDetails()}
      subtitle={renderDate()}
      pad={10}
      containerStyle={styles.listItemContainer}
      Component={TouchableOpacity}
      leftIcon={renderImage()}
    />
  );
};

const { card, text } = theme.viewStyles;
const { CAPSULE_INACTIVE_BG, LIGHT_BLUE, APP_YELLOW, SKY_BLUE } = theme.colors;
const styles = StyleSheet.create({
  listItemContainer: {
    ...card(),
    paddingLeft: 10,
    marginTop: 0,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  consultId: {
    ...text('M', 12, LIGHT_BLUE),
    marginBottom: 5,
  },
  orderTitle: {
    ...text('M', 16, LIGHT_BLUE),
    marginBottom: 2,
  },
  specialtyAndExp: {
    ...text('M', 12, SKY_BLUE),
    marginBottom: 8,
  },
  hospitalAndAmount: {
    marginBottom: 15,
  },
  hospital: {
    ...text('M', 12, LIGHT_BLUE),
    opacity: 0.6,
  },
  amount: {
    ...text('M', 12, LIGHT_BLUE),
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusContainer: {
    marginLeft: -55,
  },
  consultType: {
    ...text('L', 12, LIGHT_BLUE),
  },
  consultTypeValue: {
    ...text('M', 12, LIGHT_BLUE),
  },
  link: {
    ...text('M', 13, APP_YELLOW),
  },
  dateContainer: {
    position: 'absolute',
    top: -16,
    right: -16,
    borderRadius: 10,
    backgroundColor: CAPSULE_INACTIVE_BG,
  },
  date: {
    ...text('B', 9, LIGHT_BLUE),
    marginVertical: 6,
    marginHorizontal: 12,
  },
  imgContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  doctorPlaceholder: {
    height: 50,
    width: 50,
    resizeMode: 'contain',
  },
});
