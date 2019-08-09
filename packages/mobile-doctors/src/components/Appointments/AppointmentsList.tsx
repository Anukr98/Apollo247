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
  const showDiff = (
    one: any,
    two: any,
    doctorId: string,
    patientId: string,
    PatientInfo: object,
    appId: string
  ) => {
    console.log('one', one);
    console.log('two', two);
    console.log('PatientInfo', PatientInfo);
    const dt1 = new Date(one);
    const dt2 = new Date(two);
    const diff = dt2.getHours() - dt1.getHours();
    const diff2 = dt2.getMinutes() - dt1.getMinutes();
    console.log('diff', diff.toString().length);
    console.log('diff2', diff2);
    const val = '0';
    const CDA = diff
      .toString()
      .concat(':')
      .concat(diff2.toString().length == 1 ? val.concat(diff2.toString()) : diff2.toString());

    //CDA /= 60;
    //console.log('Math.abs(Math.round(diff))', Math.abs(Math.round(CDA)));
    // return Math.abs(Math.round(diff));
    props.navigation.push(AppRoutes.ConsultRoomScreen, {
      DoctorId: doctorId,
      PatientId: patientId,
      PatientConsultTime: CDA.replace('-', ''),
      PatientInfoAll: PatientInfo,
      AppId: appId,
    });
  };
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
    const dateTime = _date.split('T');
    const date = dateTime[0].split('-');
    const time = dateTime[1].substring(0, 4).split(':');
    return new Date(
      parseInt(date[0]),
      parseInt(date[1]),
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
    } else {
      const appointemntTime = getDateFormat(appointment.appointmentDateTime);
      if (moment(appointemntTime).isBefore()) return 'past';
      else return 'next';
    }
  };

  const formatTiming = (appointmentDateTime: string) => {
    const aptmtDate = getDateFormat(appointmentDateTime);
    const slotStartTime = moment(aptmtDate).format('hh:mm') || '';
    const slotEndTime =
      moment(aptmtDate)
        .add(15, 'minutes')
        .format('hh:mm A') || '';
    return `${slotStartTime} - ${slotEndTime}`;
  };

  return (
    <ScrollView bounces={false}>
      <View style={{ flex: 1 }}>
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
                  isNewPatient={true}
                  onPress={(doctorId, patientId, PatientInfo, appointmentTime, appId) => {
                    console.log('appppp', appId);
                    const todaytime = moment(new Date()).format('YYYY-MM-DDTHH:mm');
                    const appointmentDateTime = moment(i.appointmentDateTime).format(
                      'YYYY-MM-DDTHH:mm'
                    );
                    console.log('todaytime', todaytime);
                    console.log('appointmentDateTime', appointmentDateTime);
                    console.log(moment(i.appointmentDateTime).format('HH:mm'));
                    {
                      todaytime < appointmentDateTime
                        ? showDiff(
                            todaytime,
                            appointmentDateTime,
                            doctorId,
                            patientId,
                            PatientInfo,
                            appId
                          )
                        : props.navigation.push(AppRoutes.ConsultRoomScreen, {
                            DoctorId: doctorId,
                            PatientId: patientId,
                            PatientConsultTime: null,
                            PatientInfoAll: PatientInfo,
                            AppId: appId,
                          });
                    }

                    // props.navigation.push(AppRoutes.ConsultRoomScreen, {
                    //   DoctorId: doctorId,
                    //   PatientId: patientId,
                    //   PatientConsultTime: moment(i.appointmentDateTime).format('HH:mm'),
                    //   PatientInfoAll: PatientInfo,
                    // });
                  }}
                  doctorname={i.doctorId}
                  timing={formatTiming(i.appointmentDateTime)}
                  symptoms={[]}
                  doctorId={i.doctorId}
                  patientId={i.patientId}
                  status={getStatus(i)}
                  wayOfContact={i.appointmentType == APPOINTMENT_TYPE.ONLINE ? 'video' : 'clinic'}
                  PatientInfo={i.patientInfo!}
                  consultTime={i.appointmentDateTime}
                  appId={i.id}
                />
              </View>
            </>
          );
        })}
      </View>
    </ScrollView>
  );
};
