import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import PastConsultCardStyles from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/PastConsultCard.styles';
import {
  ArrowRight,
  Audio,
  MissedAppointmentIcon,
  NextAppointmentIcon,
  PastAppointmentIcon,
  UpComingIcon,
  Video,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import {
  GetCaseSheet_getCaseSheet_pastAppointments,
  GetCaseSheet_getCaseSheet_patientDetails,
} from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { GetDoctorAppointments_getDoctorAppointments_appointmentsHistory } from '@aph/mobile-doctors/src/graphql/types/GetDoctorAppointments';
import { APPOINTMENT_TYPE, STATUS } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { Appointments } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

const styles = PastConsultCardStyles;

export interface PastConsultCardProps extends NavigationScreenProps {
  data: (GetCaseSheet_getCaseSheet_pastAppointments | null)[] | null;
  patientDetails: GetCaseSheet_getCaseSheet_patientDetails | undefined;
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
        <View style={styles.timeSlotTypeView} />
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
      <View style={styles.mainView}>
        {props.data &&
          props.data.length > 0 &&
          props.data.map(
            (i, index, array) =>
              i && (
                <View style={styles.dataView}>
                  {renderLeftTimeLineView(
                    i.appointmentDateTime,
                    index !== 0,
                    index !== array.length - 1
                  )}
                  <TouchableOpacity
                    style={styles.leftTimeLintTouch}
                    onPress={() =>
                      props.navigation.navigate(AppRoutes.CaseSheetDetails, {
                        consultDetails: i,
                        patientDetails: props.patientDetails,
                      })
                    }
                  >
                    <Text style={styles.TouchableText}>
                      {moment(i.appointmentDateTime).format('D MMMM, HH:MM A')}
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={{ marginRight: 24 }}>
                        {i.appointmentType === APPOINTMENT_TYPE.ONLINE ? <Audio /> : <Video />}
                      </View>
                      <ArrowRight />
                    </View>
                  </TouchableOpacity>
                </View>
              )
          )}
      </View>
    </ScrollView>
  );
};
