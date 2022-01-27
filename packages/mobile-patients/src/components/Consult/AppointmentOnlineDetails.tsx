import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import { ReschedulePopUp } from '@aph/mobile-patients/src/components/Consult/ReschedulePopUp';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  DoctorPlaceholderImage,
  More,
  DropdownGreen,
  CrossPopup,
  BackArrow,
  Pdf,
  RightArrowBlue,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Overlay } from 'react-native-elements';
import { DropDown, Option } from '@aph/mobile-patients/src/components/ui/DropDown';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  BOOK_APPOINTMENT_RESCHEDULE,
  CANCEL_APPOINTMENT,
  CHECK_IF_RESCHDULE,
  CONSULT_ORDER_INVOICE,
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
  postWebEngageEvent,
  statusBarHeight,
  navigateToScreenWithEmptyStack,
  postAppointmentCleverTapEvents,
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
  ScrollView,
  StatusBar,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { getPatientAllAppointments_getPatientAllAppointments_activeAppointments } from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';
import { AppConfig, CancelConsultation } from '@aph/mobile-patients/src/strings/AppConfig';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import RNFetchBlob from 'rn-fetch-blob';
import { mimeType } from '@aph/mobile-patients/src/helpers/mimeType';
import { useShoppingCart } from '../ShoppingCartProvider';

