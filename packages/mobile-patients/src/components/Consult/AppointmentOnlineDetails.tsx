import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import { ReschedulePopUp } from '@aph/mobile-patients/src/components/Consult/ReschedulePopUp';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { DoctorPlaceholderImage, More } from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  BOOK_APPOINTMENT_RESCHEDULE,
  CANCEL_APPOINTMENT,
  CHECK_IF_RESCHDULE,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  bookRescheduleAppointment,
  bookRescheduleAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/bookRescheduleAppointment';
import {
  cancelAppointment,
  cancelAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/cancelAppointment';
import {
  checkIfReschedule,
  checkIfRescheduleVariables,
} from '@aph/mobile-patients/src/graphql/types/checkIfReschedule';
import {
  APPOINTMENT_STATE,
  APPOINTMENT_TYPE,
  REQUEST_ROLES,
  STATUS,
  TRANSFER_INITIATED_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  getNextAvailableSlots,
  getRescheduleAppointmentDetails,
  getSecretaryDetailsByDoctor,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  dataSavedUserID,
  g,
  getNetStatus,
  postWebEngageEvent,
  statusBarHeight,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { getPatientAllAppointments_getPatientAllAppointments_appointments } from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  imageView: {
    width: 80,
    marginLeft: 20,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 2,
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  timeStyle: {
    paddingBottom: 20,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SKY_BLUE,
  },
  labelStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 3.5,
  },
  descriptionStyle: {
    paddingTop: 7.5,
    paddingBottom: 16,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SKY_BLUE,
  },
  labelViewStyle: {
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gotItStyles: {
    height: 60,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  displayId: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
    paddingBottom: 4,
  },
  doctorImage: {
    width: 80,
    height: 80,
  },
  reschduleButtonStyle: {
    flex: 0.4,
    marginLeft: 20,
    marginRight: 8,
    backgroundColor: 'white',
  },
  reschduleWaitButtonStyle: {
    marginLeft: width / 2 - 60,
    backgroundColor: 'white',
    width: 120,
  },
  mainView: {
    backgroundColor: theme.colors.CARD_BG,
    paddingTop: 20,
    paddingHorizontal: 20,
    ...theme.viewStyles.shadowStyle,
  },
  startConsultText: { flex: 0.6, marginRight: 20, marginLeft: 8 },
  viewStyles: {
    ...theme.viewStyles.container,
  },
  indexValue: {
    flex: 1,
    zIndex: -1,
  },
  amountPaidStyles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelViewStyles: {
    backgroundColor: 'white',
    width: 100,
    height: 45,
    marginLeft: width - 120,
    marginTop: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.viewStyles.shadowStyle,
  },
  cancelText: {
    backgroundColor: 'white',
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(16),
    textAlign: 'center',
  },
  cancelMainView: { margin: 0, height: height, width: width, backgroundColor: 'transparent' },
});

type rescheduleType = {
  rescheduleCount: number;
  appointmentState: string;
  isCancel: number;
  isFollowUp: number;
  isPaid: number;
};

export interface AppointmentOnlineDetailsProps extends NavigationScreenProps {}

export const AppointmentOnlineDetails: React.FC<AppointmentOnlineDetailsProps> = (props) => {
  const data: getPatientAllAppointments_getPatientAllAppointments_appointments = props.navigation
    .state.params!.data;
  const doctorDetails = data.doctorInfo!;
  const movedFrom = props.navigation.state.params!.from;
  console.log('******DATA*********', { data, doctorDetails });

  const fifteenMinutesLater = new Date();
  const dateIsAfter = moment(data.appointmentDateTime).isAfter(
    moment(fifteenMinutesLater.setMinutes(fifteenMinutesLater.getMinutes() + 15))
  );
  const [cancelAppointment, setCancelAppointment] = useState<boolean>(false);
  const [showCancelPopup, setShowCancelPopup] = useState<boolean>(false);
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [resheduleoverlay, setResheduleoverlay] = useState<boolean>(false);
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [rescheduleApICalled, setRescheduleApICalled] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [belowThree, setBelowThree] = useState<boolean>(false);
  const [newRescheduleCount, setNewRescheduleCount] = useState<any>();
  const [nextSlotAvailable, setNextSlotAvailable] = useState<string>('');
  const [bottompopup, setBottompopup] = useState<boolean>(false);
  const [networkStatus, setNetworkStatus] = useState<boolean>(false);
  const [secretaryData, setSecretaryData] = useState<any>([]);

  const minutes = moment.duration(moment(data.appointmentDateTime).diff(new Date())).asMinutes();
  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const { showAphAlert, hideAphAlert } = useUIElements();

  useEffect(() => {
    getSecretaryData();
    if (!currentPatient) {
      getPatientApiCall();
    }

    if (movedFrom === 'notification') {
      NextAvailableSlotAPI(g(data, 'appointmentState') == APPOINTMENT_STATE.AWAITING_RESCHEDULE);
    }

    if (movedFrom === 'cancel') {
      setShowCancelPopup(true);
    }
  }, [currentPatient]);

  const client = useApolloClient();

  useEffect(() => {
    const dateValidate = moment(moment().format('YYYY-MM-DD')).diff(
      moment(data.appointmentDateTime).format('YYYY-MM-DD')
    );
    if (dateValidate == 0) {
      const time = `Today, ${moment
        .utc(data.appointmentDateTime)
        .local()
        .format('hh:mm A')}`;
      setAppointmentTime(time);
    } else {
      const time = `${moment
        .utc(data.appointmentDateTime)
        .local()
        .format('DD MMM h:mm A')}`;
      setAppointmentTime(time);
    }
  }, []);

  const getSecretaryData = () => {
    getSecretaryDetailsByDoctor(client, doctorDetails.id)
      .then((apiResponse: any) => {
        console.log('apiResponse', apiResponse);
        const secretaryDetails = g(apiResponse, 'data', 'data', 'getSecretaryDetailsByDoctorId');
        setSecretaryData(secretaryDetails);
        console.log('apiResponse');
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  const NextAvailableSlotAPI = (isAwaitingReschedule?: boolean) => {
    getNetStatus()
      .then((status) => {
        if (status) {
          if (isAwaitingReschedule) {
            getAppointmentNextSlotInitiatedByDoctor();
          } else {
            fetchNextDoctorAvailableData();
          }
        } else {
          setNetworkStatus(true);
          setshowSpinner(false);
        }
      })
      .catch((e) => {
        CommonBugFender('AppointmentOnlineDetails_getNetStatus', e);
      });
  };

  const todayDate = moment
    .utc(data.appointmentDateTime)
    .local()
    .format('YYYY-MM-DD');

  const fetchNextDoctorAvailableData = () => {
    setshowSpinner(true);
    getNextAvailableSlots(client, doctorDetails ? [doctorDetails.id] : [], todayDate)
      .then(({ data }: any) => {
        setshowSpinner(false);
        try {
          data[0] && setNextSlotAvailable(data[0].availableSlot);
        } catch (error) {
          CommonBugFender('AppointmentOnlineDetails_fetchNextDoctorAvailableData_try', error);
          setNextSlotAvailable('');
        }
      })
      .catch((e) => {
        setshowSpinner(false);
        CommonBugFender('AppointmentOnlineDetails_fetchNextDoctorAvailableData', e);
      })
      .finally(() => {
        checkIfReschedule();
      });
  };

  const getAppointmentNextSlotInitiatedByDoctor = async () => {
    try {
      setshowSpinner(true);
      const response = await getRescheduleAppointmentDetails(client, data.id);
      const slot = g(response, 'data', 'getAppointmentRescheduleDetails', 'rescheduledDateTime');
      setNextSlotAvailable(slot || '');
      setshowSpinner(false);
      checkIfReschedule();
    } catch (error) {
      setNextSlotAvailable('');
      setshowSpinner(false);
      checkIfReschedule();
    }
  };

  const cancelAppointmentApi = async () => {
    setshowSpinner(true);
    const userId = await dataSavedUserID('selectedProfileId');

    const appointmentTransferInput = {
      appointmentId: data.id,
      cancelReason: '',
      cancelledBy: REQUEST_ROLES.PATIENT, //appointmentDate,
      cancelledById: userId ? userId : data.patientId,
    };

    client
      .mutate<cancelAppointment, cancelAppointmentVariables>({
        mutation: CANCEL_APPOINTMENT,
        variables: {
          cancelAppointmentInput: appointmentTransferInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then(() => {
        postAppointmentWEGEvents(WebEngageEventName.CONSULTATION_CANCELLED_BY_CUSTOMER);
        setshowSpinner(false);
        showAppointmentCancellSuccessAlert();
      })
      .catch((e: any) => {
        CommonBugFender('AppointmentOnlineDetails_cancelAppointmentApi', e);
        setshowSpinner(false);
        const message = e.message ? e.message.split(':')[1].trim() : '';
        if (
          message == 'INVALID_APPOINTMENT_ID' ||
          message == 'JUNIOR_DOCTOR_CONSULTATION_INPROGRESS'
        ) {
          showAphAlert!({
            title: `Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`,
            description: 'Ongoing / Completed appointments cannot be cancelled.',
          });
        }
      });
  };

  const showAppointmentCancellSuccessAlert = () => {
    setShowCancelPopup(false);
    const appointmentNum = g(data, 'displayId');
    const doctorName = g(data, 'doctorInfo', 'displayName');
    showAphAlert!({
      title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
      description: `As per your request, your appointment #${appointmentNum} with ${doctorName} scheduled for ${appointmentTime} has been cancelled.`,
      unDismissable: true,
      onPressOk: () => {
        hideAphAlert!();
        props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            key: null,
            actions: [NavigationActions.navigate({ routeName: AppRoutes.TabBar })],
          })
        );
      },
    });
  };

  const rescheduleAPI = (availability: any) => {
    const bookRescheduleInput = {
      appointmentId: data.id,
      doctorId: doctorDetails.id,
      newDateTimeslot: availability,
      initiatedBy:
        data.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
        (data.status == STATUS.PENDING && minutes <= -30)
          ? TRANSFER_INITIATED_TYPE.DOCTOR
          : TRANSFER_INITIATED_TYPE.PATIENT,
      initiatedId:
        data.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
        (data.status == STATUS.PENDING && minutes <= -30)
          ? doctorDetails.id
          : data.patientId,
      patientId: data.patientId,
      rescheduledId: '',
    };

    setshowSpinner(true);
    setRescheduleApICalled(true);
    client
      .mutate<bookRescheduleAppointment, bookRescheduleAppointmentVariables>({
        mutation: BOOK_APPOINTMENT_RESCHEDULE,
        variables: {
          bookRescheduleAppointmentInput: bookRescheduleInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        postAppointmentWEGEvents(WebEngageEventName.CONSULTATION_RESCHEDULED_BY_CUSTOMER);
        setshowSpinner(false);
        props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            key: null,
            actions: [
              NavigationActions.navigate({
                routeName: AppRoutes.TabBar,
                params: {
                  Data:
                    data.data &&
                    data.data.bookRescheduleAppointment &&
                    data.data.bookRescheduleAppointment.appointmentDetails,
                  DoctorName:
                    props.navigation.state.params!.data &&
                    props.navigation.state.params!.data.doctorInfo &&
                    props.navigation.state.params!.data.doctorInfo.fullName,
                },
              }),
            ],
          })
        );
      })
      .catch((e) => {
        CommonBugFender('AppointmentOnlineDetails_rescheduleAPI', e);
        setshowSpinner(false);
        setBottompopup(true);
      });
  };

  const checkIfReschedule = () => {
    try {
      setshowSpinner(true);
      client
        .query<checkIfReschedule, checkIfRescheduleVariables>({
          query: CHECK_IF_RESCHDULE,
          variables: {
            existAppointmentId: data.id,
            rescheduleDate: data.appointmentDateTime,
          },
          fetchPolicy: 'no-cache',
        })
        .then((_data: any) => {
          const result = _data.data.checkIfReschedule;
          setshowSpinner(false);

          try {
            const data: rescheduleType = {
              rescheduleCount: result.rescheduleCount + 1,
              appointmentState: result.appointmentState,
              isCancel: result.isCancel,
              isFollowUp: result.isFollowUp,
              isPaid: result.isPaid,
            };

            if (result.rescheduleCount < 3) {
              setBelowThree(true);
            } else {
              setBelowThree(false);
            }
            setNewRescheduleCount(data);
          } catch (error) {
            CommonBugFender('AppointmentOnlineDetails_CHECK_IF_RESCHDULE_try', error);
          }
        })
        .catch((e: any) => {
          CommonBugFender('AppointmentOnlineDetails_checkIfReschedule', e);
          setshowSpinner(false);
        })
        .finally(() => {
          setResheduleoverlay(true);
        });
    } catch (error) {
      CommonBugFender('AppointmentOnlineDetails_checkIfReschedule_try', error);
      setshowSpinner(false);
    }
  };

  const acceptChange = () => {
    try {
      setResheduleoverlay(false);
      AsyncStorage.setItem('showSchduledPopup', 'true');
      rescheduleAPI(nextSlotAvailable);
    } catch (error) {
      CommonBugFender('AppointmentOnlineDetails_acceptChange_try', error);
    }
  };

  const reshedulePopUpMethod = () => {
    setdisplayoverlay(true), setResheduleoverlay(false);
  };

  const postAppointmentWEGEvents = (
    type:
      | WebEngageEventName.RESCHEDULE_CLICKED
      | WebEngageEventName.CANCEL_CONSULTATION_CLICKED
      | WebEngageEventName.CONTINUE_CONSULTATION_CLICKED
      | WebEngageEventName.CONSULTATION_CANCELLED_BY_CUSTOMER
      | WebEngageEventName.CONSULTATION_RESCHEDULED_BY_CUSTOMER
    // data: getPatinetAppointments_getPatinetAppointments_patinetAppointments
  ) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.RESCHEDULE_CLICKED]
      | WebEngageEvents[WebEngageEventName.CANCEL_CONSULTATION_CLICKED]
      | WebEngageEvents[WebEngageEventName.CONTINUE_CONSULTATION_CLICKED]
      | WebEngageEvents[WebEngageEventName.CONSULTATION_CANCELLED_BY_CUSTOMER]
      | WebEngageEvents[WebEngageEventName.CONSULTATION_RESCHEDULED_BY_CUSTOMER] = {
      'Doctor Name': g(data, 'doctorInfo', 'fullName')!,
      'Speciality ID': g(data, 'doctorInfo', 'specialty', 'id')!,
      'Speciality Name': g(data, 'doctorInfo', 'specialty', 'name')!,
      'Doctor Category': g(data, 'doctorInfo', 'doctorType')!,
      'Consult Date Time': moment(g(data, 'appointmentDateTime')).toDate(),
      'Consult Mode': g(data, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
      'Hospital Name': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'name')!,
      'Hospital City': g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'city')!,
      'Consult ID': g(data, 'id')!,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
      'Secretary Name': secretaryData.name,
      'Secretary Mobile Number': secretaryData.mobileNumber,
      'Doctor Mobile Number': g(data, 'doctorInfo', 'mobileNumber')!,
    };
    postWebEngageEvent(type, eventAttributes);
  };

  if (data.doctorInfo) {
    const isAwaitingReschedule = data.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE;
    const showCancel =
      dateIsAfter || isAwaitingReschedule ? true : data.status == STATUS.PENDING && minutes <= -30;
    return (
      <View style={styles.viewStyles}>
        <SafeAreaView style={styles.indexValue}>
          <Header
            title="UPCOMING ONLINE VISIT"
            leftIcon="backArrow"
            rightComponent={
              showCancel ? (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    CommonLogEvent(AppRoutes.AppointmentDetails, 'UPCOMING CLINIC VISIT Clicked');
                    setCancelAppointment(true);
                  }}
                >
                  <More />
                </TouchableOpacity>
              ) : null
            }
            onPressLeftIcon={() => props.navigation.goBack()}
          />
          <View style={styles.mainView}>
            <View
              style={{
                flexDirection: 'row',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.displayId}>#{data.displayId}</Text>
                <View style={styles.separatorStyle} />
                <Text style={styles.doctorNameStyle}>{data.doctorInfo.displayName}</Text>
                <Text style={styles.timeStyle}>{appointmentTime}</Text>

                <View style={styles.labelViewStyle}>
                  <Text style={styles.labelStyle}>Payment</Text>
                  <Text style={theme.viewStyles.yellowTextStyle}>BILL</Text>
                </View>
                <View style={styles.separatorStyle} />
                <View style={styles.amountPaidStyles}>
                  <Text style={styles.descriptionStyle}>Amount Paid</Text>
                  <Text style={styles.descriptionStyle}>
                    {g(data, 'appointmentPayments', '0' as any, 'amountPaid') ===
                    Number(doctorDetails.onlineConsultationFees) ? (
                      <Text>{`Rs. ${doctorDetails.onlineConsultationFees}`}</Text>
                    ) : (
                      <>
                        <Text
                          style={{
                            textDecorationLine: 'line-through',
                            textDecorationStyle: 'solid',
                          }}
                        >
                          {`(Rs. ${doctorDetails.onlineConsultationFees})`}
                        </Text>
                        <Text> Rs. {g(data, 'appointmentPayments', '0' as any, 'amountPaid')}</Text>
                      </>
                    )}
                  </Text>
                </View>
              </View>
              <View style={styles.imageView}>
                {!!g(data, 'doctorInfo', 'thumbnailUrl') ? (
                  <Image
                    source={{ uri: data.doctorInfo.thumbnailUrl! }}
                    resizeMode={'contain'}
                    style={styles.doctorImage}
                  />
                ) : (
                  <DoctorPlaceholderImage />
                )}
              </View>
            </View>
          </View>
          <StickyBottomComponent defaultBG style={{ paddingHorizontal: 0 }}>
            <Button
              title={'RESCHEDULE'}
              style={[
                isAwaitingReschedule
                  ? styles.reschduleWaitButtonStyle
                  : styles.reschduleButtonStyle,
              ]}
              titleTextStyle={{
                color: '#fc9916',
                opacity:
                  isAwaitingReschedule ||
                  dateIsAfter ||
                  (data.status == STATUS.PENDING && minutes <= -30)
                    ? 1
                    : 0.5,
              }}
              onPress={() => {
                postAppointmentWEGEvents(WebEngageEventName.RESCHEDULE_CLICKED);
                if (data.status == STATUS.COMPLETED) {
                  showAphAlert!({
                    title: `Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`,
                    description: 'Opps ! Already the appointment is completed',
                  });
                } else {
                  try {
                    if (
                      isAwaitingReschedule ||
                      dateIsAfter ||
                      (data.status == STATUS.PENDING && minutes <= -30)
                    ) {
                      NextAvailableSlotAPI(isAwaitingReschedule);
                    }
                  } catch (error) {
                    CommonBugFender('AppointmentOnlineDetails_RESCHEDULE_try', error);
                  }
                }
              }}
            />
            {data.appointmentState != APPOINTMENT_STATE.AWAITING_RESCHEDULE ? (
              <Button
                title={data.isConsultStarted ? 'CONTINUE CONSULTATION' : 'START CONSULTATION'}
                style={styles.startConsultText}
                onPress={() => {
                  data.isConsultStarted &&
                    postAppointmentWEGEvents(WebEngageEventName.CONTINUE_CONSULTATION_CLICKED);
                  CommonLogEvent(AppRoutes.AppointmentOnlineDetails, 'START_CONSULTATION_CLICKED');
                  props.navigation.navigate(AppRoutes.ChatRoom, {
                    data: data,
                    callType: '',
                    prescription: '',
                  });
                }}
              />
            ) : null}
          </StickyBottomComponent>
        </SafeAreaView>
        {bottompopup && (
          <BottomPopUp
            title={'Hi:)'}
            description="Opps ! The selected slot is unavailable. Please choose a different one"
          >
            <View style={{ height: 60, alignItems: 'flex-end' }}>
              <TouchableOpacity
                style={{
                  height: 60,
                  paddingRight: 25,
                  backgroundColor: 'transparent',
                }}
                onPress={() => {
                  CommonLogEvent(AppRoutes.AppointmentOnlineDetails, 'SELECTED_SLOT_ISSUE_Clicked');
                  setBottompopup(false);
                }}
              >
                <Text
                  style={{
                    paddingTop: 16,
                    ...theme.viewStyles.yellowTextStyle,
                  }}
                >
                  OK, GOT IT
                </Text>
              </TouchableOpacity>
            </View>
          </BottomPopUp>
        )}

        {cancelAppointment && (
          <View
            style={{
              position: 'absolute',
              height: height,
              width: width,
              flex: 1,
              top: statusBarHeight(),
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                CommonLogEvent(AppRoutes.AppointmentOnlineDetails, 'CancelAppointment Clicked');
                setCancelAppointment(false);
              }}
            >
              <View style={styles.cancelMainView}>
                <TouchableOpacity
                  onPress={() => {
                    CommonLogEvent(AppRoutes.AppointmentOnlineDetails, 'CancelAppointment Clicked');
                    setShowCancelPopup(true);
                    setCancelAppointment(false);
                  }}
                >
                  <View style={styles.cancelViewStyles}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {showCancelPopup && (
          <BottomPopUp
            title={`Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`}
            description={
              'Since you could not complete the appointment, you can choose to cancel or reschedule.'
            }
          >
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 20,
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <View style={{ height: 60 }}>
                <TouchableOpacity
                  style={styles.gotItStyles}
                  onPress={() => {
                    postAppointmentWEGEvents(WebEngageEventName.RESCHEDULE_CLICKED);
                    CommonLogEvent(
                      AppRoutes.AppointmentOnlineDetails,
                      'RESCHEDULE_INSTEAD_Clicked'
                    );
                    setShowCancelPopup(false);
                    NextAvailableSlotAPI(isAwaitingReschedule);
                  }}
                >
                  <Text style={styles.gotItTextStyles}>{'RESCHEDULE INSTEAD'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 60 }}>
                <TouchableOpacity
                  style={styles.gotItStyles}
                  onPress={() => {
                    postAppointmentWEGEvents(WebEngageEventName.CANCEL_CONSULTATION_CLICKED);
                    CommonLogEvent(AppRoutes.AppointmentOnlineDetails, 'CANCEL CONSULT_CLICKED');
                    setShowCancelPopup(false);
                    cancelAppointmentApi();
                  }}
                >
                  <Text style={styles.gotItTextStyles}>{'CANCEL CONSULT'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BottomPopUp>
        )}
        {networkStatus && <NoInterNetPopup onClickClose={() => setNetworkStatus(false)} />}
        <View
          style={{
            zIndex: 1,
            elevation: 100,
          }}
        ></View>

        {displayoverlay && doctorDetails && (
          <OverlayRescheduleView
            setdisplayoverlay={() => setdisplayoverlay(false)}
            navigation={props.navigation}
            doctor={doctorDetails ? doctorDetails : null}
            patientId={currentPatient ? currentPatient.id : ''}
            clinics={doctorDetails.doctorHospital ? doctorDetails.doctorHospital : []}
            doctorId={doctorDetails && doctorDetails.id}
            renderTab={'Consult Online'}
            rescheduleCount={newRescheduleCount && newRescheduleCount}
            appointmentId={data.id}
            data={data}
            bookFollowUp={false}
            KeyFollow={'RESCHEDULE'}
            isfollowupcount={0}
            isInitiatedByDoctor={false}
          />
        )}

        {resheduleoverlay && doctorDetails && (
          <ReschedulePopUp
            setResheduleoverlay={() => setResheduleoverlay(false)}
            navigation={props.navigation}
            doctor={doctorDetails ? doctorDetails : null}
            patientId={currentPatient ? currentPatient.id : ''}
            clinics={doctorDetails.doctorHospital ? doctorDetails.doctorHospital : []}
            doctorId={doctorDetails && doctorDetails.id}
            isbelowthree={belowThree}
            setdisplayoverlay={() => reshedulePopUpMethod()}
            acceptChange={() => acceptChange()}
            appadatetime={props.navigation.state.params!.data.appointmentDateTime}
            reschduleDateTime={nextSlotAvailable}
            rescheduleCount={newRescheduleCount ? newRescheduleCount.rescheduleCount : 1}
            data={data}
            cancelAppointmentApi={cancelAppointmentApi}
          />
        )}

        {showSpinner && <Spinner />}
      </View>
    );
  }
  return null;
};
