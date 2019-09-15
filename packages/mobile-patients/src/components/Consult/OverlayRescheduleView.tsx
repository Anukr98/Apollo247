import { ConsultDoctorOnline } from '@aph/mobile-patients/src/components/Consult/ConsultDoctorOnline';
import { ConsultPhysical } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultPhysical';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import {
  BOOK_APPOINTMENT,
  GET_AVAILABLE_SLOTS,
  BOOK_APPOINTMENT_RESCHEDULE,
  CHECK_IF_RESCHDULE,
  BOOK_FOLLOWUP_APPOINTMENT,
} from '@aph/mobile-patients/src/graphql/profiles';
import { bookRescheduleAppointment } from '@aph/mobile-patients/src/graphql/types/bookRescheduleAppointment';
import { getDoctorAvailableSlots } from '@aph/mobile-patients/src/graphql/types/getDoctorAvailableSlots';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  APPOINTMENT_TYPE,
  BookAppointmentInput,
  BookRescheduleAppointmentInput,
  TRANSFER_INITIATED_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { divideSlots } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { Mutation } from 'react-apollo';
import { useQuery, useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View,
  Alert,
  AsyncStorage,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  checkIfReschedule,
  checkIfRescheduleVariables,
} from '../../graphql/types/checkIfReschedule';

import {
  BookFollowUpAppointment,
  BookFollowUpAppointmentVariables,
} from '../../graphql/types/BookFollowUpAppointment';

const { width, height } = Dimensions.get('window');

type TimeArray = {
  label: string;
  time: string[];
}[];

