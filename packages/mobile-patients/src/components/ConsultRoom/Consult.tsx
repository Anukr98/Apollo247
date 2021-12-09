import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import { ConsultOverlay } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultOverlay';
import {
  DoctorIcon,
  DoctorPlaceholderImage,
  Mascot,
  CTLightGrayVideo,
  PhysicalConsultDarkBlueIcon,
  EditProfilePlaceHolder,
  LinkedUhidIcon,
  SearchGreenIcon,
  FilterDarkBlueIcon,
  FilterGreenIcon,
  ChatBlueIcon,
  PreviousPrescriptionIcon,
  WhiteArrowRightIcon,
  DownArrow,
  Close,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { AppointmentFilterScene } from '@aph/mobile-patients/src/components/ConsultRoom/AppointmentFilterScene';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import {
  CommonBugFender,
  CommonLogEvent,
  isIphone5s,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { GET_PATIENT_ALL_APPOINTMENTS } from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  callPermissions,
  postWebEngageEvent,
  g,
  followUpChatDaysCaseSheet,
  getDiffInMinutes,
  overlyCallPermissions,
  isPastAppointment,
  navigateToHome,
  postCleverTapEvent,
  getUserType,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { ListItem } from 'react-native-elements';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  SectionList,
  Platform,
  Dimensions,
  SectionListData,
  BackHandler,
} from 'react-native';
import { FlatList, NavigationEvents, NavigationScreenProps } from 'react-navigation';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  getPatientAllAppointments,
  getPatientAllAppointmentsVariables,
  getPatientAllAppointments_getPatientAllAppointments_appointments as Appointment,
} from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';
import {
  APPOINTMENT_STATE,
  STATUS,
  APPOINTMENT_TYPE,
  ConsultMode,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { TabHeader } from '@aph/mobile-patients/src/components/ui/TabHeader';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import { NotificationListener } from '@aph/mobile-patients/src/components/NotificationListener';
import _ from 'lodash';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { renderAppointmentShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  nameTextContainerStyle: {
    flex: 1,
  },
  nameTextStyle: {
    marginLeft: 5,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    marginHorizontal: 5,
    marginBottom: 6,
    marginRight: -5,
  },
  hiTextStyle: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  descriptionTextStyle: {
    marginTop: 8,
    marginBottom: 16,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(isIphone5s() ? 15 : 16.5),
    lineHeight: 24,
  },
  buttonStyles: {
    height: 40,
    width: 180,
    marginTop: 16,
  },
  doctorView: {
    marginHorizontal: 8,
    ...theme.viewStyles.cardViewStyle,
    marginVertical: 6, //16,
    borderRadius: 10,
  },
  availableView: {
    position: 'absolute',
    right: 0,
    top: 0,
    minWidth: 112,
  },
  imageView: {
    margin: 16,
    marginTop: 32,
    width: 60,
  },
  doctorNameStyles: {
    paddingTop: 6,
    paddingLeft: 10,
    ...theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE, 1, 20),
  },
  doctorSpecializationStyles: {
    paddingBottom: 11.5,
    paddingLeft: 10,
    ...theme.viewStyles.text('R', 12, theme.colors.LIGHT_BLUE, 1, 16),
  },
  consultTextStyles: {
    paddingTop: 30,
    paddingLeft: 10,
    ...theme.viewStyles.text('M', 12, theme.colors.APP_GREEN, 1, 16),
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.3)',
  },
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
  prepareForConsult: {
    color: theme.colors.WHITE,
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'right',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  fillVitalsForConsult: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 15.6,
    opacity: 0.6,
    color: '#02475B',
    letterSpacing: 0.04,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  postConsultTextStyles1: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#02475b',
    opacity: 0.6,
    letterSpacing: 0.04,
    textAlign: 'right',
    paddingBottom: 16,
    fontWeight: '500',
  },
  postConsultTextStyles2: {
    ...theme.fonts.IBMPlexSansSemiBold(10),
    color: '#02475b',
    opacity: 0.6,
    letterSpacing: 0.04,
    textAlign: 'right',

    marginTop: 2,
    marginRight: 15,
    paddingLeft: 3,
  },
  profileImageStyle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignSelf: 'center',
    marginBottom: 4,
    marginRight: 9,
  },
  profileChangeViewStyle: {
    flexDirection: 'row',
    paddingRight: 8,
    borderRightWidth: 0,
    borderRightColor: 'rgba(2, 71, 91, 0.2)',
    backgroundColor: theme.colors.WHITE,
  },
  linkUhidIconStyle: {
    width: 22,
    height: 20,
    marginLeft: 5,
    marginTop: Platform.OS === 'ios' ? 16 : 20,
  },
  pickAnotherSlotViewStyle: {
    backgroundColor: 'rgba(229,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    marginVertical: 14,
  },
  sectionHeaderTitleStyle: {
    ...theme.viewStyles.text('SB', 14, '#0087BA', 1, 18, 0.18),
    marginLeft: 12,
    marginBottom: 3,
  },
  badgelabelView: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#FC9916',
    height: 14,
    width: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgelabelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
  selectedFilterMainViewStyle: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f1ec',
  },
  selectedFilterViewStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: '96%',
    paddingBottom: 0,
  },
  xTextStyle: {
    ...theme.viewStyles.text('M', 12, '#FFFFFF', 1, 16, -0.26),
    paddingLeft: 8,
    paddingVertical: 8,
    paddingRight: 10,
  },
  filterTextStyle: {
    ...theme.viewStyles.text('M', 12, '#FFFFFF', 1, 16, -0.26),
    paddingVertical: 8,
  },
  filterButtonViewStyle: {
    backgroundColor: '#00B38E',
    height: 'auto',
    borderRadius: 10,
    width: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 3,
    paddingLeft: 10,
    marginRight: 12,
    marginTop: 11,
  },
  removeFilterViewStyle: {
    height: 'auto',
    borderRadius: 10,
    width: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingLeft: 10,
    marginRight: 12,
    marginTop: 11,
  },
  removeFilterTextStyle: {
    ...theme.viewStyles.text('M', 12, '#00B38E', 1, 16, -0.26),
    paddingVertical: 8,
  },
  selectedMemberViewStyle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 14,
    alignItems: 'center',
    flex: 1,
  },
  selectedMemberTextStyle: {
    ...theme.viewStyles.text('B', isIphone5s() ? 11 : 13, '#FC9916', 1, 24),
    marginLeft: 8,
  },
  viewAnotherMemberTextStyle: {
    ...theme.viewStyles.text('M', isIphone5s() ? 10 : 12, '#02475B', 1, 16),
  },
  searchFilterViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginLeft: 10,
  },
  noAppointmentViewStyle: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    marginTop: 20,
    marginHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textConsultSubtextView: {
    flexDirection: 'row',
    paddingStart: 10,
    opacity: 1,
  },
  completedConsultViewStyle: {
    flexDirection: 'row',
    marginBottom: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  doctorImageStyle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'contain',
  },
  doctorImagePlaceholderStyle: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  followUpTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: '#02475b',
    opacity: 0.6,
    marginBottom: 12,
    marginTop: 4,
    letterSpacing: 0.02,
  },
  onlineIconView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medicineNameTextStyle: {
    ...theme.viewStyles.text('M', 12, '#FFFFFF', 1, 20, 0.04),
    paddingHorizontal: 6,
  },
  medicineCardViewStyle: {
    backgroundColor: '#0087BA',
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 3,
    marginTop: 7,
  },
  filterIcon: {
    width: 17,
    height: 18,
    marginTop: 10,
  },
  patientHeaderView: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    paddingBottom: 8,
    backgroundColor: theme.colors.WHITE,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allApptText: {
    ...theme.viewStyles.text('R', 14, theme.colors.SLATE_GRAY, 1, 18),
  },
  selectPatientText: {
    ...theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW, 1, 18),
    fontWeight: '600',
  },
  prevApptView: {
    backgroundColor: theme.colors.WHITE,
    width: 170,
    height: 26,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderColor: theme.colors.CALL_BG_GRAY,
    borderWidth: 1,
    marginTop: 6,
    justifyContent: 'center',
  },
  prevApptText: {
    ...theme.viewStyles.text('R', 10, theme.colors.NILE_BLUE, 1, 13),
  },
  downArrowIcon: {
    width: 12,
    height: 8,
    marginStart: 12,
  },
  patientNameView: {
    flexDirection: 'row',
    backgroundColor: theme.colors.WHITE,
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.APP_GREEN,
    marginBottom: 6,
    marginStart: 6,
  },
  crossIcon: {
    height: 6,
    width: 6,
    marginStart: 8,
  },
  patientNameText: {
    ...theme.viewStyles.text('M', 10, theme.colors.APP_GREEN, 1, 13),
  },
  patientNameHeading: {
    ...theme.viewStyles.text('M', 12, theme.colors.SKY_BLUE, 1, 16),
  },
  patientNameStyle: {
    ...theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE, 1, 18),
    paddingStart: 12,
  },
  cancelledView: {
    flexDirection: 'row',
    marginBottom: 16,
    flex: 1,
    paddingTop: 4,
  },
  viewDetailContainer: {
    backgroundColor: theme.colors.WHITE,
    borderRadius: 8,
    marginStart: 24,
    borderColor: theme.colors.APP_YELLOW,
    borderWidth: 1,
  },
  bookAgainView: {
    backgroundColor: theme.colors.APP_YELLOW,
    borderRadius: 8,
    marginEnd: 24,
  },
  prescriptionView: {
    backgroundColor: theme.colors.WHITE,
    borderRadius: 8,
    marginStart: 24,
    marginBottom: 16,
    borderColor: theme.colors.APP_YELLOW,
    borderWidth: 1,
  },
  textConsultView: {
    backgroundColor: theme.colors.WHITE,
    borderRadius: 8,
    marginEnd: 24,
    marginBottom: 16,
    borderColor: theme.colors.APP_YELLOW,
    borderWidth: 1,
  },
  consultStartedView: {
    alignSelf: 'flex-end',
    paddingBottom: 16,
  },
  consultStartedBtn: {
    backgroundColor: theme.colors.APP_YELLOW,
    borderRadius: 8,
    marginEnd: 24,
  },
  anotherSlotBtn: {
    backgroundColor: theme.colors.APP_YELLOW,
    borderRadius: 8,
    marginEnd: 24,
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  patientContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  listHeader: {
    flex: 1,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    height: 50,
    marginTop: -14,
    justifyContent: 'flex-end',
  },
  statusText: {
    position: 'absolute',
    left: 10,
    top: 6,
    ...theme.viewStyles.text('M', 10, theme.colors.APP_RED, 1, 13),
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
});

