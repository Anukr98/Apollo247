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
  appGlobalCache,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { WebView } from 'react-native-webview';
import { fireCirclePurchaseEvent } from '@aph/mobile-patients/src/components/MedicineCart/Events';
import { dateFormatterDDMM } from '@aph/mobile-patients/src/utils/dateUtil';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { AppRoutes, getCurrentRoute } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NotificationListener } from '@aph/mobile-patients/src/components/NotificationListener';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { CarouselBanners } from '@aph/mobile-patients/src/components/ui/CarouselBanners';
import CovidButton from '@aph/mobile-patients/src/components/ConsultRoom/Components/CovidStyles';
import firebaseAuth from '@react-native-firebase/auth';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import remoteConfig from '@react-native-firebase/remote-config';
import {
  CartIcon,
  ConsultationRoom,
  CovidOrange,
  CovidRiskLevel,
  DashedLine,
  Diabetes,
  DoctorIcon,
  KavachIcon,
  HealthyLife,
  LatestArticle,
  MedicineIcon,
  MyHealth,
  NotificationIcon,
  Person,
  PrescriptionMenu,
  Symptomtracker,
  TestsCartIcon,
  TestsIcon,
  WhiteArrowRightIcon,
  ArrowRight,
  VaccineTracker,
  ProHealthIcon,
  BackArrow,
  SearchAreaIcon,
  RemoveIconGrey,
  SearchNoResultIcon,
  BookVaccineIcon,
  LabTestBrownIcon,
  PercentOffBrownIcon,
  TimeGreenIcon,
  Card,
  CashbackIcon,
  WhiteArrowRight,
  MedicineHomeIcon,
  TimeBlueIcon,
  WalletHomeHC,
  DropDownProfile,
  CallIcon,
  HospitalVisit,
  VideoConsult,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  BannerDisplayType,
  BookingSource,
  BookingStatus,
  MedicalRecordType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getDoctorList } from '@aph/mobile-patients/src/graphql/types/getDoctorList';
import { dateFormatter } from '@aph/mobile-patients/src/utils/dateUtil';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { LocationSearchPopup } from '@aph/mobile-patients/src/components/ui/LocationSearchPopup';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import { CircleMembershipActivation } from '@aph/mobile-patients/src/components/ui/CircleMembershipActivation';
import {
  CommonBugFender,
  CommonLogEvent,
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
  GET_USER_PROFILE_TYPE,
  GET_CIRCLE_SAVINGS_OF_USER_BY_MOBILE,
  GET_ONEAPOLLO_USER,
  GET_PLAN_DETAILS_BY_PLAN_ID,
  GET_DOCTOR_LIST,
  SAVE_RECENT_SEARCH,
  GET_CONFIGURATION_FOR_ASK_APOLLO_LEAD,
  GET_CAMPAIGN_ID_FOR_REFERRER,
  GET_REWARD_ID,
} from '@aph/mobile-patients/src/graphql/profiles';
import { MedFilter, MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  GetAllUserSubscriptionsWithPlanBenefitsV2,
  GetAllUserSubscriptionsWithPlanBenefitsV2Variables,
} from '@aph/mobile-patients/src/graphql/types/GetAllUserSubscriptionsWithPlanBenefitsV2';
import { GetCashbackDetailsOfPlanById } from '@aph/mobile-patients/src/graphql/types/GetCashbackDetailsOfPlanById';
import { getUserProfileType } from '@aph/mobile-patients/src/graphql/types/getUserProfileType';
import { getPatientFutureAppointmentCount } from '@aph/mobile-patients/src/graphql/types/getPatientFutureAppointmentCount';
import {
  GetSubscriptionsOfUserByStatus,
  GetSubscriptionsOfUserByStatusVariables,
} from '@aph/mobile-patients/src/graphql/types/GetSubscriptionsOfUserByStatus';
import { Gender, Relation } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  GenerateTokenforCM,
  notifcationsApi,
  GenrateVitalsToken_CM,
  GetProhealthActiveStatusForUhid_CM,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { apiRoutes } from '@aph/mobile-patients/src/helpers/apiRoutes';
import UserAgent from 'react-native-user-agent';
import {
  getAllProHealthAppointments,
  getUserBannersList,
  saveTokenDevice,
  updatePatientAppVersion,
  getDiagnosticSearchResults,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { Cache } from 'react-native-cache';
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
  timeDiffDaysFromNow,
  setCircleMembershipType,
  apiCallEnums,
  getUserType,
  persistHealthCredits,
  getHealthCredits,
  postCleverTapEvent,
  getCleverTapCircleMemberValues,
  getAge,
  removeObjectNullUndefinedProperties,
  isValidSearch,
  fileToBase64,
  formatUrl,
  checkCleverTapLoginStatus,
  isEmptyObject,
  postOfferCardClickEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  PatientInfo,
  PatientInfoWithSource,
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import KotlinBridge from '@aph/mobile-patients/src/KotlinBridge';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import { USER_AGENT } from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import messaging from '@react-native-firebase/messaging';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  Image,
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
  Keyboard,
  TextInput,
  BackHandler,
  Image as ImageNative,
} from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ScrollView, Switch } from 'react-native-gesture-handler';
import VoipPushNotification from 'react-native-voip-push-notification';
import WebEngage from 'react-native-webengage';
import { NavigationScreenProps, FlatList, NavigationEvents } from 'react-navigation';
import {
  addVoipPushToken,
  addVoipPushTokenVariables,
} from '@aph/mobile-patients/src/graphql/types/addVoipPushToken';
import {
  LinearGradientComponent,
  LinearGradientVerticalComponent,
} from '@aph/mobile-patients/src/components/ui/LinearGradientComponent';

import { CircleTypeCard1 } from '@aph/mobile-patients/src/components/ui/CircleTypeCard1';
import { CircleTypeCard2 } from '@aph/mobile-patients/src/components/ui/CircleTypeCard2';
import { CircleTypeCard3 } from '@aph/mobile-patients/src/components/ui/CircleTypeCard3';
import { CircleTypeCard4 } from '@aph/mobile-patients/src/components/ui/CircleTypeCard4';
import { CircleTypeCard5 } from '@aph/mobile-patients/src/components/ui/CircleTypeCard5';
import { CircleTypeCard6 } from '@aph/mobile-patients/src/components/ui/CircleTypeCard6';
import { CircleTypeCard7 } from '@aph/mobile-patients/src/components/ui/CircleTypeCard7';
import { Overlay } from 'react-native-elements';
import { HdfcConnectPopup } from '@aph/mobile-patients/src/components/SubscriptionMembership/HdfcConnectPopup';
import { postCircleWEGEvent } from '@aph/mobile-patients/src/components/CirclePlan/Events';
import {
  renderCircleShimmer,
  renderBannerShimmer,
  renderGlobalSearchShimmer,
  renderAppointmentCountShimmer,
  renderCircleBox,
} from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import { ConsultedDoctorsCard } from '@aph/mobile-patients/src/components/ConsultRoom/Components/ConsultedDoctorsCard';
import { handleOpenURL, pushTheView } from '@aph/mobile-patients/src/helpers/deeplinkRedirection';
import { AuthContextProps } from '@aph/mobile-patients/src/components/AuthProvider';
import { GetPlanDetailsByPlanId } from '@aph/mobile-patients/src/graphql/types/GetPlanDetailsByPlanId';
import {
  CleverTapEventName,
  CleverTapEvents,
  DiagnosticHomePageSource,
  HomeScreenAttributes,
  PatientInfo as PatientInfoObj,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { getUniqueId } from 'react-native-device-info';
import _ from 'lodash';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { saveRecentVariables } from '@aph/mobile-patients/src/graphql/types/saveRecent';
import { getConfigurationForAskApolloLead } from '@aph/mobile-patients/src/graphql/types/getConfigurationForAskApolloLead';
import { ReferralBanner } from '@aph/mobile-patients/src/components/ui/ReferralBanner';
import { useReferralProgram } from '@aph/mobile-patients/src/components/ReferralProgramProvider';
import { setItem, getItem } from '@aph/mobile-patients/src/helpers/TimedAsyncStorage';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import { UpdateAppPopup } from '@aph/mobile-patients/src/components/ui/UpdateAppPopup';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import DeviceInfo from 'react-native-device-info';
import {
  DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE,
  DIAGNOSTIC_CTA_ITEMS,
} from '@aph/mobile-patients/src/components/Tests/utils/helpers';
import {
  DiagnosticCtaClicked,
  DiagnosticHomepageViewedEvent,
} from '@aph/mobile-patients/src/components/Tests/utils/Events';

const { Vitals } = NativeModules;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  menuOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 16,
    marginTop: 12,
  },
  searchBarMainViewStyle: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.WHITE,
  },
  deliveryInTatText: {
    ...theme.viewStyles.text('SB', 12, theme.colors.WHITE),
    alignSelf: 'center',
    marginTop: 1.5,
  },
  searchBarViewStyle: {
    backgroundColor: theme.colors.BLUE_FADED_FLAT,
    flexDirection: 'row',
    padding: 10,
    flex: 1,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.colors.D4_GRAY,
  },
  cancelTextStyle: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 20),
    marginLeft: 18,
  },
  textInputStyle: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 20),
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 1,
  },
  loaderViewStyle: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
  },
  loaderStyle: {
    height: 100,
    backgroundColor: 'transparent',
    alignSelf: 'center',
  },
  healthRecordTypeTextStyle: {
    ...theme.viewStyles.text('R', 12, theme.colors.SILVER_LIGHT, 1, 21),
    marginHorizontal: 13,
  },
  healthRecordTypeViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchListHeaderViewStyle: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  searchListHeaderTextStyle: {
    ...theme.viewStyles.text('M', 14, theme.colors.SHERPA_BLUE, 1, 21),
  },
  viewName: {
    backgroundColor: theme.colors.WHITE,
    width: '100%',
    marginBottom: 0,
  },
  covidCardContainer: {
    borderRadius: 6,
    backgroundColor: theme.colors.WHITE,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: theme.colors.D4_GRAY,
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
    marginLeft: 7,
    ...theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE, 1, 20),
  },
  nameTextContainerStyle: {
    maxWidth: '70%',
  },
  nameTextStyle: {
    marginLeft: 4,
    ...theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE, 1, 20),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    marginHorizontal: 5,
    marginBottom: 6,
    marginTop: 1,
  },
  descriptionTextStyle: {
    marginHorizontal: 16,
    marginTop: 6,
    ...theme.viewStyles.text('M', 14, theme.colors.SKY_BLUE),
  },
  readArticleStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
  },
  covidContainer: {
    marginHorizontal: 20,
    ...theme.viewStyles.cardViewStyle,
    marginVertical: 20,
  },
  covidTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 10,
  },
  covidTitle: {
    ...theme.viewStyles.text('M', 13, theme.colors.SHERPA_BLUE),
    marginLeft: 10,
    width: width - 100,
  },
  covidIcon: {
    width: 20,
    height: 20,
  },
  labelView: {
    position: 'absolute',
    top: -10,
    right: -8,
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
    height: 32,
    width: 32,
    resizeMode: 'contain',
  },
  menuOption2IconStyle: {
    height: 30,
    width: 24,
    resizeMode: 'contain',
  },
  menuOption2SubIconStyle: {
    height: 24,
    width: 24,
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
    marginVertical: 20,
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
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    width: width,
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
    ...theme.viewStyles.text('SB', 15, theme.colors.LIGHT_BLUE, 1, 18),
    textAlign: 'center',
    alignSelf: 'center',
    marginLeft: 10,
  },
  bottomCardView: {
    flexDirection: 'row',
    backgroundColor: '#FAFEFF',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 6,
    minHeight: 58,
    width: width / 2 - 20,
    marginRight: 12,
    marginBottom: 12,
    justifyContent: 'center',
    flex: 1,
  },
  bottom2CardView: {
    minHeight: 90,
    width: width / 2 - 22,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#7EA2AD',
    borderRadius: 6,
    padding: 4,
    justifyContent: 'center',
    backgroundColor: theme.colors.BLUE_FADED_FLAT,
  },
  bottom2SubCardView: {
    flexDirection: 'row',
    marginTop: 'auto',
    borderRadius: 4,
    height: 28,
  },
  bottomImageView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    flex: 0.2,
  },
  bottomTextView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 2,
    flex: 0.65,
  },
  bottomRightArrowView: {
    flex: 0.15,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bottom2TextView: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 4,
  },
  bottom2ImageView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    marginRight: 2,
  },
  bottom2SubImage: {
    height: 18,
    width: 18,
    resizeMode: 'contain',
  },
  covidSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readArticleSubContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 3,
    height: 80,
    backgroundColor: 'red',
    width: '100%',
  },
  goToConsultRoom: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  renderContent: {
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
  },
  renderSubContent: {
    flex: 0.17,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  congratulationsDescriptionPhysical: {
    marginHorizontal: 24,
    marginTop: 8,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    lineHeight: 24,
  },
  circleContainer: {
    backgroundColor: theme.colors.WHITE,
    marginTop: 6,
    marginHorizontal: 16,
    paddingHorizontal: 6,
    alignSelf: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    width: '93%',
  },
  circleCardsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 4,
    marginVertical: 8,
  },
  bannerDots: {
    height: 6,
    borderRadius: 4,
    marginHorizontal: 4,
    justifyContent: 'flex-start',
    backgroundColor: theme.colors.CAROUSEL_INACTIVE_DOT,
    width: 6,
  },
  circleCards: {
    ...theme.viewStyles.cardViewStyle,
    shadowOffset: { width: 1, height: 2 },
    elevation: 4,
    flexDirection: 'row',
    height: 88,
    width: width / 2.27,
    marginHorizontal: 3,
    marginBottom: 2,
    borderWidth: 1.2,
    borderStyle: 'solid',
    borderColor: '#FC9916',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  circleCardsTexts: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 8,
  },
  circleCardsImages: {
    flex: 0.4,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
  },
  circleCardsImage: {
    alignSelf: 'center',
    width: '100%',
    height: '100%',
  },
  circleRowsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    flex: 1,
  },
  circleButtonLeft: {
    width: 25,
    height: 25,
    borderColor: '#f5f0f0',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0.2, height: 0.2 },
    shadowOpacity: 0.3,
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: -4,
    top: 36,
    zIndex: 1,
  },
  circleButtonRight: {
    width: 25,
    height: 25,
    borderColor: '#f5f0f0',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0.2, height: 0.2 },
    shadowOpacity: 0.3,
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: -3,
    top: 36,
    zIndex: 1,
  },
  circleButtonImage: { width: 7, height: 12 },
  covidBtn: {
    minHeight: 40,
    height: 'auto',
    width: width / 2 - 35,
    marginLeft: 10,
    marginTop: 10,
  },
  activeAppointmentsContainer: {
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginVertical: 10,
    borderColor: '#D4D4D4',
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#FAFEFF',
  },
  covidIconStyle: {
    marginLeft: 10,
  },
  covidBtnTitle: {
    ...theme.viewStyles.text('SB', 11, theme.colors.APP_YELLOW),
    marginLeft: 8,
    width: width / 2 - 80,
  },
  overlayStyle: {
    width: width,
    height: 'auto',
    padding: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    flex: 1,
    justifyContent: 'center',
  },
  viewWebStyles: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 20,
  },
  webViewCompo: {
    flex: 1,
    backgroundColor: '#666666',
    width: width,
  },
  nestedWebView: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  proHealthBannerTouch: {
    backgroundColor: theme.colors.CLEAR,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#D4D4D4',
    marginTop: 8,
    marginHorizontal: 26,
    marginBottom: 12,
    padding: 0,
    width: width - 36,
    alignSelf: 'center',
    height: 150,
  },
  proHealthBannerImage: {
    height: 150,
    width: '100%',
  },
  countContainer: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAF6FF',
    borderRadius: 6,
  },
  recentOrSuggestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
  },
  searchResMainContainer: {
    width: width - 32,
    marginBottom: 2,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  searchRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  viewAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 'auto',
    justifyContent: 'space-between',
  },
  searchItemIcon: {
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#E6E6E6',
    width: 36,
    height: 36,
  },
  searchItemText: {
    padding: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 0.8,
    marginLeft: 4,
  },
  askApolloView: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginBottom: 14,
  },
  quickBookBtn: {
    width: 104,
    height: 25,
    padding: 4,
    backgroundColor: theme.colors.APP_YELLOW,
  },
  quickBookText: {
    ...theme.viewStyles.text('M', 14, theme.colors.WHITE, undefined, 17),
  },
  horizontalEnd: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
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
  secondaryConsultationCtaContainer: {
    marginVertical: 16,
  },
  secondaryConsultationCtaHeading: { ...theme.viewStyles.text('SB', 16, '#02475B') },
  secondaryCtaButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  secondaryCtaButton: {
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    flex: 0.45,
    paddingVertical: 10,
    paddingHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFEFF',
  },
  medCashbackContainer1: {
    marginHorizontal: 12,
    marginTop: 14,
    borderRadius: 4,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: Dimensions.get('window').width * 0.75,
  },
  medCouponContainer: {
    borderRadius: 4,
    borderColor: '#A15D59',
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    paddingVertical: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medBottomContainer: {
    flexDirection: 'row',
    marginVertical: 12,
    marginLeft: 12,
    marginRight: 9,
    justifyContent: 'space-between',
  },
  profileListChildContainer: {
    flexDirection: 'row',
    paddingRight: 8,
    marginLeft: 4,
    borderRightColor: 'rgba(2, 71, 91, 0.2)',
    alignItems: 'flex-end',
  },
  topCardContentContainer: {
    flexDirection: 'row',
    marginBottom: 2,
    marginTop: 20,
    paddingVertical: 4,
    marginLeft: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  topCardContentContainerSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 'auto',
  },
  offersCardsContainer: {
    width: width / 1.3,
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 135,
    borderColor: '#D4D4D4',
    borderWidth: 1,
  },
  offersCardNotch: {
    marginBottom: 4,
    borderRadius: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 12,
    left: 12,
  },
  offersCardCoupon: {
    marginHorizontal: 10,
    borderRadius: 4,
    borderColor: '#A15D59',
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: '#fff',
    paddingVertical: 2,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  offersCardCTA: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    backgroundColor: '#FC9916',
    marginVertical: 4,
    marginRight: 4,
  },
  deliveryRibbon: {
    marginLeft: -7,
    position: 'absolute',
    top: 4,
    zIndex: 999,
  },
  mOffersTitle: {
    marginHorizontal: 10,
    marginTop: 28,
    paddingBottom: 4,
    marginBottom: 'auto',
  },
  mOffersCouponContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    justifyContent: 'space-between',
    width: '100%',
  },
  bottomItemsDetailSplit: {
    height: 1,
    backgroundColor: '#E6E6E6',
    marginVertical: 6,
    marginRight: 4,
  },
  offerTitle: {
    marginHorizontal: 12,
    marginTop: 6,
  },
  offerSubtitle: {
    marginHorizontal: 12,
    marginTop: 6,
  },
  medCTAButton: {
    width: 106,
    height: 32,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
});

const RewardStatus = {
  REFEREE_REWARDED: 'REFEREE_REWARDED',
  REFERRER_REWARDED: 'REFERRER_REWARDED',
  NOT_ELIGIBLE_FOR_REWARD: 'NOT_ELIGIBLE_FOR_REWARD',
  ELIGIBLE_FOR_REWARD: 'ELIGIBLE_FOR_REWARD',
  SUCCESS: 'SUCCESS',
};