export interface OverlayRescheduleViewProps extends NavigationScreenProps {
  renderTab: string;
  setdisplayoverlay: (arg0: boolean) => void;
  patientId: string;
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  clinics: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  doctorId: string;
  rescheduleCount: any;
  appointmentId: string;
  data: any;
  bookFollowUp: boolean;
  KeyFollow: string;
  isfollowupcount: number;
  // availableSlots: string[] | null;
}
export const OverlayRescheduleView: React.FC<OverlayRescheduleViewProps> = (props) => {
  const tabs = [{ title: 'Reschedule' }];
  const client = useApolloClient();
  const [timeArray, settimeArray] = useState<TimeArray>([
    { label: 'Morning', time: [] },
    { label: 'Afternoon', time: [] },
    { label: 'Evening', time: [] },
    { label: 'Night', time: [] },
  ]);

  const [selectedTab, setselectedTab] = useState<string>(props.renderTab);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>('');

  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [nextAvailableSlot, setNextAvailableSlot] = useState<string>('');
  const [isConsultOnline, setisConsultOnline] = useState<boolean>(true);
  const [availableInMin, setavailableInMin] = useState<Number>(0);
  const [showSuccessPopUp, setshowSuccessPopUp] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [availableSlots, setavailableSlots] = useState<string[] | null>([]);

  const setTimeArrayData = (availableSlots: string[]) => {
    const array = divideSlots(availableSlots, date);
    // console.log(array, 'array', timeArray, 'timeArray.......');
    if (array !== timeArray) settimeArray(array);
  };

  const availableDate = date.toISOString().split('T')[0];

  console.log(props.bookFollowUp, 'bookFollowUp');
  console.log(props.rescheduleCount, 'rescheduleCount');
  console.log(props.data, 'back');

  console.log(availableDate, 'dateeeeeeee', props.doctorId, 'doctorId');
  const availabilityData = useQuery<getDoctorAvailableSlots>(GET_AVAILABLE_SLOTS, {
    fetchPolicy: 'no-cache',
    variables: {
      DoctorAvailabilityInput: {
        availableDate: availableDate,
        doctorId: props.doctorId,
      },
    },
  });

  if (availabilityData.error) {
    console.log('error', availabilityData.error);
  } else {
    // console.log(availabilityData.data, 'availableSlots');
    if (
      availabilityData &&
      availabilityData.data &&
      availabilityData.data.getDoctorAvailableSlots &&
      availabilityData.data.getDoctorAvailableSlots.availableSlots &&
      availableSlots !== availabilityData.data.getDoctorAvailableSlots.availableSlots
    ) {
      setTimeArrayData(availabilityData.data.getDoctorAvailableSlots.availableSlots);
      // console.log(availableSlots, 'availableSlots1111');

      setavailableSlots(availabilityData.data.getDoctorAvailableSlots.availableSlots);
    }
  }

  // const rescheduleAPI = () => {
  //   const appointmentTransferInput = {
  //     appointmentId: data.id,
  //     doctorId: doctorDetails.id,
  //     newDateTimeslot: '',
  //     initiatedBy: 'PATIENT',
  //     initiatedId: data.patientId,
  //     patientId: data.patientId,
  //     rescheduledId: '',
  //   };

  //   console.log(appointmentTransferInput, 'appointmentTransferInput');
  //   if (!rescheduleApICalled) {
  //     setRescheduleApICalled(true);
  //     client
  //       .mutate<bookTransferAppointment, bookTransferAppointmentVariables>({
  //         mutation: BOOK_APPOINTMENT_RESCHEDULE,
  //         variables: {
  //           bookRescheduleAppointmentInput: appointmentTransferInput,
  //         },
  //         fetchPolicy: 'no-cache',
  //       })
  //       .then((data: any) => {
  //         console.log(data, 'data');
  //         props.navigation.replace(AppRoutes.Consult);
  //       })
  //       .catch((e: string) => {
  //         console.log('Error occured while adding Doctor', e);
  //       });
  //   }
  // };

  const renderBottomButton = () => {
    return (
      <StickyBottomComponent
        defaultBG
        style={{
          paddingHorizontal: 16,
          height: 66,
          marginTop: 10,
        }}
      >
        <Mutation<bookRescheduleAppointment> mutation={BOOK_APPOINTMENT_RESCHEDULE}>
          {(mutate, { loading, data, error }) => (
            <Button
              title={
                props.KeyFollow == 'RESCHEDULE'
                  ? props.rescheduleCount.isPaid === 1
                    ? `PAY Rs. ${props.data.doctorInfo &&
                        props.data.doctorInfo.onlineConsultationFees &&
                        props.data.doctorInfo.onlineConsultationFees}`
                    : `CONFIRM RESCHEDULE`
                  : props.isfollowupcount === 1
                  ? `PAY Rs. ${props.doctor &&
                      props.doctor.onlineConsultationFees &&
                      props.doctor.onlineConsultationFees}`
                  : `BOOK FOLLOWUP`
              }
              disabled={
                tabs[0].title === selectedTab &&
                isConsultOnline &&
                availableInMin! <= 15 &&
                0 < availableInMin!
                  ? false
                  : selectedTimeSlot === ''
                  ? true
                  : false
              }
              onPress={() => {
                if (props.KeyFollow) {
                  const timeSlot =
                    tabs[0].title === selectedTab &&
                    isConsultOnline &&
                    availableInMin! <= 15 &&
                    0 < availableInMin!
                      ? nextAvailableSlot
                      : selectedTimeSlot;
                  console.log('bookfollowupapicalled');
                  const input = {
                    patientId: props.patientId,
                    doctorId: props.doctorId,
                    appointmentDateTime: timeSlot,
                    appointmentType: APPOINTMENT_TYPE.ONLINE,
                    hospitalId: '',
                    followUpParentId: props.appointmentId,
                  };
                  console.log('inputfollowup', props.appointmentId);
                  console.log('uin', input);
                  client
                    .mutate<BookFollowUpAppointment, BookFollowUpAppointmentVariables>({
                      mutation: BOOK_FOLLOWUP_APPOINTMENT,
                      variables: {
                        followUpAppointmentInput: input,
                      },
                      fetchPolicy: 'no-cache',
                    })
                    .then((_data: any) => {
                      console.log('BookFollowUpAppointment', _data);
                      props.navigation.navigate(AppRoutes.Consult);
                    })
                    .catch((e: any) => {
                      const error = JSON.parse(JSON.stringify(e));
                      const errorMessage = error && error.message;
                      console.log(
                        'Error occured while BookFollowUpAppointment ',
                        errorMessage,
                        error
                      );
                      Alert.alert('Error', errorMessage);
                    });
                } else {
                  setshowSpinner(true);
                  AsyncStorage.setItem('showbookfollowup', 'true');
                  const timeSlot =
                    tabs[0].title === selectedTab &&
                    isConsultOnline &&
                    availableInMin! <= 15 &&
                    0 < availableInMin!
                      ? nextAvailableSlot
                      : selectedTimeSlot;

                  const appointmentInput: BookRescheduleAppointmentInput = {
                    appointmentId: props.appointmentId,
                    doctorId: props.doctorId,
                    newDateTimeslot: timeSlot,
                    initiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
                    initiatedId: props.patientId,
                    patientId: props.patientId,
                    rescheduledId: '',
                  };
                  console.log(appointmentInput, 'appointmentInput');
                  mutate({
                    variables: {
                      bookRescheduleAppointmentInput: appointmentInput,
                    },
                  });
                }
              }}
            >
              {data
                ? (console.log('bookAppointment data', data),
                  props.setdisplayoverlay(false),
                  setshowSpinner(false),
                  setshowSuccessPopUp(true),
                  props.navigation.replace(AppRoutes.Consult))
                : null}
              {/* {loading ? setVerifyingPhoneNumber(false) : null} */}
              {error ? console.log('bookAppointment error', error, setshowSpinner(false)) : null}
            </Button>
          )}
        </Mutation>
      </StickyBottomComponent>
    );
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, .8)',
        zIndex: 5,
      }}
    >
      <View style={{ paddingHorizontal: showSpinner ? 0 : 20 }}>
        <View
          style={{
            // backgroundColor: 'white',
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            onPress={() => props.setdisplayoverlay(false)}
            style={{
              marginTop: Platform.OS === 'ios' ? 38 : 14,
              backgroundColor: 'white',
              height: 28,
              width: 28,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              marginRight: showSpinner ? 20 : 0,
            }}
          >
            <CrossPopup />
          </TouchableOpacity>
        </View>
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <View
            // isVisible={props.dispalyoverlay}
            // windowBackgroundColor="rgba(0, 0, 0, .41)"
            // overlayBackgroundColor={theme.colors.DEFAULT_BACKGROUND_COLOR}

            // onBackdropPress={() => props.setdisplayoverlay(false)}
            style={{
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              marginTop: 16,
              width: width - 40,
              height: 'auto',
              maxHeight: height - 98,
              padding: 0,
              // margin: 0,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 56,
                backgroundColor: 'white',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'rgba(2, 71, 91, 1)',
                  ...theme.fonts.IBMPlexSansMedium(16),
                  paddingTop: 18,
                  paddingBottom: 14,
                }}
              >
                Reschedule
              </Text>
            </View>
            <ScrollView bounces={false}>
              {props.renderTab === 'Consult Online' ? (
                <ConsultDoctorOnline
                  doctor={props.doctor}
                  timeArray={timeArray}
                  date={date}
                  setDate={setDate}
                  nextAvailableSlot={nextAvailableSlot}
                  setNextAvailableSlot={setNextAvailableSlot}
                  isConsultOnline={isConsultOnline}
                  setisConsultOnline={setisConsultOnline}
                  setavailableInMin={setavailableInMin}
                  availableInMin={availableInMin}
                  setselectedTimeSlot={setselectedTimeSlot}
                  selectedTimeSlot={selectedTimeSlot}
                />
              ) : (
                <ConsultPhysical
                  doctor={props.doctor}
                  clinics={props.clinics}
                  setDate={setDate}
                  setselectedTimeSlot={setselectedTimeSlot}
                  selectedTimeSlot={selectedTimeSlot}
                  timeArray={timeArray}
                  date={date}
                />
              )}
              <View style={{ height: 96 }} />
            </ScrollView>
            {renderBottomButton()}
          </View>
        </View>
      </View>
      {showSpinner && <Spinner />}
    </View>
  );
};