export interface ConsultProps extends NavigationScreenProps {
  Data: any;
  TransferData: any;
  TranferDateTime: any;
  FollowupData: any;
  FollowupDateTime: any;
  DoctorName: any;
}

export interface AppointmentFilterObject {
  appointmentStatus: string[] | null;
  availability: string[] | null;
  doctorsList: string[] | null;
  specialtyList: string[] | null;
  movedFrom?: string;
}

export const Consult: React.FC<ConsultProps> = (props) => {
  const { allAppointmentApiResponse, setAllAppointmentApiResponse } = useAppCommonData();

  const tabs = [{ title: 'Active' }, { title: 'Completed' }, { title: 'Cancelled' }];
  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const movedFrom = props.navigation.getParam('movedFrom');

  const [allAppointments, setAllAppointments] = useState<Appointment[] | null>(
    allAppointmentApiResponse
  );
  const [totalApptCount, setTotalApptCount] = useState<number>(0);
  const [selectedPatient, selectPatient] = useState<any>('ALL');
  const { showAphAlert, hideAphAlert } = useUIElements();
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [overlayLoading, setOverlayLoading] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);

  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [appointmentItem, setAppoinmentItem] = useState<Appointment | null>();
  const [showSchdulesView, setShowSchdulesView] = useState<boolean>(false);
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>('');
  const [newRescheduleCount, setNewRescheduleCount] = useState<number>(0);
  const [callFetchAppointmentApi, setCallFetchAppointmentApi] = useState(false);

  const [transferfollowup, setTransferfollowup] = useState<boolean>(false);
  const [followupdone, setFollowupDone] = useState<boolean>(false);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>();

  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();

  const client = useApolloClient();

  useEffect(() => {
    if (selectedPatient?.id) {
      // For a particular patient selected invalidate the cache and show page loading
      setAllAppointmentApiResponse!(null);
      setPageLoading(true);
    }

    if (!allAppointmentApiResponse) {
      // show loader when no data in cache
      setPageLoading(true);
    }

    fetchAppointments(true);
  }, [selectedPatient]);

  useEffect(() => {
    if (movedFrom === 'deeplink') {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBack);
      };
    }
  }, []);

  const handleBack = () => {
    navigateToHome(props.navigation, {}, movedFrom === 'deeplink');
    return true;
  };

  useEffect(() => {
    async function fetchData() {
      const showSchduledPopup = await AsyncStorage.getItem('showSchduledPopup');
      if (showSchduledPopup == 'true') {
        setShowSchdulesView(true);
      }
      const showTransferPopup = await AsyncStorage.getItem('showTransferPopup');
      const showFollowUpPopup = await AsyncStorage.getItem('showFollowUpPopup');
      if (showTransferPopup == 'true') {
        setTransferfollowup(true);
      }
      if (showFollowUpPopup == 'true') {
        setFollowupDone(true);
      }
    }
    fetchData();
    try {
      setNewAppointmentTime(
        props.navigation.getParam('Data')
          ? moment(props.navigation.getParam('Data').appointmentDateTime).format(
              'Do MMMM, dddd \nhh:mm A'
            )
          : ''
      );
      let calculateCount = props.navigation.getParam('Data')
        ? props.navigation.getParam('Data').rescheduleCount
        : '';
      calculateCount = 3 - calculateCount;
      setNewRescheduleCount(calculateCount);
    } catch (error) {
      CommonBugFender('Consult_setNewAppointmentTime_try', error);
      setNewRescheduleCount(1);
    }
  }, [currentPatient]);

  const postConsultCardEvents = (
    type: 'Card Click' | 'Continue Consult' | 'Chat with Doctor' | 'Fill Medical Details',
    data: Appointment
  ) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.CONSULT_CARD_CLICKED]
      | WebEngageEvents[WebEngageEventName.CONTINUE_CONSULT_CLICKED]
      | WebEngageEvents[WebEngageEventName.FILL_MEDICAL_DETAILS] = {
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
    };
    postWebEngageEvent(
      type == 'Card Click'
        ? WebEngageEventName.CONSULT_CARD_CLICKED
        : type == 'Continue Consult'
        ? WebEngageEventName.CONTINUE_CONSULT_CLICKED
        : WebEngageEventName.FILL_MEDICAL_DETAILS,
      eventAttributes
    );
    const cleverTapEventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_CARD_CLICKED] = {
      doctorName: g(data, 'doctorInfo', 'displayName')!,
      specialityId: g(data, 'doctorInfo', 'specialty', 'id')! || undefined,
      specialityName: g(data, 'doctorInfo', 'specialty', 'name')! || undefined,
      'Doctor Category': g(data, 'doctorInfo', 'doctorType')!,
      'Consult Date Time': moment(g(data, 'appointmentDateTime')).toDate(),
      'Consult Mode': g(data, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
      hospitalName:
        g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'name')! || undefined,
      hospitalCity:
        g(data, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'city')! || undefined,
      doctorId: g(data, 'doctorId')! || undefined,
      patientName: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      patientUhid: g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      patientAge: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
      patientGender: g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
    };
    postCleverTapEvent(
      type == 'Card Click'
        ? CleverTapEventName.CONSULT_CARD_CLICKED
        : type == 'Continue Consult'
        ? CleverTapEventName.CONTINUE_CONSULT_CLICKED
        : CleverTapEventName.CONSULT_MEDICAL_DETAILS_FILLED,
      cleverTapEventAttributes
    );
  };

  const fetchAppointments = async (reload?: boolean) => {
    try {
      const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
      const { data } = await client.query<
        getPatientAllAppointments,
        getPatientAllAppointmentsVariables
      >({
        query: GET_PATIENT_ALL_APPOINTMENTS,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: selectedPatient?.id || '',
          patientMobile: '+91' + storedPhoneNumber,
          offset: reload ? 0 : allAppointments.length,
          limit: 5,
        },
      });

      const { appointments, totalAppointmentCount } = data?.getPatientAllAppointments || {};

      const futureOnlineAppts: Appointment[] =
        appointments?.filter(
          (it) =>
            moment(it?.appointmentDateTime).isAfter(moment(new Date())) &&
            it?.appointmentType == 'ONLINE'
        ) || [];
      if (futureOnlineAppts.length && reload) {
        if (Platform.OS === 'ios') {
          callPermissions();
        } else {
          callPermissions(() => {
            overlyCallPermissions(
              futureOnlineAppts[0]?.patientName || '',
              futureOnlineAppts[0]?.doctorInfo?.displayName || '',
              showAphAlert,
              hideAphAlert,
              true,
              () => {},
              'Appointment Screen'
            );
          });
        }
      }
      if (reload) {
        appointments && setAllAppointments([...appointments]);

        selectedPatient === 'ALL' &&
          appointments &&
          setAllAppointmentApiResponse!([...appointments]);
      } else {
        appointments && setAllAppointments([...allAppointments, ...appointments]);

        selectedPatient === 'ALL' &&
          appointments &&
          setAllAppointmentApiResponse!([...allAppointments, ...appointments]);
      }
      setTotalApptCount(totalAppointmentCount || 0);
      setLoading(false);
      setPageLoading(false);
      setOverlayLoading(false);
    } catch (error) {
      setLoading(false);
      setPageLoading(false);
      setOverlayLoading(false);
    }
  };

  const renderConsultOverlay = () => {
    return (
      displayoverlay &&
      appointmentItem && (
        <ConsultOverlay
          mainContainerStyle={{ maxHeight: height - 200 }}
          setdisplayoverlay={() => setdisplayoverlay(false)}
          navigation={props.navigation}
          scrollToSlot={false}
          doctor={appointmentItem?.doctorInfo || null}
          patientId={currentPatient ? currentPatient.id : ''}
          clinics={appointmentItem?.doctorInfo?.doctorHospital || []}
          doctorId={appointmentItem?.doctorId}
          appointmentId={appointmentItem?.id}
          consultModeSelected={ConsultMode.ONLINE}
          externalConnect={null}
          availableMode={ConsultMode.BOTH}
          callSaveSearch={'true'}
        />
      )
    );
  };

  const onViewPrescriptionClick = async (item: Appointment) => {
    const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
    const eventAttributes: CleverTapEvents[CleverTapEventName.VIEW_PRESCRIPTION_CLICKED_APPOINTMENT_CARD] = {
      'Doctor Name': g(item, 'doctorInfo', 'displayName') || '',
      'Doctor Phone Number': g(item, 'doctorInfo', 'mobileNumber') || '',
      'Doctor ID': g(item, 'doctorInfo', 'id') || '',
      'Doctor Speciality Name': g(item, 'doctorInfo', 'specialty', 'name') || '',
      'Doctor Category': g(item, 'doctorInfo', 'doctorType') || '',
      'Patient Name': g(item, 'patientName') || '',
      'Patient Phone Number': `+91${storedPhoneNumber}`,
      'Display ID': String(g(item, 'displayId')) || '',
    };

    postCleverTapEvent(
      CleverTapEventName.VIEW_PRESCRIPTION_CLICKED_APPOINTMENT_CARD,
      eventAttributes
    );
    props.navigation.navigate(AppRoutes.ConsultDetails, {
      CaseSheet: item.id,
      DoctorInfo: item.doctorInfo,
      FollowUp: item.isFollowUp,
      appointmentType: item.appointmentType,
      DisplayId: item.displayId,
      BlobName: '',
    });
  };

  const renderConsultationCard = (item: Appointment, index: number) => {
    let tomorrowDate = moment(new Date())
      .add(1, 'days')
      .format('DD MMM');

    const getConsultationSubTexts = () => {
      const { isAutomatedQuestionsComplete, isSeniorConsultStarted, isConsultStarted } = item || {};
      return (!isAutomatedQuestionsComplete && !isSeniorConsultStarted) || !isConsultStarted
        ? string.common.fillVitalsText
        : !isConsultStarted && isAutomatedQuestionsComplete
        ? string.common.gotoConsultRoomJuniorDrText
        : isSeniorConsultStarted
        ? string.common.joinConsultRoom
        : string.common.mentionReports;
    };

    const getAppointmentStatusText = () => {
      if (item?.status === STATUS.CANCELLED) {
        return 'Cancelled';
      } else if (item?.status === STATUS.COMPLETED) {
        return 'Completed';
      } else if (item?.appointmentState === APPOINTMENT_STATE.RESCHEDULE) {
        return 'Rescheduled';
      } else if (item?.status === STATUS.PENDING || item?.status === STATUS.IN_PROGRESS) {
        return 'Active';
      } else if (item?.isFollowUp === 'true') {
        return 'Follow Up Appointment';
      } else {
        return null;
      }
    };
    let appointmentDateTomarrow = moment(item.appointmentDateTime).format('DD MMM');
    const caseSheet = followUpChatDaysCaseSheet(item.caseSheet);
    const caseSheetChatDays = g(caseSheet, '0' as any, 'followUpAfterInDays');
    const followUpAfterInDays =
      caseSheetChatDays || caseSheetChatDays === '0'
        ? caseSheetChatDays === '0'
          ? 1
          : Number(caseSheetChatDays) + 1
        : 8;
    const appointmentDateTime = moment
      .utc(item.appointmentDateTime)
      .local()
      .format('YYYY-MM-DD HH:mm:ss');
    const minutes = moment.duration(moment(appointmentDateTime).diff(new Date())).asMinutes();
    const title =
      minutes > 0 && minutes <= 15 && getAppointmentStatusText() == 'Active'
        ? `${Math.ceil(minutes)} MIN${Math.ceil(minutes) > 1 ? 'S' : ''}`
        : tomorrowDate == appointmentDateTomarrow
        ? 'TOMORROW, ' + moment(appointmentDateTime).format('h:mm A')
        : moment(appointmentDateTime).format('DD MMM YYYY, h:mm A');
    const isActive =
      minutes > 0 && minutes <= 15 && getAppointmentStatusText() == 'Active' ? true : false;
    const dateIsAfterconsult = moment(appointmentDateTime).isAfter(moment(new Date()));
    const doctorHospitalName =
      g(item, 'doctorInfo', 'doctorHospital', '0' as any, 'facility', 'name')! ||
      'Physical Consultation';
    const day1 = moment(appointmentDateTime)
      .startOf('day')
      .add(followUpAfterInDays, 'days'); // since we're calculating as EOD
    const day2 = moment(new Date());
    day1.diff(day2, 'days'); // 1
    const numberDaysToConsultText =
      '(' + day1.diff(day2, 'days') + (day1.diff(day2, 'days') == 1 ? ' day left)' : ' days left)');
    const prevItem =
      selectedTab === tabs[1].title
        ? allAppointments[index - 1]
        : selectedTab !== tabs[0].title
        ? allAppointments[index - 1]
        : null;
    const prevItemDateTime = moment
      .utc(prevItem?.appointmentDateTime)
      .local()
      .format('YYYY-MM-DD');
    const displayTopDateTime =
      prevItemDateTime !== moment(item?.appointmentDateTime).format('YYYY-MM-DD');
    const appointmentDateText =
      tomorrowDate == appointmentDateTomarrow
        ? 'Tomorrow'
        : moment(appointmentDateTime).format('ddd, DD MMM YYYY');
    const showDateText = index === 0 ? true : displayTopDateTime;
    const pastAppointmentItem = isPastAppointment(item?.caseSheet, item);
    const medicinePrescription = g(caseSheet, '0' as any, 'medicinePrescription');
    const getMedicines = (
      medicines:
        | (getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet_medicinePrescription | null)[]
        | null
    ) =>
      medicines
        ? medicines
            .filter((i) => i?.medicineName)
            .map((i) => i?.medicineName)
            .join(', ')
        : null;
    const followUpMedicineNameText = getMedicines(medicinePrescription!);
    const renderPastConsultationButtons = () => {
      const onPressPastAppointmentViewDetails = () => {
        item.appointmentType === 'ONLINE'
          ? props.navigation.navigate(AppRoutes.ChatRoom, {
              data: item,
              callType: '',
              prescription: '',
              disableChat: item.doctorInfo && pastAppointmentItem,
            })
          : item.appointmentType === 'PHYSICAL'
          ? props.navigation.navigate(AppRoutes.AppointmentDetailsPhysical, {
              data: item,
              from: 'Consult',
            })
          : props.navigation.navigate(AppRoutes.DoctorDetails, {
              doctorId: g(item, 'doctorId') || '',
              cleverTapAppointmentAttributes: {
                source: 'Appointment CTA',
                appointmentCTA: 'Past',
              },
            });
      };
      const cancelConsulations = getAppointmentStatusText() === 'Cancelled';
      return (
        <View>
          <Text style={styles.fillVitalsForConsult}>
            {item?.status == STATUS.CANCELLED
              ? string.common.bookAnotherSlot
              : item?.status == STATUS.COMPLETED
              ? string.common.bookFollowUp
              : null}
          </Text>
          <View
            style={{
              ...styles.cancelledView,
              justifyContent: cancelConsulations ? 'flex-end' : 'space-between',
            }}
          >
            {cancelConsulations ? null : (
              <TouchableOpacity
                activeOpacity={1}
                style={styles.viewDetailContainer}
                onPress={() => {
                  onPressPastAppointmentViewDetails();
                  fireWebengageEvent(item, 'details');
                }}
              >
                <Text
                  style={[
                    styles.prepareForConsult,
                    {
                      color: theme.colors.APP_YELLOW,
                    },
                  ]}
                >
                  {'VIEW DETAILS'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              activeOpacity={1}
              style={styles.bookAgainView}
              onPress={() => {
                setAppoinmentItem(item);
                item?.doctorInfo?.allowBookingRequest
                  ? props.navigation.navigate(AppRoutes.DoctorDetailsBookingOnRequest, {
                      doctorId: item?.doctorId || item?.doctorInfo?.id,
                      cleverTapAppointmentAttributes: {
                        source: 'Appointment CTA',
                        appointmentCTA: cancelConsulations ? 'Cancelled' : 'Past',
                      },
                    })
                  : props.navigation.navigate(AppRoutes.DoctorDetails, {
                      doctorId: item?.doctorId || item?.doctorInfo?.id,
                      cleverTapAppointmentAttributes: {
                        source: 'Appointment CTA',
                        appointmentCTA: cancelConsulations ? 'Cancelled' : 'Past',
                      },
                    });
                fireWebengageEvent(item, cancelConsulations ? 'cancel' : 'followup');
              }}
            >
              <Text style={styles.prepareForConsult}>
                {cancelConsulations ? 'BOOK AGAIN' : 'BOOK FOLLOW UP'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    };

    const fireWebengageEvent = (item: Appointment, eventType: string) => {
      const eventAttributesFollowUp:
        | WebEngageEvents[WebEngageEventName.BOOK_AGAIN_CANCELLED_APPOINTMENT]
        | WebEngageEvents[WebEngageEventName.PAST_APPOINTMENT_BOOK_FOLLOW_UP_CLICKED] = {
        'Customer ID': g(currentPatient, 'id'),
        patientName: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        patientUhid: g(currentPatient, 'uhid'),
        patientAge: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
        doctorId: g(item, 'doctorId') || undefined,
        doctorName: g(item, 'doctorInfo', 'displayName') || undefined,
        doctorCategory: g(item, 'doctorInfo', 'doctorType') || undefined,
        doctorCity: g(item, 'doctorInfo', 'city') || undefined,
        specialityId: g(item, 'doctorInfo', 'specialty', 'id') || undefined,
        specialityName: g(item, 'doctorInfo', 'specialty', 'name') || undefined,
        consultId: g(item, 'id') || undefined,
        consultDateTime: moment(g(item, 'appointmentDateTime')).toDate(),
        consultMode: g(item, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
        isConsultStarted: !!g(item, 'isConsultStarted'),
        Prescription: followUpMedicineNameText || undefined,
        Source:
          eventType === 'cancel'
            ? 'Cancelled appointment'
            : eventType === 'followup'
            ? 'Past appointment'
            : undefined,
        isConsulted: getUserType(allCurrentPatients),
      };

      postWebEngageEvent(
        eventType === 'cancel'
          ? WebEngageEventName.BOOK_AGAIN_CANCELLED_APPOINTMENT
          : eventType === 'followup'
          ? WebEngageEventName.PAST_APPOINTMENT_BOOK_FOLLOW_UP_CLICKED
          : WebEngageEventName.VIEW_DETAILS_PAST_APPOINTMENT,
        eventAttributesFollowUp
      );
      const cleverTapEventAttributesFollowUp: CleverTapEvents[CleverTapEventName.CONSULT_BOOK_CTA_CLICKED] = {
        'Customer ID': g(currentPatient, 'id'),
        patientName: `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        patientUhid: g(currentPatient, 'uhid'),
        patientAge: Math.round(moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)),
        doctorId: g(item, 'doctorId') || undefined,
        doctorName: g(item, 'doctorInfo', 'displayName') || undefined,
        doctorCategory: g(item, 'doctorInfo', 'doctorType') || undefined,
        doctorCity: g(item, 'doctorInfo', 'city') || undefined,
        specialityId: g(item, 'doctorInfo', 'specialty', 'id') || undefined,
        specialityName: g(item, 'doctorInfo', 'specialty', 'name') || undefined,
        consultId: g(item, 'id') || undefined,
        consultDateTime: moment(g(item, 'appointmentDateTime')).toDate(),
        consultMode: g(item, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'ONLINE' : 'PHYSICAL',
        isConsultStarted: !!g(item, 'isConsultStarted'),
        Prescription: followUpMedicineNameText || undefined,
        Source:
          eventType === 'cancel'
            ? 'Cancelled appointment'
            : eventType === 'followup'
            ? 'Past appointment'
            : undefined,
        isConsulted: getUserType(allCurrentPatients),
        patientGender: g(currentPatient, 'gender'),
      };
      postCleverTapEvent(
        eventType === 'cancel'
          ? CleverTapEventName.CONSULT_BOOK_CTA_CLICKED
          : eventType === 'followup'
          ? CleverTapEventName.CONSULT_BOOK_CTA_CLICKED
          : CleverTapEventName.CONSULT_VIEW_DETAILS_ON_PAST_APPOINTMENT,
        cleverTapEventAttributesFollowUp
      );
    };

    const renderTextConsultButton = () => {
      const onPressTextConsult = () => {
        postConsultCardEvents('Chat with Doctor', item);
        CommonLogEvent(AppRoutes.Consult, 'Prepare for Consult clicked');
        props.navigation.navigate(AppRoutes.ChatRoom, {
          data: item,
          callType: '',
          prescription: '',
          disableChat: item.doctorInfo && pastAppointmentItem,
        });
      };
      const isPrescAvailable = item.caseSheet?.some((item) => item?.sentToPatient);
      return (
        <View>
          {day1.diff(day2, 'days') > 0 ? (
            <View style={styles.textConsultSubtextView}>
              <Text style={styles.postConsultTextStyles1}>
                {'You can follow up with the doctor via text '}
              </Text>

              <Text style={styles.postConsultTextStyles2}>{numberDaysToConsultText}</Text>
            </View>
          ) : (
            <View style={{ height: 16 }} />
          )}
          <View
            style={{
              ...styles.horizontalContainer,
              justifyContent: isPrescAvailable ? 'space-between' : 'flex-end',
            }}
          >
            {isPrescAvailable && (
              <TouchableOpacity
                style={styles.prescriptionView}
                activeOpacity={1}
                onPress={() => onViewPrescriptionClick(item)}
              >
                <Text style={{ ...styles.prepareForConsult, color: theme.colors.APP_YELLOW }}>
                  {'VIEW PRESCRIPTION'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.textConsultView}
              activeOpacity={1}
              onPress={onPressTextConsult}
            >
              <Text style={{ ...styles.prepareForConsult, color: theme.colors.APP_YELLOW }}>
                {'TEXT CONSULT'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    };

    const renderCompletedConsultButtons = () => {
      return (
        <View style={styles.completedConsultViewStyle}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setAppoinmentItem(item);

              item?.doctorInfo?.allowBookingRequest
                ? props.navigation.navigate(AppRoutes.DoctorDetailsBookingOnRequest, {
                    doctorId: item?.doctorId || item?.doctorInfo?.id,
                    cleverTapAppointmentAttributes: {
                      source: 'Appointment CTA',
                      appointmentCTA: 'Active',
                    },
                  })
                : props.navigation.navigate(AppRoutes.DoctorDetails, {
                    doctorId: item?.doctorId || item?.doctorInfo?.id,
                    cleverTapAppointmentAttributes: {
                      source: 'Appointment CTA',
                      appointmentCTA: 'Active',
                    },
                  });
            }}
          >
            <Text
              style={[
                styles.prepareForConsult,
                {
                  paddingBottom: -16,
                },
              ]}
            >
              {'BOOK FOLLOW UP'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              CommonLogEvent(AppRoutes.Consult, 'Prepare for Consult clicked');
              props.navigation.navigate(AppRoutes.DoctorDetails, {
                doctorId: g(item, 'doctorId') || '',
                cleverTapAppointmentAttributes: {
                  source: 'Appointment CTA',
                  appointmentCTA: 'Active',
                },
              });
            }}
          >
            <Text
              style={[
                styles.prepareForConsult,
                {
                  paddingBottom: -16,
                },
              ]}
            >
              {'VIEW DETAILS'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };

    const renderActiveUpcomingConsultButton = () => {
      const onPressActiveUpcomingButtons = () => {
        postConsultCardEvents(
          item.isConsultStarted ? 'Continue Consult' : 'Fill Medical Details',
          item
        );
        CommonLogEvent(AppRoutes.Consult, 'Prepare for Consult clicked');
        if (item.doctorInfo && !pastAppointmentItem) {
          CommonLogEvent(AppRoutes.Consult, 'Chat Room Move clicked');
          props.navigation.navigate(AppRoutes.ChatRoom, {
            data: item,
            callType: '',
            prescription: '',
          });
        }
      };
      if (item.appointmentType === 'PHYSICAL') {
        return (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={{ flex: 1 }}
              onPress={() => {
                props.navigation.navigate(AppRoutes.AppointmentDetailsPhysical, {
                  data: item,
                  from: 'Consult',
                });
              }}
            >
              <Text style={styles.prepareForConsult}>VIEW DETAILS</Text>
            </TouchableOpacity>
          </View>
        );
      } else
        return (
          <View>
            <Text style={styles.fillVitalsForConsult}>{getConsultationSubTexts()}</Text>
            <View style={styles.consultStartedView}>
              <TouchableOpacity
                activeOpacity={1}
                style={styles.consultStartedBtn}
                onPress={onPressActiveUpcomingButtons}
              >
                <Text style={styles.prepareForConsult}>
                  {item?.isSeniorConsultStarted
                    ? string.common.consultRoom
                    : item?.isConsultStarted || item?.isAutomatedQuestionsComplete
                    ? string.common.continueConsult
                    : string.common.prepareForConsult}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    };

    const renderPickAnotherButton = () => {
      const onPressPickAnotherSlot = () => {
        CommonLogEvent(AppRoutes.Consult, 'Consult RESCHEDULE clicked');
        if (item.doctorInfo) {
          item.appointmentType === 'ONLINE'
            ? props.navigation.navigate(AppRoutes.AppointmentOnlineDetails, {
                data: item,
                from: 'notification',
              })
            : props.navigation.navigate(AppRoutes.AppointmentDetails, {
                data: item,
                from: 'notification',
              });
        }
      };
      return (
        <>
          <View style={styles.pickAnotherSlotViewStyle}>
            <Text style={{ ...theme.viewStyles.text('M', 12, '#890000', 1, 18, 0.04) }}>
              {string.common.pickAnotherSlotText}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.anotherSlotBtn}
            activeOpacity={1}
            onPress={onPressPickAnotherSlot}
          >
            <Text style={styles.prepareForConsult}>PICK ANOTHER SLOT</Text>
          </TouchableOpacity>
        </>
      );
    };

    const onPressDoctorCardClick = () => {
      postConsultCardEvents('Card Click', item);
      CommonLogEvent(AppRoutes.Consult, `Consult ${item.appointmentType} clicked`);
      if (item.doctorInfo && !pastAppointmentItem) {
        item.appointmentType === 'ONLINE'
          ? props.navigation.navigate(AppRoutes.AppointmentOnlineDetails, {
              data: item,
              from: 'Consult',
            })
          : item.appointmentType === 'PHYSICAL'
          ? props.navigation.navigate(AppRoutes.AppointmentDetailsPhysical, {
              data: item,
              from: 'Consult',
            })
          : props.navigation.navigate(AppRoutes.AppointmentDetails, {
              data: item,
              from: 'Consult',
            });
      }
    };

    return (
      <View>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.doctorView}
          onPress={onPressDoctorCardClick}
        >
          <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{
                  ...styles.statusText,
                  color:
                    getAppointmentStatusText() === 'Cancelled'
                      ? theme.colors.APP_RED
                      : theme.colors.APP_YELLOW,
                }}
              >
                {getAppointmentStatusText()?.toUpperCase()}
              </Text>
              {item.isFollowUp == 'true' ? (
                <CapsuleView
                  title={item.appointmentType}
                  style={styles.availableView}
                  isActive={isActive}
                />
              ) : (
                <CapsuleView title={title} style={styles.availableView} isActive={isActive} />
              )}
              <View
                style={{
                  height: 1,
                  width: '100%',
                  backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
                  position: 'absolute',
                  top: 26,
                }}
              />
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={styles.consultTextStyles}>
                  {item.appointmentType === 'ONLINE' ? 'Online Consultation' : doctorHospitalName}
                </Text>
                <Text style={styles.doctorNameStyles} numberOfLines={1}>
                  {item.doctorInfo ? `${item.doctorInfo.displayName}` : ''}
                </Text>
                {item.isFollowUp == 'true' ? (
                  <Text style={styles.followUpTextStyle}>
                    {moment(appointmentDateTime).format('DD MMM YYYY')}
                  </Text>
                ) : (
                  <Text style={styles.doctorSpecializationStyles}>
                    {item.doctorInfo && item.doctorInfo.specialty
                      ? item.doctorInfo.specialty.name
                      : ''}
                  </Text>
                )}
                <View style={styles.onlineIconView}></View>
              </View>
            </View>
            <View style={styles.separatorStyle} />
            <View style={styles.patientContainer}>
              <Text style={styles.patientNameHeading}>Patient Name</Text>
              <Text style={styles.patientNameStyle}>{item?.patientName}</Text>
            </View>
            {item?.isFollowUp === 'true' && followUpMedicineNameText ? (
              <View style={{ marginHorizontal: 16, marginTop: 6 }}>
                <Text style={{ ...theme.viewStyles.text('M', 12, '#02475B', 1, 20, 0.03) }}>
                  {'Previous Prescription'}
                </Text>
                <ListItem
                  title={followUpMedicineNameText}
                  titleProps={{ numberOfLines: 1 }}
                  titleStyle={styles.medicineNameTextStyle}
                  pad={0}
                  containerStyle={styles.medicineCardViewStyle}
                  leftAvatar={<PreviousPrescriptionIcon style={{ height: 24, width: 22.5 }} />}
                  rightAvatar={<WhiteArrowRightIcon style={{ height: 24, width: 24 }} />}
                />
              </View>
            ) : null}
            {item.status == STATUS.PENDING ||
            item.status == STATUS.IN_PROGRESS ||
            item.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
            item.status == STATUS.NO_SHOW ||
            item.status == STATUS.CALL_ABANDON ? (
              <View>
                {(item?.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE
                  && item?.status == STATUS.PENDING) ||
                item.status == STATUS.NO_SHOW ||
                item.status == STATUS.CALL_ABANDON
                  ? renderPickAnotherButton()
                  : pastAppointmentItem
                  ? renderPastConsultationButtons()
                  : renderActiveUpcomingConsultButton()}
              </View>
            ) : pastAppointmentItem ? (
              renderPastConsultationButtons()
            ) : item.appointmentType === 'ONLINE' ? (
              renderTextConsultButton()
            ) : (
              renderCompletedConsultButtons()
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (loading) {
      return <Spinner />;
    } else if (totalApptCount && allAppointments.length != totalApptCount) {
      return (
        <TouchableOpacity
          style={styles.prevApptView}
          onPress={() => {
            setLoading(true);
            fetchAppointments();
          }}
        >
          <Text style={styles.prevApptText}>Previous Appointments</Text>
          <DownArrow style={styles.downArrowIcon} />
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

  const renderHeader = () => {
    const { id, firstName, lastName } = selectedPatient || {};
    if (id) {
      return (
        <View style={styles.listHeader}>
          <TouchableOpacity onPress={() => selectPatient('ALL')} style={styles.patientNameView}>
            <Text style={styles.patientNameText}>{firstName + ' ' + lastName}</Text>
            <Close style={styles.crossIcon} />
          </TouchableOpacity>
        </View>
      );
    }
  };

  const renderConsultations = () => {
    return (
      <View>
        {pageLoading ? (
          renderAppointmentShimmer()
        ) : (
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{
              padding: 12,
              paddingTop: 0,
              marginTop: 14,
              paddingBottom: 120,
            }}
            data={allAppointments}
            bounces={false}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderNoAppointments()}
            ListHeaderComponent={renderHeader()}
            stickyHeaderIndices={selectedPatient?.id ? [0] : []}
            ListFooterComponent={renderFooter()}
            renderItem={({ item, index }) => renderConsultationCard(item, index)}
          />
        )}
      </View>
    );
  };

  const [scrollOffset, setScrollOffset] = useState<number>(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    if (!(offset > 1 && scrollOffset > 1)) {
      setScrollOffset(event.nativeEvent.contentOffset.y);
    }
  };

  const renderTopView = () => {
    const containerStyle: ViewStyle =
      scrollOffset > 1
        ? {
            shadowColor: '#808080',
            shadowOffset: { width: 0, height: 0 },
            zIndex: 1,
            shadowOpacity: 0.4,
            shadowRadius: 5,
            elevation: displayoverlay ? 0 : 15,
          }
        : {};
    return (
      <TabHeader
        containerStyle={containerStyle}
        navigation={props.navigation}
        screenAsSource={'Appointment Page'}
      />
    );
  };

  const renderNoAppointments = () => {
    if (!loading) {
      return (
        <View style={styles.noAppointmentViewStyle}>
          <View>
            <Text style={{ ...theme.viewStyles.text('M', 16, '#02475b', 1, 24, 0) }}>
              {string.home.book_appointment_question}
            </Text>
            <Button
              title={string.home.book_appointment}
              style={styles.buttonStyles}
              titleTextStyle={{ ...theme.viewStyles.text('B', 13, '#ffffff', 1, 24, 0) }}
              onPress={() => {
                props.navigation.navigate(AppRoutes.DoctorSearch);
              }}
            />
          </View>
          <DoctorIcon />
        </View>
      );
    }
  };

  const renderPatientHeader = () => {
    return (
      <View style={styles.patientHeaderView}>
        <Text style={styles.allApptText}>All Appointments</Text>
        <TouchableOpacity onPress={() => setShowFilter(true)}>
          <Text style={styles.selectPatientText}>Select Patient</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAppointmentFilterScreen = () => {
    return (
      showFilter && (
        <AppointmentFilterScene
          selectPatient={selectPatient}
          selectedPatient={selectedPatient}
          dismissModal={() => setShowFilter(false)}
          navigation={props.navigation}
        />
      )
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <NavigationEvents
        onDidFocus={(payload) => {
          if (callFetchAppointmentApi) {
            setOverlayLoading(true);
            fetchAppointments(true);
          }
        }}
        onDidBlur={(payload) => {
          setCallFetchAppointmentApi(true);
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
        {renderTopView()}
        {renderPatientHeader()}
        {renderConsultOverlay()}
        {renderConsultations()}
      </SafeAreaView>
      {showSchdulesView && (
        <BottomPopUp
          title={`Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`}
          description={`Your appointment with ${props.navigation.getParam(
            'DoctorName'
          )} \nhas been rescheduled for — ${newAppointmentTime}\n\n${
            newRescheduleCount == 0
              ? 'You have reached the maximum number of reschedules for this appointment.'
              : `You have ${newRescheduleCount} free ${
                  newRescheduleCount == 1 ? 'reschedule' : 'reschedules'
                } left.`
          }
          `}
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={styles.gotItStyles}
              onPress={() => {
                CommonLogEvent(AppRoutes.Consult, 'Consult Bootom PopUp clicked');
                AsyncStorage.setItem('showSchduledPopup', 'false');
                setShowSchdulesView(false);
              }}
            >
              <Text style={styles.gotItTextStyles}>{string.home.welcome_popup.cta_label}</Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {transferfollowup && (
        <BottomPopUp
          title={`Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`}
          description={`Your appointment with ${props.navigation.getParam('TransferData') &&
            props.navigation.getParam('TransferData').doctorName} has been transferred to —`}
        >
          <View
            style={{
              backgroundColor: '#f7f8f5',
              marginLeft: 20,
              marginRight: 20,
              marginTop: 20,
              height: 188,
              borderRadius: 10,
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={{ marginLeft: 20, marginTop: 20, marginRight: 20 }}>
                <Mascot />
              </View>
              <View style={{ flexDirection: 'column', marginTop: 20, marginBottom: 5 }}>
                <Text style={{ color: '#02475b', ...theme.fonts.IBMPlexSansMedium(18) }}>
                  {props.navigation.getParam('TransferData') &&
                    props.navigation.getParam('TransferData').doctorName}
                </Text>
                <Text
                  style={{
                    color: '#0087ba',
                    ...theme.fonts.IBMPlexSansSemiBold(12),
                    marginBottom: 12,
                    marginRight: 5,
                  }}
                >
                  {props.navigation.getParam('TransferData') &&
                    props.navigation.getParam('TransferData').specilty}{' '}
                  {props.navigation.getParam('TransferData') &&
                    props.navigation.getParam('TransferData').experience}{' '}
                  YR{Number(props.navigation.getParam('TransferData').experience) != 1 ? 'S' : ''}
                </Text>
              </View>
            </View>
            <View
              style={{
                height: 2,
                backgroundColor: '#02475b',
                marginTop: -15,
                marginHorizontal: 5,
                opacity: 0.1,
                marginLeft: 105,
              }}
            ></View>
            <View style={{ marginTop: 12, marginLeft: 100 }}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(14),
                  color: '#02475b',
                  lineHeight: 20,
                  marginLeft: 5,
                }}
              >
                {moment(props.navigation.getParam('TranferDateTime')).format('DD MMM YYYY')}
              </Text>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(14),
                  color: '#02475b',
                  lineHeight: 20,
                  marginLeft: 5,
                }}
              >
                {moment(props.navigation.getParam('TranferDateTime')).format('hh:mm A')}
              </Text>
            </View>
            <View style={{ height: 60, alignItems: 'flex-end' }}>
              <TouchableOpacity
                style={styles.gotItStyles}
                onPress={() => {
                  setTransferfollowup(false);
                  AsyncStorage.setItem('showTransferPopup', 'false');
                }}
              >
                <Text style={styles.gotItTextStyles}>{string.home.welcome_popup.cta_label}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomPopUp>
      )}
      {followupdone && (
        <BottomPopUp
          title={`Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`}
          description={`Your appointment with ${props.navigation.getParam('FollowupData') &&
            props.navigation.getParam('FollowupData').firstName} has been followup to —`}
        >
          <View
            style={{
              backgroundColor: '#f7f8f5',
              marginLeft: 20,
              marginRight: 20,
              marginTop: 20,
              height: 188,
              borderRadius: 10,
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={{ marginLeft: 20, marginTop: 20, marginRight: 20 }}>
                <Mascot />
              </View>
              <View style={{ flexDirection: 'column', marginTop: 20, marginBottom: 5 }}>
                <Text style={{ color: '#02475b', ...theme.fonts.IBMPlexSansMedium(18) }}>
                  {props.navigation.getParam('FollowupData') &&
                    props.navigation.getParam('FollowupData').firstName}
                </Text>
                <Text
                  style={{
                    color: '#0087ba',
                    ...theme.fonts.IBMPlexSansSemiBold(12),
                    marginBottom: 12,
                  }}
                >
                  {props.navigation.getParam('FollowupData') &&
                    props.navigation.getParam('FollowupData').specialty &&
                    props.navigation.getParam('FollowupData').specialty.name}
                  {props.navigation.getParam('FollowupData') &&
                    props.navigation.getParam('FollowupData').experience}{' '}
                  YR
                  {Number(props.navigation.getParam('FollowupData').experience) > 1 ? 'S' : ''}
                </Text>
              </View>
            </View>
            <View
              style={{
                height: 2,
                backgroundColor: '#02475b',
                marginTop: -15,
                marginHorizontal: 5,
                opacity: 0.1,
                marginLeft: 105,
              }}
            ></View>
            <View style={{ marginTop: 12, marginLeft: 100 }}>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(14),
                  color: '#02475b',
                  lineHeight: 20,
                  marginLeft: 5,
                }}
              >
                {moment(props.navigation.getParam('FollowupDateTime')).format('DD MMM YYYY')}
              </Text>
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansMedium(14),
                  color: '#02475b',
                  lineHeight: 20,
                  marginLeft: 5,
                }}
              >
                {moment(props.navigation.getParam('FollowupDateTime')).format('hh:mm A')}
              </Text>
            </View>
            <View style={{ height: 60, alignItems: 'flex-end' }}>
              <TouchableOpacity
                style={styles.gotItStyles}
                onPress={() => {
                  setFollowupDone(false);
                  AsyncStorage.setItem('showFollowUpPopup', 'false');
                }}
              >
                <Text style={styles.gotItTextStyles}>{string.home.welcome_popup.cta_label}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomPopUp>
      )}
      {renderAppointmentFilterScreen()}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
      <NotificationListener navigation={props.navigation} />
      {overlayLoading ? <Spinner /> : null}
    </View>
  );
};
