import { ConsultOnline } from '@aph/mobile-patients/src/components/ConsultOnline';
import { ConsultPhysical } from '@aph/mobile-patients/src/components/ConsultPhysical';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  Afternoon,
  AfternoonUnselected,
  CrossPopup,
  Evening,
  EveningUnselected,
  Morning,
  MorningUnselected,
  Night,
  NightUnselected,
} from '@aph/mobile-patients/src/components/ui/Icons';
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
  selectedButtonView: {
    backgroundColor: theme.colors.APP_GREEN,
  },
  selectedButtonText: {
    color: theme.colors.WHITE,
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
  },
  buttonStyle: {
    width: 'auto',
    marginRight: 8,
    marginTop: 12,
    backgroundColor: theme.colors.WHITE,
  },
  buttonTextStyle: {
    paddingHorizontal: 12,
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(16),
  },
  placeholderTextStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 7,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  horizontalSeparatorStyle: {
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(2, 71, 91, 0.3)',
    marginHorizontal: 16,
    marginBottom: 5,
  },
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

const monthsArray = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'June',
  'July',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
export interface ConsultOverlayProps extends NavigationScreenProps {
  // dispalyoverlay: boolean;
  setdispalyoverlay: (arg0: boolean) => void;
  // setdispalyoverlay: () => void;
  patientId: string;
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  clinics: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  doctorId: string;
  // availableSlots: string[] | null;
}
export const ConsultOverlay: React.FC<ConsultOverlayProps> = (props) => {
  const tabs = [{ title: 'Consult Online' }, { title: 'Visit Clinic' }];
  const today = new Date().toISOString().slice(0, 10);

  // const timeArray = {
  //   Morning: ['7:00 am', '7:40 am', '8:20 am', '9:00 am', '9:40 am'],
  //   Afternoon: ['10:00 am', '10:40 am', '11:20 am', '9:00 am', '11:40 am'],
  //   Evening: ['1:00 pm', '1:30 pm', '3:00 pm', '3:40 pm'],
  //   Night: ['5:00 pm', '5:30 pm', '6:00 pm', '7:00 pm'],
  // };
  const timings = [
    {
      title: 'Morning',
      selectedIcon: <Morning />,
      unselectedIcon: <MorningUnselected />,
    },
    {
      title: 'Afternoon',
      selectedIcon: <Afternoon />,
      unselectedIcon: <AfternoonUnselected />,
    },
    {
      title: 'Evening',
      selectedIcon: <Evening />,
      unselectedIcon: <EveningUnselected />,
    },
    {
      title: 'Night',
      selectedIcon: <Night />,
      unselectedIcon: <NightUnselected />,
    },
  ];
  const [timeArray, settimeArray] = useState<TimeArray>([]);
  const [allTimeSlots, setallTimeSlots] = useState<string[] | null>([]);

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>('');

  // const [descriptionText, setdescriptionText] = useState<string>(onlineCTA[0]);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [selectedtiming, setselectedtiming] = useState<string>(timings[0].title);
  const [nextAvailableSlot, setNextAvailableSlot] = useState<string>('');
  const [isConsultOnline, setisConsultOnline] = useState<boolean>(true);
  const [availableInMin, setavailableInMin] = useState<Number>(0);
  const [showSuccessPopUp, setshowSuccessPopUp] = useState<boolean>(false);

  const [dateSelected, setdateSelected] = useState<object>({
    [today]: {
      selected: true,
      selectedColor: theme.colors.APP_GREEN,
    },
  });

  const [date, setDate] = useState<Date>(new Date());
  // const [currentmonth, setCurrentMonth] = useState(monthsName[new Date().getMonth()]);
  const [availableSlots, setavailableSlots] = useState<string[] | null>([]);

  const setTimeArrayData = (availableSlots: string[]) => {
    let array: TimeArray = [
      { label: 'Morning', time: [] },
      { label: 'Afternoon', time: [] },
      { label: 'Evening', time: [] },
      { label: 'Night', time: [] },
    ];
    console.log(availableSlots, 'setTimeArrayData');
    var morningTime = moment('12:00', 'HH:mm');
    var afternoonTime = moment('17:00', 'HH:mm');
    var eveningTime = moment('21:00', 'HH:mm');

    // if (allTimeSlots !== availableSlots) {
    //   setallTimeSlots(availableSlots);
    // }
    availableSlots.forEach((slot) => {
      const slotTime = moment(slot, 'HH:mm');
      if (slotTime.isBefore(morningTime)) {
        array[0] = {
          label: 'Morning',
          time: [...array[0].time, slot],
        };
      } else if (slotTime.isBetween(morningTime, afternoonTime)) {
        array[1] = {
          ...array[1],
          time: [...array[1].time, slot],
        };
      } else if (slotTime.isBetween(afternoonTime, eveningTime)) {
        array[2] = {
          ...array[2],
          time: [...array[2].time, slot],
        };
      } else {
        array[3] = {
          ...array[3],
          time: [...array[3].time, slot],
        };
      }
    });
    console.log(array, 'array', timeArray, 'timeArray');
    if (array !== timeArray) settimeArray(array);
  };

  console.log(date, date.toISOString().split('T')[0], 'dateeeeeeee', props.doctorId, 'doctorId');
  const availabilityData = useQuery<getDoctorAvailableSlots>(GET_AVAILABLE_SLOTS, {
    fetchPolicy: 'no-cache',
    variables: {
      DoctorAvailabilityInput: {
        availableDate: date.toISOString().split('T')[0],
        doctorId: props.doctorId,
      },
    },
  });

  if (availabilityData.error) {
    console.log('error', availabilityData.error);
  } else {
    console.log(availabilityData.data, 'availabilityData', availableSlots, 'availableSlots');
    if (
      availabilityData &&
      availabilityData.data &&
      availabilityData.data.getDoctorAvailableSlots &&
      availabilityData.data.getDoctorAvailableSlots.availableSlots &&
      availabilityData.data.getDoctorAvailableSlots.availableSlots.length !== 0 &&
      availableSlots &&
      availableSlots.length === 0
    ) {
      setTimeArrayData(availabilityData.data.getDoctorAvailableSlots.availableSlots);
      console.log(availableSlots, 'availableSlots1111');

      setavailableSlots(availabilityData.data.getDoctorAvailableSlots.availableSlots);
    }
  }

  const timeTo12HrFormat = (time: string) => {
    var time_array = time.split(':');
    var ampm = 'am';
    if (Number(time_array[0]) >= 12) {
      ampm = 'pm';
    }
    if (Number(time_array[0]) > 12) {
      time_array[0] = (Number(time_array[0]) - 12).toString();
    }
    return time_array[0].replace(/^0+/, '') + ':' + time_array[1] + ' ' + ampm;
  };

  const renderBottomButton = () => {
    // const firstTimeSlot = allTimeSlots && allTimeSlots.length > 0 ? allTimeSlots[0] : null;
    // let timeDiff: Number;
    // if (isConsultOnline && nextAvailableSlot) {
    //   timeDiff = availableInMin;
    // }
    // console.log(timeDiff, 'timeDiff', firstTimeSlot, 'firstTimeSlot');
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
                // props.setdispalyoverlay(false);
                // const formatDate = moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
                const formatDate =
                  Object.keys(dateSelected).length > 0
                    ? Object.keys(dateSelected)[0]
                    : moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD');
                console.log(formatDate, 'formatDate');
                var today = new Date();
                var time =
                  ('0' + today.getHours()).slice(-2) +
                  ':' +
                  ('0' + (today.getMinutes() + 1)).slice(-2);
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
                  hospitalId: '1',
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
                  // props.setdispalyoverlay(false),
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
            onPress={() => props.setdispalyoverlay(false)}
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

            // onBackdropPress={() => props.setdispalyoverlay(false)}
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
                  date={new Date()}
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
                  clinics={props.clinics}
                  setDate={setDate}
                  setselectedTimeSlot={setselectedTimeSlot}
                  selectedTimeSlot={selectedTimeSlot}
                  timeArray={timeArray}
                  date={new Date()}
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
