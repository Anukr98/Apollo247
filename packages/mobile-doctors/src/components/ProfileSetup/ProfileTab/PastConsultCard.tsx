import {
  ArrowRight,
  Audio,
  MissedAppointmentIcon,
  NextAppointmentIcon,
  PastAppointmentIcon,
  UpComingIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { GetDoctorAppointments_getDoctorAppointments_appointmentsHistory } from '@aph/mobile-doctors/src/graphql/types/GetDoctorAppointments';
import { STATUS } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { Appointments } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';

const styles = StyleSheet.create({
  leftTimeLineContainer: {
    // marginBottom: -40,
    marginRight: 9,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalLine: {
    flex: 1,
    width: 2,
  },
});

export interface PastConsultCardProps extends NavigationScreenProps {
  data: [];
  patientDetails: {};
}

export const PastConsultCard: React.FC<PastConsultCardProps> = (props) => {
  const getStatusCircle = (status: Appointments['timeslottype']) =>
    status == 'past' ? (
      <PastAppointmentIcon />
    ) : status == 'missed' ? (
      <MissedAppointmentIcon />
    ) : status == 'next' ? (
      <NextAppointmentIcon />
    ) : (
      <UpComingIcon />
    );

  const renderLeftTimeLineView = (
    status: Appointments['timeslottype'],
    showTop: boolean,
    showBottom: boolean
  ) => {
    return (
      <View style={styles.leftTimeLineContainer}>
        <View
          style={[
            styles.verticalLine,
            {
              backgroundColor: showTop ? theme.colors.SHARP_BLUE : '#f7f7f7',
            },
          ]}
        />
        {getStatusCircle(status)}
        <View
          style={[
            styles.verticalLine,
            {
              backgroundColor: showBottom ? theme.colors.SHARP_BLUE : '#f7f7f7',
            },
          ]}
        />
      </View>
    );
  };

  const getStatus = (
    appointment: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory
  ): Appointments['timeslottype'] => {
    if (appointment.status == STATUS.IN_PROGRESS) {
      return 'up-next';
    } else if (appointment.status == STATUS.CANCELLED) {
      return 'missed';
    } else if (appointment.status == STATUS.COMPLETED) {
      return 'past';
    } else {
      const appointemntTime = moment
        .utc(appointment.appointmentDateTime)
        .local()
        .format('YYYY-MM-DD HH:mm:ss'); //getDateFormat(appointment.appointmentDateTime);
      if (moment(appointemntTime).isBefore()) return 'next';
      else return 'next';
    }
  };

  const formatTiming = (appointmentDateTime: string) => {
    const aptmtDate = moment
      .utc(appointmentDateTime)
      .local()
      .format('YYYY-MM-DD HH:mm:ss'); //getDateFormat(appointmentDateTime);
    const slotStartTime = moment(aptmtDate).format('h:mm') || '';
    const slotEndTime =
      moment(aptmtDate)
        .add(15, 'minutes')
        .format('h:mm A') || '';
    return `${slotStartTime} - ${slotEndTime}`;
  };

  return (
    <ScrollView bounces={false}>
      <View
        style={{
          flex: 1,
        }}
      >
        {props.data.map((i, index, array) => {
          return (
            <>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  // justifyContent: 'center',
                  // alignItems: 'center',
                }}
              >
                {renderLeftTimeLineView(
                  i.appointmentDateTime,
                  index == 0 ? false : true,
                  index == array.length - 1 ? false : true
                )}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    borderRadius: 10,
                    backgroundColor: theme.colors.WHITE,
                    height: 50,
                    alignItems: 'center',
                    paddingRight: 10,
                    paddingLeft: 18,
                    marginVertical: 4.5,
                    marginRight: 20,
                    flex: 1,
                    justifyContent: 'space-between',
                  }}
                  onPress={() =>
                    props.navigation.navigate(AppRoutes.CaseSheetDetails, {
                      consultDetails: i,
                      patientDetails: props.patientDetails,
                    })
                  }
                >
                  <Text
                    style={{
                      ...theme.viewStyles.text('M', 12, theme.colors.darkBlueColor(0.6), 1, 12),
                    }}
                  >
                    {moment(i.appointmentDateTime).format('D MMMM, HH:MM A')}
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ marginRight: 24 }}>
                      <Audio />
                    </View>
                    <ArrowRight />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          );
        })}
      </View>
    </ScrollView>
  );
};
