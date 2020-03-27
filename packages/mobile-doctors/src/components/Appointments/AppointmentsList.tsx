import AppointmentsListStyles from '@aph/mobile-doctors/src/components/Appointments/AppointmentsList.styles';
import { CalendarCard } from '@aph/mobile-doctors/src/components/Appointments/CalendarCard';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import {
  NextAppointmentIcon,
  PastAppointmentIcon,
  UpComingIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { UPDATE_PATIENT_PRESCRIPTIONSENTSTATUS } from '@aph/mobile-doctors/src/graphql/profiles';
import { GetDoctorAppointments_getDoctorAppointments_appointmentsHistory } from '@aph/mobile-doctors/src/graphql/types/GetDoctorAppointments';
import {
  APPOINTMENT_TYPE,
  DoctorType,
  STATUS,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  UpdatePatientPrescriptionSentStatus,
  UpdatePatientPrescriptionSentStatusVariables,
} from '@aph/mobile-doctors/src/graphql/types/UpdatePatientPrescriptionSentStatus';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import { Appointments } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { callPermissions, g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import moment from 'moment';
import React from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { View } from 'react-native';
import {
  NavigationParams,
  NavigationRoute,
  NavigationScreenProp,
  NavigationScreenProps,
  ScrollView,
} from 'react-navigation';

const styles = AppointmentsListStyles;

let upcomingNextRendered: boolean = false;

export interface AppointmentsListProps extends NavigationScreenProps {
  appointmentsHistory: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory | null)[];
  newPatientsList: (string | null)[];
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = (props) => {
  const client = useApolloClient();
  const isNewPatient = (id: string) => {
    return props.newPatientsList.indexOf(id) > -1;
  };
  const { doctorDetails } = useAuth();
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();

  const getStatusCircle = (status: string, showNext: boolean) => {
    return showNext ? (
      <UpComingIcon />
    ) : status == 'COMPLETED' ? (
      <PastAppointmentIcon />
    ) : (
      <NextAppointmentIcon />
    );
  };

  const renderLeftTimeLineView = (
    status: string,
    showTop: boolean,
    showBottom: boolean,
    showNext: boolean
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
        {getStatusCircle(status, showNext)}
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
      return 'next';
    }
  };

  const formatTiming = (appointmentDateTime: string, consultDuration?: number) => {
    const aptmtDate = moment
      .utc(appointmentDateTime)
      .local()
      .format('YYYY-MM-DD HH:mm:ss');
    const slotStartTime = moment(aptmtDate).format('h:mm') || '';
    const slotEndTime =
      moment(aptmtDate)
        .add(consultDuration, 'minutes')
        .format('h:mm A') || '';
    return `${slotStartTime} ${consultDuration ? `- ${slotEndTime}` : ``}`;
  };

  const showUpNext = (aptTime: string, index: number, status: STATUS) => {
    if (index === 0) upcomingNextRendered = false;
    if (
      new Date(aptTime) > new Date() &&
      !upcomingNextRendered &&
      moment(new Date(aptTime)).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD') &&
      status !== STATUS.COMPLETED
    ) {
      upcomingNextRendered = true;
      return true;
    } else {
      return false;
    }
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
          const filterData =
            doctorDetails &&
            doctorDetails.consultHours!.filter((item) => {
              if (item) {
                return (
                  item.weekDay ===
                  moment
                    .utc(i.appointmentDateTime)
                    .local()
                    .format('dddd')
                    .toUpperCase()
                );
              }
            })[0];

          const consultDuration = filterData ? filterData.consultDuration : 0;
          const showNext = showUpNext(i.appointmentDateTime, index, i.status);
          const caseSheet =
            i.caseSheet && i.caseSheet.find((i) => i && i.doctorType !== DoctorType.JUNIOR);
          return (
            <>
              {index == 0 && <View style={{ height: 20 }} />}
              <View style={styles.dataview}>
                {renderLeftTimeLineView(
                  i.status,
                  index !== 0,
                  index !== array.length - 1,
                  showNext
                )}
                <CalendarCard
                  photoUrl={i.patientInfo ? i.patientInfo.photoUrl || '' : ''}
                  isNewPatient={isNewPatient(i.patientInfo!.id)}
                  onPress={(doctorId, patientId, PatientInfo, appointmentTime, appId) => {
                    console.log('appppp', appId, i);
                    // console.log( || null);

                    if (
                      i.caseSheet &&
                      i.caseSheet.length > 0 &&
                      i.caseSheet.findIndex(
                        (i) => i && i.doctorType === DoctorType.JUNIOR && i.status === 'COMPLETED'
                      ) > -1
                    ) {
                      setLoading && setLoading(true);
                      if (
                        i.status === STATUS.COMPLETED &&
                        i.caseSheet
                          .map((i) => ((i && i.sentToPatient) || '').toString())
                          .includes('true')
                      ) {
                        const blobName = i.caseSheet
                          .map((i) => i && i.blobName)
                          .filter((i) => i !== null)[0];
                        setLoading && setLoading(false);
                        console.log(i, 'i.caseSheet');

                        const caseSheetId = caseSheet && caseSheet.id;

                        props.navigation.push(AppRoutes.RenderPdf, {
                          uri: `${AppConfig.Configuration.DOCUMENT_BASE_URL}${blobName}`,
                          title: 'PRESCRIPTION',
                          CTAs: [
                            {
                              title: 'RESEND PRESCRIPTION', //'PRESCRIPTION SENT',
                              variant: 'white',
                              onPress: () => {
                                if (caseSheetId) {
                                  setLoading && setLoading(true);
                                  client
                                    .mutate<
                                      UpdatePatientPrescriptionSentStatus,
                                      UpdatePatientPrescriptionSentStatusVariables
                                    >({
                                      mutation: UPDATE_PATIENT_PRESCRIPTIONSENTSTATUS,
                                      variables: {
                                        caseSheetId: caseSheetId,
                                        sentToPatient: true,
                                      },
                                    })
                                    .then((_data) => {
                                      setLoading && setLoading(false);
                                      if (
                                        g(
                                          _data,
                                          'data',
                                          'updatePatientPrescriptionSentStatus',
                                          'success'
                                        )
                                      ) {
                                        showAphAlert &&
                                          showAphAlert({
                                            title: 'Hi',
                                            description:
                                              'Prescription has been sent to patient successfully',
                                            onPressOk: () => {
                                              props.navigation.popToTop();
                                              hideAphAlert && hideAphAlert();
                                            },
                                            unDismissable: true,
                                          });
                                      }
                                    })
                                    .catch((e) => {
                                      setLoading && setLoading(false);
                                      showAphAlert &&
                                        showAphAlert({
                                          title: strings.common.uh_oh,
                                          description: strings.common.oops_msg,
                                        });
                                    });
                                }
                              },
                            },
                          ],
                        });
                      } else {
                        setLoading && setLoading(false);
                        callPermissions(() => {
                          props.navigation.push(AppRoutes.ConsultRoomScreen, {
                            DoctorId: doctorId,
                            PatientId: patientId,
                            PatientConsultTime: null,
                            PatientInfoAll: PatientInfo,
                            AppId: appId,
                            Appintmentdatetime: i.appointmentDateTime,
                            AppointmentStatus: i.status,
                            AppoinementData: i,
                          });
                        });
                      }
                    } else {
                      showAphAlert &&
                        showAphAlert({
                          title: 'Alert!',
                          description:
                            'You can start this consultation only after Junior Doctor has filled the case sheet.',
                        });
                    }
                  }}
                  appointmentStatus={i.appointmentState || ''}
                  doctorname={i.patientInfo!.firstName || ''}
                  timing={formatTiming(i.appointmentDateTime, consultDuration || undefined)}
                  symptoms={
                    (i.caseSheet &&
                      g(
                        i.caseSheet.find((i) => i && i.doctorType === DoctorType.JUNIOR),
                        'symptoms'
                      )) ||
                    []
                  }
                  doctorId={i.doctorId}
                  patientId={i.patientId}
                  status={getStatus(i)}
                  wayOfContact={i.appointmentType == APPOINTMENT_TYPE.ONLINE ? 'video' : 'clinic'}
                  PatientInfo={i.patientInfo!}
                  consultTime={i.appointmentDateTime}
                  appId={i.id}
                  appintmentdatetime={i.appointmentDateTime}
                  showNext={showNext}
                />
              </View>
            </>
          );
        })}
      </View>
    </ScrollView>
  );
};
