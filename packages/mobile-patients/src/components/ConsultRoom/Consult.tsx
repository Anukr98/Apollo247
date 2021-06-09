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
} from '@aph/mobile-patients/src/components/ui/Icons';
import { AppointmentFilterScene } from '@aph/mobile-patients/src/components/ConsultRoom/AppointmentFilterScene';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import {
  CommonBugFender,
  CommonLogEvent,
  isIphone5s,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { getPatientAllAppointments_getPatientAllAppointments_activeAppointments_caseSheet_medicinePrescription } from '@aph/mobile-patients/src/graphql/types/getPatientAllAppointments';
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
import {
  getPatientAllAppointments,
  getPatientAllAppointmentsVariables,
  getPatientAllAppointments_getPatientAllAppointments_activeAppointments,
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
import { CleverTapEventName } from '@aph/mobile-patients/src/helpers/CleverTapEvents';
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
    paddingTop: 40,
    paddingLeft: 0,
    textTransform: 'capitalize',
    ...theme.fonts.IBMPlexSansMedium(18),
    color: theme.colors.SEARCH_DOCTOR_NAME,
  },
  doctorSpecializationStyles: {
    paddingTop: 4,
    paddingBottom: 11.5,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
  },
  consultTextStyles: {
    paddingVertical: 11.5,
    paddingLeft: 0,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
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
    ...theme.viewStyles.yellowTextStyle,
    ...theme.fonts.IBMPlexSansBold(13),
    textAlign: 'right',
    paddingHorizontal: 15,
    paddingTop: 11,
    paddingBottom: 16,
  },
  fillVitalsForConsult: {
    ...theme.fonts.IBMPlexSansMedium(12),
    textAlign: 'right',
    lineHeight: 15.6,
    opacity: 0.6,
    color: '#02475B',
    letterSpacing: 0.04,
    paddingHorizontal: 15,
    paddingTop: 1,
    paddingBottom: 16,
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
    marginTop: 14,
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
    alignSelf: 'flex-end',
    paddingBottom: -16,
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

export type Appointment = getPatientAllAppointments_getPatientAllAppointments_activeAppointments;

export const Consult: React.FC<ConsultProps> = (props) => {
  const tabs = [{ title: 'Active' }, { title: 'Completed' }, { title: 'Cancelled' }];
  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const movedFrom = props.navigation.getParam('movedFrom');

  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [activeFollowUpAppointments, setActiveFollowUpAppointments] = useState<
    {
      type: string;
      data: Appointment[];
    }[]
  >([]);
  const [activeAppointments, setActiveAppointments] = useState<Appointment[]>([]);
  const [followUpAppointments, setFollowUpAppointments] = useState<Appointment[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [cancelledAppointments, setCancelledAppointments] = useState<Appointment[]>([]);

  const initialAppointmentFilterObject: AppointmentFilterObject = {
    appointmentStatus: [],
    availability: [],
    doctorsList: [],
    specialtyList: [],
  };
  const [filterDoctorsList, setFilterDoctorsList] = useState<string[]>([]);
  const [filterSpecialtyList, setFilterSpecialtyList] = useState<string[]>([]);
  const [filter, setFilter] = useState<AppointmentFilterObject>(initialAppointmentFilterObject);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filteredAppointmentsList, setFilteredAppointmentsList] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { showAphAlert, hideAphAlert } = useUIElements();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [appointmentItem, setAppoinmentItem] = useState<Appointment | null>();
  const [showSchdulesView, setShowSchdulesView] = useState<boolean>(false);
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>('');
  const [newRescheduleCount, setNewRescheduleCount] = useState<number>(0);
  const [callFetchAppointmentApi, setCallFetchAppointmentApi] = useState(true);

  const [transferfollowup, setTransferfollowup] = useState<boolean>(false);
  const [followupdone, setFollowupDone] = useState<boolean>(false);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>();

  const { currentPatient } = useAllCurrentPatients();

  const client = useApolloClient();

  useEffect(() => {
    if (currentPatient && profile) {
      if (currentPatient.id != profile.id) {
        setPageLoading(true);
        fetchAppointments();
      }
    }
    currentPatient && setProfile(currentPatient!);
  }, [currentPatient, props.navigation.state.params]);

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

  useEffect(() => {
    const { availability, appointmentStatus, doctorsList, specialtyList } = filter;
    if (
      filter.appointmentStatus === [] &&
      filter.availability === [] &&
      filter.doctorsList === [] &&
      filter.specialtyList === []
    ) {
      setFilteredAppointmentsList(allAppointments || []);
    } else {
      let localFilteredList: Appointment[] = allAppointments || [];
      if (appointmentStatus && appointmentStatus?.length > 0) {
        localFilteredList = getAppointmentStatusFilteredList(appointmentStatus, localFilteredList);
      }
      if (availability && availability?.length > 0) {
        localFilteredList = getAvailabilityFilteredList(availability, localFilteredList);
      }
      if (doctorsList && doctorsList?.length > 0) {
        localFilteredList = getGenericFilteredList(doctorsList, localFilteredList, 'doctor');
      }
      if (specialtyList && specialtyList?.length > 0) {
        localFilteredList = getGenericFilteredList(specialtyList, localFilteredList, 'specialty');
      }
      setFilteredAppointmentsList(localFilteredList);
    }
  }, [filter]);

  const getAppointmentStatusFilteredList = (
    appointmentStatus: string[],
    localFilteredAppointmentsList: Appointment[]
  ) => {
    let finalList: Appointment[] = [];
    if (appointmentStatus.includes('Active')) {
      finalList = [...activeAppointments, ...followUpAppointments];
    }
    if (appointmentStatus.includes('Rescheduled')) {
      const filteredList = localFilteredAppointmentsList.filter(
        (appointment) => appointment.appointmentState === APPOINTMENT_STATE.RESCHEDULE
      );
      finalList = [...finalList, ...filteredList];
    }
    if (appointmentStatus.includes('Cancelled')) {
      const filteredList = localFilteredAppointmentsList.filter(
        (appointment) => appointment.status === STATUS.CANCELLED
      );
      finalList = [...finalList, ...filteredList];
    }
    if (appointmentStatus.includes('Completed')) {
      const filteredList = localFilteredAppointmentsList.filter(
        (appointment) => appointment.status === STATUS.COMPLETED
      );
      finalList = [...finalList, ...filteredList];
    }
    if (appointmentStatus.includes('Follow-Up')) {
      const filteredList = localFilteredAppointmentsList.filter(
        (appointment) =>
          appointment.status === STATUS.COMPLETED &&
          !isPastAppointment(appointment.caseSheet, appointment)
      );
      finalList = [...finalList, ...filteredList];
    }
    return _.uniq(finalList);
  };

  const getGenericFilteredList = (
    list: string[],
    localFilteredAppointmentsList: Appointment[],
    type: string
  ) => {
    const finalList = localFilteredAppointmentsList.filter((appointment) => {
      switch (type) {
        case 'doctor':
          return list.includes(appointment?.doctorInfo?.fullName || '');
        case 'specialty':
          return list.includes(appointment?.doctorInfo?.specialty?.name || '');
        default:
          return false;
      }
    });
    return finalList;
  };

  const getAvailabilityFilteredList = (
    availabilityList: string[],
    localFilteredAppointmentsList: Appointment[]
  ) => {
    let finalList: Appointment[] = [];
    if (availabilityList.includes('Now')) {
      finalList = localFilteredAppointmentsList.filter((appointment) => {
        const diffInMinutes = getDiffInMinutes(appointment.appointmentDateTime);
        return diffInMinutes < 15 && diffInMinutes >= 0;
      });
    }
    if (
      availabilityList.includes('Today') ||
      availabilityList.includes('Tomorrow') ||
      availabilityList.includes('Next 3 days')
    ) {
      const tomorrowAvailabilityHourTime = moment('00:00', 'HH:mm');
      const tomorrowAvailabilityTime = moment()
        .add('days', 1)
        .set({
          hour: tomorrowAvailabilityHourTime.get('hour'),
          minute: tomorrowAvailabilityHourTime.get('minute'),
        });
      if (availabilityList.includes('Today')) {
        const filteredList = localFilteredAppointmentsList.filter((appointment) => {
          const diffInHoursForTomorrowAvailabilty = tomorrowAvailabilityTime.diff(
            moment(appointment.appointmentDateTime),
            'minutes'
          );
          return diffInHoursForTomorrowAvailabilty >= 0 && diffInHoursForTomorrowAvailabilty < 1440;
        });
        finalList = [...finalList, ...filteredList];
      }
      if (availabilityList.includes('Tomorrow')) {
        const filteredList = localFilteredAppointmentsList.filter((appointment) => {
          const diffInHoursForTomorrowAvailabilty = moment(appointment.appointmentDateTime).diff(
            tomorrowAvailabilityTime,
            'minutes'
          );
          return diffInHoursForTomorrowAvailabilty >= 0 && diffInHoursForTomorrowAvailabilty < 1440;
        });
        finalList = [...finalList, ...filteredList];
      }
      if (availabilityList.includes('Next 3 days')) {
        const filteredList = localFilteredAppointmentsList.filter((appointment) => {
          const differenceInDays = moment(appointment.appointmentDateTime).diff(
            tomorrowAvailabilityTime,
            'days'
          );
          const differenceInMinutes = moment(appointment.appointmentDateTime).diff(
            tomorrowAvailabilityTime,
            'minutes'
          );
          return differenceInMinutes >= 0 && differenceInDays < 4 && differenceInDays >= 0;
        });
        finalList = [...finalList, ...filteredList];
      }
    } else if (selectedDate) {
      const filteredList = localFilteredAppointmentsList.filter((appointment) => {
        return moment(appointment.appointmentDateTime).date() === moment(selectedDate).date();
      });
      finalList = [...finalList, ...filteredList];
    }
    return _.uniq(finalList);
  };

  const postConsultCardEvents = (
    type: 'Card Click' | 'Continue Consult' | 'Chat with Doctor' | 'Fill Medical Details',
    data: Appointment
  ) => {
    const eventAttributes:
      | WebEngageEvents[WebEngageEventName.CONSULT_CARD_CLICKED]
      | WebEngageEvents[WebEngageEventName.CONTINUE_CONSULT_CLICKED]
      | WebEngageEvents[WebEngageEventName.FILL_MEDICAL_DETAILS] = {
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
    };
    postWebEngageEvent(
      type == 'Card Click'
        ? WebEngageEventName.CONSULT_CARD_CLICKED
        : type == 'Continue Consult'
        ? WebEngageEventName.CONTINUE_CONSULT_CLICKED
        : WebEngageEventName.FILL_MEDICAL_DETAILS,
      eventAttributes
    );
    postCleverTapEvent(
      type == 'Card Click'
        ? CleverTapEventName.CONSULT_CARD_CLICKED
        : type == 'Continue Consult'
        ? CleverTapEventName.CONTINUE_CONSULT_CLICKED
        : CleverTapEventName.FILL_MEDICAL_DETAILS,
      eventAttributes
    );
  };

  const fetchAppointments = async () => {
    try {
      let userId = await AsyncStorage.getItem('selectedProfileId');
      userId = JSON.parse(userId || 'null');

      const { data } = await client.query<
        getPatientAllAppointments,
        getPatientAllAppointmentsVariables
      >({
        query: GET_PATIENT_ALL_APPOINTMENTS,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: userId !== currentPatient?.id ? currentPatient?.id || userId : userId,
        },
      });
      const appointments = data?.getPatientAllAppointments;

      let isOnlineFutureOnly: any = [];
      isOnlineFutureOnly = appointments?.activeAppointments?.filter(
        (it) =>
          moment(it?.appointmentDateTime).isAfter(moment(new Date())) &&
          it?.appointmentType == 'ONLINE'
      ).length;

      const activeFollowUpAppointments = appointments?.activeAppointments?.length
        ? [{ type: 'Active', data: appointments?.activeAppointments! || [] }]
        : [];
      const activeAppointments = appointments?.activeAppointments! || [];
      const followUpAppointments = appointments?.followUpAppointments! || [];
      const completedAppointments = [
        ...followUpAppointments,
        ...(appointments?.completedAppointments! || []),
      ];
      const cancelledAppointments = appointments?.cancelledAppointments! || [];
      const allAppointments = [
        ...activeAppointments,
        ...followUpAppointments,
        ...completedAppointments,
        ...cancelledAppointments,
      ];
      const doctorsList = allAppointments.map((item) => item?.doctorInfo?.fullName!);
      const specialtyList = allAppointments.map((item) => item?.doctorInfo?.specialty?.name!);
      setActiveFollowUpAppointments(activeFollowUpAppointments);
      setActiveAppointments(activeAppointments);
      setFollowUpAppointments(followUpAppointments);
      setCancelledAppointments(cancelledAppointments);
      setCompletedAppointments(completedAppointments);
      setFilterDoctorsList(_.uniq(doctorsList));
      setFilterSpecialtyList(_.uniq(specialtyList));
      setFilter(initialAppointmentFilterObject);
      setFilteredAppointmentsList(allAppointments);
      setAllAppointments(allAppointments);
      setLoading(false);
      setPageLoading(false);

      if (isOnlineFutureOnly > 0) {
        if (Platform.OS === 'ios') {
          callPermissions();
        } else {
          callPermissions(() => {
            overlyCallPermissions(
              currentPatient!.firstName!,
              activeAppointments[0]?.doctorInfo?.displayName || '',
              showAphAlert,
              hideAphAlert,
              true
            );
          });
        }
      }
    } catch (error) {
      setPageLoading(false);
    }
  };

  const { availability, appointmentStatus, doctorsList, specialtyList } = filter;

  const filterLength =
    (availability ? availability.length : 0) +
    (appointmentStatus ? appointmentStatus.length : 0) +
    (doctorsList ? doctorsList.length : 0) +
    (specialtyList ? specialtyList.length : 0);

  useEffect(() => {
    filterLength === 0 && setSelectedDate(null);
  }, [filterLength]);

  const renderSectionHeader = (section: SectionListData<Appointment>) => {
    return section?.data?.length ? (
      <Text
        style={[
          styles.sectionHeaderTitleStyle,
          section.type === 'Follow-up Chat' && { marginTop: 10 },
        ]}
      >
        {section.type}
      </Text>
    ) : null;
  };

  const renderTodaysConsultations = () => {
    return (
      <View>
        {pageLoading ? (
          renderAppointmentShimmer()
        ) : (
          <SectionList
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ padding: 12, paddingTop: 0, marginTop: 0 }}
            bounces={false}
            sections={selectedTab === tabs[0].title ? activeFollowUpAppointments : []}
            ListEmptyComponent={renderNoAppointments()}
            renderSectionHeader={({ section }) => renderSectionHeader(section)}
            renderItem={({ item, index }) => renderConsultationCard(item, index)}
          />
        )}
      </View>
    );
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

  const renderConsultationCard = (item: Appointment, index: number) => {
    let tomorrowDate = moment(new Date())
      .add(1, 'days')
      .format('DD MMM');

    const getConsultationSubTexts = () => {
      return !item?.isConsultStarted
        ? string.common.fillVitalsText
        : !item?.isJdQuestionsComplete
        ? string.common.gotoConsultRoomJuniorDrText
        : string.common.gotoConsultRoomText || '';
    };

    const getAppointmentStatusText = () => {
      if (item?.status === STATUS.CANCELLED) {
        return 'Cancelled';
      } else if (item?.status === STATUS.COMPLETED) {
        return 'Completed';
      } else if (item?.appointmentState === APPOINTMENT_STATE.RESCHEDULE) {
        return 'Rescheduled';
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
      minutes > 0 && minutes <= 15
        ? `${Math.ceil(minutes)} MIN${Math.ceil(minutes) > 1 ? 'S' : ''}`
        : tomorrowDate == appointmentDateTomarrow
        ? 'TOMORROW, ' + moment(appointmentDateTime).format('h:mm A')
        : moment(appointmentDateTime).format(
            appointmentDateTime.split(' ')[0] === new Date().toISOString().split('T')[0]
              ? 'h:mm A'
              : 'DD MMM, h:mm A'
          );
    const isActive = minutes > 0 && minutes <= 15 ? true : false;
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
        ? completedAppointments[index - 1]
        : selectedTab !== tabs[0].title
        ? cancelledAppointments[index - 1]
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
            });
      };
      const cancelConsulations = getAppointmentStatusText() === 'Cancelled';
      return (
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 16,
            flex: 1,
            justifyContent: cancelConsulations ? 'flex-end' : 'space-between',
          }}
        >
          {cancelConsulations ? null : (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                onPressPastAppointmentViewDetails();
                fireWebengageEvent(item, 'details');
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
          )}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setAppoinmentItem(item);
              props.navigation.navigate(AppRoutes.DoctorDetails, {
                doctorId: item?.doctorId || item?.doctorInfo?.id,
              });
              fireWebengageEvent(item, cancelConsulations ? 'cancel' : 'followup');
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
              {cancelConsulations ? 'BOOK AGAIN' : 'BOOK FOLLOW UP'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };

    const fireWebengageEvent = (item: Appointment, eventType: string) => {
      const eventAttributesFollowUp:
        | WebEngageEvents[WebEngageEventName.BOOK_AGAIN_CANCELLED_APPOINTMENT]
        | WebEngageEvents[WebEngageEventName.PAST_APPOINTMENT_BOOK_FOLLOW_UP_CLICKED] = {
        'Customer ID': g(currentPatient, 'id'),
        'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        'Patient UHID': g(currentPatient, 'uhid'),
        'Patient Age': Math.round(
          moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
        ),
        'Doctor ID': g(item, 'doctorId') || '',
        'Doctor Name': g(item, 'doctorInfo', 'fullName') || '',
        'Doctor Category': g(item, 'doctorInfo', 'doctorType'),
        'Doctor City': g(item, 'doctorInfo', 'city') || '',
        'Speciality ID': g(item, 'doctorInfo', 'specialty', 'id') || '',
        'Speciality Name': g(item, 'doctorInfo', 'specialty', 'name') || '',
        'Consult ID': g(item, 'id') || '',
        'Consult Date Time': moment(g(item, 'appointmentDateTime')).toDate(),
        'Consult Mode':
          g(item, 'appointmentType') == APPOINTMENT_TYPE.ONLINE ? 'Online' : 'Physical',
        isConsultStarted: !!g(item, 'isConsultStarted'),
        Prescription: followUpMedicineNameText || '',
      };

      postWebEngageEvent(
        eventType === 'cancel'
          ? WebEngageEventName.BOOK_AGAIN_CANCELLED_APPOINTMENT
          : eventType === 'followup'
          ? WebEngageEventName.PAST_APPOINTMENT_BOOK_FOLLOW_UP_CLICKED
          : WebEngageEventName.VIEW_DETAILS_PAST_APPOINTMENT,
        eventAttributesFollowUp
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
      return (
        <View>
          <TouchableOpacity activeOpacity={1} onPress={onPressTextConsult}>
            <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
              <ChatBlueIcon style={{ width: 20, height: 20, marginTop: 12 }} />
              <Text
                style={[
                  styles.prepareForConsult,
                  {
                    paddingBottom: -16,
                    paddingLeft: 8,
                  },
                ]}
              >
                {'TEXT CONSULT'}
              </Text>
            </View>
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
          </TouchableOpacity>
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
              props.navigation.navigate(AppRoutes.DoctorDetails, {
                doctorId: item?.doctorId || item?.doctorInfo?.id,
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
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              activeOpacity={1}
              style={{ flex: 1 }}
              onPress={onPressActiveUpcomingButtons}
            >
              <Text
                style={[
                  styles.prepareForConsult,
                  {
                    opacity: 1,
                    paddingBottom: 0,
                  },
                ]}
              >
                {item.isConsultStarted
                  ? string.common.continueConsult
                  : string.common.prepareForConsult}
              </Text>
              <Text style={styles.fillVitalsForConsult}>{getConsultationSubTexts()}</Text>
            </TouchableOpacity>
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
          <TouchableOpacity activeOpacity={1} onPress={onPressPickAnotherSlot}>
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

    const renderDoctorImage = () => {
      return (
        <View style={styles.imageView}>
          {!!g(item, 'doctorInfo', 'thumbnailUrl') ? (
            <Image
              style={styles.doctorImageStyle}
              source={{ uri: item.doctorInfo!.thumbnailUrl! }}
              resizeMode={'contain'}
            />
          ) : (
            <DoctorPlaceholderImage
              style={styles.doctorImagePlaceholderStyle}
              resizeMode={'contain'}
            />
          )}
        </View>
      );
    };

    return (
      <View style={{}}>
        {filterLength === 0 && showDateText && selectedTab !== tabs[0].title ? (
          <Text style={[styles.sectionHeaderTitleStyle, { marginTop: 10 }]}>
            {appointmentDateText}
          </Text>
        ) : null}
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.doctorView]}
          onPress={onPressDoctorCardClick}
        >
          <View style={{ overflow: 'hidden', borderRadius: 10, flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{
                  position: 'absolute',
                  left: 18,
                  top: 6,
                  ...theme.viewStyles.text(
                    'M',
                    10,
                    getAppointmentStatusText() === 'Cancelled' ? '#DB0404' : '#0087BA',
                    1,
                    13
                  ),
                }}
              >
                {getAppointmentStatusText()}
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
              {renderDoctorImage()}
              <View style={{ flex: 1, marginRight: 16 }}>
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
                      ? item.doctorInfo.specialty.name.toUpperCase()
                      : ''}
                    {item.doctorInfo
                      ? ` | ${item.doctorInfo.experience} YR${
                          Number(item.doctorInfo.experience) > 1 ? 'S' : ''
                        }`
                      : ''}
                  </Text>
                )}
                <View style={styles.separatorStyle} />
                <View style={styles.onlineIconView}>
                  <Text style={styles.consultTextStyles}>
                    {item.appointmentType === 'ONLINE' ? 'Online Consultation' : doctorHospitalName}
                  </Text>
                  {item.appointmentType === 'ONLINE' ? (
                    <CTLightGrayVideo style={{ marginTop: 13, height: 19, width: 19 }} />
                  ) : (
                    <PhysicalConsultDarkBlueIcon
                      style={{ marginTop: 13, height: 14.4, width: 12 }}
                    />
                  )}
                </View>
              </View>
            </View>
            <View style={[styles.separatorStyle, { marginHorizontal: 16 }]} />
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
                {item.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
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

  const renderConsultations = () => {
    return (
      <View>
        {pageLoading ? (
          renderAppointmentShimmer()
        ) : (
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ padding: 12, paddingTop: 0, marginTop: 14 }}
            data={selectedTab === tabs[1].title ? completedAppointments : cancelledAppointments}
            bounces={false}
            removeClippedSubviews={true}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={renderNoAppointments()}
            renderItem={({ item, index }) => renderConsultationCard(item, index)}
          />
        )}
      </View>
    );
  };

  const renderFilterConsultations = () => {
    return (
      <View style={{ flexDirection: 'column' }}>
        {pageLoading ? (
          renderAppointmentShimmer()
        ) : (
          <FlatList
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ padding: 12, paddingTop: 0, marginTop: 14 }}
            data={filteredAppointmentsList}
            bounces={false}
            removeClippedSubviews={true}
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={renderNoAppointments()}
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
    return <TabHeader containerStyle={containerStyle} navigation={props.navigation} />;
  };

  const renderProfileImage = () => {
    const photoUrl = currentPatient?.photoUrl || '';
    return photoUrl?.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG|jpeg|JPEG)/) ? (
      <Image
        style={styles.profileImageStyle}
        source={{
          uri: photoUrl,
        }}
      />
    ) : (
      <EditProfilePlaceHolder style={[styles.profileImageStyle, { borderRadius: 0 }]} />
    );
  };

  const renderProfileChangeView = () => {
    return (
      <View style={{ backgroundColor: theme.colors.WHITE, paddingLeft: 20, elevation: 15 }}>
        <View style={styles.profileChangeViewStyle}>
          {renderProfileImage()}
          {renderCurrentPatientName()}
        </View>
        {renderSearchFilterView()}
      </View>
    );
  };

  const renderCurrentPatientName = () => {
    return (
      <>
        <Text style={styles.hiTextStyle}>{'hi'}</Text>
        <View style={styles.nameTextContainerStyle}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={styles.nameTextStyle} numberOfLines={1}>
              {(currentPatient && currentPatient!.firstName!.toLowerCase() + '!') || ''}
            </Text>
            {currentPatient && g(currentPatient, 'isUhidPrimary') ? (
              <LinkedUhidIcon style={styles.linkUhidIconStyle} resizeMode={'contain'} />
            ) : null}
          </View>
        </View>
      </>
    );
  };

  const searchAppointmentBackPressed = () => {
    setCallFetchAppointmentApi(false);
  };

  const renderSearchFilterView = () => {
    const numberOfAppoinmentText =
      filterLength > 0
        ? 'You have ' + (filteredAppointmentsList.length || 'no') + ' appointment(s)!'
        : selectedTab === tabs[0].title
        ? 'You have ' + (activeAppointments.length || 'no') + ' active appointment(s)!'
        : selectedTab === tabs[1].title
        ? 'You have ' + (completedAppointments.length || 'no') + ' completed appointment(s)!'
        : 'You have ' + (cancelledAppointments.length || 'no') + ' cancelled appointment(s)!';
    return (
      <View style={{ flexDirection: 'row', flex: 1, marginRight: 20 }}>
        <Text style={styles.descriptionTextStyle}>{numberOfAppoinmentText}</Text>
        <View style={styles.searchFilterViewStyle}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              props.navigation.navigate(AppRoutes.SearchAppointmentScreen, {
                allAppointments: allAppointments,
                onPressBack: searchAppointmentBackPressed,
              })
            }
          >
            <SearchGreenIcon style={{ width: 23, height: 23, marginTop: 8 }} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1} onPress={() => setIsFilterOpen(true)}>
            {filterLength > 0 ? (
              <>
                <FilterGreenIcon style={styles.filterIcon} />
                <View style={[styles.badgelabelView]}>
                  <Text style={styles.badgelabelText}>{filterLength}</Text>
                </View>
              </>
            ) : (
              <FilterDarkBlueIcon style={styles.filterIcon} />
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  const renderTabSwitch = () => {
    return (
      <TabsComponent
        height={43}
        titleStyle={{ fontSize: 14 }}
        selectedTitleStyle={{ fontSize: 14 }}
        style={{
          borderRadius: 0,
          backgroundColor: colors.DEFAULT_BACKGROUND_COLOR,
          shadowColor: colors.SHADOW_GRAY,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 14,
        }}
        tabViewStyle={{
          backgroundColor: colors.CARD_BG,
        }}
        data={tabs}
        onChange={(selectedTab: string) => {
          setselectedTab(selectedTab);
        }}
        selectedTab={selectedTab}
      />
    );
  };

  const renderSelectedFilterItems = (filterText: string, id: number) => {
    const onSelectedFilterClose = () => {
      switch (id) {
        case 0:
          const appointmentStatus =
            filter && filter?.appointmentStatus
              ? filter?.appointmentStatus?.filter((val) => val !== filterText)
              : null;
          setFilter({ ...filter, appointmentStatus });
          break;
        case 1:
          const availability =
            filter && filter?.availability
              ? filter?.availability?.filter((val) => val !== filterText)
              : null;
          if (selectedDate) {
            !availability?.includes(moment(selectedDate).format('DD/MM/YYYY')) &&
              setSelectedDate(null);
          }
          setFilter({ ...filter, availability });
          break;
        case 2:
          const doctorsList =
            filter && filter?.doctorsList
              ? filter?.doctorsList?.filter((val) => val !== filterText)
              : null;
          setFilter({ ...filter, doctorsList });
          break;
        case 3:
          const specialtyList =
            filter && filter?.specialtyList
              ? filter?.specialtyList?.filter((val) => val !== filterText)
              : null;
          setFilter({ ...filter, specialtyList });
          break;
        default:
          break;
      }
    };
    return (
      <View style={styles.filterButtonViewStyle}>
        <Text style={styles.filterTextStyle}>{filterText}</Text>
        <Text style={styles.xTextStyle} onPress={onSelectedFilterClose}>
          {'X'}
        </Text>
      </View>
    );
  };

  const renderAppointmentFilterScreen = () => {
    return isFilterOpen ? (
      <AppointmentFilterScene
        filter={filter}
        setFilter={setFilter}
        setIsFilterOpen={setIsFilterOpen}
        filterDoctorsList={filterDoctorsList}
        filterSpecialtyList={filterSpecialtyList}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    ) : null;
  };

  const renderRemoveFilterView = () => {
    return (
      <View style={styles.removeFilterViewStyle}>
        <Text
          style={styles.removeFilterTextStyle}
          onPress={() => setFilter(initialAppointmentFilterObject)}
        >
          {'REMOVE ALL'}
        </Text>
      </View>
    );
  };

  const renderSelectedFilters = () => {
    return (
      <View style={styles.selectedFilterMainViewStyle}>
        <View style={styles.selectedFilterViewStyle}>
          {appointmentStatus?.map((filterText) => renderSelectedFilterItems(filterText, 0))}
          {availability?.map((filterText) => renderSelectedFilterItems(filterText, 1))}
          {doctorsList?.map((filterText) => renderSelectedFilterItems(filterText, 2))}
          {specialtyList?.map((filterText) => renderSelectedFilterItems(filterText, 3))}
          {renderRemoveFilterView()}
        </View>
      </View>
    );
  };

  const renderSelectMemberView = () => {
    return (
      <View
        style={[
          styles.selectedMemberViewStyle,
          {
            marginBottom: selectedTab === tabs[0].title ? undefined : 0,
          },
        ]}
      >
        <Text style={styles.viewAnotherMemberTextStyle}>
          {'View appointments of another member?'}
        </Text>

        <ProfileList
          navigation={props.navigation}
          saveUserChange={true}
          childView={<Text style={styles.selectedMemberTextStyle}>{'SELECT MEMBER'}</Text>}
          listContainerStyle={{ marginLeft: 6, marginTop: 22 }}
          selectedProfile={profile}
          setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
          unsetloaderDisplay={true}
        ></ProfileList>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <NavigationEvents
        onDidFocus={(payload) => {
          if (callFetchAppointmentApi) {
            setPageLoading(true);
            fetchAppointments();
          }
        }}
        onDidBlur={(payload) => {}}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
        {renderTopView()}
        {renderConsultOverlay()}
        <ScrollView
          style={{ flex: 1 }}
          bounces={false}
          stickyHeaderIndices={[1]}
          onScroll={handleScroll}
          scrollEventThrottle={20}
        >
          {renderProfileChangeView()}
          {filterLength > 0 ? renderSelectedFilters() : renderTabSwitch()}

          <View>
            {filterLength === 0 ? renderSelectMemberView() : null}
            {filterLength > 0
              ? renderFilterConsultations()
              : selectedTab === tabs[0].title
              ? renderTodaysConsultations()
              : renderConsultations()}
          </View>
        </ScrollView>
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
      {loading && <Spinner />}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
      <NotificationListener navigation={props.navigation} />
      {renderAppointmentFilterScreen()}
    </View>
  );
};
