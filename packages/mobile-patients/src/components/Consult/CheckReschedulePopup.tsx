import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { getPatientAllAppointments_getPatientAllAppointments_activeAppointments } from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';
import { APPOINTMENT_STATE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  getRescheduleAppointmentDetails,
  getNextAvailableSlots,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { useApolloClient } from 'react-apollo-hooks';
import { g, dataSavedUserID, getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import moment from 'moment';
import {
  checkIfReschedule,
  checkIfRescheduleVariables,
} from '@aph/mobile-patients/src/graphql/types/checkIfReschedule';
import { CHECK_IF_RESCHDULE, CANCEL_APPOINTMENT } from '@aph/mobile-patients/src/graphql/profiles';
import { ReschedulePopUp } from '@aph/mobile-patients/src/components/Consult/ReschedulePopUp';
import { NavigationScreenProp, NavigationRoute } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import {
  STATUS,
  TRANSFER_INITIATED_TYPE,
  REQUEST_ROLES,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  bookRescheduleAppointment,
  bookRescheduleAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/bookRescheduleAppointment';
import { BOOK_APPOINTMENT_RESCHEDULE } from '@aph/mobile-patients/src/graphql/profiles';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  cancelAppointment,
  cancelAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/cancelAppointment';
import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';

const { width, height } = Dimensions.get('window');

interface CheckRescheduleProps {
  data: getPatientAllAppointments_getPatientAllAppointments_activeAppointments;
  navigation: NavigationScreenProp<NavigationRoute<{}>, {}>;
  closeModal: () => void;
  cancelSuccessCallback: () => void;
  rescheduleSuccessCallback: () => void;
  secretaryData?: any;
}

type rescheduleType = {
  rescheduleCount: number;
  appointmentState: string;
  isCancel: number;
  isFollowUp: number;
  isPaid: number;
};

export const CheckReschedulePopup: React.FC<CheckRescheduleProps> = (props) => {
  const {
    data,
    closeModal,
    cancelSuccessCallback,
    rescheduleSuccessCallback,
    secretaryData,
  } = props;
  const [resheduleoverlay, setResheduleoverlay] = useState<boolean>(false);
  const doctorDetails = data?.doctorInfo!;
  const apptType = data?.appointmentType;
  const { currentPatient } = useAllCurrentPatients();
  const [belowThree, setBelowThree] = useState<boolean>(false);
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const minutes = moment.duration(moment(data?.appointmentDateTime).diff(new Date())).asMinutes();
  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [nextSlotAvailable, setNextSlotAvailable] = useState<string>('');
  const [bottompopup, setBottompopup] = useState<boolean>(false);
  const [newRescheduleCount, setNewRescheduleCount] = useState<any>();
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const isAwaitingReschedule = data?.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE;
  const [networkStatus, setNetworkStatus] = useState<boolean>(false);

  const todayDate = moment
    .utc(data.appointmentDateTime)
    .local()
    .format('YYYY-MM-DD');

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

  useEffect(() => {
    nextAvailableSlotAPI(isAwaitingReschedule);
  }, []);

  const nextAvailableSlotAPI = (isAwaitingReschedule?: boolean) => {
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
          setLoading!(false);
        }
      })
      .catch((e) => {
        CommonBugFender('AppointmentOnlineDetails_getNetStatus', e);
      });
  };

  const getAppointmentNextSlotInitiatedByDoctor = async () => {
    try {
      setLoading!(true);
      const response = await getRescheduleAppointmentDetails(client, data?.id);
      const slot = g(response, 'data', 'getAppointmentRescheduleDetails', 'rescheduledDateTime');
      setNextSlotAvailable(slot || '');
      setLoading!(false);
      checkIfReschedule();
    } catch (error) {
      setNextSlotAvailable('');
      setLoading!(false);
      checkIfReschedule();
    }
  };

  const checkIfReschedule = () => {
    try {
      setLoading!(true);
      client
        .query<checkIfReschedule, checkIfRescheduleVariables>({
          query: CHECK_IF_RESCHDULE,
          variables: {
            existAppointmentId: data?.id,
            rescheduleDate: data?.appointmentDateTime,
          },
          fetchPolicy: 'no-cache',
        })
        .then((_data: any) => {
          const result = _data?.data?.checkIfReschedule;
          setLoading!(false);

          try {
            const data: rescheduleType = {
              rescheduleCount: result?.rescheduleCount + 1,
              appointmentState: result?.appointmentState,
              isCancel: result?.isCancel,
              isFollowUp: result?.isFollowUp,
              isPaid: result?.isPaid,
            };

            if (result?.rescheduleCount < 3) {
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
          setLoading!(false);
        })
        .finally(() => {
          setResheduleoverlay(true);
        });
    } catch (error) {
      CommonBugFender('AppointmentOnlineDetails_checkIfReschedule_try', error);
      setLoading!(false);
    }
  };

  const fetchNextDoctorAvailableData = () => {
    setLoading!(true);
    getNextAvailableSlots(client, [doctorDetails?.id] || [], todayDate)
      .then(({ data }: any) => {
        setLoading!(false);
        try {
          data[0] && setNextSlotAvailable(
            apptType == 'ONLINE' ? data?.[0]?.availableSlot :
            data?.[0]?.physicalAvailableSlot);
        } catch (error) {
          CommonBugFender('AppointmentOnlineDetails_fetchNextDoctorAvailableData_try', error);
          setNextSlotAvailable('');
        }
      })
      .catch((e) => {
        setLoading!(false);
        CommonBugFender('AppointmentOnlineDetails_fetchNextDoctorAvailableData', e);
      })
      .finally(() => {
        checkIfReschedule();
      });
  };

  const reshedulePopUpMethod = () => {
    setdisplayoverlay(true);
    setResheduleoverlay(false);
  };

  const acceptChange = () => {
    try {
      setResheduleoverlay(false);
      closeModal();
      AsyncStorage.setItem('showSchduledPopup', 'true');
      rescheduleAPI(nextSlotAvailable);
    } catch (error) {
      CommonBugFender('AppointmentOnlineDetails_acceptChange_try', error);
    }
  };

  const rescheduleAPI = (availability: any) => {
    const bookRescheduleInput = {
      appointmentId: data?.id,
      doctorId: doctorDetails?.id,
      newDateTimeslot: availability,
      initiatedBy:
        data?.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
        (data?.status == STATUS.PENDING && minutes <= -30)
          ? TRANSFER_INITIATED_TYPE.DOCTOR
          : TRANSFER_INITIATED_TYPE.PATIENT,
      initiatedId:
        data?.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
        (data?.status == STATUS.PENDING && minutes <= -30)
          ? doctorDetails?.id
          : data?.patientId,
      patientId: data?.patientId,
      rescheduledId: '',
    };

    setLoading!(true);
    client
      .mutate<bookRescheduleAppointment, bookRescheduleAppointmentVariables>({
        mutation: BOOK_APPOINTMENT_RESCHEDULE,
        variables: {
          bookRescheduleAppointmentInput: bookRescheduleInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res: any) => {
        rescheduleSuccessCallback();
        setLoading!(false);
        const params = {
          Data: res?.data?.bookRescheduleAppointment?.appointmentDetails,
          DoctorName: data?.doctorInfo?.displayName,
        };
        navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar, params);
      })
      .catch((e) => {
        CommonBugFender('AppointmentOnlineDetails_rescheduleAPI', e);
        setLoading!(false);
        setBottompopup(true);
      });
  };

  const cancelAppointmentApi = async () => {
    setLoading!(true);
    const userId = await dataSavedUserID('selectedProfileId');

    const appointmentTransferInput = {
      appointmentId: data?.id,
      cancelReason: '',
      cancelledBy: REQUEST_ROLES.PATIENT, //appointmentDate,
      cancelledById: userId ? userId : data?.patientId,
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
        cancelSuccessCallback();
        setLoading!(false);
        showAppointmentCancellSuccessAlert();
        navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar);
      })
      .catch((e: any) => {
        CommonBugFender('AppointmentOnlineDetails_cancelAppointmentApi', e);
        setLoading!(false);
        const message = e?.message?.split(':')?.[1]?.trim() || '';
        if (
          message == 'INVALID_APPOINTMENT_ID' ||
          message == 'JUNIOR_DOCTOR_CONSULTATION_INPROGRESS'
        ) {
          showAphAlert!({
            title: `Hi, ${currentPatient?.firstName || ''} :)`,
            description: 'Ongoing / Completed appointments cannot be cancelled.',
          });
        }
      });
  };

  const showAppointmentCancellSuccessAlert = () => {
    const appointmentNum = g(data, 'displayId');
    const doctorName = g(data, 'doctorInfo', 'displayName');
    showAphAlert!({
      title: `Hi ${g(currentPatient, 'firstName') || ''}!`,
      description: `As per your request, your appointment #${appointmentNum} with ${doctorName} scheduled for ${appointmentTime} has been cancelled.`,
      unDismissable: true,
      onPressOk: () => {
        hideAphAlert!();
      },
    });
  };

  return (
    <View style={styles.container}>
      {resheduleoverlay && doctorDetails && (
        <ReschedulePopUp
          setResheduleoverlay={() => {
            setResheduleoverlay(false);
            closeModal();
          }}
          navigation={props.navigation}
          doctor={doctorDetails ? doctorDetails : null}
          patientId={currentPatient?.id || ''}
          clinics={doctorDetails?.doctorHospital || []}
          doctorId={doctorDetails?.id}
          isbelowthree={belowThree}
          setdisplayoverlay={() => reshedulePopUpMethod()}
          acceptChange={() => acceptChange()}
          appadatetime={data?.appointmentDateTime}
          reschduleDateTime={nextSlotAvailable}
          rescheduleCount={newRescheduleCount?.rescheduleCount || 1}
          data={data}
          cancelAppointmentApi={cancelAppointmentApi}
        />
      )}
      {displayoverlay && doctorDetails && (
        <OverlayRescheduleView
          setdisplayoverlay={() => {
            setdisplayoverlay(false);
            closeModal();
          }}
          navigation={props.navigation}
          doctor={doctorDetails ? doctorDetails : null}
          patientId={currentPatient?.id}
          clinics={doctorDetails?.doctorHospital || []}
          doctorId={doctorDetails?.id}
          renderTab={apptType == 'ONLINE' ? 'Consult Online' : 'Visit Clinic'}
          rescheduleCount={newRescheduleCount}
          secretaryData={secretaryData}
          appointmentId={data?.id}
          data={data}
          bookFollowUp={false}
          KeyFollow={'RESCHEDULE'}
          isfollowupcount={0}
          isInitiatedByDoctor={false}
        />
      )}
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
      {networkStatus && <NoInterNetPopup onClickClose={() => setNetworkStatus(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
    position: 'absolute',
    width: width,
    height: height,
  },
  gotItStyles: {
    height: 60,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
});
