import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import {
  BenefitCtaAction,
  CicleSubscriptionData,
  CircleGroup,
  CirclePlanSummary,
  GroupPlan,
  PlanBenefits,
  SubscriptionData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NotificationListener } from '@aph/mobile-patients/src/components/NotificationListener';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { CarouselBanners } from '@aph/mobile-patients/src/components/ui/CarouselBanners';
import {
  ApolloHealthProIcon,
  CartIcon,
  ConsultationRoom,
  CovidOrange,
  CovidRiskLevel,
  DashedLine,
  Diabetes,
  DoctorIcon,
  DropdownGreen,
  FemaleCircleIcon,
  FemaleIcon,
  KavachIcon,
  HealthyLife,
  LatestArticle,
  LinkedUhidIcon,
  MaleCircleIcon,
  MaleIcon,
  MedicineCartIcon,
  MedicineIcon,
  MyHealth,
  NotificationIcon,
  Person,
  PrescriptionMenu,
  Scan,
  Symptomtracker,
  TestsCartIcon,
  TestsIcon,
  WhiteArrowRightIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';

import { dateFormatter } from '@aph/mobile-patients/src/utils/dateUtil';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { LocationSearchPopup } from '@aph/mobile-patients/src/components/ui/LocationSearchPopup';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
  CommonSetUserBugsnag,
  DeviceHelper,
  isIos,
  setBugFenderLog,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS,
  GET_CASHBACK_DETAILS_OF_PLAN_ID,
  GET_PATIENT_FUTURE_APPOINTMENT_COUNT,
  GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
  SAVE_VOIP_DEVICE_TOKEN,
  UPDATE_PATIENT_APP_VERSION,
  GET_USER_PROFILE_TYPE,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetAllUserSubscriptionsWithPlanBenefitsV2,
  GetAllUserSubscriptionsWithPlanBenefitsV2Variables,
} from '@aph/mobile-patients/src/graphql/types/GetAllUserSubscriptionsWithPlanBenefitsV2';
import { GetCashbackDetailsOfPlanById } from '@aph/mobile-patients/src/graphql/types/GetCashbackDetailsOfPlanById';
import { getUserProfileType } from '@aph/mobile-patients/src/graphql/types/getUserProfileType';
import { getPatientAllAppointments_getPatientAllAppointments_activeAppointments } from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';
import { getPatientFutureAppointmentCount } from '@aph/mobile-patients/src/graphql/types/getPatientFutureAppointmentCount';
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import { DEVICETYPE, Gender, Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  UpdatePatientAppVersion,
  UpdatePatientAppVersionVariables,
} from '@aph/mobile-patients/src/graphql/types/UpdatePatientAppVersion';
import {
  GenerateTokenforCM,
  notifcationsApi,
  pinCodeServiceabilityApi247,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
import {
  getPatientPersonalizedAppointmentList,
  getUserBannersList,
  saveTokenDevice,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  FirebaseEventName,
  PatientInfoFirebase,
  PatientInfoWithSourceFirebase,
} from '@aph/mobile-patients/src/helpers/firebaseEvents';
import {
  checkPermissions,
  doRequestAndAccessLocationModified,
  g,
  getPhrNotificationAllCount,
  overlyCallPermissions,
  postFirebaseEvent,
  postWebEngageEvent,
  setWebEngageScreenNames,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  PatientInfo,
  PatientInfoWithSource,
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import KotlinBridge from '@aph/mobile-patients/src/KotlinBridge';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import messaging from '@react-native-firebase/messaging';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  ImageBackground,
  Linking,
  NativeModules,
  Platform,
  SafeAreaView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { ScrollView } from 'react-native-gesture-handler';
import VoipPushNotification from 'react-native-voip-push-notification';
import WebEngage from 'react-native-webengage';
import { NavigationScreenProps } from 'react-navigation';
import { addVoipPushToken, addVoipPushTokenVariables } from '../../graphql/types/addVoipPushToken';
import { getPatientPersonalizedAppointments_getPatientPersonalizedAppointments_appointmentDetails } from '../../graphql/types/getPatientPersonalizedAppointments';
import { ConsultPersonalizedCard } from '../ui/ConsultPersonalizedCard';
import { LinearGradientComponent } from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';
import {
  preFetchSDK,
  createHyperServiceObject,
} from '@aph/mobile-patients/src/components/PaymentGateway/NetworkCalls';

const { Vitals } = NativeModules;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  viewName: {
    backgroundColor: theme.colors.WHITE,
    width: '100%',
    marginBottom: 0,
  },
  covidCardContainer: {
    borderRadius: 10,
    backgroundColor: theme.colors.WHITE,
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  covidToucahble: {
    height: 0.06 * height,
    shadowColor: '#4c808080',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 8,
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#00485d',
  },
  covidIconView: {
    flex: 0.17,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  covidTitleView: {
    flex: 0.83,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  hiTextStyle: {
    marginLeft: 10,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(26),
  },
  nameTextContainerStyle: {
    maxWidth: '70%',
  },
  nameTextStyle: {
    marginLeft: 7,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(26),
    // textTransform: 'capitalize',
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    //marginTop: 5,
    marginHorizontal: 5,
    marginBottom: 6,
  },
  descriptionTextStyle: {
    marginHorizontal: 16,
    marginTop: 6,
    ...theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE),
  },
  labelView: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff748e',
    height: 14,
    width: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
  menuOptionIconStyle: {
    height: 40,
    width: 40,
    resizeMode: 'contain',
  },
  hdfcConnectContainer: {
    ...theme.viewStyles.cardViewStyle,
    minHeight: 140,
    elevation: 15,
    margin: 12,
    padding: 15,
    marginBottom: 25,
  },
  hdfcLogo: {
    resizeMode: 'contain',
    width: 100,
    height: 30,
  },
  hdfcConnectButton: {
    ...theme.viewStyles.text('B', 15, '#FC9916', 1, 35, 0.35),
    textAlign: 'right',
  },
  hdfcBanner: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.CLEAR,
    borderRadius: 12,
    elevation: 15,
    marginTop: 10,
    marginHorizontal: 28,
    marginBottom: 30,
    padding: 0,
    height: 140,
    width: 330,
    alignSelf: 'center',
  },
  plainLine: {
    width: '100%',
    height: 1,
    marginVertical: 16,
  },
  badgelabelView: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#E50000',
    height: 15,
    width: 15,
    borderRadius: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgelabelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
  tabBarMainViewStyle: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    width: width,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  tabBarViewStyle: {
    width: width / 5,
    height: 57,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarTitleStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(7),
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 8,
    color: '#02475b',
  },
  bottomAlertTitle: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  profileIcon: {
    width: 38,
    height: 38,
    marginLeft: 16,
  },
  linearGradientView: {
    ...theme.viewStyles.cardViewStyle,
    width: width - 32,
    marginBottom: 12,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'yellow',
  },
  topImageView: {
    paddingLeft: 16,
    flexDirection: 'row',
    flex: 1,
  },
  topTextStyle: {
    ...theme.viewStyles.text('SB', 15, theme.colors.WHITE, 1, 18),
    textAlign: 'center',
    alignSelf: 'center',
    marginHorizontal: 10,
  },
  bottomCardView: {
    ...theme.viewStyles.cardViewStyle,
    shadowOffset: { width: 0, height: 5 },
    elevation: 15,
    flexDirection: 'row',
    minHeight: 59,
    width: width / 2 - 22,
    marginRight: 12,
    marginBottom: 12,
  },
  bottomImageView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    flex: 0.5,
  },
  bottomTextView: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 6,
    flex: 1,
  },
});

type menuOptions = {
  id: number;
  title: string;
  image: React.ReactNode;
  onPress: () => void;
};

type TabBarOptions = {
  id: number;
  title: string;
  image: React.ReactNode;
};

export const tabBarOptions: TabBarOptions[] = [
  {
    id: 1,
    title: 'APPOINTMENTS',
    image: <ConsultationRoom />,
  },
  {
    id: 2,
    title: 'HEALTH RECORDS',
    image: <MyHealth />,
  },
  {
    id: 3,
    title: 'MEDICINES',
    image: <MedicineIcon />,
  },
  {
    id: 4,
    title: 'LAB TESTS',
    image: <TestsIcon />,
  },
  {
    id: 5,
    title: 'MY ACCOUNT',
    image: <Person />,
  },
];

