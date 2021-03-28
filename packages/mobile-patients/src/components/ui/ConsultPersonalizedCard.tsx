import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getPatientPersonalizedAppointments_getPatientPersonalizedAppointments } from '../../graphql/types/getPatientPersonalizedAppointments';
import { DoctorPlaceholderImage, OnlineConsult, PhysicalConsult } from './Icons';

const styles = StyleSheet.create({
  imageView: {
    margin: 15,
    marginTop: 10,
    width: 60,
  },
  doctorNameStyles: {
    paddingTop: 15,
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
    paddingTop: 11,
    paddingLeft: 10,
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

  const renderAppointmentsScreen = () => {
    const item: any = rowData && rowData;

    const appointmentDateTime = moment
      .utc(item.appointmentDateTime)
      .local()
      .format('DD MMM, HH:mm A');
    return (
      <View style={{ margin: 20, ...theme.viewStyles.cardViewStyle }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            props.onClickButton();
          }}
        >
          <View style={{ overflow: 'hidden', flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.imageView}>
                {item.doctorDetails &&
                item.doctorDetails.photoUrl &&
                item.doctorDetails.photoUrl.match(
                  /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jpeg|JPEG)/
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
                    ? item.doctorDetails.specialty.userFriendlyNomenclature.toUpperCase()
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
                    alignItems: 'flex-start',
                  }}
                >
                  {item.appointmentType === 'ONLINE' ? (
                    <OnlineConsult style={{ marginTop: 13, height: 17, width: 17 }} />
                  ) : (
                    <PhysicalConsult style={{ marginTop: 13, height: 17, width: 17 }} />
                  )}
                  <View>
                    <Text style={styles.consultTextStyles}>{item.hospitalLocation}</Text>
                    <Text
                      style={{
                        paddingBottom: 12,
                        paddingLeft: 10,
                        ...theme.viewStyles.text('M', 10, '#02475b', 0.6, 20, 0),
                      }}
                    >
                      {`Last Appointment: ${appointmentDateTime}`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={[
                styles.separatorStyle,
                { marginHorizontal: 16, borderBottomColor: 'rgba(2, 71, 91, 0.6)' },
              ]}
            />

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
