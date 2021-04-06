import { ConsultDoctorOnline } from '@aph/mobile-patients/src/components/Consult/ConsultDoctorOnline';
import { ConsultPhysical } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultPhysical';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import {
  GET_AVAILABLE_SLOTS,
  BOOK_APPOINTMENT_RESCHEDULE,
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
  BookRescheduleAppointmentInput,
  TRANSFER_INITIATED_TYPE,
  APPOINTMENT_STATE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { divideSlots, handleGraphQlError } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { Mutation } from 'react-apollo';
import { useQuery, useApolloClient } from 'react-apollo-hooks';
import { Dimensions, Platform, Text, TouchableOpacity, View, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

import {
  BookFollowUpAppointment,
  BookFollowUpAppointmentVariables,
} from '@aph/mobile-patients/src/graphql/types/BookFollowUpAppointment';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import AsyncStorage from '@react-native-community/async-storage';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { navigateToScreenWithEmptyStack } from '@aph/mobile-patients/src/helpers/helperFunctions';

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
    if (array !== timeArray) settimeArray(array);
  };

  const availableDate = date.toISOString().split('T')[0];

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
  } else {
    if (
      availabilityData &&
      availabilityData.data &&
      availabilityData.data.getDoctorAvailableSlots &&
      availabilityData.data.getDoctorAvailableSlots.availableSlots &&
      availableSlots !== availabilityData.data.getDoctorAvailableSlots.availableSlots
    ) {
      setTimeArrayData(availabilityData.data.getDoctorAvailableSlots.availableSlots);
      setavailableSlots(availabilityData.data.getDoctorAvailableSlots.availableSlots);
    }
  }

  const navigateToView = () => {
    navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar);
  };

  const navigateToViewRescdule = (data: any) => {
    AsyncStorage.setItem('showSchduledPopup', 'true');
    const params = {
      Data: data?.bookRescheduleAppointment?.appointmentDetails,
      DoctorName: props.navigation.state.params?.data?.doctorInfo?.fullName,
    };
    navigateToScreenWithEmptyStack(props.navigation, AppRoutes.TabBar, params);
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
                    ? `PAY ${string.common.Rs} ${convertNumberToDecimal(
                        props?.data?.doctorInfo?.onlineConsultationFees
                      )}`
                    : `CONFIRM RESCHEDULE`
                  : props.isfollowupcount === 1
                  ? `PAY ${string.common.Rs} ${convertNumberToDecimal(
                      Number(props?.doctor?.onlineConsultationFees)
                    )}`
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
                  const input = {
                    patientId: props.patientId,
                    doctorId: props.doctorId,
                    appointmentDateTime: timeSlot,
                    appointmentType: APPOINTMENT_TYPE.ONLINE,
                    hospitalId: hospitalId,
                    followUpParentId: props.appointmentId,
                  };
                  client
                    .mutate<BookFollowUpAppointment, BookFollowUpAppointmentVariables>({
                      mutation: BOOK_FOLLOWUP_APPOINTMENT,
                      variables: {
                        followUpAppointmentInput: input,
                      },
                      fetchPolicy: 'no-cache',
                    })
                    .then((_data: any) => {
                      navigateToView();
                    })
                    .catch((e: any) => {
                      CommonBugFender('OverlayRescheduleView_BOOK_FOLLOWUP_APPOINTMENT', e);
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
                ? (props.setdisplayoverlay(false),
                  setshowSpinner(false),
                  setshowSuccessPopUp(true),
                  navigateToViewRescdule(data))
                : null}
              {error ? <></> : null}
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
            style={{
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              marginTop: 16,
              width: width - 40,
              height: 'auto',
              maxHeight: height - 98,
              padding: 0,
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
