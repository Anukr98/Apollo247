import { CalendarCard } from '@aph/mobile-doctors/src/components/Appointments/CalendarCard';
import {
  MissedAppointmentIcon,
  NextAppointmentIcon,
  PastAppointmentIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Appointments, DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-navigation';

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

export interface AppointmentsListProps {
  doctorProfile: DoctorProfile;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = (props) => {
  const getDoctorProfile = props.doctorProfile;

  const getStatusCircle = (status: Appointments['timeslottype']) =>
    status == 'past' ? (
      <PastAppointmentIcon />
    ) : status == 'missed' ? (
      <MissedAppointmentIcon />
    ) : (
      <NextAppointmentIcon />
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
    <ScrollView>
      <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
        {getDoctorProfile.appointments.map((i, index, array) => {
          return (
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {renderLeftTimeLineView(
                i.timeslottype,
                index == 0 ? false : true,
                index == array.length - 1 ? false : true
              )}
              <CalendarCard
                onPress={(id) => {}}
                doctorname={i.doctorname}
                wayOfContact={i.wayOfContact}
                type={i.timeslottype}
                timing={i.timings}
                symptoms={['FEVER', 'COUGH & COLD']}
              />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};
