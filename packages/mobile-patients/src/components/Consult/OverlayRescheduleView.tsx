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
  APPOINTMENT_STATE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { divideSlots, handleGraphQlError } from '@aph/mobile-patients/src/helpers/helperFunctions';
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
} from '@aph/mobile-patients/src/graphql/types/checkIfReschedule';

import {
  BookFollowUpAppointment,
  BookFollowUpAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/BookFollowUpAppointment';
import { StackActions } from 'react-navigation';
import { NavigationActions } from 'react-navigation';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

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
  isInitiatedByDoctor: boolean;
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
  const [showOfflinePopup, setshowOfflinePopup] = useState<boolean>(false);
  const [
    selectedClinic,
    setselectedClinic,
  ] = useState<getDoctorDetailsById_getDoctorDetailsById_doctorHospital | null>(
    props.clinics && props.clinics.length > 0 ? props.clinics[0] : null
  );

  const scrollViewRef = React.useRef<any>(null);

  const scrollToSlots = (top: number = 400) => {
    scrollViewRef.current && scrollViewRef.current.scrollTo({ x: 0, y: top, animated: true });
  };

  const setTimeArrayData = (availableSlots: string[]) => {
    const array = divideSlots(availableSlots, date);
    // console.log(array, 'array', timeArray, 'timeArray.......');
    if (array !== timeArray) settimeArray(array);
  };

  const availableDate = date.toISOString().split('T')[0];

  console.log(props.bookFollowUp, 'bookFollowUp');
  console.log(props.rescheduleCount, 'propsrescheduleCount');
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

  const navigateToView = () => {
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.TabBar })],
      })
    );
  };

  const navigateToViewRescdule = (data: any) => {
    AsyncStorage.setItem('showSchduledPopup', 'true');
    console.log('navigateToView', data);
    console.log('doctorname', props.doctor);
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [
          NavigationActions.navigate({
            routeName: AppRoutes.TabBar,
            params: {
              Data:
                data &&
                data.bookRescheduleAppointment &&
                data.bookRescheduleAppointment.appointmentDetails,
              DoctorName:
                props.navigation.state.params!.data &&
                props.navigation.state.params!.data.doctorInfo &&
                props.navigation.state.params!.data.doctorInfo.firstName,
            },
          }),
        ],
      })
    );
  };

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
                CommonLogEvent('OVERLAY_RESCHEDULE', 'OverlayReschduleView_Clicked');
                if (props.KeyFollow !== 'RESCHEDULE') {
                  const doctorClinics = props.clinics.filter((item) => {
                    if (item && item.facility && item.facility.facilityType)
                      return item.facility.facilityType === 'HOSPITAL';
                  });

                  const hospitalId = isConsultOnline
                    ? doctorClinics.length > 0 && doctorClinics[0].facility
                      ? doctorClinics[0].facility.id
                      : ''
                    : selectedClinic
                    ? selectedClinic.facility.id
                    : '';

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
                    hospitalId: hospitalId,
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
                      navigateToView();
                    })
                    .catch((e: any) => {
                      CommonBugFender('OverlayRescheduleView_BOOK_FOLLOWUP_APPOINTMENT', e);
                      console.log('Error occured while BookFollowUpAppointment ', { e });
                      handleGraphQlError(e);
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
                    initiatedBy:
                      props.data.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE
                        ? TRANSFER_INITIATED_TYPE.DOCTOR
                        : props.isInitiatedByDoctor
                        ? TRANSFER_INITIATED_TYPE.DOCTOR
                        : TRANSFER_INITIATED_TYPE.PATIENT,
                    initiatedId:
                      props.data.appointmentState == APPOINTMENT_STATE.AWAITING_RESCHEDULE
                        ? props.doctorId
                        : props.isInitiatedByDoctor
                        ? props.doctorId
                        : props.patientId,
                    patientId: props.patientId,
                    rescheduledId: '',
                  };
                  console.log(appointmentInput, 'bookAppointmentReschedule');
                  mutate({
                    variables: {
                      bookRescheduleAppointmentInput: appointmentInput,
                    },
                    fetchPolicy: 'no-cache',
                  });
                }
              }}
            >
              {data
                ? (console.log('bookAppointment data', data),
                  props.setdisplayoverlay(false),
                  setshowSpinner(false),
                  setshowSuccessPopUp(true),
                  navigateToViewRescdule(data))
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
            <ScrollView bounces={false} ref={scrollViewRef}>
              {props.renderTab === 'Consult Online' ? (
                <ConsultDoctorOnline
                  doctor={props.doctor}
                  timeArray={timeArray}
                  date={date}
                  setDate={(date) => {
                    console.log(date, 'setDate');
                    setDate(date);
                  }}
                  nextAvailableSlot={nextAvailableSlot}
                  setNextAvailableSlot={setNextAvailableSlot}
                  isConsultOnline={isConsultOnline}
                  setisConsultOnline={setisConsultOnline}
                  setavailableInMin={setavailableInMin}
                  availableInMin={availableInMin}
                  setselectedTimeSlot={setselectedTimeSlot}
                  selectedTimeSlot={selectedTimeSlot}
                  scrollToSlots={scrollToSlots}
                  setshowOfflinePopup={setshowOfflinePopup}
                  setshowSpinner={setshowSpinner}
                />
              ) : (
                <ConsultPhysical
                  doctor={props.doctor}
                  clinics={props.clinics}
                  setDate={(date) => {
                    console.log(date, 'setDate');
                    setDate(date);
                    scrollToSlots(350);
                  }}
                  setselectedTimeSlot={setselectedTimeSlot}
                  selectedTimeSlot={selectedTimeSlot}
                  date={date}
                  scrollToSlots={scrollToSlots}
                  setshowOfflinePopup={setshowOfflinePopup}
                  setshowSpinner={setshowSpinner}
                  setselectedClinic={setselectedClinic}
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
