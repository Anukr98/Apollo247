import { OverlayRescheduleView } from '@aph/mobile-patients/src/components/Consult/OverlayRescheduleView';
import { ReschedulePopUp } from '@aph/mobile-patients/src/components/Consult/ReschedulePopUp';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { More } from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { CANCEL_APPOINTMENT, NEXT_AVAILABLE_SLOT } from '@aph/mobile-patients/src/graphql/profiles';
import {
  cancelAppointment,
  cancelAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/cancelAppointment';
import { GetDoctorNextAvailableSlot } from '@aph/mobile-patients/src/graphql/types/GetDoctorNextAvailableSlot';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  AsyncStorage,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationScreenProps } from 'react-navigation';
import { TRANSFER_INITIATED_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';

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

export interface AppointmentOnlineDetailsProps extends NavigationScreenProps {}

export const AppointmentOnlineDetails: React.FC<AppointmentOnlineDetailsProps> = (props) => {
  const data = props.navigation.state.params!.data;
  const doctorDetails = data.doctorInfo;
  console.log('doctorDetails', data.appointmentDateTime);

  const [cancelAppointment, setCancelAppointment] = useState<boolean>(false);
  const [showCancelPopup, setShowCancelPopup] = useState<boolean>(false);
  const [displayoverlay, setdisplayoverlay] = useState<boolean>(false);
  const [resheduleoverlay, setResheduleoverlay] = useState<boolean>(false);
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [deviceTokenApICalled, setDeviceTokenApICalled] = useState<boolean>(false);
  const [rescheduleApICalled, setRescheduleApICalled] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();

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

    // availabilitySlots();
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
  }

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
          console.log(data, 'data');
          props.navigation.replace(AppRoutes.Consult);
        })
        .catch((e: string) => {
          console.log('Error occured while adding Doctor', e);
        });
    }
  };

  const acceptChange = () => {
    console.log('acceptChange');
    setResheduleoverlay(false);
    AsyncStorage.setItem('showSchduledPopup', 'true');
    props.navigation.goBack();
  };

  const reshedulePopUpMethod = () => {
    setdisplayoverlay(true), setResheduleoverlay(false);
  };

  // const checkingAppointmentDates = () => {
  //   const currentTime = moment(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(
  //     'YYYY-MM-DD HH:mm:ss'
  //   );

  //   const appointmentTime = moment.utc(data.appointmentDateTime).format('YYYY-MM-DD HH:mm:ss');

  //   const diff = moment.duration(moment(appointmentTime).diff(currentTime));
  //   let diffInHours = diff.asMinutes();
  //   console.log('duration', diffInHours);
  //   console.log('appointmentTime', appointmentTime);

  //   if (diffInHours > 0) {
  //   } else {
  //     diffInHours = diffInHours * 60;
  //     console.log('duration', diffInHours);

  //     const startingTime = 900 + diffInHours;
  //     console.log('startingTime', startingTime);

  //     if (startingTime > 0) {
  //     }
  //   }
  // };

  if (data.doctorInfo)
    return (
      <View
        style={{
          ...theme.viewStyles.container,
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Header
            title="UPCOMING ONLINE VISIT"
            leftIcon="backArrow"
            rightComponent={
              <TouchableOpacity
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
                  <Text style={styles.labelStyle}>Payment</Text>
                  <Text style={theme.viewStyles.yellowTextStyle}>BILL</Text>
                </View>
                <View style={styles.separatorStyle} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.descriptionStyle}>Amount Paid</Text>
                  <Text style={styles.descriptionStyle}>299</Text>
                </View>
              </View>
              <View style={styles.imageView}>
                {data.doctorInfo.photoUrl ? (
                  <Image
                    source={{ uri: data.doctorInfo.photoUrl }}
                    style={{
                      width: 80,
                      height: 80,
                    }}
                  />
                ) : null}
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
              titleTextStyle={{ color: '#fc9916' }}
              onPress={() => {
                setResheduleoverlay(true);
              }}
            />
            <Button
              title={'FILL CASE SHEET'}
              style={{ flex: 0.5, marginRight: 20, marginLeft: 8 }}
              onPress={() => {
                props.navigation.navigate(AppRoutes.ChatRoom, {
                  data: data,
                });
              }}
            />
          </StickyBottomComponent>
        </SafeAreaView>
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
                style={{ margin: 0, height: height, width: width, backgroundColor: 'transparent' }}
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
                    setResheduleoverlay(true);
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
                    // checkingAppointmentDates();
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
            renderTab={'Consult Online'}
            rescheduleCount={data.rescheduleCount}
            appointmentId={data.id}
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
            isbelowthree={false}
            setdisplayoverlay={() => reshedulePopUpMethod()}
            acceptChange={() => acceptChange()}
            appadatetime={props.navigation.state.params!.data.appointmentDateTime}
            reschduleDateTime={availability.data}
          />
        )}
      </View>
    );
  return null;
};
