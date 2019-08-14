import React, { useRef } from 'react';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  Afternoon,
  AfternoonUnselected,
  Evening,
  EveningUnselected,
  Morning,
  MorningUnselected,
  Night,
  NightUnselected,
  DropdownBlueUp,
  DropdownBlueDown,
  ArrowLeft,
  ArrowRight,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, DateObject, PeriodMarkingProps } from 'react-native-calendars';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { WeekView } from '@aph/mobile-patients/src/components/WeekView';
import moment from 'moment';
import { GetDoctorNextAvailableSlot } from '@aph/mobile-patients/src/graphql/types/GetDoctorNextAvailableSlot';
import { NEXT_AVAILABLE_SLOT } from '@aph/mobile-patients/src/graphql/profiles';
import { useQuery } from 'react-apollo-hooks';

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

type TimeArray = {
  label: string;
  time: string[];
}[];

interface CalendarRefType extends Calendar {
  onPressArrowLeft: () => void;
  onPressArrowRight: () => void;
  addMonth: (arg0: Number) => void;
}
export interface ConsultOnlineProps {
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  timeArray: TimeArray;
  date: Date;
  setDate: (arg0: Date) => void;
  setNextAvailableSlot: (arg0: string) => void;
  nextAvailableSlot: string;
  isConsultOnline: boolean;
  setisConsultOnline: (arg0: boolean) => void;
  setavailableInMin: (arg0: Number) => void;
  availableInMin: Number;
  setselectedTimeSlot: (arg0: string) => void;
  selectedTimeSlot: string;
}
export const ConsultOnline: React.FC<ConsultOnlineProps> = (props) => {
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
  const onlineCTA = ['Consult Now', 'Schedule For Later'];
  const today = new Date().toISOString().slice(0, 10);

  const [selectedtiming, setselectedtiming] = useState<string>(timings[0].title);
  const [selectedCTA, setselectedCTA] = useState<string>(onlineCTA[0]);
  const calendarRef = useRef<Calendar | null>(null);
  const weekViewRef = useRef<{ getPreviousWeek: () => void; getNextWeek: () => void } | null>(null);
  const [isMonthView, setMonthView] = useState(true);
  const [date, setDate] = useState<Date>(props.date);
  const [availableInMin, setavailableInMin] = useState<Number>(0);

  //   const [availableSlot, setavailableSlot] = useState<string>('');
  const [dateSelected, setdateSelected] = useState<object>({
    [today]: {
      selected: true,
      selectedColor: theme.colors.APP_GREEN,
    },
  });

  const todayDate = new Date();
  const dd = String(todayDate.getDate()).padStart(2, '0');
  const mm = String(todayDate.getMonth() + 1).padStart(2, '0'); //January is 0!
  const today_date = `${todayDate.getFullYear()}-${mm}-${dd}`;

  const availability = useQuery<GetDoctorNextAvailableSlot>(NEXT_AVAILABLE_SLOT, {
    // fetchPolicy: 'no-cache',
    variables: {
      DoctorNextAvailableSlotInput: {
        doctorIds: props.doctor ? [props.doctor.id] : [],
        availableDate: today_date,
      },
    },
  });

  if (availability.error) {
    console.log('error', availability.error);
  } else {
    console.log(availability.data, 'availabilityData', 'availableSlots');
    if (
      availability &&
      availability.data &&
      availability.data.getDoctorNextAvailableSlot &&
      availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots &&
      availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots.length > 0 &&
      availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0] &&
      availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]!.availableSlot &&
      availableInMin === 0
    ) {
      const nextSlot = availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]!
        .availableSlot;
      console.log(nextSlot, 'nextSlot');
      let timeDiff: Number = 0;
      const time = nextSlot.split(':');
      let today: Date = new Date();
      let date2: Date = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        Number(time[0]),
        Number(time[1])
      );
      if (date2 && today) {
        timeDiff = Math.round((date2 - today) / 60000);
      }
      console.log(timeDiff, 'timeDiff');

      props.setNextAvailableSlot(
        availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]!.availableSlot
      );
      props.setavailableInMin(timeDiff);
      setavailableInMin(timeDiff);
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

  const renderTimings = () => {
    // console.log(timeArray, 'timeArray123456789', selectedtiming);
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
            // setselectedTimeSlot('');
          }}
          selectedTab={selectedtiming}
          showIcons={true}
        />
        <View style={styles.optionsView}>
          {props.timeArray && props.timeArray.length > 0
            ? props.timeArray.map((value) => {
                console.log(
                  value,
                  selectedtiming,
                  value.label === selectedtiming,
                  'selectedtiming'
                );
                if (value.label === selectedtiming) {
                  if (value.time.length > 0) {
                    return value.time.map((name: string, index: number) => (
                      <Button
                        title={timeTo12HrFormat(name)}
                        style={[
                          styles.buttonStyle,
                          props.selectedTimeSlot === name
                            ? { backgroundColor: theme.colors.APP_GREEN }
                            : null,
                        ]}
                        titleTextStyle={[
                          styles.buttonTextStyle,
                          props.selectedTimeSlot === name ? { color: theme.colors.WHITE } : null,
                        ]}
                        onPress={() => props.setselectedTimeSlot(name)}
                      />
                    ));
                  } else {
                    return (
                      <Text
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
              })
            : null}
        </View>
      </View>
    );
  };

  const renderCalendar = () => {
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
            // markedDates={dateSelected}
            markedDates={dateSelected as PeriodMarkingProps['markedDates']}
            onDayPress={(day: DateObject) => {
              setdateSelected({
                [day.dateString]: { selected: true, selectedColor: theme.colors.APP_GREEN },
              });
              setDate(new Date(day.timestamp));
            }}
            onMonthChange={(m) => {
              console.log('month changed', m);

              props.setDate(new Date(m.dateString));
            }}
          />
        ) : (
          <WeekView
            ref={(ref) => {
              weekViewRef.current = ref;
            }}
            date={date}
            onTapDate={(date: Date) => {
              props.setDate(moment(date).toDate());
            }}
            onWeekChanged={(date) => {
              props.setDate(moment(date).toDate());
            }}
          />
        )}
      </View>
    );
  };

  console.log(availableInMin, 'availableInMin');
  return (
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
          {`${
            props.doctor ? `Dr. ${props.doctor.firstName}` : 'Doctor'
          } is available in ${availableInMin} mins!\nWould you like to consult now or schedule for later?`}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
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
            onPress={() => {
              props.setisConsultOnline(selectedCTA === onlineCTA[0] ? true : false);
              setselectedCTA(onlineCTA[0]);
            }}
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
            onPress={() => {
              props.setisConsultOnline(selectedCTA === onlineCTA[0] ? true : false);
              setselectedCTA(onlineCTA[1]);
            }}
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
  );
};
