import AppointmentsListStyles from '@aph/mobile-doctors/src/components/Appointments/AppointmentsList.styles';
import { CalendarCard } from '@aph/mobile-doctors/src/components/Appointments/CalendarCard';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import {
  NextAppointmentIcon,
  PastAppointmentIcon,
  UpComingIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import {
  useUIElements,
  AphAlertCTAs,
} from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import {
  GetDoctorAppointments_getDoctorAppointments_appointmentsHistory,
  GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorAppointments';
import {
  APPOINTMENT_TYPE,
  DoctorType,
  REQUEST_ROLES,
  STATUS,
} from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import { AppConfig } from '@aph/mobile-doctors/src/helpers/AppConfig';
import { Appointments } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { callPermissions, g, messageCodes } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import moment from 'moment';
import Pubnub from 'pubnub';
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
import { SUBMIT_JD_CASESHEET } from '@aph/mobile-doctors/src/graphql/profiles';

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
    return false; //props.newPatientsList.indexOf(id) > -1;
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

  const alertCTAS = (
    doctorId: string,
    patientId: string,
    appId: string,
    apointmentData: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory
  ) => {
    return [
      {
        text: 'NO, WAIT',
        onPress: () => hideAphAlert!(),
        type: 'white-button',
      },
      {
        text: 'YES, START CONSULT',
        onPress: () => {
          setLoading && setLoading(true);
          client
            .mutate({ mutation: SUBMIT_JD_CASESHEET, variables: { appointmentId: appId } })
            .then(() => {
              hideAphAlert!();
              setLoading && setLoading(false);
              navigateToConsultRoom(doctorId, patientId, appId, apointmentData);
            })
            .catch(() => {
              hideAphAlert!();
              setLoading && setLoading(false);
              showAphAlert &&
                showAphAlert({
                  title: 'Alert!',
                  description: 'Error occured in case-sheet creation tyr again',
                });
            });
        },
      },
    ] as AphAlertCTAs[];
  };

  const navigateToConsultRoom = (
    doctorId: string,
    patientId: string,
    appId: string,
    apointmentData: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory
  ) => {
    callPermissions(() => {
      props.navigation.push(AppRoutes.ConsultRoomScreen, {
        DoctorId: doctorId,
        PatientId: patientId,
        PatientConsultTime: null,
        AppId: appId,
        Appintmentdatetime: apointmentData.appointmentDateTime,
        AppointmentStatus: apointmentData.status,
        AppoinementData: apointmentData,
      });
    });
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
            i.caseSheet &&
            i.caseSheet
              .filter(
                (
                  j: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet | null
                ) => j && j.doctorType !== DoctorType.JUNIOR
              )
              .sort((a, b) => (b ? b.version || 1 : 1) - (a ? a.version || 1 : 1));
          const jrCaseSheet =
            i.caseSheet &&
            i.caseSheet.find(
              (
                j: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet | null
              ) => j && j.doctorType === DoctorType.JUNIOR
            );

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
                    if (!i.isJdQuestionsComplete) {
                      showAphAlert &&
                        showAphAlert({
                          title: `Hi ${
                            doctorDetails ? doctorDetails.displayName || 'Doctor' : 'Doctor'
                          } :)`,
                          description:
                            'Patient Details and Junior Doctor Case Sheet is not yet completed for this Appointment, Do you still want to proceed to Start consultation ?',
                          CTAs: alertCTAS(doctorId, patientId, appId, i),
                        });
                    } else if (
                      ((jrCaseSheet && !jrCaseSheet.isJdConsultStarted) || !jrCaseSheet) &&
                      i.isJdQuestionsComplete
                    ) {
                      showAphAlert &&
                        showAphAlert({
                          title: `Hi ${
                            doctorDetails ? doctorDetails.displayName || 'Doctor' : 'Doctor'
                          } :)`,
                          description:
                            'Junior Doctor consultation is not yet initiated for this Appointment, Do you still want to proceed to Start consultation ?',
                          CTAs: alertCTAS(doctorId, patientId, appId, i),
                        });
                    } else if (
                      (jrCaseSheet &&
                        jrCaseSheet.isJdConsultStarted &&
                        jrCaseSheet.status !== 'COMPLETED') ||
                      !jrCaseSheet
                    ) {
                      showAphAlert &&
                        showAphAlert({
                          title: `Hi ${
                            doctorDetails ? doctorDetails.displayName || 'Doctor' : 'Doctor'
                          } :)`,
                          description:
                            'The Junior Doctor consultation is currently in progress for this appointment. You will be able to start this consult shortly..',
                        });
                    } else {
                      setLoading && setLoading(true);
                      if (
                        i.status === STATUS.COMPLETED &&
                        g(caseSheet && caseSheet[0], 'sentToPatient')
                      ) {
                        const blobName = g(caseSheet && caseSheet[0], 'blobName');
                        setLoading && setLoading(false);
                        const caseSheetId = g(caseSheet && caseSheet[0], 'id');

                        props.navigation.push(AppRoutes.RenderPdf, {
                          uri: `${AppConfig.Configuration.DOCUMENT_BASE_URL}${blobName}`,
                          title: 'PRESCRIPTION',
                          menuCTAs: [
                            {
                              title: 'RESEND PRESCRIPTION',
                              onPress: () => {
                                if (caseSheetId) {
                                  setLoading && setLoading(true);
                                  const config: Pubnub.PubnubConfig = {
                                    subscribeKey: AppConfig.Configuration.PRO_PUBNUB_SUBSCRIBER,
                                    publishKey: AppConfig.Configuration.PRO_PUBNUB_PUBLISH,
                                    ssl: true,
                                  };

                                  const pubnub = new Pubnub(config);

                                  const followupObj = {
                                    appointmentId: appId,
                                    folloupDateTime: g(caseSheet && caseSheet[0], 'followUp')
                                      ? moment()
                                          .add(
                                            Number(
                                              g(caseSheet && caseSheet[0], 'followUpAfterInDays')
                                            ),
                                            'd'
                                          )
                                          .format('YYYY-MM-DD')
                                      : '',
                                    doctorId: g(caseSheet && caseSheet[0], 'doctorId'),
                                    caseSheetId: caseSheetId,
                                    doctorInfo: doctorDetails,
                                    pdfUrl: `${AppConfig.Configuration.DOCUMENT_BASE_URL}${blobName}`,
                                    isResend: true,
                                  };

                                  pubnub.publish(
                                    {
                                      channel: appId,
                                      storeInHistory: true,
                                      message: {
                                        id: followupObj.doctorId || '',
                                        message: messageCodes.followupconsult,
                                        transferInfo: followupObj,
                                        messageDate: new Date(),
                                        sentBy: REQUEST_ROLES.DOCTOR,
                                      },
                                    },
                                    (status, response) => {
                                      pubnub.stop();
                                      setLoading && setLoading(false);
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
                                  );
                                }
                              },
                            },
                            {
                              title: 'Issue New Prescription',
                              onPress: () => {
                                //createSeniorDoctorCaseSheet
                              },
                            },
                          ],
                          CTAs: [
                            {
                              title: 'VIEW CASESHEET',
                              variant: 'white',
                              onPress: () => {
                                navigateToConsultRoom(doctorId, patientId, appId, i);
                              },
                            },
                          ],
                        });
                      } else {
                        setLoading && setLoading(false);
                        navigateToConsultRoom(doctorId, patientId, appId, i);
                      }
                    }
                  }}
                  appointmentStatus={i.appointmentState || ''}
                  doctorname={i.patientInfo!.firstName || ''}
                  timing={formatTiming(i.appointmentDateTime, consultDuration || undefined)}
                  symptoms={
                    i.caseSheet
                      ? i.caseSheet.length > 0 &&
                        i.caseSheet[0] !== null &&
                        i.caseSheet[0].symptoms !== null
                        ? i.caseSheet[0].symptoms || []
                        : i.caseSheet.length > 1 &&
                          i.caseSheet[1] !== null &&
                          i.caseSheet[1]!.symptoms !== null
                        ? i.caseSheet[1].symptoms || []
                        : []
                      : []
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