const OTHER_REASON = string.ReasonFor_Cancel_Consultation.otherReasons;
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
  pdfIcon: {
    width: 22,
    height: 26,
    marginStart: 9,
    marginEnd: 13,
  },
  pdfView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderRadius: 6,
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
  },
  arrowIconView: {
    flex: 1,
    alignItems: 'flex-end',
    marginEnd: 16,
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 2,
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: theme.colors.BUTTON_ORANGE,
  },
  timeStyle: {
    paddingBottom: 10,
    ...theme.fonts.IBMPlexSansRegular(12),
    color: theme.colors.SKY_BLUE,
  },
  labelStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 3.5,
  },
  labelStyle1: {
    ...theme.fonts.IBMPlexSansRegular(12),
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
    color: theme.colors.CHAT_TILE_BG,
    paddingBottom: 4,
  },
  doctorImage: {
    width: 80,
    height: 80,
  },
  reschduleButtonStyle: {
    flex: 0.5,
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
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.HEX_WHITE,
    ...theme.viewStyles.shadowStyle,
  },
  startConsultText: { flex: 0.5, marginRight: 20, marginLeft: 8 },
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
    width: 200,
    height: 55.5,
    marginLeft: width - 220,
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
  },
  cancelMainView: { margin: 0, height: height, width: width, backgroundColor: 'transparent' },
  dropdownOverlayStyle: {
    padding: 0,
    margin: 0,
    height: 'auto',
    borderRadius: 10,
  },
  cancelReasonHeadingView: {
    ...theme.viewStyles.cardContainer,
    backgroundColor: theme.colors.WHITE,
    padding: 18,
    marginBottom: 24,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cancelReasonHeadingText: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    textAlign: 'center',
  },
  cancelReasonContentHeading: {
    marginBottom: 12,
    color: '#0087ba',
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  cancelReasonContentView: { flexDirection: 'row', alignItems: 'center' },
  cancelReasonContentText: {
    flex: 0.9,
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SHERPA_BLUE,
  },
  reasonCancelDropDownExtraView: {
    marginTop: 5,
    backgroundColor: '#00b38e',
    height: 2,
  },
  cancelReasonSubmitButton: { margin: 16, marginTop: 32, width: 'auto' },
  reasonCancelOverlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    flex: 1,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  reasonCancelCrossTouch: { marginTop: 80, alignSelf: 'flex-end' },
  reasonCancelView: {
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  consultationGuidelinesText: {
    ...theme.fonts.IBMPlexSansRegular(11),
    marginVertical: 2,
    color: theme.colors.SLATE_GRAY,
  },
  viewMoreText: {
    color: theme.colors.BUTTON_ORANGE,
    ...theme.fonts.IBMPlexSansMedium(11),
    textTransform: 'uppercase',
    marginTop: 4,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexOne: { flex: 1 },
  displayIdNew: {
    backgroundColor: theme.colors.AQUA_BLUE,
    width: 160,
    paddingLeft: 6,
    paddingTop: 6,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  patientNameHeadingText: {
    ...theme.fonts.IBMPlexSansRegular(12),
    paddingBottom: 10,
    color: theme.colors.LIGHT_BLUE,
  },
  patientNameText: { color: theme.colors.SKY_BLUE },
  scrollMain: { backgroundColor: theme.colors.HEX_WHITE, marginTop: 20 },
  contentContainerStyle: { paddingBottom: 60 },
  semiBold12: { ...theme.fonts.IBMPlexSansSemiBold(12) },
  pdfButton: { marginVertical: 10, paddingHorizontal: 20 },
  rescheduleCancelContainer: { flex: 1, paddingHorizontal: 20, marginTop: 12 },
  rescheduleCancelContainerHeading: {
    ...theme.fonts.IBMPlexSansMedium(13),
    textTransform: 'uppercase',
    marginBottom: 6,
    color: theme.colors.LIGHT_BLUE,
  },
  rescheduleCancelContainerHeadingText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.CHAT_TILE_BG,
  },
  stickyButtonComponent: {
    paddingHorizontal: 0,
    borderTopWidth: 1,
    borderColor: theme.colors.CALL_BG_GRAY,
  },
  rescheduleButtonOrange: {
    borderWidth: 1,
    borderColor: theme.colors.BUTTON_ORANGE,
    borderRadius: 4,
  },
  padding20: { paddingHorizontal: 20 },
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
  const data: getPatientAllAppointments_getPatientAllAppointments_activeAppointments = props
    .navigation.state.params!.data;
  const doctorDetails = data.doctorInfo!;
  const movedFrom = props.navigation.state.params!.from;
  const cancellationReasons = CancelConsultation.reason;
  const fifteenMinutesLater = new Date();
  const dateIsAfter = moment(data.appointmentDateTime).isAfter(
    moment(fifteenMinutesLater.setMinutes(fifteenMinutesLater.getMinutes() + 15))
  );
  const [cancelAppointment, setCancelAppointment] = useState<boolean>(false);
  const [showCancelPopup, setShowCancelPopup] = useState<boolean>(false);

  const [isCancelVisible, setCancelVisible] = useState<boolean>(false);
  const [overlayDropdown, setOverlayDropdown] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');

  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [resheduleoverlay, setResheduleoverlay] = useState<boolean>(false);
  const [appointmentTime, setAppointmentTime] = useState<string>('');
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
  const { circleSubscriptionId, circleSubPlanId } = useShoppingCart();
  const CONFIG_RC = AppConfig.Configuration.RESCHEDULE_CANCELLATION;

  const isSubmitDisableForOther = selectedReason == OTHER_REASON && comment == '';

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
        .format('DD MMM YYYY h:mm A')}`;
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
    const reasonForCancellation = selectedReason != OTHER_REASON ? selectedReason : comment;

    const appointmentTransferInput = {
      appointmentId: data.id,
      cancelReason: reasonForCancellation,
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
        navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar);
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
          DoctorName: props.navigation.state.params?.data?.doctorInfo?.displayName,
        };
        navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar, params);
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

  const onPressConfirmCancelConsultation = () => {
    setCancelVisible(false);
    cancelAppointmentApi();
  };

  const renderReasonForCancelPopUp = () => {
    const optionsDropdown = overlayDropdown && (
      <Overlay
        onBackdropPress={() => setOverlayDropdown(false)}
        isVisible={overlayDropdown}
        overlayStyle={styles.dropdownOverlayStyle}
      >
        <DropDown
          cardContainer={{
            margin: 0,
          }}
          options={cancellationReasons.map(
            (cancellationReasons, i) =>
              ({
                onPress: () => {
                  setSelectedReason(cancellationReasons!);
                  setOverlayDropdown(false);
                },
                optionText: cancellationReasons,
              } as Option)
          )}
        />
      </Overlay>
    );

    const heading = (
      <View
        style={[
          styles.cancelReasonHeadingView,
          { flexDirection: selectedReason == OTHER_REASON ? 'row' : 'column' },
        ]}
      >
        {selectedReason == OTHER_REASON ? (
          <TouchableOpacity
            onPress={() => {
              resetReasonForCancelFields();
            }}
          >
            <BackArrow />
          </TouchableOpacity>
        ) : null}
        <Text
          style={[
            styles.cancelReasonHeadingText,
            { marginHorizontal: selectedReason == OTHER_REASON ? '20%' : 0 },
          ]}
        >
          {string.cancelConsultationHeading}
        </Text>
      </View>
    );

    const content = (
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={styles.cancelReasonContentHeading}>
          {string.cancelConsultationReasonHeading}
        </Text>
        {selectedReason != OTHER_REASON ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setOverlayDropdown(true);
            }}
          >
            <View style={styles.cancelReasonContentView}>
              <Text
                style={[styles.cancelReasonContentText, selectedReason ? {} : { opacity: 0.3 }]}
                numberOfLines={1}
              >
                {selectedReason || 'Select reason for cancelling'}
              </Text>
              <View style={{ flex: 0.1 }}>
                <DropdownGreen style={{ alignSelf: 'flex-end' }} />
              </View>
            </View>
            <View style={styles.reasonCancelDropDownExtraView} />
          </TouchableOpacity>
        ) : (
          <TextInputComponent
            value={comment}
            onChangeText={(text) => {
              text.startsWith(' ') ? null : setComment(text);
            }}
            placeholder={'Write your reason'}
          />
        )}
        {selectedReason != OTHER_REASON ? (
          <TextInputComponent
            value={comment}
            onChangeText={(text) => {
              text.startsWith(' ') ? null : setComment(text);
            }}
            label={'Add Comments (Optional)'}
            placeholder={'Enter your comments here…'}
          />
        ) : null}
      </View>
    );

    const bottomButton = (
      <Button
        style={styles.cancelReasonSubmitButton}
        onPress={onPressConfirmCancelConsultation}
        disabled={!!selectedReason ? isSubmitDisableForOther : true}
        title={'SUBMIT REQUEST'}
      />
    );

    return (
      isCancelVisible && (
        <View style={styles.reasonCancelOverlay}>
          <View style={{ marginHorizontal: 20 }}>
            <TouchableOpacity
              style={styles.reasonCancelCrossTouch}
              onPress={() => {
                setCancelVisible(!isCancelVisible);
                setSelectedReason('');
                setComment('');
              }}
            >
              <CrossPopup />
            </TouchableOpacity>
            <View style={{ height: 16 }} />
            <View style={styles.reasonCancelView}>
              {optionsDropdown}
              {heading}
              {content}
              {bottomButton}
            </View>
          </View>
        </View>
      )
    );
  };

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  const downloadInvoice = () => {
    client
      .query({
        query: CONSULT_ORDER_INVOICE,
        variables: {
          patientId: currentPatient?.id,
          appointmentId: data?.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        const { getOrderInvoice } = res?.data || {};
        let dirs = RNFetchBlob.fs.dirs;
        let fileName: string =
          'Apollo_Consult_Invoice' + moment().format('MMM_D_YYYY_HH_mm') + '.pdf';
        const downloadPath =
          Platform.OS === 'ios'
            ? (dirs.DocumentDir || dirs.MainBundleDir) +
              '/' +
              (fileName || 'Apollo_Consult_Invoice.pdf')
            : dirs.DownloadDir + '/' + (fileName || 'Apollo_Consult_Invoice.pdf');
        RNFetchBlob.config({
          fileCache: true,
          path: downloadPath,
          addAndroidDownloads: {
            title: fileName,
            useDownloadManager: true,
            notification: true,
            path: downloadPath,
            mime: mimeType(downloadPath),
            description: 'File downloaded by download manager.',
          },
        })
          .fetch('GET', String(getOrderInvoice), {
            //some headers ..
          })
          .then((res) => {
            if (Platform.OS === 'android') {
              Alert.alert('Download Complete');
            }
            Platform.OS === 'ios'
              ? RNFetchBlob.ios.previewDocument(res.path())
              : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
          })
          .catch((err) => {
            CommonBugFender('ConsultView_downloadInvoice', err);
          });
      })
      .catch((error) => {
        renderErrorPopup(`Something went wrong, please try again after sometime`);
        CommonBugFender('fetchingConsultInvoice', error);
      });
  };

  const requestStoragePermission = async () => {
    try {
      const resuts = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (
        resuts[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (
        resuts[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] !==
        PermissionsAndroid.RESULTS.GRANTED
      ) {
      }
      if (resuts) {
        downloadInvoice();
      }
    } catch (error) {
      CommonBugFender('AppointmentScreen_requestReadSmsPermission_try', error);
    }
  };

  const downloadPDF = () => {
    let dirs = RNFetchBlob.fs.dirs;
    const title = 'Consultation guideline';
    const downloadPath =
      Platform.OS === 'ios'
        ? (dirs.DocumentDir || dirs.MainBundleDir) + '/' + 'ConsultGuidelines.pdf'
        : dirs.DownloadDir + '/' + 'ConsultGuidelines.pdf';
    RNFetchBlob.config({
      fileCache: true,
      path: downloadPath,
      addAndroidDownloads: {
        title: 'ConsultGuidelines.pdf',
        mime: mimeType(downloadPath),
        useDownloadManager: true,
        notification: true,
        description: 'File downloaded by download manager.',
        path: downloadPath,
      },
    })
      .fetch('GET', 'https://newassets-test.apollo247.com/files/Mobile_View_Infographic.pdf', {
        //some headers ..
      })
      .then((res) => {
        showAphAlert!({
          title: 'Alert!',
          description: 'Downloaded : ' + title,
          onPressOk: () => {
            Platform.OS === 'ios'
              ? RNFetchBlob.ios.previewDocument(res.path())
              : RNFetchBlob.android.actionViewIntent(res.path(), mimeType(res.path()));
            hideAphAlert!();
          },
        });
      })
      .catch((err) => {
        CommonBugFender('AppointmentDetails_downloadPDF', err);
      });
  };

  const resetReasonForCancelFields = () => {
    setSelectedReason('');
    setComment('');
  };
  const [isViewMore, setIsViewMore] = useState<boolean>(
    Boolean(CONFIG_RC?.other_guidelines?.guidelines?.length) ||
      CONFIG_RC?.isConsultationGuidelinesPdf
  );

  const renderConsultationGuidlines = () => {
    return (
      <>
        <Text style={styles.consultationGuidelinesText}>
          {CONFIG_RC?.reschedule_cancellation_guidelines?.title}
        </Text>
        {CONFIG_RC?.reschedule_cancellation_guidelines?.guidelines?.length
          ? CONFIG_RC?.reschedule_cancellation_guidelines?.guidelines.map((item) => (
              <Text style={styles.consultationGuidelinesText}>{item}</Text>
            ))
          : null}
        {isViewMore &&
          (CONFIG_RC?.reschedule_cancellation_guidelines?.guidelines?.length ||
            CONFIG_RC?.isConsultationGuidelinesPdf) && (
            <Text onPress={() => setIsViewMore(!isViewMore)} style={styles.viewMoreText}>
              View More
            </Text>
          )}
        {!isViewMore && CONFIG_RC?.reschedule_cancellation_guidelines?.guidelines?.length && (
          <>
            <Text style={styles.consultationGuidelinesText}>
              {CONFIG_RC?.other_guidelines?.title}
            </Text>
            {CONFIG_RC?.other_guidelines?.guidelines?.length &&
              CONFIG_RC?.other_guidelines?.guidelines.map((item) => (
                <Text style={styles.consultationGuidelinesText}>{item}</Text>
              ))}
          </>
        )}
      </>
    );
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
      'Doctor Name': g(data, 'doctorInfo', 'displayName')!,
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

  const paymentTable = () => (
    <>
      <View style={[styles.labelViewStyle, styles.padding20]}>
        <Text style={styles.labelStyle1}>{string.common.consultationFee}</Text>
        <Text style={[styles.labelStyle1, { width: 35 }]}>
          {data?.consultFee != null && data?.consultFee != undefined
            ? `₹ ${data?.consultFee}`
            : '-'}
        </Text>
      </View>
      {data?.couponApplied && (
        <>
          <Spearator />
          <View style={[styles.labelViewStyle, styles.padding20]}>
            <Text style={[styles.labelStyle1, { color: theme.colors.CHAT_TILE_BG }]}>
              {`${string.common.couponApplied} (${data?.couponCode ? data?.couponCode : '-'})`}
            </Text>
            <Text style={[styles.labelStyle1, { color: theme.colors.CHAT_TILE_BG, width: 35 }]}>
              {data?.couponAmount != null && data?.couponAmount != undefined
                ? `₹ ${data?.couponAmount}`
                : '-'}
            </Text>
          </View>
        </>
      )}
      <Spearator />
      <View style={[styles.labelViewStyle, styles.padding20]}>
        <Text style={styles.labelStyle1}>{string.common.bookingFee}</Text>
        <Text style={[styles.labelStyle1, { width: 35 }]}>
          {data?.bookingFee != null && data?.bookingFee != undefined
            ? `₹ ${data?.bookingFee}`
            : '-'}
        </Text>
      </View>
      <Spearator />
      <View
        style={[
          styles.labelViewStyle,
          { paddingHorizontal: 20, backgroundColor: theme.colors.AQUA_BLUE },
        ]}
      >
        <Text style={[styles.labelStyle1, styles.semiBold12]}>{string.common.amountPaid}</Text>
        <Text style={[styles.labelStyle1, styles.semiBold12, { width: 35 }]}>
          {data?.amountPaid != null && data?.amountPaid != undefined
            ? `₹ ${data?.amountPaid}`
            : '-'}
        </Text>
      </View>
      <View style={styles.separatorStyle} />
      <TouchableOpacity onPress={requestStoragePermission} style={styles.pdfButton}>
        <View style={[styles.pdfView, { paddingHorizontal: 10 }]}>
          <Pdf style={styles.pdfIcon} />
          <View>
            <Text style={theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE)}>
              {string.common.paymentReceipt}
            </Text>
            <Text style={theme.viewStyles.text('R', 12, theme.colors.SLATE_GRAY)}>
              {string.common.viewDownload}
            </Text>
          </View>
          <View style={styles.arrowIconView}>
            <RightArrowBlue style={{ height: 12, width: 6 }} />
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
  if (data.doctorInfo) {
    const isAwaitingReschedule = data.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE;
    const showCancel =
      dateIsAfter || isAwaitingReschedule ? true : data.status == STATUS.PENDING && minutes <= -30;
    return (
      <View style={styles.viewStyles}>
        {renderReasonForCancelPopUp()}
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
            <View style={styles.flexRow}>
              <View style={styles.flexOne}>
                <View style={styles.displayIdNew}>
                  <Text style={[styles.displayId]}>{`Appointment ID ${data?.displayId}`}</Text>
                </View>

                <View style={styles.separatorStyle} />
                <TouchableOpacity
                  onPress={() =>
                    props.navigation.navigate(AppRoutes.DoctorDetails, {
                      doctorId: doctorDetails?.id,
                    })
                  }
                >
                  <Text style={styles.doctorNameStyle}>{data.doctorInfo.displayName}</Text>
                </TouchableOpacity>
                <Text style={styles.timeStyle}>{appointmentTime}</Text>

                <Text style={styles.patientNameHeadingText}>
                  {'Patient Name: '}
                  <Text
                    style={styles.patientNameText}
                  >{`${currentPatient?.firstName} ${currentPatient?.lastName}`}</Text>
                </Text>
              </View>
            </View>
          </View>
          <ScrollView
            style={styles.scrollMain}
            contentContainerStyle={styles.contentContainerStyle}
          >
            <CollapseView
              isDown={false}
              Heading={string.common.paymentDetails}
              isViewDownload
              ChildComponent={paymentTable()}
            />
            <Spearator />
            <View style={styles.rescheduleCancelContainer}>
              <Text style={styles.rescheduleCancelContainerHeading}>
                {CONFIG_RC?.guidelinesHeading}
              </Text>
              <Text style={styles.rescheduleCancelContainerHeadingText}>
                {CONFIG_RC?.guidelinesSubHeading}
              </Text>
              {renderConsultationGuidlines()}
              {!isViewMore && CONFIG_RC?.isConsultationGuidelinesPdf && (
                <TouchableOpacity onPress={downloadPDF} style={{ marginVertical: 10 }}>
                  <View style={[styles.pdfView, { paddingHorizontal: 10 }]}>
                    <Pdf style={styles.pdfIcon} />
                    <View>
                      <Text style={theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE)}>
                        {string.common.viewConsultationGuidelines}
                      </Text>
                      <Text style={theme.viewStyles.text('R', 12, theme.colors.SLATE_GRAY)}>
                        {string.consultPayment.download}
                      </Text>
                    </View>
                    <View style={styles.arrowIconView}>
                      <RightArrowBlue style={{ height: 12, width: 6 }} />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
          <StickyBottomComponent style={styles.stickyButtonComponent}>
            <Button
              title={'RESCHEDULE'}
              style={[
                isAwaitingReschedule
                  ? styles.reschduleWaitButtonStyle
                  : styles.reschduleButtonStyle,
                styles.rescheduleButtonOrange,
              ]}
              titleTextStyle={{
                color: theme.colors.BUTTON_ORANGE,
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
                title={'PROCEED'}
                style={[styles.startConsultText, { borderRadius: 4 }]}
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
                  CommonLogEvent(AppRoutes.AppointmentOnlineDetails, 'START_CONSULTATION_CLICKED');
                  props.navigation.replace(AppRoutes.ChatRoom, {
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
                setCancelVisible(false);
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
                    <Text style={styles.cancelText}>Cancel Appointment</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {showCancelPopup && (
          <BottomPopUp
            title={string.common.cancelAppointmentTitleHeading}
            description={`${string.common.cancelAppointmentBody} ${
              data?.appointmentType === APPOINTMENT_TYPE.PHYSICAL ? 'Physical' : 'Online'
            } Appointment ${data?.displayId}. A full refund will be issued.`}
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
                    postAppointmentCleverTapEvents(
                      CleverTapEventName.CONSULT_CANCEL_CLICKED_BY_PATIENT,
                      data,
                      currentPatient,
                      secretaryData,
                      {
                        circleSubscriptionId: circleSubscriptionId,
                        circleSubPlanId: circleSubPlanId,
                      }
                    );
                    CommonLogEvent(AppRoutes.AppointmentOnlineDetails, 'CANCEL CONSULT_CLICKED');
                    setShowCancelPopup(false);
                    setCancelVisible(true); //to show the reasons for cancelling the consultation
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
