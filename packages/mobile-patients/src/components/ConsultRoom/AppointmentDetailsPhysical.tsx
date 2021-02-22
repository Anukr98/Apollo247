import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import { ReschedulePopUp } from '@aph/mobile-patients/src/components/Consult/ReschedulePopUp';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { DoctorPlaceholderImage, More } from '@aph/mobile-patients/src/components/ui/Icons';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
  setBugFenderLog,
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
  Linking,
  Platform,
} from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { getPatientAllAppointments_getPatientAllAppointments_activeAppointments } from '../../graphql/types/getPatientAllAppointments';

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
  priceBreakupTitle: {
    ...theme.viewStyles.text('SB', 13, theme.colors.SHERPA_BLUE),
    marginHorizontal: 6,
    marginTop: 15,
  },
  seperatorLine: {
    marginTop: 4,
    height: 0.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
    marginHorizontal: 6,
  },
  couponStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  containerPay: {
    margin: 20,
    backgroundColor: 'red',
    borderRadius: 10,
    ...theme.viewStyles.card(10),
    paddingVertical: 16,
  },
  rowContainerPay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regularTextPay: {
    ...theme.viewStyles.text('M', 16, theme.colors.SHERPA_BLUE),
  },
  seperatorLinePay: {
    marginVertical: 12,
    height: 0.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
  },
  amountSavedText: {
    ...theme.fonts.IBMPlexSansRegular(16),
    color: theme.colors.SEARCH_UNDERLINE_COLOR,
    fontWeight: '400',
    marginLeft: 8,
  },
  bottomButtonView: {
    backgroundColor: 'white',
    height: 80,
    justifyContent: 'center',
  },
  bottomBtn: {
    marginLeft: 35,
    width: width - 70,
  },
  saveWithCareView: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 20,
    borderRadius: 5,
    backgroundColor: theme.colors.CARD_BG,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    padding: 10,
    marginBottom: 20,
    elevation: 2,
  },
  smallText: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE),
    maxWidth: width - 100,
  },
  careLogo: {
    width: 40,
    height: 20,
  },
  doctorCard: {
    ...theme.viewStyles.cardViewStyle,
    paddingHorizontal: 20,
    backgroundColor: '#F7F8F5',
    borderRadius: 0,
    marginTop: 20,
    paddingTop: 22,
    paddingBottom: 14,
  },
  sucessPopupView: {
    flexDirection: 'row',
    marginHorizontal: 20,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  careLogoText: {
    ...theme.viewStyles.text('SB', 7, theme.colors.WHITE),
  },
  careSelectContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  doctorFees: {
    ...theme.viewStyles.text('M', 15, theme.colors.LIGHT_BLUE),
  },
  doctorProfile: {
    height: 80,
    borderRadius: 40,
    width: 80,
    alignSelf: 'center',
  },
  drImageBackground: {
    height: 95,
    width: 95,
    justifyContent: 'center',
  },
  rowContainerDoc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  doctorNameStyle: {
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansMedium(23),
    color: theme.colors.SEARCH_DOCTOR_NAME,
    marginTop: 4,
  },
  specializationStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SKY_BLUE,
    marginTop: 2,
  },
  regularText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    marginTop: 18,
  },
  appointmentTimeStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SKY_BLUE,
    marginTop: 10,
  },
  showPopUp: {
    backgroundColor: 'rgba(0,0,0,0.01)',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    elevation: 5,
  },
  container: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  mainView: {
    backgroundColor: 'rgba(100,100,100, 0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subViewPopup: {
    backgroundColor: 'white',
    width: '88%',
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  congratulationsDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  mapsStyle: {
    margin: 6,
    flexWrap: 'wrap',
    fontSize: 14,
    color: '#FC9916',
  },
  popDescriptionStyle: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  aphAlertCtaViewStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  ctaWhiteButtonViewStyle: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    marginRight: 15,
    marginVertical: 5,
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  textViewStyle: {
    padding: 8,
    marginRight: 15,
    marginVertical: 5,
  },
  cancelView: {
    position: 'absolute',
    height: height,
    width: width,
    flex: 1,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cancelSubView: { margin: 0, height: height, width: width, backgroundColor: 'transparent' },
  cancelSubView2: {
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
  ctaOrangeButtonViewStyle: { flex: 1, minHeight: 40, height: 'auto' },
  ctaOrangeTextStyle: {
    textAlign: 'center',
    ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
    marginHorizontal: 5,
  },
  hiTextStyle: {
    marginLeft: 20,
    marginTop: 27,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
  },
  nameTextContainerStyle: {
    maxWidth: '75%',
  },
  nameTextStyle: {
    marginLeft: 5,
    marginTop: 27,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(18),
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

export const AppointmentDetailsPhysical: React.FC<AppointmentDetailsProps> = (props) => {
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
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
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

  // const [consultStarted, setConsultStarted] = useState<boolean>(false);
  // const [sucesspopup, setSucessPopup] = useState<boolean>(false);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { getPatientApiCall } = useAuth();
  const minutes = moment.duration(moment(data.appointmentDateTime).diff(new Date())).asMinutes();

  useEffect(() => {
    getSecretaryData();
    if (!currentPatient) {
      console.log('No current patients available');
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
          console.log('nextAvailableSlot called');
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
    console.log('dateValidate', dateValidate);

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
          console.log(data, 'nextavailable res');
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
        console.log('Error occured while GetDoctorNextAvailableSlot', error);
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
          console.log('checfReschedulesuccess', result);
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
          console.log('Error occured while checkIfRescheduleprofile', error);
        })
        .finally(() => {
          setResheduleoverlay(true);
        });
    } catch (error) {
      CommonBugFender('AppointmentDetails_checkIfReschedule_try', error);
      setshowSpinner(false);
      console.log(error, 'error');
    }
  };
  const renderPrice = () => {
    return (
      <View>
        <Text style={styles.priceBreakupTitle}>{string.common.totalCharges}</Text>
        <View style={styles.seperatorLine} />
        <View style={styles.containerPay}>
          <View style={styles.rowContainerPay}>
            <Text style={styles.regularTextPay}>{string.common.toPay}</Text>
            <Text style={{ ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE) }}>
              {string.common.Rs}
              {g(data, 'appointmentPayments', '0' as any, 'amountPaid')}
            </Text>
          </View>
        </View>

        <Text style={[styles.priceBreakupTitle, { marginBottom: 10 }]}>
          {string.common.oneTimePhysicalCharge}
        </Text>
      </View>
    );
  };

  const renderPatient = () => {
    const patientc = allCurrentPatients?.filter((it) => it?.id === data?.patientId);
    return (
      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.priceBreakupTitle}>PATIENT DETAILS</Text>
        </View>
        <View style={styles.seperatorLine} />
        <Text
          style={[styles.specializationStyle, { marginLeft: 6, flexWrap: 'wrap', fontSize: 14 }]}
        >
          {g(patientc[0], 'firstName')} {g(patientc[0], 'lastName')}
        </Text>
        <Text
          style={[styles.specializationStyle, { marginLeft: 6, flexWrap: 'wrap', fontSize: 14 }]}
        >
          {Math.round(moment().diff(g(patientc[0], 'dateOfBirth') || 0, 'years', true))} ,
          {g(patientc[0], 'gender')}
        </Text>
      </View>
    );
  };

  const renderDoctorProfile = () => {
    return (
      <View>
        {data?.doctorInfo?.thumbnailUrl ? (
          <Image
            style={styles.doctorProfile}
            source={{
              uri: data.doctorInfo.thumbnailUrl!,
            }}
            resizeMode={'contain'}
          />
        ) : (
          <DoctorPlaceholderImage />
        )}
      </View>
    );
  };
  const renderDoctorCard = () => {
    return (
      <View>
        <View style={styles.rowContainerDoc}>
          <View style={{ width: width - 140 }}>
            <Text style={styles.doctorNameStyle}>{data?.doctorInfo?.displayName}</Text>
            <Text style={styles.specializationStyle}>
              {data?.doctorInfo?.qualification || ''} | {data?.doctorInfo?.experience} YR
              {Number(data?.doctorInfo?.experience) != 1 ? 'S Exp.' : ' Exp.'}
            </Text>

            <Text style={styles.appointmentTimeStyle}>{appointmentTime}</Text>
            <Text style={styles.regularText}></Text>
          </View>
          <View>
            <View>{renderDoctorProfile()}</View>
          </View>
        </View>

        <View style={{ width: width - 40 }}>
          <Text style={styles.priceBreakupTitle}>LOCATION</Text>
          <View style={styles.seperatorLine} />

          <View>
            <Text
              style={[styles.specializationStyle, { margin: 6, flexWrap: 'wrap', fontSize: 14 }]}
            >
              {data.doctorInfo?.doctorHospital?.[0]?.facility
                ? `${data?.doctorInfo?.doctorHospital?.[0]?.facility?.name}, ${data?.doctorInfo?.doctorHospital?.[0]?.facility?.streetLine1}`
                : ''}
              {'\n' + data?.doctorInfo?.doctorHospital?.[0]?.facility?.city}
            </Text>
            {Platform.OS === 'android' && (
              <TouchableOpacity onPress={() => openMaps()}>
                <Text style={[styles.specializationStyle, styles.mapsStyle]}>
                  https://www.google.com/maps/dir/
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const openMaps = () => {
    let query = `${data?.doctorInfo?.doctorHospital?.[0]?.facility?.name},
                                ${data?.doctorInfo?.doctorHospital?.[0]?.facility?.city}`;
    let url = `google.navigation:q=${query}`;

    try {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          setBugFenderLog('FAILED_OPEN_URL', url);
        }
      });
    } catch (e) {
      setBugFenderLog('FAILED_OPEN_URL', url);
    }
  };
  const rescheduleAPI = (availability: any) => {
    console.log('availability', availability);

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

    console.log(bookRescheduleInput, 'bookRescheduleInput');
    // if (!rescheduleApICalled) {
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
        postAppointmentWEGEvents('Rescheduled by Customer');
        console.log(data, 'data');
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
                    data?.data?.bookRescheduleAppointment?.appointmentDetails,
                  DoctorName:
                    props.navigation.state.params!.data &&
                    props.navigation.state.params!.data.doctorInfo &&
                    props.navigation.state.params!.data?.doctorInfo?.fullName,
                },
              }),
            ],
          })
        );
      })
      .catch((e) => {
        CommonBugFender('AppointmentDetails_rescheduleAPI', e);
        setBottompopup(true);
      });
    // }
  };
  const acceptChange = () => {
    try {
      console.log('acceptChange');
      setResheduleoverlay(false);
      AsyncStorage.setItem('showSchduledPopup', 'true');

      rescheduleAPI(availability);
    } catch (error) {
      CommonBugFender('AppointmentDetails_rescheduleAPI_try', error);
      console.log(error, 'error');
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

    console.log(appointmentTransferInput, 'appointmentTransferInput');

    client
      .mutate<cancelAppointment, cancelAppointmentVariables>({
        mutation: CANCEL_APPOINTMENT,
        variables: {
          cancelAppointmentInput: appointmentTransferInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        postAppointmentWEGEvents(WebEngageEventName.CONSULTATION_CANCELLED_BY_CUSTOMER);
        setshowSpinner(false);
        console.log(data, 'data');
        // setSucessPopup(true);
        showAppointmentCancellSuccessAlert();
      })
      .catch((e: any) => {
        CommonBugFender('AppointmentDetails_cancelAppointmentApi', e);
        setshowSpinner(false);
        console.log('Error occured while adding Doctor', e);
        const message = e.message ? e.message.split(':')[1].trim() : '';
        if (message == 'INVALID_APPOINTMENT_ID') {
          showAphAlert!({
            title: `Hi, ${(currentPatient && currentPatient?.firstName) || ''} :)`,
            description: 'Ongoing / Completed appointments cannot be cancelled.',
          });
        }
      });
  };

  const showAppointmentCancellSuccessAlert = () => {
    setShowCancelPopup(false);
    // setSucessPopup(false);
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
              padding: 20,
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
                {renderDoctorCard()}
                {renderPatient()}
                {renderPrice()}
              </View>
            </View>
          </View>
        </SafeAreaView>

        {cancelAppointment && (
          <View style={[styles.cancelView, { top: statusBarHeight() }]}>
            <TouchableOpacity
              onPress={() => {
                CommonLogEvent(AppRoutes.AppointmentDetails, 'AppointmentDetails Cancel Clicked');
                setCancelAppointment(false);
              }}
            >
              <View style={styles.cancelSubView}>
                <TouchableOpacity
                  onPress={() => {
                    setShowCancelPopup(true);
                    setCancelAppointment(false);
                  }}
                >
                  <View style={styles.cancelSubView2}>
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
            title={`Hi, ${(currentPatient && currentPatient?.firstName) || ''} :)`}
            description={
              "Since you're cancelling 15 minutes before your appointment, we'll issue you a full refund!"
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
            patientId={currentPatient ? currentPatient?.id : ''}
            clinics={doctorDetails.doctorHospital ? doctorDetails?.doctorHospital : []}
            doctorId={doctorDetails && doctorDetails?.id}
            renderTab={'Visit Clinic'}
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
            clinics={doctorDetails.doctorHospital ? doctorDetails?.doctorHospital : []}
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
