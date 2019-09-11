import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Location, More } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  AsyncStorage,
  Alert,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import moment from 'moment';
import { ReschedulePopUp } from '@aph/mobile-patients/src/components/Consult/ReschedulePopUp';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  CANCEL_APPOINTMENT,
  NEXT_AVAILABLE_SLOT,
  BOOK_APPOINTMENT_RESCHEDULE,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  cancelAppointment,
  cancelAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/cancelAppointment';
import { GetDoctorNextAvailableSlot } from '@aph/mobile-patients/src/graphql/types/GetDoctorNextAvailableSlot';
import { TRANSFER_INITIATED_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  bookRescheduleAppointment,
  bookRescheduleAppointmentVariables,
} from '../../graphql/types/bookRescheduleAppointment';
import { Spinner } from '../ui/Spinner';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  imageView: {
    width: 80,
    marginLeft: 20,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 2,
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  timeStyle: {
    paddingBottom: 20,
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SKY_BLUE,
  },
  labelStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 3.5,
  },
  descriptionStyle: {
    paddingTop: 7.5,
    paddingBottom: 16,
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SKY_BLUE,
  },
  labelViewStyle: {
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gotItStyles: {
    height: 60,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.viewStyles.yellowTextStyle,
  },
});

export interface AppointmentDetailsProps extends NavigationScreenProps {}