type menuOptions = {
  id: number;
  title: string;
  image: React.ReactNode;
  subtitle?: string;
  image2?: React.ReactNode;
  subCardColor?: string;
  subtitleColor?: string;
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

export interface HomeScreenProps extends NavigationScreenProps {}
export const HomeScreen: React.FC<HomeScreenProps> = (props) => {
  const homeCache = new Cache({
    namespace: 'home',
    policy: {
      maxEntries: 100,
    },
    backend: AsyncStorage,
  });

  const { isIphoneX } = DeviceHelper();
  const {
    setLocationDetails,
    locationDetails,
    setCurrentLocationFetched,
    notificationCount,
    setNotificationCount,
    setAllNotifications,
    setHdfcUserSubscriptions,
    hdfcUserSubscriptions,
    bannerDataHome,
    setBannerDataHome,
    bannerData,
    setBannerData,
    phrNotificationData,
    setCircleSubscription,
    setHdfcUpgradeUserSubscriptions,
    setCirclePlanId,
    healthCredits,
    setHealthCredits,
    setIsRenew,
    setHdfcPlanId,
    setCircleStatus,
    circleStatus,
    setHdfcStatus,
    hdfcStatus,
    setPharmacyUserType,
    pharmacyUserTypeAttribute,
    covidVaccineCtaV2,
    apisToCall,
    homeScreenParamsOnPop,
    setActiveUserSubscriptions,
    corporateSubscriptions,
    setCorporateSubscriptions,
    locationForDiagnostics,
    diagnosticServiceabilityData,
    axdcCode,
    homeBannerOfferSection,
    offersList,
    offersListLoading,
    recentGlobalSearchList,
    setRecentGlobalSearchList,
    myDoctorsCount,
    displayQuickBookAskApollo,
    setDisplayQuickBookAskApollo,
    displayAskApolloNumber,
    setDisplayAskApolloNumber,
    tabRouteJourney,
    setTabRouteJourney,
  } = useAppCommonData();
  const { fetchServerCart } = useServerCart();

  // const startDoctor = string.home.startDoctor;
  const [showPopUp, setshowPopUp] = useState<boolean>(false);
  const [membershipPlans, setMembershipPlans] = useState<any>([]);
  const [circleDataLoading, setCircleDataLoading] = useState<boolean>(true);
  const { getPatientApiCall, returnAuthToken, checkIsAppDepricated } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [isLocationSearchVisible, setLocationSearchVisible] = useState(false);
  const [showList, setShowList] = useState<boolean>(false);
  const [isFindDoctorCustomProfile, setFindDoctorCustomProfile] = useState<boolean>(false);
  const [upgradePlans, setUpgradePlans] = useState<SubscriptionData[]>([]);
  const [showCorporateVaccinationCta, setShowCorporateVaccinationCta] = useState<boolean>(false);
  const [vaccinationCmsIdentifier, setVaccinationCmsIdentifier] = useState<string>('');
  const [vaccinationSubscriptionId, setVaccinationSubscriptionId] = useState<string>('');
  const [vaccinationSubscriptionInclusionId, setVaccinationSubscriptionInclusionId] = useState<
    string
  >('');
  const [vaccinationSubscriptionName, setVaccinationSubscriptionName] = useState<string>('');
  const [vaccinationSubscriptionPlanId, setVaccinationSubscriptionPlanId] = useState<string>('');
  const [agreedToVaccineTnc, setAgreedToVaccineTnc] = useState<string>('');
  const [isSearchFocus, setIsSearchFocus] = useState(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const _searchInputRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState({});
  const testSearchResults = useRef<any[]>([]);
  const medSearchResults = useRef<MedicineProduct[]>([]);
  const consultSearchResults = useRef<any[]>([]);
  const [token, setToken] = useState<string | null>('');
  const [userMobileNumber, setUserMobileNumber] = useState<string | null>('');

  const [proHealthActiveAppointmentCount, setProHealthActiveAppointmentCount] = useState<
    string | number
  >('' | 0);
  const [proActiveAppointments, setProHealthActiveAppointment] = useState([] as any);
  const {
    cartItems,
    setIsDiagnosticCircleSubscription,
    isDiagnosticCircleSubscription,
  } = useDiagnosticsCart();
  const { APP_ENV } = AppConfig;
  const { setRewardId, setCampaignId, setCampaignName } = useReferralProgram();
  const [isReferrerAvailable, setReferrerAvailable] = useState<boolean>(false);
  const {
    setHdfcPlanName,
    setIsFreeDelivery,
    setCircleSubscriptionId,
    setCirclePlanSelected,
    setIsCircleSubscription,
    setCircleCashback,
    circleSubscriptionId,
    setHdfcSubscriptionId,
    setCorporateSubscription,
    corporateSubscription,
    setCirclePlanValidity,
    circlePlanValidity,
    setCirclePaymentReference,
    pharmacyCircleAttributes,
    setIsCircleExpired,
    circleSubPlanId,
    pinCode,
    isPharmacyPincodeServiceable,
    serverCartItems,
  } = useShoppingCart();
  const cartItemsCount = cartItems?.length + serverCartItems?.length! || 0;

  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [previousPatient, setPreviousPatient] = useState<any>(currentPatient);
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [menuViewOptions, setMenuViewOptions] = useState<number[]>([]);
  const [currentAppointments, setCurrentAppointments] = useState<string>('0');
  const [showCirclePlans, setShowCirclePlans] = useState<boolean>(false);
  const [enableCM, setEnableCM] = useState<boolean>(true);
  const { showAphAlert, hideAphAlert, setLoading } = useUIElements();
  const [isWEGFired, setWEGFired] = useState(false);
  const [renewNow, setRenewNow] = useState<String>('');
  const [isCircleMember, setIsCircleMember] = useState<String>('');
  const [circleSavings, setCircleSavings] = useState<number>(-1);
  const [showCircleActivationcr, setShowCircleActivationcr] = useState<boolean>(false);
  const [showWebView, setShowWebView] = useState<any>({ action: false });
  const [voipDeviceToken, setVoipDeviceToken] = useState<string>('');
  const [profileChange, setProfileChange] = useState<boolean>(false);
  const [showHdfcConnectPopup, setShowHdfcConnectPopup] = useState<boolean>(false);
  const [bannerLoading, setBannerLoading] = useState<boolean>(false);
  let circleActivated = props.navigation.getParam('circleActivated');
  let circlePurchaseStatus = props.navigation.getParam('paymentStatus');
  const circleActivatedRef = useRef<boolean>(circleActivated);
  const [referAndEarnPrice, setReferAndEarnPrice] = useState('100');
  const scrollCount = useRef<number>(0);

  //banner
  const [bannerFirstImage, setBannerFirstImage] = useState<string>('');
  const [showProxyBannerContainer, setShowProxyBannerContainer] = useState(true);

  //health credit
  const [isHealthCreditLoading, setHealthCreditLoading] = useState<boolean>(true);

  setTimeout(function() {
    setShowProxyBannerContainer(false);
  }, 3000);

  //prohealth
  const [isProHealthActive, setProHealthActive] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<AuthContextProps['isSigningIn']>(false);
  const [signInError, setSignInError] = useState<AuthContextProps['signInError']>(false);
  const [authToken, setAuthToken] = useState<string>('');
  const [depricatedAppData, setDepricatedAppData] = useState<any>(null);
  const auth = firebaseAuth();

  const planValiditycr = useRef<string>('');
  const planPurchasedcr = useRef<boolean | undefined>(false);
  const webengage = new WebEngage();
  const client = useApolloClient();
  const hdfc_values = string.Hdfc_values;

  //cache and storage

  // will be used in phase 2
  const [suggestSearches, setSuggestSearches] = useState<string[]>([
    'Some suggest search',
    'covid',
    'cipla',
  ]);

  const [offersListCache, setOffersListCache] = useState<any[]>([]);

  const [isCircleMemberCache, setIsCircleMemberCache] = useState<String>('');

  const saveDeviceNotificationToken = async (id: string) => {
    try {
      const oneTimeApiCall = await AsyncStorage.getItem('saveTokenDeviceApiCall');
      let token = await messaging().getToken();

      if (
        !token ||
        token === '' ||
        token?.length == 0 ||
        typeof token != 'string' ||
        typeof token == 'object'
      ) {
        token = await messaging().getToken(); //again retry
      }

      if (!oneTimeApiCall) {
        saveTokenDevice(client, token, id);
        await AsyncStorage.setItem('saveTokenDeviceApiCall', 'called');
      }
    } catch (error) {}
  };

  useEffect(() => {
    //Getting shared file path
    ReceiveSharingIntent.getReceivedFiles(
      (files: any) => {
        props.navigation.navigate(AppRoutes.PostShareAppointmentSelectorScreen, {
          sharedFiles: files,
        });
      },
      (error: any) => {},
      'ShareMedia' // share url protocol (must be unique to your app, suggest using your apple bundle id)
    );

    handleCachedData();
    updateOnHomeLaunch();
    getPatientApiCall();
    setVaccineLoacalStorageData();
    cleverTapEventForLoginDone();
    fetchUserAgent();
    firebaseTokenCheck();
    fetchServerCart();
  }, []);

  const handleSearchClose = () => {
    if (isSearchFocus || searchText?.length > 0) {
      onCancelTextClick();
      return true;
    } else return false;
  };

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', handleSearchClose);
    if (isSearchFocus) {
      cleverTapEventForSearchBarClick();
    }
    return () => handler.remove();
  }, [isSearchFocus]);

  const cleverTapEventForSearchBarClick = () => {
    let eventAttributes = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
      'Page name': 'HomePage',
      'Circle Member': !!circleSubscriptionId ? 'True' : 'False',
    };
    postCleverTapEvent(CleverTapEventName.SEARCH_BAR_CLICKED, eventAttributes);
  };
  const handleCachedData = async () => {
    setBannerLoading(true);

    homeCache.get('bannerFirstImage').then((bannerFirstImage: any) => {
      if (bannerFirstImage) {
        setBannerFirstImage(bannerFirstImage);
      }
    });

    homeCache.get('healthCredits').then((healthCredits: any) => {
      if (healthCredits) {
        setHealthCredits(healthCredits);
      }
      setHealthCreditLoading(false);
    });

    Promise.all([
      homeCache.get('isCircleMember'),
      homeCache.get('planValidity'),
      homeCache.get('renewNow'),
      homeCache.get('circleStatus'),
      homeCache.get('circleSavings'),
    ]).then((values: any[]) => {
      if (values[0]) {
        setIsCircleMember(values[0]);
      }
      if (values[1]) {
        setCirclePlanValidity!!(values[1]);
      }
      if (values[2]) {
        setRenewNow!!(values[2]);
      }
      if (values[3]) {
        setCircleStatus!!(values[3]);
      }
      if (values[4]) {
        setCircleSavings!!(values[4]);
      }

      setCircleDataLoading(false);
    });

    const cacheDataStringBuffer = await appGlobalCache.getAll();

    const offersListStringBuffer = cacheDataStringBuffer?.offersList?.value || '[]';
    setOffersListCache(JSON.parse(offersListStringBuffer));

    const count = cacheDataStringBuffer?.appointmentCount?.value || '0';
    if (count) {
      setCurrentAppointments(count);
    }

    const bannerDataCached = cacheDataStringBuffer?.bannerData?.value || '';

    if (bannerDataCached) {
      setBannerData!!(bannerDataCached || []);
    }
    setBannerLoading(false);

    const isCircleMembers = (await AsyncStorage.getItem('isCircleMember')) || '';
    setIsCircleMember(isCircleMembers);
  };

  const fetchUserAgent = () => {
    try {
      let userAgent = UserAgent?.getUserAgent();
      AsyncStorage.setItem(USER_AGENT, userAgent);
    } catch {}
  };

  async function checkProhealthStatus() {
    const storedUhid: any = await AsyncStorage.getItem('selectUserUHId');
    //for new users, patient uhid was coming as blank
    //storedUhid would be null for new users and called if both are same, since patient is changed twice.
    if (
      currentPatient?.id &&
      currentPatient?.uhid &&
      (!!storedUhid ? storedUhid == currentPatient?.uhid : storedUhid == null)
    ) {
      checkIsProhealthActive(currentPatient); //to show prohealth option
      getActiveProHealthAppointments(currentPatient); //to show the prohealth appointments
    }
  }

  const updateAppVersion = (currentPatient: any) => {
    if (currentPatient?.id) {
      updatePatientAppVersion(client, currentPatient);
    }
  };

  const getEventParams = async () => {
    const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
    const phoneNumber = await AsyncStorage.getItem('phoneNumber');
    const eventParams = {
      mobileNumber: phoneNumber,
      OS: Platform?.OS,
      AppVersion: DeviceInfo.getVersion(),
      loggedIn: userLoggedIn,
    };
    return eventParams;
  };

  // validating whether JWT token is returned by firebase or not
  const firebaseTokenCheck = async () => {
    const token = await returnAuthToken?.().catch((error) => {});
    if (!token) {
      // Firing a webEngage event to track number of anticipated logouts (if Logout is implemented incase of missing auth token)
      const params = await getEventParams();
      postWebEngageEvent(WebEngageEventName.LOGOUT_REQUIRED, params);
    }
  };

  //to be called only when the user lands via app launch
  const logHomePageViewed = async (attributes: any) => {
    const isAppOpened = await AsyncStorage.getItem('APP_OPENED');
    if (isAppOpened) {
      postHomeWEGEvent(WebEngageEventName.HOME_VIEWED, undefined, attributes);
      postHomeCleverTapEvent(CleverTapEventName.HOME_VIEWED, undefined, attributes);
    }
  };

  //to be called only when the user moved away from homepage
  const logHomePageMovedAway = async () => {
    const isMovedAwayFromHome = await AsyncStorage.getItem('APP_OPENED');
    if (isMovedAwayFromHome) {
      postHomeWEGEvent(WebEngageEventName.MOVED_AWAY_FROM_HOME);
      try {
        AsyncStorage.removeItem('APP_OPENED');
      } catch (error) {
        CommonBugFender('ConsultRoom_logHomePageMovedAwayError', error);
      }
    }
  };

  const beforeRedirectGetRewardIdAndCampaignId = async () => {
    try {
      const responseCampaign = await client.query({
        query: GET_CAMPAIGN_ID_FOR_REFERRER,
        fetchPolicy: 'no-cache',
      });
      const responseReward = await client.query({
        query: GET_REWARD_ID,
        variables: { reward: 'HC' },
        fetchPolicy: 'no-cache',
      });
      if (responseCampaign?.data?.getCampaignInfo?.id) {
        const campaignId = responseCampaign?.data?.getCampaignInfo?.id;
        const campaignName = responseCampaign?.data?.getCampaignInfo?.campaignType;
        setCampaignId?.(campaignId);
        setCampaignName?.(campaignName);
      }
      if (responseReward?.data?.getRewardInfoByRewardType?.id) {
        const rewardId = responseReward?.data?.getRewardInfoByRewardType?.id;
        setRewardId?.(rewardId);
      }
      props.navigation.navigate('ShareReferLink');
    } catch (e) {}
  };

  const phrNotificationCount = getPhrNotificationAllCount(phrNotificationData!);

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

  const setVaccineLoacalStorageData = () => {
    AsyncStorage.getItem('hasAgreedVaccineTnC').then((data) => {
      setAgreedToVaccineTnc(data);
    });

    AsyncStorage.getItem('VaccinationCmsIdentifier').then((data) => {
      setVaccinationCmsIdentifier(data);
    });

    AsyncStorage.getItem('VaccinationSubscriptionId').then((data) => {
      setVaccinationSubscriptionId(data);
    });

    AsyncStorage.getItem('VaccinationSubscriptionInclusionId').then((data) => {
      if (data) {
        setVaccinationSubscriptionInclusionId(data);
      }
    });
  };

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setVaccineLoacalStorageData();
      checkApisToCall();
      handleCachedData();

      AsyncStorage.getItem('verifyCorporateEmailOtpAndSubscribe').then((data) => {
        if (JSON.parse(data || 'false') === true) {
          getUserSubscriptionsWithBenefits();
        }
      });
    });
    setTimeout(() => {
      checkIsAppDepricated(currentPatient?.mobileNumber)
        .then(setDepricatedAppData)
        .catch((error) => {
          !!error && CommonBugFender('isAppVersionDeprecated', error);
        });
    }, 600);
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      apisToCall.current = [];
      homeScreenParamsOnPop.current = null;
    });

    return () => {
      didBlur && didBlur.remove();
      didFocus && didFocus.remove();
    };
  }, []);

  useEffect(() => {
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      circleActivatedRef.current = false;
      logHomePageMovedAway();
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
        } else if (!params?.isPhysicalConsultBooked) {
          overlyCallPermissions(
            currentPatient!,
            params?.doctorName,
            showAphAlert,
            hideAphAlert,
            true,
            () => {
              if (params?.doctorName) {
                showFreeConsultOverlay(params);
              }
            },
            'Home Screen'
          );
        } else {
          if (params?.doctorName) showFreeConsultOverlay(params);
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

      //check if previousPatient is not equalto currentPatient
      //if yes then update then call the desired api and also update the previousPatient
      if (
        previousPatient?.uhid != currentPatient?.uhid ||
        previousPatient?.id != currentPatient?.id
      ) {
        //DIFFRENT PATIENT
        updateOnHomeLaunch();
        setPreviousPatient(currentPatient);
      } else {
        // SAME PATIENT
      }
    } catch (e) {}
  }, [currentPatient]);

  const updateOnHomeLaunch = () => {
    //banner data
    if (!bannerData) {
      getUserBanners();
    }

    //call the desired apis
    getUserSubscriptionsWithBenefits();
    //for prohealth option
    checkProhealthStatus();

    checkCleverTapLoginStatus(currentPatient);
    updateAppVersion(currentPatient);

    if (currentPatient?.id) {
      saveDeviceNotificationToken(currentPatient.id);
    }

    if (currentPatient) {
      AsyncStorage.setItem('selectedProfileId', JSON.stringify(currentPatient.id));
      if (selectedProfile !== currentPatient.id) {
        getAppointmentsCount();
        setSelectedProfile(currentPatient.id);
      }
    }
  };

  useEffect(() => {
    if (upgradePlans?.length) {
      setHdfcUpgradeUserSubscriptions && setHdfcUpgradeUserSubscriptions(upgradePlans);
    }
  }, [upgradePlans]);

  const checkApisToCall = () => {
    currentPatient && saveDeviceNotificationToken(currentPatient.id);
    const params = homeScreenParamsOnPop.current;
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
        } else if (!params?.isPhysicalConsultBooked) {
          overlyCallPermissions(
            currentPatient!,
            params?.doctorName,
            showAphAlert,
            hideAphAlert,
            true,
            () => {
              if (params?.doctorName) {
                showFreeConsultOverlay(params);
              }
            },
            'Home Screen'
          );
        } else {
          if (params?.doctorName) showFreeConsultOverlay(params);
        }
      });
    }

    apisToCall?.current?.forEach((item: any) => {
      const {
        circleSavings,
        patientAppointmentsCount,
        getAllBanners,
        getUserSubscriptions,
        getUserSubscriptionsV2,
        oneApollo,
        pharmacyUserType,
        getPlans,
        plansCashback,
      } = apiCallEnums;
      switch (item) {
        case circleSavings:
          fetchCircleSavings();
          break;
        case patientAppointmentsCount:
          getAppointmentsCount();
          break;
        case getAllBanners:
          getUserBanners();
          break;
        case getUserSubscriptions:
          getUserSubscriptionsByStatus();
          break;
        case getUserSubscriptionsV2:
          getUserSubscriptionsWithBenefits();
          break;
        case oneApollo:
          fetchHealthCredits();
          break;
        case pharmacyUserType:
          getUserProfileType();
          break;
        case getPlans:
          fetchCarePlans();
          break;
        case plansCashback:
          getProductCashbackDetails();
          break;
        default:
          break;
      }
    });
  };

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
        const upcomingConsultsCount = appointmentCount?.upcomingConsultsCount || 0;
        const upcomingPhysicalConsultsCount = appointmentCount?.upcomingPhysicalConsultsCount || 0;

        if (
          upcomingConsultsCount - upcomingPhysicalConsultsCount > 0 &&
          getCurrentRoute() !== AppRoutes.ChatRoom
        ) {
          overlyCallPermissions(
            currentPatient!,
            'the doctor',
            showAphAlert,
            hideAphAlert,
            true,
            () => {},
            'Home Screen'
          );
        }
      }
    } catch (error) {
      CommonBugFender('ConsultRoom_getPatientFutureAppointmentCount', error);
    }
  };

  const postGoToConsultRoomEvent = (item: any) => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_GO_TO_CONSULT_ROOM_CLICKED] = {
      'Patient name': `${currentPatient?.firstName} ${currentPatient?.lastName}` || '',
      'Patient UHID': currentPatient?.uhid || '',
      'Doctor name': item?.doctorInfo?.fullName || '',
      'Speciality name': item?.doctorInfo?.specialty?.name || '',
      'Doctor ID': item?.doctorId || '',
      'Speciality ID': item?.doctorInfo?.specialty?.id || '',
      'Patient gender': currentPatient?.gender || '',
      'Patient age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
      'Hospital name': item?.doctorInfo?.doctorHospital?.[0]?.facility?.name || '',
      'Hospital city': item?.doctorInfo?.doctorHospital?.[0]?.facility?.city || '',
      Source: 'Payment confirmation screen',
      'Appointment datetime': moment(item?.appointmentDateTime).toDate(),
      'Display ID': item?.displayId,
      'Consult mode': item?.appointmentType || '',
    };
    postCleverTapEvent(CleverTapEventName.CONSULT_GO_TO_CONSULT_ROOM_CLICKED, eventAttributes);
  };

  const showFreeConsultOverlay = (params: any) => {
    const { isJdQuestionsComplete, appointmentDateTime, doctorInfo } = params?.appointmentData;
    const { skipAutoQuestions, isPhysicalConsultBooked } = params;
    const doctorName = params?.doctorName?.includes('Dr')
      ? params?.doctorName
      : `Dr ${params?.doctorName}`;
    let physical = false;
    const appointmentDate = moment(appointmentDateTime).format('Do MMMM YYYY');
    const appointmentTime = moment(appointmentDateTime).format('h:mm A');
    const diffMins = Math.ceil(moment(appointmentDateTime).diff(moment(), 'minutes', true));
    let hospitalLocation = '';
    let description = `Your online appointment with ${doctorName} is confirmed for ${appointmentDate} at ${appointmentTime}. You can expect your appointment to start between ${moment(
      appointmentDateTime
    ).format('h:mm A')} - ${moment(appointmentDateTime)
      .add('15', 'minutes')
      .format('h:mm A')} via an audio/video call.`;
    if (diffMins >= 30 && !isJdQuestionsComplete) {
      description = `${description} Please go to the consult to answer a few medical questions.`;
    }
    if (isPhysicalConsultBooked) {
      hospitalLocation = doctorInfo?.doctorHospital?.[0]?.facility?.name;
      description = ``;
      physical = true;
    }
    showAphAlert!({
      unDismissable: false,
      title: 'Appointment Confirmation',
      description: description,
      physical: physical,
      physicalText: (
        <Text style={styles.congratulationsDescriptionPhysical}>
          Your appointment has been successfully booked with {doctorName} for{' '}
          <Text style={{ color: '#02475B' }}>
            {dateFormatter(appointmentDateTime)} at {hospitalLocation + '.\n\n'}
          </Text>
          Please note that you will need to pay{' '}
          <Text style={{ color: '#02475B' }}>
            ???{doctorInfo.physicalConsultationFees} + One-time registration charges
          </Text>{' '}
          (For new users) at the hospital Reception.
        </Text>
      ),
      children: (
        <View style={{ height: 60, alignItems: 'flex-end' }}>
          {isPhysicalConsultBooked ? (
            <TouchableOpacity
              activeOpacity={0.5}
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
              activeOpacity={0.5}
              style={styles.goToConsultRoom}
              onPress={() => {
                hideAphAlert!();
                props.navigation.navigate(AppRoutes.ChatRoom, {
                  data: params?.appointmentData,
                });
                postGoToConsultRoomEvent(params?.appointmentData);
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
    source?: PatientInfoWithSource['Source'],
    attributes?: any
  ) => {
    let eventAttributes: PatientInfo = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
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
      (eventAttributes as PatientInfoWithSource)['Serviceability'] = isPharmacyPincodeServiceable
        ? 'Yes'
        : 'No';
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
    if (eventName == WebEngageEventName.HOME_VIEWED) {
      eventAttributes = { ...eventAttributes, ...attributes };
    }
    if (eventName == WebEngageEventName.COVID_VACCINATION_SECTION_CLICKED) {
      eventAttributes = { ...eventAttributes, ...attributes };
    }
    postWebEngageEvent(eventName, eventAttributes);
  };

  const postHospitalVisitClicked = () => {
    const attributes: CleverTapEvents[CleverTapEventName.CONSULT_HOSPITAL_CLICKED] = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,

      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Mobile number': g(currentPatient, 'mobileNumber'),
    };
    postCleverTapEvent(CleverTapEventName.CONSULT_HOSPITAL_CLICKED, attributes);
  };

  const postHomeCleverTapEvent = (
    eventName: CleverTapEventName,
    source?: HomeScreenAttributes['Source'],
    attributes?: any,
    ctaType?: string
  ) => {
    let eventAttributes: HomeScreenAttributes = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
      'Nav src': source === 'Home Screen' ? 'hero banner' : 'Bottom bar',
      'Page name': 'Home Screen',
    };
    if (
      source &&
      (eventName == CleverTapEventName.BUY_MEDICINES ||
        eventName == CleverTapEventName.ORDER_TESTS ||
        eventName == CleverTapEventName.VIEW_HELATH_RECORDS ||
        eventName == CleverTapEventName.NEED_HELP ||
        eventName == CleverTapEventName.HOMEPAGE_OFFERS_ACTIVITY)
    ) {
      (eventAttributes as HomeScreenAttributes)['Source'] = source;
    }
    if (
      locationDetails &&
      locationDetails.pincode &&
      eventName == CleverTapEventName.BUY_MEDICINES
    ) {
      (eventAttributes as HomeScreenAttributes)['Pincode'] = locationDetails?.pincode || undefined;
      (eventAttributes as HomeScreenAttributes)['Serviceability'] = isPharmacyPincodeServiceable
        ? 'Yes'
        : 'No';
    }
    if (eventName == CleverTapEventName.BUY_MEDICINES) {
      eventAttributes = {
        ...eventAttributes,
        'Circle Member':
          getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
          undefined,
        'Circle Membership Value':
          pharmacyCircleAttributes?.['Circle Membership Value'] || undefined,
        User_Type: pharmacyUserTypeAttribute?.User_Type || undefined,
      };
    }
    if (eventName == CleverTapEventName.CONSULT_HOMESCREEN_BOOK_DOCTOR_APPOINTMENT_CLICKED) {
      eventAttributes = {
        ...eventAttributes,
        isConsulted: getUserType(allCurrentPatients),
        'Circle Member': !!circleSubscriptionId,
        'Circle Plan type': circleSubPlanId || '',
        CTA: ctaType,
      };
    }
    if (eventName == CleverTapEventName.CONSULT_ACTIVE_APPOINTMENTS) {
      eventAttributes = {
        ...eventAttributes,
        'Nav src': source === 'Home Screen' ? 'Homepage' : 'Bottom bar',
        'Circle Member': !!circleSubscriptionId,
        'Circle Plan type': circleSubPlanId || '',
      };
    }
    if (eventName == CleverTapEventName.HDFC_HEALTHY_LIFE) {
      const subscription_name = hdfcUserSubscriptions?.name;
      const newAttributes = {
        HDFCMembershipState: !!g(hdfcUserSubscriptions, 'isActive') ? 'Active' : 'Inactive',
        HDFCMembershipLevel: subscription_name?.substring(0, subscription_name?.indexOf('+')),
        Circle_Member: !!circleSubscriptionId ? 'Yes' : 'No',
      };
      eventAttributes = { ...eventAttributes, ...newAttributes };
    }
    if (eventName == CleverTapEventName.HOME_VIEWED) {
      eventAttributes = {
        ...removeObjectNullUndefinedProperties(attributes),
        ...eventAttributes,
        'Nav src': 'app launch',
      };
    }
    if (
      eventName == CleverTapEventName.COVID_VACCINATION_SECTION_CLICKED ||
      CleverTapEventName.HOMEPAGE_OFFERS_ACTIVITY
    ) {
      eventAttributes = { ...eventAttributes, ...attributes };
    }
    postCleverTapEvent(eventName, eventAttributes);
  };

  const postVaccineWidgetEvents = (
    eventName: CleverTapEventName,
    navSrc?: HomeScreenAttributes['Nav src']
  ) => {
    let eventAttributes: HomeScreenAttributes = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
      'Nav src': navSrc || 'Vaccine Widget',
      'Page Name': 'Home Screen',
    };
    if (
      eventName === CleverTapEventName.KAVACH_PROGRAM_CLICKED ||
      eventName === CleverTapEventName.EXPLORE_CORPORATE_MEMBERSHIP_CLICKED ||
      eventName === CleverTapEventName.CHECK_RISK_LEVEL_CLICKED
    ) {
      eventAttributes['Nav src'] = undefined;
    }
    postCleverTapEvent(eventName, eventAttributes);
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
      (eventAttributes as PatientInfoWithSourceFirebase)[
        'Serviceability'
      ] = isPharmacyPincodeServiceable ? 'Yes' : 'No';
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

  const getCTAConfigItem = (id: number) => {
    return AppConfig.Configuration.HOME_CTA_CONFIG.find((configItem) => configItem.id === id);
  };

  const getHomeTitle = (id: number, defaultTitle: string) => {
    let ctaConfig = getCTAConfigItem(id);
    if (ctaConfig && ctaConfig?.title) {
      return ctaConfig?.title;
    }
    return defaultTitle;
  };

  function isHexColor(hex: string) {
    var reg = /^#([0-9a-f]{3}){1,2}$/i;
    return !!hex && hex.length >= 3 && hex.length <= 8 && hex.startsWith('#') && reg.test(hex);
  }

  const getHomeSubTitle = (id: number, defaultSubTitle: string) => {
    let ctaConfig = getCTAConfigItem(id);
    if (ctaConfig && ctaConfig?.sub_title) {
      return ctaConfig?.sub_title;
    }
    return defaultSubTitle;
  };

  const getSubCardColor = (id: number, defaultSubCardColor: string) => {
    let ctaConfig = getCTAConfigItem(id);
    if (ctaConfig && ctaConfig?.subtitle_card_color) {
      if (isHexColor(ctaConfig?.subtitle_card_color)) {
        return ctaConfig.subtitle_card_color;
      } else {
        return defaultSubCardColor;
      }
    }
    return defaultSubCardColor;
  };

  const getSubTitleColor = (id: number, defaultSubTitleColor: string) => {
    let ctaConfig = getCTAConfigItem(id);
    if (ctaConfig && ctaConfig?.subtitle_color) {
      if (isHexColor(ctaConfig?.subtitle_color)) {
        return ctaConfig?.subtitle_color;
      } else {
        return defaultSubTitleColor;
      }
    }
    return defaultSubTitleColor;
  };

  const getSubIconTintColor = (id: number) => {
    let ctaConfig = getCTAConfigItem(id);
    if (ctaConfig && ctaConfig.subtitle_image_tint_color) {
      if (isHexColor(ctaConfig.subtitle_image_tint_color)) {
        return ctaConfig.subtitle_image_tint_color;
      }
    }
    return undefined;
  };

  const getHomeCTAAction = (id: number, defaultAction: any) => {
    let ctaConfig = getCTAConfigItem(id);

    if (ctaConfig) {
      if (ctaConfig.action_deeplink) {
        try {
          Linking.openURL(ctaConfig.action_deeplink);
        } catch (e) {
          defaultAction();
        }
      } else {
        defaultAction();
      }
    } else {
      defaultAction();
    }
  };

  const getHealthRecordIcons = (id: number) => {
    let ctaConfig = getCTAConfigItem(id);
    if (ctaConfig && ctaConfig?.title && ctaConfig.title?.toLowerCase().includes('onetap')) {
      return <VideoConsult style={styles.menuOption2SubIconStyle} />;
    } else {
      return (
        <View>
          <PrescriptionMenu style={styles.menuOption2SubIconStyle} />

          {renderBadgeView()}
        </View>
      );
    }
  };

  const listOptions: menuOptions[] = [
    {
      id: 1,
      title: getHomeTitle(1, 'Buy Medicines and Essentials'),
      image: <MedicineHomeIcon style={[styles.menuOptionIconStyle]} />,
      subCardColor: getSubCardColor(1, '#EAF6FF'),
      subtitleColor: getSubTitleColor(1, '#2D6E85'),
      subtitle: getHomeSubTitle(1, 'Health Credits Available'),
      image2: (
        <WalletHomeHC style={[styles.bottom2SubImage, { tintColor: getSubIconTintColor(1) }]} />
      ),
      onPress: () => {
        getHomeCTAAction(1, () => {
          postHomeFireBaseEvent(FirebaseEventName.BUY_MEDICINES, 'Home Screen');
          postHomeWEGEvent(WebEngageEventName.BUY_MEDICINES, 'Home Screen');
          postHomeCleverTapEvent(CleverTapEventName.BUY_MEDICINES, 'Home Screen');
          props.navigation.navigate('MEDICINES', { comingFrom: '247 Home CTA' });
          const eventAttributes:
            | WebEngageEvents[WebEngageEventName.HOME_PAGE_VIEWED]
            | CleverTapEvents[CleverTapEventName.PHARMACY_HOME_PAGE_VIEWED] = {
            'Nav src': 'app home',
          };
          setTimeout(
            () => postCleverTapEvent(CleverTapEventName.PHARMACY_HOME_PAGE_VIEWED, eventAttributes),
            500
          );
          postWebEngageEvent(WebEngageEventName.HOME_PAGE_VIEWED, eventAttributes);
        });
      },
    },
    {
      id: 2,
      title: getHomeTitle(2, 'Book Lab Tests'),
      image: <LabTestBrownIcon style={styles.menuOption2IconStyle} />,
      image2: (
        <PercentOffBrownIcon
          style={[styles.bottom2SubImage, { tintColor: getSubIconTintColor(2) }]}
        />
      ),
      subtitle: getHomeSubTitle(2, 'Upto 60% Off'),
      subCardColor: getSubCardColor(2, 'rgba(254, 231, 218, 0.6)'),
      subtitleColor: getSubTitleColor(2, '#A05D1F'),
      onPress: () => {
        getHomeCTAAction(2, () => {
          const homeScreenAttributes = {
            'Nav src': 'hero banner',
            'Page Name': 'Home Screen',
            Source: DiagnosticHomePageSource.HOMEPAGE_CTA,
          };
          DiagnosticCtaClicked(
            currentPatient,
            isDiagnosticCircleSubscription,
            DIAGNOSTIC_CTA_ITEMS.MAIN_HOME
          );
          postHomeFireBaseEvent(FirebaseEventName.ORDER_TESTS, 'Home Screen');
          postHomeWEGEvent(WebEngageEventName.ORDER_TESTS, 'Home Screen');
          postDiagnosticHomepageViewedEvent(
            DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.HOME_PAGE_HERO_BUTTON
          );
          props.navigation.navigate('TESTS', { focusSearch: true, homeScreenAttributes });
        });
      },
    },
    {
      id: 3,
      title: getHomeTitle(3, 'Consult a Doctor'),
      image: <DoctorIcon style={[styles.menuOption2IconStyle]} />,
      image2: (
        <TimeGreenIcon style={[styles.bottom2SubImage, { tintColor: getSubIconTintColor(3) }]} />
      ),
      subtitle: getHomeSubTitle(3, 'Consult in 15 mins'),
      subCardColor: getSubCardColor(3, '#E6FFFD'),
      subtitleColor: getSubTitleColor(3, '#1FA098'),
      onPress: () => {
        getHomeCTAAction(3, () => {
          postHomeFireBaseEvent(FirebaseEventName.FIND_A_DOCTOR, 'Home Screen');
          postHomeWEGEvent(WebEngageEventName.BOOK_DOCTOR_APPOINTMENT);
          postHomeCleverTapEvent(
            CleverTapEventName.CONSULT_HOMESCREEN_BOOK_DOCTOR_APPOINTMENT_CLICKED,
            'Home Screen'
          );
          postHomepageEvent('Homepage banner');
          props.navigation.navigate(AppRoutes.DoctorSearch);
        });
      },
    },
    {
      id: 4,
      title: getHomeTitle(4, 'Book Doctor by Symptoms'),
      image: <Symptomtracker style={styles.menuOption2SubIconStyle} />,
      onPress: () => {
        getHomeCTAAction(4, () => {
          const eventAttributes:
            | WebEngageEvents[WebEngageEventName.SYMPTOM_TRACKER_PAGE_CLICKED]
            | CleverTapEvents[CleverTapEventName.SYMPTOM_TRACKER_PAGE_CLICKED] = {
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
          postHomeCleverTapEvent(CleverTapEventName.TRACK_SYMPTOMS, 'Home Screen');
          props.navigation.navigate(AppRoutes.SymptomTracker);
        });
      },
    },
    {
      id: 5,
      title: getHomeTitle(5, 'Book Covid Vaccination'),
      image: <BookVaccineIcon style={styles.menuOption2SubIconStyle} />,
      onPress: () => {
        getHomeCTAAction(5, () => {
          const itemTo = covidVaccineCtaV2?.data?.filter(
            (item: any) => item?.title === 'Book Vaccination Slot'
          );
          handleCovidCTA(itemTo?.[0] || {});
        });
      },
    },
    {
      id: 6,
      title: getHomeTitle(6, 'Manage Diabetes'),
      image: <Diabetes style={styles.menuOption2SubIconStyle} />,
      onPress: () => {
        getHomeCTAAction(6, () => {
          postHomeFireBaseEvent(FirebaseEventName.MANAGE_DIABETES, 'Home Screen');
          postHomeWEGEvent(WebEngageEventName.MANAGE_DIABETES);
          postHomeCleverTapEvent(CleverTapEventName.MANAGE_DIABETES, 'Home Screen');
          getTokenforCM();
        });
      },
    },
    {
      id: 7,
      title: getHomeTitle(7, 'View Health Records'),
      image: getHealthRecordIcons(7),
      onPress: () => {
        getHomeCTAAction(7, () => {
          postHomeFireBaseEvent(FirebaseEventName.VIEW_HELATH_RECORDS, 'Home Screen');
          postHomeWEGEvent(WebEngageEventName.VIEW_HELATH_RECORDS, 'Home Screen');
          postHomeCleverTapEvent(CleverTapEventName.VIEW_HELATH_RECORDS, 'Home Screen');
          props.navigation.navigate('HEALTH RECORDS');
        });
      },
    },
  ];

  const postHomepageEvent = (source: 'Homepage banner' | 'Offer widget HP') => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_HOMEPAGE_VIEWED] = {
      'Nav src': source,
      User: `${currentPatient?.firstName} ${currentPatient?.lastName}`,
      UHID: currentPatient?.uhid,
      Gender: currentPatient?.gender,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer Id': currentPatient?.id,
    };
    postCleverTapEvent(CleverTapEventName.CONSULT_HOMEPAGE_VIEWED, eventAttributes);
  };

  const postDiagnosticHomepageViewedEvent = (
    source:
      | DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.HOME_PAGE_HERO_BUTTON
      | DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.HOME_PAGE_OFFER_WIDGET
  ) => {
    DiagnosticHomepageViewedEvent(currentPatient, source);
  };

  const listValues: menuOptions[] = [...listOptions];

  const listValuesForProHealth: menuOptions[] = Object.assign([], listOptions, {
    5: {
      id: 6,
      title: 'ProHealth',
      image: <ProHealthIcon style={styles.menuOption2SubIconStyle} />,
      onPress: () => {
        postHomeFireBaseEvent(FirebaseEventName.PROHEALTH, 'Home Screen');
        postHomeWEGEvent(WebEngageEventName.PROHEALTH);
        getTokenForProhealthCM();
      },
    },
  });

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
    fetchCircleSavings();
    fetchHealthCredits();
    fetchCarePlans();
    getUserSubscriptionsByStatus(true);
    checkCircleSelectedPlan();
    getAskApolloLeadConfig();
    firebaseRemoteConfigForReferrer();
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
          const groupPlans = g(
            data,
            'data',
            'GetAllUserSubscriptionsWithPlanBenefitsV2',
            'response'
          );
          if (groupPlans) {
            const hdfcPlan = groupPlans?.HDFC;
            const circlePlan = groupPlans?.APOLLO;

            let corporatePlan: SubscriptionData[] = [];
            Object.keys(groupPlans).forEach((plan_name) => {
              if (
                plan_name !== 'APOLLO' &&
                plan_name !== 'HDFC' &&
                plan_name !== 'APOLLO_CONSULT'
              ) {
                groupPlans[plan_name]?.forEach((subscription) => {
                  const plan = setSubscriptionData(subscription, false, true);
                  corporatePlan.push(plan);
                });
              }
            });
            if (corporatePlan?.length) {
              AsyncStorage.setItem('isCorporateSubscribed', 'yes');
            } else {
              AsyncStorage.setItem('isCorporateSubscribed', 'no');
            }
            setCorporateSubscriptions && setCorporateSubscriptions(corporatePlan);

            if (hdfcPlan) {
              const hdfcSubscription = setSubscriptionData(hdfcPlan[0]);
              setHdfcUserSubscriptions && setHdfcUserSubscriptions(hdfcSubscription!);

              const subscriptionName = g(hdfcSubscription, 'name')
                ? g(hdfcSubscription, 'name')
                : '';
              if (g(hdfcSubscription, 'isActive')) {
                setHdfcPlanName && setHdfcPlanName(subscriptionName!);
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
                if (circlePlan[0]?.status === 'active') {
                  AsyncStorage.setItem('circleSubscriptionId', circlePlan[0]?.subscription_id);
                  setCircleSubscriptionId &&
                    setCircleSubscriptionId(circlePlan[0]?.subscription_id);
                  setIsCircleSubscription && setIsCircleSubscription(true);
                }
                if (circlePlan[0]?.status === 'disabled') {
                  setIsCircleExpired && setIsCircleExpired(true);
                  setNonCircleValues();
                } else {
                  setIsCircleExpired && setIsCircleExpired(false);
                }
              }
              setCircleSubscription && setCircleSubscription(circleSubscription);
            }
          }
        })
        .catch((e) => {
          CommonBugFender('ConsultRoom_getUserSubscriptionsWithBenefits', e);
        });
  };

  const setCircleSubscriptionData = (plan: any) => {
    const planSummary: CirclePlanSummary[] = [];
    const summary = plan?.plan_summary;
    if (summary && summary?.length) {
      summary.forEach((value: any) => {
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
    if (benefits && benefits?.length) {
      benefits.forEach((item: any) => {
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

    if (plan?.subscriptionStatus === 'disabled') {
      setIsCircleExpired && setIsCircleExpired(true);
    } else {
      setIsCircleExpired && setIsCircleExpired(false);
    }

    return circleSubscptionData;
  };

  const setSubscriptionData = (plan: any, isUpgradePlan?: boolean, isCorporatePlan?: boolean) => {
    try {
      const group = plan.group;
      const groupData: GroupPlan = {
        _id: group!._id || '',
        name: group!.name || '',
        isActive: group!.is_active,
      };
      const benefits = plan.benefits;
      const planBenefits: PlanBenefits[] = [];
      if (benefits && benefits?.length) {
        benefits.forEach((item: any) => {
          const ctaAction = g(item, 'cta_action');
          if (g(ctaAction, 'meta', 'action') === string.common.CorporateVaccineBenefit) {
            setShowCorporateVaccinationCta(true);

            setVaccinationCmsIdentifier(item?.cms_identifier);
            AsyncStorage.setItem('VaccinationCmsIdentifier', item?.cms_identifier);
            AsyncStorage.setItem('VaccinationSubscriptionInclusionId', item?._id);
            AsyncStorage.setItem('VaccinationSubscriptionId', plan?.subscription_id);

            setVaccinationSubscriptionId(plan?.subscription_id);
            setVaccinationSubscriptionInclusionId(item?._id);
            setVaccinationSubscriptionName(plan?.name);
            setVaccinationSubscriptionPlanId(plan?.plan_id);
          }
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
            cmsIdentifier: item?.cms_identifier,
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
        isCorporate: !!isCorporatePlan,
        corporateIcon: !!isCorporatePlan ? plan?.group_logo_url?.mobile_version : '',
      };
      const upgradeToPlan = g(plan, 'can_upgrade_to');
      if (g(upgradeToPlan, '_id')) {
        setSubscriptionData(upgradeToPlan, true);
      }

      if (!!isUpgradePlan) {
        setUpgradePlans([...upgradePlans, subscription]);
      }
      return subscription;
    } catch (e) {}
  };

  const getUserSubscriptionsByStatus = async (onAppLoad?: boolean) => {
    try {
      const query: GetSubscriptionsOfUserByStatusVariables = {
        mobile_number: g(currentPatient, 'mobileNumber'),
        status: ['active', 'deferred_active', 'deferred_inactive', 'disabled'],
      };

      const res = await client.query<GetSubscriptionsOfUserByStatus>({
        query: GET_SUBSCRIPTIONS_OF_USER_BY_STATUS,
        fetchPolicy: 'no-cache',
        variables: query,
      });

      const data = res?.data?.GetSubscriptionsOfUserByStatus?.response;

      if (data) {
        let activeSubscriptions = {};
        Object.keys(data).forEach((subscription) => {
          data[subscription].forEach((item) => {
            let subscriptionData = [];
            if (item?.status?.toLowerCase() === 'active') {
              subscriptionData.push(item);
              activeSubscriptions[subscription] = subscriptionData;
            }
          });
        });
        setActiveUserSubscriptions && setActiveUserSubscriptions(activeSubscriptions);
        const circleData = data?.APOLLO?.[0];
        if (circleData?._id) {
          const paymentRef = circleData?.payment_reference;
          const paymentStoredVal =
            typeof paymentRef == 'string' ? JSON.parse(paymentRef) : paymentRef;
          AsyncStorage.setItem('isCircleMember', 'yes');
          homeCache.set('isCircleMember', 'yes');

          circleData?.status === 'disabled'
            ? AsyncStorage.setItem('isCircleMembershipExpired', 'yes')
            : AsyncStorage.setItem('isCircleMembershipExpired', 'no');

          setIsCircleMember && setIsCircleMember('yes');
          AsyncStorage.removeItem('circlePlanSelected');
          let WEGAttributes = {};
          if (circleData?.status === 'active') {
            const circleMembershipType = setCircleMembershipType(
              circleData?.start_date!,
              circleData?.end_date!
            );
            WEGAttributes = {
              'Circle Member': 'Yes',
              'Circle Plan type': circleMembershipType,
            };

            AsyncStorage.setItem('circleSubscriptionId', circleData?._id);
            setCircleSubscriptionId && setCircleSubscriptionId(circleData?._id);
            setIsCircleSubscription && setIsCircleSubscription(true);
            setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(true);
          } else {
            WEGAttributes = {
              'Circle Member': 'No',
              'Circle Plan type': '',
            };
          }
          onAppLoad && logHomePageViewed(WEGAttributes);

          if (circleData?.status === 'disabled') {
            AsyncStorage.setItem('isCircleMembershipExpired', 'yes');
            setIsCircleExpired && setIsCircleExpired(true);
            setNonCircleValues();
          } else {
            setIsCircleExpired && setIsCircleExpired(false);
          }

          const planValidity = {
            startDate: circleData?.start_date,
            endDate: circleData?.end_date,
            expiry: circleData?.expires_in,
            plan_id: circleData?.plan_id,
            source_identifier: circleData?.source_meta_data?.source_identifier,
          };
          setCirclePlanValidity && setCirclePlanValidity(planValidity);
          setRenewNow(circleData?.renewNow ? 'yes' : 'no');
          setCirclePlanId && setCirclePlanId(circleData?.plan_id);
          setCircleStatus && setCircleStatus(circleData?.status);

          homeCache.set('planValidity', planValidity);
          homeCache.set('renewNow', circleData?.renewNow ? 'yes' : 'no');
          homeCache.set('circleStatus', circleData?.status);

          paymentStoredVal &&
            setCirclePaymentReference &&
            setCirclePaymentReference(paymentStoredVal);
        } else {
          setNonCircleValues();
          setIsCircleMember('no');
          AsyncStorage.setItem('isCircleMember', 'no');
          setCirclePlanValidity && setCirclePlanValidity(null);

          homeCache.remove('planValidity');
          homeCache.set('isCircleMember', 'no');
          homeCache.set('circleStatus', '');

          setCirclePaymentReference && setCirclePaymentReference(null);
          setCirclePlanId && setCirclePlanId('');
          fireFirstTimeLanded();
          setCircleStatus && setCircleStatus('');
          const WEGAttributes = {
            'Circle Member': 'No',
            'Circle Plan type': '',
          };
          onAppLoad && logHomePageViewed(WEGAttributes);
        }

        for (let key of Object.keys(data)) {
          if (key !== 'APOLLO' && key !== 'HDFC') setCorporateSubscription(true);
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
      const WEGAttributes = {
        'Circle Member': 'No',
        'Circle Plan type': '',
      };
      onAppLoad && logHomePageViewed(WEGAttributes);
    }
  };

  const setNonCircleValues = () => {
    AsyncStorage.setItem('isCircleMember', 'no');
    AsyncStorage.removeItem('circleSubscriptionId');
    setCircleSubscriptionId && setCircleSubscriptionId('');
    setIsCircleSubscription && setIsCircleSubscription(false);
    setIsDiagnosticCircleSubscription && setIsDiagnosticCircleSubscription(false);
    fireFirstTimeLanded();
  };

  const fetchCarePlans = async () => {
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
      }
    } catch (error) {
      CommonBugFender('CircleMembershipPlans_GetPlanDetailsByPlanId', error);
    }
  };

  const getAskApolloLeadConfig = async () => {
    try {
      const res = await client.query<getConfigurationForAskApolloLead>({
        query: GET_CONFIGURATION_FOR_ASK_APOLLO_LEAD,
        fetchPolicy: 'no-cache',
      });
      const {
        show_phonenumber_mobileapp: displayNumber,
        show_quickbook_mobileapp: displayQuickbook,
      } = res?.data?.getConfigurationForAskApolloLead || {};
      setDisplayAskApolloNumber?.(!!displayNumber);
      setDisplayQuickBookAskApollo?.(!!displayQuickbook);
    } catch (error) {
      CommonBugFender('GetLead_AskApolloConfig', error);
    }
  };

  const fetchCircleSavings = async () => {
    try {
      const res = await client.query({
        query: GET_CIRCLE_SAVINGS_OF_USER_BY_MOBILE,
        variables: {
          mobile_number: currentPatient?.mobileNumber,
        },
        fetchPolicy: 'no-cache',
      });
      const savings = res?.data?.GetCircleSavingsOfUserByMobile?.response?.savings;
      const circlebenefits = res?.data?.GetCircleSavingsOfUserByMobile?.response?.benefits;
      const consultSavings = savings?.consult || 0;
      const pharmaSavings = savings?.pharma || 0;
      const diagnosticsSavings = savings?.diagnostics || 0;
      const deliverySavings = savings?.delivery || 0;
      const totalSavings = consultSavings + pharmaSavings + diagnosticsSavings + deliverySavings;
      setCircleSavings && setCircleSavings(Math.ceil(totalSavings));
      homeCache.set('circleSavings', Math.ceil(totalSavings));
    } catch (error) {
      CommonBugFender('MyMembership_fetchCircleSavings', error);
    }
  };
  const fetchHealthCredits = async () => {
    var cachedHealthCredit: any = await getHealthCredits();
    if (cachedHealthCredit != null) {
      setHealthCredits && setHealthCredits(cachedHealthCredit.healthCredit);
      setHealthCreditLoading(false);
      return; // no need to call api
    }

    try {
      const res = await client.query({
        query: GET_ONEAPOLLO_USER,
        variables: {
          patientId: g(currentPatient, 'id'),
        },
        fetchPolicy: 'no-cache',
      });

      const credits = res?.data?.getOneApolloUser?.availableHC;
      setHealthCredits && setHealthCredits(credits);
      persistHealthCredits(credits);
      homeCache.set('healthCredits', credits || 0);
    } catch (error) {
      CommonBugFender('MyMembership_fetchCircleSavings', error);
    }
  };

  const getUserBanners = async () => {
    try {
      const res: any = await getUserBannersList(
        client,
        currentPatient,
        string.banner_context.HOME,
        [BannerDisplayType.banner, BannerDisplayType.card]
      );

      if (res) {
        setBannerDataHome && setBannerDataHome(res);
        setBannerData && setBannerData(res);
        appGlobalCache.set('bannerData', res);
        homeCache.set('bannerFirstImage', res ? res[0] : null);
      }
    } catch (error) {
      setBannerDataHome && setBannerDataHome([]);
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
          AsyncStorage.setItem('PharmacyUserType', profileType);
        }
      })
      .catch((e) => {
        CommonBugFender('ConsultRoom_getUserProfileType', e);
      });
  };

  const storePatientDetailsTOBugsnag = async () => {
    try {
      if (currentPatient?.isConsulted === undefined) getPatientApiCall();

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
      setNotificationCount && setNotificationCount(selectedCount?.length);
    } catch (error) {}
  };

  const callAPIForNotificationResult = async () => {
    const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');

    const params = {
      phone: '91' + storedPhoneNumber,
      size: 40,
    };
    notifcationsApi(params)
      .then(async (repsonse: any) => {
        try {
          const array = await AsyncStorage.getItem('allNotification');
          let arrayNotification;

          if (array !== null) {
            const arraySelected = JSON.parse(array);
            arrayNotification = repsonse.data.data.map((el: any) => {
              const o = Object.assign({}, el);

              const result = arraySelected.filter((obj: any) => {
                return obj._id == el._id;
              });
              if (result?.length === 0) {
                o.isActive = true;
              } else {
                o.isActive = result[0].isActive;
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

          setNotificationCount && setNotificationCount(selectedCount?.length);
          setAllNotifications && setAllNotifications(filteredNotifications);

          AsyncStorage.setItem('allNotification', JSON.stringify(filteredNotifications));
        } catch (error) {}
      })
      .catch((error: Error) => {});
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

  // Intentionally commentted NOT Required Any more - WILL Delete later
  // useEffect(() => {
  //   currentPatient && setshowSpinner(false);
  //   if (!currentPatient) {
  //     // getPatientApiCall();
  //   } else {
  //     AsyncStorage.setItem('selectedProfileId', JSON.stringify(currentPatient.id));
  //     if (selectedProfile !== currentPatient.id) {
  //       getAppointmentsCount();
  //       setSelectedProfile(currentPatient.id);
  //     }
  //   }
  // }, [props.navigation.state.params]);

  const getAppointmentsCount = () => {
    client
      .query<getPatientFutureAppointmentCount>({
        query: GET_PATIENT_FUTURE_APPOINTMENT_COUNT,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: currentPatient?.id,
        },
      })
      .then((data) => {
        const count = data?.data?.getPatientFutureAppointmentCount?.activeConsultsCount || 0;
        setCurrentAppointments(`${count}`);
        appGlobalCache.set('appointmentCount', JSON.stringify(count));
      })
      .catch((e) => {
        CommonBugFender('ConsultRoom_getPatientFutureAppointmentCount', e);
      })
      .finally(() => {});
  };

  const firebaseRemoteConfigForReferrer = async () => {
    try {
      const RefBannerKey = AppConfig.APP_ENV == 'PROD' ? 'Referrer_Banner' : 'QA_Referrer_Banner';
      const bannerConfig = await remoteConfig().getValue(RefBannerKey);
      setReferrerAvailable(bannerConfig.asBoolean());
    } catch (e) {}
  };

  useEffect(() => {
    async function fetchData() {
      const userLoggedIn = await AsyncStorage.getItem('gotIt');
      if (userLoggedIn == 'true') {
        setshowPopUp(false);
      } else {
        setshowPopUp(true);
        setTimeout(() => {
          setshowPopUp(false);
          CommonLogEvent(AppRoutes.HomeScreen, 'ConsultRoom_BottomPopUp clicked');
          AsyncStorage.setItem('gotIt', 'true');
          checkUserRegisterThroughReferral();
        }, 5000);
      }
      const eneabled = AppConfig.Configuration.ENABLE_CONDITIONAL_MANAGEMENT;
      setEnableCM(eneabled);
    }
    const saveSessionValues = async () => {
      returnAuthToken?.().then(setToken);
      setUserMobileNumber(currentPatient?.mobileNumber);
    };
    fetchData();
    saveSessionValues();
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

    const patientDetails_primary = allPatients
      ? allPatients.find((patient: any) => patient.relation === Relation.ME) || allPatients[0]
      : null;

    const patientDetails = currentPatient;

    const fullName = `${g(patientDetails, 'firstName') || ''}%20${g(patientDetails, 'lastName') ||
      ''}`;

    const patientUHID = patientDetails ? (patientDetails.uhid ? patientDetails.uhid : '') : '';
    if (patientUHID) {
      setLoading?.(true);
      GenerateTokenforCM(
        patientDetails ? patientDetails?.uhid : '',
        fullName,
        patientDetails ? (patientDetails?.gender ? patientDetails?.gender : '') : '',
        patientDetails ? (patientDetails?.emailAddress ? patientDetails?.emailAddress : '') : '',
        patientDetails ? (patientDetails?.mobileNumber ? patientDetails?.mobileNumber : '') : ''
      )
        .then((token: any) => {
          async function fetchTokenData() {
            setLoading?.(false);

            const tokenValue = token.data.vitaToken; //await AsyncStorage.getItem('token');
            const buildSpecify = buildName();
            let keyHash;
            if (buildSpecify === 'QA' || buildSpecify === 'DEV' || buildSpecify === 'DEVReplica') {
              keyHash = AppConfig.Configuration.QA_DIABETES_MGMT_HashKey;
            } else {
              keyHash = AppConfig.Configuration.Prod_DIABETES_MGMT_HashKey;
            }
            if (Platform.OS === 'ios') {
              if (tokenValue) {
                Vitals.vitalsToExport(tokenValue, buildSpecify, '247');
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
                  currentDeviceToken,
                  AppConfig.Configuration.DIABETES_MGMT_CM_PROGRAM_ID
                );
            }
          }

          fetchTokenData();
        })
        .catch((e) => {
          CommonBugFender('ConsultRoom_getTokenforCM', e);
          setLoading?.(false);
        });
    } else {
      setLoading?.(false);
      showAphAlert &&
        showAphAlert({
          title: string.common.hiWithSmiley,
          description: string.common.settingProfileTxt,
        });
    }
  };

  //token for prohealth - CM
  const getTokenForProhealthCM = async () => {
    const deviceToken = (await AsyncStorage.getItem('deviceToken')) || '';
    const currentDeviceToken = deviceToken ? JSON.parse(deviceToken) : '';
    try {
      setLoading?.(true);
      let vitaTokenResponse = await GenrateVitalsToken_CM('ask_apollo', currentPatient?.uhid);
      if (vitaTokenResponse?.data && vitaTokenResponse?.data?.message.includes('Successfully')) {
        let vitaToken = vitaTokenResponse?.data?.vitaToken;
        const buildSpecify = buildName();
        let keyHash;
        if (
          buildSpecify === 'QA' ||
          buildSpecify === 'DEV' ||
          buildSpecify === 'DEVReplica' ||
          buildSpecify === 'VAPT'
        ) {
          keyHash = AppConfig.Configuration.QA_PROHEALTH_MGMT_HashKey;
        } else {
          keyHash = AppConfig.Configuration.Prod_PROHEALTH_MGMT_HashKey;
        }
        setLoading?.(false);
        //call the sdk.
        if (Platform.OS === 'ios') {
          if (vitaToken) {
            Vitals.vitalsToExport(vitaToken, buildSpecify, 'prohealth');
            setTimeout(() => {
              Vitals.goToReactNative(vitaToken);
            }, 500);
          }
        } else {
          const fullName = `${g(currentPatient, 'firstName') || ''}%20${g(
            currentPatient,
            'lastName'
          ) || ''}`;
          const UHID = `${g(currentPatient, 'uhid') || ''}`;
          vitaToken &&
            KotlinBridge.show(
              vitaToken,
              UHID,
              fullName,
              keyHash,
              buildSpecify,
              currentDeviceToken,
              AppConfig.Configuration.PROHEALTH_MGMT_CM_PROGRAM_ID
            );
        }
      } else {
        setLoading?.(false);
        setProHealthActive(false);
        showAphAlert &&
          showAphAlert({
            title: string.common.hiWithSmiley,
            description: string.common.settingProfileTxt,
          });
      }
    } catch (error) {
      CommonBugFender('getTokenForProhealthCM_error_ConsultRoom', error);
      setProHealthActive(false);
      setLoading?.(false);
    }
  };

  //check if user has any prohealth bookings
  const checkIsProhealthActive = async (currentPatientDetails: any) => {
    setPreviousPatient(currentPatientDetails);
    const storedUhid: any = await AsyncStorage.getItem('selectUserUHId');
    const selectedUHID = storedUhid ? storedUhid : currentPatient?.uhid;
    const retrievedItem: any = await AsyncStorage.getItem('currentPatient');
    const item = JSON.parse(retrievedItem || 'null');
    const callByPrism: any = await AsyncStorage.getItem('callByPrism');
    let allPatients;
    if (callByPrism === 'false') {
      allPatients =
        !!item && item?.data?.getPatientByMobileNumber
          ? item?.data?.getPatientByMobileNumber?.patients
          : null;
    } else {
      allPatients =
        !!item && item?.data?.getCurrentPatients ? item?.data?.getCurrentPatients?.patients : null;
    }
    const patientDetails = allPatients
      ? allPatients?.find((patient: any) => patient?.relation === Relation.ME) || allPatients?.[0]
      : null;
    const patientUHID = patientDetails ? (patientDetails?.uhid ? patientDetails?.uhid : '') : '';

    if (patientUHID) {
      setshowSpinner(true);
      try {
        /**
         * caching the api for 24 hrs.
         */
        const getCachedApiResult: any = await getItem('mobileNumber_CM_Result');
        const getAllPatientUhid = allPatients?.map((patient: any) => patient?.uhid);

        if (!!getCachedApiResult && getCachedApiResult?.data) {
          updateSDKOption(getCachedApiResult?.data, selectedUHID, currentPatientDetails);
        } else {
          const res: any = await GetProhealthActiveStatusForUhid_CM(getAllPatientUhid);
          if (res?.data?.response) {
            let resultData = res?.data?.response;
            if (!!resultData && resultData?.length > 0) {
              const obj = {
                data: resultData,
                expireAt: 1440,
              };
              setItem('mobileNumber_CM_Result', obj, obj?.expireAt); //storing the result for 24 hrs, for a logged in user
              updateSDKOption(resultData, selectedUHID, currentPatientDetails);
            }
          }
        }
        setshowSpinner(false);
      } catch (error) {
        CommonBugFender('ProHealth_checkIsProhealthActive_error_ConsultRoom', error);
        setProHealthActive(false);
        setshowSpinner(false);
      }
    } else {
      setshowSpinner(false);
      setProHealthActive(false);
      showAphAlert?.({
        title: string.common.hiWithSmiley,
        description: string.common.settingProfileTxt,
      });
    }
  };

  function updateSDKOption(resultData: any, selectedUHID: string, currentPatientDetails: any) {
    let getCurrentProfile = resultData?.find(
      (item: any) => item?.uhid == (selectedUHID! || currentPatientDetails?.uhid)
    );
    //get status for active chron.
    let isActive = getCurrentProfile?.isChronActive;
    isActive ? setProHealthActive(true) : setProHealthActive(false);
  }

  const getActiveProHealthAppointments = async (currentDetails: any) => {
    //or can use storeUhid, and then call api getPatientsByUhid.
    getAllProHealthAppointments(client, currentDetails?.id)
      .then((data: any) => {
        if (data?.data?.data?.getAllProhealthAppointments) {
          let getAllAppointments = data?.data?.data?.getAllProhealthAppointments?.appointments;
          if (getAllAppointments?.length > 0) {
            let getUpcomingAppointments = getAllAppointments?.filter(
              (item: any) =>
                (item?.status ===
                  (!!BookingStatus.COMPLETED ? BookingStatus.COMPLETED : 'COMPLETED') ||
                  (item?.status === !!BookingStatus?.INPROGRESS
                    ? BookingStatus?.INPROGRESS
                    : 'INPROGRESS')) &&
                moment(item?.appointmentStartDateTimeUTC).diff(moment(), 'minutes') > 0
            );
            if (getUpcomingAppointments?.length > 0) {
              setProHealthActiveAppointmentCount(getUpcomingAppointments?.length);
              setProHealthActiveAppointment(getUpcomingAppointments);
            } else {
              setProHealthActiveAppointmentCount('0');
              setProHealthActiveAppointment([]);
            }
          } else {
            setProHealthActiveAppointmentCount('0');
            setProHealthActiveAppointment([]);
          }
        }
      })
      .catch((e) => {
        CommonBugFender('inside the getProHealthAppointemnt', e);
        setProHealthActiveAppointmentCount('0');
        setProHealthActiveAppointment([]);
      });
  };

  const renderBottomTabBar = () => {
    return (
      <View>
        <View
          style={{
            height: 0.5,
            backgroundColor: '#D4D4D4',
            marginHorizontal: -16,
          }}
        />
        <View
          style={[styles.tabBarMainViewStyle, { height: showPopUp ? 0 : isIphoneX() ? 87 : 57 }]}
        >
          {tabBarOptions.map((tabBarOptions, i) => (
            <View key={i}>
              <TouchableOpacity
                activeOpacity={0.5}
                key={i}
                onPress={() => {
                  if (i === 0) {
                    postHomeFireBaseEvent(FirebaseEventName.TABBAR_APPOINTMENTS_CLICKED, 'Menu');
                    postHomeWEGEvent(WebEngageEventName.TABBAR_APPOINTMENTS_CLICKED, 'Menu');
                    postHomeCleverTapEvent(CleverTapEventName.CONSULT_ACTIVE_APPOINTMENTS, 'Menu');
                    CommonLogEvent(AppRoutes.HomeScreen, 'APPOINTMENTS clicked');
                    props.navigation.navigate('APPOINTMENTS');
                  } else if (i == 1) {
                    postHomeFireBaseEvent(FirebaseEventName.VIEW_HELATH_RECORDS, 'Menu');
                    postHomeWEGEvent(WebEngageEventName.VIEW_HELATH_RECORDS, 'Menu');
                    postHomeCleverTapEvent(CleverTapEventName.VIEW_HELATH_RECORDS, 'Menu');
                    CommonLogEvent(AppRoutes.HomeScreen, 'HEALTH_RECORDS clicked');
                    props.navigation.navigate('HEALTH RECORDS');
                  } else if (i == 2) {
                    postHomeFireBaseEvent(FirebaseEventName.BUY_MEDICINES, 'Menu');
                    postHomeWEGEvent(WebEngageEventName.BUY_MEDICINES, 'Menu');
                    postHomeCleverTapEvent(CleverTapEventName.BUY_MEDICINES, 'Menu');
                    CommonLogEvent(AppRoutes.HomeScreen, 'MEDICINES clicked');
                    const eventAttributes:
                      | WebEngageEvents[WebEngageEventName.HOME_PAGE_VIEWED]
                      | CleverTapEvents[CleverTapEventName.PHARMACY_HOME_PAGE_VIEWED] = {
                      source: 'app home',
                      'Page Name': 'Homepage',
                    };
                    setTimeout(
                      () =>
                        postCleverTapEvent(
                          CleverTapEventName.PHARMACY_HOME_PAGE_VIEWED,
                          eventAttributes
                        ),
                      500
                    );
                    postWebEngageEvent(WebEngageEventName.HOME_PAGE_VIEWED, eventAttributes);
                    props.navigation.navigate('MEDICINES', { comingFrom: '247 Home bottom bar' });
                  } else if (i == 3) {
                    const homeScreenAttributes = {
                      'Nav src': 'Bottom bar',
                      'Page Name': 'Home Screen',
                      Source: DiagnosticHomePageSource.TAB_BAR,
                    };
                    DiagnosticCtaClicked(
                      currentPatient,
                      isDiagnosticCircleSubscription,
                      DIAGNOSTIC_CTA_ITEMS.BOTTOM_BAR
                    );
                    postHomeFireBaseEvent(FirebaseEventName.ORDER_TESTS, 'Menu');
                    postHomeWEGEvent(WebEngageEventName.ORDER_TESTS, 'Menu');
                    CommonLogEvent(AppRoutes.HomeScreen, 'TESTS clicked');
                    props.navigation.navigate('TESTS', { homeScreenAttributes });
                  } else if (i == 4) {
                    postHomeCleverTapEvent(CleverTapEventName.MY_ACCOUNT, 'Menu');
                    postHomeFireBaseEvent(FirebaseEventName.MY_ACCOUNT, 'Menu');
                    postHomeWEGEvent(WebEngageEventName.MY_ACCOUNT);
                    CommonLogEvent(AppRoutes.HomeScreen, 'MY_ACCOUNT clicked');
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
      </View>
    );
  };

  const saveRecentSearchTerm = async (search: string) => {
    client
      .mutate<saveRecentVariables>({
        mutation: SAVE_RECENT_SEARCH,
        variables: {
          searchText: search,
        },
        fetchPolicy: 'no-cache',
      })
      .then((i) => {
        const listToAdd: string[] =
          recentGlobalSearchList?.length > 3
            ? recentGlobalSearchList.slice(0, 3)
            : recentGlobalSearchList;
        setRecentGlobalSearchList && setRecentGlobalSearchList([{ text: search }, ...listToAdd]);
      })
      .catch((e) => {
        CommonBugFender('HomeScreen_SaveSearchAPIFailure', e);
      });
  };

  const renderProfileDrop = () => {
    return (
      <ProfileList
        showList={showList}
        onProfileChange={onProfileChange}
        navigation={props.navigation}
        saveUserChange={true}
        cleverTapProfileClickEvent={() => cleverTapEventForProfileClick()}
        cleverTapEventForAddMemberClick={() => cleverTapEventForAddMemberClick()}
        childView={renderProfileIconAsChildView()}
        unsetloaderDisplay={true}
      />
    );
  };

  const renderProfileIconAsChildView = () => {
    return (
      <View style={styles.profileListChildContainer}>
        <Text style={styles.hiTextStyle}>{'Hi'}</Text>
        <View style={styles.nameTextContainerStyle}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={styles.nameTextStyle} numberOfLines={1}>
              {currentPatient?.firstName || ''}
            </Text>

            <View style={{ padding: 6, justifyContent: 'flex-end' }}>
              <DropDownProfile />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const cleverTapEventForProfileClick = () => {
    let eventAttributes = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
      'Nav src': 'Homepage',
      'Circle Member':
        getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
        undefined,
      'Device Id': getUniqueId(),
    };
    postCleverTapEvent(CleverTapEventName.USER_PROFILE_IMAGE_NAME_CLICKED, eventAttributes);
  };

  const cleverTapEventForLoginDone = () => {
    if (!props.navigation.state.params?.previousRoute) {
      return null;
    } else if (props.navigation.state.params?.previousRoute == 'Login') {
      let eventAttributes = {
        'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        'Patient UHID': g(currentPatient, 'uhid'),
        Relation: g(currentPatient, 'relation'),
        'Patient age': Math.round(
          moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
        ),
        'Patient gender': g(currentPatient, 'gender'),
        'Mobile Number': g(currentPatient, 'mobileNumber'),
        'Customer ID': g(currentPatient, 'id'),
        User_Type: getUserType(allCurrentPatients),
        'Nav src': 'Login screen',
        'Circle Member':
          getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
          undefined,
        'Device Id': getUniqueId(),
      };
      postCleverTapEvent(CleverTapEventName.LOGIN_DONE, eventAttributes);
    }
  };

  const checkUserRegisterThroughReferral = async () => {
    try {
      const referrerInstall = await AsyncStorage.getItem('referrerInstall');
      if (referrerInstall === 'true') {
        const rewardStatus = await AsyncStorage.getItem('RefereeStatus');
        if (rewardStatus === RewardStatus.ELIGIBLE_FOR_REWARD) {
          props.navigation.navigate('EarnedPoints');
          AsyncStorage.removeItem('RefereeStatus');
        }
        AsyncStorage.removeItem('referrerInstall');
      }
    } catch (e) {}
  };

  const cleverTapEventForAddMemberClick = () => {
    let eventAttributes = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
      'Nav src': 'Profile Picture',
      'Circle Member':
        getCleverTapCircleMemberValues(pharmacyCircleAttributes?.['Circle Membership Added']!) ||
        undefined,
      'Device Id': getUniqueId(),
    };
    postCleverTapEvent(CleverTapEventName.ADD_MEMBER_PROFILE_CLICKED, eventAttributes);
  };

  const renderListView = (text: string, source: string) => {
    let counts = source == 'prohealth' ? proHealthActiveAppointmentCount : currentAppointments;
    let sortedActiveAppointments = [...proActiveAppointments];
    let getRecentUpcomingBooking =
      sortedActiveAppointments?.length > 0 &&
      (sortedActiveAppointments?.sort(
        (a: any, b: any) => a?.appointmentStartDateTimeUTC - b?.appointmentStartDateTimeUTC
      ) as any);
    const orderIdToShow = getRecentUpcomingBooking?.[0]?.displayId;
    return (
      <View>
        <ListCard
          container={[
            styles.activeAppointmentsContainer,
            {
              marginTop: source == 'prohealth' ? 3 : 12,
              marginBottom: source == 'prohealth' ? 3 : 8,
            },
          ]}
          title={text}
          leftIcon={renderListCount(counts)}
          onPress={() => {
            if (source == 'prohealth') {
              if (proActiveAppointments?.length > 0) {
                postHomeWEGEvent(WebEngageEventName.ACTIVE_PROHEALTH_APPOINTMENTS);
                //call the jwt token again.
                regenerateJWTToken('orders', orderIdToShow);
              }
            } else {
              postHomeWEGEvent(WebEngageEventName.ACTIVE_APPOINTMENTS);
              postHomeCleverTapEvent(CleverTapEventName.CONSULT_ACTIVE_APPOINTMENTS, 'Home Screen');
              props.navigation.navigate('APPOINTMENTS');
            }
          }}
        />
      </View>
    );
  };

  const renderListCount = (count: string | number) => {
    if (Number.parseInt(currentAppointments) > 0) {
      return (
        <View style={styles.countContainer}>
          <Text style={{ ...theme.viewStyles.text('M', 16, theme.colors.SKY_BLUE, 1, 20, 0) }}>
            {currentAppointments}
          </Text>
        </View>
      );
    } else {
      return null;
    }
  };

  const renderDeliveryRibbonTag = () => {
    return (
      <View style={styles.deliveryRibbon}>
        <ImageBackground
          style={{ height: 26, width: 120 }}
          {...props}
          source={require('@aph/mobile-patients/src/components/ui/icons/green_ribbon.webp')}
        >
          <Text style={styles.deliveryInTatText}>
            {AppConfig.Configuration.DeliveryIn_TAT_Text}
          </Text>
        </ImageBackground>
      </View>
    );
  };

  const renderMenuOptions = () => {
    let arrayList = isProHealthActive ? listValuesForProHealth : listValues;
    return (
      <View style={styles.menuOptionsContainer}>
        {arrayList.map((item) => {
          if (
            menuViewOptions.findIndex((i) => i === item.id) >= 0 &&
            menuViewOptions.findIndex((i) => i === item.id) <= 2
          ) {
            if (item?.id === 1) {
              return (
                <TouchableOpacity activeOpacity={0.5} onPress={item.onPress}>
                  <View style={{}}>
                    {renderDeliveryRibbonTag()}
                    <LinearGradientComponent
                      style={[styles.bottom2CardView, { width: width - 32, height: 100 }]}
                      colors={['#0A4D6B', '#128797']}
                    >
                      <View style={styles.topCardContentContainer}>
                        {item.image}
                        <Text style={[styles.topTextStyle, { color: theme.colors.WHITE }]}>
                          {item.title}
                        </Text>

                        <ArrowRight style={{ marginRight: 'auto', tintColor: '#fff' }} />
                      </View>
                      <View
                        style={[
                          styles.bottom2SubCardView,
                          {
                            backgroundColor: item.subCardColor,
                          },
                        ]}
                      >
                        <View style={styles.bottom2ImageView}>{item.image2}</View>
                        <View style={styles.bottom2TextView}>
                          <Text
                            style={[theme.viewStyles.text('M', 11, item.subtitleColor!, 1, 18)]}
                          >
                            {getHealthCreditStatements(healthCredits, item.subtitle)}
                          </Text>
                        </View>
                      </View>
                    </LinearGradientComponent>
                  </View>
                </TouchableOpacity>
              );
            } else {
              return (
                <TouchableOpacity activeOpacity={0.5} onPress={item.onPress}>
                  <View style={styles.bottom2CardView}>
                    <View style={styles.topCardContentContainerSecondary}>
                      {item.image}
                      <View style={styles.bottom2TextView}>
                        <Text
                          style={[theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE, 1, 18)]}
                        >
                          {item.title}
                        </Text>
                      </View>
                      <ArrowRight style={{ marginRight: 'auto' }} />
                    </View>

                    <View
                      style={[
                        styles.bottom2SubCardView,
                        {
                          backgroundColor: item.subCardColor,
                        },
                      ]}
                    >
                      <View style={styles.bottom2ImageView}>{item.image2}</View>
                      <View style={styles.bottom2TextView}>
                        <Text style={[theme.viewStyles.text('M', 11, item.subtitleColor!, 1, 18)]}>
                          {item.subtitle}
                        </Text>
                      </View>
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

  const getHealthCreditStatements = (healthCredits: number, text: string) => {
    if (isHealthCreditLoading) {
      return '???' + '--' + ' ' + text;
    } else {
      if (healthCredits) {
        if (healthCredits >= 30) {
          return '???' + healthCredits + ' ' + text;
        } else {
          return 'Get 100% Genuine Medicines';
        }
      } else {
        return 'Get 100% Genuine Medicines';
      }
    }
  };

  const renderServicesForYouView = () => {
    let arrayList = isProHealthActive ? listValuesForProHealth : listValues;
    return (
      <View style={styles.menuOptionsContainer}>
        {arrayList?.map((item) => {
          if (item?.id > 3) {
            return (
              <TouchableOpacity activeOpacity={0.5} onPress={item?.onPress}>
                <View style={styles.bottomCardView}>
                  <View style={styles.bottomImageView}>{item?.image}</View>
                  <View style={styles.bottomTextView}>
                    <Text
                      style={[theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20)]}
                    >
                      {item?.title}
                    </Text>
                  </View>
                  <View style={styles.bottomRightArrowView}>
                    <ArrowRight />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }
        })}
      </View>
    );
  };

  const renderOffersForYou = () => {
    const offerListToRender = offersListLoading ? offersListCache : offersList;
    if (offerListToRender?.length === 0) return null;
    else if (offerListToRender?.length === 1 && offerListToRender?.[0]?.template_name === 'CIRCLE')
      return circleCashbackOffersComponent();
    else if (offerListToRender?.length === 1)
      return medCashbackOffersComponent(offerListToRender?.[0]);
    else if (offerListToRender?.length > 1)
      return (
        <View style={styles.menuOptionsContainer}>
          <FlatList
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            data={offerListToRender}
            renderItem={({ item, index }) => renderOffersCards(item, index)}
            keyExtractor={(item, index) => index.toString() + 'offersForYou'}
          />
        </View>
      );
  };

  const getTemplateStyle = (templateName: string) => {
    const template =
      homeBannerOfferSection && homeBannerOfferSection?.templates?.[templateName]
        ? homeBannerOfferSection?.templates?.[templateName]
        : AppConfig.DEFAULT_OFFERS_TEMPLATE?.templates?.[templateName];
    const styles = template || AppConfig.DEFAULT_OFFERS_TEMPLATE?.templates?.['default'];

    return styles;
  };

  const getRedirectActionForOffers = (action: string) => {
    const actionChooser: any = {
      pharmacy: 'PHARMACY_LANDING',
      consulation: 'SPECIALITY_LISTING',
      diagnostics: 'DIAGNOSTICS_LANDING',
    };
    return actionChooser?.[action];
  };

  const renderOffersCards = (item: any, index: number) => {
    const textForNotch = getNotchText(item?.expired_at, item?.notch_text?.text);
    let offerDesignTemplate = getTemplateStyle(item?.template_name);
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          postOfferCardClickEvent(
            item,
            String(index + 1),
            textForNotch == 'Offer Expired',
            allCurrentPatients,
            currentPatient,
            textForNotch,
            !!circleSubscriptionId,
            offersListLoading ? offersListCache?.length : offersList?.length,
            'clicked'
          );
          textForNotch !== 'Offer Expired' && onOfferCtaPressed(item, index + 1);
        }}
      >
        <LinearGradientVerticalComponent
          colors={[
            offerDesignTemplate?.banner_bg_color?.primary_color,
            offerDesignTemplate?.banner_bg_color?.secondary_color,
          ]}
          style={[styles.bottom2CardView, styles.offersCardsContainer]}
        >
          {textForNotch?.length > 1 ? (
            <View
              style={[
                styles.offersCardNotch,
                {
                  backgroundColor: offerDesignTemplate?.left_notch?.bg_color,
                },
              ]}
            >
              <Text
                style={{
                  ...theme.viewStyles.text(
                    'M',
                    12,
                    offerDesignTemplate?.left_notch?.text_color,
                    1,
                    18
                  ),
                }}
              >
                {textForNotch?.length > 22
                  ? textForNotch?.substring(textForNotch?.length - 22, textForNotch?.length)
                  : textForNotch}
              </Text>
            </View>
          ) : null}

          <Text
            style={[
              {
                ...theme.viewStyles.text('B', 16, offerDesignTemplate?.title_text_color, 1, 23),
              },
              styles.mOffersTitle,
            ]}
          >
            {item?.title?.text?.length > 60
              ? item?.title?.text?.substring(0, 60)
              : item?.title?.text}
          </Text>

          <Text
            style={{
              ...theme.viewStyles.text('M', 14, offerDesignTemplate?.subtitle_text_color, 1, 18),
              marginHorizontal: 10,
              marginBottom: 'auto',
            }}
          >
            {item?.subtitle?.text?.length > 25
              ? item?.subtitle?.text?.substring(0, 25)
              : item?.subtitle?.text}
          </Text>
          {item?.is_active ? (
            <View style={styles.mOffersCouponContainer}>
              <View style={styles.offersCardCoupon}>
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 12, offerDesignTemplate?.coupon_color, 1, 18),
                  }}
                >
                  {`Coupon: ${
                    item?.coupon_code?.length > 12
                      ? item?.coupon_code?.substring(0, 12)
                      : item?.coupon_code
                  }`}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.offersCardCTA}
                onPress={() =>
                  textForNotch !== 'Offer Expired' && onOfferCtaPressed(item, index + 1)
                }
              >
                <WhiteArrowRight />
              </TouchableOpacity>
            </View>
          ) : null}
        </LinearGradientVerticalComponent>
      </TouchableOpacity>
    );
  };

  const getNotchText = (expired_at: string, notch_text: string) => {
    let textForNotch = '';
    try {
      const expiryTime = new Date(expired_at).getTime();
      const now = new Date().getTime();
      const diff: number = expiryTime - now;
      let ms = diff;
      const dd = Math.floor(ms / 1000 / 3600 / 24);
      ms -= dd * 1000 * 60 * 60 * 24;
      const hh = Math.floor(ms / 1000 / 3600);
      ms -= hh * 1000 * 60 * 60;
      const mm = Math.floor(ms / 1000 / 60);
      textForNotch =
        diff > 0 && hh > 0
          ? notch_text?.replace('{time_till_expiry}', `${hh} Hrs ${mm} Min`)
          : diff > 0 && hh === 0
          ? notch_text?.replace('{time_till_expiry}', `${mm} Min`)
          : 'Offer Expired';
    } catch (e) {}
    return textForNotch;
  };

  const medCashbackOffersComponent = (item: any) => {
    let offerDesignTemplate = getTemplateStyle(item?.template_name);
    const textForNotch = getNotchText(item?.expired_at, item?.notch_text?.text);
    return (
      <View style={styles.menuOptionsContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            postOfferCardClickEvent(
              item,
              '1',
              textForNotch == 'Offer Expired',
              allCurrentPatients,
              currentPatient,
              textForNotch,
              !!circleSubscriptionId,
              offersListLoading ? offersListCache?.length : offersList?.length,
              'clicked'
            );
            textForNotch !== 'Offer Expired' && onOfferCtaPressed(item, 1);
          }}
        >
          <LinearGradientVerticalComponent
            colors={[
              offerDesignTemplate?.banner_bg_color?.primary_color,
              offerDesignTemplate?.banner_bg_color?.secondary_color,
            ]}
            style={[styles.bottom2CardView, { width: width - 32, borderColor: '#D4D4D4' }]}
          >
            <View style={{ flexDirection: 'row', marginTop: -5, justifyContent: 'space-between' }}>
              <View
                style={[
                  styles.medCashbackContainer1,
                  {
                    backgroundColor: offerDesignTemplate?.left_notch?.bg_color,
                  },
                ]}
              >
                <Text
                  style={{
                    ...theme.viewStyles.text(
                      'R',
                      12,
                      offerDesignTemplate?.left_notch?.text_color,
                      1,
                      18
                    ),
                  }}
                  numberOfLines={1}
                >
                  {textForNotch}
                </Text>
              </View>

              <View style={{ marginTop: 0.5, marginRight: 16 }}>
                {item?.coupon_code && item?.coupon_code?.length > 0 ? (
                  <CashbackIcon style={{ width: 21.6, height: 30 }} />
                ) : null}
              </View>
            </View>

            <Text
              numberOfLines={1}
              style={{
                ...styles.offerTitle,
                ...theme.viewStyles.text('B', 20, offerDesignTemplate?.title_text_color, 1, 30),
              }}
            >
              {item?.title?.text}
            </Text>

            <Text
              numberOfLines={1}
              style={{
                ...styles.offerSubtitle,
                ...theme.viewStyles.text('M', 14, offerDesignTemplate?.subtitle_text_color, 1, 18),
              }}
            >
              {item?.subtitle?.text}
            </Text>

            <View style={styles.medBottomContainer}>
              {item?.coupon_code && item?.coupon_code?.length > 0 ? (
                <View style={styles.medCouponContainer}>
                  <Text
                    style={{
                      ...theme.viewStyles.text('M', 12, offerDesignTemplate?.coupon_color, 1, 18),
                    }}
                  >
                    {`Coupon: ${
                      item?.coupon_code?.length > 12
                        ? item?.coupon_code?.substring(0, 12)
                        : item?.coupon_code
                    }`}
                  </Text>
                </View>
              ) : (
                <Text> </Text>
              )}

              <View style={[styles.bottomRightArrowView, { flex: 0.5, alignItems: 'flex-end' }]}>
                <Button
                  title={item?.cta?.text}
                  style={[
                    styles.medCTAButton,
                    {
                      backgroundColor: offerDesignTemplate?.cta?.bg_color,
                    },
                  ]}
                  titleTextStyle={{ color: offerDesignTemplate?.cta?.text_color }}
                  onPress={() => textForNotch !== 'Offer Expired' && onOfferCtaPressed(item, 1)}
                  disabled={false}
                />
              </View>
            </View>
          </LinearGradientVerticalComponent>
        </TouchableOpacity>
      </View>
    );
  };

  const onOfferCtaPressed = (item: any, index: number) => {
    let action = getRedirectActionForOffers(item?.cta?.path?.vertical?.toLowerCase());
    navigateCTAActions({ type: 'REDIRECT', cta_action: action }, '');
  };

  const circleCashbackOffersComponent = () => {
    return (
      <View style={styles.menuOptionsContainer}>
        <TouchableOpacity activeOpacity={0.5} onPress={() => {}}>
          <LinearGradientComponent
            colors={['#FDFBF7', '#F5D5CE']}
            style={[styles.bottom2CardView, { width: width - 32 }]}
          >
            <View style={{ flexDirection: 'row', marginTop: -5, justifyContent: 'flex-start' }}>
              <View style={{ marginTop: 11, marginLeft: 10 }}>
                <Image
                  style={{ width: 46, height: 29 }}
                  source={require('@aph/mobile-patients/src/components/ui/icons/circleLogo.webp')}
                />
              </View>

              <View
                style={{
                  marginHorizontal: 10,
                  marginTop: 11,
                  borderRadius: 4,
                  backgroundColor: '#CA883B',
                  paddingHorizontal: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ ...theme.viewStyles.text('R', 12, '#fff', 1, 18) }}>Offer</Text>
              </View>
            </View>

            <View
              style={{ flexDirection: 'row', marginVertical: 6, justifyContent: 'space-between' }}
            >
              <View>
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 17, '#958060', 1, 20),
                    marginHorizontal: 10,
                  }}
                >
                  Get ???250 instant cashback
                </Text>

                <Text
                  style={{
                    ...theme.viewStyles.text('R', 14, '#B3A293', 1, 18),
                    marginHorizontal: 10,
                  }}
                >
                  on Medicine Order
                </Text>
              </View>

              <View style={styles.bottomRightArrowView}>
                <Button
                  title={`SHOP NOW`}
                  style={{ width: 106, height: 32 }}
                  onPress={() => {}}
                  disabled={false}
                />
              </View>
            </View>
          </LinearGradientComponent>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBannersCarousel = () => {
    const showBanner = !!bannerData?.length;
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
          circleActivated={circleActivatedRef.current && circlePurchaseStatus === 'success'}
          circlePlanValidity={circlePlanValidity}
          from={string.banner_context.HOME}
          source={string.banner_context.HOME}
          successCallback={() => {
            getUserSubscriptionsWithBenefits();
          }}
          postHomeBannerEvent={postHomeBannerEvent}
          circleEventSource={'Landing Home Page banners'}
        />
      );
    }
  };

  const getHomeBanner = () => {
    return (
      <View style={{ height: 200 }}>
        <View style={{ position: 'absolute', width: '100%' }}>
          {showProxyBannerContainer ? renderBannerPlaceHolder() : null}
        </View>
        {renderBannersCarousel()}
      </View>
    );
  };

  const dataBannerCards = (darktheme: any) => {
    const datatoadd = bannerDataHome?.filter((item: any) => item?.banner_display_type === 'card');

    let datatosend = [] as any;
    datatosend = datatoadd?.map((item: any) => ({
      imageUrl: { uri: darktheme ? getMobileURL(item?.banner) : item?.banner },
      title: item?.banner_template_info?.headerText1,
      value: item?.banner_template_info?.headerText2,
      action: {
        url: item?.cta_action?.url || item?.cta_action?.meta?.url,
        type: item?.cta_action?.type,
        cta_action: item?.cta_action?.meta?.action,
      },
    }));
    return datatosend;
  };

  const navigateCTAActions = (action: any, url: string) => {
    if (action?.type == 'REDIRECT') {
      if (action.cta_action == 'SPECIALITY_LISTING') {
        postHomepageEvent('Offer widget HP');
        props.navigation.navigate(AppRoutes.DoctorSearch);
      } else if (action.cta_action == 'PHARMACY_LANDING') {
        props.navigation.navigate('MEDICINES');
        const eventAttributes = {
          'Nav src': 'offer widger HP',
        };
        setTimeout(
          () => postCleverTapEvent(CleverTapEventName.PHARMACY_HOME_PAGE_VIEWED, eventAttributes),
          500
        );
      } else if (action.cta_action == 'PRO-HEALTH') {
        setShowWebView({ action: true, url: 'https://www.apollo247.com/apollo-pro-health' });
      } else if (action.cta_action == 'PHR') {
        props.navigation.navigate('HealthRecords');
      } else if (action.cta_action == 'DIAGNOSTICS_LANDING') {
        const homeScreenAttributes = {
          Source: DiagnosticHomePageSource.BANNER,
        };
        postDiagnosticHomepageViewedEvent(
          DIAGNOSTIC_ADD_TO_CART_SOURCE_TYPE.HOME_PAGE_OFFER_WIDGET
        );
        props.navigation.navigate('TESTS', { homeScreenAttributes });
      } else if (action.cta_action == 'MEMBERSHIP_DETAIL_CIRCLE') {
        props.navigation.navigate('MembershipDetails', {
          membershipType: 'CIRCLE PLAN',
          isActive: true,
          comingFrom: 'Circle Benifits(Home Screen)',
        });
      } else if (action?.cta_action === string.Hdfc_values.ABSOLUTE_URL) {
        openWebViewFromBanner(url || action?.url);
      }
    } else if (action?.type == string.Hdfc_values.WEB_VIEW) {
      openWebViewFromBanner(url || action?.url);
    }
  };

  const openWebViewFromBanner = async (url: string) => {
    const deviceToken = (await returnAuthToken?.()) || '';
    let updatedUrl: string = '';
    if (url?.includes('apollo-pro-health')) {
      updatedUrl = url?.concat(
        '?utm_source=mobile_app',
        '&utm_token=',
        deviceToken,
        '&utm_mobile_number=',
        currentPatient?.mobileNumber || ''
      );
    } else {
      updatedUrl = url?.concat('?utm_source=mobile_app');
    }
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: updatedUrl,
    });
  };

  const openWebView = (url: any) => {
    Keyboard.dismiss();
    let uri = formatUrl(`${url}`, token, userMobileNumber);

    return (
      <View style={styles.viewWebStyles}>
        <Header
          title={'Circle Membership Benefits'}
          leftIcon="close"
          container={{
            borderBottomWidth: 0,
          }}
          onPressLeftIcon={() => setShowWebView({ action: false })}
        />
        <View style={styles.nestedWebView}>
          <WebView
            source={{
              uri,
            }}
            style={styles.webViewCompo}
            onLoadStart={() => {
              setshowSpinner(true);
            }}
            onLoadEnd={() => {
              setshowSpinner(false);
            }}
            onLoad={() => {
              setshowSpinner(false);
            }}
          />
        </View>
      </View>
    );
  };

  const renderCircleCards = (item: any, darktheme: boolean, renew: boolean) => {
    /**
     * darktheme -> expired case
     * renew -> expiring in x days
     */
    return (
      <View style={styles.circleCardsContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            !darktheme ? navigateCTAActions(item?.action, item?.url) : null;
            const membershipState = darktheme
              ? 'Expired'
              : renew
              ? 'About to Expire'
              : 'Not Expiring';
            onClickCircleBenefits(membershipState, item?.action);
          }}
        >
          <View
            style={
              darktheme ? [styles.circleCards, { borderColor: '#666666' }] : styles.circleCards
            }
          >
            <View style={styles.circleCardsTexts}>
              <Text
                style={
                  darktheme
                    ? [
                        { ...theme.viewStyles.text('M', 12, '#666666', 0.6, 16) },
                        { alignSelf: 'flex-start' },
                      ]
                    : [
                        { ...theme.viewStyles.text('M', 12, '#02475B', 1, 16) },
                        { alignSelf: 'flex-start' },
                      ]
                }
              >
                {item?.title}
              </Text>
              {item?.value && (
                <Text
                  style={
                    darktheme
                      ? [
                          { ...theme.viewStyles.text('M', 16, '#666666', 0.6, 18) },
                          {
                            alignSelf: 'flex-start',
                            marginTop: 5,
                          },
                        ]
                      : [
                          { ...theme.viewStyles.text('M', 16, '#02475B', 1, 18) },
                          {
                            alignSelf: 'flex-start',
                            marginTop: 5,
                          },
                        ]
                  }
                >
                  {item?.value}
                </Text>
              )}
            </View>
            <Image source={item?.imageUrl} resizeMode="contain" style={styles.circleCardsImages} />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCircleSubscriptionPlans = () => {
    return (
      <CircleMembershipPlans
        navigation={props.navigation}
        isModal={true}
        closeModal={() => setShowCirclePlans(false)}
        buyNow={true}
        membershipPlans={membershipPlans}
        source={'Consult'}
        from={string.banner_context.HOME}
        healthCredits={healthCredits}
        onPurchaseWithHCCallback={(res: any) => {
          fireCirclePurchaseEvent(
            currentPatient,
            res?.data?.CreateUserSubscription?.response?.end_date
          );
          planPurchasedcr.current =
            res?.data?.CreateUserSubscription?.response?.status === 'PAYMENT_FAILED' ? false : true;
          planValiditycr.current = res?.data?.CreateUserSubscription?.response?.end_date;

          setShowCircleActivationcr(true);
        }}
        circleEventSource={'Landing Home Page banners'}
      />
    );
  };

  const renderCircleActivation = () => (
    <CircleMembershipActivation
      visible={showCircleActivationcr}
      closeModal={(planActivated) => {
        setShowCircleActivationcr(false);
      }}
      defaultCirclePlan={{}}
      navigation={props.navigation}
      circlePaymentDone={planPurchasedcr?.current}
      circlePlanValidity={{ endDate: planValiditycr?.current }}
      source={'Consult'}
      from={string.banner_context.MEMBERSHIP_DETAILS}
      circleEventSource={'Landing Home Page'}
    />
  );

  const getMobileURL = (url: string) => {
    const ext = url?.includes('.jpg') ? '.jpg' : url?.includes('.jpeg') ? 'jpeg' : '.png';
    const txt = url.split(ext)[0];
    const path = txt.split('/');
    path.pop();
    const name = url.split(ext)[0].split('/')[txt.split('/').length - 1];
    const mPath = path.join('/').concat('/d_'.concat(name).concat(ext));
    return mPath;
  };

  const getMobileURLMWEB = (url: string) => {
    const ext = url?.includes('.jpg') ? '.jpg' : url?.includes('.jpeg') ? 'jpeg' : '.png';
    const txt = url.split(ext)[0];
    const path = txt.split('/');
    path.pop();
    const name = url.split(ext)[0].split('/')[txt.split('/').length - 1];
    const mPath = path.join('/').concat('/mweb_'.concat(name).concat(ext));
    return mPath;
  };

  const onClickCircleBenefits = (
    membershipState: 'Expired' | 'About to Expire' | 'Not Expiring' | 'New User',
    action: any
  ) => {
    postCircleWEGEvent(
      currentPatient,
      membershipState,
      action,
      circlePlanValidity,
      circleSubscriptionId
    );
  };

  const renderCircleBox = () => {
    return (
      <LinearGradientComponent
        style={[
          styles.circleContainer,
          {
            borderWidth: 1,
            borderColor: '#F9D5B4',
            height: 57,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
        colors={['#FFEEDB', '#FFFCFA']}
      >
        <Image
          style={{ alignSelf: 'flex-start', width: 46, height: 29, marginLeft: 13 }}
          source={require('@aph/mobile-patients/src/components/ui/icons/circleLogo.webp')}
        />
      </LinearGradientComponent>
    );
  };

  const renderCicleContainer = (card: React.ReactNode, circleStatus: string, renew: boolean) => {
    return (
      <LinearGradientComponent
        style={[
          styles.circleContainer,
          {
            borderWidth: circleStatus === 'active' && !renew ? 1 : 0,
            borderColor: circleStatus === 'active' && !renew ? '#F9D5B4' : '',
          },
        ]}
        colors={circleStatus === 'active' && !renew ? ['#FFEEDB', '#FFFCFA'] : ['#fff', '#fff']}
      >
        {card}
      </LinearGradientComponent>
    );
  };

  const renderCircle = () => {
    /**
     * CircleTypeCard0                    -> never subscribed
     * CircleTypeCard1 && CircleTypeCard2 -> expiring soon in x days
     * CircleTypeCard3 && CircleTypeCard4 -> latest active plans
     * CircleTypeCard5 && CircleTypeCard6 ->  the expired plans
     */

    const expiry = circlePlanValidity ? timeDiffDaysFromNow(circlePlanValidity?.endDate) : '';

    const renew = renewNow !== '' && renewNow === 'yes' ? true : false;
    renew ? setIsRenew && setIsRenew(true) : setIsRenew && setIsRenew(false);
    const darktheme = circleStatus === 'disabled' ? true : false;
    const cardlist = dataBannerCards(darktheme);

    const expired = circlePlanValidity
      ? dateFormatterDDMM(circlePlanValidity?.endDate, 'DD MMM YYYY')
      : '';

    if (expiry > 0 && circleStatus === 'active' && renew && circleSavings > 0) {
      return renderCicleContainer(
        <CircleTypeCard1
          onButtonPress={() => {
            setShowCirclePlans(true);
            onClickCircleBenefits('About to Expire', 'renew');
          }}
          savings={circleSavings?.toString()}
          credits={healthCredits?.toString()}
          expiry={circlePlanValidity?.expiry}
        />,
        circleStatus,
        renew
      );
    } else if (expiry > 0 && circleStatus === 'active' && renew) {
      return renderCicleContainer(
        <CircleTypeCard2
          onButtonPress={() => {
            setShowCirclePlans(true);
            onClickCircleBenefits('About to Expire', 'renew');
          }}
          credits={healthCredits?.toString()}
          expiry={circlePlanValidity?.expiry}
        />,
        circleStatus,
        renew
      );
    } else if (expiry > 0 && circleStatus === 'active' && !renew && circleSavings) {
      return renderCicleContainer(
        <CircleTypeCard3
          onButtonPress={() => {
            onClickCircleBenefits('Not Expiring', string.Hdfc_values.MEMBERSHIP_DETAIL_CIRCLE);
            props.navigation.navigate(AppRoutes.MembershipDetails, {
              membershipType: 'CIRCLE PLAN',
              isActive: true,
              comingFrom: 'Circle Benifits(Home Screen)',
              circleEventSource: 'Landing Home Page',
            });
          }}
          credits={healthCredits?.toString()}
          savings={circleSavings?.toString()}
        />,
        circleStatus,
        renew
      );
    } else if (expiry > 0 && circleStatus === 'active' && !renew) {
      return renderCicleContainer(
        <CircleTypeCard4
          onButtonPress={() => {
            onClickCircleBenefits('Not Expiring', string.Hdfc_values.MEMBERSHIP_DETAIL_CIRCLE);
            props.navigation.navigate(AppRoutes.MembershipDetails, {
              membershipType: 'CIRCLE PLAN',
              isActive: true,
              comingFrom: 'Circle Benifits(Home Screen)',
              circleEventSource: 'Landing Home Page',
            });
          }}
          credits={healthCredits?.toString()}
          savings={circleSavings?.toString()}
        />,
        circleStatus,
        renew
      );
    } else if (expiry <= 0 && circleStatus === 'active' && !renew) {
      return renderCicleContainer(
        <CircleTypeCard5
          onButtonPress={() => {
            setShowCirclePlans(true);
            onClickCircleBenefits('Expired', 'renew');
          }}
          savings={circleSavings?.toString()}
          credits={healthCredits?.toString()}
          expired={expired}
          renew={renew}
        />,
        circleStatus,
        renew
      );
    } else if (circleStatus === 'disabled' && circleSavings > 0) {
      return renderCicleContainer(
        <CircleTypeCard5
          onButtonPress={() => {
            setShowCirclePlans(true);
            onClickCircleBenefits('Expired', 'renew');
          }}
          savings={circleSavings?.toString()}
          credits={healthCredits?.toString()}
          expired={expired}
          renew={renew}
        />,
        circleStatus,
        renew
      );
    } else if (circleStatus === 'disabled') {
      return renderCicleContainer(
        <CircleTypeCard6
          onButtonPress={() => {
            setShowCirclePlans(true);
            onClickCircleBenefits('Expired', 'renew');
          }}
          savings={circleSavings?.toString()}
          credits={healthCredits?.toString()}
          expired={expired}
          renew={renew}
        />,
        circleStatus,
        renew
      );
    }

    //     {/* these banners might get added in new design */}
    //     {/* {renderCircleBannerCards} */}

    //     <View style={styles.circleRowsContainer}>
    //       {/* dont delete this containes, text rows and bottom text and elements can go here when added */}
    //     </View>
  };

  const renderCircleBuyNow = () => {
    return (
      <View style={[styles.circleContainer, { borderWidth: 0 }]}>
        <CircleTypeCard7
          onButtonPress={() => {
            setShowCirclePlans(true);
            onClickCircleBenefits('New User', 'renew');
          }}
          price={membershipPlans?.length > 0 ? membershipPlans?.[1]?.price : '199' || '199'}
          validity={
            membershipPlans?.length > 0 ? membershipPlans?.[1]?.durationInMonth : '6' || '6'
          }
        />
      </View>
    );
  };

  const renderOtherResourcesMainView = () => {
    return (
      <View
        style={{
          paddingHorizontal: 18,
        }}
      >
        {renderHealthArticleAndResources()}
      </View>
    );
  };

  const renderCircleBannerCards = (cardlist: any) => {
    if (cardlist?.length <= 0) return null;
    return (
      <View style={[styles.circleRowsContainer, { paddingRight: 10 }]}>
        <View style={styles.circleButtonLeft}>
          <ImageBackground
            style={styles.circleButtonImage}
            source={require('@aph/mobile-patients/src/components/ui/icons/PathLeft.webp')}
          />
        </View>

        <FlatList
          horizontal={true}
          data={cardlist}
          renderItem={({ item }) => renderCircleCards(item, darktheme, renew)}
          keyExtractor={(item, index) => index.toString() + 'circle'}
        />

        <View style={styles.circleButtonRight}>
          <ImageBackground
            style={styles.circleButtonImage}
            source={require('@aph/mobile-patients/src/components/ui/icons/PathRight.webp')}
          />
        </View>
      </View>
    );
  };

  const renderHeadings = (title: string) => {
    return (
      <View
        style={{
          paddingHorizontal: 20,
          marginTop: 16,
        }}
      >
        <Text style={{ ...theme.viewStyles.text('B', 16, theme.colors.LIGHT_BLUE, undefined, 20) }}>
          {title}
        </Text>
      </View>
    );
  };

  const renderCovidBlueButtons = (
    onButtonClick: TouchableOpacityProps['onPress'],
    buttonIcon: React.ReactNode,
    title: string
  ) => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        activeOpacity={0.5}
        onPress={onButtonClick}
        style={styles.covidToucahble}
      >
        <View style={styles.covidIconView}>{buttonIcon}</View>
        <View style={styles.covidTitleView}>
          <Text style={{ ...theme.viewStyles.text('M', 14, theme.colors.WHITE) }}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHealthArticleAndResources = () => {
    return (
      <View style={styles.covidCardContainer}>
        <ImageBackground
          style={{ overflow: 'hidden', width: '100%', height: 150 }}
          resizeMode={'stretch'}
          source={require('@aph/mobile-patients/src/images/home/healthcareEcosystem.webp')}
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
        <View style={{ padding: 16, paddingTop: 24 }}>
          {renderContent(string.common.healthBlog, string.common.healthBlogDescription)}
          {renderCovidHelpButtons()}
        </View>
      </View>
    );
  };
  // Read Article Container Styling
  const renderReadArticleContent = () => {
    return (
      <CovidButton
        iconBase={LatestArticle}
        title={string.common.readLatestArticles}
        onPress={() => onPressReadArticles()}
      />
    );
  };

  const renderRemoteConfigItems = (item: any, index: number) => {
    return (
      <View
        key={index}
        style={{ marginBottom: index === covidVaccineCtaV2?.data?.length - 1 ? 15 : 0 }}
      >
        <CovidButton
          iconStyle={styles.covidIconStyle}
          iconUrl={item?.colorReverse ? item?.reverseIconPath : item?.iconPath}
          buttonStyle={[
            styles.covidBtn,
            {
              backgroundColor: item?.colorReverse ? theme.colors.APP_YELLOW : theme.colors.WHITE,
            },
          ]}
          iconBase={VaccineTracker}
          btnTitleStyle={[
            styles.covidBtnTitle,
            {
              color: item?.colorReverse ? theme.colors.WHITE : theme.colors.APP_YELLOW,
            },
          ]}
          title={
            item?.title == 'Book Vaccination Slot'
              ? corporateSubscriptions == undefined || corporateSubscriptions?.length == 0
                ? 'Book Vaccination Slot'
                : corporateSubscriptions?.length >= 0 && !!vaccinationCmsIdentifier
                ? 'Book Vaccination Slot'
                : 'Book Vaccination Slot'
              : item?.title
          }
          onPress={() => {
            item?.docOnCall ? onPressCallDoctor(item) : handleCovidCTA(item);
          }}
        />
      </View>
    );
  };

  // Covid Information Container styling
  const renderCovidContainer = () => {
    return (
      <View style={styles.covidContainer}>
        <View style={styles.covidTitleContainer}>
          <CovidOrange style={styles.covidIcon} />
          <Text style={styles.covidTitle}>{covidVaccineCtaV2?.mainTitle}</Text>
        </View>
        <FlatList
          data={covidVaccineCtaV2?.data}
          numColumns={2}
          keyExtractor={(_, index: Number) => `${index}`}
          renderItem={({ item, index }) => renderRemoteConfigItems(item, index)}
        />
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
        {renderReadArticleContent()}
        {renderDashedLine()}
      </View>
    );
  };

  const renderDashedLine = () => {
    return <DashedLine style={styles.plainLine} />;
  };

  const onPressCallDoctor = async (item: any) => {
    const attibutes = {
      'CTA Clicked': item?.title,
    };
    postVaccineWidgetEvents(CleverTapEventName.VACCINATION_CALL_A_DOCTOR_CLICKED);
    postHomeWEGEvent(WebEngageEventName.COVID_VACCINATION_SECTION_CLICKED, undefined, attibutes);
    setShowHdfcConnectPopup(true);
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

        {/* {renderCovidBlueButtons(
          onPressHealthPro,
          <ApolloHealthProIcon style={{ width: 28, height: 28 }} resizeMode="stretch" />,
          'Explore Apollo ProHealth'
        )} */}
        {renderCovidBlueButtons(
          onPressRiskLevel,
          <CovidRiskLevel style={{ width: 24, height: 24 }} />,
          'Check your risk level'
        )}
        {/* {renderCovidBlueButtons(
          onPressHealthyLife,
          <HealthyLife style={{ width: 24, height: 24 }} />,
          `${AppConfig.Configuration.HdfcHealthLifeText}`
        )} */}
        {renderCovidBlueButtons(
          onPressCorporateMembership,
          <HealthyLife style={{ width: 24, height: 24 }} />,
          `${AppConfig.Configuration.CorporateMembershipText}`
        )}
        {renderCovidBlueButtons(
          onPressKavach,
          <KavachIcon style={{ width: 24, height: 24 }} />,
          `${AppConfig.Configuration.HOME_SCREEN_KAVACH_TEXT}`
        )}
      </View>
    );
  };

  const onPressReadArticles = () => {
    postVaccineWidgetEvents(CleverTapEventName.READ_BLOG_VIEWED, 'Blog Widget');
    postHomeWEGEvent(WebEngageEventName.READ_ARTICLES);
    try {
      const openUrl =
        APP_ENV === 'PROD' ? AppConfig.Configuration.BLOG_URL : string.common.stagingBlogUrl;

      props.navigation.navigate(AppRoutes.CovidScan, {
        covidUrl: openUrl,
      });
    } catch (e) {}
  };

  const handleCovidCTA = async (item: any) => {
    const attibutes = {
      'CTA Clicked': item?.title,
    };
    postHomeWEGEvent(WebEngageEventName.COVID_VACCINATION_SECTION_CLICKED, undefined, attibutes);

    try {
      if (item?.action === string.vaccineBooking.CORPORATE_VACCINATION) {
        postVaccineWidgetEvents(CleverTapEventName.VACCINATION_BOOK_SLOT_CLICKED);
        AsyncStorage.setItem('verifyCorporateEmailOtpAndSubscribe', 'false');
        if (corporateSubscriptions?.length) {
          if (!!vaccinationCmsIdentifier) {
            if (agreedToVaccineTnc === 'yes') {
              props.navigation.navigate(AppRoutes.BookedVaccineScreen, {
                cmsIdentifier: vaccinationCmsIdentifier || '',
                subscriptionId: vaccinationSubscriptionId || '',
                subscriptionInclusionId: vaccinationSubscriptionInclusionId || '',
                isVaccineSubscription: !!vaccinationCmsIdentifier,
                isCorporateSubscription: !!corporateSubscriptions?.length,
              });
              sendBookVaccinationSlotCTAEvent();
            } else {
              props.navigation.navigate(AppRoutes.VaccineTermsAndConditions, {
                isCorporateSubscription: !!corporateSubscriptions?.length,
                cmsIdentifier: vaccinationCmsIdentifier || '',
                subscriptionId: vaccinationSubscriptionId || '',
                subscriptionInclusionId: vaccinationSubscriptionInclusionId || '',
                isVaccineSubscription: !!vaccinationCmsIdentifier,
              });
            }
          } else {
            props.navigation.navigate(AppRoutes.BookedVaccineScreen, {
              cmsIdentifier: vaccinationCmsIdentifier || '',
              subscriptionId: vaccinationSubscriptionId || '',
              subscriptionInclusionId: vaccinationSubscriptionInclusionId || '',
              isVaccineSubscription: !!vaccinationCmsIdentifier,
              isCorporateSubscription: !!corporateSubscriptions?.length,
            });
            sendBookVaccinationSlotCTAEvent();
          }
        } else {
          props.navigation.navigate(AppRoutes.BookedVaccineScreen, {
            cmsIdentifier: vaccinationCmsIdentifier || '',
            subscriptionId: vaccinationSubscriptionId || '',
            subscriptionInclusionId: vaccinationSubscriptionInclusionId || '',
            isVaccineSubscription: !!vaccinationCmsIdentifier,
            isCorporateSubscription: !!corporateSubscriptions?.length,
          });
          sendBookVaccinationSlotCTAEvent();
        }
      } else if (item?.url?.includes('apollopatients://')) {
        postVaccineWidgetEvents(CleverTapEventName.VACCINATION_CONSULT_CLICKED);
        // handling speciality deeplink only on this phase
        const data = handleOpenURL(item?.url);
        const { routeName, id, isCall, mediaSource } = data;
        const isCircleMember: any = await AsyncStorage.getItem('isCircleMember');
        const isCircleMembershipExpired: any = await AsyncStorage.getItem(
          'isCircleMembershipExpired'
        );
        pushTheView(
          props.navigation,
          routeName,
          id ? id : undefined,
          isCall,
          isCircleMember === 'yes',
          isCircleMembershipExpired === 'yes',
          mediaSource
        );
      } else {
        postVaccineWidgetEvents(CleverTapEventName.FAQs_ARTICLES_CLICKED);
        regenerateJWTToken('vaccine', item?.url);
      }
    } catch (e) {}
  };

  const sendBookVaccinationSlotCTAEvent = () => {
    try {
      const eventAttributes = {
        'Patient ID': currentPatient?.id || '',
        'Patient First Name': currentPatient?.firstName.trim(),
        'Patient Last Name': currentPatient?.lastName.trim(),
        'Patient UHID': currentPatient?.uhid,
        'Patient Number': currentPatient?.mobileNumber,
        'Patient Gender': currentPatient?.gender,
        'Pateint Age ': getAge(currentPatient?.dateOfBirth),
        'Source ': Platform.OS === 'ios' ? 'ios' : 'android',
      };
      postWebEngageEvent(WebEngageEventName.BOOK_VACCINATION_SLOT, eventAttributes);
    } catch (error) {}
  };

  const onPressHealthPro = async () => {
    const deviceToken = (await returnAuthToken?.()) || '';
    const healthProWithParams = AppConfig.Configuration.APOLLO_PRO_HEALTH_URL.concat(
      '&utm_token=',
      deviceToken,
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
    postVaccineWidgetEvents(CleverTapEventName.CHECK_RISK_LEVEL_CLICKED);
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

  const onPressCorporateMembership = async () => {
    postVaccineWidgetEvents(CleverTapEventName.EXPLORE_CORPORATE_MEMBERSHIP_CLICKED);
    props.navigation.navigate(AppRoutes.MyMembership);
  };

  const onPressKavach = () => {
    postVaccineWidgetEvents(CleverTapEventName.KAVACH_PROGRAM_CLICKED);
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

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const cleverTapEventForHomeIconClick = () => {
    let eventAttributes = {
      'Patient name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      'Patient age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient gender': g(currentPatient, 'gender'),
      'Mobile Number': g(currentPatient, 'mobileNumber'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
      'Page name': 'HomePage Header',
      'Circle Member': !!circleSubscriptionId ? 'True' : 'False',
    };
    postCleverTapEvent(CleverTapEventName.HOME_ICON_CLICKED, eventAttributes);
  };

  const renderTopIcons = () => {
    const onPressCart = () => {
      postVaccineWidgetEvents(CleverTapEventName.MY_CART_CLICKED, 'Top bar');
      const route =
        (serverCartItems?.length && cartItems?.length) ||
        (!serverCartItems?.length && !cartItems.length)
          ? AppRoutes.MedAndTestCart
          : serverCartItems?.length
          ? AppRoutes.ServerCart
          : AppRoutes.AddPatients;
      props.navigation.navigate(route);
    };

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: '#fff',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity activeOpacity={0.5} onPress={cleverTapEventForHomeIconClick}>
            <ApolloLogo style={{ width: 57, height: 37 }} resizeMode="contain" />
          </TouchableOpacity>
          {renderProfileDrop()}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity activeOpacity={0.5} onPress={onPressCart}>
            <CartIcon />
            {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              postVaccineWidgetEvents(CleverTapEventName.NOTIFICATION_CENTER_CLICKED, 'Top bar');
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

  const renderProhealthBanner = () => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => _navigateProHealth()}
        style={styles.proHealthBannerTouch}
      >
        <ImageBackground
          style={styles.proHealthBannerImage}
          source={{ uri: AppConfig.Configuration.PROHEALTH_BANNER_IMAGE }}
          resizeMode={'contain'}
          borderRadius={8}
        ></ImageBackground>
      </TouchableOpacity>
    );
  };

  async function _navigateProHealth() {
    postHomeBannerEvent(1, true);
    //call the jwt token again.
    regenerateJWTToken('bookings');
  }

  const postHomeBannerEvent = (
    bannerIndex: number,
    isProHealth: boolean,
    bannerId?: string,
    bannerTitle?: string
  ) => {
    const eventAttributes = {
      User_Type: getUserType(allCurrentPatients),
      'Patient Name': currentPatient?.firstName,
      'Patient UHID': currentPatient?.uhid,
      'Patient age': getAge(currentPatient?.dateOfBirth),
      'Circle Member': circleSubscriptionId ? 'True' : 'False',
      'Customer ID': currentPatient?.id,
      'Patient gender': currentPatient?.gender,
      'Mobile number': currentPatient?.mobileNumber,
      'Page name': 'HomePage',
      'Section Name': isProHealth ? 'Pro health' : 'Homepage Banner',
      'Banner position': String(bannerIndex),
      'Banner id': isProHealth ? 'NA' : bannerId,
      'Banner title': isProHealth ? 'NA' : bannerTitle,
    };
    postCleverTapEvent(CleverTapEventName.BANNER_CLICKED_VIEWED, eventAttributes);
  };

  const regenerateJWTToken = async (source: string, id?: string) => {
    let deviceType =
      Platform.OS == 'android'
        ? !!BookingSource?.Apollo247_Android
          ? BookingSource?.Apollo247_Android
          : 'Apollo247_Android'
        : !!BookingSource?.Apollo247_Ios
        ? BookingSource?.Apollo247_Ios
        : 'Apollo247_Ios';
    setLoading?.(true);
    const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
    if (userLoggedIn == 'true') {
      // no need to refresh jwt token on login
      try {
        firebaseAuth().onAuthStateChanged(async (user) => {
          if (user) {
            const jwt = await user.getIdToken(true).catch((error) => {
              setIsSigningIn(false);
              setSignInError(true);
              setAuthToken('');
              throw error;
            });
            setAuthToken(jwt);
            source == 'vaccine'
              ? initiateVaccinationWebView(id, jwt)
              : source === 'bookings'
              ? initiateProHealthWebView(jwt, deviceType)
              : initiateOrdersProHealthWebView(id!, jwt, deviceType);
          }
        });
      } catch (e) {
        setLoading?.(false);
        CommonBugFender('regenerateJWTToken_ConsultRoom', e);
      }
    }
    setLoading?.(false);
  };

  function initiateVaccinationWebView(url: any, jwtToken: string) {
    const userMobNo = g(currentPatient, 'mobileNumber');
    const openUrl = `${url}?utm_source=mobile_app&utm_mobile_number=${userMobNo}&utm_token=${jwtToken}`;
    props.navigation.navigate(AppRoutes.CommonWebView, {
      url: openUrl,
    });
  }

  function initiateProHealthWebView(jwtToken: string, deviceType: string) {
    try {
      const openUrl = AppConfig.Configuration.PROHEALTH_BOOKING_URL;
      let finalUrl = openUrl.concat(
        '?utm_token=',
        jwtToken,
        '&utm_mobile_number=',
        currentPatient && g(currentPatient, 'mobileNumber') ? currentPatient.mobileNumber : '',
        '&deviceType=',
        deviceType
      );
      !!jwtToken &&
        jwtToken != '' &&
        props.navigation.navigate(AppRoutes.ProHealthWebView, {
          covidUrl: finalUrl,
          goBackCallback: webViewGoBack,
        });
      setLoading?.(false);
    } catch (e) {
      setLoading?.(false);
      CommonBugFender('opening_ProHealthwebView_ConsultRoom', e);
    }
  }

  function webViewGoBack() {
    //call the api.
    getPatientApiCall(); //to check if new user is added
    getActiveProHealthAppointments(currentPatient); //to show the prohealth appointments
  }

  function initiateOrdersProHealthWebView(displayId: string, jwtToken: string, deviceType: string) {
    try {
      const openUrl = AppConfig.Configuration.PROHEALTH_BOOKING_URL;
      let finalUrl = openUrl.concat(
        '-success',
        '/',
        displayId,
        '?utm_token=',
        jwtToken,
        '&utm_mobile_number=',
        currentPatient && g(currentPatient, 'mobileNumber') ? currentPatient.mobileNumber : '',
        '&deviceType=',
        deviceType
      );
      !!displayId && displayId != ''
        ? props.navigation.navigate(AppRoutes.ProHealthWebView, {
            covidUrl: finalUrl,
            goBackCallback: webViewGoBack,
          })
        : null;
      setLoading?.(false);
    } catch (e) {
      setLoading?.(false);
      CommonBugFender('opening_ProHealthwebView_ConsultRoom', e);
    }
  }

  const renderAllConsultedDoctors = () => {
    return <ConsultedDoctorsCard navigation={props.navigation} />;
  };
  const renderSecondaryConsultationCta = () => (
    <View style={styles.menuOptionsContainer}>
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          postHomeFireBaseEvent(FirebaseEventName.FIND_A_DOCTOR, 'Home Screen');
          postHomeWEGEvent(WebEngageEventName.BOOK_DOCTOR_APPOINTMENT);
          postHomeCleverTapEvent(
            CleverTapEventName.CONSULT_HOMESCREEN_BOOK_DOCTOR_APPOINTMENT_CLICKED,
            'Home Screen',
            {},
            'Secondary'
          );
          postHospitalVisitClicked();
          props.navigation.navigate(AppRoutes.DoctorSearch, {
            isOnlineConsultMode: false,
            consultTypeCta: 'Secondary',
          });
        }}
      >
        <View style={styles.bottomCardView}>
          <View style={styles.bottomImageView}>
            <HospitalVisit
              style={{
                height: 20,
                width: 20,
              }}
            />
          </View>
          <View style={styles.bottomTextView}>
            <Text style={[theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20)]}>
              Hospital Visit
            </Text>
          </View>
          <View style={styles.bottomRightArrowView}>
            <ArrowRight />
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          postHomeFireBaseEvent(FirebaseEventName.FIND_A_DOCTOR, 'Home Screen');
          postHomeWEGEvent(WebEngageEventName.BOOK_DOCTOR_APPOINTMENT);
          postHomeCleverTapEvent(
            CleverTapEventName.CONSULT_HOMESCREEN_BOOK_DOCTOR_APPOINTMENT_CLICKED,
            'Home Screen',
            {},
            'Secondary'
          );
          props.navigation.navigate(AppRoutes.DoctorSearch, {
            isOnlineConsultMode: true,
            consultTypeCta: 'Secondary',
          });
        }}
      >
        <View style={styles.bottomCardView}>
          <View style={styles.bottomImageView}>
            <VideoConsult
              style={{
                height: 20,
                width: 20,
              }}
            />
          </View>
          <View style={styles.bottomTextView}>
            <Text style={[theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20)]}>
              Video Consult
            </Text>
          </View>

          <View style={styles.bottomRightArrowView}>
            <ArrowRight />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  const callAskApolloNumber = () => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.CLICKED_ON_APOLLO_NUMBER] = {
      'Screen type': 'Speciality page',
      'Patient Number': currentPatient?.mobileNumber,
    };
    postCleverTapEvent(CleverTapEventName.CLICKED_ON_APOLLO_NUMBER, eventAttributes);
    Linking.openURL(`tel:${AppConfig.Configuration.Ask_Apollo_Number}`);
  };

  const navigateToQuickBook = () => {
    const ctAttributes = {
      'Screen type': 'Speciality page',
      'Patient Number': currentPatient?.mobileNumber,
    };
    props.navigation.navigate(AppRoutes.AskApolloQuickBook, { ctAttributes });
  };

  const renderAskApolloView = () => {
    return (
      <View style={styles.askApolloView}>
        {displayQuickBookAskApollo && (
          <Button
            title="QUICK BOOK"
            style={styles.quickBookBtn}
            titleTextStyle={styles.quickBookText}
            onPress={navigateToQuickBook}
          />
        )}
        {displayAskApolloNumber && (
          <View style={styles.horizontalEnd}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={callAskApolloNumber}
              style={styles.horizontalView}
            >
              <CallIcon style={styles.callLogo} />
              <Text style={styles.askApolloNumber}>
                {AppConfig.Configuration.Ask_Apollo_Number}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  const renderReferralBanner = () => {
    return (
      <View
        style={{
          paddingTop: 7,
          paddingHorizontal: 5,
        }}
      >
        <ReferralBanner
          {...props}
          redirectOnShareReferrer={() => {
            beforeRedirectGetRewardIdAndCampaignId();
          }}
          screenName={'Homepage'}
        />
      </View>
    );
  };

  const onSearchMedicines = async (
    searchText: string,
    sortBy: string | null,
    selectedFilters: {},
    filters: MedFilter[]
  ) => {
    try {
      setSearchLoading(true);

      medSearchResults.current = [];
      //  --- not making api call now, earlier we were, pls don't delete as logic might change ---
      // const res = await searchMedicineApi(
      //   searchText,
      //   1,
      //   sortBy,
      //   selectedFilters,
      //   axdcCode,
      //   pinCode
      // );
      let finalProducts: any[] = [];
      finalProducts = [{ name: searchText }];
      medSearchResults.current = finalProducts;

      updateSearchResultList(MedicalRecordType.MEDICATION, finalProducts);
      setSearchLoading(false);
    } catch (error) {
      setSearchLoading(false);
      updateSearchResultList(MedicalRecordType.MEDICATION, []);
    }
  };

  const onSearchTests = async (_searchText: string) => {
    const cityId =
      locationForDiagnostics?.cityId != ''
        ? locationForDiagnostics?.cityId
        : !!diagnosticServiceabilityData && diagnosticServiceabilityData?.city != ''
        ? diagnosticServiceabilityData?.cityId
        : AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID;
    setSearchLoading(true);
    testSearchResults.current = [];
    try {
      const res = await getDiagnosticSearchResults(client, _searchText, Number(cityId), 5);
      let finalProducts = [];

      if (res?.data?.searchDiagnosticItem) {
        const products = res?.data?.searchDiagnosticItem?.data || [];

        finalProducts = products.slice(0, 3);

        testSearchResults.current = finalProducts;
      } else {
        testSearchResults.current = [];
      }

      updateSearchResultList(MedicalRecordType.TEST_REPORT, testSearchResults.current);
      setSearchLoading(false);
    } catch (error) {
      CommonBugFender('HomeScreen_ConsultRoom', error);
      setSearchLoading(false);
      updateSearchResultList(MedicalRecordType.TEST_REPORT, []);
    }
  };

  const onSearchConsults = async (_searchText: string) => {
    if (_searchText?.length > 2) {
      setSearchLoading(true);

      try {
        let finalProducts: any[] = [];
        const res = await getDoctorList(_searchText);
        const doctors = res?.data?.getDoctorList?.doctors || [];
        const specialities = res?.data?.getDoctorList?.specialties || [];

        if (doctors?.length !== 0 || specialities?.length !== 0) {
          const finalDoctors = doctors.slice(0, 3);
          const finalSpecialities = specialities.slice(0, 1);
          finalProducts = [...finalDoctors, ...finalSpecialities];

          consultSearchResults.current = finalProducts;
        } else {
          consultSearchResults.current = [];
        }

        updateSearchResultList(MedicalRecordType.CONSULTATION, consultSearchResults.current);
        setSearchLoading(false);
      } catch (e) {
        CommonBugFender('HomeScreen_ConsultRoom', e);
        setSearchLoading(false);
        updateSearchResultList(MedicalRecordType.CONSULTATION, []);
      }
    }
  };

  const getDoctorList = (searchText: string) => {
    return client.query<getDoctorList>({
      query: GET_DOCTOR_LIST,
      fetchPolicy: 'no-cache',
      variables: {
        filterInput: {
          pageNo: 1,
          pageSize: 3,
          searchText,
        },
      },
    });
  };

  const updateSearchResultList = (itemKey: string, itemData: any) => {
    // [...searchResults, { key: itemKey, data: itemData }];
    const newState = [
      { key: MedicalRecordType.MEDICATION, data: medSearchResults.current },
      { key: MedicalRecordType.TEST_REPORT, data: testSearchResults.current },
      { key: MedicalRecordType.CONSULTATION, data: consultSearchResults.current },
    ];
    setSearchResults(newState);
  };

  const postSearchInputEvent = (
    status: 'Success' | 'Fail',
    request: 'Pharma' | 'Diagnostic' | 'Consult',
    input?: string
  ) => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.HOMEPAGE_SEARCH_BAR_QUERY_INPUT] = {
      User_Type: getUserType(allCurrentPatients),
      'Patient Name': currentPatient?.firstName,
      'Patient UHID': currentPatient?.uhid,
      'Patient age': getAge(currentPatient?.dateOfBirth),
      'Circle Member': circleSubscriptionId ? 'True' : 'False',
      'Customer ID': currentPatient?.id,
      'Mobile number': currentPatient?.mobileNumber,
      'Page name': 'HomePage',
      'Patient gender': currentPatient?.gender,
      Keyword: input || '',
      Status: status,
      Vertical: request,
    };
  };

  const postScrollScreenEvent = () => {
    const eventAttributes: CleverTapEvents[CleverTapEventName.SCREEN_SCROLLED] = {
      User_Type: getUserType(allCurrentPatients),
      'Patient Name': currentPatient?.firstName,
      'Patient UHID': currentPatient?.uhid,
      'Patient age': getAge(currentPatient?.dateOfBirth),
      'Circle Member': circleSubscriptionId ? 'True' : 'False',
      'Customer ID': currentPatient?.id,
      'Patient gender': currentPatient?.gender,
      'Mobile number': currentPatient?.mobileNumber,
      'Page name': 'HomePage',
      'Nav src': '',
      Scrolls: scrollCount.current,
    };
    postCleverTapEvent(CleverTapEventName.SCREEN_SCROLLED, eventAttributes);
  };

  const onSearchExecute = async (_searchText: string) => {
    setSearchLoading(true);
    setSearchResults([]);
    onSearchTests(_searchText)
      .then(() => {
        postSearchInputEvent('Success', 'Diagnostic', _searchText);
      })
      .catch((e) => {
        postSearchInputEvent('Fail', 'Diagnostic', _searchText);
        CommonBugFender('HomeScreen_ConsultRoom_onSearchTests', e);
      });

    onSearchMedicines(_searchText, null, {}, [])
      .then(() => {
        postSearchInputEvent('Success', 'Pharma', _searchText);
      })
      .catch((e) => {
        postSearchInputEvent('Fail', 'Pharma', _searchText);
        CommonBugFender('HomeScreen_ConsultRoom_onSearchMedicinesFunction', e);
      });

    onSearchConsults(_searchText)
      .then(() => {
        postSearchInputEvent('Success', 'Consult', _searchText);
      })
      .catch((e) => {
        postSearchInputEvent('Fail', 'Consult', _searchText);
        CommonBugFender('HomeScreen_ConsultRoom_onSearchConsultsFunction', e);
      });

    const save = _.debounce(saveRecentSearchTerm, 500);
    try {
      save(_searchText);
    } catch (e) {}
  };

  interface searchHeaders {
    [path: string]: any;
  }

  const searchResultsTabHeader: searchHeaders = {
    MEDICATION: {
      title: 'In Medicines',
      icon: (s: any) => <MedicineHomeIcon style={{ width: 24, height: 24, ...s }} />,
      backgroundColor: '#EAF6FF',
    },
    TEST_REPORT: {
      title: 'In Lab Tests',
      icon: (s: any) => <LabTestBrownIcon style={{ width: 18, height: 24, ...s }} />,
      backgroundColor: '#FEE7DA',
    },
    CONSULTATION: {
      title: 'In Consult',
      icon: (s: any) => <DoctorIcon style={{ width: 18, height: 24, ...s }} />,
      backgroundColor: '#E5FFFD',
    },
  };

  const renderGlobalSearch = () => {
    return (
      <View style={{ backgroundColor: theme.colors.WHITE }}>
        <View style={styles.searchBarMainViewStyle}>
          <View style={styles.searchBarViewStyle}>
            <SearchAreaIcon
              style={{ width: 20, height: 20, tintColor: theme.colors.HOME_SEARCH_PLACEHOLDER }}
            />
            <TextInput
              placeholder={'Search for Medicines, Doctors, Lab Tests'}
              autoCapitalize={'none'}
              style={styles.textInputStyle}
              selectionColor={theme.colors.TURQUOISE_LIGHT_BLUE}
              numberOfLines={1}
              ref={_searchInputRef}
              onFocus={() => setIsSearchFocus(true)}
              value={searchText}
              placeholderTextColor={theme.colors.HOME_SEARCH_PLACEHOLDER}
              underlineColorAndroid={'transparent'}
              onChangeText={(value) => onSearchTextChange(value)}
            />
            {isSearchFocus && searchText?.length >= 1 ? (
              <TouchableOpacity activeOpacity={0.5} onPress={() => setSearchText('')}>
                <RemoveIconGrey style={{ width: 20, height: 20 }} />
              </TouchableOpacity>
            ) : null}
          </View>
          {isSearchFocus ? (
            <Text style={styles.cancelTextStyle} onPress={onCancelTextClick}>
              {'Cancel'}
            </Text>
          ) : null}
        </View>

        <View
          style={{
            height: 0.5,
            backgroundColor: '#D4D4D4',
            marginHorizontal: -16,
          }}
        />
      </View>
    );
  };

  const renderBannerPlaceHolder = () => {
    if (!bannerFirstImage) {
      return null;
    }

    let bannerImage = getMobileURLMWEB(bannerFirstImage?.banner) + '?imwidth=' + Math.floor(width);

    return (
      <View style={{ marginBottom: 12, marginHorizontal: 16, marginTop: 12 }}>
        <ImageNative
          resizeMode="cover"
          fadeDuration={50}
          borderRadius={6}
          progressiveRenderingEnabled={true}
          style={{
            width: '100%',
            height: 160,
            backgroundColor: colors.OFF_WHITE_DARK,
            borderRadius: 6,
            alignSelf: 'center',
          }}
          source={{
            uri: bannerImage,
          }}
        />

        {/* Below dots - Intentionally commented for future use case - will delete later  */}
        {/* <View style={{ flexDirection: 'row', alignSelf: 'center', marginTop: 22 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(() => {
            return <View style={styles.bannerDots} />;
          })}
        </View> */}
      </View>
    );
  };

  const renderGlobalSearchNoResults = () => {
    return (
      <View style={{ width: width, marginBottom: 6, padding: 16, backgroundColor: '#fff' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#EAF6FF',
            marginVertical: 16,
            paddingVertical: 8,
          }}
        >
          {searchResultsTabHeader[MedicalRecordType.MEDICATION].icon()}
          <Text
            style={{
              ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, 1, 24),
              marginLeft: 14,
            }}
          >
            {searchResultsTabHeader[MedicalRecordType.MEDICATION].title}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SearchNoResultIcon style={{ width: 20, height: 20 }} />
          <Text
            style={{
              ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 16),
              marginLeft: 14,
            }}
          >
            {string.home.search_not_available}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FEE7DA',
            marginVertical: 16,
            paddingVertical: 8,
          }}
        >
          {searchResultsTabHeader[MedicalRecordType.TEST_REPORT].icon()}
          <Text
            style={{
              ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, 1, 24),
              marginLeft: 14,
            }}
          >
            {searchResultsTabHeader[MedicalRecordType.TEST_REPORT].title}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SearchNoResultIcon style={{ width: 20, height: 20 }} />
          <Text
            style={{
              ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 16),
              marginLeft: 14,
            }}
          >
            {string.home.search_not_available}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#E5FFFD',
            marginVertical: 16,
            paddingVertical: 8,
          }}
        >
          {searchResultsTabHeader[MedicalRecordType.CONSULTATION].icon()}
          <Text
            style={{
              ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, 1, 24),
              marginLeft: 14,
            }}
          >
            {searchResultsTabHeader[MedicalRecordType.CONSULTATION].title}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SearchNoResultIcon style={{ width: 20, height: 20 }} />
          <Text
            style={{
              ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 16),
              marginLeft: 14,
            }}
          >
            {string.home.search_not_available}
          </Text>
        </View>
      </View>
    );
  };

  const renderSearchRecentandSuggest = () => {
    return (
      <ScrollView style={[styles.scrollView, { marginTop: -1 }]} bounces={false}>
        <View
          style={{ width: width, marginBottom: 6, paddingHorizontal: 16, backgroundColor: '#fff' }}
        >
          {getRecentORSuggestList('RECENT')}
        </View>
      </ScrollView>
    );
  };

  const getRecentORSuggestList = (listType: string) => {
    const heading = listType === 'SUGGEST' ? 'SEARCH SUGGESTIONS' : 'RECENT SEARCHES';
    const header = (
      <View style={styles.recentOrSuggestContainer}>
        <Text
          style={{
            ...theme.viewStyles.text('SB', 16, theme.colors.LIGHT_BLUE, 1, 24),
            marginLeft: 14,
          }}
        >
          {recentGlobalSearchList?.length >= 1 ? heading : null}
        </Text>
      </View>
    );
    const listitems = recentGlobalSearchList.map((item: any) => {
      return (
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            postHomeCleverTapEvent(
              CleverTapEventName.RECENT_SEARCH_CLICKED_UNDER_SEARCH_BAR,
              'Search bar',
              { keyword: item?.text }
            );
            onSearchTextChange(item.text);
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 4 }}>
            <TimeBlueIcon style={{ width: 24, height: 24, marginHorizontal: 4 }} />
            <Text
              style={{
                ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 16),
                marginLeft: 14,
              }}
            >
              {item.text}
            </Text>
            <ArrowRight style={{ marginLeft: 'auto' }} />
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: '#D4D4D4',
              marginVertical: 6,
            }}
          />
        </TouchableOpacity>
      );
    });

    return (
      <View>
        {header}
        {listitems}
      </View>
    );
  };

  const renderSearchResults = () => {
    return (
      <ScrollView style={styles.scrollView} bounces={false}>
        <View
          style={{
            width: width,
            marginBottom: 6,
            paddingHorizontal: 16,
            paddingBottom: 16,
            backgroundColor: '#fff',
          }}
        >
          {searchResults?.length > 0
            ? searchResults.map((item, index) => renderSearchItem(item, index))
            : renderGlobalSearchNoResults()}
        </View>
      </ScrollView>
    );
  };

  const postProductListingPageViewedEvent = (nav_props: any) => {
    const eventAttributes = {
      'Nav src': 'Searchbar',
      'Test name': nav_props?.testName,
      'Test id': nav_props?.itemId,
    };
    postCleverTapEvent(CleverTapEventName.DIAGNOSTIC_PRODUCT_LISTING_PAGE_VIEWED, eventAttributes);
  };

  const onClickSearchItem = (key: string, pdp: boolean = false, nav_props: any = {}) => {
    // todo: for view all results
    // postHomeCleverTapEvent(
    //   CleverTapEventName.VIEW_ALL_SEARCH_RESULT_CLICKED,
    //   'Search bar'
    // );
    switch (key) {
      case MedicalRecordType.MEDICATION:
        postHomeCleverTapEvent(CleverTapEventName.OPTION_FROM_SEARCH_BAR_CLICKED, 'Search bar', {
          Keyword: searchText,
          Vertical: 'Pharmacy',
        });
        props.navigation.navigate(AppRoutes.MedicineListing, {
          searchText,
          comingFromSearch: true,
          navSrcForSearchSuccess: 'Searchbar',
        });
        break;

      case MedicalRecordType.TEST_REPORT:
        postHomeCleverTapEvent(CleverTapEventName.OPTION_FROM_SEARCH_BAR_CLICKED, 'Search bar', {
          'Test Name': nav_props?.testName,
          Vertical: 'Diagnostic',
        });
        if (pdp) {
          postProductListingPageViewedEvent(nav_props);
          props.navigation.navigate(AppRoutes.TestDetails, nav_props);
        } else {
          props.navigation.navigate(AppRoutes.SearchTestScene, {
            searchText: searchText,
            movedFrom: 'searchbar',
          });
        }
        break;

      case MedicalRecordType.CONSULTATION:
        const consultOptionClicked = !isEmptyObject(nav_props);
        consultOptionClicked &&
          postHomeCleverTapEvent(CleverTapEventName.OPTION_FROM_SEARCH_BAR_CLICKED, 'Search bar', {
            'Doctor Name': nav_props?.doctorName,
            Speciality: nav_props?.speciality,
            Vertical: 'Consult',
          });
        pdp && postDoctorProfileViewedEvent(nav_props);
        consultOptionClicked
          ? pdp
            ? props.navigation.navigate(AppRoutes.DoctorDetails, nav_props)
            : props.navigation.navigate(AppRoutes.DoctorSearchListing, nav_props)
          : props.navigation.navigate(AppRoutes.DoctorSearch, { searchText });
        break;
    }
  };

  const postDoctorProfileViewedEvent = (nav_props: any) => {
    const eventAttributes = {
      'Nav src': 'Searchbar',
      'Doctor id': nav_props?.doctorId,
      'Doctor Name': nav_props?.doctorName,
      Specialty: nav_props?.speciality,
    };
    postCleverTapEvent(CleverTapEventName.CONSULT_DOCTOR_PROFILE_VIEWED, eventAttributes);
  };

  const renderSearchItem = ({ key, data }: any, index: number) => {
    return (
      <View style={styles.searchResMainContainer}>
        <View
          style={[
            styles.searchRowHeader,
            { backgroundColor: searchResultsTabHeader[key].backgroundColor },
          ]}
        >
          {/* icons can be added here */}
          <Text
            style={{
              ...theme.viewStyles.text('M', 16, theme.colors.LIGHT_BLUE, 1, 24),
              marginLeft: 14,
            }}
          >
            {index == 0
              ? 'Search ' + searchResultsTabHeader[key].title
              : searchResultsTabHeader[key].title}
          </Text>
        </View>
        <View>
          <FlatList
            keyExtractor={(_, index) => `${key},${index}`}
            bounces={false}
            data={data}
            ListEmptyComponent={
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <SearchNoResultIcon style={{ width: 26, height: 26 }} />
                <Text
                  style={{
                    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 16),
                    marginLeft: 14,
                  }}
                >
                  {string.home.search_not_available}
                </Text>
              </View>
            }
            renderItem={({ item, index }) => renderSearchItemDetails(item, index, key)}
          />
        </View>
        {data?.length === 0 ? null : (
          <View style={styles.viewAllContainer}>
            <Text
              style={{
                ...theme.viewStyles.text('M', 15, theme.colors.APP_YELLOW, 1, 24),
              }}
              onPress={() => onClickSearchItem(key)}
            >
              View All Results {searchResultsTabHeader[key].title}
            </Text>

            <ArrowRight style={{ marginLeft: 'auto', tintColor: theme.colors.APP_YELLOW }} />
          </View>
        )}
      </View>
    );
  };

  const renderSearchItemDetails = (item: any, index: number, key: string) => {
    const nav_props =
      key === MedicalRecordType.TEST_REPORT
        ? {
            itemId: item?.diagnostic_item_id,
            source: 'Homepage Search',
            comingFrom: AppRoutes.HomeScreen,
            testName: item?.diagnostic_item_name,
          }
        : key === MedicalRecordType.MEDICATION
        ? {
            sku: item?.sku,
            movedFrom: AppRoutes.HomeScreen,
            sectionName: null,
            productPageViewedEventProps: null,
            urlKey: item?.url_key,
          }
        : key === MedicalRecordType.CONSULTATION
        ? {
            specialities: [item?.specialtydisplayName],
            MoveDoctor: 'MoveDoctor',
            doctorId: item?.id,
            doctorName: item?.displayName,
            speciality: item?.specialtydisplayName,
          }
        : {};
    const pdp =
      key === MedicalRecordType.CONSULTATION && item?.__typename == 'Specialty' ? false : true;

    return (
      <TouchableOpacity activeOpacity={0.5} onPress={() => onClickSearchItem(key, pdp, nav_props)}>
        <View style={{ marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={styles.searchItemIcon}>
              {searchResultsTabHeader[key].icon({ width: 26, height: 26 })}
            </View>
            <View style={styles.searchItemText}>
              <Text
                style={{
                  ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 16),
                }}
              >
                {key === MedicalRecordType.TEST_REPORT
                  ? item?.diagnostic_item_name
                  : key === MedicalRecordType.MEDICATION
                  ? item?.name
                  : key === MedicalRecordType.CONSULTATION
                  ? item?.displayName || item?.name
                  : string.home.search_not_available}
              </Text>

              {key === MedicalRecordType.TEST_REPORT ? (
                <Text
                  style={{
                    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE, 1, 14),
                  }}
                >
                  Total Tests - {item?.diagnostic_inclusions?.length}
                </Text>
              ) : key === MedicalRecordType.CONSULTATION ? (
                <Text
                  style={{
                    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE, 1, 14),
                  }}
                >
                  {item?.symptoms || item?.specialtydisplayName}
                </Text>
              ) : null}
            </View>
            <View style={{ marginLeft: 'auto' }}>
              <ArrowRight />
            </View>
          </View>
          <View style={styles.bottomItemsDetailSplit} />
        </View>
      </TouchableOpacity>
    );
  };

  const onCancelTextClick = () => {
    if (_searchInputRef.current) {
      setSearchText('');
      setIsSearchFocus(false);
      _searchInputRef?.current?.clear();
      setSearchResults([]);
      Keyboard.dismiss();
    }
  };

  const onSearchTextChange = (value: string) => {
    setIsSearchFocus(true);
    if (isValidSearch(value)) {
      setSearchText(value);
      if (!(value && value?.length > 2)) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      const search = _.debounce(onSearchExecute, 500);
      setSearchQuery((prevSearch: any) => {
        if (prevSearch.cancel) {
          prevSearch.cancel();
        }
        return search;
      });
      search(value);
    }
  };

  const setRouteJourneyFromTabbar = () => {
    if (!tabRouteJourney) {
      setTabRouteJourney &&
        setTabRouteJourney({
          previousRoute: 'Home',
          currentRoute: 'Home',
        });
    } else {
      setTabRouteJourney &&
        setTabRouteJourney({
          previousRoute: tabRouteJourney?.currentRoute,
          currentRoute: 'Home',
        });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.WHITE }}>
      <NavigationEvents
        onDidFocus={() => {
          scrollCount.current = 0;
          setRouteJourneyFromTabbar();
        }}
        onDidBlur={postScrollScreenEvent}
      />
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {isSearchFocus ? null : renderTopIcons()}
        {renderGlobalSearch()}
        {searchLoading ? (
          renderGlobalSearchShimmer()
        ) : searchText?.length > 2 ? (
          renderSearchResults()
        ) : isSearchFocus ? (
          renderSearchRecentandSuggest()
        ) : (
          <ScrollView
            style={styles.scrollView}
            bounces={false}
            scrollEventThrottle={0}
            onScroll={(event) => {
              const currentOffset = event.nativeEvent.contentOffset?.y;
              currentOffset > (this.offset || 0) && (scrollCount.current += 1);
              this.offset = currentOffset;
            }}
          >
            <View style={{ width: '100%' }}>
              <View style={styles.viewName}>
                {renderMenuOptions()}
                {offersListCache?.length > 0 && renderHeadings('Offers For You')}

                {/* Don't delete this*/}
                {/* {offersListCache.length === 0 && offersListLoading && renderOffersForYouShimmer()} */}

                {(offersListCache?.length > 0 || !offersListLoading) && renderOffersForYou()}
                {isReferrerAvailable && renderReferralBanner()}

                {currentAppointments != '0' ||
                currentAppointments != undefined ||
                myDoctorsCount > 0 ? (
                  renderHeadings('My Doctors')
                ) : (
                  <Text style={{ paddingTop: 12 }}> </Text>
                )}

                {currentAppointments === '0'
                  ? null
                  : renderListView('Active Appointments', 'normal')}
                <View>{renderAllConsultedDoctors()}</View>

                {renderHeadings('Circle Membership and More')}

                {circleDataLoading ? (
                  renderCircleBox()
                ) : (
                  <View style={{}}>
                    {isCircleMember === 'yes' && renderCircle()}
                    {isCircleMember === 'no' && renderCircleBuyNow()}
                  </View>
                )}

                {showCirclePlans && renderCircleSubscriptionPlans()}
                {showCircleActivationcr && renderCircleActivation()}

                {getHomeBanner()}

                {renderHeadings('Book Doctor Consult')}
                <View>{renderSecondaryConsultationCta()}</View>
                {renderHeadings('Services For You')}
                {renderServicesForYouView()}
                {renderHeadings('Apollo Prohealth')}
                {proActiveAppointments?.length == 0 && <View>{renderProhealthBanner()}</View>}
                {proActiveAppointments?.length > 0 && (
                  <View>
                    {renderListView(
                      proActiveAppointments?.length == 1
                        ? 'ProHealth Appointment'
                        : 'ProHealth Appointments',
                      'prohealth'
                    )}
                  </View>
                )}
                {renderOtherResourcesMainView()}
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
      {showWebView?.action && openWebView(showWebView?.url)}
      {isSearchFocus ? null : renderBottomTabBar()}
      {showPopUp && (
        <>
          <BottomPopUp
            title={`Hi ${(currentPatient && currentPatient.firstName) || ''}`}
            description={string.home.welcome_popup.description}
          >
            <View style={{ height: 20, alignItems: 'flex-end' }} />
          </BottomPopUp>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {
              CommonLogEvent(AppRoutes.HomeScreen, 'ConsultRoom_BottomPopUp clicked');
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
      <Overlay
        isVisible={showHdfcConnectPopup}
        windowBackgroundColor={'rgba(0, 0, 0, 0.31)'}
        overlayStyle={styles.overlayStyle}
        onRequestClose={() => setShowHdfcConnectPopup(false)}
      >
        <HdfcConnectPopup
          helplineNumber={'040-482-12515'}
          onClose={() => setShowHdfcConnectPopup(false)}
          isVaccineDocOnCall={true}
          postWEGEvent={() =>
            postHomeWEGEvent(WebEngageEventName.VACCINATION_PROCEED_TO_CONNECT_A_DOCTOR_CLICKED)
          }
        />
      </Overlay>
      <UpdateAppPopup depricatedAppData={depricatedAppData} />
    </View>
  );
};
