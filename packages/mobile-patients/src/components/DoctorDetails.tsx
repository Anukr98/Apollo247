import { ConsultOverlay } from '@aph/mobile-patients/src/components/ConsultOverlay';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CapsuleView } from '@aph/mobile-patients/src/components/ui/CapsuleView';
import { DoctorCard } from '@aph/mobile-patients/src/components/ui/DoctorCard';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ShareWhite } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Platform,
  Animated,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { useQuery } from 'react-apollo-hooks';
import {
  GET_DOCTOR_PROFILE_BY_ID,
  GET_APPOINTMENT_HISTORY,
  GET_AVAILABLE_SLOTS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import Moment from 'moment';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import {
  getDoctorProfileById,
  getDoctorProfileByIdVariables,
  getDoctorProfileById_getDoctorProfileById,
} from '@aph/mobile-patients/src/graphql/types/getDoctorProfileById';
import {
  getAppointmentHistory,
  getAppointmentHistory_getAppointmentHistory_appointmentsHistory,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentHistory';
import { getDoctorAvailableSlots } from '@aph/mobile-patients/src/graphql/types/getDoctorAvailableSlots';

const { height } = Dimensions.get('window');

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
  },
  doctorSpecializationStyles: {
    paddingTop: 7,
    paddingBottom: 12,
    ...theme.fonts.IBMPlexSansSemiBold(12),
    color: theme.colors.SKY_BLUE,
    letterSpacing: 0.3,
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
  const [dispalyoverlay, setdispalyoverlay] = useState<boolean>(false);
  const [
    doctorDetails,
    setDoctorDetails,
  ] = useState<getDoctorProfileById_getDoctorProfileById | null>();
  const [appointmentHistory, setAppointmentHistory] = useState<
    getAppointmentHistory_getAppointmentHistory_appointmentsHistory[] | null
  >([]);
  const [doctorId, setDoctorId] = useState<String>('');
  const { currentPatient } = useAllCurrentPatients();
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [scrollY, setscrollY] = useState(new Animated.Value(0));
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

  const appointmentData = useQuery<getAppointmentHistory>(GET_APPOINTMENT_HISTORY, {
    variables: {
      appointmentHistoryInput: {
        patientId: currentPatient ? currentPatient.id : '',
        doctorId: doctorId ? doctorId : '',
      },
    },
  });
  if (appointmentData.error) {
    console.log('error', appointmentData.error);
  } else {
    if (
      appointmentData &&
      appointmentData.data &&
      appointmentData.data.getAppointmentHistory &&
      appointmentHistory !== appointmentData.data.getAppointmentHistory.appointmentsHistory
    ) {
      setAppointmentHistory(appointmentData.data.getAppointmentHistory.appointmentsHistory);
    }
  }
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  const date = `${today.getFullYear()}-${mm}-${dd}`;
  console.log(date, 'dateeeeeeee', doctorId, 'doctorId');
  const availabilityData = useQuery<getDoctorAvailableSlots>(GET_AVAILABLE_SLOTS, {
    variables: {
      DoctorAvailabilityInput: {
        availableDate: date,
        doctorId: doctorId ? doctorId : '',
      },
    },
  });
  if (availabilityData.error) {
    console.log('error', availabilityData.error);
  } else {
    console.log(availabilityData.data, 'availabilityData');
  }

  const formatTime = (time: string) => Moment(time, 'HH:mm:ss.SSSz').format('hh:mm a');

  const renderDoctorDetails = () => {
    if (doctorDetails)
      return (
        <View style={styles.topView}>
          {doctorDetails && doctorDetails.profile && (
            <View style={styles.detailsViewStyle}>
              <Text style={styles.doctorNameStyles}>
                {doctorDetails.profile.salutation}. {doctorDetails.profile.firstName}{' '}
                {doctorDetails.profile.lastName}
              </Text>
              <View style={styles.separatorStyle} />
              <Text style={styles.doctorSpecializationStyles}>
                {doctorDetails.profile.specialization!.toUpperCase()} |{' '}
                {doctorDetails.profile.experience} YRS
              </Text>
              <Text style={styles.educationTextStyles}>{doctorDetails.profile.education}</Text>
              <Text style={[styles.educationTextStyles, { paddingBottom: 12 }]}>
                {doctorDetails.profile.awards}
              </Text>

              <View style={styles.separatorStyle} />
              <Text style={[styles.doctorLocation, { paddingTop: 11 }]}>
                {doctorDetails.profile.address}
              </Text>
              <Text style={[styles.doctorLocation, { paddingBottom: 11, paddingTop: 4 }]}>
                {doctorDetails.profile.languages!.split(',').join(' | ')}
              </Text>
              <View style={styles.separatorStyle} />
              <View style={styles.onlineConsultView}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.onlineConsultLabel}>Online Consult</Text>
                  <Text style={styles.onlineConsultAmount}>
                    Rs. {doctorDetails.profile.onlineConsultationFees}
                  </Text>
                  <CapsuleView title={'AVAILABLE IN 15 MINS'} />
                </View>
                <View style={styles.horizontalSeparatorStyle} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.onlineConsultLabel}>Clinic Visit</Text>
                  <Text style={styles.onlineConsultAmount}>
                    Rs. {doctorDetails.profile.physicalConsultationFees}
                  </Text>
                  <CapsuleView title={'AVAILABLE IN 27 MINS'} isActive={false} />
                </View>
              </View>
            </View>
          )}
        </View>
      );
    return null;
  };

  const renderDoctorClinic = () => {
    if (doctorDetails && doctorDetails.clinics && doctorDetails.clinics.length > 0) {
      const clinic = doctorDetails.clinics[0];

      return (
        <View style={styles.cardView}>
          <View style={styles.labelView}>
            <Text style={styles.labelStyle}>
              {doctorDetails.profile.salutation}. {doctorDetails.profile.firstName}’s Clinic
            </Text>
          </View>
          <View
            style={{
              ...theme.viewStyles.cardViewStyle,
              margin: 20,
              shadowRadius: 2,
            }}
          >
            <View
              style={{
                overflow: 'hidden',
                borderRadius: 10,
              }}
            >
              {clinic.image && (
                <Image
                  source={{ uri: clinic.image }}
                  style={{
                    height: 136,
                    width: '100%',
                  }}
                />
              )}

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
                  {clinic.addressLine1}
                  {clinic.addressLine2
                    ? `${clinic.addressLine1 ? ', ' : ''}${clinic.addressLine2}`
                    : ''}
                </Text>
                <Text
                  style={{
                    ...theme.fonts.IBMPlexSansMedium(14),
                    color: theme.colors.LIGHT_BLUE,
                  }}
                >
                  {clinic.city}
                </Text>
                {doctorDetails.consultationHours && (
                  <>
                    <View style={[styles.separatorStyle, { marginVertical: 8 }]} />

                    {doctorDetails.consultationHours.map((time) => (
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
                          {time.days.toUpperCase()}
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
                    ))}
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

  const renderDoctorTeam = () => {
    // const startDoctor = string.home.startDoctor;
    if (doctorDetails)
      return (
        <View style={styles.cardView}>
          <View style={styles.labelView}>
            <Text style={styles.labelStyle}>
              {doctorDetails.profile.salutation}. {doctorDetails.profile.firstName}’s Team
            </Text>
            <Text style={styles.labelStyle}>{doctorDetails.starDoctorTeam!.length} Doctors</Text>
          </View>
          <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false}>
            <FlatList
              key={doctorDetails.starDoctorTeam!.length / 2}
              contentContainerStyle={{ padding: 12 }}
              // horizontal={true}
              data={doctorDetails.starDoctorTeam ? doctorDetails.starDoctorTeam : []}
              bounces={false}
              numColumns={doctorDetails.starDoctorTeam!.length / 2}
              renderItem={({ item }) => (
                <View style={{ width: 320 }}>
                  <DoctorCard
                    rowData={item}
                    navigation={props.navigation}
                    displayButton={false}
                    style={{
                      marginVertical: 8,
                      marginHorizontal: 10,

                      shadowRadius: 3,
                    }}
                  />
                </View>
              )}
            />
          </ScrollView>
        </View>
      );
    return null;
  };

  const renderAppointmentHistory = () => {
    const arrayHistory = appointmentHistory ? appointmentHistory : [];
    // console.log('arrayHistory', arrayHistory);
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
            // horizontal={true}
            contentContainerStyle={{
              marginVertical: 12,
            }}
            data={arrayHistory}
            renderItem={({ item }) => (
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
                      : item.appointmentType + ' VISIT'
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
                  {Moment(item.appointmentDate).format('DD MMMM')}
                  {' , '}
                  {formatTime(item.appointmentTime)}
                </Text>
                <View style={styles.separatorStyle} />
                <View style={{ flexDirection: 'row' }}>
                  {Appointments[0].symptoms.map((name) => (
                    <CapsuleView
                      title={name}
                      isActive={false}
                      style={{ width: 'auto', marginRight: 4, marginTop: 11 }}
                      titleTextStyle={{ color: theme.colors.SKY_BLUE }}
                    />
                  ))}
                </View>
              </View>
            )}
          />
        </View>
      );
    }
  };

  // console.log(props.navigation.state.params!.doctorId, 'doctorIddoctorIddoctorId');
  const { data, error } = useQuery<getDoctorProfileById, getDoctorProfileByIdVariables>(
    GET_DOCTOR_PROFILE_BY_ID,
    {
      // variables: { id: 'a6ef960c-fc1f-4a12-878a-12063788d625' },
      variables: { id: props.navigation.state.params!.doctorId },
    }
  );
  if (error) {
    ``;
    console.log('error', error);
  } else {
    console.log('data details', data);
    if (data && data.getDoctorProfileById && doctorDetails !== data.getDoctorProfileById) {
      setDoctorDetails(data.getDoctorProfileById);
      setDoctorId(data.getDoctorProfileById.profile.id);
      setshowSpinner(false);
    }
  }

  const handleScroll = () => {
    // console.log(e, 'jvjhvhm');
  };

  console.log(dispalyoverlay, 'dispalyoverlay', doctorDetails);
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={{
          ...theme.viewStyles.container,
        }}
      >
        {/* <Header
          container={{
            zIndex: 3,
            position: 'absolute',
            top: Platform.OS === 'ios' ? (height === 812 || height === 896 ? 40 : 20) : 0,
            left: 0,
            right: 0,
            // height: 56,
            backgroundColor: 'transparent',
            borderBottomWidth: 0,
          }}
          leftIcon="backArrowWhite"
          rightComponent={<ShareWhite />}
          onPressLeftIcon={() => props.navigation.goBack()}
        /> */}
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
            // {
            //   useNativeDriver: true,
            // }
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
              title={'BOOK CONSULTATION'}
              onPress={() => setdispalyoverlay(true)}
              style={{ marginHorizontal: 60, flex: 1 }}
            />
          </StickyBottomComponent>
        )}
      </SafeAreaView>

      {dispalyoverlay && doctorDetails && (
        <ConsultOverlay
          setdispalyoverlay={() => setdispalyoverlay(false)}
          navigation={props.navigation}
          doctor={doctorDetails.profile ? doctorDetails.profile : null}
          patientId={currentPatient ? currentPatient.id : ''}
          clinics={doctorDetails.clinics ? doctorDetails.clinics : []}
        />
      )}
      {showSpinner && <Spinner />}
      <Animated.View
        style={{
          position: 'absolute',
          height: 160,
          width: '100%',
          top: 20,
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
          {doctorDetails && doctorDetails.profile && doctorDetails.profile.photoUrl && (
            <Animated.Image
              source={{ uri: doctorDetails.profile.photoUrl }}
              style={{ top: 10, height: 180, width: '100%', opacity: imgOp }}
            />
          )}
        </View>
      </Animated.View>
      <Header
        container={{
          zIndex: 3,
          position: 'absolute',
          top: Platform.OS === 'ios' ? (height === 812 || height === 896 ? 40 : 20) : 0,
          left: 0,
          right: 0,
          height: 56,
          backgroundColor: 'transparent',
          borderBottomWidth: 0,
        }}
        leftIcon="backArrowWhite"
        rightComponent={<ShareWhite />}
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    </View>
  );
};
