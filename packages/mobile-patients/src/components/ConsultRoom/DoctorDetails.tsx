import { ConsultOverlay } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultOverlay';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { AvailabilityCapsule } from '@aph/mobile-patients/src/components/ui/AvailabilityCapsule';
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
  nextAvailability,
  getDoctorShareMessage,
  getUserType,
  postWEGPatientAPIError,
  postCleverTapEvent,
  getTimeDiff,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
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
  Linking,
} from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import { AppsFlyerEventName, AppsFlyerEvents } from '../../helpers/AppsFlyerEvents';
import { useAppCommonData } from '../AppCommonDataProvider';
import { ConsultTypeCard } from '../ui/ConsultTypeCard';
import {
  ApolloDoctorIcon,
  ApolloPartnerIcon,
  DoctorPlaceholderImage,
  RectangularIcon,
  FamilyDoctorIcon,
  CTGrayChat,
  InfoBlue,
  CircleLogo,
  ShareYellowDocIcon,
  Tick,
  CallIcon,
  HospitalPhrIcon,
  VideoActiveIcon,
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
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { Tooltip } from 'react-native-elements';

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
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingTop: 12,
    flex: 1,
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
    flex: 0.5,
    backgroundColor: theme.colors.CARD_BG,
    borderRadius: 5,
    padding: 12,
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
    ...theme.viewStyles.text('B', 12, theme.colors.WHITE, 1, 24),
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
    flex: 1,
    left: -3,
    top: -2,
  },
  tickIcon: {
    height: 8,
    width: 8,
    marginStart: 4,
  },
  tooltipTitle: {
    ...theme.viewStyles.text('M', 13, theme.colors.APP_YELLOW),
  },
  tootipDesc: {
    ...theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE, undefined, 12),
    paddingTop: 4,
  },
  tipHcInfoText: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, undefined, 14),
    paddingTop: 4,
  },
  hcBoldText: {
    fontWeight: '500',
  },
  tooltipView: {
    backgroundColor: theme.colors.WHITE,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  onlineCardView: {
    width: 200,
  },
  availablityCapsuleText: {
    marginTop: -5,
    width: 140,
  },
  askApolloView: {
    position: 'absolute',
    end: 10,
    zIndex: 3,
  },
  askApolloNumber: {
    ...theme.viewStyles.text('M', 14, theme.colors.APP_YELLOW, undefined, 17),
  },
  callLogo: {
    height: 15,
    width: 15,
    marginEnd: 6,
  },
  horizontalView: {
    flexDirection: 'row',
  },
  animatedView: {
    position: 'absolute',
    height: 160,
    width: '100%',
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },
  headerView: {
    zIndex: 3,
    position: 'absolute',
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  onlineConsultButtonStyle1: {
    paddingHorizontal: 10,
    backgroundColor: theme.colors.GOLDEN,
  },
  onlineConsultButtonStyle2: {
    flex: 0.49,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  iconStyle: { width: 13, height: 16, marginRight: 7 },
  hospitalConsultStyle1: {
    backgroundColor: theme.colors.SKY_LIGHT_BLUE,
    paddingHorizontal: 10,
  },
  hospitalConsultStyle2: {
    flex: 0.49,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  borderStyle: { borderWidth: 0.4, height: 110, borderColor: '#B5B5B5' },
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

type AppointmentCleverTapAttribute = {
  source: CleverTapEvents[CleverTapEventName.CONSULT_DOCTOR_PROFILE_VIEWED]['Source'];
  appointmentCTA: CleverTapEvents[CleverTapEventName.CONSULT_DOCTOR_PROFILE_VIEWED]['Appointment CTA'];
};

export interface DoctorDetailsProps extends NavigationScreenProps {}
export const DoctorDetails: React.FC<DoctorDetailsProps> = (props) => {
  const consultedWithDoctorBefore = props.navigation.getParam('consultedWithDoctorBefore');
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [follow_up_chat_message_visibility, set_follow_up_chat_message_visibility] = useState<
    boolean
  >(true);
  const [consultMode, setConsultMode] = useState<ConsultMode>(ConsultMode.ONLINE);

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
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [scrollY] = useState(new Animated.Value(0));
  const [availableInMin, setavailableInMin] = useState<number>();
  const [availableTime, setavailableTime] = useState<string>('');
  const [physicalAvailableTime, setphysicalAvailableTime] = useState<string>('');
  const [membershipPlans, setMembershipPlans] = useState<any>([]);
  const [availableInMinPhysical, setavailableInMinPhysical] = useState<Number>();
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const { getPatientApiCall } = useAuth();
  const { VirtualConsultationFee, displayAskApolloNumber } = useAppCommonData();
  const [consultType, setConsultType] = useState<ConsultMode>(ConsultMode.BOTH);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [isFocused, setisFocused] = useState<boolean>(false);
  const callSaveSearch = props.navigation.getParam('callSaveSearch');
  const fromPastSearch = props.navigation.getParam('fromPastSearch') || false;
  const [secretaryData, setSecretaryData] = useState<any>([]);
  const fromDeeplink = props.navigation.getParam('fromDeeplink');
  const mediaSource = props.navigation.getParam('mediaSource');
  const cleverTapAppointmentAttributes: AppointmentCleverTapAttribute = props.navigation.getParam(
    'cleverTapAppointmentAttributes'
  );
  const [showCirclePlans, setShowCirclePlans] = useState<boolean>(false);
  const circleDoctorDetails = calculateCircleDoctorPricing(doctorDetails);
  const [showDoctorSharePopup, setShowDoctorSharePopup] = useState<boolean>(false);
  const callCleverTapEvent = useRef<boolean>(true);
  const consultModeSelected = props.navigation.getParam('consultModeSelected');
  const isPayrollDoctor = doctorDetails?.doctorType === DoctorType.PAYROLL;
  const {
    isCircleDoctor,
    physicalConsultMRPPrice,
    onlineConsultMRPPrice,
    onlineConsultSlashedPrice,
    physicalConsultSlashedPrice,
    cashbackEnabled,
    cashbackAmount,
    onlineConsultDiscountedPrice,
  } = circleDoctorDetails;
  const {
    circleSubscriptionId,
    selectDefaultPlan,
    circlePlanSelected,
    defaultCirclePlan,
    showCircleSubscribed,
    circleSubPlanId,
  } = useShoppingCart();
  const chatDays = doctorDetails?.chatDays;
  const isPhysical =
    doctorDetails &&
    doctorDetails?.availableModes?.filter(
      (consultMode: ConsultMode) => consultMode === ConsultMode.PHYSICAL
    );
  const isBoth =
    doctorDetails &&
    doctorDetails?.availableModes?.filter(
      (consultMode: ConsultMode) => consultMode === ConsultMode.BOTH
    );

  const [onlineSelected, setOnlineSelected] = useState<boolean>(true);

  const rectangularIconHeight = isCircleDoctor
    ? Platform.OS == 'android'
      ? showCircleSubscribed
        ? 176
        : 186
      : showCircleSubscribed
      ? 171
      : 181
    : Platform.OS == 'android'
    ? 156
    : 151;

  const consultViewHeight = isCircleDoctor
    ? Platform.OS == 'android'
      ? showCircleSubscribed
        ? 149
        : 159
      : showCircleSubscribed
      ? 144
      : 154
    : Platform.OS == 'android'
    ? 131
    : 126;

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  useEffect(() => {
    getSecretaryData();
  }, []);

  useEffect(() => {
    fetchCarePlans();
  }, [isCircleDoctor]);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setisFocused(true);
      fetchCarePlans();
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setisFocused(false);
    });
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
    };
  });

  const fetchCarePlans = async () => {
    if (isCircleDoctor && !circleSubscriptionId && !circlePlanSelected) {
      try {
        const res = await client.query<GetPlanDetailsByPlanId>({
          query: GET_PLAN_DETAILS_BY_PLAN_ID,
          fetchPolicy: 'no-cache',
          variables: {
            plan_id: AppConfig.Configuration.CIRCLE_PLAN_ID,
          },
        });
        const membershipPlans = res?.data?.GetPlanDetailsByPlanId?.response?.plan_summary;
        if (membershipPlans) {
          setMembershipPlans(membershipPlans);
          selectDefaultPlan && selectDefaultPlan(membershipPlans);
        }
        res?.data?.GetPlanDetailsByPlanId
          ? null
          : postWEGPatientAPIError(
              currentPatient,
              '',
              'DoctorDetails',
              'GET_PLAN_DETAILS_BY_PLAN_ID',
              JSON.stringify(res)
            );
      } catch (error) {
        postWEGPatientAPIError(
          currentPatient,
          '',
          'DoctorDetails',
          'GET_PLAN_DETAILS_BY_PLAN_ID',
          JSON.stringify(error)
        );
        CommonBugFender('CircleMembershipPlans_GetPlanDetailsByPlanId', error);
      }
    }
  };

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
    setWebEngageScreenNames('Doctor Profile');
    getNetStatus()
      .then((status) => {
        if (status) {
          fetchDoctorDetails();
          fetchAppointmentHistory();
        } else {
          setshowSpinner(false);
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorDetails_getNetStatus', e);
      });

    let trimmedDoctorId = doctorId;
    if (doctorId.length > 36) {
      // trimming off doctorId if greater the uuid size
      trimmedDoctorId = doctorId.substring(doctorId.length - 36);
      setDoctorId(trimmedDoctorId);
    }
  }, []);

  useEffect(() => {
    getNetStatus()
      .then((status) => {
        if (status) {
          fetchDoctorDetails();
          fetchAppointmentHistory();
        } else {
          setshowSpinner(false);
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorDetails_getNetStatus', e);
      });
  }, [doctorId]);

  useEffect(() => {
    const display = props.navigation.state.params
      ? props.navigation.state.params.showBookAppointment || false
      : false;
    setdisplayoverlay(display);
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

  const fetchAppointmentHistory = () => {
    client
      .query<getAppointmentHistory>({
        query: GET_APPOINTMENT_HISTORY,
        variables: {
          appointmentHistoryInput: {
            patientId: currentPatient ? currentPatient.id : '',
            doctorId: doctorId ? doctorId : '',
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        try {
          if (
            data &&
            data.getAppointmentHistory &&
            appointmentHistory !== data.getAppointmentHistory.appointmentsHistory
          ) {
            setAppointmentHistory(data.getAppointmentHistory.appointmentsHistory);
          }
        } catch (e) {
          CommonBugFender('DoctorDetails_fetchAppointmentHistory_try', e);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorDetails_fetchAppointmentHistory', e);
      });
  };

  const todayDate = new Date().toISOString().slice(0, 10);

  const fetchNextAvailableSlots = (doctorIds: string[]) => {
    getNextAvailableSlots(client, doctorIds, todayDate)
      .then(({ data }: any) => {
        try {
          if (data && availableInMin === undefined) {
            const nextSlot = data ? g(data[0], 'availableSlot') : null;
            const nextPhysicalSlot = data ? g(data[0], 'physicalAvailableSlot') : null;
            if (nextSlot) {
              setavailableTime(nextSlot);
              const timeDiff: Number = timeDiffFromNow(nextSlot);
              setavailableInMin(timeDiff);
            }
            if (nextPhysicalSlot) {
              setphysicalAvailableTime(nextPhysicalSlot);
              const timeDiff: Number = timeDiffFromNow(nextPhysicalSlot);
              setavailableInMinPhysical(timeDiff);
            }
          }
        } catch (error) {
          CommonBugFender('DoctorDetails_fetchNextAvailableSlots_try', error);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorDetails_fetchNextAvailableSlots', e);
        setshowSpinner(false);
      });
  };

  const fetchDoctorDetails = () => {
    //the obtained uuid is not valid, it is the obtained deeplink slug
    if (doctorId.length > 36) {
      return;
    }
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
            (cleverTapAppointmentAttributes || fromDeeplink || fromPastSearch) &&
              fireDeepLinkTriggeredEvent(data.getDoctorDetailsById);
            setDoctorDetails(data.getDoctorDetailsById);
            setDoctorId(data.getDoctorDetailsById.id);
            setCtaBannerText(data?.getDoctorDetailsById?.availabilityTitle);
            setshowSpinner(false);
            fetchNextAvailableSlots([data.getDoctorDetailsById.id]);
            setAvailableModes(data.getDoctorDetailsById);
            setConsultMode(data.getDoctorDetailsById.availableModes[0]);
          } else {
            setTimeout(() => {
              setshowSpinner(false);
              navigateToSpecialitySearch();
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
      User_Type: getUserType(allCurrentPatients),
    };
    const {
      onlineConsultDiscountedPrice,
      cashbackEnabled,
      cashbackAmount,
    } = calculateCircleDoctorPricing(doctorDetails);
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_DOCTOR_PROFILE_VIEWED] = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient age': Math.round(
        Moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile number': g(currentPatient, 'mobileNumber'),
      'Doctor ID': g(doctorDetails, 'id')!,
      'Doctor name': g(doctorDetails, 'displayName')!,
      'Speciality name': g(doctorDetails, 'specialty', 'name')!,
      'Speciality ID': g(doctorDetails, 'specialty', 'id')!,
      Experience: String(doctorDetails?.experience) || '',
      'Media source': mediaSource,
      User_Type: getUserType(allCurrentPatients),
      Fee: Number(doctorDetails?.onlineConsultationFees),
      Source: cleverTapAppointmentAttributes?.source
        ? cleverTapAppointmentAttributes?.source
        : fromPastSearch
        ? 'Past search clicked'
        : 'Deeplink',
      'Doctor card clicked': 'No',
      Rank: 'NA',
      Languages: doctorDetails?.languages || '',
      Is_TopDoc: doctorDetails?.doctorsOfTheHourStatus ? 'Yes' : 'No',
      DOTH: doctorDetails?.doctorsOfTheHourStatus ? 'T' : 'F',
      'Doctor tab': 'NA',
      'Doctor category': doctorDetails?.doctorType,
      'Search screen': 'NA',
      'Appointment CTA': cleverTapAppointmentAttributes?.appointmentCTA || 'NA',
      'Customer ID': g(currentPatient, 'id'),
      'Available in mins': 'NA',
      Relation: g(currentPatient, 'relation'),
      'Circle Membership added': String(!!circlePlanSelected),
      'Circle discount': onlineConsultDiscountedPrice ? onlineConsultDiscountedPrice : 0,
      'Circle Cashback': cashbackEnabled ? cashbackAmount! : 0,
      'Doctor city': doctorDetails?.doctorHospital[0]?.facility?.city || '',
      'Hospital name': doctorDetails?.doctorHospital[0]?.facility?.name || '',
    };
    fromDeeplink &&
      postWebEngageEvent(WebEngageEventName.DOCTOR_PROFILE_THROUGH_DEEPLINK, eventAttributes);
    !displayoverlay &&
      callCleverTapEvent.current &&
      postCleverTapEvent(
        CleverTapEventName.CONSULT_DOCTOR_PROFILE_VIEWED,
        cleverTapEventAttributes
      );
    if (fromPastSearch) {
      const cleverTapPastSearchEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_PAST_SEARCHES_CLICKED] = {
        'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        'Patient UHID': g(currentPatient, 'uhid'),
        'Patient age': Math.round(
          Moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
        ),
        'Patient gender': g(currentPatient, 'gender'),
        'Doctor ID': g(doctorDetails, 'id')!,
        'Doctor name': g(doctorDetails, 'displayName')!,
        'Specialty name': g(doctorDetails, 'specialty', 'name')! || undefined,
        'Specialty ID': g(doctorDetails, 'specialty', 'id')! || undefined,
        User_Type: getUserType(allCurrentPatients),
        fee: Number(doctorDetails?.onlineConsultationFees),
        'Hospital City': g(doctorDetails, 'doctorHospital', 0, 'facility', 'city') || undefined,
        'Doctor hospital': g(doctorDetails, 'doctorHospital', 0, 'facility', 'name') || undefined,
        Languages: g(doctorDetails, 'languages') || undefined,
        'Customer ID': currentPatient?.id || '',
        'Circle Member': !!circleSubscriptionId,
        'Circle Plan type': circleSubPlanId,
        'Mobile number': currentPatient?.mobileNumber || '',
      };
      callCleverTapEvent.current &&
        postCleverTapEvent(
          CleverTapEventName.CONSULT_PAST_SEARCHES_CLICKED,
          cleverTapPastSearchEventAttributes
        );
    }
    callCleverTapEvent.current = false;
  };

  const setAvailableModes = (availabilityMode: any) => {
    const modeOfConsult = availabilityMode.availableModes;
    let availabileMode = modeOfConsult[0];
    try {
      if (modeOfConsult.includes(ConsultMode.BOTH)) {
        setConsultType(ConsultMode.BOTH);
        if (availabileMode === ConsultMode.PHYSICAL) set_follow_up_chat_message_visibility(false);
      } else if (modeOfConsult.includes(ConsultMode.ONLINE)) {
        setConsultType(ConsultMode.ONLINE);
      } else if (modeOfConsult.includes(ConsultMode.PHYSICAL)) {
        setConsultType(ConsultMode.PHYSICAL);
        set_follow_up_chat_message_visibility(false);
      } else {
        setConsultType(ConsultMode.BOTH);
      }
      availabileMode &&
        setOnlineSelected(
          ConsultMode.BOTH === availabileMode
            ? true
            : ConsultMode.ONLINE === availabileMode
            ? true
            : false
        );
    } catch (error) {}
  };

  const navigateToSpecialitySearch = () => {
    navigateToScreenWithEmptyStack(props.navigation, AppRoutes.DoctorSearch);
  };

  const formatTime = (time: string) => {
    const IOSFormat = `${todayDate}T${time}.000Z`;
    return Moment(new Date(IOSFormat), 'HH:mm:ss.SSSz').format('hh:mm A');
  };

  const renderConsultType = () => {
    return (
      <ConsultTypeCard
        isOnlineSelected={onlineSelected}
        DoctorId={doctorId}
        chatDays={chatDays}
        DoctorName={doctorDetails ? doctorDetails?.displayName : ''}
        nextAppointemntOnlineTime={availableTime}
        nextAppointemntInPresonTime={physicalAvailableTime}
        circleDoctorDetails={circleDoctorDetails}
        navigation={props.navigation}
        availNowText={ctaBannerText?.AVAILABLE_NOW || ''}
        consultNowText={ctaBannerText?.CONSULT_NOW || ''}
        circleEventSource={'VC Doctor Profile'}
      />
    );
  };

  const openConsultPopup = (consultType: ConsultMode) => {
    postBookAppointmentWEGEvent();
    getNetStatus()
      .then((status) => {
        if (status) {
          setdisplayoverlay(true);
          setConsultMode(consultType);
        } else {
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorDetails_getNetStatus', e);
      });
  };

  const renderCareDoctorPricing = (consultType: ConsultMode) => {
    return (
      <View style={{ paddingBottom: showCircleSubscribed ? 16 : 3, alignItems: 'center' }}>
        <Text
          style={[
            styles.carePrice,
            {
              textDecorationLine:
                showCircleSubscribed && (!cashbackEnabled || consultType === ConsultMode.PHYSICAL)
                  ? 'line-through'
                  : 'none',
              ...theme.viewStyles.text(
                'M',
                15,
                showCircleSubscribed && (!cashbackEnabled || consultType === ConsultMode.PHYSICAL)
                  ? theme.colors.BORDER_BOTTOM_COLOR
                  : theme.colors.LIGHT_BLUE
              ),
            },
          ]}
        >
          {string.common.Rs}
          {consultType === ConsultMode.ONLINE
            ? convertNumberToDecimal(onlineConsultMRPPrice)
            : convertNumberToDecimal(physicalConsultMRPPrice)}
        </Text>
        <View style={styles.rowContainer}>
          <Tooltip
            containerStyle={styles.tooltipView}
            height={126}
            width={264}
            skipAndroidStatusBar={true}
            toggleOnPress={!!cashbackEnabled}
            pointerColor={theme.colors.WHITE}
            overlayColor={theme.colors.CLEAR}
            popover={
              <View>
                <Text style={styles.tooltipTitle}>{string.common.whatIsHc}</Text>
                <Text style={styles.tootipDesc}>
                  {string.common.hcShort}
                  <Text style={styles.hcBoldText}>{string.common.healthCredit}</Text>
                  {string.common.hcInfo}
                </Text>
                <Text style={styles.tipHcInfoText}>{string.common.hcToRupee}</Text>
              </View>
            }
          >
            <Text style={styles.careDiscountedPrice}>
              {consultType === ConsultMode.PHYSICAL
                ? string.common.Rs + convertNumberToDecimal(physicalConsultSlashedPrice)
                : cashbackEnabled
                ? `Upto ${cashbackAmount} HC`
                : string.common.Rs + convertNumberToDecimal(onlineConsultSlashedPrice)}
            </Text>
          </Tooltip>
          {showCircleSubscribed ? (
            consultType === ConsultMode.PHYSICAL ? (
              <CircleLogo style={[styles.smallCareLogo, { height: 17 }]} />
            ) : cashbackEnabled ? (
              <Tick style={styles.tickIcon} />
            ) : (
              <CircleLogo style={[styles.smallCareLogo, { height: 17 }]} />
            )
          ) : null}
        </View>
        {!showCircleSubscribed ? (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.row}
            onPress={() => openCircleWebView()}
          >
            <Text style={styles.smallText}>for</Text>
            <CircleLogo style={styles.smallCareLogo} />
            <Text style={styles.smallText}>members</Text>
            <InfoBlue style={styles.smallInfo} />
          </TouchableOpacity>
        ) : null}
        {showCircleSubscribed && consultType === ConsultMode.ONLINE && cashbackEnabled && (
          <View style={styles.rowContainer}>
            <Text style={styles.smallText}>as a</Text>
            <CircleLogo style={styles.smallCareLogo} />
            <Text style={styles.smallText}>members</Text>
          </View>
        )}
      </View>
    );
  };

  const openCircleWebView = () => {
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: AppConfig.Configuration.CIRCLE_CONSULT_URL,
      circleEventSource: 'VC Doctor Profile',
    });
    circlePlanWebEngage(WebEngageEventName.VC_NON_CIRCLE_KNOWMORE_PROFILE);
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

  const postDoctorShareCleverTapEvents = (eventName: WebEngageEventName | CleverTapEventName) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.SHARE_CLICK_DOC_LIST_SCREEN]
      | CleverTapEvents[CleverTapEventName.CONSULT_SHARE_ICON_CLICKED] = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile number': g(currentPatient, 'mobileNumber'),
      'Doctor ID': g(doctorDetails, 'id')!,
      'Doctor name': g(doctorDetails, 'displayName')!,
      'Speciality name': g(doctorDetails, 'specialty', 'name')!,
      'Speciality ID': g(doctorDetails, 'specialty', 'id')!,
      Source: 'Doctor profile',
    };
    postWebEngageEvent(eventName, eventAttributes);
    postCleverTapEvent(eventName, eventAttributes);
  };

  const onClickDoctorShare = () => {
    setShowDoctorSharePopup(true);
    postDoctorShareCleverTapEvents(WebEngageEventName.SHARE_CLICKED_DOC_PROFILE_SCREEN);
    postDoctorShareCleverTapEvents(CleverTapEventName.CONSULT_SHARE_ICON_CLICKED);
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
          '{0} days',
          `${chatDays} day${chatDays && Number(chatDays) > 1 ? 's' : ''}`
        );

      return (
        <View style={styles.topView}>
          {doctorDetails?.doctorsOfTheHourStatus ? renderPlatinumDoctorView() : null}
          {doctorDetails && (
            <View style={styles.detailsViewStyle}>
              <View style={styles.doctorNameViewStyle}>
                <Text style={styles.doctorNameStyles}>{doctorDetails?.displayName}</Text>
                <TouchableOpacity
                  activeOpacity={1}
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
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  {!!clinicAddress && (
                    <Text style={[styles.doctorLocation, { paddingTop: 11, width: width - 120 }]}>
                      {clinicAddress}
                    </Text>
                  )}
                  {doctorDetails.languages ? (
                    <Text
                      style={[
                        styles.doctorLocation,
                        { paddingBottom: 11, paddingTop: 4, width: width - 120 },
                      ]}
                    >
                      {doctorDetails.languages.split(',').join(' | ')}
                    </Text>
                  ) : null}
                </View>
                {doctorDetails.doctorType !== 'DOCTOR_CONNECT' ? (
                  <ApolloDoctorIcon style={{ marginVertical: 12, width: 80, height: 32 }} />
                ) : (
                  <ApolloPartnerIcon style={{ marginVertical: 12, width: 80, height: 32 }} />
                )}
              </View>
              <View style={styles.separatorStyle} />
              {follow_up_chat_message_visibility && chatDays && Number(chatDays) > 0 ? (
                <View style={styles.followUpChatMessageViewStyle}>
                  <CTGrayChat style={styles.followUpChatImageStyle} />
                  <Text style={styles.followUpChatMessageStyle}>{followUpChatMessage}</Text>
                </View>
              ) : null}
              <View
                style={[
                  styles.onlineConsultView,
                  (isBoth?.length > 0 || isPhysical?.length === 0) &&
                  !isPayrollDoctor &&
                  (isBoth?.length > 0 || isPhysical?.length > 0)
                    ? {
                        ...theme.viewStyles.shadowStyle,
                        backgroundColor: theme.colors.CARD_BG,
                      }
                    : {},
                  { justifyContent: isPhysical?.length ? 'center' : 'flex-start' },
                  isPayrollDoctor || (isBoth?.length === 0 && isPhysical?.length === 0)
                    ? styles.consultModeCard
                    : {},
                ]}
              >
                {isBoth?.length > 0 || isPhysical?.length === 0 ? (
                  <View
                    style={[
                      styles.consultViewStyles,
                      !isPayrollDoctor && (isBoth?.length > 0 || isPhysical?.length > 0)
                        ? { flex: 0.5 }
                        : { flex: 1, ...theme.viewStyles.shadowStyle },
                      {
                        height: consultViewHeight,
                      },
                    ]}
                  >
                    <View style={{ height: consultViewHeight }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={styles.onlineConsultLabel}>Video Consult</Text>
                        {isCircleDoctor && onlineConsultMRPPrice > 0 ? (
                          renderCareDoctorPricing(ConsultMode.ONLINE)
                        ) : (
                          <Text style={styles.onlineConsultAmount}>
                            {Number(VirtualConsultationFee) <= 0 ||
                            VirtualConsultationFee === doctorDetails.onlineConsultationFees ? (
                              <Text>{`${string.common.Rs}${convertNumberToDecimal(
                                doctorDetails?.onlineConsultationFees
                              )}`}</Text>
                            ) : (
                              <>
                                <Text
                                  style={{
                                    textDecorationLine: 'line-through',
                                    textDecorationStyle: 'solid',
                                  }}
                                >
                                  {`(${string.common.Rs}${convertNumberToDecimal(
                                    doctorDetails?.onlineConsultationFees
                                  )})`}
                                </Text>
                                <Text>
                                  {' '}
                                  {string.common.Rs}
                                  {convertNumberToDecimal(VirtualConsultationFee)}
                                </Text>
                              </>
                            )}
                          </Text>
                        )}
                        <AvailabilityCapsule
                          titleTextStyle={{ paddingHorizontal: 7 }}
                          styles={styles.availablityCapsuleText}
                          availableTime={availableTime}
                          availNowText={ctaBannerText?.AVAILABLE_NOW || ''}
                        />
                      </View>
                    </View>
                  </View>
                ) : null}
                {(isBoth?.length > 0 || isPhysical?.length === 0) &&
                !isPayrollDoctor &&
                (isBoth?.length > 0 || isPhysical?.length > 0) ? (
                  <View style={styles.borderStyle} />
                ) : null}
                {!isPayrollDoctor && (isBoth?.length > 0 || isPhysical?.length > 0) ? (
                  <View
                    style={[
                      styles.consultViewStyles,
                      isBoth?.length > 0 || isPhysical?.length === 0
                        ? {}
                        : {
                            ...theme.viewStyles.shadowStyle,
                          },
                      {
                        height: consultViewHeight,
                      },
                    ]}
                  >
                    <View
                      style={{ height: consultViewHeight, marginRight: 6, alignItems: 'center' }}
                    >
                      <View style={{ alignItems: 'center' }}>
                        <Text style={styles.onlineConsultLabel}>
                          {string.consultModeTab.HOSPITAL_VISIT}
                        </Text>
                        {isCircleDoctor && physicalConsultMRPPrice > 0 ? (
                          renderCareDoctorPricing(ConsultMode.PHYSICAL)
                        ) : (
                          <Text style={styles.onlineConsultAmount}>
                            {string.common.Rs}
                            {convertNumberToDecimal(doctorDetails?.physicalConsultationFees)}
                          </Text>
                        )}
                        <AvailabilityCapsule
                          titleTextStyle={{ paddingHorizontal: 7 }}
                          styles={{ marginTop: cashbackEnabled ? 12 : -5 }}
                          availableTime={physicalAvailableTime}
                          availNowText={ctaBannerText?.AVAILABLE_NOW || ''}
                        />
                      </View>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          )}
          {isCircleDoctor && !showCircleSubscribed && defaultCirclePlan && renderUpgradeToCircle()}
          {isCircleDoctor &&
            !defaultCirclePlan &&
            circlePlanSelected &&
            renderCirclePlanAddedToCartView()}
          {isCircleDoctor && showCirclePlans && renderCirclePlans()}
        </View>
      );
    }
    return null;
  };

  const onPressMeetInPersonCard = () => {
    set_follow_up_chat_message_visibility(false);
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.TYPE_OF_CONSULT_SELECTED]
      | CleverTapEvents[CleverTapEventName.CONSULT_MODE_SELECTED] = {
      'Doctor Speciality': g(doctorDetails, 'specialty', 'name')!,
      'Speciality name': g(doctorDetails, 'specialty', 'name')!,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        Moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
      'Doctor ID': g(doctorDetails, 'id')!,
      'Speciality ID': g(doctorDetails, 'specialty', 'id')!,
      'Consultation type': 'physical',
      User_Type: getUserType(allCurrentPatients),
      'Circle Member': !!circleSubscriptionId,
      'Circle Plan type': circleSubPlanId || undefined,
      'Mobile number': currentPatient?.mobileNumber || undefined,
    };
    postWebEngageEvent(WebEngageEventName.TYPE_OF_CONSULT_SELECTED, eventAttributes);
    postCleverTapEvent(CleverTapEventName.CONSULT_MODE_SELECTED, eventAttributes);
    !isPayrollDoctor && setOnlineSelected(false);
    onPressConsultNow(false);
  };

  const onPressVideoConsult = () => {
    setOnlineSelected(true);
    set_follow_up_chat_message_visibility(true);
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.TYPE_OF_CONSULT_SELECTED]
      | CleverTapEvents[CleverTapEventName.CONSULT_MODE_SELECTED] = {
      'Doctor Speciality': g(doctorDetails, 'specialty', 'name')!,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        Moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
      'Doctor ID': g(doctorDetails, 'id')!,
      'Speciality ID': g(doctorDetails, 'specialty', 'id')!,
      'Consultation Type': 'online',
    };
    postWebEngageEvent(WebEngageEventName.TYPE_OF_CONSULT_SELECTED, eventAttributes);
    postCleverTapEvent(CleverTapEventName.CONSULT_MODE_SELECTED, eventAttributes);
    onPressConsultNow();
  };

  const circlePlanWebEngage = (eventName: any) => {
    const eventAttributes = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        Moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(eventName, eventAttributes);
  };

  const renderUpgradeToCircle = () => {
    return (
      <TouchableOpacity
        style={styles.upgradeContainer}
        onPress={() => {
          setShowCirclePlans(true);
          circlePlanWebEngage(WebEngageEventName.VC_NON_CIRCLE_ADDS_PROFILE);
        }}
      >
        <Text style={{ ...theme.viewStyles.text('SB', 11, theme.colors.APP_YELLOW, 1, 14) }}>
          UPGRADE TO
        </Text>
        <CircleLogo style={styles.circleLogo} />
        <Text style={{ ...theme.viewStyles.text('M', 10, theme.colors.LIGHT_BLUE, 1, 14) }}>
          Starting at {string.common.Rs}
          {convertNumberToDecimal(defaultCirclePlan?.currentSellingPrice) || '-'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCirclePlanAddedToCartView = () => (
    <CirclePlanAddedToCart style={{ marginBottom: 15 }} />
  );

  const renderCirclePlans = () => {
    return (
      <CircleMembershipPlans
        isModal={true}
        navigation={props.navigation}
        membershipPlans={membershipPlans}
        closeModal={() => setShowCirclePlans(false)}
        isConsultJourney={true}
        from={string.banner_context.VC_DOCTOR_PROFILE}
        circleEventSource={'VC Doctor Profile'}
      />
    );
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
              <Text style={styles.labelStyle}>
                {doctorDetails?.displayName}’s location for physical visits
              </Text>
            </View>
            <FlatList
              keyExtractor={(_, index) => index.toString()}
              contentContainerStyle={{ margin: 12, paddingTop: 0 }}
              horizontal={true}
              data={doctorClinics}
              bounces={false}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
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
                      <View
                        style={{
                          ...theme.viewStyles.cardViewStyle,
                          marginHorizontal: 8,
                          shadowRadius: 2,
                          width: 320,
                          marginVertical: 8,
                        }}
                      >
                        <View
                          style={{
                            overflow: 'hidden',
                            borderRadius: 10,
                          }}
                        >
                          {/* {clinic.image && ( */}
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
                          {/* )} */}

                          <View
                            style={{
                              margin: 16,
                              marginTop: 10,
                            }}
                          >
                            <Text
                              style={{
                                ...theme.fonts.IBMPlexSansMedium(14),
                                color: theme.colors.LIGHT_BLUE,
                              }}
                            >
                              {item && item.facility.streetLine1}
                              {item && item.facility.streetLine2
                                ? `${item && item.facility.streetLine1 ? ', ' : ''}${item &&
                                    item.facility.streetLine2}`
                                : ''}
                            </Text>
                            <Text
                              style={{
                                ...theme.fonts.IBMPlexSansMedium(14),
                                color: theme.colors.LIGHT_BLUE,
                              }}
                            >
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
                                      <Text
                                        style={{
                                          ...theme.fonts.IBMPlexSansSemiBold(12),
                                          color: theme.colors.SKY_BLUE,
                                        }}
                                      >
                                        {time.weekDay.toUpperCase()}
                                      </Text>

                                      <Text
                                        style={{
                                          ...theme.fonts.IBMPlexSansSemiBold(12),
                                          color: theme.colors.SKY_BLUE,
                                        }}
                                      >
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
              }}
            />
          </View>
        );
      return null;
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
        postDoctorShareCleverTapEvents(WebEngageEventName.SHARE_PROFILE_CLICKED_DOC_PROFILE);
        postDoctorShareCleverTapEvents(CleverTapEventName.CONSULT_SHARE_PROFILE_CLICKED);
      }
    } catch (error) {}
  };

  const onPressGoBackShareDoctor = () => {
    setShowDoctorSharePopup(false);
    postDoctorShareCleverTapEvents(WebEngageEventName.GO_BACK_CLICKED_DOC_PROFILE);
    postDoctorShareCleverTapEvents(CleverTapEventName.CONSULT_GO_BACK_CLICKED);
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
            <Text style={styles.labelStyle}>{doctorDetails?.displayName}’s Team</Text>
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

  const renderAppointmentHistory = () => {
    let arrayHistory = appointmentHistory ? appointmentHistory : [];
    arrayHistory = arrayHistory.filter((item) => {
      return item.status == 'COMPLETED';
    });
    if (arrayHistory.length > 0) {
      return (
        <View style={styles.cardView}>
          <View style={styles.labelView}>
            <Text style={styles.labelStyle}>Appointment History</Text>
            <Text style={styles.labelStyle}>
              {arrayHistory ? arrayHistory.length : 0} Prior Consults
            </Text>
          </View>
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{
              marginVertical: 12,
            }}
            data={arrayHistory}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  props.navigation.navigate(AppRoutes.ConsultDetails, {
                    CaseSheet: item.id,
                    DoctorInfo: doctorDetails,
                    FollowUp: '',
                    appointmentType: item.appointmentType,
                    DisplayId: '',
                    BlobName: '',
                  });
                }}
              >
                <View
                  style={{
                    ...theme.viewStyles.cardViewStyle,
                    marginHorizontal: 20,
                    marginVertical: 8,
                    padding: 16,
                    shadowRadius: 2,
                  }}
                >
                  <CapsuleView
                    isActive={false}
                    style={{ position: 'absolute', top: 0, right: 0, width: 112 }}
                    title={
                      item.appointmentType === 'ONLINE'
                        ? item.appointmentType + ' CONSULT'
                        : 'CLINIC VISIT'
                    }
                  />
                  <Text
                    style={{
                      paddingTop: 16,
                      paddingBottom: 4,
                      ...theme.fonts.IBMPlexSansMedium(18),
                      color: theme.colors.SEARCH_DOCTOR_NAME,
                    }}
                  >
                    {Moment.utc(item.appointmentDateTime)
                      .local()
                      .format('DD MMMM, hh:mm A')}
                  </Text>
                  <View style={styles.separatorStyle} />
                  {item.caseSheet && renderAppointmentSymptoms(item)}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      );
    }
  };

  const renderAppointmentSymptoms = (
    item: getAppointmentHistory_getAppointmentHistory_appointmentsHistory
  ) => {
    const symptomsJson = g(item, 'caseSheet');
    if (symptomsJson && symptomsJson.length != 0) {
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {symptomsJson &&
            symptomsJson[0] &&
            symptomsJson[0].symptoms &&
            symptomsJson[0].symptoms.map((item, index) => (
              <CapsuleView
                key={index}
                title={item && item.symptom}
                isActive={false}
                style={{ width: 'auto', marginRight: 4, marginTop: 11 }}
                titleTextStyle={{ color: theme.colors.SKY_BLUE }}
              />
            ))}
        </View>
      );
    }
  };

  const handleScroll = () => {};

  const postBookAppointmentWEGEvent = () => {
    const doctorClinics = ((doctorDetails && doctorDetails?.doctorHospital) || [])?.filter(
      (item) => {
        if (item && item?.facility && item?.facility?.facilityType)
          return item?.facility?.facilityType === 'HOSPITAL';
      }
    );
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
      User_Type: getUserType(allCurrentPatients),
    };
    postWebEngageEvent(WebEngageEventName.BOOK_APPOINTMENT, eventAttributes);
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_BOOK_APPOINTMENT_CONSULT_CLICKED] = {
      'Doctor name': g(doctorDetails, 'displayName')! || undefined,
      Source: 'doctor profile',
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient age': Math.round(
        Moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Speciality name': g(doctorDetails, 'specialty', 'name')! || undefined,
      Experience: Number(g(doctorDetails, 'experience')) || undefined,
      'Customer ID': g(currentPatient, 'id'),
      'Doctor ID': g(doctorDetails, 'id')!,
      'Speciality ID': g(doctorDetails, 'specialty', 'id')!,
      'Doctor hospital':
        doctorClinics.length > 0 && doctorDetails!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.name}`
          : undefined,
      'Doctor city':
        doctorClinics.length > 0 && doctorDetails!.doctorType !== DoctorType.PAYROLL
          ? `${doctorClinics[0].facility.city}`
          : undefined,
      User_Type: getUserType(allCurrentPatients),
      'Online consult fee': Number(doctorDetails?.onlineConsultationFees) || undefined,
      'Physical consult fee': Number(doctorDetails?.physicalConsultationFees) || undefined,
      'Available in mins':
        getTimeDiff(onlineSelected ? availableTime : physicalAvailableTime) || undefined,
      'Mobile number': currentPatient?.mobileNumber || '',
      'Circle Member': !!circleSubscriptionId,
      'Circle Plan type': circleSubPlanId,
    };
    postCleverTapEvent(
      CleverTapEventName.CONSULT_BOOK_APPOINTMENT_CONSULT_CLICKED,
      cleverTapEventAttributes
    );
    const appsflyereventAttributes: AppsFlyerEvents[AppsFlyerEventName.BOOK_APPOINTMENT] = {
      'customer id': currentPatient ? currentPatient.id : '',
    };
    postAppsFlyerEvent(AppsFlyerEventName.BOOK_APPOINTMENT, appsflyereventAttributes);
    postFirebaseEvent(FirebaseEventName.BOOK_APPOINTMENT, eventAttributes);
  };

  const moveBack = () => {
    props.navigation.goBack();
  };

  const postWebengaegConsultType = (consultType: 'Online' | 'In Person') => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_TYPE_SELECTION] = {
      'Consult Type': consultType,
      'Doctor ID': doctorId,
      'Doctor Name': doctorDetails?.displayName || '',
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postWebEngageEvent(WebEngageEventName.CONSULT_TYPE_SELECTION, eventAttributes);
  };

  const renderConsultNow = () => {
    return (
      <StickyBottomComponent style={[styles.stickyBottomComponentStyle, { flex: 1 }]}>
        {isBoth?.length > 0 || isPhysical?.length === 0 ? (
          <Button
            style={[
              styles.onlineConsultButtonStyle1,
              !isPayrollDoctor && (isBoth?.length > 0 || isPhysical?.length > 0)
                ? styles.onlineConsultButtonStyle2
                : {},
            ]}
            titleTextStyle={[styles.buttonTextStyle, { color: theme.colors.LIGHT_BLUE }]}
            title={string.common.bookVideoConsult}
            onPress={onPressVideoConsult}
            leftIcon={<VideoActiveIcon style={styles.iconStyle} />}
          />
        ) : null}
        {(!isPayrollDoctor && (isBoth?.length > 0 || isPhysical?.length > 0)) || !onlineSelected ? (
          <Button
            style={[
              styles.hospitalConsultStyle1,
              isBoth?.length > 0 || isPhysical?.length === 0 ? styles.hospitalConsultStyle2 : {},
            ]}
            titleTextStyle={[styles.buttonTextStyle, { color: theme.colors.LIGHT_BLUE }]}
            title={string.common.bookHospitalVisit}
            leftIcon={<HospitalPhrIcon style={styles.iconStyle} />}
            onPress={onPressMeetInPersonCard}
          />
        ) : null}
      </StickyBottomComponent>
    );
  };

  const onPressConsultNow = (isOnlineSelected: boolean = true) => {
    postBookAppointmentWEGEvent();
    props.navigation.navigate(AppRoutes.SlotSelection, {
      doctorId,
      callSaveSearch,
      isCircleDoctor,
      consultModeSelected: isOnlineSelected
        ? string.consultModeTab.VIDEO_CONSULT
        : string.consultModeTab.HOSPITAL_VISIT,
    });
  };

  const getTitle = () => {
    const consultNowText = ctaBannerText?.CONSULT_NOW || '';
    const time = onlineSelected ? availableTime : physicalAvailableTime;
    const activeCTA = doctorDetails?.doctorCardActiveCTA?.DEFAULT;
    return activeCTA
      ? activeCTA
      : consultNowText || (time && moment(time).isValid())
      ? nextAvailability(time, 'Consult')
      : string.common.book_apointment;
  };

  const callAskApolloNumber = () => {
    const doctorClinics = ((doctorDetails && doctorDetails?.doctorHospital) || [])?.filter(
      (item) => {
        if (item && item?.facility && item?.facility?.facilityType)
          return item?.facility?.facilityType === 'HOSPITAL';
      }
    );
    const { id, name } =
      doctorClinics.length > 0 && doctorDetails!.doctorType !== DoctorType.PAYROLL
        ? doctorClinics[0].facility
        : {};

    const eventAttributes: CleverTapEvents[CleverTapEventName.CLICKED_ON_APOLLO_NUMBER] = {
      'Screen type': 'Doctor Detail Page',
      'Patient Number': currentPatient?.mobileNumber,
      'Doctor ID': doctorDetails?.id,
      'Doctor Name': doctorDetails?.displayName || '',
      'Doctor Type': doctorDetails?.doctorType,
      'Doctor Hospital Id': id || '',
      'Doctor Hospital Name': name || '',
    };
    postCleverTapEvent(CleverTapEventName.CLICKED_ON_APOLLO_NUMBER, eventAttributes);
    Linking.openURL(`tel:${AppConfig.Configuration.Ask_Apollo_Number}`);
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
          {doctorDetails && renderConsultType()}
          {doctorDetails && renderDoctorClinic()}
          {doctorDetails && renderDoctorTeam()}
          {appointmentHistory && renderAppointmentHistory()}
          <View style={{ height: 92 }} />
        </Animated.ScrollView>
        {doctorDetails && renderConsultNow()}
        {renderDoctorShareComponent()}
      </SafeAreaView>

      {displayoverlay && doctorDetails && (
        <ConsultOverlay
          setdisplayoverlay={() => setdisplayoverlay(false)}
          navigation={props.navigation}
          consultedWithDoctorBefore={consultedWithDoctorBefore}
          doctor={doctorDetails ? doctorDetails : null}
          patientId={currentPatient ? currentPatient.id : ''}
          clinics={doctorDetails.doctorHospital ? doctorDetails.doctorHospital : []}
          doctorId={props.navigation.state.params!.doctorId}
          FollowUp={props.navigation.state.params!.FollowUp}
          appointmentType={props.navigation.state.params!.appointmentType}
          appointmentId={props.navigation.state.params!.appointmentId}
          consultModeSelected={consultMode}
          externalConnect={null}
          availableMode={ConsultMode.BOTH}
          callSaveSearch={callSaveSearch}
          isDoctorsOfTheHourStatus={doctorDetails?.doctorsOfTheHourStatus}
        />
      )}
      <Animated.View
        style={{
          ...styles.animatedView,
          backgroundColor: headColor,
          transform: [{ translateY: headMov }],
          top: statusBarHeight() + 20,
        }}
      >
        <View
          style={{
            height: 160,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!showVideo && !!g(doctorDetails, 'photoUrl') ? (
            <>
              <View style={{ height: 20, width: '100%' }} />
              <Animated.View
                style={{
                  top: 0,
                  height: 140,
                  width: '100%',
                  opacity: imgOp,
                }}
              >
                <Animated.Image
                  source={{ uri: doctorDetails!.photoUrl }}
                  style={{ top: 0, height: 140, width: 140, opacity: imgOp, alignSelf: 'center' }}
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
              <View
                style={{
                  height: 160,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DoctorPlaceholderImage style={{ top: 0, height: 140, width: 140 }} />
              </View>
            )
          )}
        </View>
      </Animated.View>
      <Header
        container={{
          ...styles.headerView,
          top: statusBarHeight() + 10,
        }}
        leftIcon="backArrow"
        onPressLeftIcon={moveBack}
      />
      {displayAskApolloNumber && (
        <View
          style={{
            ...styles.askApolloView,
            top: statusBarHeight() + 30,
          }}
        >
          <TouchableOpacity onPress={callAskApolloNumber} style={styles.horizontalView}>
            <CallIcon style={styles.callLogo} />
            <Text style={styles.askApolloNumber}>{AppConfig.Configuration.Ask_Apollo_Number}</Text>
          </TouchableOpacity>
        </View>
      )}
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
