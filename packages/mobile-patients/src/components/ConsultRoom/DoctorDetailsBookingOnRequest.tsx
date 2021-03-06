import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_APPOINTMENT_HISTORY,
  GET_DOCTOR_DETAILS_BY_ID,
  GET_PLAN_DETAILS_BY_PLAN_ID,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getAppointmentHistory,
  getAppointmentHistory_getAppointmentHistory_appointmentsHistory,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentHistory';
import {
  getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_availabilityTitle,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { ConsultMode, DoctorType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  getNextAvailableSlots,
  getSecretaryDetailsByDoctor,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { FirebaseEventName } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  g,
  getNetStatus,
  postAppsFlyerEvent,
  postFirebaseEvent,
  postWebEngageEvent,
  statusBarHeight,
  timeDiffFromNow,
  setWebEngageScreenNames,
  getDoctorShareMessage,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import { AppsFlyerEventName, AppsFlyerEvents } from '../../helpers/AppsFlyerEvents';
import { BookingRequestCard } from '../ui/BookingRequestCard';
import { BookingRequestSubmittedOverlay } from '../ui/BookingRequestSubmittedOverlay';
import {
  ApolloDoctorIcon,
  ApolloPartnerIcon,
  DoctorPlaceholderImage,
  FamilyDoctorIcon,
  CTGrayChat,
  CircleLogo,
  ShareYellowDocIcon,
  CallRingIcon,
} from '../ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import moment from 'moment';
import {
  calculateCircleDoctorPricing,
  convertNumberToDecimal,
} from '@aph/mobile-patients/src/utils/commonUtils';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { CirclePlanAddedToCart } from '@aph/mobile-patients/src/components/ui/CirclePlanAddedToCart';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import { GetPlanDetailsByPlanId } from '@aph/mobile-patients/src/graphql/types/GetPlanDetailsByPlanId';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { DoctorShareComponent } from '@aph/mobile-patients/src/components/ConsultRoom/Components/DoctorShareComponent';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { BookingRequestOverlay } from '@aph/mobile-patients/src/components/ConsultRoom/BookingRequestOverlay';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  topView: {
    marginBottom: 8,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
    backgroundColor: theme.colors.WHITE,
  },
  detailsViewStyle: {
    margin: 20,
  },
  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 7,
    paddingTop: 0,
    flex: 1,
  },
  doctorSpecializationStyles: {
    paddingTop: 7,
    paddingBottom: 12,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  educationTextStyles: {
    paddingTop: 4,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.LIGHT_BLUE,
    letterSpacing: 0.3,
  },
  doctorLocation: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SEARCH_EDUCATION_COLOR,
    letterSpacing: 0.3,
    width: width - 120,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.SEPARATOR_LINE,
  },
  followUpChatMessageViewStyle: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 8,
  },
  followUpChatImageStyle: {
    marginTop: 4,
    width: 15.5,
    height: 13.5,
  },
  followUpChatMessageStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#225E6F',
    lineHeight: 18,
    flex: 1,
    marginLeft: 11.5,
  },
  followUpCallNumberStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#00B38E',
    lineHeight: 18,
    flex: 1,
    marginLeft: 11.5,
  },
  cardView: {
    width: '100%',
    marginVertical: 8,
    ...theme.viewStyles.cardContainer,
  },
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  labelStyle: {
    marginTop: 16,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansMedium(15),
  },
  onlineConsultView: {
    backgroundColor: theme.colors.WHITE,
    flexDirection: 'row',
    borderRadius: 10,
    paddingTop: 12,
  },
  consultModeCard: {
    width: (width - 42) / 2,
    alignSelf: 'center',
  },
  onlineConsultLabel: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 8,
  },
  onlineConsultAmount: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 16,
  },
  consultViewStyles: {
    flex: 1,
    backgroundColor: theme.colors.CARD_BG,
    borderRadius: 5,
    padding: 12,
    ...theme.viewStyles.shadowStyle,
    height: Platform.OS == 'android' ? 115 : 110,
  },
  careLogo: {
    width: 49,
    height: 26,
    alignSelf: 'center',
  },
  circleView: {
    backgroundColor: theme.colors.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    marginLeft: 'auto',
    marginRight: 20,
    marginTop: -46,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 5,
  },
  careLogoText: {
    ...theme.viewStyles.text('M', 11, 'white'),
  },
  carePrice: {
    ...theme.viewStyles.text('M', 15, theme.colors.BORDER_BOTTOM_COLOR),
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  careDiscountedPrice: {
    ...theme.viewStyles.text('M', 12, theme.colors.APP_YELLOW),
  },
  smallText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.APP_YELLOW,
    lineHeight: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallCareLogo: {
    height: 18,
    width: 30,
    marginHorizontal: 2.5,
  },
  smallInfo: {
    width: 10,
    height: 10,
    marginLeft: 3,
  },
  smallCareLogoText: {
    ...theme.viewStyles.text('M', 4, 'white'),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    width: 10,
    height: 10,
    marginLeft: 3,
  },
  upgradeContainer: {
    ...theme.viewStyles.card(),
    marginHorizontal: 33,
    height: 47,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.APP_YELLOW,
    marginTop: 5,
    marginBottom: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLogo: {
    width: 45,
    height: 27,
    marginHorizontal: 4,
  },
  linearGradient: {
    height: 63,
    width: '100%',
    justifyContent: 'center',
  },
  doctorOfTheHourTextStyle: {
    ...theme.viewStyles.text('SB', 13, '#FFFFFF', 1, 16.9, 0.3),
    textAlign: 'center',
    paddingTop: 4,
    paddingLeft: 20,
  },
  stickyBottomComponentStyle: {
    paddingTop: 0,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  buttonTextStyle: {
    ...theme.viewStyles.text('B', 13, theme.colors.WHITE, 1, 24),
    textTransform: 'uppercase',
  },
  doctorNameViewStyle: { flexDirection: 'row', justifyContent: 'space-between' },
  shareTextStyle: {
    ...theme.viewStyles.text('B', 12, theme.colors.APP_YELLOW, 1, 16),
    marginRight: 11,
  },
  shareViewStyle: { paddingLeft: 5, flexDirection: 'row', alignItems: 'center' },
  rectangularView: {
    position: 'absolute',
    width: (width - 42) / 2,
    flex: 2,
    left: -3,
    top: -2,
  },
  clinicImageContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginHorizontal: 8,
    shadowRadius: 2,
    width: width - 40,
    marginVertical: 8,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  clinicImageBlueText: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
  },
  clinicImageSkyBlueText: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
  },
  animatedView1: {
    position: 'absolute',
    height: 160,
    width: '100%',
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },
  animatedView2: {
    top: 0,
    height: 140,
    width: '100%',
  },
  headerContainer: {
    zIndex: 3,
    position: 'absolute',
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  doctorDetails: {
    height: 160,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docImagePlaceholder: {
    top: 0,
    height: 140,
    width: 140,
  },
  animatedImageV2: {
    top: 0,
    height: 140,
    width: 140,
    alignSelf: 'center',
  },
  doctorDetailsTopView: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apolloDocIcon: {
    marginVertical: 12,
    width: 80,
    height: 32,
  },
  docLocationViewHolder: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  BORButtonStyle: {
    width: '90%',
    margin: 20,
    backgroundColor: theme.colors.WHITE,
    shadowOffset: { width: 2, height: 4 },
  },
  BORButtonTextStyle: {
    ...theme.viewStyles.text('B', 13, '#FC9916', 1, 24),
    textTransform: 'uppercase',
  },
});
type Appointments = {
  date: string;
  type: string;
  symptoms: string[];
};

const Appointments: Appointments[] = [
  {
    date: '27 June, 6:30 pm',
    type: 'ONLINE CONSULT',
    symptoms: ['FEVER', 'COUGH & COLD'],
  },
  {
    date: '09 April, 3:00 pm',
    type: 'CLINIC VISIT',
    symptoms: ['FEVER', 'COUGH & COLD'],
  },
];

export interface DoctorDetailsBookingOnRequestProps extends NavigationScreenProps {}
export const DoctorDetailsBookingOnRequest: React.FC<DoctorDetailsBookingOnRequestProps> = (
  props
) => {
  const consultedWithDoctorBefore = props.navigation.getParam('consultedWithDoctorBefore');
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [submittedDisplayOverlay, setSubmittedDisplayOverlay] = useState<boolean>(false);
  const [follow_up_chat_message_visibility, set_follow_up_chat_message_visibility] = useState<
    boolean
  >(true);
  const [consultMode, setConsultMode] = useState<ConsultMode>(ConsultMode.ONLINE);
  const [onlineSelected, setOnlineSelected] = useState<boolean>(true);
  const [doctorDetails, setDoctorDetails] = useState<getDoctorDetailsById_getDoctorDetailsById>();
  const [
    ctaBannerText,
    setCtaBannerText,
  ] = useState<getDoctorDetailsById_getDoctorDetailsById_availabilityTitle | null>(null);
  const [appointmentHistory, setAppointmentHistory] = useState<
    getAppointmentHistory_getAppointmentHistory_appointmentsHistory[] | null
  >([]);
  const [doctorId, setDoctorId] = useState<string>(
    props.navigation.state.params ? props.navigation.state.params.doctorId : ''
  );
  const { currentPatient } = useAllCurrentPatients();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [scrollY] = useState(new Animated.Value(0));
  const [availableInMin, setavailableInMin] = useState<number>();
  const [availableTime, setavailableTime] = useState<string>('');
  const [physicalAvailableTime, setphysicalAvailableTime] = useState<string>('');
  const [membershipPlans, setMembershipPlans] = useState<any>([]);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const { getPatientApiCall } = useAuth();
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [isFocused, setisFocused] = useState<boolean>(false);
  const callSaveSearch = props.navigation.getParam('callSaveSearch');
  const [secretaryData, setSecretaryData] = useState<any>([]);
  const fromDeeplink = props.navigation.getParam('fromDeeplink');
  const mediaSource = props.navigation.getParam('mediaSource');
  const [showCirclePlans, setShowCirclePlans] = useState<boolean>(false);
  const circleDoctorDetails = calculateCircleDoctorPricing(doctorDetails);
  const [showDoctorSharePopup, setShowDoctorSharePopup] = useState<boolean>(false);
  const [requestErrorMessage, setRequestErrorMessage] = useState<string>('');
  const [requestError, setRequestError] = useState<boolean>(false);
  const { isCircleDoctor } = circleDoctorDetails;
  const {
    circleSubscriptionId,
    selectDefaultPlan,
    circlePlanSelected,
    defaultCirclePlan,
    showCircleSubscribed,
  } = useShoppingCart();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    getSecretaryData();
  }, []);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setisFocused(true);
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setisFocused(false);
    });
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
    };
  });

  const client = useApolloClient();

  const headMov = scrollY.interpolate({
    inputRange: [0, 180, 181],
    outputRange: [0, -105, -105],
  });
  const headColor = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['white', 'white'],
  });
  const imgOp = scrollY.interpolate({
    inputRange: [0, 180, 181],
    outputRange: [1, 0, 0],
  });

  useEffect(() => {
    if (isFocused) {
      setWebEngageScreenNames('Doctor Profile');
      getNetStatus()
        .then((status) => {
          if (status) {
            fetchDoctorDetails();
          } else {
            setshowSpinner(false);
            setshowOfflinePopup(true);
          }
        })
        .catch((e) => {
          CommonBugFender('DoctorDetails_getNetStatus', e);
        });
    }
  }, [isFocused]);

  useEffect(() => {
    const display = props.navigation.state.params
      ? props.navigation.state.params.showBookAppointment || false
      : false;
    setdisplayoverlay(display);
    setConsultMode(props.navigation.getParam('consultModeSelected'));
    setShowVideo(props.navigation.getParam('onVideoPressed'));
  }, [props.navigation.state.params]);

  const getSecretaryData = () => {
    getSecretaryDetailsByDoctor(client, doctorId)
      .then((apiResponse: any) => {
        const secretaryDetails = g(apiResponse, 'data', 'data', 'getSecretaryDetailsByDoctorId');
        setSecretaryData(secretaryDetails);
      })
      .catch((error) => {});
  };

  const fetchDoctorDetails = () => {
    const input = {
      id: doctorId,
    };
    client
      .query<getDoctorDetailsById>({
        query: GET_DOCTOR_DETAILS_BY_ID,
        variables: input,
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        try {
          if (data && data.getDoctorDetailsById && doctorDetails !== data.getDoctorDetailsById) {
            fromDeeplink && fireDeepLinkTriggeredEvent(data.getDoctorDetailsById);
            setDoctorDetails(data.getDoctorDetailsById);
            setDoctorId(data.getDoctorDetailsById.id);
            setCtaBannerText(data?.getDoctorDetailsById?.availabilityTitle);
            setshowSpinner(false);
          } else {
            setTimeout(() => {
              setshowSpinner(false);
            }, 1500);
          }
        } catch (e) {
          CommonBugFender('DoctorDetails_fetchDoctorDetails_try', e);
        }
      })
      .catch((e) => {
        props.navigation.goBack();
        CommonBugFender('DoctorDetails_fetchDoctorDetails', e);
        setshowSpinner(false);
      });
  };

  const fireDeepLinkTriggeredEvent = (doctorDetails: getDoctorDetailsById_getDoctorDetailsById) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DOCTOR_PROFILE_THROUGH_DEEPLINK] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient Age': Math.round(
        Moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Doctor ID': g(doctorDetails, 'id')!,
      'Doctor Name': g(doctorDetails, 'displayName')!,
      'Speciality Name': g(doctorDetails, 'specialty', 'name')!,
      'Speciality ID': g(doctorDetails, 'specialty', 'id')!,
      'Media Source': mediaSource,
    };
    postWebEngageEvent(WebEngageEventName.DOCTOR_PROFILE_THROUGH_DEEPLINK, eventAttributes);
  };

  const renderHowItWorks = (doctorDetails: getDoctorDetailsById_getDoctorDetailsById) => {
    return (
      <BookingRequestCard
        doctorName={doctorDetails?.displayName || ''}
        onPress={() => null}
        navigation={props.navigation}
      />
    );
  };

  const renderPlatinumDoctorView = () => {
    return (
      <LinearGradientComponent style={styles.linearGradient}>
        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          <FamilyDoctorIcon style={{ width: 16.58, height: 24 }} />
          <Text style={styles.doctorOfTheHourTextStyle}>
            {ctaBannerText?.DOCTOR_OF_HOUR || 'Doctor of the Hour!'}
          </Text>
        </View>
      </LinearGradientComponent>
    );
  };

  const postDoctorShareWEGEvents = (eventName: WebEngageEventName) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.SHARE_CLICK_DOC_LIST_SCREEN] = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Doctor ID': g(doctorDetails, 'id')!,
      'Doctor Name': g(doctorDetails, 'displayName')!,
      'Speciality Name': g(doctorDetails, 'specialty', 'name')!,
      'Speciality ID': g(doctorDetails, 'specialty', 'id')!,
    };
    postWebEngageEvent(eventName, eventAttributes);
  };

  const onClickDoctorShare = () => {
    setShowDoctorSharePopup(true);
    postDoctorShareWEGEvents(WebEngageEventName.SHARE_CLICKED_DOC_PROFILE_SCREEN);
  };

  const renderDoctorDetails = () => {
    if (doctorDetails && doctorDetails.doctorHospital && doctorDetails.doctorHospital.length > 0) {
      const doctorClinics = doctorDetails.doctorHospital.filter((item) => {
        if (item && item.facility && item.facility.facilityType)
          return item.facility.facilityType === 'HOSPITAL';
      });
      const clinicAddress =
        doctorClinics.length > 0 && doctorDetails.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.name}${doctorClinics[0].facility.name ? ', ' : ''}${
              doctorClinics[0].facility.city
            }`
          : '';
      const followUpChatMessage =
        doctorDetails.salutation +
        ' ' +
        doctorDetails.firstName +
        ' ' +
        string.consultType.follow_up_chat_message.replace(
          '{0}',
          g(doctorDetails, 'chatDays') ? g(doctorDetails, 'chatDays')!.toString() : '7'
        );

      return (
        <View style={styles.topView}>
          {doctorDetails?.doctorsOfTheHourStatus ? renderPlatinumDoctorView() : null}
          {doctorDetails && (
            <View style={styles.detailsViewStyle}>
              <View style={styles.doctorNameViewStyle}>
                <Text style={styles.doctorNameStyles}>{doctorDetails?.displayName}</Text>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => onClickDoctorShare()}
                  style={styles.shareViewStyle}
                >
                  <Text style={styles.shareTextStyle}>{'SHARE'}</Text>
                  <ShareYellowDocIcon style={{ width: 24, height: 24 }} />
                </TouchableOpacity>
              </View>
              <View style={styles.separatorStyle} />
              <Text style={styles.doctorSpecializationStyles}>
                {doctorDetails.specialty && doctorDetails.specialty.name
                  ? doctorDetails.specialty.name
                  : ''}{' '}
                | {doctorDetails.experience} YR{Number(doctorDetails.experience) == 1 ? '' : 'S'}{' '}
                EXP
              </Text>
              <Text style={styles.educationTextStyles}>{doctorDetails.qualification}</Text>
              <Text style={[styles.educationTextStyles, { paddingBottom: 12 }]}>
                {doctorDetails.awards
                  ? doctorDetails.awards.replace(/(<([^>]+)>)/gi, '').trim()
                  : ''}
              </Text>
              <View style={styles.separatorStyle} />
              <View style={styles.docLocationViewHolder}>
                <View>
                  {!!clinicAddress && (
                    <Text style={[styles.doctorLocation, { paddingTop: 11 }]}>{clinicAddress}</Text>
                  )}
                  {doctorDetails.languages ? (
                    <Text style={[styles.doctorLocation, { paddingBottom: 11, paddingTop: 4 }]}>
                      {doctorDetails.languages.split(',').join(' | ')}
                    </Text>
                  ) : null}
                </View>
                {doctorDetails.doctorType !== 'DOCTOR_CONNECT' ? (
                  <ApolloDoctorIcon style={styles.apolloDocIcon} />
                ) : (
                  <ApolloPartnerIcon style={styles.apolloDocIcon} />
                )}
              </View>

              <View style={styles.separatorStyle} />

              {/* ---- dont delete this, will be added in next version* -----/}
              {/* <View style={[styles.followUpChatMessageViewStyle, { marginBottom: -4 }]}>
                <CallRingIcon style={styles.followUpChatImageStyle} />
                <Text style={styles.followUpCallNumberStyle}>{'040-2211782'}</Text>
              </View> */}

              {follow_up_chat_message_visibility && (
                <View style={styles.followUpChatMessageViewStyle}>
                  <CTGrayChat style={styles.followUpChatImageStyle} />
                  <Text style={styles.followUpChatMessageStyle}>{followUpChatMessage}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      );
    }
    return null;
  };

  const renderDoctorClinic = () => {
    if (
      doctorDetails &&
      doctorDetails.doctorHospital &&
      doctorDetails.doctorHospital.length > 0 &&
      doctorDetails.doctorType !== DoctorType.PAYROLL
    ) {
      const doctorClinics = doctorDetails.doctorHospital;
      if (doctorClinics.length > 0)
        return (
          <View style={styles.cardView}>
            <View style={styles.labelView}>
              <Text style={styles.labelStyle}>{doctorDetails?.displayName}???s Clinic</Text>
            </View>
            <FlatList
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={{ margin: 12, paddingTop: 0 }}
              horizontal={true}
              data={doctorClinics}
              bounces={false}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => renderClinicDetails(item)}
            />
          </View>
        );
      return null;
    }
    return null;
  };

  const renderClinicDetails = (item: any) => {
    if (item) {
      const clinicHours =
        doctorDetails && doctorDetails.consultHours
          ? doctorDetails.consultHours.filter(
              (hours) =>
                hours &&
                hours.consultMode !== ConsultMode.ONLINE &&
                hours.facility &&
                hours.facility.id === item.facility.id
            )
          : [];
      return (
        <View>
          <View style={styles.clinicImageContainer}>
            <View
              style={{
                overflow: 'hidden',
                borderRadius: 10,
              }}
            >
              <Image
                source={
                  item && item.facility && item.facility.imageUrl
                    ? {
                        uri: item.facility.imageUrl,
                      }
                    : require('@aph/mobile-patients/src/images/apollo/Hospital_Image.webp')
                }
                style={{
                  height: 136,
                  width: '100%',
                }}
              />

              <View
                style={{
                  margin: 16,
                  marginTop: 10,
                }}
              >
                <Text style={styles.clinicImageBlueText}>
                  {item && item.facility.streetLine1}
                  {item && item.facility.streetLine2
                    ? `${item && item.facility.streetLine1 ? ', ' : ''}${item &&
                        item.facility.streetLine2}`
                    : ''}
                </Text>
                <Text style={styles.clinicImageBlueText}>
                  {item && item.facility && item.facility.city}
                </Text>
                {clinicHours.length > 0 && (
                  <>
                    <View style={[styles.separatorStyle, { marginVertical: 8 }]} />

                    {clinicHours.map((time) =>
                      time ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text style={styles.clinicImageSkyBlueText}>
                            {time.weekDay.toUpperCase()}
                          </Text>

                          <Text style={styles.clinicImageSkyBlueText}>
                            {formatTime(time.startTime)} - {formatTime(time.endTime)}
                          </Text>
                        </View>
                      ) : null
                    )}
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  const onPressShareProfileButton = async (doctorData: any) => {
    const shareDoctorMessage = getDoctorShareMessage(doctorData);
    try {
      const result = await Share.share({
        message: shareDoctorMessage,
      });
      if (result.action === Share.sharedAction) {
        postDoctorShareWEGEvents(WebEngageEventName.SHARE_PROFILE_CLICKED_DOC_PROFILE);
      }
    } catch (error) {}
  };

  const onPressGoBackShareDoctor = () => {
    setShowDoctorSharePopup(false);
    postDoctorShareWEGEvents(WebEngageEventName.GO_BACK_CLICKED_DOC_PROFILE);
  };

  const renderDoctorShareComponent = () => {
    return showDoctorSharePopup ? (
      <DoctorShareComponent
        doctorData={doctorDetails}
        fromDoctorDetails
        onPressGoBack={onPressGoBackShareDoctor}
        onPressSharePropfile={(doctorData) => onPressShareProfileButton(doctorData)}
        availableModes={doctorDetails?.availableModes}
      />
    ) : null;
  };

  const renderDoctorTeam = () => {
    if (doctorDetails && doctorDetails.starTeam && doctorDetails.starTeam.length > 0)
      return (
        <View style={styles.cardView}>
          <View style={styles.labelView}>
            <Text style={styles.labelStyle}>{doctorDetails?.displayName}???s Team</Text>
            <Text style={styles.labelStyle}>
              {doctorDetails.starTeam.length}
              {doctorDetails.starTeam.length == 1 ? ' Doctor' : ' Doctors'}
            </Text>
          </View>
          <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false}>
            <FlatList
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={{ padding: 12 }}
              data={doctorDetails.starTeam}
              bounces={false}
              numColumns={doctorDetails.starTeam ? Math.ceil(doctorDetails.starTeam.length / 2) : 0}
              renderItem={({ item }) => {
                if (item && item.associatedDoctor && item.associatedDoctor.id)
                  return (
                    <View style={{ width: width - 50 }} key={item.associatedDoctor.id}>
                      <DoctorCard
                        onPress={(doctorId) => {
                          CommonLogEvent(AppRoutes.DoctorDetails, 'Login clicked');
                          props.navigation.navigate(AppRoutes.AssociateDoctorDetails, {
                            doctorId: doctorId,
                          });
                        }}
                        rowData={item.associatedDoctor}
                        navigation={props.navigation}
                        displayButton={false}
                        style={{
                          marginVertical: 8,
                          marginHorizontal: 10,

                          shadowRadius: 3,
                        }}
                      />
                    </View>
                  );
                return null;
              }}
            />
          </ScrollView>
        </View>
      );
    return null;
  };

  const handleScroll = () => {};

  const postBookAppointmentWEGEvent = () => {
    const doctorClinics = ((doctorDetails && doctorDetails.doctorHospital) || []).filter((item) => {
      if (item && item.facility && item.facility.facilityType)
        return item.facility.facilityType === 'HOSPITAL';
    });

    const eventAttributes: WebEngageEvents[WebEngageEventName.BOOK_APPOINTMENT] = {
      'Doctor Name': g(doctorDetails, 'displayName')!,
      'Doctor City': g(doctorDetails, 'city')!,
      'Type of Doctor': g(doctorDetails, 'doctorType')!,
      'Doctor Specialty': g(doctorDetails, 'specialty', 'name')!,
      Source: 'Profile',
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        Moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      'Doctor ID': g(doctorDetails, 'id')!,
      'Speciality ID': g(doctorDetails, 'specialty', 'id')!,
      'Hospital Name':
        doctorClinics.length > 0 && doctorDetails!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.name}`
          : '',

      'Hospital City':
        doctorClinics.length > 0 && doctorDetails!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.city}`
          : '',
      'Secretary Name': g(secretaryData, 'name'),
      'Secretary Mobile Number': g(secretaryData, 'mobileNumber'),
      'Doctor Mobile Number': g(doctorDetails, 'mobileNumber')!,
    };
    postWebEngageEvent(WebEngageEventName.BOOK_APPOINTMENT, eventAttributes);
    const appsflyereventAttributes: AppsFlyerEvents[AppsFlyerEventName.BOOK_APPOINTMENT] = {
      'customer id': currentPatient ? currentPatient.id : '',
    };
    postAppsFlyerEvent(AppsFlyerEventName.BOOK_APPOINTMENT, appsflyereventAttributes);
    postFirebaseEvent(FirebaseEventName.BOOK_APPOINTMENT, eventAttributes);
  };

  const moveBack = () => {
    props.navigation.goBack();
  };

  const renderConsultNow = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomComponentStyle}>
        <Button
          style={styles.BORButtonStyle}
          titleTextStyle={styles.BORButtonTextStyle}
          title={'REQUEST APPOINTMENT'}
          onPress={() => onPressRequestAppointment()}
        />
      </StickyBottomComponent>
    );
  };

  const onPressRequestAppointment = () => {
    postBookAppointmentWEGEvent();
    getNetStatus()
      .then((status) => {
        if (status) {
          setdisplayoverlay(true);
          setConsultMode(ConsultMode.ONLINE);
        } else {
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorDetailsBookingOnRequest_getNetStatus', e);
      });
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <Animated.ScrollView
          bounces={false}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingTop: 160,
          }}
          onScroll={Animated.event(
            [
              {
                nativeEvent: { contentOffset: { y: scrollY } },
              },
            ],
            { listener: handleScroll }
          )}
        >
          {doctorDetails && renderDoctorDetails()}
          {doctorDetails && renderHowItWorks(doctorDetails)}
          {doctorDetails && renderDoctorClinic()}
          {doctorDetails && renderDoctorTeam()}
          <View style={{ height: 92 }} />
        </Animated.ScrollView>
        {doctorDetails && renderConsultNow()}
        {renderDoctorShareComponent()}
      </SafeAreaView>

      {displayoverlay && doctorDetails && (
        <BookingRequestOverlay
          setdisplayoverlay={(arg0: boolean, arg1: string, arg2: boolean) => {
            setRequestError(arg0);
            setRequestErrorMessage(arg1);
            setdisplayoverlay(arg2);
          }}
          onRequestComplete={(arg: boolean) => setSubmittedDisplayOverlay(arg)}
          navigation={props.navigation}
          doctor={doctorDetails}
          hospitalId={doctorDetails?.doctorHospital?.[0].facility.id}
        />
      )}
      {submittedDisplayOverlay && doctorDetails && (
        <BookingRequestSubmittedOverlay
          setdisplayoverlay={() => setSubmittedDisplayOverlay(false)}
          navigation={props.navigation}
          doctor={doctorDetails?.displayName || ''}
          error={requestError}
          errorMessage={requestErrorMessage || 'Something went wrong! \nPlease try again'}
        />
      )}
      <Animated.View
        style={[
          styles.animatedView1,
          {
            backgroundColor: headColor,
            transform: [{ translateY: headMov }],
            top: statusBarHeight(),
          },
        ]}
      >
        <View style={styles.doctorDetailsTopView}>
          {!showVideo && !!g(doctorDetails, 'photoUrl') ? (
            <>
              <View style={{ height: 20, width: '100%' }} />
              <Animated.View
                style={[
                  styles.animatedView2,
                  {
                    opacity: imgOp,
                  },
                ]}
              >
                <Animated.Image
                  source={{ uri: doctorDetails!.photoUrl }}
                  style={[styles.animatedImageV2, { opacity: imgOp }]}
                />
                {isCircleDoctor && (
                  <View style={styles.circleView}>
                    <CircleLogo style={styles.careLogo} />
                  </View>
                )}
              </Animated.View>
            </>
          ) : (
            !showVideo &&
            doctorDetails && (
              <View style={styles.doctorDetails}>
                <DoctorPlaceholderImage style={styles.docImagePlaceholder} />
              </View>
            )
          )}
        </View>
      </Animated.View>
      <Header
        container={[styles.headerContainer, { top: statusBarHeight() }]}
        leftIcon="backArrow"
        onPressLeftIcon={() => moveBack()}
      />
      {showSpinner && <Spinner />}
      {showOfflinePopup && (
        <NoInterNetPopup
          onClickClose={() => {
            setshowOfflinePopup(false);
            moveBack();
          }}
        />
      )}
    </View>
  );
};
