import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CapsuleView } from './CapsuleView';
import { DoctorPlaceholderImage, OnlineConsult, PhysicalConsult } from './Icons';
import { getPatientPersonalizedAppointments_getPatientPersonalizedAppointments } from '../../graphql/types/getPatientPersonalizedAppointments';

const styles = StyleSheet.create({
  availableView: {
    position: 'absolute',
    right: 0,
    top: 0,
    minWidth: 112,
  },
  imageView: {
    margin: 16,
    marginTop: 32,
    width: 60,
  },
  doctorNameStyles: {
    paddingTop: 40,
    paddingLeft: 0,
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SEARCH_DOCTOR_NAME,
  },
  doctorSpecializationStyles: {
    paddingTop: 4,
    paddingBottom: 11.5,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
  },
  consultTextStyles: {
    paddingVertical: 11.5,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
  },
  prepareForConsult: {
    ...theme.viewStyles.yellowTextStyle,
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'right',
    paddingHorizontal: 15,
    paddingTop: 11,
    paddingBottom: 16,
  },
});

export interface ConsultPersonalizedCardProps {
  onClickButton: () => void;
  rowData: getPatientPersonalizedAppointments_getPatientPersonalizedAppointments | null;
}

export const ConsultPersonalizedCard: React.FC<ConsultPersonalizedCardProps> = (props) => {
  const rowData = props.rowData;
  console.log('ConsultPersonalizedCard', rowData);

  const renderAppointmentsScreen = () => {
    const item: any = rowData && rowData;

    const tomorrowDate = moment(new Date())
      .add(1, 'days')
      .format('DD MMM');
    // console.log(tomorrow, 'tomorrow');
    const appointmentDateTomarrow = moment(item.appointmentDateTime).format('DD MMM');
    // console.log(appointmentDateTomarrow, 'apptomorrow', tomorrowDate);

    const appointmentDateTime = moment
      .utc(item.appointmentDateTime)
      .local()
      .format('YYYY-MM-DD HH:mm:ss');
    const minutes = moment.duration(moment(appointmentDateTime).diff(new Date())).asMinutes();
    const title =
      minutes > 0 && minutes <= 15
        ? `${Math.ceil(minutes)} MIN${Math.ceil(minutes) > 1 ? 'S' : ''}`
        : tomorrowDate == appointmentDateTomarrow
        ? 'TOMORROW, ' + moment(appointmentDateTime).format('h:mm A')
        : moment(appointmentDateTime).format(
            appointmentDateTime.split(' ')[0] === new Date().toISOString().split('T')[0]
              ? 'h:mm A'
              : 'DD MMM, h:mm A'
          );
    const isActive = minutes > 0 && minutes <= 15 ? true : false;
    return (
      <View style={{ margin: 20, ...theme.viewStyles.cardViewStyle }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            props.onClickButton();
            // props.navigation.navigate(AppRoutes.DoctorDetails, {
            //   doctorId: item.doctorDetails.id,
            // });
          }}
        >
          <View style={{ overflow: 'hidden', flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <CapsuleView title={title} style={styles.availableView} isActive={isActive} />
              <View style={styles.imageView}>
                {item.doctorDetails &&
                item.doctorDetails.photoUrl &&
                item.doctorDetails.photoUrl.match(
                  /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/
                ) ? (
                  <Image
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                    }}
                    source={{ uri: item.doctorDetails.photoUrl }}
                    resizeMode={'contain'}
                  />
                ) : (
                  <DoctorPlaceholderImage
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                    }}
                    resizeMode={'contain'}
                  />
                )}
              </View>
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={styles.doctorNameStyles} numberOfLines={1}>
                  {item.doctorDetails ? `${item.doctorDetails.displayName}` : ''}
                </Text>

                <Text style={styles.doctorSpecializationStyles}>
                  {item.doctorDetails && item.doctorDetails.specialty
                    ? item.doctorDetails.specialty.name.toUpperCase()
                    : ''}
                  {item.doctorDetails
                    ? ` | ${item.doctorDetails.experience} YR${
                        Number(item.doctorDetails.experience) > 1 ? 'S' : ''
                      }`
                    : ''}
                </Text>

                <View style={styles.separatorStyle} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Text style={styles.consultTextStyles}>{item.hospitalLocation}</Text>
                  {item.appointmentType === 'ONLINE' ? (
                    <OnlineConsult style={{ marginTop: 13, height: 15, width: 15 }} />
                  ) : (
                    <PhysicalConsult style={{ marginTop: 13, height: 15, width: 15 }} />
                  )}
                </View>
              </View>
            </View>
            <View style={[styles.separatorStyle, { marginHorizontal: 16 }]} />

            <View>
              <Text style={styles.prepareForConsult}>BOOK A FOLLOW UP</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (rowData) {
    return <View>{renderAppointmentsScreen()}</View>;
  }
};
