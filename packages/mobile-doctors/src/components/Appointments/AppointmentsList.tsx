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
import React, { useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { View } from 'react-native';
import {
  NavigationParams,
  NavigationRoute,
  NavigationScreenProp,
  NavigationScreenProps,
  ScrollView,
} from 'react-navigation';
import {
  SUBMIT_JD_CASESHEET,
  CREATE_CASESHEET_FOR_SRD,
} from '@aph/mobile-doctors/src/graphql/profiles';
import AsyncStorage from '@react-native-community/async-storage';
import {
  SubmitJdCasesheetVariables,
  SubmitJdCasesheet,
} from '@aph/mobile-doctors/src/graphql/types/SubmitJdCasesheet';
import {
  postWebEngageEvent,
  WebEngageEventName,
  WebEngageType,
  WebEngageEvents,
} from '@aph/mobile-doctors/src/helpers/WebEngageHelper';

const styles = AppointmentsListStyles;

let upcomingNextRendered: boolean = false;

export interface AppointmentsListProps extends NavigationScreenProps {
  appointmentsHistory: (GetDoctorAppointments_getDoctorAppointments_appointmentsHistory | null)[];
  newPatientsList: (string | null)[];
  navigation: NavigationScreenProp<NavigationRoute<NavigationParams>, NavigationParams>;
  openAppointment?: string;
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
    apointmentData: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory,
    prevCaseSheet?: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet | null
  ) => {
    return [
      {
        text: 'NO, WAIT',
        onPress: () => {
          postWebEngageEvent(WebEngageEventName.DOCTOR_APPOINTMENT_FORCE_START_DECLINE, {
            'Appointment Date time': g(apointmentData, 'appointmentDateTime') || '',
            'Appointment ID': g(apointmentData, 'id') || '',
          } as WebEngageEvents[WebEngageEventName.DOCTOR_APPOINTMENT_FORCE_START_DECLINE]);
          AsyncStorage.setItem('AppointmentSelect', 'false');
          hideAphAlert!();
        },
        type: 'white-button',
      },
      {
        text: 'YES, START CONSULT',
        onPress: () => {
          postWebEngageEvent(WebEngageEventName.DOCTOR_APPOINTMENT_FORCE_START_ACCEPT, {
            'Doctor name': g(apointmentData, 'doctorInfo', 'fullName') || '',
            'Patient name': `${g(apointmentData, 'patientInfo', 'firstName')} ${g(
              apointmentData,
              'patientInfo',
              'lastName'
            )}`,
            'Patient mobile number': g(apointmentData, 'patientInfo', 'mobileNumber') || '',
            'Doctor Mobile number': g(apointmentData, 'doctorInfo', 'mobileNumber') || '',
            'Appointment Date time': g(apointmentData, 'appointmentDateTime') || '',
            'Appointment display ID': g(apointmentData, 'displayId') || '',
            'Appointment ID': g(apointmentData, 'id') || '',
          } as WebEngageEvents[WebEngageEventName.DOCTOR_APPOINTMENT_FORCE_START_ACCEPT]);
          setLoading && setLoading(true);
          client
            .mutate<SubmitJdCasesheet, SubmitJdCasesheetVariables>({
              mutation: SUBMIT_JD_CASESHEET,
              variables: { appointmentId: appId },
            })
            .then((data) => {
              hideAphAlert!();
              if (g(data, 'data', 'submitJDCaseSheet')) {
                setLoading && setLoading(true);
                AsyncStorage.setItem('AppointmentSelect', 'true');
                navigateToConsultRoom(doctorId, patientId, appId, apointmentData, prevCaseSheet);
              } else {
                AsyncStorage.setItem('AppointmentSelect', 'false');
                showAphAlert &&
                  showAphAlert({
                    title: `Hi ${
                      doctorDetails ? doctorDetails.displayName || 'Doctor' : 'Doctor'
                    } :)`,
                    description:
                      'The Junior Doctor consultation is currently in progress for this appointment. You will be able to start this consult shortly..',
                  });
              }
            })
            .catch(() => {
              hideAphAlert!();
              AsyncStorage.setItem('AppointmentSelect', 'false');
              setLoading && setLoading(false);
              showAphAlert &&
                showAphAlert({
                  title: 'Alert!',
                  description: 'Error occured in case-sheet creation try again',
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
    apointmentData: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory,
    prevCaseSheet?: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet | null,
    caseSheetEdit?: boolean
  ) => {
    setTimeout(() => {
      AsyncStorage.getItem('AppointmentSelect').then((data) => {
        if (JSON.parse(data || 'false')) {
          callPermissions(() => {
            AsyncStorage.setItem('AppointmentSelect', 'false');
            setLoading && setLoading(false);
            props.navigation.push(AppRoutes.ConsultRoomScreen, {
              DoctorId: doctorId,
              PatientId: patientId,
              PatientConsultTime: null,
              AppId: appId,
              Appintmentdatetime: apointmentData.appointmentDateTime,
              AppointmentStatus: apointmentData.status,
              AppoinementData: apointmentData,
              prevCaseSheet: prevCaseSheet,
              caseSheetEnableEdit: caseSheetEdit,
            });
          });
        }
      });
    }, 500);
  };
  const showNotfoundAlert = () => {
    showAphAlert &&
      showAphAlert({ title: 'Alert!', description: 'Not able to find appointment. Try again' });
  };

  useEffect(() => {
    const callBack = async () => {
      const requestStatus = JSON.parse((await AsyncStorage.getItem('requestCompleted')) || 'false');
      if (!requestStatus) {
        if (props.openAppointment && props.appointmentsHistory.length > 0) {
          const appointmentsHistory = props.appointmentsHistory.find(
            (i) => i && i.id === props.openAppointment
          );
          if (appointmentsHistory) {
            onAppointmentSelect(appointmentsHistory);
          } else {
            showNotfoundAlert();
          }
          AsyncStorage.setItem('requestCompleted', 'true');
        } else if (props.openAppointment) {
          showNotfoundAlert();
          AsyncStorage.setItem('requestCompleted', 'true');
        }
      } else {
        props.navigation.setParams({ openAppointment: '' });
      }
    };
    callBack();
  }, [props.openAppointment]);

  const onAppointmentSelect = (
    appointmentsHistory: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory
  ) => {
    AsyncStorage.setItem('AppointmentSelect', 'true');
    setLoading && setLoading(true);
    const appId = appointmentsHistory.id;
    const doctorId = appointmentsHistory.doctorId;
    const patientId = appointmentsHistory.patientId;
    const caseSheet =
      appointmentsHistory.caseSheet &&
      appointmentsHistory.caseSheet
        .filter(
          (j: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet | null) =>
            j && j.doctorType !== DoctorType.JUNIOR
        )
        .sort((a, b) => (b ? b.version || 1 : 1) - (a ? a.version || 1 : 1));
    const prevCaseSheet =
      caseSheet && caseSheet.length > 1
        ? g(caseSheet && caseSheet[0], 'sentToPatient')
          ? caseSheet[0]
          : caseSheet[1]
        : null;
    const jrCaseSheet =
      appointmentsHistory.caseSheet &&
      appointmentsHistory.caseSheet.find(
        (j: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet | null) =>
          j && j.doctorType === DoctorType.JUNIOR
      );
    if (
      appointmentsHistory.status !== STATUS.COMPLETED &&
      !appointmentsHistory.isJdQuestionsComplete
    ) {
      setLoading && setLoading(false);
      showAphAlert &&
        showAphAlert({
          title: `Hi ${doctorDetails ? doctorDetails.displayName || 'Doctor' : 'Doctor'} :)`,
          description:
            'Patient Details and Junior Doctor Case Sheet is not yet completed for this Appointment, Do you still want to proceed to Start consultation ?',
          CTAs: alertCTAS(doctorId, patientId, appId, appointmentsHistory, prevCaseSheet),
        });
    } else if (
      appointmentsHistory.status !== STATUS.COMPLETED &&
      ((jrCaseSheet && !jrCaseSheet.isJdConsultStarted) || !jrCaseSheet) &&
      appointmentsHistory.isJdQuestionsComplete
    ) {
      setLoading && setLoading(false);
      showAphAlert &&
        showAphAlert({
          title: `Hi ${doctorDetails ? doctorDetails.displayName || 'Doctor' : 'Doctor'} :)`,
          description:
            'Junior Doctor consultation is not yet initiated for this Appointment, Do you still want to proceed to Start consultation ?',
          CTAs: alertCTAS(doctorId, patientId, appId, appointmentsHistory, prevCaseSheet),
        });
    } else if (
      appointmentsHistory.status !== STATUS.COMPLETED &&
      ((jrCaseSheet && jrCaseSheet.isJdConsultStarted && jrCaseSheet.status !== 'COMPLETED') ||
        !jrCaseSheet)
    ) {
      setLoading && setLoading(false);
      AsyncStorage.setItem('AppointmentSelect', 'false');
      showAphAlert &&
        showAphAlert({
          title: `Hi ${doctorDetails ? doctorDetails.displayName || 'Doctor' : 'Doctor'} :)`,
          description:
            'The Junior Doctor consultation is currently in progress for this appointment. You will be able to start this consult shortly..',
        });
    } else {
      setLoading && setLoading(true);
      if (
        appointmentsHistory.status === STATUS.COMPLETED &&
        g(caseSheet && caseSheet[0], 'sentToPatient')
      ) {
        const blobName = g(caseSheet && caseSheet[0], 'blobName');
        setLoading && setLoading(false);
        const caseSheetId = g(caseSheet && caseSheet[0], 'id');
        AsyncStorage.setItem('AppointmentSelect', 'false');
        props.navigation.push(AppRoutes.RenderPdf, {
          uri: `${AppConfig.Configuration.DOCUMENT_BASE_URL}${blobName}`,
          title: 'PRESCRIPTION',
          pdfTitle: `${appointmentsHistory.displayId}_${
            appointmentsHistory.patientInfo
              ? appointmentsHistory.patientInfo.firstName || 'Patient'
              : 'Patient'
          }.pdf`,
          menuCTAs: [
            {
              title: 'RESEND PRESCRIPTION',
              onPress: () => {
                if (caseSheetId) {
                  postWebEngageEvent(WebEngageEventName.DOCTOR_RESEND_PRESCRIPTION, {
                    'Doctor name': g(appointmentsHistory, 'doctorInfo', 'fullName') || '',
                    'Patient name': `${g(appointmentsHistory, 'patientInfo', 'firstName')} ${g(
                      appointmentsHistory,
                      'patientInfo',
                      'lastName'
                    )}`,
                    'Patient mobile number':
                      g(appointmentsHistory, 'patientInfo', 'mobileNumber') || '',
                    'Doctor Mobile number':
                      g(appointmentsHistory, 'doctorInfo', 'mobileNumber') || '',
                    'Appointment Date time': g(appointmentsHistory, 'appointmentDateTime') || '',
                    'Appointment display ID': g(appointmentsHistory, 'displayId') || '',
                    'Appointment ID': g(appointmentsHistory, 'id') || '',
                    'Blob URL': `${AppConfig.Configuration.DOCUMENT_BASE_URL}${blobName}`,
                  } as WebEngageEvents[WebEngageEventName.DOCTOR_SEND_PRESCRIPTION]);
                  setLoading && setLoading(true);
                  const config: Pubnub.PubnubConfig = {
                    origin: 'apollo.pubnubapi.com',
                    subscribeKey: AppConfig.Configuration.PRO_PUBNUB_SUBSCRIBER,
                    publishKey: AppConfig.Configuration.PRO_PUBNUB_PUBLISH,
                    ssl: true,
                  };

                  const pubnub = new Pubnub(config);

                  const followupObj = {
                    appointmentId: appId,
                    folloupDateTime: g(caseSheet && caseSheet[0], 'followUp')
                      ? moment()
                          .add(Number(g(caseSheet && caseSheet[0], 'followUpAfterInDays')), 'd')
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
                          description: 'Prescription has been sent to patient successfully',
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
                setLoading && setLoading(true);
                client
                  .mutate({
                    mutation: CREATE_CASESHEET_FOR_SRD,
                    variables: {
                      appointmentId: appointmentsHistory.id,
                    },
                  })
                  .then((data) => {
                    setLoading && setLoading(true);
                    AsyncStorage.setItem('AppointmentSelect', 'true');
                    navigateToConsultRoom(
                      doctorId,
                      patientId,
                      appId,
                      appointmentsHistory,
                      prevCaseSheet,
                      true
                    );
                  })
                  .catch(() => {
                    setLoading && setLoading(false);
                    showAphAlert &&
                      showAphAlert({
                        title: 'Alert!',
                        description: 'Error occured while creating Case Sheet. Please try again',
                      });
                  });
              },
            },
            {
              title: 'Download Prescription',
              pdfDownload: true,
            },
          ],
          CTAs: [
            {
              title: 'VIEW CASESHEET',
              variant: 'white',
              onPress: () => {
                setLoading && setLoading(true);
                AsyncStorage.setItem('AppointmentSelect', 'true');
                navigateToConsultRoom(
                  doctorId,
                  patientId,
                  appId,
                  appointmentsHistory,
                  prevCaseSheet
                );
              },
            },
          ],
        });
      } else {
        navigateToConsultRoom(doctorId, patientId, appId, appointmentsHistory, prevCaseSheet);
      }
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
            i.caseSheet
              .filter(
                (
                  j: GetDoctorAppointments_getDoctorAppointments_appointmentsHistory_caseSheet | null
                ) => j && j.doctorType === DoctorType.JUNIOR
              )
              .sort((a, b) => (b ? b.version || 1 : 1) - (a ? a.version || 1 : 1));

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
                    postWebEngageEvent(WebEngageEventName.DOCTOR_APPOINTMENT_CLICKED, {
                      'Doctor name': g(i, 'doctorInfo', 'fullName') || '',
                      'Patient name': `${g(i, 'patientInfo', 'firstName')} ${g(
                        i,
                        'patientInfo',
                        'lastName'
                      )}`,
                      'Patient mobile number': g(i, 'patientInfo', 'mobileNumber') || '',
                      'Doctor Mobile number': g(i, 'doctorInfo', 'mobileNumber') || '',
                      'Appointment Date time': g(i, 'appointmentDateTime') || '',
                      'Appointment display ID': g(i, 'displayId') || '',
                      'Appointment ID': g(i, 'id') || '',
                    } as WebEngageEvents[WebEngageEventName.DOCTOR_APPOINTMENT_CLICKED]);
                    onAppointmentSelect(i);
                  }}
                  appointmentStatus={i.appointmentState || ''}
                  doctorname={i.patientInfo!.firstName || ''}
                  timing={formatTiming(i.appointmentDateTime, consultDuration || undefined)}
                  symptoms={
                    (caseSheet && g(caseSheet[0], 'symptoms')) ||
                    (jrCaseSheet && g(jrCaseSheet[0], 'symptoms')) ||
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
