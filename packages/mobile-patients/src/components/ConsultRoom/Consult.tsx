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
  ChatBlueIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import {
  CommonBugFender,
  CommonLogEvent,
  isIphone5s,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { GET_PATIENT_ALL_APPOINTMENTS } from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { getPatinetAppointments_getPatinetAppointments_patinetAppointments } from '@aph/mobile-patients/src/graphql/types/getPatinetAppointments';
import {
  callPermissions,
  getNetStatus,
  postWebEngageEvent,
  g,
  followUpChatDaysCaseSheet,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
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
} from 'react-native';
import { FlatList, NavigationEvents, NavigationScreenProps } from 'react-navigation';
import {
  getPatientAllAppointments,
  getPatientAllAppointments_getPatientAllAppointments_appointments,
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
import { NotificationListener } from '@aph/mobile-patients/src/components/NotificationListener';

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
    //marginTop: 5,
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
    ...theme.fonts.IBMPlexSansMedium(isIphone5s() ? 15 : 17),
    lineHeight: 24,
  },
  buttonStyles: {
    height: 40,
    width: 180,
    // paddingHorizontal: 26
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
});

export interface ConsultProps extends NavigationScreenProps {
  Data: any;
  TransferData: any;
  TranferDateTime: any;
  FollowupData: any;
  FollowupDateTime: any;
  DoctorName: any;
}
export const Consult: React.FC<ConsultProps> = (props) => {
  const thingsToDo = string.consult_room.things_to_do.data;
  const articles = string.consult_room.articles.data;
  const tabs = [{ title: 'Today' }, { title: 'Upcoming' }, { title: 'Past' }];
  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const { analytics } = useAuth();

  const [consultations, setconsultations] = useState<
    getPatientAllAppointments_getPatientAllAppointments_appointments[]
  >([]);
  const [activeConsultations, setActiveConsultations] = useState<
    getPatientAllAppointments_getPatientAllAppointments_appointments[]
  >([]);
  const [pastConsultations, setPastConsultations] = useState<
    getPatientAllAppointments_getPatientAllAppointments_appointments[]
  >([]);
  const [upcomingConsultations, setUpcomingConsultatons] = useState<
    getPatientAllAppointments_getPatientAllAppointments_appointments[]
  >([]);
  const [todaysConsultations, setTodaysConsultations] = useState<
    { type: string; data: getPatientAllAppointments_getPatientAllAppointments_appointments }[] | any
  >();

  const { loading, setLoading } = useUIElements();
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [
    appointmentItem,
    setAppoinmentItem,
  ] = useState<getPatientAllAppointments_getPatientAllAppointments_appointments | null>();
  const [showSchdulesView, setShowSchdulesView] = useState<boolean>(false);
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>('');
  const [newRescheduleCount, setNewRescheduleCount] = useState<number>(0);

  const [transferfollowup, setTransferfollowup] = useState<boolean>(false);
  const [followupdone, setFollowupDone] = useState<boolean>(false);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>();

  const { currentPatient } = useAllCurrentPatients();

  const client = useApolloClient();

  useEffect(() => {
    console.log('current', currentPatient && currentPatient!.id);
    console.log('profile', profile && profile!.id);
    if (currentPatient && profile) {
      if (currentPatient.id != profile.id) {
        console.log('userchanged', currentPatient, profile);
        setLoading && setLoading(true);
        fetchAppointments();
      }
    }
    // if (consultations.length <= 0) {
    //   if (currentPatient) {
    //     fetchAppointments();
    //   }
    // }
    currentPatient && setProfile(currentPatient!);
  }, [currentPatient, analytics, props.navigation.state.params]);

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
    // callPermissions();
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
    data: getPatinetAppointments_getPatinetAppointments_patinetAppointments
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
  };

  const inputData = {
    patientId: currentPatient ? currentPatient!.id : '',
    appointmentDate: moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'),
  };

  const fetchAppointments = async () => {
    let userId: any = await AsyncStorage.getItem('selectedProfileId');
    userId = JSON.parse(userId);
    console.log('userId', userId);

    setLoading && setLoading(true);
    getNetStatus()
      .then((status) => {
        console.log(status, 'status');

        if (status) {
          console.log('inputdata', inputData);
          client
            .query<getPatientAllAppointments>({
              query: GET_PATIENT_ALL_APPOINTMENTS,
              fetchPolicy: 'no-cache',
              variables: {
                patientId:
                  userId !== g(currentPatient, 'id') ? g(currentPatient, 'id') || userId : userId,
              },
            })
            .then(({ data }) => {
              if (
                data &&
                data.getPatientAllAppointments &&
                data.getPatientAllAppointments.appointments &&
                consultations !== data.getPatientAllAppointments.appointments
              ) {
                console.log(
                  'data.getPatientAllAppointments.appointments',
                  data.getPatientAllAppointments.appointments
                );
                let pastAppointments:
                  | getPatientAllAppointments_getPatientAllAppointments_appointments
                  | any = [];
                let activeAppointments:
                  | getPatientAllAppointments_getPatientAllAppointments_appointments
                  | any = [];
                let todaysAppointments:
                  | getPatientAllAppointments_getPatientAllAppointments_appointments
                  | any = [];
                let upcomingAppointments:
                  | getPatientAllAppointments_getPatientAllAppointments_appointments
                  | any = [];
                let followUpAppointments:
                  | getPatientAllAppointments_getPatientAllAppointments_appointments
                  | any = [];
                let combinationActiveFollowUp: any = [];
                data.getPatientAllAppointments.appointments.forEach((item) => {
                  const caseSheet = followUpChatDaysCaseSheet(item.caseSheet);
                  const caseSheetChatDays = g(caseSheet, '0' as any, 'followUpAfterInDays');
                  const followUpAfterInDays =
                    caseSheetChatDays || caseSheetChatDays === '0'
                      ? caseSheetChatDays === '0'
                        ? 0
                        : Number(caseSheetChatDays) - 1
                      : 6;
                  if (
                    item?.status === STATUS.CANCELLED ||
                    !moment(new Date(item?.appointmentDateTime))
                      .add(followUpAfterInDays, 'days')
                      .startOf('day')
                      .isSameOrAfter(moment(new Date()).startOf('day'))
                  ) {
                    pastAppointments.push(item);
                  } else {
                    const tomorrowAvailabilityHourTime = moment('00:00', 'HH:mm');
                    const tomorrowAvailabilityTime = moment()
                      .add('days', 1)
                      .set({
                        hour: tomorrowAvailabilityHourTime.get('hour'),
                        minute: tomorrowAvailabilityHourTime.get('minute'),
                      });
                    const diffInHoursForTomorrowAvailabilty = moment(
                      item?.appointmentDateTime
                    ).diff(tomorrowAvailabilityTime, 'minutes');
                    diffInHoursForTomorrowAvailabilty < 1
                      ? todaysAppointments.push(item)
                      : upcomingAppointments.push(item);
                    if (diffInHoursForTomorrowAvailabilty < 1) {
                      item?.status === STATUS.COMPLETED
                        ? followUpAppointments.push(item)
                        : activeAppointments.push(item);
                    }
                  }
                });
                combinationActiveFollowUp.push({ type: 'Active', data: activeAppointments });
                combinationActiveFollowUp.push({
                  type: 'Follow-up Chat',
                  data: followUpAppointments,
                });
                setTodaysConsultations(combinationActiveFollowUp);
                setUpcomingConsultatons(
                  upcomingAppointments.sort(
                    (a: any, b: any) =>
                      moment(a.appointmentDateTime)
                        .toDate()
                        .getTime() -
                      moment(b.appointmentDateTime)
                        .toDate()
                        .getTime()
                  )
                );
                setconsultations(data.getPatientAllAppointments.appointments);
                setActiveConsultations(activeAppointments);
                setPastConsultations(pastAppointments);
              } else {
                setconsultations([]);
              }
              // setLoading && setLoading(false);
            })
            .catch((e) => {
              CommonBugFender('Consult_fetchAppointments', e);
              console.log('Error occured in GET_PATIENT_ALL_APPOINTMENTS', e);
            })
            .finally(() => {
              console.log('finally');

              setLoading && setLoading(false);
            });
        } else {
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('Consult_getNetStatus', e);
      });
  };

  const isTomorrow = (date: Moment) => {
    const tomorrow = moment(new Date()).add(1, 'days');
    return date.year == tomorrow.year && date.month == tomorrow.month && date.date == tomorrow.date;
  };

  const renderSectionHeader = (section: any) => {
    return (
      <Text
        style={[
          styles.sectionHeaderTitleStyle,
          section.type === 'Follow-up Chat' && { marginTop: 10 },
        ]}
      >
        {section.type}
      </Text>
    );
  };

  const renderTodaysConsultations = () => {
    return (
      <SectionList
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 12, paddingTop: 0, marginTop: 0 }}
        bounces={false}
        sections={selectedTab === tabs[0].title ? todaysConsultations : []}
        ListEmptyComponent={renderNoAppointments()}
        renderSectionHeader={({ section }) => renderSectionHeader(section)}
        renderItem={({ item, index }) => renderConsultationCard(item, index)}
      />
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

  const renderConsultationCard = (
    item: getPatientAllAppointments_getPatientAllAppointments_appointments,
    index: number
  ) => {
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
    // console.log(tomorrow, 'tomorrow');
    let appointmentDateTomarrow = moment(item.appointmentDateTime).format('DD MMM');
    // console.log(appointmentDateTomarrow, 'apptomorrow', tomorrowDate);
    const caseSheet = followUpChatDaysCaseSheet(item.caseSheet);
    const caseSheetChatDays = g(caseSheet, '0' as any, 'followUpAfterInDays');
    const followUpAfterInDays =
      caseSheetChatDays || caseSheetChatDays === '0'
        ? caseSheetChatDays === '0'
          ? 2
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
      // .set('hour', 0)
      // .set('minute', 0)
      .startOf('day')
      .add(followUpAfterInDays, 'days'); // since we're calculating as EOD
    const day2 = moment(new Date());
    day1.diff(day2, 'days'); // 1
    const numberDaysToConsultText =
      '(' + day1.diff(day2, 'days') + (day1.diff(day2, 'days') == 1 ? ' day left)' : ' days left)');
    const prevItem =
      selectedTab === tabs[1].title
        ? upcomingConsultations[index - 1]
        : selectedTab !== tabs[0].title
        ? pastConsultations[index - 1]
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

    const renderPastConsultationButtons = () => {
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
                item.appointmentType === 'ONLINE'
                  ? props.navigation.navigate(AppRoutes.ChatRoom, {
                      data: item,
                      callType: '',
                      prescription: '',
                      disableChat: item.doctorInfo && selectedTab === tabs[2].title,
                    })
                  : props.navigation.navigate(AppRoutes.DoctorDetails, {
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
          )}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setAppoinmentItem(item);
              setdisplayoverlay(true);
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

    const renderTextConsultButton = () => {
      return (
        <View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              postConsultCardEvents('Chat with Doctor', item);
              CommonLogEvent(AppRoutes.Consult, 'Prepare for Consult clicked');
              props.navigation.navigate(AppRoutes.ChatRoom, {
                data: item,
                callType: '',
                prescription: '',
                disableChat: item.doctorInfo && selectedTab === tabs[2].title,
              });
            }}
          >
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
              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'flex-end',
                  paddingBottom: -16,
                  opacity: 1,
                }}
              >
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
        <View
          style={{
            flexDirection: 'row',
            marginBottom: 16,
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setAppoinmentItem(item);
              setdisplayoverlay(true);
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
      return (
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            activeOpacity={1}
            style={{ flex: 1 }}
            onPress={() => {
              postConsultCardEvents(
                item.isConsultStarted ? 'Continue Consult' : 'Fill Medical Details',
                item
              );
              CommonLogEvent(AppRoutes.Consult, 'Prepare for Consult clicked');
              if (item.doctorInfo && selectedTab !== tabs[2].title) {
                CommonLogEvent(AppRoutes.Consult, 'Chat Room Move clicked');
                props.navigation.navigate(AppRoutes.ChatRoom, {
                  data: item,
                  callType: '',
                  prescription: '',
                });
              }
            }}
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
      return (
        <>
          <View style={styles.pickAnotherSlotViewStyle}>
            <Text style={{ ...theme.viewStyles.text('M', 12, '#890000', 1, 18, 0.04) }}>
              {string.common.pickAnotherSlotText}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
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
            }}
          >
            <Text style={styles.prepareForConsult}>PICK ANOTHER SLOT</Text>
          </TouchableOpacity>
        </>
      );
    };

    return (
      <View style={{}}>
        {showDateText && selectedTab !== tabs[0].title ? (
          <Text style={[styles.sectionHeaderTitleStyle, { marginTop: 10 }]}>
            {appointmentDateText}
          </Text>
        ) : null}
        {/* <View style={{ width: 312 }}> */}
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.doctorView]}
          onPress={() => {
            postConsultCardEvents('Card Click', item);
            CommonLogEvent(AppRoutes.Consult, `Consult ${item.appointmentType} clicked`);
            if (item.doctorInfo && selectedTab !== tabs[2].title) {
              item.appointmentType === 'ONLINE'
                ? props.navigation.navigate(AppRoutes.AppointmentOnlineDetails, {
                    data: item,
                    from: 'Consult',
                  })
                : props.navigation.navigate(AppRoutes.AppointmentDetails, {
                    data: item,
                    from: 'Consult',
                  });
            }
          }}
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

              <View style={styles.imageView}>
                {!!g(item, 'doctorInfo', 'thumbnailUrl') ? (
                  <Image
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      resizeMode: 'contain',
                    }}
                    source={{ uri: item.doctorInfo!.thumbnailUrl! }}
                    resizeMode={'contain'}
                  />
                ) : (
                  <DoctorPlaceholderImage
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                    }}
                    resizeMode={'contain'}
                  />
                )}
              </View>
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={styles.doctorNameStyles} numberOfLines={1}>
                  {item.doctorInfo ? `${item.doctorInfo.displayName}` : ''}
                </Text>
                {item.isFollowUp == 'true' ? (
                  <Text
                    style={{
                      ...theme.fonts.IBMPlexSansMedium(12),
                      color: '#02475b',
                      opacity: 0.6,
                      marginBottom: 12,
                      marginTop: 4,
                      letterSpacing: 0.02,
                    }}
                  >
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
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
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
            {item.status == STATUS.PENDING ||
            // dateIsAfterconsult ||
            item.status == STATUS.IN_PROGRESS ||
            item.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
            item.status == STATUS.NO_SHOW ||
            item.status == STATUS.CALL_ABANDON ? (
              <View>
                {item.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
                item.status == STATUS.NO_SHOW ||
                item.status == STATUS.CALL_ABANDON
                  ? renderPickAnotherButton()
                  : selectedTab === tabs[2].title
                  ? renderPastConsultationButtons()
                  : renderActiveUpcomingConsultButton()}
              </View>
            ) : selectedTab === tabs[2].title ? (
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
      <FlatList
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 12, paddingTop: 0, marginTop: 14 }}
        // horizontal={true}
        data={selectedTab === tabs[1].title ? upcomingConsultations : pastConsultations}
        bounces={false}
        removeClippedSubviews={true}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={renderNoAppointments()}
        renderItem={({ item, index }) => renderConsultationCard(item, index)}
      />
    );
  };

  const [scrollOffset, setScrollOffset] = useState<number>(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // console.log(`scrollOffset, ${event.nativeEvent.contentOffset.y}`);
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
            elevation: 15,
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
        resizeMode={'contain'}
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

  const renderSearchFilterView = () => {
    return (
      <View style={{ flexDirection: 'row', flex: 1, marginRight: 20 }}>
        <Text style={styles.descriptionTextStyle}>
          {selectedTab === tabs[0].title
            ? 'You have ' + (activeConsultations.length || 'no') + ' active appointment(s)!'
            : selectedTab === tabs[1].title
            ? 'You have ' + (upcomingConsultations.length || 'no') + ' upcoming appointment(s)!'
            : 'You have ' + (pastConsultations.length || 'no') + ' past appointment(s)!'}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flex: 1,
            marginLeft: 10,
          }}
        >
          <TouchableOpacity activeOpacity={1}>
            <SearchGreenIcon style={{ width: 23, height: 23, marginTop: 8 }} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={1}>
            <FilterDarkBlueIcon style={{ width: 17, height: 18, marginTop: 8 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderNoAppointments = () => {
    if (!loading) {
      return (
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            padding: 16,
            marginTop: 20,
            marginHorizontal: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
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
  return (
    <View style={{ flex: 1 }}>
      <NavigationEvents
        onDidFocus={(payload) => {
          console.log('did focus', payload);
          setLoading && setLoading(true);
          fetchAppointments();
        }}
        onDidBlur={(payload) => console.log('did blur', payload)}
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
          {renderTabSwitch()}
          <View>
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 20,
                marginVertical: 14,
                marginBottom: selectedTab === tabs[0].title ? undefined : 0,
                alignItems: 'center',
                flex: 1,
              }}
            >
              <Text
                style={{ ...theme.viewStyles.text('M', isIphone5s() ? 10 : 12, '#02475B', 1, 16) }}
              >
                {'View appointments of another member?'}
              </Text>
              <ProfileList
                navigation={props.navigation}
                saveUserChange={true}
                childView={
                  <Text
                    style={{
                      ...theme.viewStyles.text('B', isIphone5s() ? 11 : 13, '#FC9916', 1, 24),
                      marginLeft: 8,
                    }}
                  >
                    {'SELECT MEMBER'}
                  </Text>
                }
                listContainerStyle={{ marginLeft: 6, marginTop: 22 }}
                selectedProfile={profile}
                setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
                unsetloaderDisplay={true}
              ></ProfileList>
            </View>
            {selectedTab === tabs[0].title ? renderTodaysConsultations() : renderConsultations()}
            {/* {renderThingsToDo()} */}
            {/* {renderArticles()} */}
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
      {/* {loading && <Spinner />} */}
      {showOfflinePopup && <NoInterNetPopup onClickClose={() => setshowOfflinePopup(false)} />}
      <NotificationListener navigation={props.navigation} />
    </View>
  );
};
