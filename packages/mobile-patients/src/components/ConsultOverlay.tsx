import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  Afternoon,
  AfternoonUnselected,
  CrossPopup,
  DropdownGreen,
  Evening,
  EveningUnselected,
  Location,
  Morning,
  MorningUnselected,
  Night,
  NightUnselected,
  ArrowLeft,
  DropdownBlueDown,
  ArrowRight,
  DropdownBlueUp,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { BOOK_APPOINTMENT } from '@aph/mobile-patients/src/graphql/profiles';
import { bookAppointment } from '@aph/mobile-patients/src/graphql/types/bookAppointment';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  APPOINTMENT_TYPE,
  BookAppointmentInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState, useRef } from 'react';
import { Mutation } from 'react-apollo';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import { Calendar, DateObject, CalendarBaseProps } from 'react-native-calendars';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationScreenProps } from 'react-navigation';
import { WeekView, WeekViewProps } from '@aph/mobile-patients/src/components/WeekView';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { DoctorDetails } from '@aph/mobile-patients/src/components/DoctorDetails';

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
});

interface CalendarRefType extends Calendar {
  onPressArrowLeft: () => void;
  onPressArrowRight: () => void;
  addMonth: (arg0: Number) => void;
}

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
  availableSlots: string[] | null;
}
export const ConsultOverlay: React.FC<ConsultOverlayProps> = (props) => {
  const tabs = [{ title: 'Consult Online' }, { title: 'Visit Clinic' }];
  const today = new Date().toISOString().slice(0, 10);
  const onlineCTA = ['Consult Now', 'Schedule For Later'];
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
  // const timeArray = {
  //   Morning: ['7:00 am', '7:40 am', '8:20 am', '9:00 am', '9:40 am'],
  //   Afternoon: ['10:00 am', '10:40 am', '11:20 am', '9:00 am', '11:40 am'],
  //   Evening: ['1:00 pm', '1:30 pm', '3:00 pm', '3:40 pm'],
  //   Night: ['5:00 pm', '5:30 pm', '6:00 pm', '7:00 pm'],
  // };
  const [timeArray, settimeArray] = useState<TimeArray>([]);
  const [allTimeSlots, setallTimeSlots] = useState<string[] | null>([]);

  const [selectedtiming, setselectedtiming] = useState<string>(timings[0].title);

  const [selectedTab, setselectedTab] = useState<string>(tabs[0].title);
  const [selectedCTA, setselectedCTA] = useState<string>(onlineCTA[0]);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>('');

  // const [descriptionText, setdescriptionText] = useState<string>(onlineCTA[0]);
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [distance, setdistance] = useState<string>('');

  const [dateSelected, setdateSelected] = useState<object>({
    [today]: {
      selected: true,
      selectedColor: theme.colors.APP_GREEN,
    },
  });
  const calendarRef = useRef<Calendar | null>(null);
  const weekViewRef = useRef<{ getPreviousWeek: () => void; getNextWeek: () => void } | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [isMonthView, setMonthView] = useState(true);

  useEffect(() => {
    let array: TimeArray = [
      { label: 'Morning', time: [] },
      { label: 'Afternoon', time: [] },
      { label: 'Evening', time: [] },
      { label: 'Night', time: [] },
    ];
    console.log(props.availableSlots, 'props.availableSlots');

    if (allTimeSlots !== props.availableSlots) {
      setallTimeSlots(props.availableSlots);
    }
    timeArray.length === 0 &&
      props.availableSlots &&
      Object.values(props.availableSlots).forEach((element) => {
        if (
          new Date('05-11-2019 ' + element) > new Date('05-11-2019 ' + '6:00') &&
          new Date('05-11-2019 ' + element) < new Date('05-11-2019 ' + '12:00')
        ) {
          console.log(true, '1234567890');
          array[0] = {
            label: 'Morning',
            time: [...array[0].time, element],
          };
        } else if (
          new Date('05-11-2019 ' + element) > new Date('05-11-2019 ' + '12:00') &&
          new Date('05-11-2019 ' + element) < new Date('05-11-2019 ' + '17:00')
        ) {
          array[1] = {
            ...array[1],
            time: [...array[1].time, element],
          };
        } else if (
          new Date('05-11-2019 ' + element) > new Date('05-11-2019 ' + '17:00') &&
          new Date('05-11-2019 ' + element) < new Date('05-11-2019 ' + '21:00')
        ) {
          array[2] = {
            ...array[2],
            time: [...array[2].time, element],
          };
        } else if (
          new Date('05-11-2019 ' + element) > new Date('05-11-2019 ' + '21:00') &&
          new Date('05-11-2019 ' + element) < new Date('06-11-2019 ' + '6:00')
        ) {
          array[3] = {
            ...array[3],
            time: [...array[3].time, element],
          };
        }
      });
    console.log(array, 'array');
    if (array !== timeArray) settimeArray(array);
  }, [props.availableSlots]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const searchstring = position.coords.latitude + ',' + position.coords.longitude;
      const key = 'AIzaSyDzbMikhBAUPlleyxkIS9Jz7oYY2VS8Xps';

      const destination =
        props.clinics && props.clinics.length > 0
          ? `${props.clinics[0].facility.streetLine1},${props.clinics[0].facility.city}` // `${props.clinics[0].facility.latitude},${props.clinics[0].facility.longitude}`
          : '';
      const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${searchstring}&destinations=${destination}&mode=driving&language=pl-PL&sensor=true&key=${key}`;
      Axios.get(distanceUrl)
        .then((obj) => {
          console.log(obj, 'distanceUrl');
          if (obj.data.rows.length > 0 && obj.data.rows[0].elements.length > 0) {
            const value = obj.data.rows[0].elements[0].distance
              ? obj.data.rows[0].elements[0].distance.value
              : 0;
            console.log(`${(value / 1000).toFixed(1)} Kms`, 'distance');
            setdistance(`${(value / 1000).toFixed(1)} Kms`);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }, [props.clinics]);

  const descriptionText = `${
    props.doctor ? `Dr. ${props.doctor.firstName}` : 'Doctor'
  } is available in ${
    15
    // props.doctor!.availableIn
  } mins!\nWould you like to consult now or schedule for later?`;

  const renderCalendar = () => {
    console.log(
      dateSelected,
      'dateSelecteddateSelected',
      calendarRef.current,
      'calendarRef.current'
    );
    return (
      <View
        style={{
          ...theme.viewStyles.cardContainer,
          backgroundColor: theme.colors.CARD_BG,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 50,
            marginHorizontal: 16,
            borderBottomWidth: 0.5,
            borderBottomColor: 'rgba(2, 71, 91, 0.3)',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              isMonthView
                ? ((calendarRef.current && calendarRef.current) as CalendarRefType).addMonth(-1)
                : weekViewRef.current && weekViewRef.current.getPreviousWeek();
            }}
          >
            <ArrowLeft />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                ...theme.fonts.IBMPlexSansMedium(14),
                color: theme.colors.LIGHT_BLUE,
              }}
            >
              {moment(date).format('MMM YYYY')}
            </Text>
            {isMonthView ? (
              <TouchableOpacity
                onPress={() => {
                  setMonthView(false);
                }}
              >
                <DropdownBlueUp />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setMonthView(true);
                }}
              >
                <DropdownBlueDown />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              isMonthView
                ? ((calendarRef.current && calendarRef.current) as CalendarRefType).addMonth(1)
                : weekViewRef.current && weekViewRef.current.getNextWeek();
            }}
          >
            <ArrowRight />
          </TouchableOpacity>
        </View>

        {isMonthView ? (
          <Calendar
            current={date}
            ref={(ref) => {
              calendarRef.current = ref;
            }}
            style={{
              // ...theme.viewStyles.cardContainer,
              backgroundColor: theme.colors.CARD_BG,
              // marginHorizontal: 0
            }}
            theme={{
              'stylesheet.calendar.header': { header: { height: 0 } },
              backgroundColor: theme.colors.CARD_BG,
              calendarBackground: theme.colors.CARD_BG,
              textSectionTitleColor: '#80a3ad',
              selectedDayBackgroundColor: '#00b38e',
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.colors.LIGHT_BLUE,
              dayTextColor: theme.colors.APP_GREEN,
              textDisabledColor: '#d9e1e8',
              dotColor: '#00b38e',
              selectedDotColor: '#ffffff',
              arrowColor: theme.colors.LIGHT_BLUE,
              monthTextColor: theme.colors.LIGHT_BLUE,
              indicatorColor: 'blue',
              textDayFontFamily: 'IBMPlexSans-SemiBold',
              textMonthFontFamily: 'IBMPlexSans-Medium',
              textDayHeaderFontFamily: 'IBMPlexSans-SemiBold',
              // textDayFontWeight: '300',
              // textMonthFontWeight: 'normal',
              // textDayHeaderFontWeight: '300',
              textDayFontSize: 14,
              textMonthFontSize: 14,
              textDayHeaderFontSize: 12,
            }}
            hideExtraDays={true}
            firstDay={1}
            hideArrows={true}
            markedDates={dateSelected}
            onDayPress={(day: DateObject) => {
              setdateSelected({
                [day.dateString]: { selected: true, selectedColor: theme.colors.APP_GREEN },
              });
              setDate(new Date(day.timestamp));
            }}
            onMonthChange={(m) => {
              console.log('month changed', m);
              setDate(new Date(m.dateString));
            }}
          />
        ) : (
          <WeekView
            ref={(ref) => {
              weekViewRef.current = ref;
            }}
            date={date}
            onTapDate={(date: Date) => {
              setDate(moment(date).toDate());
            }}
            onWeekChanged={(date) => {
              setDate(moment(date).toDate());
            }}
          />
        )}
      </View>
    );
  };

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

  const renderTimings = () => {
    console.log(timeArray, 'timeArray123456789');
    return (
      <View>
        <TabsComponent
          style={{
            backgroundColor: theme.colors.CARD_BG,
            // borderRadius: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: 'rgba(2, 71, 91, 0.3)',
          }}
          data={timings}
          onChange={(selectedtiming: string) => {
            setselectedtiming(selectedtiming);
            setselectedTimeSlot('');
          }}
          selectedTab={selectedtiming}
          showIcons={true}
        />
        {/* <FilterCard data={timeArray[selectedtiming]} /> */}
        <View style={styles.optionsView}>
          {timeArray &&
            timeArray.length > 0 &&
            timeArray.map((value, index) => {
              console.log(value, selectedtiming, value.label === selectedtiming, 'selectedtiming');
              if (value.label === selectedtiming) {
                if (value.time.length > 0) {
                  return value.time.map((name: string, index: number) => (
                    <Button
                      key={index}
                      title={timeTo12HrFormat(name)}
                      style={[
                        styles.buttonStyle,
                        selectedTimeSlot === name
                          ? { backgroundColor: theme.colors.APP_GREEN }
                          : null,
                      ]}
                      titleTextStyle={[
                        styles.buttonTextStyle,
                        selectedTimeSlot === name ? { color: theme.colors.WHITE } : null,
                      ]}
                      onPress={() => setselectedTimeSlot(name)}
                    />
                  ));
                } else {
                  return (
                    <Text
                      key={index}
                      style={{
                        ...theme.fonts.IBMPlexSansMedium(14),
                        color: theme.colors.SKY_BLUE,
                        paddingTop: 16,
                      }}
                    >
                      {`Dr. ${
                        props.doctor!.firstName
                      } is not available in the ${selectedtiming.toLowerCase()} slot :(`}
                    </Text>
                  );
                }
              }
            })}
        </View>
      </View>
    );
  };

  const renderLocation = () => {
    return (
      <View style={{ marginTop: 10 }}>
        <View style={{ paddingTop: 5, paddingBottom: 10 }}>
          <TouchableOpacity onPress={() => {}}>
            <View style={styles.placeholderViewStyle}>
              <Text style={[styles.placeholderTextStyle]}>
                {props.clinics && props.clinics.length > 0 ? props.clinics[0].facility.name : ''}
              </Text>
              <DropdownGreen size="sm" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 6, marginBottom: 4, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: theme.colors.SHERPA_BLUE,
                ...theme.fonts.IBMPlexSansMedium(13),
                paddingTop: 5,
                lineHeight: 20,
              }}
            >
              {props.clinics && props.clinics.length > 0
                ? `${props.clinics[0].facility.streetLine1}, ${props.clinics[0].facility.streetLine2}, ${props.clinics[0].facility.city}`
                : ''}
            </Text>
          </View>
          <View style={styles.horizontalSeparatorStyle} />
          <View style={{ width: 48, alignItems: 'flex-end' }}>
            <Location />
            <Text
              style={{
                color: theme.colors.SHERPA_BLUE,
                ...theme.fonts.IBMPlexSansMedium(12),
                paddingTop: 2,
                lineHeight: 20,
              }}
            >
              {distance}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBottomButton = () => {
    const firstTimeSlot = allTimeSlots && allTimeSlots.length > 0 ? allTimeSlots[0] : null;
    let timeDiff;
    if (firstTimeSlot) {
      const time = firstTimeSlot.split(':');
      var today = new Date();
      var date2 =
        time.length > 1
          ? new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              Number(time[0]),
              Number(time[1])
            )
          : ''; // 5:00 PM
      if (date2 && today) {
        timeDiff = Math.round((date2 - today) / 60000);
      }
    }
    console.log(timeDiff, 'timeDiff', firstTimeSlot, 'firstTimeSlot');
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
                tabs[0].title === selectedTab && onlineCTA[0] === selectedCTA && timeDiff <= 15
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
                  tabs[0].title === selectedTab && onlineCTA[0] === selectedCTA && timeDiff <= 15
                    ? firstTimeSlot
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
                  props.setdispalyoverlay(false),
                  setshowSpinner(false),
                  Alert.alert(
                    'Appointment Confirmation',
                    `Your appointment has been successfully booked with Dr. ${
                      props.doctor ? props.doctor.firstName : ''
                    }`,
                    [{ text: 'OK', onPress: () => props.navigation.replace(AppRoutes.TabBar) }]
                  ))
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
        paddingHorizontal: showSpinner ? 0 : 20,
        zIndex: 5,
      }}
    >
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
              setselectedtiming(timings[0].title);
              setselectedTimeSlot('');
            }}
            selectedTab={selectedTab}
          />
          <ScrollView bounces={false}>
            {selectedTab === tabs[0].title ? (
              <View>
                <View
                  style={{
                    ...theme.viewStyles.cardContainer,
                    paddingHorizontal: 16,
                    paddingTop: 15,
                    paddingBottom: 20,
                    marginTop: 20,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.SHERPA_BLUE,
                      ...theme.fonts.IBMPlexSansMedium(14),
                    }}
                  >
                    {descriptionText}
                  </Text>
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}
                  >
                    <Button
                      title="Consult Now"
                      style={[
                        {
                          flex: 2,
                          // width: 'auto',
                          paddingHorizontal: 12,
                          backgroundColor: theme.colors.WHITE,
                        },
                        selectedCTA === onlineCTA[0] ? styles.selectedButtonView : null,
                      ]}
                      titleTextStyle={[
                        {
                          color: theme.colors.APP_GREEN,
                        },
                        selectedCTA === onlineCTA[0] ? styles.selectedButtonText : null,
                      ]}
                      onPress={() => setselectedCTA(onlineCTA[0])}
                    />
                    <View style={{ width: 16 }} />
                    <Button
                      title="Schedule For Later"
                      // style={{ width: 'auto', paddingHorizontal: 12 }}
                      style={[
                        {
                          flex: 3,
                          // width: 'auto',
                          paddingHorizontal: 12,
                          backgroundColor: theme.colors.WHITE,
                        },
                        selectedCTA === onlineCTA[1] ? styles.selectedButtonView : null,
                      ]}
                      titleTextStyle={[
                        {
                          color: theme.colors.APP_GREEN,
                        },
                        selectedCTA === onlineCTA[1] ? styles.selectedButtonText : null,
                      ]}
                      onPress={() => setselectedCTA(onlineCTA[1])}
                    />
                  </View>
                </View>
                {selectedCTA === onlineCTA[1] && (
                  <View>
                    {renderCalendar()}
                    <View
                      style={{
                        ...theme.viewStyles.cardContainer,
                        paddingHorizontal: 16,
                        marginTop: 16,
                      }}
                    >
                      {renderTimings()}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <View
                  style={{
                    ...theme.viewStyles.cardContainer,
                    paddingHorizontal: 0,
                    marginTop: 20,
                    marginBottom: 16,
                  }}
                >
                  {renderCalendar()}
                </View>
                <View
                  style={{
                    ...theme.viewStyles.cardContainer,
                    paddingHorizontal: 16,
                    marginBottom: 16,
                  }}
                >
                  {renderLocation()}
                  {renderTimings()}
                </View>
              </View>
            )}
            <View style={{ height: 96 }} />
          </ScrollView>
          {renderBottomButton()}
        </View>
      </View>
      {showSpinner && <Spinner />}
    </View>
  );
};