export interface ConsultRoomProps extends NavigationScreenProps {}
export const ConsultRoom: React.FC<ConsultRoomProps> = (props) => {
  const { isIphoneX } = DeviceHelper();
  const {
    setLocationDetails,
    locationDetails,
    isCurrentLocationFetched,
    setCurrentLocationFetched,
    notificationCount,
    setNotificationCount,
    setAllNotifications,
    setisSelected,
    appointmentsPersonalized,
    setAppointmentsPersonalized,
    setHdfcUserSubscriptions,
    hdfcUserSubscriptions,
    bannerData,
    setBannerData,
    phrNotificationData,
    setCircleSubscription,
    hdfcUpgradeUserSubscriptions,
    setHdfcUpgradeUserSubscriptions,
    circleSubscription,
    setAxdcCode,
    setCirclePlanId,
    setHdfcPlanId,
    setCircleStatus,
    setHdfcStatus,
    hdfcStatus,
    setPharmacyUserType,
    pharmacyUserTypeAttribute,
  } = useAppCommonData();

  // const startDoctor = string.home.startDoctor;
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [isLocationSearchVisible, setLocationSearchVisible] = useState(false);
  const [showList, setShowList] = useState<boolean>(false);
  const [isFindDoctorCustomProfile, setFindDoctorCustomProfile] = useState<boolean>(false);
  const [upgradePlans, setUpgradePlans] = useState<SubscriptionData[]>([]);

  const {
    cartItems,
    setIsDiagnosticCircleSubscription,
    isDiagnosticCircleSubscription,
  } = useDiagnosticsCart();

  const {
    cartItems: shopCartItems,
    setHdfcPlanName,
    setIsFreeDelivery,
    setCircleSubscriptionId,
    setCirclePlanSelected,
    setIsCircleSubscription,
    setCircleCashback,
    circleSubscriptionId,
    setHdfcSubscriptionId,
    setCirclePlanValidity,
    setCirclePaymentReference,
    pharmacyCircleAttributes,
  } = useShoppingCart();
  const cartItemsCount = cartItems.length + shopCartItems.length;

  const { currentPatient } = useAllCurrentPatients();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [menuViewOptions, setMenuViewOptions] = useState<number[]>([]);
  const [currentAppointments, setCurrentAppointments] = useState<string>('0');
  const [appointmentLoading, setAppointmentLoading] = useState<boolean>(false);
  const [enableCM, setEnableCM] = useState<boolean>(true);
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const [isWEGFired, setWEGFired] = useState(false);
  const [serviceable, setserviceable] = useState<String>('');
  const [personalizedData, setPersonalizedData] = useState<any>([]);
  const [isPersonalizedCard, setisPersonalizedCard] = useState(false);
  const [voipDeviceToken, setVoipDeviceToken] = useState<string>('');
  const [consultations, setconsultations] = useState<
    getPatientAllAppointments_getPatientAllAppointments_activeAppointments[]
  >([]);
  const [profileChange, setProfileChange] = useState<boolean>(false);

  const [hdfcLoading, setHdfcLoading] = useState<boolean>(false);
  let circleActivated = props.navigation.getParam('circleActivated');
  const circleActivatedRef = useRef<boolean>(circleActivated);
  const circlePlanValidity = props.navigation.getParam('circlePlanValidity');
  const webengage = new WebEngage();
  const client = useApolloClient();
  const hdfc_values = string.Hdfc_values;

  const saveDeviceNotificationToken = async (id: string) => {
    try {
      const savedToken = await AsyncStorage.getItem('deviceToken');
      const token = await messaging().getToken();
      if (savedToken !== token) {
        saveTokenDevice(client, token, id);
      }
    } catch (error) {}
  };

  const notifyAppVersion = async (patientId: string) => {
    try {
      const key = `${patientId}-appVersion`;
      const savedAppVersion = await AsyncStorage.getItem(key);
      const appVersion = DeviceInfo.getVersion();
      if (savedAppVersion !== appVersion) {
        await client.mutate<UpdatePatientAppVersion, UpdatePatientAppVersionVariables>({
          mutation: UPDATE_PATIENT_APP_VERSION,
          variables: {
            appVersion,
            patientId,
            osType: Platform.OS == 'ios' ? DEVICETYPE.IOS : DEVICETYPE.ANDROID,
          },
          fetchPolicy: 'no-cache',
        });
        await AsyncStorage.setItem(key, appVersion);
      }
    } catch (error) {}
  };

  useEffect(() => {
    preFetchSDK(currentPatient?.id);
    createHyperServiceObject();
  }, []);

  useEffect(() => {
    if (currentPatient?.id) {
      saveDeviceNotificationToken(currentPatient.id);
      notifyAppVersion(currentPatient.id);
    }
  }, [currentPatient]);
  const phrNotificationCount = getPhrNotificationAllCount(phrNotificationData!);

  useEffect(() => {
    //TODO: if deeplinks is causing issue comment handleDeepLink here and uncomment in SplashScreen useEffect
    // handleDeepLink(props.navigation);
    isserviceable();
  }, [locationDetails, currentPatient]);

  const askLocationPermission = () => {
    showAphAlert!({
      unDismissable: true,
      title: 'Hi! :)',
      description:
        'We need to know your location to function better. Please allow us to auto detect your location or enter location manually.',
      CTAs: [
        {
          text: 'ENTER MANUALLY',
          onPress: () => {
            hideAphAlert!();
            setLocationSearchVisible(true);
          },
          type: 'white-button',
        },
        {
          text: 'ALLOW AUTO DETECT',
          onPress: () => {
            hideAphAlert!();
            setLoading!(true);
            doRequestAndAccessLocationModified()
              .then((response) => {
                setLoading!(false);
                response && setLocationDetails!(response);
              })
              .catch((e) => {
                CommonBugFender('ConsultRoom__ALLOW_AUTO_DETECT', e);
                setLoading!(false);
                e &&
                  typeof e == 'string' &&
                  !e.includes('denied') &&
                  showAphAlert!({
                    title: 'Uh oh! :(',
                    description: e,
                  });
                setLocationSearchVisible(true);
              });
          },
        },
      ],
    });
  };

  async function isserviceable() {
    if (locationDetails && locationDetails.pincode) {
      await pinCodeServiceabilityApi247(locationDetails.pincode!)
        .then(({ data: { response } }) => {
          const { servicable, axdcCode } = response;
          setAxdcCode && setAxdcCode(axdcCode);
          if (servicable) {
            setserviceable('Yes');
          } else {
            setserviceable('No');
          }
        })
        .catch((e) => {
          setserviceable('No');
          console.log('pincode_checkServicability', e);
        });
    }
  }

  useEffect(() => {
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      circleActivatedRef.current = false;
    });
    return () => {
      didBlur && didBlur.remove();
    };
  });

  useEffect(() => {
    const params = props.navigation.state.params;
    if (!params?.isFreeConsult && !params?.isReset && currentPatient) {
      // reset will be true only from the payment screen(fill medical details)
      checkPermissions(['camera', 'microphone']).then((response: any) => {
        const { camera, microphone } = response;
        if (camera !== 'authorized' || microphone !== 'authorized') {
          fetchInProgressAppointments();
        }
      });
    }
    if (params?.isFreeConsult) {
      checkPermissions(['camera', 'microphone']).then((response: any) => {
        const { camera, microphone } = response;
        if (camera === 'authorized' && microphone === 'authorized') {
          showFreeConsultOverlay(params);
        } else {
          overlyCallPermissions(
            currentPatient!.firstName!,
            params?.doctorName,
            showAphAlert,
            hideAphAlert,
            true,
            () => {
              if (params?.doctorName) {
                showFreeConsultOverlay(params);
              }
            }
          );
        }
      });
    }
  }, [profileChange]);

  useEffect(() => {
    try {
      if (currentPatient && !isWEGFired) {
        setWEGFired(true);
        setWEGUserAttributes();
      }
      getUserBanners();
      getUserSubscriptionsWithBenefits();
    } catch (e) {}
  }, [currentPatient]);

  useEffect(() => {
    if (upgradePlans.length) {
      setHdfcUpgradeUserSubscriptions && setHdfcUpgradeUserSubscriptions(upgradePlans);
    }
  }, [upgradePlans]);

  const fetchInProgressAppointments = async () => {
    try {
      const res = await client.query<getPatientFutureAppointmentCount>({
        query: GET_PATIENT_FUTURE_APPOINTMENT_COUNT,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: currentPatient?.id,
        },
      });
      const appointmentCount = res?.data?.getPatientFutureAppointmentCount;
      if (appointmentCount) {
        const inProgressAppointments = appointmentCount?.activeConsultsCount || 0;
        if (inProgressAppointments > 0) {
          overlyCallPermissions(
            currentPatient!.firstName!,
            'the doctor',
            showAphAlert,
            hideAphAlert,
            true
          );
        }
      }
    } catch (error) {
      CommonBugFender('ConsultRoom_getPatientFutureAppointmentCount', error);
    }
  };

  const showFreeConsultOverlay = (params: any) => {
    console.log('csk', JSON.stringify(params));
    const { isJdQuestionsComplete, appointmentDateTime, doctorInfo } = params?.appointmentData;
    const { skipAutoQuestions, isPhysicalConsultBooked } = params;
    const doctorName = params?.doctorName?.includes('Dr')
      ? params?.doctorName
      : `Dr ${params?.doctorName}`;
    const appointmentDate = moment(appointmentDateTime).format('Do MMMM YYYY');
    const appointmentTime = moment(appointmentDateTime).format('h:mm a');
    let description = `Your appointment has been successfully booked with ${doctorName} for ${appointmentDate} at ${appointmentTime}. Please be in the consult room before the appointment time.`;
    if (!isJdQuestionsComplete && !skipAutoQuestions) {
      description = `Your appointment has been successfully booked with ${doctorName} for ${appointmentDate} at ${appointmentTime}. Please go to the consult room to answer a few medical questions.`;
    }
    if (isPhysicalConsultBooked) {
      console.log('csk hos', doctorInfo.doctorHospital[0]);
      let hospitalLocation = doctorInfo.doctorHospital[0].facility.name;
      description = `
           Your appointment has been successfully booked with ${doctorName} for ${dateFormatter(
        appointmentDateTime
      )} at ${hospitalLocation}.
           Please note that you will need to pay ₹${
             doctorInfo.physicalConsultationFees
           } + One-time registration charges
           (For new users) at the hospital Reception.
           `;
    }
    showAphAlert!({
      unDismissable: false,
      title: 'Appointment Confirmation',
      description: description,
      children: (
        <View style={{ height: 60, alignItems: 'flex-end' }}>
          {isPhysicalConsultBooked ? (
            <TouchableOpacity
              activeOpacity={1}
              style={styles.bottomAlertTitle}
              onPress={() => {
                hideAphAlert!();
                props.navigation.navigate('APPOINTMENTS');
              }}
            >
              <Text style={theme.viewStyles.yellowTextStyle}>VIEW DETAILS</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={1}
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
                justifyContent: 'center',
              }}
              onPress={() => {
                hideAphAlert!();
                props.navigation.navigate(AppRoutes.ChatRoom, {
                  data: params?.appointmentData,
                });
              }}
            >
              <Text style={theme.viewStyles.yellowTextStyle}>GO TO CONSULT ROOM</Text>
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  };

  const setWEGUserAttributes = () => {
    webengage.user.setFirstName(g(currentPatient, 'firstName'));
    webengage.user.setLastName(g(currentPatient, 'lastName'));
    webengage.user.setGender((g(currentPatient, 'gender') || '').toLowerCase());
    webengage.user.setEmail(g(currentPatient, 'emailAddress'));
    webengage.user.setBirthDateString(g(currentPatient, 'dateOfBirth'));
    webengage.user.setPhone(g(currentPatient, 'mobileNumber'));
  };

  const postHomeWEGEvent = (
    eventName: WebEngageEventName,
    source?: PatientInfoWithSource['Source']
  ) => {
    let eventAttributes: PatientInfo = {
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
    };
    if (
      source &&
      (eventName == WebEngageEventName.BUY_MEDICINES ||
        eventName == WebEngageEventName.ORDER_TESTS ||
        eventName == WebEngageEventName.VIEW_HELATH_RECORDS ||
        eventName == WebEngageEventName.NEED_HELP)
    ) {
      (eventAttributes as PatientInfoWithSource)['Source'] = source;
    }
    if (
      locationDetails &&
      locationDetails.pincode &&
      eventName == WebEngageEventName.BUY_MEDICINES
    ) {
      (eventAttributes as PatientInfoWithSource)['Pincode'] = locationDetails.pincode;
      (eventAttributes as PatientInfoWithSource)['Serviceability'] = serviceable;
    }
    if (eventName == WebEngageEventName.BUY_MEDICINES) {
      eventAttributes = {
        ...eventAttributes,
        ...pharmacyCircleAttributes,
        ...pharmacyUserTypeAttribute,
      };
    }
    if (eventName == WebEngageEventName.BOOK_DOCTOR_APPOINTMENT) {
      eventAttributes = { ...eventAttributes, ...pharmacyCircleAttributes };
    }
    if (eventName == WebEngageEventName.HDFC_HEALTHY_LIFE) {
      const subscription_name = hdfcUserSubscriptions?.name;
      const newAttributes = {
        HDFCMembershipState: !!g(hdfcUserSubscriptions, 'isActive') ? 'Active' : 'Inactive',
        HDFCMembershipLevel: subscription_name?.substring(0, subscription_name?.indexOf('+')),
        Circle_Member: !!circleSubscriptionId ? 'Yes' : 'No',
      };
      eventAttributes = { ...eventAttributes, ...newAttributes };
    }
    postWebEngageEvent(eventName, eventAttributes);
  };

  const fireFirstTimeLanded = () => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.NON_CIRCLE_HOMEPAGE_VIEWED] = {
      'Patient UHID': currentPatient?.uhid,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      'Circle Member': 'No',
    };
    postWebEngageEvent(WebEngageEventName.NON_CIRCLE_HOMEPAGE_VIEWED, eventAttributes);
  };

  const postHomeFireBaseEvent = (
    eventName: FirebaseEventName,
    source?: PatientInfoWithSourceFirebase['Source']
  ) => {
    let eventAttributes: PatientInfoFirebase = {
      PatientName: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      PatientUHID: g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      PatientAge: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      PatientGender: g(currentPatient, 'gender'),
      MobileNumber: g(currentPatient, 'mobileNumber'),
      CustomerID: g(currentPatient, 'id'),
    };
    if (source) {
      (eventAttributes as PatientInfoWithSourceFirebase)['Source'] = source;
    }
    if (
      locationDetails &&
      locationDetails.pincode &&
      eventName == FirebaseEventName.BUY_MEDICINES
    ) {
      (eventAttributes as PatientInfoWithSourceFirebase)['Pincode'] = locationDetails.pincode;
      (eventAttributes as PatientInfoWithSourceFirebase)['Serviceability'] = serviceable;
    }
    if (eventName == FirebaseEventName.BUY_MEDICINES) {
      eventAttributes = { ...eventAttributes, ...pharmacyCircleAttributes };
    }
    postFirebaseEvent(eventName, eventAttributes);
  };

  const onProfileChange = () => {
    setProfileChange(!profileChange);
    setShowList(false);
    if (isFindDoctorCustomProfile) {
      setFindDoctorCustomProfile(false);
      props.navigation.navigate(AppRoutes.DoctorSearch);
    }
  };

  const renderBadgeView = () => {
    return phrNotificationCount ? (
      <View style={[styles.badgelabelView]}>
        <Text style={styles.badgelabelText}>{phrNotificationCount}</Text>
      </View>
    ) : null;
  };

  const listValues: menuOptions[] = [
    {
      id: 1,
      title: 'Book Apollo Doctor Appointment',
      image: <DoctorIcon style={[styles.menuOptionIconStyle]} />,
      onPress: () => {
        postHomeFireBaseEvent(FirebaseEventName.FIND_A_DOCTOR, 'Home Screen');
        postHomeWEGEvent(WebEngageEventName.BOOK_DOCTOR_APPOINTMENT);
        props.navigation.navigate(AppRoutes.DoctorSearch);
        // showProfileSelectionAlert();
      },
    },
    {
      id: 2,
      title: 'Buy Medicines & Essentials',
      image: <MedicineCartIcon style={[styles.menuOptionIconStyle]} />,
      onPress: () => {
        postHomeFireBaseEvent(FirebaseEventName.BUY_MEDICINES, 'Home Screen');
        postHomeWEGEvent(WebEngageEventName.BUY_MEDICINES, 'Home Screen');
        props.navigation.navigate('MEDICINES', { focusSearch: true });
        const eventAttributes: WebEngageEvents[WebEngageEventName.HOME_PAGE_VIEWED] = {
          source: 'app home',
        };
        postWebEngageEvent(WebEngageEventName.HOME_PAGE_VIEWED, eventAttributes);
      },
    },
    {
      id: 3,
      title: 'Book Lab Tests',
      image: <TestsCartIcon style={styles.menuOptionIconStyle} />,
      onPress: () => {
        postHomeFireBaseEvent(FirebaseEventName.ORDER_TESTS, 'Home Screen');
        postHomeWEGEvent(WebEngageEventName.ORDER_TESTS, 'Home Screen');
        props.navigation.navigate('TESTS', { focusSearch: true });
      },
    },
    {
      id: 4,
      title: 'View Health Records',
      image: (
        <View>
          <PrescriptionMenu style={styles.menuOptionIconStyle} />
          {renderBadgeView()}
        </View>
      ),
      onPress: () => {
        postHomeFireBaseEvent(FirebaseEventName.VIEW_HELATH_RECORDS, 'Home Screen');
        postHomeWEGEvent(WebEngageEventName.VIEW_HELATH_RECORDS, 'Home Screen');
        props.navigation.navigate('HEALTH RECORDS');
      },
    },

    {
      id: 5,
      title: 'Book Doctor by Symptoms',
      image: <Symptomtracker style={styles.menuOptionIconStyle} />,
      onPress: () => {
        const eventAttributes: WebEngageEvents[WebEngageEventName.SYMPTOM_TRACKER_PAGE_CLICKED] = {
          'Patient UHID': g(currentPatient, 'uhid'),
          'Patient ID': g(currentPatient, 'id'),
          'Patient Name': g(currentPatient, 'firstName'),
          'Mobile Number': g(currentPatient, 'mobileNumber'),
          'Date of Birth': g(currentPatient, 'dateOfBirth'),
          Email: g(currentPatient, 'emailAddress'),
          Relation: g(currentPatient, 'relation'),
        };
        postWebEngageEvent(WebEngageEventName.SYMPTOM_TRACKER_PAGE_CLICKED, eventAttributes);
        postHomeFireBaseEvent(FirebaseEventName.TRACK_SYMPTOMS, 'Home Screen');
        postHomeWEGEvent(WebEngageEventName.TRACK_SYMPTOMS);
        props.navigation.navigate(AppRoutes.SymptomTracker);
      },
    },
    {
      id: 6,
      title: 'Manage Diabetes',
      image: <Diabetes style={styles.menuOptionIconStyle} />,
      onPress: () => {
        postHomeFireBaseEvent(FirebaseEventName.MANAGE_DIABETES, 'Home Screen');
        postHomeWEGEvent(WebEngageEventName.MANAGE_DIABETES);
        getTokenforCM();
      },
    },
  ];

  // const [listValues, setListValues] = useState<menuOptions[]>(menuOptions);

  useEffect(() => {
    if (enableCM) {
      setMenuViewOptions([1, 2, 3, 4, 5, 6]);
    } else {
      setMenuViewOptions([1, 2, 3, 5]);
    }
  }, [enableCM]);

  useEffect(() => {
    AsyncStorage.removeItem('deeplink');
    AsyncStorage.removeItem('deeplinkReferalCode');
    storePatientDetailsTOBugsnag();
    callAPIForNotificationResult();
    setWebEngageScreenNames('Home Screen');
    getUserSubscriptionsByStatus();
    checkCircleSelectedPlan();
    setBannerData && setBannerData([]); // default banners to be empty
  }, []);

  const checkCircleSelectedPlan = async () => {
    const plan = await AsyncStorage.getItem('circlePlanSelected');
    if (plan) {
      setCirclePlanSelected && setCirclePlanSelected(JSON.parse(plan));
    } else {
      setCirclePlanSelected && setCirclePlanSelected(null);
    }
  };

  const getUserSubscriptionsWithBenefits = () => {
    setHdfcLoading(true);
    const mobile_number = g(currentPatient, 'mobileNumber');
    mobile_number &&
      client
        .query<
          GetAllUserSubscriptionsWithPlanBenefitsV2,
          GetAllUserSubscriptionsWithPlanBenefitsV2Variables
        >({
          query: GET_ALL_USER_SUSBSCRIPTIONS_WITH_PLAN_BENEFITS,
          variables: { mobile_number },
          fetchPolicy: 'no-cache',
        })
        .then((data) => {
          setHdfcLoading(false);
          const groupPlans = g(
            data,
            'data',
            'GetAllUserSubscriptionsWithPlanBenefitsV2',
            'response'
          );
          if (groupPlans) {
            const hdfcPlan = groupPlans?.HDFC;
            const circlePlan = groupPlans?.APOLLO;

            if (hdfcPlan) {
              const hdfcSubscription = setSubscriptionData(hdfcPlan[0]);
              setHdfcUserSubscriptions && setHdfcUserSubscriptions(hdfcSubscription);

              const subscriptionName = g(hdfcSubscription, 'name')
                ? g(hdfcSubscription, 'name')
                : '';
              if (g(hdfcSubscription, 'isActive')) {
                setHdfcPlanName && setHdfcPlanName(subscriptionName);
              }
              if (
                subscriptionName === hdfc_values.PLATINUM_PLAN &&
                !!g(hdfcSubscription, 'isActive')
              ) {
                setIsFreeDelivery && setIsFreeDelivery(true);
              }
            }

            if (circlePlan) {
              const circleSubscription = setCircleSubscriptionData(circlePlan[0]);
              if (!!circlePlan[0]?._id) {
                setIsCircleSubscription && setIsCircleSubscription(true);
              }
              setCircleSubscription && setCircleSubscription(circleSubscription);
            }
          }
        })
        .catch((e) => {
          setHdfcLoading(false);
          CommonBugFender('ConsultRoom_getUserSubscriptionsWithBenefits', e);
        });
  };

  const setCircleSubscriptionData = (plan: any) => {
    const planSummary: CirclePlanSummary[] = [];
    const summary = plan?.plan_summary;
    if (summary && summary.length) {
      summary.forEach((value) => {
        const plan_summary: CirclePlanSummary = {
          price: value?.price,
          renewMode: value?.renew_mode,
          starterPack: !!value?.starter_pack,
          benefitsWorth: value?.benefits_worth,
          availableForTrial: !!value?.available_for_trial,
          specialPriceEnabled: value?.special_price_enabled,
          subPlanId: value?.subPlanId,
          durationInMonth: value?.durationInMonth,
          currentSellingPrice: value?.currentSellingPrice,
          icon: value?.icon,
        };
        planSummary.push(plan_summary);
      });
    }

    const group = plan?.group;
    const groupDetailsData: CircleGroup = {
      _id: group?._id,
      name: group?.name,
      isActive: group?.is_active,
    };

    const benefits = plan.benefits;
    const circleBenefits: PlanBenefits[] = [];
    if (benefits && benefits.length) {
      benefits.forEach((item) => {
        const ctaAction = item?.cta_action;
        const benefitCtaAction: BenefitCtaAction = {
          type: ctaAction?.type,
          action: ctaAction?.meta?.action,
          message: ctaAction?.meta?.message,
          webEngageEvent: ctaAction?.meta?.webEngage,
        };
        const benefit: PlanBenefits = {
          _id: item?._id,
          attribute: item?.attribute,
          headerContent: item?.header_content,
          description: item?.description,
          ctaLabel: item?.cta_label,
          ctaAction: item?.cta_action?.cta_action,
          benefitCtaAction,
          attributeType: item?.attribute_type,
          availableCount: item?.available_count,
          refreshFrequency: item?.refresh_frequency,
          icon: item?.icon,
        };
        circleBenefits.push(benefit);
      });
    }

    const circleSubscptionData: CicleSubscriptionData = {
      _id: plan?._id,
      name: plan?.name,
      planId: plan?.plan_id,
      activationModes: plan?.activation_modes,
      status: plan?.status,
      subscriptionStatus: plan?.subscriptionStatus,
      subPlanIds: plan?.sub_plan_ids,
      planSummary: planSummary,
      groupDetails: groupDetailsData,
      benefits: circleBenefits,
      endDate: plan?.subscriptionEndDate,
      startDate: plan?.start_date,
    };

    return circleSubscptionData;
  };

  const setSubscriptionData = (plan: any, isUpgradePlan?: boolean) => {
    try {
      const group = plan.group;
      const groupData: GroupPlan = {
        _id: group!._id || '',
        name: group!.name || '',
        isActive: group!.is_active,
      };
      const benefits = plan.benefits;
      const planBenefits: PlanBenefits[] = [];
      if (benefits && benefits.length) {
        benefits.forEach((item) => {
          const ctaAction = g(item, 'cta_action');
          const benefitCtaAction: BenefitCtaAction = {
            type: g(ctaAction, 'type'),
            action: g(ctaAction, 'meta', 'action'),
            message: g(ctaAction, 'meta', 'message'),
            webEngageEvent: g(ctaAction, 'meta', 'webEngage'),
          };
          const benefit: PlanBenefits = {
            _id: item!._id,
            attribute: item!.attribute,
            headerContent: item!.header_content,
            description: item!.description,
            ctaLabel: item!.cta_label,
            ctaAction: g(item, 'cta_action', 'cta_action'),
            benefitCtaAction,
            attributeType: item!.attribute_type,
            availableCount: item!.available_count,
            refreshFrequency: item!.refresh_frequency,
            icon: item!.icon,
          };
          planBenefits.push(benefit);
        });
      }
      const isActive = plan!.subscriptionStatus === hdfc_values.ACTIVE_STATUS;
      const subscription: SubscriptionData = {
        _id: plan!._id || '',
        name: plan!.name || '',
        planId: plan!.plan_id || '',
        benefitsWorth: plan!.benefits_worth || '',
        activationModes: plan!.activation_modes,
        price: plan!.price,
        minTransactionValue: plan?.plan_summary?.[0]?.min_transaction_value,
        status: plan!.status || '',
        subscriptionStatus: plan!.subscriptionStatus || '',
        isActive,
        group: groupData,
        benefits: planBenefits,
        coupons: plan!.coupons ? plan!.coupons : [],
        upgradeTransactionValue: plan?.plan_summary?.[0]?.upgrade_transaction_value,
      };
      const upgradeToPlan = g(plan, 'can_upgrade_to');
      if (g(upgradeToPlan, '_id')) {
        setSubscriptionData(upgradeToPlan, true);
      }

      if (!!isUpgradePlan) {
        setUpgradePlans([...upgradePlans, subscription]);
      }
      return subscription;
    } catch (e) {
      console.log('ERROR: ', e);
    }
  };

  const getUserSubscriptionsByStatus = async () => {
    try {
      const query: GetSubscriptionsOfUserByStatusVariables = {
        mobile_number: g(currentPatient, 'mobileNumber'),
        status: ['active', 'deferred_inactive'],
      };
      const res = await client.query<GetSubscriptionsOfUserByStatus>({
        query: GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
        fetchPolicy: 'no-cache',
        variables: query,
      });
      const data = res?.data?.GetSubscriptionsOfUserByStatus?.response;
      if (data) {
        /**
         * for circle and hdfc
         * data?.HDFC ------> HDFC data
         * data?.APOLLO ----> Circle data
         */
        if (data?.APOLLO?.[0]._id) {
          const paymentRef = data?.APOLLO?.[0]?.payment_reference;
          const paymentStoredVal =
            typeof paymentRef == 'string' ? JSON.parse(paymentRef) : paymentRef;
          AsyncStorage.setItem('isCircleMember', 'yes');
          setCircleSubscriptionId && setCircleSubscriptionId(data?.APOLLO?.[0]._id);
          setIsCircleSubscription && setIsCircleSubscription(true);
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(true);
          const planValidity = {
            startDate: data?.APOLLO?.[0]?.start_date,
            endDate: data?.APOLLO?.[0]?.end_date,
          };
          setCirclePlanValidity && setCirclePlanValidity(planValidity);
          setCirclePlanId && setCirclePlanId(data?.APOLLO?.[0].plan_id);
          setCircleStatus && setCircleStatus(data?.APOLLO?.[0].status);
          paymentStoredVal &&
            setCirclePaymentReference &&
            setCirclePaymentReference(paymentStoredVal);
        } else {
          AsyncStorage.setItem('isCircleMember', 'no');
          setCircleSubscriptionId && setCircleSubscriptionId('');
          setIsCircleSubscription && setIsCircleSubscription(false);
          setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
          setCirclePlanValidity && setCirclePlanValidity(null);
          setCirclePaymentReference && setCirclePaymentReference(null);
          setCirclePlanId && setCirclePlanId('');
          fireFirstTimeLanded();
          setCircleStatus && setCircleStatus('');
        }

        if (data?.HDFC?.[0]._id) {
          setHdfcSubscriptionId && setHdfcSubscriptionId(data?.HDFC?.[0]._id);

          const planName = data?.HDFC?.[0].name;
          setHdfcPlanName && setHdfcPlanName(planName);
          setHdfcPlanId && setHdfcPlanId(data?.HDFC?.[0].plan_id);
          setHdfcStatus && setHdfcStatus(data?.HDFC?.[0].status);

          if (planName === hdfc_values.PLATINUM_PLAN && data?.HDFC?.[0].status === 'active') {
            setIsFreeDelivery && setIsFreeDelivery(true);
          }
        } else {
          setHdfcSubscriptionId && setHdfcSubscriptionId('');
          setHdfcPlanName && setHdfcPlanName('');
          setHdfcStatus && setHdfcStatus('');
        }
      }
    } catch (error) {
      CommonBugFender('ConsultRoom_GetSubscriptionsOfUserByStatus', error);
    }
  };

  const getUserBanners = async () => {
    setHdfcLoading(true);
    const res: any = await getUserBannersList(client, currentPatient, string.banner_context.HOME);
    setHdfcLoading(false);
    if (res) {
      setBannerData && setBannerData(res);
    } else {
      setBannerData && setBannerData([]);
    }
  };

  const getProductCashbackDetails = () => {
    client
      .query<GetCashbackDetailsOfPlanById>({
        query: GET_CASHBACK_DETAILS_OF_PLAN_ID,
        variables: { plan_id: AppConfig.Configuration.CIRCLE_PLAN_ID },
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        const cashback = g(
          data,
          'data',
          'GetCashbackDetailsOfPlanById',
          'response',
          'meta',
          'cashback'
        );
        setCircleCashback && setCircleCashback(cashback);
      })
      .catch((e) => {
        setHdfcLoading(false);
        CommonBugFender('ConsultRoom_GetCashbackDetailsOfPlanById', e);
      });
  };

  const getUserProfileType = () => {
    client
      .query<getUserProfileType>({
        query: GET_USER_PROFILE_TYPE,
        variables: { mobileNumber: g(currentPatient, 'mobileNumber') },
        fetchPolicy: 'no-cache',
      })
      .then((data) => {
        const profileType = data?.data?.getUserProfileType?.profile;
        if (!!profileType) {
          setPharmacyUserType && setPharmacyUserType(profileType);
        }
      })
      .catch((e) => {
        CommonBugFender('ConsultRoom_getUserProfileType', e);
      });
  };

  const storePatientDetailsTOBugsnag = async () => {
    try {
      let allPatients: any;

      const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
      const item = JSON.parse(retrievedItem || 'null');

      const callByPrism: any = await AsyncStorage.getItem('callByPrism');

      if (callByPrism === 'true') {
        allPatients =
          item && item.data && item.data.getCurrentPatients
            ? item.data.getCurrentPatients.patients
            : null;
      } else {
        allPatients =
          item && item.data && item.data.getPatientByMobileNumber
            ? item.data.getPatientByMobileNumber.patients
            : null;
      }

      const patientDetails = allPatients
        ? allPatients.find((patient: any) => patient.relation === Relation.ME) || allPatients[0]
        : null;

      const array: any = await AsyncStorage.getItem('allNotification');
      const arraySelected = JSON.parse(array || 'null');
      const selectedCount = arraySelected.filter((item: any) => {
        return item.isActive === true;
      });
      setNotificationCount && setNotificationCount(selectedCount.length);

      CommonSetUserBugsnag(
        patientDetails ? (patientDetails.mobileNumber ? patientDetails.mobileNumber : '') : ''
      );
    } catch (error) {}
  };

  const callAPIForNotificationResult = async () => {
    const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');

    const params = {
      phone: '91' + storedPhoneNumber,
      size: 40,
    };
    console.log('params', params);
    notifcationsApi(params)
      .then(async (repsonse: any) => {
        try {
          const array = await AsyncStorage.getItem('allNotification');
          let arrayNotification;

          if (array !== null) {
            const arraySelected = JSON.parse(array);
            // console.log('arraySelected.......', arraySelected);

            arrayNotification = repsonse.data.data.map((el: any) => {
              const o = Object.assign({}, el);

              const result = arraySelected.filter((obj: any) => {
                return obj._id == el._id;
              });
              if (result.length === 0) {
                // console.log('result.length', result);
                o.isActive = true;
              } else {
                o.isActive = result[0].isActive;
                // console.log('result', result);
                // console.log('result.isActive', result[0].isActive);
              }
              return o;
            });
          } else {
            arrayNotification = repsonse.data.data.map((el: any) => {
              const o = Object.assign({}, el);
              o.isActive = true;
              return o;
            });
          }

          const tempArray: any[] = [];
          const filteredNotifications = arrayNotification.filter((el: any) => {
            // If it is not a duplicate and accepts these conditions, return true
            const val = JSON.parse(el.notificatio_details.push_notification_content || 'null');
            const event = val.cta;
            if (event) {
              const actionLink = decodeURIComponent(event.actionLink);

              let routing = actionLink.replace('apollopatients://', '');
              routing = routing.replace('w://p/open_url_in_browser/', '');
              const data = routing.split('?');
              routing = data[0];

              if (
                routing === 'Consult' ||
                routing === 'Medicine' ||
                routing === 'Test' ||
                routing === 'Speciality' ||
                routing === 'Doctor' ||
                routing === 'DoctorSearch' ||
                routing === 'MedicineSearch' ||
                routing === 'MedicineDetail'
              ) {
                if (tempArray.indexOf(el.notificatio_details.id) == -1) {
                  tempArray.push(el.notificatio_details.id);
                  return true;
                }
              }
            }
            return false;
          });

          const selectedCount = filteredNotifications.filter((item: any) => {
            return item.isActive === true;
          });

          setNotificationCount && setNotificationCount(selectedCount.length);
          setAllNotifications && setAllNotifications(filteredNotifications);

          AsyncStorage.setItem('allNotification', JSON.stringify(filteredNotifications));
        } catch (error) {}
      })
      .catch((error: Error) => {
        console.log('error', error);
      });
  };

  const buildName = () => {
    switch (apiRoutes.graphql()) {
      case 'https://aph-dev-api.apollo247.com//graphql':
        return 'DEV';
      case 'https://aph-staging-api.apollo247.com//graphql':
        return 'QA';
      case 'https://stagingapi.apollo247.com//graphql':
        return 'VAPT';
      case 'https://aph.uat.api.popcornapps.com//graphql':
        return 'UAT';
      case 'https://api.apollo247.com//graphql':
        return 'PROD';
      case 'https://asapi.apollo247.com//graphql':
        return 'PRF';
      case 'https://devapi.apollo247.com//graphql':
        return 'DEVReplica';
      default:
        return '';
    }
  };

  useEffect(() => {
    console.log('consultroom', currentPatient);

    currentPatient && setshowSpinner(false);
    if (!currentPatient) {
      // getPatientApiCall();
    } else {
      AsyncStorage.setItem('selectedProfileId', JSON.stringify(currentPatient.id));
      if (selectedProfile !== currentPatient.id) {
        getPersonalizesAppointments();
        setAppointmentLoading(true);
        setSelectedProfile(currentPatient.id);
        client
          .query<getPatientFutureAppointmentCount>({
            query: GET_PATIENT_FUTURE_APPOINTMENT_COUNT,
            fetchPolicy: 'no-cache',
            variables: {
              patientId: currentPatient.id,
            },
          })
          .then((data) => {
            const count = data?.data?.getPatientFutureAppointmentCount?.activeConsultsCount || 0;
            setCurrentAppointments(`${count}`);
            setAppointmentLoading(false);
          })
          .catch((e) => {
            CommonBugFender('ConsultRoom_getPatientFutureAppointmentCount', e);
          })
          .finally(() => setAppointmentLoading(false));
      }
    }
  }, [currentPatient, props.navigation.state.params]);

  useEffect(() => {
    async function fetchData() {
      const userLoggedIn = await AsyncStorage.getItem('gotIt');
      if (userLoggedIn == 'true') {
        setshowPopUp(false);
      } else {
        setshowPopUp(true);
        setTimeout(() => {
          setshowPopUp(false);
          CommonLogEvent(AppRoutes.ConsultRoom, 'ConsultRoom_BottomPopUp clicked');
          AsyncStorage.setItem('gotIt', 'true');
        }, 5000);
      }
      const eneabled = AppConfig.Configuration.ENABLE_CONDITIONAL_MANAGEMENT;
      setEnableCM(eneabled);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (isIos()) {
      initializeVoip();
    }

    getProductCashbackDetails();
    getUserProfileType();
  }, []);

  const initializeVoip = () => {
    VoipPushNotification.requestPermissions();
    VoipPushNotification.registerVoipToken();

    VoipPushNotification.addEventListener('register', (token: string) => {
      if (token) setVoipDeviceToken(token);
    });
  };

  useEffect(() => {
    if (voipDeviceToken) {
      setTimeout(() => {
        callVoipDeviceTokenAPI(); // for safer side(to get currentPatient.id)
      }, 2000);
    }
  }, [voipDeviceToken]);

  const callVoipDeviceTokenAPI = async () => {
    const input = {
      patientId: currentPatient ? currentPatient.id : '',
      voipToken: voipDeviceToken,
    };
    client
      .mutate<addVoipPushToken, addVoipPushTokenVariables>({
        mutation: SAVE_VOIP_DEVICE_TOKEN,
        variables: {
          voipPushTokenInput: input,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {})
      .catch((e) => {
        CommonBugFender('ConsultRoom_callDeviceVoipTokenAPI', e);
        console.log('Error occured while sending voip token', e);
      });
  };

  const getTokenforCM = async () => {
    const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
    const item = JSON.parse(retrievedItem || 'null');

    const callByPrism: any = await AsyncStorage.getItem('callByPrism');

    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const currentDeviceToken = deviceToken ? JSON.parse(deviceToken) : '';

    let allPatients;

    if (callByPrism === 'false') {
      allPatients =
        item && item.data && item.data.getPatientByMobileNumber
          ? item.data.getPatientByMobileNumber.patients
          : null;
    } else {
      allPatients =
        item && item.data && item.data.getCurrentPatients
          ? item.data.getCurrentPatients.patients
          : null;
    }

    const patientDetails = allPatients
      ? allPatients.find((patient: any) => patient.relation === Relation.ME) || allPatients[0]
      : null;

    const fullName = `${g(patientDetails, 'firstName') || ''}%20${g(patientDetails, 'lastName') ||
      ''}`;

    const patientUHID = patientDetails ? (patientDetails.uhid ? patientDetails.uhid : '') : '';

    if (patientUHID) {
      setshowSpinner(true);

      GenerateTokenforCM(
        patientDetails ? patientDetails.uhid : '',
        fullName,
        patientDetails ? (patientDetails.gender ? patientDetails.gender : '') : '',
        patientDetails ? (patientDetails.emailAddress ? patientDetails.emailAddress : '') : '',
        patientDetails ? (patientDetails.mobileNumber ? patientDetails.mobileNumber : '') : ''
      )
        .then((token: any) => {
          console.log(token, 'getTokenforCM');

          async function fetchTokenData() {
            setshowSpinner(false);

            const tokenValue = token.data.vitaToken; //await AsyncStorage.getItem('token');
            const buildSpecify = buildName();
            let keyHash;
            if (buildSpecify === 'QA' || buildSpecify === 'DEV' || buildSpecify === 'DEVReplica') {
              keyHash = '7729FD68-C552-4C90-B31E-98AA6C84FEBF~247Android';
            } else {
              keyHash = '4d4efe1a-cec8-4647-939f-09c25492721e~Apollo247';
            }
            console.log('tokenValue', tokenValue, keyHash);

            if (Platform.OS === 'ios') {
              if (tokenValue) {
                Vitals.vitalsToExport(tokenValue, buildSpecify);
                setTimeout(() => {
                  Vitals.goToReactNative(tokenValue);
                }, 500);
              }
            } else {
              const fullName = `${g(patientDetails, 'firstName') || ''}%20${g(
                patientDetails,
                'lastName'
              ) || ''}`;
              const UHID = `${g(patientDetails, 'uhid') || ''}`;
              tokenValue &&
                KotlinBridge.show(
                  tokenValue,
                  UHID,
                  fullName,
                  keyHash,
                  buildSpecify,
                  currentDeviceToken
                );
            }
          }

          fetchTokenData();
        })
        .catch((e) => {
          CommonBugFender('ConsultRoom_getTokenforCM', e);
          setshowSpinner(false);
        });
    } else {
      setshowSpinner(false);
      showAphAlert &&
        showAphAlert({
          title: 'Hi :)',
          description: 'We’re setting up your profile. Please check back soon!',
        });
    }
  };

  const getPersonalizesAppointments = async () => {
    // const uhid = g(details, 'uhid');

    const storedUhid: any = await AsyncStorage.getItem('selectUserUHId');

    const selectedUHID = storedUhid ? storedUhid : g(currentPatient, 'uhid');

    const uhidSelected = await AsyncStorage.getItem('UHIDused');
    // console.log('selectedUHID', selectedUHID);
    // console.log('selectUserId', selectUserId);

    if (uhidSelected !== null) {
      if (uhidSelected === selectedUHID) {
        if (Object.keys(appointmentsPersonalized).length != 0) {
          // console.log('appointmentsPersonalized', appointmentsPersonalized);

          setPersonalizedData(appointmentsPersonalized as any);
          setisPersonalizedCard(true);
        }
      } else {
        setPersonalizedData([]);
        setisPersonalizedCard(false);
      }
    }

    getPatientPersonalizedAppointmentList(client, selectedUHID)
      .then((data: any) => {
        const appointmentsdata =
          g(data, 'data', 'data', 'getPatientPersonalizedAppointments', 'appointmentDetails') || [];
        console.log('appointmentsdata', appointmentsdata);
        AsyncStorage.setItem('UHIDused', selectedUHID);

        if (appointmentsdata.doctorId !== null) {
          console.log('appointmentsdata_if', appointmentsdata);
          setPersonalizedData(appointmentsdata as any);
          setisPersonalizedCard(true);
          setAppointmentsPersonalized &&
            setAppointmentsPersonalized(
              appointmentsdata as getPatientPersonalizedAppointments_getPatientPersonalizedAppointments_appointmentDetails[]
            );
        } else {
          setPersonalizedData([]);
          setisPersonalizedCard(false);
          setAppointmentsPersonalized && setAppointmentsPersonalized([]);
          console.log('appointmentsdata_null_else', appointmentsdata);
        }
      })
      .catch((e) => {
        setPersonalizedData([]);
        setisPersonalizedCard(false);
      });
  };

  const renderBottomTabBar = () => {
    return (
      <View style={[styles.tabBarMainViewStyle, { height: showPopUp ? 0 : isIphoneX() ? 87 : 57 }]}>
        {tabBarOptions.map((tabBarOptions, i) => (
          <View key={i}>
            <TouchableOpacity
              activeOpacity={1}
              key={i}
              onPress={() => {
                if (i === 0) {
                  postHomeFireBaseEvent(FirebaseEventName.TABBAR_APPOINTMENTS_CLICKED, 'Menu');
                  postHomeWEGEvent(WebEngageEventName.TABBAR_APPOINTMENTS_CLICKED, 'Menu');
                  CommonLogEvent(AppRoutes.ConsultRoom, 'APPOINTMENTS clicked');
                  props.navigation.navigate('APPOINTMENTS');
                } else if (i == 1) {
                  postHomeFireBaseEvent(FirebaseEventName.VIEW_HELATH_RECORDS, 'Menu');
                  postHomeWEGEvent(WebEngageEventName.VIEW_HELATH_RECORDS, 'Menu');
                  CommonLogEvent(AppRoutes.ConsultRoom, 'HEALTH_RECORDS clicked');
                  props.navigation.navigate('HEALTH RECORDS');
                } else if (i == 2) {
                  postHomeFireBaseEvent(FirebaseEventName.BUY_MEDICINES, 'Menu');
                  postHomeWEGEvent(WebEngageEventName.BUY_MEDICINES, 'Menu');
                  CommonLogEvent(AppRoutes.ConsultRoom, 'MEDICINES clicked');
                  const eventAttributes: WebEngageEvents[WebEngageEventName.HOME_PAGE_VIEWED] = {
                    source: 'app home',
                  };
                  postWebEngageEvent(WebEngageEventName.HOME_PAGE_VIEWED, eventAttributes);
                  props.navigation.navigate('MEDICINES');
                } else if (i == 3) {
                  postHomeFireBaseEvent(FirebaseEventName.ORDER_TESTS, 'Menu');
                  postHomeWEGEvent(WebEngageEventName.ORDER_TESTS, 'Menu');
                  CommonLogEvent(AppRoutes.ConsultRoom, 'TESTS clicked');
                  props.navigation.navigate('TESTS');
                } else if (i == 4) {
                  postHomeFireBaseEvent(FirebaseEventName.MY_ACCOUNT, 'Menu');
                  postHomeWEGEvent(WebEngageEventName.MY_ACCOUNT);
                  CommonLogEvent(AppRoutes.ConsultRoom, 'MY_ACCOUNT clicked');
                  props.navigation.navigate('MY ACCOUNT');
                }
              }}
            >
              <View style={styles.tabBarViewStyle} key={i}>
                <View>
                  {tabBarOptions.image}
                  {i === 1 && renderBadgeView()}
                </View>
                <Text style={styles.tabBarTitleStyle}>{tabBarOptions.title}</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderProfileDrop = () => {
    return (
      <ProfileList
        showList={showList}
        onProfileChange={onProfileChange}
        navigation={props.navigation}
        saveUserChange={true}
        childView={
          <View
            style={{
              flexDirection: 'row',
              paddingRight: 8,
              borderRightWidth: 0,
              // paddingTop: 80,
              // marginTop: 30,
              borderRightColor: 'rgba(2, 71, 91, 0.2)',
            }}
          >
            {currentPatient?.gender === Gender.MALE ? (
              !!circleSubscriptionId ? (
                <MaleCircleIcon style={styles.profileIcon} />
              ) : (
                <MaleIcon style={styles.profileIcon} />
              )
            ) : !!circleSubscriptionId ? (
              <FemaleCircleIcon style={styles.profileIcon} />
            ) : (
              <FemaleIcon style={styles.profileIcon} />
            )}
            <Text style={styles.hiTextStyle}>{'hi'}</Text>
            <View style={styles.nameTextContainerStyle}>
              <View style={{ flexDirection: 'row', flex: 1 }}>
                <Text style={styles.nameTextStyle} numberOfLines={1}>
                  {currentPatient?.firstName || ''}
                </Text>
                {currentPatient && g(currentPatient, 'isUhidPrimary') ? (
                  <LinkedUhidIcon
                    style={{
                      width: 22,
                      height: 20,
                      marginLeft: 5,
                      marginTop: Platform.OS === 'ios' ? 16 : 20,
                    }}
                    resizeMode={'contain'}
                  />
                ) : null}
                <View style={{ paddingTop: 12, marginLeft: 6 }}>
                  <DropdownGreen />
                </View>
              </View>
              {currentPatient && <View style={styles.seperatorStyle} />}
            </View>
          </View>
        }
        // setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
        unsetloaderDisplay={true}
      />
    );
  };

  const renderListView = () => {
    return (
      <View>
        <ListCard
          container={{
            marginTop: 20,
            marginBottom: 32,
            shadowColor: '#4c808080',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.4,
            shadowRadius: 5,
            elevation: 5,
          }}
          title={'Active Appointments'}
          leftIcon={renderListCount(currentAppointments)}
          onPress={() => {
            postHomeWEGEvent(WebEngageEventName.ACTIVE_APPOINTMENTS);
            props.navigation.navigate('APPOINTMENTS');
          }}
        />
        {/* <ListCard
          container={{ marginTop: 14 }}
          title={'Active Orders'}
          leftIcon={renderListCount(2)}
          onPress={() => props.navigation.navigate(AppRoutes.YourOrdersScene)}
        /> */}
      </View>
    );
  };

  const renderListCount = (count: string) => {
    return (
      <View
        style={{
          height: 40,
          width: 40,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.CARD_BG,
          borderRadius: 5,
        }}
      >
        {appointmentLoading ? (
          <Spinner style={{ backgroundColor: 'transparent' }} spinnerProps={{ size: 'small' }} />
        ) : (
          <Text style={{ ...theme.viewStyles.text('M', 18, theme.colors.SKY_BLUE, 1, 24, 0) }}>
            {count}
          </Text>
        )}
      </View>
    );
  };

  const renderMenuOptions = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginLeft: 16,
          marginTop: 16,
          marginBottom: 8,
        }}
      >
        {listValues.map((item) => {
          if (menuViewOptions.findIndex((i) => i === item.id) >= 0) {
            if (item?.id < 3) {
              return (
                <TouchableOpacity activeOpacity={1} onPress={item.onPress}>
                  <LinearGradientComponent
                    style={[
                      styles.linearGradientView,
                      { shadowOffset: { width: 0, height: 5 }, elevation: 15 },
                    ]}
                  >
                    <View style={styles.topImageView}>
                      {item.image}
                      <Text style={styles.topTextStyle}>{item.title}</Text>
                    </View>
                    <View style={{ marginRight: 10 }}>
                      <WhiteArrowRightIcon />
                    </View>
                  </LinearGradientComponent>
                </TouchableOpacity>
              );
            } else {
              return (
                <TouchableOpacity activeOpacity={1} onPress={item.onPress}>
                  <View style={styles.bottomCardView}>
                    <View style={styles.bottomImageView}>{item.image}</View>
                    <View style={styles.bottomTextView}>
                      <Text
                        style={[theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 18)]}
                      >
                        {item.title}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }
          }
        })}
      </View>
    );
  };

  const renderBannersCarousel = () => {
    const showBanner = bannerData && bannerData.length ? true : false;
    if (showBanner) {
      return (
        <CarouselBanners
          navigation={props.navigation}
          planActivationCallback={() => {
            getUserSubscriptionsByStatus();
            getUserSubscriptionsWithBenefits();
            getUserBanners();
            circleActivatedRef.current = false;
          }}
          circleActivated={circleActivatedRef.current}
          circlePlanValidity={circlePlanValidity}
          from={string.banner_context.HOME}
          successCallback={() => {
            getUserSubscriptionsWithBenefits();
          }}
        />
      );
    }
  };

  const renderCovidMainView = () => {
    return (
      <View
        style={{
          backgroundColor: '#f0f1ec',
          padding: 20,
          paddingBottom: 0,
          paddingTop: 0,
        }}
      >
        {renderCovidCardView()}
      </View>
    );
  };

  const renderCovidBlueButtons = (
    onButtonClick: TouchableOpacityProps['onPress'],
    buttonIcon: React.ReactNode,
    title: string
  ) => {
    return (
      <TouchableOpacity activeOpacity={0.5} onPress={onButtonClick} style={styles.covidToucahble}>
        <View style={styles.covidIconView}>{buttonIcon}</View>
        <View style={styles.covidTitleView}>
          <Text style={{ ...theme.viewStyles.text('M', 14, theme.colors.WHITE) }}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCovidCardView = () => {
    return (
      <View style={styles.covidCardContainer}>
        <ImageBackground
          style={{ overflow: 'hidden', width: '100%', height: 150 }}
          resizeMode={'stretch'}
          source={require('@aph/mobile-patients/src/images/home/healthcareEcosystem.png')}
        >
          <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
            <Text
              style={{
                marginBottom: 8,
                ...theme.viewStyles.text('SB', 20, theme.colors.WHITE, 1, 29),
              }}
            >
              {string.common.healthcareEcosystemBannerText}
            </Text>
            <Text style={{ ...theme.viewStyles.text('R', 12, theme.colors.WHITE, 1, 18) }}>
              {string.common.healthcareEcosystemBannerDescription}
            </Text>
          </View>
        </ImageBackground>
        {/* <Image style={{ position: 'absolute', top: 24, alignSelf: 'center', width: 80, height: 80 }} source={require('@aph/mobile-patients/src/images/home/coronavirus_image.png')} /> */}
        <View style={{ padding: 16, paddingTop: 24 }}>
          {renderContent(string.common.healthBlog, string.common.healthBlogDescription)}
          {renderContent(string.common.covid19VaccineInfo, string.common.covidDescription)}
          {renderCovidHelpButtons()}
        </View>
      </View>
    );
  };

  const renderContent = (title: string, description: string) => {
    return (
      <View>
        <Text style={{ ...theme.viewStyles.text('SB', 16, theme.colors.GREEN) }}>{title}</Text>
        <Text style={{ ...theme.viewStyles.text('M', 12, '#01475b', 0.6, 18), marginTop: 16 }}>
          {description}
        </Text>
        {renderContentButton(title)}
        {title === string.common.covid19VaccineInfo
          ? renderContentButton(string.common.covidVaccineTracker)
          : null}
        {renderDashedLine()}
      </View>
    );
  };

  const renderDashedLine = () => {
    return <DashedLine style={styles.plainLine} />;
  };

  const renderCovidHelpButtons = () => {
    return (
      <View style={{ marginHorizontal: 0 }}>
        <Text
          style={{
            ...theme.viewStyles.text('SB', 12, theme.colors.SHERPA_BLUE, 1, 18),
            marginBottom: 4,
          }}
        >
          {string.common.covidYouCanText}
        </Text>

        {renderCovidBlueButtons(
          onPressHealthPro,
          <ApolloHealthProIcon style={{ width: 28, height: 28 }} resizeMode="stretch" />,
          'Explore Apollo ProHealth'
        )}
        {renderCovidBlueButtons(
          onPressRiskLevel,
          <CovidRiskLevel style={{ width: 24, height: 24 }} />,
          'Check your risk level'
        )}
        {/* {renderCovidBlueButtons(
          onPressMentalHealth,
          <CovidHealthScan style={{ width: 24, height: 24 }} />,
          'Take a mental health scan'
        )} */}
        {renderCovidBlueButtons(
          onPressHealthyLife,
          <HealthyLife style={{ width: 24, height: 24 }} />,
          `${AppConfig.Configuration.HdfcHealthLifeText}`
        )}
        {renderCovidBlueButtons(
          onPressKavach,
          <KavachIcon style={{ width: 24, height: 24 }} />,
          `${AppConfig.Configuration.HOME_SCREEN_KAVACH_TEXT}`
        )}
      </View>
    );
  };

  const renderContentButton = (title: string) => {
    const btnTitle =
      title === string.common.covidVaccineTracker
        ? string.common.covidVaccineTracker
        : title === string.common.healthBlog
        ? string.common.readLatestArticles
        : title === string.common.covid19VaccineInfo
        ? string.common.learnAboutCovid
        : '';
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={{
          shadowColor: '#4c808080',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.4,
          shadowRadius: 5,
          elevation: 5,
          backgroundColor: '#fff',
          flexDirection: 'row',
          height: 0.06 * height,
          marginTop: 16,
          borderRadius: 10,
          flex: 1,
        }}
        onPress={() => {
          btnTitle === string.common.covidVaccineTracker
            ? onPressVaccineTracker()
            : btnTitle === string.common.readLatestArticles
            ? onPressReadArticles()
            : btnTitle === string.common.learnAboutCovid
            ? onPressLearnAboutCovid()
            : null;
        }}
      >
        <View
          style={{
            flex: 0.17,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {btnTitle === string.common.covidVaccineTracker ? (
            <CovidRiskLevel style={{ width: 20, height: 20 }} />
          ) : btnTitle === string.common.readLatestArticles ? (
            <LatestArticle style={{ width: 20, height: 20 }} />
          ) : btnTitle === string.common.learnAboutCovid ? (
            <CovidOrange style={{ width: 20, height: 20 }} />
          ) : null}
        </View>
        <View
          style={{
            flex: 0.83,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Text style={[theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW, 1, 18)]}>
            {btnTitle}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const onPressReadArticles = () => {
    postHomeWEGEvent(WebEngageEventName.READ_ARTICLES);
    try {
      const openUrl = AppConfig.Configuration.BLOG_URL;
      props.navigation.navigate(AppRoutes.CovidScan, {
        covidUrl: openUrl,
      });
    } catch (e) {}
  };

  const onPressVaccineTracker = () => {
    postHomeWEGEvent(WebEngageEventName.COVID_VACCINE_TRACKER);
    try {
      const userMobNo = g(currentPatient, 'mobileNumber');
      const openUrl = `${AppConfig.Configuration.COVID_VACCINE_TRACKER_URL}?utm_source=mobile_app&user_mob=${userMobNo}`;
      console.log('openUrl', openUrl);
      props.navigation.navigate(AppRoutes.CovidScan, {
        covidUrl: openUrl,
      });
    } catch (e) {}
  };

  const onPressLearnAboutCovid = async () => {
    const deviceToken = (await AsyncStorage.getItem('jwt')) || '';
    const currentDeviceToken = deviceToken ? JSON.parse(deviceToken) : '';
    const covidUrlWithPrm = AppConfig.Configuration.COVID_LATEST_ARTICLES_URL.concat(
      '&utm_token=',
      currentDeviceToken,
      '&utm_mobile_number=',
      currentPatient && g(currentPatient, 'mobileNumber') ? currentPatient.mobileNumber : ''
    );

    postHomeWEGEvent(WebEngageEventName.LEARN_MORE_ABOUT_CORONAVIRUS);
    props.navigation.navigate(AppRoutes.CovidScan, {
      covidUrl: covidUrlWithPrm,
    });
  };

  const onPressHealthPro = async () => {
    const deviceToken = (await AsyncStorage.getItem('jwt')) || '';
    const currentDeviceToken = deviceToken ? JSON.parse(deviceToken) : '';
    const healthProWithParams = AppConfig.Configuration.APOLLO_PRO_HEALTH_URL.concat(
      '&utm_token=',
      currentDeviceToken,
      '&utm_mobile_number=',
      currentPatient && g(currentPatient, 'mobileNumber') ? currentPatient.mobileNumber : ''
    );
    postHomeWEGEvent(WebEngageEventName.APOLLO_PRO_HEALTH);

    try {
      props.navigation.navigate(AppRoutes.CovidScan, {
        covidUrl: healthProWithParams,
      });
    } catch (e) {
      setBugFenderLog('CONSULT_ROOM_FAILED_OPEN_URL', healthProWithParams);
    }
  };

  const onPressRiskLevel = () => {
    postHomeWEGEvent(WebEngageEventName.CHECK_YOUR_RISK_LEVEL);
    const urlToOpen = AppConfig.Configuration.COVID_RISK_LEVEL_URL;
    try {
      if (Platform.OS === 'ios') {
        Linking.canOpenURL(urlToOpen).then((supported) => {
          if (supported) {
            Linking.openURL(urlToOpen);
          } else {
            setBugFenderLog('CONSULT_ROOM_FAILED_OPEN_URL', urlToOpen);
          }
        });
      } else {
        props.navigation.navigate(AppRoutes.CovidScan, {
          covidUrl: urlToOpen,
          requestMicroPhonePermission: true,
        });
      }
    } catch (e) {
      setBugFenderLog('CONSULT_ROOM_FAILED_OPEN_URL', urlToOpen);
    }
  };

  const onPressKavach = () => {
    postHomeWEGEvent(WebEngageEventName.APOLLO_KAVACH_PROGRAM);
    try {
      const openUrl = AppConfig.Configuration.KAVACH_URL;
      props.navigation.navigate(AppRoutes.CovidScan, {
        covidUrl: openUrl,
      });
    } catch (e) {}
  };

  const onPressHealthyLife = () => {
    postHomeWEGEvent(WebEngageEventName.HDFC_HEALTHY_LIFE);
    if (hdfcUserSubscriptions != null && hdfcStatus == 'active') {
      props.navigation.navigate(AppRoutes.MembershipDetails, {
        membershipType: g(hdfcUserSubscriptions, 'name'),
        isActive: g(hdfcUserSubscriptions, 'isActive'),
      });
    } else {
      try {
        const openUrl = AppConfig.Configuration.HDFC_HEALTHY_LIFE_URL;
        props.navigation.navigate(AppRoutes.CovidScan, {
          covidUrl: openUrl,
        });
      } catch (e) {}
    }
  };

  const renderCovidScanBanner = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          {
            props.navigation.navigate(AppRoutes.CovidScan);
          }
        }}
        style={{
          height: 0.06 * height,
          marginHorizontal: 20,
          marginTop: 16,
          borderRadius: 10,
          flex: 1,
          flexDirection: 'row',
          backgroundColor: '#02475b',
        }}
      >
        <View
          style={{
            flex: 0.17,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Scan style={{ height: 28, width: 21 }} />
        </View>
        <View
          style={{
            flex: 0.83,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Text style={{ ...theme.viewStyles.text('SB', 14, theme.colors.WHITE, 1, 20) }}>
            {AppConfig.Configuration.HOME_SCREEN_COVIDSCAN_BANNER_TEXT}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderTopIcons = () => {
    const onPressCart = () => {
      const route =
        (shopCartItems.length && cartItems.length) || (!shopCartItems.length && !cartItems.length)
          ? AppRoutes.MedAndTestCart
          : shopCartItems.length
          ? AppRoutes.MedicineCart
          : AppRoutes.TestsCart;
      props.navigation.navigate(route);
    };

    return (
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          paddingTop: 16,
          paddingHorizontal: 16,
          backgroundColor: theme.colors.CLEAR,
          paddingBottom: 15,
        }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <ApolloLogo style={{ width: 57, height: 37 }} resizeMode="contain" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity activeOpacity={1} onPress={onPressCart}>
            <CartIcon />
            {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              postHomeWEGEvent(WebEngageEventName.NOTIFICATION_ICON);
              props.navigation.navigate(AppRoutes.NotificationScreen);
            }}
          >
            <NotificationIcon style={{ marginLeft: 10, marginRight: 5 }} />
            {notificationCount > 0 && renderBadge(notificationCount, {})}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAppointmentWidget = () => {
    return (
      <View>
        <ConsultPersonalizedCard
          rowData={personalizedData}
          onClickButton={() => {
            const { doctorDetails } = personalizedData;
            const eventAttributes: WebEngageEvents[WebEngageEventName.HOMEPAGE_WIDGET_FOLLOWUP_CLICK] = {
              'Doctor ID': personalizedData.doctorId,
              'Speciality ID': doctorDetails.specialty.id,
              'Hospital City': personalizedData.hospitalLocation,
              'Consult Mode': personalizedData.appointmentType,
              'Doctor Speciality': doctorDetails.specialty.name,
              'Customer ID': currentPatient.id,
              'Patient Name': currentPatient.firstName,
              'Patient Age': Math.round(
                moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
              ),
              'Patient Gender': currentPatient.gender,
              'Patient UHID': currentPatient.uhid,
            };
            postWebEngageEvent(WebEngageEventName.HOMEPAGE_WIDGET_FOLLOWUP_CLICK, eventAttributes);
            console.log('personalizedData.doctorDetails.id ', personalizedData.doctorDetails.id);
            props.navigation.navigate(AppRoutes.DoctorDetails, {
              doctorId: personalizedData ? personalizedData.doctorDetails.id : '',
              showBookAppointment: true,
              consultedWithDoctorBefore: true,
            });
          }}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        <ScrollView style={{ flex: 1 }} bounces={false}>
          <View style={{ width: '100%' }}>
            <View style={styles.viewName}>
              {renderTopIcons()}
              <View style={{ flexDirection: 'row' }}>{renderProfileDrop()}</View>
              <Text style={styles.descriptionTextStyle}>{string.common.weAreHereToHelpYou}</Text>
              {isPersonalizedCard && renderAppointmentWidget()}
              {renderMenuOptions()}
              <View style={{ backgroundColor: '#f0f1ec' }}>{renderBannersCarousel()}</View>
              <View style={{ backgroundColor: '#f0f1ec' }}>{renderListView()}</View>
              {renderCovidMainView()}
              {/* {renderCovidHeader()}
              {renderCovidCardView()} 
              {renderCovidScanBanner()}
              {renderEmergencyCallBanner()}*/}
            </View>
          </View>
          {/* <View style={{ backgroundColor: '#f0f1ec' }}>
            <NeedHelpAssistant
              containerStyle={{ marginTop: 16, marginBottom: 32 }}
              navigation={props.navigation}
              onNeedHelpPress={() => {
                postHomeWEGEvent(WebEngageEventName.NEED_HELP, 'Home Screen');
              }}
            />
          </View> */}
        </ScrollView>
      </SafeAreaView>
      {renderBottomTabBar()}
      {showPopUp && (
        <>
          <BottomPopUp
            title={`Hi ${(currentPatient && currentPatient.firstName) || ''}`}
            description={string.home.welcome_popup.description}
          >
            <View style={{ height: 20, alignItems: 'flex-end' }} />
          </BottomPopUp>
          <TouchableOpacity
            onPress={() => {
              CommonLogEvent(AppRoutes.ConsultRoom, 'ConsultRoom_BottomPopUp clicked');
              AsyncStorage.setItem('gotIt', 'true');
              setshowPopUp(false);
            }}
            style={{
              backgroundColor: 'transparent',
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />
        </>
      )}
      {showSpinner && <Spinner />}
      {isLocationSearchVisible && (
        <LocationSearchPopup
          onPressLocationSearchItem={() => {
            setCurrentLocationFetched!(true);
            setLocationSearchVisible(false);
          }}
          location={g(locationDetails, 'displayName')}
          onClose={() => {
            setLocationSearchVisible(false);
            !g(locationDetails, 'displayName') && askLocationPermission();
          }}
        />
      )}
      <NotificationListener navigation={props.navigation} />
    </View>
  );
};
