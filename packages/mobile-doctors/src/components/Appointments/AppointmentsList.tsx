import { CalendarCard } from '@aph/mobile-doctors/src/components/Appointments/CalendarCard';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import {
  MissedAppointmentIcon,
  NextAppointmentIcon,
  PastAppointmentIcon,
  UpComingIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { GetDoctorAppointments_getDoctorAppointments_appointmentsHistory } from '@aph/mobile-doctors/src/graphql/types/GetDoctorAppointments';
import { APPOINTMENT_TYPE, STATUS } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { Appointments } from '@aph/mobile-doctors/src/helpers/commonTypes';
import moment from 'moment';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  NavigationParams,
  NavigationRoute,
  NavigationScreenProp,
  NavigationScreenProps,
  ScrollView,
} from 'react-navigation';
import { getLocalData } from '@aph/mobile-doctors/src/helpers/localStorage';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';

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
  appointmentsHistory: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory | null)[];
  newPatientsList: (string | null)[];
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = (props) => {
  const isNewPatient = (id: string) => {
    return props.newPatientsList.indexOf(id) > -1;
  };
  const { doctorDetails } = useAuth();

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

  const getDateFormat = (_date: string /*"2019-08-08T20:30:00.000Z"*/) => {
    console.log(
      'getDateFormat',
      moment
        .utc(_date)
        .local()
        .format('HH:mm:ss')
    );
    const dateTime = _date.split('T');
    const date = dateTime[0].split('-');
    const time = dateTime[1].substring(0, 4).split(':');
    return new Date(
      parseInt(date[0]),
      parseInt(date[1]) - 1,
      parseInt(date[2]),
      parseInt(time[0]),
      parseInt(time[1])
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

  const formatTiming = (appointmentDateTime: string, consultDuration?: number) => {
    const aptmtDate = moment
      .utc(appointmentDateTime)
      .local()
      .format('YYYY-MM-DD HH:mm:ss'); //getDateFormat(appointmentDateTime);
    const slotStartTime = moment(aptmtDate).format('h:mm') || '';
    const slotEndTime =
      moment(aptmtDate)
        .add(consultDuration, 'minutes')
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
        {props.appointmentsHistory.map((_i, index, array) => {
          const i = _i!;
          const consultDuration =
            doctorDetails?.consultHours?.filter(
              (item) =>
                item?.weekDay ===
                moment(i.appointmentDateTime)
                  .format('dddd')
                  .toUpperCase()
            )[0]?.consultDuration || 15;
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
                  isNewPatient={isNewPatient(i.patientInfo!.id)}
                  onPress={(doctorId, patientId, PatientInfo, appointmentTime, appId) => {
                    console.log('appppp', appId, i);
                    props.navigation.push(AppRoutes.ConsultRoomScreen, {
                      DoctorId: doctorId,
                      PatientId: patientId,
                      PatientConsultTime: null,
                      PatientInfoAll: PatientInfo,
                      AppId: appId,
                      Appintmentdatetime: i.appointmentDateTime, //getDateFormat(i.appointmentDateTime),
                      AppointmentStatus: i.status,
                    });
                  }}
                  doctorname={i.patientInfo!.firstName || ''}
                  timing={formatTiming(i.appointmentDateTime, consultDuration)}
                  symptoms={[]}
                  doctorId={i.doctorId}
                  patientId={i.patientId}
                  status={getStatus(i)}
                  wayOfContact={i.appointmentType == APPOINTMENT_TYPE.ONLINE ? 'video' : 'clinic'}
                  PatientInfo={i.patientInfo!}
                  consultTime={i.appointmentDateTime}
                  appId={i.id}
                  appintmentdatetime={i.appointmentDateTime}
                />
              </View>
            </>
          );
        })}
      </View>
    </ScrollView>
  );
};
