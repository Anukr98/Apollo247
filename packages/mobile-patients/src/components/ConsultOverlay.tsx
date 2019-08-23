import { ConsultOnline } from '@aph/mobile-patients/src/components/ConsultOnline';
import { ConsultPhysical } from '@aph/mobile-patients/src/components/ConsultPhysical';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { BOOK_APPOINTMENT, GET_AVAILABLE_SLOTS } from '@aph/mobile-patients/src/graphql/profiles';
import { bookAppointment } from '@aph/mobile-patients/src/graphql/types/bookAppointment';
import { getDoctorAvailableSlots } from '@aph/mobile-patients/src/graphql/types/getDoctorAvailableSlots';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  APPOINTMENT_TYPE,
  BookAppointmentInput,
  DoctorType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useState } from 'react';
import { Mutation } from 'react-apollo';
import { useQuery } from 'react-apollo-hooks';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  gotItStyles: {
    height: 60,
    paddingRight: 25,
    backgroundColor: 'transparent',
  },
  gotItTextStyles: {
    paddingTop: 16,
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 24,
    color: '#fc9916',
  },
});

type TimeArray = {
  label: string;
  time: string[];
}[];

export interface ConsultOverlayProps extends NavigationScreenProps {
  // dispalyoverlay: boolean;
  setdisplayoverlay: (arg0: boolean) => void;
  // setdisplayoverlay: () => void;
  patientId: string;
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  clinics: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  doctorId: string;
  // availableSlots: string[] | null;
}
export const ConsultOverlay: React.FC<ConsultOverlayProps> = (props) => {
  const tabs =
    props.doctor!.doctorType !== DoctorType.PAYROLL
      ? [{ title: 'Consult Online' }, { title: 'Visit Clinic' }]
      : [{ title: 'Consult Online' }];

  const [timeArray, settimeArray] = useState<TimeArray>([
    { label: 'Morning', time: [] },
    { label: 'Afternoon', time: [] },
    { label: 'Evening', time: [] },
    { label: 'Night', time: [] },
  ]);

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>('');

  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [nextAvailableSlot, setNextAvailableSlot] = useState<string>('');
  const [isConsultOnline, setisConsultOnline] = useState<boolean>(true);
  const [availableInMin, setavailableInMin] = useState<Number>(0);
  const [showSuccessPopUp, setshowSuccessPopUp] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [availableSlots, setavailableSlots] = useState<string[] | null>([]);

  const setTimeArrayData = (availableSlots: string[]) => {
    const array: TimeArray = [
      { label: 'Morning', time: [] },
      { label: 'Afternoon', time: [] },
      { label: 'Evening', time: [] },
      { label: 'Night', time: [] },
    ];
    console.log(availableSlots, 'setTimeArrayData');
    const morningStartTime = moment('06:00', 'HH:mm');
    const morningEndTime = moment('12:00', 'HH:mm');
    const afternoonStartTime = moment('12:01', 'HH:mm');
    const afternoonEndTime = moment('17:00', 'HH:mm');
    const eveningStartTime = moment('17:01', 'HH:mm');
    const eveningEndTime = moment('21:00', 'HH:mm');
    const nightStartTime = moment('21:01', 'HH:mm');
    const nightEndTime = moment('05:59', 'HH:mm');

    availableSlots.forEach((slot) => {
      const IOSFormat = `${date.toISOString().split('T')[0]}T${slot}:00.000Z`;
      const formatedSlot = moment(new Date(IOSFormat), 'HH:mm:ss.SSSz').format('HH:mm');
      console.log(
        new Date() < new Date(IOSFormat),
        new Date(),
        new Date(IOSFormat),
        'IOSFormat......'
      );
      const slotTime = moment(formatedSlot, 'HH:mm');
      if (new Date() < new Date(IOSFormat)) {
        if (slotTime.isBetween(nightEndTime, afternoonStartTime)) {
          array[0] = {
            label: 'Morning',
            time: [...array[0].time, slot],
          };
        } else if (slotTime.isBetween(morningEndTime, eveningStartTime)) {
          array[1] = {
            ...array[1],
            time: [...array[1].time, slot],
          };
        } else if (slotTime.isBetween(afternoonEndTime, nightStartTime)) {
          array[2] = {
            ...array[2],
            time: [...array[2].time, slot],
          };
        } else if (
          slotTime.isBetween(eveningEndTime, moment('23:59', 'HH:mm')) ||
          slotTime.isSame(moment('00:00', 'HH:mm')) ||
          slotTime.isBetween(moment('00:00', 'HH:mm'), morningStartTime)
        ) {
          array[3] = {
            ...array[3],
            time: [...array[3].time, slot],
          };
        }
      }
    });
    console.log(array, 'array', timeArray, 'timeArray');
    if (array !== timeArray) settimeArray(array);
  };

  const availableDate = date.toISOString().split('T')[0];
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
    console.log(availabilityData.data, 'availableSlots');
    if (
      availabilityData &&
      availabilityData.data &&
      availabilityData.data.getDoctorAvailableSlots &&
      availabilityData.data.getDoctorAvailableSlots.availableSlots &&
      availableSlots !== availabilityData.data.getDoctorAvailableSlots.availableSlots
    ) {
      setTimeArrayData(availabilityData.data.getDoctorAvailableSlots.availableSlots);
      console.log(availableSlots, 'availableSlots1111');

      setavailableSlots(availabilityData.data.getDoctorAvailableSlots.availableSlots);
    }
  }

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
        <Mutation<bookAppointment> mutation={BOOK_APPOINTMENT}>
          {(mutate, { loading, data, error }) => (
            <Button
              title={`PAY Rs. ${
                tabs[0].title === selectedTab
                  ? props.doctor!.onlineConsultationFees
                  : props.doctor!.physicalConsultationFees
              }`}
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
                setshowSpinner(true);
                const formatDate = date.toISOString().split('T')[0];
                const timeSlot =
                  tabs[0].title === selectedTab &&
                  isConsultOnline &&
                  availableInMin! <= 15 &&
                  0 < availableInMin!
                    ? nextAvailableSlot
                    : selectedTimeSlot;
                console.log(timeSlot, 'timeSlottimeSlot');
                const appointmentInput: BookAppointmentInput = {
                  patientId: props.patientId,
                  doctorId: props.doctor ? props.doctor.id : '',
                  appointmentDateTime: `${formatDate}T${timeSlot}:00.000Z`,
                  appointmentType:
                    selectedTab === tabs[0].title
                      ? APPOINTMENT_TYPE.ONLINE
                      : APPOINTMENT_TYPE.PHYSICAL,
                  hospitalId:
                    props.clinics && props.clinics.length > 0 && props.clinics[0].facility
                      ? props.clinics[0].facility.id
                      : '',
                };
                console.log(appointmentInput, 'appointmentInput');
                mutate({
                  variables: {
                    bookAppointment: appointmentInput,
                  },
                });
              }}
            >
              {data
                ? (console.log('bookAppointment data', data),
                  // props.setdisplayoverlay(false),
                  setshowSpinner(false),
                  setshowSuccessPopUp(true))
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
            <TabsComponent
              style={{
                ...theme.viewStyles.cardViewStyle,
                borderRadius: 0,
              }}
              data={tabs}
              onChange={(selectedTab: string) => {
                setDate(new Date());
                setselectedTab(selectedTab);
                setselectedTimeSlot('');
                setisConsultOnline(true);
                setisConsultOnline(selectedTab === tabs[0].title ? true : false);
              }}
              selectedTab={selectedTab}
            />
            <ScrollView bounces={false}>
              {selectedTab === tabs[0].title ? (
                <ConsultOnline
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
      {showSuccessPopUp && (
        <BottomPopUp
          title={'Appointment Confirmation'}
          description={`Your appointment has been successfully booked with Dr. ${
            props.doctor && props.doctor!.firstName ? props.doctor!.firstName : ''
          }`}
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={styles.gotItStyles}
              onPress={() => {
                setshowSuccessPopUp(false);
                props.navigation.replace(AppRoutes.TabBar);
              }}
            >
              <Text style={styles.gotItTextStyles}>GO TO CONSULT ROOM</Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
      {showSpinner && <Spinner />}
    </View>
  );
};
