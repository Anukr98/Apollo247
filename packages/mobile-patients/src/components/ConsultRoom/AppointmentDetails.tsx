import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import { ReschedulePopUp } from '@aph/mobile-patients/src/components/Consult/ReschedulePopUp';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  DoctorPlaceholderImage,
  Location,
  More,
} from '@aph/mobile-patients/src/components/ui/Icons';
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
  ConsultMode,
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
  postAppointmentCleverTapEvents,
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
import { NavigationScreenProps } from 'react-navigation';
import { getPatientAllAppointments_getPatientAllAppointments_activeAppointments } from '../../graphql/types/getPatientAllAppointments';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';

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
});

type rescheduleType = {
  rescheduleCount: number;
  appointmentState: string;
  isCancel: number;
  isFollowUp: number;
  isPaid: number;
};

export interface AppointmentDetailsProps extends NavigationScreenProps {}

export const AppointmentDetails: React.FC<AppointmentDetailsProps> = (props) => {
  const data: getPatientAllAppointments_getPatientAllAppointments_activeAppointments = props
    .navigation.state.params!.data;
  const doctorDetails = data.doctorInfo!;

  const movedFrom = props.navigation.state.params!.from;

  const fifteenMinutesLater = new Date();

  const dateIsAfter = moment(data.appointmentDateTime).isAfter(
    moment(fifteenMinutesLater.setMinutes(fifteenMinutesLater.getMinutes() + 15))
  );
  const [cancelAppointment, setCancelAppointment] = useState<boolean>(false);
  const [showCancelPopup, setShowCancelPopup] = useState<boolean>(false);
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [resheduleoverlay, setResheduleoverlay] = useState<boolean>(false);
  const [rescheduleApICalled, setRescheduleApICalled] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [belowThree, setBelowThree] = useState<boolean>(false);
  const [newRescheduleCount, setNewRescheduleCount] = useState<any>();
  const [availability, setAvailability] = useState<any>();
  const [networkStatus, setNetworkStatus] = useState<boolean>(false);
  const [bottompopup, setBottompopup] = useState<boolean>(false);
  const [secretaryData, setSecretaryData] = useState<any>([]);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { getPatientApiCall } = useAuth();
  const minutes = moment.duration(moment(data.appointmentDateTime).diff(new Date())).asMinutes();

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

  const NextAvailableSlotAPI = (isAwaitingReschedule?: boolean) => {
    getNetStatus()
      .then((status) => {
        if (status) {
          if (isAwaitingReschedule) {
            getAppointmentNextSlotInitiatedByDoctor();
          } else {
            nextAvailableSlot();
          }
        } else {
          setNetworkStatus(true);
          setshowSpinner(false);
        }
      })
      .catch((e) => {
        CommonBugFender('AppointmentDetails_getNetStatus', e);
      });
  };

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
        const secretaryDetails = g(apiResponse, 'data', 'data', 'getSecretaryDetailsByDoctorId');
        setSecretaryData(secretaryDetails);
      })
      .catch((error) => {});
  };

  const todayDate = moment
    .utc(data.appointmentDateTime)
    .local()
    .format('YYYY-MM-DD');

  const nextAvailableSlot = () => {
    setshowSpinner(true);
    getNextAvailableSlots(client, doctorDetails ? [doctorDetails.id] : [], todayDate)
      .then(({ data }: any) => {
        setshowSpinner(false);
        try {
          data[0] && setAvailability(data[0].physicalAvailableSlot);
        } catch (error) {
          CommonBugFender('AppointmentDetails_nextAvailableSlot_try', error);
          setAvailability('');
        }
      })
      .catch((e) => {
        CommonBugFender('AppointmentDetails_nextAvailableSlot', e);
        setshowSpinner(false);
        const error = JSON.parse(JSON.stringify(e));
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
      setAvailability(slot || '');
      setshowSpinner(false);
      checkIfReschedule();
    } catch (error) {
      setAvailability('');
      setshowSpinner(false);
      checkIfReschedule();
    }
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
            CommonBugFender('AppointmentDetails_CHECK_IF_RESCHDULE_try', error);
          }
        })
        .catch((e: any) => {
          CommonBugFender('AppointmentDetails_checkIfReschedule', e);
          setshowSpinner(false);
          const error = JSON.parse(JSON.stringify(e));
        })
        .finally(() => {
          setResheduleoverlay(true);
        });
    } catch (error) {
      CommonBugFender('AppointmentDetails_checkIfReschedule_try', error);
      setshowSpinner(false);
    }
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
      .then((_data: any) => {
        postAppointmentWEGEvents(WebEngageEventName.CONSULTATION_RESCHEDULED_BY_CUSTOMER);
        postAppointmentCleverTapEvents(
          CleverTapEventName.CONSULT_RESCHEDULED_BY_THE_PATIENT,
          data,
          currentPatient,
          secretaryData
        );
        setshowSpinner(false);
        const params = {
          Data: _data?.data?.bookRescheduleAppointment?.appointmentDetails,
          DoctorName: props.navigation.state.params?.data?.doctorInfo?.fullName,
        };
        navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar, params);
      })
      .catch((e) => {
        CommonBugFender('AppointmentDetails_rescheduleAPI', e);
        setBottompopup(true);
      });
  };
  const acceptChange = () => {
    try {
      setResheduleoverlay(false);
      AsyncStorage.setItem('showSchduledPopup', 'true');

      rescheduleAPI(availability);
    } catch (error) {
      CommonBugFender('AppointmentDetails_rescheduleAPI_try', error);
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
      'Secretary Name': g(secretaryData, 'name'),
      'Secretary Mobile Number': g(secretaryData, 'mobileNumber'),
      'Doctor Mobile Number': g(data, 'doctorInfo', 'mobileNumber')!,
    };
    postWebEngageEvent(type, eventAttributes);
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
      .then((_data: any) => {
        postAppointmentWEGEvents(WebEngageEventName.CONSULTATION_CANCELLED_BY_CUSTOMER);
        postAppointmentCleverTapEvents(
          CleverTapEventName.CONSULT_CANCELLED_BY_PATIENT,
          data,
          currentPatient,
          secretaryData
        );
        setshowSpinner(false);
        showAppointmentCancellSuccessAlert();
      })
      .catch((e: any) => {
        CommonBugFender('AppointmentDetails_cancelAppointmentApi', e);
        setshowSpinner(false);
        const message = e.message ? e.message.split(':')[1].trim() : '';
        if (message == 'INVALID_APPOINTMENT_ID') {
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
        navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar);
      },
    });
  };

  if (data.doctorInfo) {
    const isAwaitingReschedule = data.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE;
    const showCancel =
      dateIsAfter || isAwaitingReschedule ? true : data.status == STATUS.PENDING && minutes <= -30;
    return (
      <View
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <SafeAreaView style={{ flex: 1, zIndex: -1 }}>
          <Header
            title="UPCOMING CLINIC VISIT"
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
          <View
            style={{
              backgroundColor: theme.colors.CARD_BG,
              paddingTop: 20,
              paddingHorizontal: 20,
              ...theme.viewStyles.shadowStyle,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    ...theme.fonts.IBMPlexSansMedium(12),
                    color: theme.colors.SEARCH_EDUCATION_COLOR,
                    paddingBottom: 4,
                  }}
                >
                  #{data.displayId}
                </Text>
                <View style={styles.separatorStyle} />
                <Text style={styles.doctorNameStyle}>{data.doctorInfo.displayName}</Text>
                <Text style={styles.timeStyle}>{appointmentTime}</Text>
                <View style={styles.labelViewStyle}>
                  <Text style={styles.labelStyle}>Location</Text>
                  <Location />
                </View>
                <View style={styles.separatorStyle} />
                <Text style={styles.descriptionStyle}>
                  {data.doctorInfo &&
                  data.doctorInfo.doctorHospital &&
                  data.doctorInfo.doctorHospital.length > 0 &&
                  data.doctorInfo.doctorHospital[0].facility
                    ? `${data.doctorInfo.doctorHospital[0].facility.streetLine1} ${data.doctorInfo.doctorHospital[0].facility.city}`
                    : ''}
                </Text>
                <View style={styles.labelViewStyle}>
                  <Text style={styles.labelStyle}>Average Waiting Time</Text>
                </View>
                <View style={styles.separatorStyle} />
                <Text style={styles.descriptionStyle}>40 mins</Text>
                <View style={styles.labelViewStyle}>
                  <Text style={styles.labelStyle}>Payment</Text>
                  <Text style={theme.viewStyles.yellowTextStyle}>INVOICE</Text>
                </View>
                <View style={styles.separatorStyle} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.descriptionStyle}>Advance Paid</Text>
                  <Text style={styles.descriptionStyle}>
                    {g(data, 'appointmentPayments', '0' as any, 'amountPaid')}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.descriptionStyle}>Balance Remaining</Text>
                  <Text style={styles.descriptionStyle}>0</Text>
                </View>
              </View>
              <View style={styles.imageView}>
                {!!g(data, 'doctorInfo', 'thumbnailUrl') ? (
                  <Image
                    source={{ uri: data.doctorInfo.thumbnailUrl! }}
                    resizeMode={'contain'}
                    style={{
                      width: 80,
                      height: 80,
                    }}
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
                data.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE
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
                postAppointmentCleverTapEvents(
                  CleverTapEventName.CONSULT_RESCHEDULE_CLICKED,
                  data,
                  currentPatient,
                  secretaryData
                );
                if (data.status == STATUS.COMPLETED) {
                  showAphAlert!({
                    title: `Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`,
                    description: 'Opps ! Already the appointment is completed',
                  });
                } else {
                  CommonLogEvent(
                    AppRoutes.AppointmentDetails,
                    'RESCHEDULE APPOINTMENT DETAILS CLICKED'
                  );
                  try {
                    isAwaitingReschedule ||
                    dateIsAfter ||
                    (data.status == STATUS.PENDING && minutes <= -30)
                      ? NextAvailableSlotAPI(isAwaitingReschedule)
                      : null;
                  } catch (error) {
                    CommonBugFender('AppointmentDetails_NextAvailableSlotAPI_try', error);
                  }
                }
              }}
            />
            {data.appointmentState != APPOINTMENT_STATE.AWAITING_RESCHEDULE ? (
              <Button
                title={data.isConsultStarted ? 'CONTINUE CONSULTATION' : 'START CONSULTATION'}
                style={{
                  flex: 0.6,
                  marginRight: 20,
                  marginLeft: 8,
                }}
                onPress={() => {
                  if (data?.isConsultStarted) {
                    postAppointmentWEGEvents(WebEngageEventName.CONTINUE_CONSULTATION_CLICKED);
                    postAppointmentCleverTapEvents(
                      CleverTapEventName.CONSULT_CONTINUE_CONSULTATION_CLICKED,
                      data,
                      currentPatient,
                      secretaryData
                    );
                  }
                  CommonLogEvent(AppRoutes.AppointmentDetails, 'START_CONSULTATION_CLICKED');
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
                CommonLogEvent(AppRoutes.AppointmentDetails, 'AppointmentDetails Cancel Clicked');
                setCancelAppointment(false);
              }}
            >
              <View
                style={{
                  margin: 0,
                  height: height,
                  width: width,
                  backgroundColor: 'transparent',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowCancelPopup(true);
                    setCancelAppointment(false);
                  }}
                >
                  <View
                    style={{
                      backgroundColor: 'white',
                      width: 100,
                      height: 45,
                      marginLeft: width - 120,
                      marginTop: 40,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...theme.viewStyles.shadowStyle,
                    }}
                  >
                    <Text
                      style={{
                        backgroundColor: 'white',
                        color: '#02475b',
                        ...theme.fonts.IBMPlexSansMedium(16),
                        textAlign: 'center',
                      }}
                    >
                      Cancel
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {showCancelPopup && (
          <BottomPopUp
            title={string.common.cancelAppointmentTitleHeading}
            description={
              string.common.cancelAppointmentBody + data?.appointmentType === ConsultMode.PHYSICAL
                ? 'Physical'
                : 'Online' + ' Appointment ' + data?.displayId + ' A full refund will be issued'
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
                    postAppointmentCleverTapEvents(
                      CleverTapEventName.CONSULT_RESCHEDULE_CLICKED,
                      data,
                      currentPatient,
                      secretaryData
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
                    postAppointmentCleverTapEvents(
                      CleverTapEventName.CONSULT_CANCEL_CLICKED_BY_PATIENT,
                      data,
                      currentPatient,
                      secretaryData
                    );
                    CommonLogEvent(
                      AppRoutes.AppointmentDetails,
                      'AppointmentDetails  Cancel Concsult Clicked'
                    );
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
            renderTab={data?.appointmentType == 'ONLINE' ? 'Consult Online' : 'Visit Clinic'}
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
            reschduleDateTime={availability}
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