export const AppointmentDetails: React.FC<AppointmentDetailsProps> = (props) => {
  const data = props.navigation.state.params!.data;
  const doctorDetails = data.doctorInfo;
  console.log('doctorDetails', doctorDetails);

  // console.log(
  //   props.navigation.state.params!.data,
  //   data.doctorInfo.doctorHospital[0].facility.streetLine1
  // );
  const dateIsAfter = moment(data.appointmentDateTime).isAfter(moment(new Date()));
  console.log('dateIsAfter', dateIsAfter);
  const [cancelAppointment, setCancelAppointment] = useState<boolean>(false);
  const [showCancelPopup, setShowCancelPopup] = useState<boolean>(false);
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [resheduleoverlay, setResheduleoverlay] = useState<boolean>(false);
  const [deviceTokenApICalled, setDeviceTokenApICalled] = useState<boolean>(false);
  const [rescheduleApICalled, setRescheduleApICalled] = useState<boolean>(false);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [newRescheduleCount, setNewRescheduleCount] = useState<number>(0);
  const [belowThree, setBelowThree] = useState<boolean>(false);

  const [bottompopup, setBottompopup] = useState<boolean>(false);
  const client = useApolloClient();

  useEffect(() => {
    console.log('calculateCount');

    let calculateCount = data.rescheduleCount ? data.rescheduleCount : '';

    if (calculateCount > 3) {
      calculateCount = Math.floor(calculateCount / 3);
      setBelowThree(true);
      console.log('calculateCount', calculateCount);
    } else {
      setBelowThree(false);
    }

    setNewRescheduleCount(calculateCount);
  });

  useEffect(() => {
    const dateValidate = moment(moment().format('YYYY-MM-DD')).diff(
      moment(data.appointmentDateTime).format('YYYY-MM-DD')
    );
    console.log('dateValidate', dateValidate);

    if (dateValidate == 0) {
      const time = `Today, ${moment
        .utc(data.appointmentDateTime)
        .local()
        .format('hh:mm a')}`;
      setAppointmentTime(time);
    } else {
      const time = `${moment
        .utc(data.appointmentDateTime)
        .local()
        .format('DD MMM h:mm A')}`;
      setAppointmentTime(time);
    }
  }, []);
  const todayDate = moment
    .utc(data.appointmentDateTime)
    .local()
    .format('YYYY-MM-DD'); //data.appointmentDateTime; //
  console.log('todayDate', todayDate);

  const availability = useQuery<GetDoctorNextAvailableSlot>(NEXT_AVAILABLE_SLOT, {
    fetchPolicy: 'no-cache',
    variables: {
      DoctorNextAvailableSlotInput: {
        doctorIds: doctorDetails ? [doctorDetails.id] : [],
        availableDate: todayDate,
      },
    },
  });
  if (availability.error) {
    console.log('error', availability.error);
  } else {
    console.log(availability.data!, 'availabilityData', 'availableSlots');
    //setNexttime(availability.data.getDoctorAvailableSlots)
  }
  const rescheduleAPI = (availability: any) => {
    const bookRescheduleInput = {
      appointmentId: data.id,
      doctorId: doctorDetails.id,
      newDateTimeslot: availability.data!.getDoctorNextAvailableSlot!.doctorAvailalbeSlots[0]
        .availableSlot,
      initiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
      initiatedId: data.patientId,
      patientId: data.patientId,
      rescheduledId: '',
    };

    console.log(bookRescheduleInput, 'bookRescheduleInput');
    if (!rescheduleApICalled) {
      setRescheduleApICalled(true);
      client
        .mutate<bookRescheduleAppointment, bookRescheduleAppointmentVariables>({
          mutation: BOOK_APPOINTMENT_RESCHEDULE,
          variables: {
            bookRescheduleAppointmentInput: bookRescheduleInput,
          },
          fetchPolicy: 'no-cache',
        })
        .then((data: any) => {
          console.log(data, 'data');
          setshowSpinner(false);
          props.navigation.replace(AppRoutes.TabBar, {
            Data:
              data.data &&
              data.data.bookRescheduleAppointment &&
              data.data.bookRescheduleAppointment.appointmentDetails,
          });
        })
        .catch((e: string) => {
          setBottompopup(true);
          // console.log('Error occured while accept appid', e);
          // const error = JSON.parse(JSON.stringify(e));
          // const errorMessage = error && error.message;
          // console.log('Error occured while accept appid', errorMessage, error);
          // Alert.alert(
          //   'Error',
          //   'Opps ! The selected slot is unavailable. Please choose a different one'
          // );
        });
    }
  };
  const acceptChange = () => {
    try {
      console.log('acceptChange');
      setResheduleoverlay(false);
      AsyncStorage.setItem('showSchduledPopup', 'true');
      setshowSpinner(true);
      rescheduleAPI(availability);
    } catch (error) {
      console.log(error, 'error');
    }
  };

  const reshedulePopUpMethod = () => {
    setdisplayoverlay(true), setResheduleoverlay(false);
  };

  const cancelAppointmentApi = () => {
    const appointmentTransferInput = {
      appointmentId: data.id,
      cancelReason: '',
      cancelledBy: TRANSFER_INITIATED_TYPE.PATIENT, //appointmentDate,
      cancelledById: data.patientId,
    };

    console.log(appointmentTransferInput, 'appointmentTransferInput');
    if (!deviceTokenApICalled) {
      setDeviceTokenApICalled(true);
      client
        .mutate<cancelAppointment, cancelAppointmentVariables>({
          mutation: CANCEL_APPOINTMENT,
          variables: {
            cancelAppointmentInput: appointmentTransferInput,
          },
          fetchPolicy: 'no-cache',
        })
        .then((data: any) => {
          setshowSpinner(false);
          console.log(data, 'data');
          props.navigation.replace(AppRoutes.TabBar);
        })
        .catch((e: string) => {
          setshowSpinner(false);
          console.log('Error occured while adding Doctor', e);
        });
    }
  };

  if (data.doctorInfo)
    return (
      <View
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Header
            title="UPCOMING CLINIC VISIT"
            leftIcon="backArrow"
            rightComponent={
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  setCancelAppointment(true);
                }}
              >
                <More />
              </TouchableOpacity>
            }
            onPressLeftIcon={() => props.navigation.goBack()}
          />
          <View
            style={{
              backgroundColor: theme.colors.CARD_BG,
              paddingTop: 20,
              paddingHorizontal: 20,
              ...theme.viewStyles.shadowStyle,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    ...theme.fonts.IBMPlexSansMedium(12),
                    color: theme.colors.SEARCH_EDUCATION_COLOR,
                    paddingBottom: 4,
                  }}
                >
                  #{data.id}
                </Text>
                <View style={styles.separatorStyle} />
                <Text style={styles.doctorNameStyle}>Dr. {data.doctorInfo.firstName}</Text>
                <Text style={styles.timeStyle}>{appointmentTime}</Text>
                <View style={styles.labelViewStyle}>
                  <Text style={styles.labelStyle}>Location</Text>
                  <Location />
                </View>
                <View style={styles.separatorStyle} />
                <Text style={styles.descriptionStyle}>
                  {data.doctorInfo &&
                  data.doctorInfo.doctorHospital &&
                  data.doctorInfo.doctorHospital.length > 0 &&
                  data.doctorInfo.doctorHospital[0].facility
                    ? `${data.doctorInfo.doctorHospital[0].facility.streetLine1} ${data.doctorInfo.doctorHospital[0].facility.city}`
                    : ''}
                </Text>
                <View style={styles.labelViewStyle}>
                  <Text style={styles.labelStyle}>Average Waiting Time</Text>
                </View>
                <View style={styles.separatorStyle} />
                <Text style={styles.descriptionStyle}>40 mins</Text>
                <View style={styles.labelViewStyle}>
                  <Text style={styles.labelStyle}>Payment</Text>
                  <Text style={theme.viewStyles.yellowTextStyle}>INVOICE</Text>
                </View>
                <View style={styles.separatorStyle} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.descriptionStyle}>Advance Paid</Text>
                  <Text style={styles.descriptionStyle}>200</Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.descriptionStyle}>Balance Remaining</Text>
                  <Text style={styles.descriptionStyle}>299</Text>
                </View>
              </View>
              <View style={styles.imageView}>
                {data.doctorInfo.photoUrl && (
                  <Image
                    source={{ uri: data.doctorInfo.photoUrl }}
                    style={{
                      width: 80,
                      height: 80,
                    }}
                  />
                )}
              </View>
            </View>
          </View>
          <StickyBottomComponent defaultBG style={{ paddingHorizontal: 0 }}>
            <Button
              title={'RESCHEDULE'}
              style={{
                flex: 0.5,
                marginLeft: 20,
                marginRight: 8,
                backgroundColor: 'white',
              }}
              titleTextStyle={{ color: '#fc9916', opacity: dateIsAfter ? 1 : 0.5 }}
              onPress={() => {
                dateIsAfter ? setResheduleoverlay(true) : null;
              }}
            />
            <Button
              title={'START CONSULTATION'}
              style={{
                flex: 0.5,
                marginRight: 20,
                marginLeft: 8,
              }}
              onPress={() => {
                props.navigation.navigate(AppRoutes.ChatRoom, {
                  data: data,
                });
              }}
            />
          </StickyBottomComponent>
        </SafeAreaView>
        {bottompopup && (
          <BottomPopUp
            title={'Hi:)'}
            description="Opps ! The selected slot is unavailable. Please choose a different one"
          >
            <View style={{ height: 60, alignItems: 'flex-end' }}>
              <TouchableOpacity
                style={{
                  height: 60,
                  paddingRight: 25,
                  backgroundColor: 'transparent',
                }}
                onPress={() => {
                  setBottompopup(false);
                }}
              >
                <Text
                  style={{
                    paddingTop: 16,
                    ...theme.viewStyles.yellowTextStyle,
                  }}
                >
                  OK, GOT IT
                </Text>
              </TouchableOpacity>
            </View>
          </BottomPopUp>
        )}
        {cancelAppointment && (
          <View
            style={{
              position: 'absolute',
              height: height,
              width: width,
              flex: 1,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setCancelAppointment(false);
              }}
            >
              <View
                style={{
                  margin: 0,
                  height: height,
                  width: width,
                  backgroundColor: 'transparent',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowCancelPopup(true);
                    setCancelAppointment(false);
                  }}
                >
                  <View
                    style={{
                      backgroundColor: 'white',
                      width: 201,
                      height: 55,
                      marginLeft: width - 221,
                      marginTop: 64,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...theme.viewStyles.shadowStyle,
                    }}
                  >
                    <Text
                      style={{
                        backgroundColor: 'white',
                        color: '#02475b',
                        ...theme.fonts.IBMPlexSansMedium(16),
                        textAlign: 'center',
                      }}
                    >
                      Cancel Appointment
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}
        {showCancelPopup && (
          <BottomPopUp
            title={'Hi, Surj :)'}
            description={
              'Since you’re cancelling 15 minutes before your appointment, we’ll issue you a full refund!'
            }
          >
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 20,
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <View style={{ height: 60 }}>
                <TouchableOpacity
                  style={styles.gotItStyles}
                  onPress={() => {
                    setShowCancelPopup(false);
                    setdisplayoverlay(true);
                  }}
                >
                  <Text style={styles.gotItTextStyles}>{'RESCHEDULE INSTEAD'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 60 }}>
                <TouchableOpacity
                  style={styles.gotItStyles}
                  onPress={() => {
                    setShowCancelPopup(false);
                    setshowSpinner(true);
                    cancelAppointmentApi();
                  }}
                >
                  <Text style={styles.gotItTextStyles}>{'CANCEL CONSULT'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BottomPopUp>
        )}

        {displayoverlay && doctorDetails && (
          <OverlayRescheduleView
            setdisplayoverlay={() => setdisplayoverlay(false)}
            navigation={props.navigation}
            doctor={doctorDetails ? doctorDetails : null}
            patientId={currentPatient ? currentPatient.id : ''}
            clinics={doctorDetails.doctorHospital ? doctorDetails.doctorHospital : []}
            doctorId={doctorDetails && doctorDetails.id}
            renderTab={'Visit Clinic'}
            rescheduleCount={newRescheduleCount}
            appointmentId={data.id}
            data={data}
          />
        )}
        {resheduleoverlay && doctorDetails && (
          <ReschedulePopUp
            setResheduleoverlay={() => setResheduleoverlay(false)}
            navigation={props.navigation}
            doctor={doctorDetails ? doctorDetails : null}
            patientId={currentPatient ? currentPatient.id : ''}
            clinics={doctorDetails.doctorHospital ? doctorDetails.doctorHospital : []}
            doctorId={doctorDetails && doctorDetails.id}
            isbelowthree={belowThree}
            setdisplayoverlay={() => reshedulePopUpMethod()}
            acceptChange={() => acceptChange()}
            appadatetime={props.navigation.state.params!.data.appointmentDateTime}
            reschduleDateTime={availability.data}
            rescheduleCount={newRescheduleCount}
            data={data}
          />
        )}
        {showSpinner && <Spinner />}
      </View>
    );

  return null;
};
