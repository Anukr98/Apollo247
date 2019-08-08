import { CalendarCard } from '@aph/mobile-doctors/src/components/Appointments/CalendarCard';
import {
  MissedAppointmentIcon,
  NextAppointmentIcon,
  PastAppointmentIcon,
  UpComingIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Appointments, DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';
import {
  GetDoctorAppointments,
  GetDoctorAppointments_getDoctorAppointments,
  GetDoctorAppointments_getDoctorAppointments_appointmentsHistory,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorAppointments';
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
  ScrollView,
  NavigationScreenProp,
  NavigationRoute,
  NavigationParams,
} from 'react-navigation';
import moment from 'moment';
import { NavigationScreenProps } from 'react-navigation';
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

export interface AppointmentsListProps extends NavigationScreenProps {
  appointmentsHistory: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory[];
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = (props) => {
  console.log('getAppointmentsSSSSSS', props.appointmentsHistory);
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
              backgroundColor: showTop ? '#0087ba' : '#f7f7f7',
            },
          ]}
        />
        {getStatusCircle(status)}
        <View
          style={[
            styles.verticalLine,
            {
              backgroundColor: showBottom ? '#0087ba' : '#f7f7f7',
            },
          ]}
        />
      </View>
    );
  };

  return (
    <ScrollView bounces={false}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#f7f7f7',
        }}
      >
        {props.appointmentsHistory.map((i, index, array) => {
          return (
            <>
              {index == 0 && <View style={{ height: 20 }} />}
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {renderLeftTimeLineView(
                  i.appointmentDateTime,
                  index == 0 ? false : true,
                  index == array.length - 1 ? false : true
                )}
                <CalendarCard
                  onPress={(doctorId, patientId) => {
                    //console.log('', doctorId, patientId);
                    props.navigation.push(AppRoutes.ConsultRoomScreen, {
                      DoctorId: doctorId,
                      PatientId: patientId,
                      PatientConsultTime: moment(i.appointmentDateTime).format('HH:mm'),
                    });
                  }}
                  doctorname={i.status}
                  timing={moment(i.appointmentDateTime).format('HH:mm')}
                  symptoms={['FEVER', 'COUGH & COLD']}
                  doctorId={i.doctorId}
                  patientId={i.patientId}
                />
              </View>
            </>
          );
        })}
      </View>
    </ScrollView>
  );
};
