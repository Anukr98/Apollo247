import { ConsultOverlay } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import {
  GET_APPOINTMENT_HISTORY,
  GET_DOCTOR_DETAILS_BY_ID,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getAppointmentHistory,
  getAppointmentHistory_getAppointmentHistory_appointmentsHistory,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentHistory';
import {
  getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { ConsultMode, DoctorType } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { getNextAvailableSlots } from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  g,
  timeDiffFromNow,
  getNetStatus,
  statusBarHeight,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import { AvailabilityCapsule } from '@aph/mobile-patients/src/components/ui/AvailabilityCapsule';
import {
  CommonLogEvent,
  CommonScreenLog,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAppCommonData } from '../AppCommonDataProvider';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  topView: {
    backgroundColor: theme.colors.WHITE,
    marginBottom: 8,
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  detailsViewStyle: {
    margin: 20,
  },
  doctorNameStyles: {
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 7,
    paddingTop: 0,
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
  horizontalSeparatorStyle: {
    borderRightWidth: 0.5,
    borderRightColor: theme.colors.SEPARATOR_LINE,
    marginHorizontal: 13,
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
    backgroundColor: theme.colors.CARD_BG,
    flexDirection: 'row',
    marginTop: 12,
    borderRadius: 10,
    padding: 12,
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

export interface DoctorDetailsProps extends NavigationScreenProps {}
export const DoctorDetails: React.FC<DoctorDetailsProps> = (props) => {
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [doctorDetails, setDoctorDetails] = useState<getDoctorDetailsById_getDoctorDetailsById>();
  const [appointmentHistory, setAppointmentHistory] = useState<
    getAppointmentHistory_getAppointmentHistory_appointmentsHistory[] | null
  >([]);
  const [doctorId, setDoctorId] = useState<string>(
    props.navigation.state.params ? props.navigation.state.params.doctorId : ''
  );
  const { currentPatient } = useAllCurrentPatients();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [scrollY] = useState(new Animated.Value(0));
  const [availableInMin, setavailableInMin] = useState<Number>();
  const [availableTime, setavailableTime] = useState<string>('');
  const [physicalAvailableTime, setphysicalAvailableTime] = useState<string>('');

  const [availableInMinPhysical, setavailableInMinPhysical] = useState<Number>();
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const { getPatientApiCall } = useAuth();
  const { VirtualConsultationFee } = useAppCommonData();

  useEffect(() => {
    if (!currentPatient) {
      console.log('No current patients available');
      getPatientApiCall();
    }
  }, [currentPatient]);

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
  }, []);

  useEffect(() => {
    const display = props.navigation.state.params
      ? props.navigation.state.params.showBookAppointment || false
      : false;
    setdisplayoverlay(display);
  }, [props.navigation.state.params]);

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
        console.log('Error occured', e);
      });
  };

  // const appointmentData = useQuery<getAppointmentHistory>(GET_APPOINTMENT_HISTORY, {
  //   fetchPolicy: 'no-cache',
  //   variables: {
  //     appointmentHistoryInput: {
  //       patientId: currentPatient ? currentPatient.id : '',
  //       doctorId: doctorId ? doctorId : '',
  //     },
  //   },
  // });
  // if (appointmentData.error) {
  //   console.log('error', appointmentData.error);
  // } else {
  //   // console.log(appointmentData, '00000000000');
  //   try {
  //     if (
  //       appointmentData &&
  //       appointmentData.data &&
  //       appointmentData.data.getAppointmentHistory &&
  //       appointmentHistory !== appointmentData.data.getAppointmentHistory.appointmentsHistory
  //     ) {
  //       setAppointmentHistory(appointmentData.data.getAppointmentHistory.appointmentsHistory);
  //     }
  //   } catch {}
  // }

  const todayDate = new Date().toISOString().slice(0, 10);

  const fetchNextAvailableSlots = (doctorIds: string[]) => {
    // const doctorIds = doctorDetails ? [doctorDetails.id] : [];
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
        console.log('Error occured ', e);
      });
  };

  const fetchDoctorDetails = () => {
    client
      .query<getDoctorDetailsById>({
        query: GET_DOCTOR_DETAILS_BY_ID,
        variables: { id: doctorId },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        console.log(data, 'data');

        try {
          if (data && data.getDoctorDetailsById && doctorDetails !== data.getDoctorDetailsById) {
            setDoctorDetails(data.getDoctorDetailsById);
            setDoctorId(data.getDoctorDetailsById.id);
            setshowSpinner(false);
            fetchNextAvailableSlots([data.getDoctorDetailsById.id]);
          }
        } catch (e) {
          CommonBugFender('DoctorDetails_fetchDoctorDetails_try', e);
        }
      })
      .catch((e) => {
        CommonBugFender('DoctorDetails_fetchDoctorDetails', e);
        setshowSpinner(false);
        console.log('Error occured', e);
      });
  };

  // const { data, error } = useQuery<getDoctorDetailsById>(GET_DOCTOR_DETAILS_BY_ID, {
  //   // variables: { id: 'a6ef960c-fc1f-4a12-878a-12063788d625' },
  //   fetchPolicy: 'no-cache',
  //   variables: { id: doctorId },
  // });
  // if (error) {
  //   setshowSpinner(false);
  //   console.log('error', error);
  // } else {
  //   try {
  //     console.log('getDoctorDetailsById', data);
  //     if (data && data.getDoctorDetailsById && doctorDetails !== data.getDoctorDetailsById) {
  //       setDoctorDetails(data.getDoctorDetailsById);
  //       setDoctorId(data.getDoctorDetailsById.id);
  //       setshowSpinner(false);
  //       fetchNextAvailableSlots([data.getDoctorDetailsById.id]);
  //     }
  //   } catch {}
  // }

  // const availability = useQuery<GetDoctorNextAvailableSlot>(NEXT_AVAILABLE_SLOT, {
  //   fetchPolicy: 'no-cache',
  //   variables: {
  //     DoctorNextAvailableSlotInput: {
  //       doctorIds: doctorDetails ? [doctorDetails.id] : [],
  //       availableDate: todayDate,
  //     },
  //   },
  // });
  // if (availability.error) {
  //   console.log('error', availability.error);
  // } else {
  //   try {
  //     // console.log(availability.data, 'availabilityData', 'availableSlots');
  //     const doctorAvailalbeSlots = g(
  //       availability,
  //       'data',
  //       'getDoctorNextAvailableSlot',
  //       'doctorAvailalbeSlots'
  //     );
  //     // console.log(doctorAvailalbeSlots, '1234567');
  //     if (doctorAvailalbeSlots && availableInMin === undefined) {
  //       const nextSlot = doctorAvailalbeSlots ? g(doctorAvailalbeSlots[0], 'availableSlot') : null;
  //       const nextPhysicalSlot = doctorAvailalbeSlots
  //         ? g(doctorAvailalbeSlots[0], 'physicalAvailableSlot')
  //         : null;

  //       // console.log(nextSlot, 'nextSlot', nextPhysicalSlot);
  //       if (nextSlot) {
  //         const timeDiff: Number = timeDiffFromNow(nextSlot);
  //         setavailableInMin(timeDiff);
  //       }
  //       if (nextPhysicalSlot) {
  //         const timeDiff: Number = timeDiffFromNow(nextPhysicalSlot);
  //         setavailableInMinPhysical(timeDiff);
  //       }
  //     }
  //   } catch (error) {}
  // }

  const formatTime = (time: string) => {
    const IOSFormat = `${todayDate}T${time}.000Z`;
    return Moment(new Date(IOSFormat), 'HH:mm:ss.SSSz').format('hh:mm A');
  };
  const formatDateTime = (time: string) => {
    return Moment(new Date(time), 'HH:mm:ss.SSSz').format('hh:mm A');
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

      return (
        <View style={styles.topView}>
          {doctorDetails && (
            <View style={styles.detailsViewStyle}>
              <Text style={styles.doctorNameStyles}>
                Dr. {doctorDetails.firstName} {doctorDetails.lastName}
              </Text>
              <View style={styles.separatorStyle} />
              <Text style={styles.doctorSpecializationStyles}>
                {doctorDetails.specialty && doctorDetails.specialty.name
                  ? doctorDetails.specialty.name
                  : ''}{' '}
                | {doctorDetails.experience} YR{Number(doctorDetails.experience) == 1 ? '' : 'S'}
              </Text>
              <Text style={styles.educationTextStyles}>{doctorDetails.qualification}</Text>
              <Text style={[styles.educationTextStyles, { paddingBottom: 12 }]}>
                {doctorDetails.awards
                  ? doctorDetails.awards.replace(/(<([^>]+)>)/gi, '').trim()
                  : ''}
              </Text>
              <View style={styles.separatorStyle} />
              {!!clinicAddress && (
                <Text style={[styles.doctorLocation, { paddingTop: 11 }]}>{clinicAddress}</Text>
              )}
              {doctorDetails.languages ? (
                <Text style={[styles.doctorLocation, { paddingBottom: 11, paddingTop: 4 }]}>
                  {doctorDetails.languages.split(',').join(' | ')}
                </Text>
              ) : null}
              <View style={styles.separatorStyle} />
              <View style={styles.onlineConsultView}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.onlineConsultLabel}>Online Consult</Text>
                  <Text style={styles.onlineConsultAmount}>
                    {Number(VirtualConsultationFee) <= 0 ||
                    VirtualConsultationFee === doctorDetails.onlineConsultationFees ? (
                      <Text>{`Rs. ${doctorDetails.onlineConsultationFees}`}</Text>
                    ) : (
                      <>
                        <Text
                          style={{
                            textDecorationLine: 'line-through',
                            textDecorationStyle: 'solid',
                          }}
                        >
                          {`(Rs. ${doctorDetails.onlineConsultationFees})`}
                        </Text>
                        <Text> Rs. {VirtualConsultationFee}</Text>
                      </>
                    )}
                  </Text>
                  <AvailabilityCapsule availableTime={availableTime} />
                </View>
                {doctorDetails.doctorType !== DoctorType.PAYROLL && (
                  <View style={styles.horizontalSeparatorStyle} />
                )}
                <View style={{ flex: 1 }}>
                  {doctorDetails.doctorType !== DoctorType.PAYROLL && (
                    <>
                      <Text style={styles.onlineConsultLabel}>Clinic Visit</Text>
                      <Text style={styles.onlineConsultAmount}>
                        Rs. {doctorDetails.physicalConsultationFees}
                      </Text>
                      <AvailabilityCapsule availableTime={physicalAvailableTime} />
                    </>
                  )}
                </View>
              </View>
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
              <Text style={styles.labelStyle}>
                Dr. {doctorDetails.firstName}’s location for physical visits
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
                            source={{
                              uri:
                                item && item.facility && item.facility.imageUrl
                                  ? item.facility.imageUrl
                                  : 'https://via.placeholder.com/328x136',
                            }}
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

  const renderDoctorTeam = () => {
    if (doctorDetails && doctorDetails.starTeam && doctorDetails.starTeam.length > 0)
      return (
        <View style={styles.cardView}>
          <View style={styles.labelView}>
            <Text style={styles.labelStyle}>Dr. {doctorDetails.firstName}’s Team</Text>
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
    const arrayHistory = appointmentHistory ? appointmentHistory : [];
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
                onPress={() => {
                  console.log('itemdoc', item, doctorDetails);
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
                  <View style={{ flexDirection: 'row' }}>
                    {Appointments[0].symptoms.map((name, index) => (
                      <CapsuleView
                        key={index}
                        title={name}
                        isActive={false}
                        style={{ width: 'auto', marginRight: 4, marginTop: 11 }}
                        titleTextStyle={{ color: theme.colors.SKY_BLUE }}
                      />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      );
    }
  };

  const handleScroll = () => {
    // console.log(e, 'jvjhvhm');
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: doctorDetails ? `${doctorDetails.firstName} ${doctorDetails.lastName}` : '',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      CommonBugFender('DoctorDetails_onShare_try', error);
      // Alert(error.message);
    }
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
          {/* <ScrollView style={{ flex: 1 }} bounces={false}> */}
          {doctorDetails && renderDoctorDetails()}
          {doctorDetails && renderDoctorClinic()}
          {doctorDetails && renderDoctorTeam()}
          {appointmentHistory && renderAppointmentHistory()}
          <View style={{ height: 92 }} />
          {/* </ScrollView> */}
        </Animated.ScrollView>

        {showSpinner ? null : (
          <StickyBottomComponent defaultBG>
            <Button
              title={'BOOK APPOINTMENT'}
              onPress={() => {
                getNetStatus()
                  .then((status) => {
                    if (status) {
                      setdisplayoverlay(true);
                    } else {
                      setshowOfflinePopup(true);
                    }
                  })
                  .catch((e) => {
                    CommonBugFender('DoctorDetails_getNetStatus', e);
                  });
              }}
              style={{ marginHorizontal: 60, flex: 1 }}
            />
          </StickyBottomComponent>
        )}
      </SafeAreaView>

      {displayoverlay && doctorDetails && (
        <ConsultOverlay
          setdisplayoverlay={() => setdisplayoverlay(false)}
          navigation={props.navigation}
          doctor={doctorDetails ? doctorDetails : null}
          patientId={currentPatient ? currentPatient.id : ''}
          clinics={doctorDetails.doctorHospital ? doctorDetails.doctorHospital : []}
          doctorId={props.navigation.state.params!.doctorId}
          FollowUp={props.navigation.state.params!.FollowUp}
          appointmentType={props.navigation.state.params!.appointmentType}
          appointmentId={props.navigation.state.params!.appointmentId}
          // availableSlots={availableSlots}
        />
      )}
      <Animated.View
        style={{
          position: 'absolute',
          height: 160,
          width: '100%',
          top: statusBarHeight(),
          backgroundColor: headColor,
          justifyContent: 'flex-end',
          flexDirection: 'column',
          transform: [{ translateY: headMov }],
        }}
      >
        {/* <Animated.Text>
          <Text>Hey, Hi</Text>
        </Animated.Text> */}
        {/* <Text>hello</Text> */}
        <View
          style={{
            height: 160,
            // backgroundColor: 'red',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {doctorDetails &&
          doctorDetails &&
          doctorDetails.photoUrl &&
          doctorDetails.photoUrl.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|png|JPG|PNG)/) ? (
            <Animated.Image
              source={{ uri: doctorDetails.photoUrl }}
              style={{ top: 10, height: 140, width: 140, opacity: imgOp }}
            />
          ) : null}
        </View>
      </Animated.View>
      <Header
        container={{
          zIndex: 3,
          position: 'absolute',
          top: statusBarHeight(),
          left: 0,
          right: 0,
          height: 56,
          backgroundColor: 'transparent',
          borderBottomWidth: 0,
        }}
        leftIcon="backArrow"
        // rightComponent={
        //   <TouchableOpacity activeOpacity={1} onPress={onShare}>
        //     <ShareGreen />
        //   </TouchableOpacity>
        // }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
      {showSpinner && <Spinner />}
      {showOfflinePopup && (
        <NoInterNetPopup
          onClickClose={() => {
            setshowOfflinePopup(false);
            props.navigation.goBack();
          }}
        />
      )}
    </View>
  );
};
