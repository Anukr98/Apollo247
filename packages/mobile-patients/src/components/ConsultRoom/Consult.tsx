import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import {
  DoctorIcon,
  DoctorPlaceholderImage,
  DropdownGreen,
  Mascot,
  OnlineConsult,
  PhysicalConsult,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import {
  GET_PATIENT_APPOINTMENTS,
  GET_PATIENT_ALL_APPOINTMENTS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  getPatinetAppointments,
  getPatinetAppointments_getPatinetAppointments_patinetAppointments,
} from '@aph/mobile-patients/src/graphql/types/getPatinetAppointments';
import { getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment, { Moment } from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  AsyncStorage,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { APPOINTMENT_STATE, STATUS } from '../../graphql/types/globalTypes';
import { colors } from '../../theme/colors';
import { ProfileList } from '../ui/ProfileList';
import { TabHeader } from '../ui/TabHeader';
import { TabsComponent } from '../ui/TabsComponent';
import { useUIElements } from '../UIElementsProvider';
import { getPatientAllAppointments } from '../../graphql/types/getPatientAllAppointments';

const styles = StyleSheet.create({
  nameTextContainerStyle: {
    maxWidth: '75%',
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
  },
  hiTextStyle: {
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  descriptionTextStyle: {
    marginTop: 8,
    marginBottom: 16,
    color: theme.colors.SKY_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
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
  const tabs = [{ title: 'Active' }, { title: 'Past' }];
  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [selectedTabval, setselectedTabval] = useState<any>();
  const [userName, setuserName] = useState<string | number>('');
  const { analytics, getPatientApiCall } = useAuth();

  const [consultations, setconsultations] = useState<
    getPatinetAppointments_getPatinetAppointments_patinetAppointments[]
  >([]);

  const { loading, setLoading } = useUIElements();

  const [showSchdulesView, setShowSchdulesView] = useState<boolean>(false);
  const [newAppointmentTime, setNewAppointmentTime] = useState<string>('');
  const [newRescheduleCount, setNewRescheduleCount] = useState<number>(0);

  const [transferfollowup, setTransferfollowup] = useState<boolean>(false);
  const [followupdone, setFollowupDone] = useState<boolean>(false);
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>();

  const { allCurrentPatients, setCurrentPatientId, currentPatient } = useAllCurrentPatients();

  //Duplicate
  // useEffect(() => {
  //   if (!currentPatient) {
  //     console.log('No current patients available');
  //     getPatientApiCall();
  //     currentPatient && setProfile(currentPatient!);
  //   }
  // }, [currentPatient]);

  const client = useApolloClient();

  useEffect(() => {
    const didFocusSubscription = props.navigation.addListener('didFocus', (payload) => {
      // setLoading && setLoading(true);
      //setconsultations([]);
      getNetStatus()
        .then((status) => {
          if (status) {
            fetchAppointments();
          } else {
            setLoading && setLoading(false);
            setshowOfflinePopup(true);
          }
        })
        .catch((e) => {
          CommonBugFender('Consult_getNetStatus', e);
        });
    });
    return () => {
      didFocusSubscription && didFocusSubscription.remove();
    };
  }, [currentPatient]);

  useEffect(() => {
    // const getDataFromTree = async () => {
    //   const storeVallue = await AsyncStorage.getItem('selectUserId');
    //   console.log('storeVallue', storeVallue);
    //   if (storeVallue == null) {
    //     setCurrentPatientId(currentPatient! && currentPatient!.id);
    //   } else {
    //     setCurrentPatientId(storeVallue);
    //   }
    // };

    // getDataFromTree();
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
    console.log('current', currentPatient && currentPatient!.id);
    let userName =
      currentPatient && currentPatient.firstName ? currentPatient.firstName.split(' ')[0] : '';
    userName = userName.toLowerCase();
    setuserName(userName);
    currentPatient && setProfile(currentPatient!);
  }, [currentPatient, analytics, props.navigation.state.params]);

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
    setLoading && setLoading(true);
    fetchAppointments();
  }, [currentPatient]);

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
    getNetStatus()
      .then((status) => {
        if (status) {
          // setLoading && setLoading(true);
          fetchAppointments();
        } else {
          setLoading && setLoading(false);
          setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('Consult_getNetStatus_useEffect', e);
      });
  }, [currentPatient]);

  // console.log({ allCurrentPatients, setCurrentPatientId, currentPatient });
  const inputData = {
    patientId: currentPatient ? currentPatient!.id : '',
    appointmentDate: moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'),
  };
  // console.log('inputdata', inputData);

  const fetchAppointments = () => {
    // setLoading && setLoading(true);
    console.log('inputdata', inputData);
    client
      .query<getPatientAllAppointments>({
        query: GET_PATIENT_ALL_APPOINTMENTS,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: currentPatient ? currentPatient!.id : '',
        },
      })
      .then(({ data }) => {
        console.log(data, 'GET_PATIENT_APPOINTMENTS');
        if (
          data &&
          data.getPatientAllAppointments &&
          data.getPatientAllAppointments.appointments &&
          consultations !== data.getPatientAllAppointments.appointments
        ) {
          setconsultations(
            data.getPatientAllAppointments.appointments
            // data.getPatientAllAppointments.appointments.filter((item) => item.doctorInfo !== null)
          );
        } else {
          setconsultations([]);
        }
      })
      .catch((e) => {
        CommonBugFender('Consult_fetchAppointments', e);
        console.log('Error occured', e);
      })
      .finally(() => {
        setLoading && setLoading(false);
      });
  };
  /*
  const renderThingsToDo = () => {
    return (
      <View>
        <View style={styles.labelViewStyle}>
          <Text style={styles.labelStyle}>{string.consult_room.things_to_do.label}</Text>
        </View>
        {thingsToDo.map((serviceTitle, i) => (
          <TouchableHighlight key={i}>
            <View
              style={{
                ...theme.viewStyles.cardViewStyle,
                padding: 16,
                flexDirection: 'row',
                marginHorizontal: 20,
                marginTop: i === 0 ? 11 : 8,
                marginBottom: thingsToDo.length === i + 1 ? 16 : 8,
              }}
              key={i}
            >
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text
                  style={{
                    color: '#02475b',
                    lineHeight: 24,
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(14),
                  }}
                >
                  {serviceTitle.title}
                </Text>
                <Text
                  style={{
                    marginTop: 8,
                    textAlign: 'left',
                    ...theme.viewStyles.yellowTextStyle,
                  }}
                >
                  {serviceTitle.description}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                <DoctorPlaceholder />
              </View>
            </View>
          </TouchableHighlight>
        ))}
      </View>
    );
  };

  const renderArticles = () => {
    return (
      <View>
        <View style={styles.labelViewStyle}>
          <Text style={styles.labelStyle}>{string.consult_room.articles.label}</Text>
        </View>
        {articles.map((article, i) => (
          <TouchableHighlight key={i}>
            <View
              style={{
                height: 104,
                ...theme.viewStyles.cardViewStyle,
                flexDirection: 'row',
                marginHorizontal: 20,
                padding: 0,
                marginTop: i === 0 ? 15 : 8,
                marginBottom: articles.length === i + 1 ? 32 : 8,
              }}
              key={i}
            >
              <View
                style={{
                  overflow: 'hidden',
                  borderTopLeftRadius: 10,
                  borderBottomLeftRadius: 10,
                }}
              >
                <DoctorPlaceholder
                  style={{
                    height: 104,
                    width: 104,
                  }}
                />
              </View>
              <View style={{ flex: 1, margin: 16 }}>
                <Text
                  style={{
                    color: theme.colors.CARD_HEADER,
                    lineHeight: 24,
                    textAlign: 'left',
                    ...theme.fonts.IBMPlexSansMedium(17),
                  }}
                >
                  {article.title}
                </Text>
              </View>
            </View>
          </TouchableHighlight>
        ))}
      </View>
    );
  };
*/

  const isTomorrow = (date: Moment) => {
    const tomorrow = moment(new Date()).add(1, 'days');
    return date.year == tomorrow.year && date.month == tomorrow.month && date.date == tomorrow.date;
  };

  const renderConsultations = () => {
    console.log(moment(new Date()).add(35, 'h'), 'dtat');

    return (
      <FlatList
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 12, paddingTop: 0, marginTop: 14 }}
        // horizontal={true}
        data={
          selectedTab === tabs[0].title
            ? consultations.filter((item) =>
                moment(new Date(item.appointmentDateTime))
                  .add(6, 'days')
                  .startOf('day')
                  .isSameOrAfter(moment(new Date()).startOf('day'))
              )
            : consultations.filter((item) =>
                moment(new Date(item.appointmentDateTime))
                  .add(6, 'days')
                  .startOf('day')
                  .isBefore(moment(new Date()).startOf('day'))
              )
        }
        bounces={false}
        removeClippedSubviews={true}
        showsHorizontalScrollIndicator={false}
        ListEmptyComponent={renderNoAppointments()}
        renderItem={({ item }) => {
          let tomorrowDate = moment(new Date())
            .add(1, 'days')
            .format('DD MMM');
          // console.log(tomorrow, 'tomorrow');
          let appointmentDateTomarrow = moment(item.appointmentDateTime).format('DD MMM');
          // console.log(appointmentDateTomarrow, 'apptomorrow', tomorrowDate);

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

          var day1 = moment(appointmentDateTime).add(7, 'days');
          var day2 = moment(new Date());
          day1.diff(day2, 'days'); // 1

          return (
            <View style={{}}>
              {/* <View style={{ width: 312 }}> */}
              <TouchableOpacity
                activeOpacity={1}
                style={[styles.doctorView]}
                onPress={() => {
                  CommonLogEvent(AppRoutes.Consult, `Consult ${item.appointmentType} clicked`);
                  if (item.doctorInfo && selectedTab === tabs[0].title) {
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
                    {/* {(rowData.availableForPhysicalConsultation || rowData.availableForVirtualConsultation) &&
                            props.displayButton &&
                            rowData.availableIn ? ( */}
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
                      {item.doctorInfo &&
                      item.doctorInfo.thumbnailUrl &&
                      item.doctorInfo.thumbnailUrl.match(
                        /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/
                      ) ? (
                        <Image
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                          }}
                          source={{ uri: item.doctorInfo.thumbnailUrl }}
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

                      {/* {item.isStarDoctor ? (
              <Star style={{ height: 28, width: 28, position: 'absolute', top: 66, left: 30 }} />
            ) : null} */}
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
                      {item.isFollowUp == 'true' ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Text style={styles.consultTextStyles}>
                            {item.appointmentType === 'ONLINE' ? 'Online' : 'Physical'} Consultation
                          </Text>
                          {item.appointmentType === 'ONLINE' ? (
                            <OnlineConsult style={{ marginTop: 13, height: 15, width: 15 }} />
                          ) : (
                            <PhysicalConsult style={{ marginTop: 13, height: 15, width: 15 }} />
                          )}
                        </View>
                      ) : (
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Text style={styles.consultTextStyles}>
                            {item.appointmentType === 'ONLINE' ? 'Online' : 'Physical'} Consultation
                          </Text>
                          {item.appointmentType === 'ONLINE' ? (
                            <OnlineConsult style={{ marginTop: 13, height: 15, width: 15 }} />
                          ) : (
                            <PhysicalConsult style={{ marginTop: 13, height: 15, width: 15 }} />
                          )}
                        </View>
                      )}
                      {/* 
                      <View style={styles.separatorStyle} />
                      {item.symptoms == null ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            marginBottom: 16,
                            flexWrap: 'wrap',
                          }}
                        >
                          {['FEVER', 'COUGH & COLD'].map((name, i) => (
                            <CapsuleView
                              key={i}
                              title={name}
                              isActive={false}
                              style={{ width: 'auto', marginRight: 4, marginTop: 11 }}
                              titleTextStyle={{ color: theme.colors.SKY_BLUE }}
                            />
                          ))}
                        </View>
                      ) : null} */}
                    </View>
                  </View>
                  <View style={[styles.separatorStyle, { marginHorizontal: 16 }]} />
                  {item.isFollowUp == 'true' &&
                  moment(item.appointmentDateTime).isAfter(moment(new Date()).add(-7, 'd')) ? (
                    <View>
                      <Text style={styles.prepareForConsult}>SCHEDULE FOLLOW-UP</Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignSelf: 'flex-end',
                          paddingBottom: -16,
                          marginTop: -16,
                        }}
                      >
                        <Text
                          style={{
                            ...theme.fonts.IBMPlexSansMedium(12),
                            color: '#02475b',
                            opacity: 0.6,
                            letterSpacing: 0.04,
                            textAlign: 'right',
                            paddingBottom: 16,
                          }}
                        >
                          You can avail
                        </Text>
                        <Text
                          style={{
                            ...theme.fonts.IBMPlexSansSemiBold(12),
                            color: '#02475b',
                            opacity: 0.6,
                            letterSpacing: 0.04,
                            textAlign: 'right',
                            paddingBottom: 16,
                            marginRight: 15,
                            paddingLeft: 3,
                          }}
                        >
                          1 free follow-up!
                        </Text>
                      </View>
                    </View>
                  ) : item.status == STATUS.PENDING ||
                    dateIsAfterconsult ||
                    item.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
                    item.status == STATUS.NO_SHOW ||
                    item.status == STATUS.CALL_ABANDON ? (
                    <View>
                      {item.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
                      item.status == STATUS.NO_SHOW ||
                      item.status == STATUS.CALL_ABANDON ? (
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
                      ) : (
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={() => {
                            if (item.doctorInfo && selectedTab === tabs[0].title) {
                              CommonLogEvent(AppRoutes.Consult, 'Chat Room Move clicked');
                              props.navigation.navigate(AppRoutes.ChatRoom, {
                                data: item,
                                callType: '',
                              });
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.prepareForConsult,
                              { opacity: selectedTab === tabs[0].title ? 1 : 0.5 },
                            ]}
                          >
                            {item.isConsultStarted
                              ? string.common.continueConsult
                              : string.common.prepareForConsult}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <View>
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {
                          CommonLogEvent(AppRoutes.Consult, 'Prepare for Consult clicked');
                          if (item.doctorInfo && selectedTab === tabs[0].title) {
                            props.navigation.navigate(AppRoutes.ChatRoom, {
                              data: item,
                              callType: '',
                            });
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.prepareForConsult,
                            {
                              paddingBottom: -16,
                              opacity: selectedTab === tabs[0].title ? 1 : 0.5,
                            },
                          ]}
                        >
                          CHAT WITH DOCTOR
                        </Text>
                        {day1.diff(day2, 'days') > -1 ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignSelf: 'flex-end',
                              paddingBottom: -16,
                              opacity: selectedTab === tabs[0].title ? 1 : 0.5,
                            }}
                          >
                            <Text
                              style={{
                                ...theme.fonts.IBMPlexSansMedium(12),
                                color: '#02475b',
                                opacity: 0.6,
                                letterSpacing: 0.04,
                                textAlign: 'right',
                                paddingBottom: 16,
                              }}
                            >
                              {'You can chat with the doctor for '}
                            </Text>

                            <Text
                              style={{
                                ...theme.fonts.IBMPlexSansSemiBold(12),
                                color: '#02475b',
                                opacity: 0.6,
                                letterSpacing: 0.04,
                                textAlign: 'right',
                                paddingBottom: 16,
                                marginRight: 15,
                                paddingLeft: 3,
                              }}
                            >
                              {day1.diff(day2, 'days') == 0
                                ? 'Today'
                                : day1.diff(day2, 'days') +
                                  ' more ' +
                                  (day1.diff(day2, 'days') == 1 ? 'day' : 'days')}
                            </Text>
                          </View>
                        ) : (
                          <View style={{ height: 16 }} />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        }}
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

  const renderProfileChangeView = () => {
    return (
      <View style={{ backgroundColor: theme.colors.WHITE, paddingHorizontal: 20, elevation: 15 }}>
        <ProfileList
          navigation={props.navigation}
          saveUserChange={true}
          childView={
            <View
              style={{
                flexDirection: 'row',
                paddingRight: 8,
                borderRightWidth: 0,
                borderRightColor: 'rgba(2, 71, 91, 0.2)',
                backgroundColor: theme.colors.WHITE,
              }}
            >
              <Text style={styles.hiTextStyle}>{'hi'}</Text>
              <View style={styles.nameTextContainerStyle}>
                <Text style={styles.nameTextStyle} numberOfLines={1}>
                  {(currentPatient && currentPatient!.firstName!.toLowerCase()) || ''}
                </Text>
                <View style={styles.seperatorStyle} />
              </View>
              <View style={{ paddingTop: 15 }}>
                <DropdownGreen />
              </View>
            </View>
          }
          selectedProfile={profile}
          setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
          unsetloaderDisplay={true}
        ></ProfileList>
        <Text style={styles.descriptionTextStyle}>
          {consultations.filter((item) =>
            moment(new Date(item.appointmentDateTime), 'DD-MM-YYYY').add(6, 'days')
          ).length > -1 && selectedTab === tabs[0].title
            ? 'You have ' +
              (consultations.filter((item) =>
                moment(new Date(item.appointmentDateTime))
                  .add(6, 'days')
                  .startOf('day')
                  .isSameOrAfter(moment(new Date()).startOf('day'))
              ).length || 'no') +
              ' active appointment(s)!'
            : 'You have ' +
              (consultations.filter((item) =>
                moment(new Date(item.appointmentDateTime))
                  .add(6, 'days')
                  .startOf('day')
                  .isBefore(moment(new Date()).startOf('day'))
              ).length || 'no') +
              ' past appointment(s)!'}
        </Text>
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f1ec' }}>
        {renderTopView()}
        <ScrollView
          style={{ flex: 1 }}
          bounces={false}
          stickyHeaderIndices={[1]}
          onScroll={handleScroll}
          scrollEventThrottle={20}
        >
          {renderProfileChangeView()}
          {renderTabSwitch()}
          <View
            style={
              {
                // marginTop:
                //   consultations.length > 0
                //     ? Platform.OS === 'ios'
                //       ? 170
                //       : 180
                //     : Platform.OS === 'ios'
                //     ? 16
                //     : 26,
              }
            }
          >
            {renderConsultations()}
            {/* {renderThingsToDo()} */}
            {/* {renderArticles()} */}
          </View>
        </ScrollView>
      </SafeAreaView>
      {showSchdulesView && (
        <BottomPopUp
          title={`Hi, ${(currentPatient && currentPatient.firstName) || ''} :)`}
          description={`Your appointment with Dr. ${props.navigation.getParam(
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
    </View>
  );
};
