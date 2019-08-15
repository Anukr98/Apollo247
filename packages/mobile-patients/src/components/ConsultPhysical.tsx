import React, { useEffect, useRef } from 'react';
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
  DropdownGreen,
  Location,
  ArrowLeft,
  DropdownBlueUp,
  DropdownBlueDown,
  ArrowRight,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Axios from 'axios';
import { Calendar, DateObject, PeriodMarkingProps } from 'react-native-calendars';
import moment from 'moment';
import { WeekView } from '@aph/mobile-patients/src/components/WeekView';

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
    marginHorizontal: 5,
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

export interface ConsultPhysicalProps {
  doctor?: getDoctorDetailsById_getDoctorDetailsById | null;
  timeArray?: TimeArray;
  clinics: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  date: Date;
  setDate: (arg0: Date) => void;
  setselectedTimeSlot: (arg0: string) => void;
  selectedTimeSlot: string;
}
export const ConsultPhysical: React.FC<ConsultPhysicalProps> = (props) => {
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
  const today = new Date().toISOString().slice(0, 10);
  const [selectedtiming, setselectedtiming] = useState<string>(timings[0].title);
  const [distance, setdistance] = useState<string>('');
  const calendarRef = useRef<Calendar | null>(null);
  const weekViewRef = useRef<{ getPreviousWeek: () => void; getNextWeek: () => void } | null>(null);
  const [isMonthView, setMonthView] = useState(true);
  const [date, setDate] = useState<Date>(props.date);
  const [dateSelected, setdateSelected] = useState<object>({
    [today]: {
      selected: true,
      selectedColor: theme.colors.APP_GREEN,
    },
  });

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
                ? `${props.clinics[0].facility.streetLine1}, ${
                    props.clinics[0].facility.streetLine2
                      ? `${props.clinics[0].facility.streetLine2}, `
                      : ''
                  }${props.clinics[0].facility.city}`
                : ''}
            </Text>
          </View>
          <View style={styles.horizontalSeparatorStyle} />
          <View style={{ width: 70, alignItems: 'flex-end' }}>
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

  return (
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
  );
};
