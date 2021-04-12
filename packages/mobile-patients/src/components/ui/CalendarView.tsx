import moment from 'moment';
import React, { useRef, useState, useEffect } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Calendar, DateObject, DayComponentProps } from 'react-native-calendars';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { WeekView } from '@aph/mobile-patients/src/components/WeekView';
import {
  ArrowLeft,
  ArrowRight,
  DropdownBlueDown,
  DropdownBlueUp,
} from '@aph/mobile-patients/src/components/ui/Icons';

export enum CALENDAR_TYPE {
  MONTH = 'MONTH',
  WEEK = 'WEEK',
}

interface CalendarRefType extends Calendar {
  addMonth: (value: number) => void;
}

export interface CalendarViewProps {
  date: Date;
  onPressDate: (date: Date) => void;
  // onWeekChanged?: (date: Date) => void;
  onMonthChanged?: (date: Date) => void;
  calendarType?: CALENDAR_TYPE;
  onCalendarTypeChanged?: (type: CALENDAR_TYPE) => void;
  minDate?: Date;
  showWeekView?: boolean;
  maxDate?: Date;
  styles?: StyleProp<ViewStyle>;
  source?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = (props) => {
  const calendarRef = useRef<CalendarRefType | null>(null);
  const weekViewRef = useRef<{ getPreviousWeek: () => void; getNextWeek: () => void } | null>(null);
  const [calendarDate, setCalendarDate] = useState<Date>(props.date || new Date());
  useEffect(() => {
    if (props.date) {
      setCalendarDate(props.date);
    }
  }, [props.date]);
  const renderCalendarMothYearAndControls = () => {
    return (
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
          activeOpacity={1}
          onPress={() => {
            props.calendarType == CALENDAR_TYPE.WEEK
              ? weekViewRef.current && weekViewRef.current.getPreviousWeek()
              : calendarRef.current && calendarRef.current.addMonth(-1);
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
            {moment(calendarDate).format('MMM YYYY')}
          </Text>
          {props.showWeekView && (
            <>
              {props.calendarType == CALENDAR_TYPE.WEEK ? (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    setCalendarDate(props.date);
                    props.onCalendarTypeChanged && props.onCalendarTypeChanged(CALENDAR_TYPE.MONTH);
                  }}
                >
                  <DropdownBlueDown />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    setCalendarDate(props.date);
                    props.onCalendarTypeChanged && props.onCalendarTypeChanged(CALENDAR_TYPE.WEEK);
                  }}
                >
                  <DropdownBlueUp />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            props.calendarType == CALENDAR_TYPE.WEEK
              ? weekViewRef.current && weekViewRef.current.getNextWeek()
              : calendarRef.current && calendarRef.current.addMonth(1);
          }}
        >
          <ArrowRight />
        </TouchableOpacity>
      </View>
    );
  };

  const renderWeekDays = () => {
    const dayHeaderViewStyle: StyleProp<ViewStyle> = {
      marginVertical: 14,
      width: '97.4%',
      flexDirection: 'row',
      alignSelf: 'center',
    };
    const dayHeaderTextStyle: StyleProp<TextStyle> = {
      ...theme.fonts.IBMPlexSansSemiBold(12),
      letterSpacing: 0.3,
      color: '#80a3ad',
      flex: 1,
      textAlign: 'center',
    };
    return (
      <View style={dayHeaderViewStyle}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
          return (
            <Text key={index} style={dayHeaderTextStyle}>
              {day}
            </Text>
          );
        })}
      </View>
    );
  };

  const renderWeekCalendar = () => {
    return (
      <WeekView
        ref={(ref) => {
          weekViewRef.current = ref;
        }}
        date={calendarDate}
        minDate={props.minDate}
        maxDate={props.maxDate}
        onTapDate={(selectedDate: Date) => {
          console.log(selectedDate, 'onTapDate');
          const isDiabled = props.minDate
            ? moment(props.minDate).format('YYYY-MM-DD') > moment(selectedDate).format('YYYY-MM-DD')
            : false;
          if (!isDiabled) {
            props.onPressDate(
              moment(selectedDate)
                .clone()
                .toDate()
            );
            setCalendarDate(
              moment(selectedDate)
                .clone()
                .toDate()
            );
          }
        }}
        // onWeekChanged={(date) => {
        //   const weekDate = moment(date)
        //     .clone()
        //     .toDate();
        //   setCalendarDate(weekDate);
        //   props.onWeekChanged && props.onWeekChanged(weekDate);
        // }}
      />
    );
  };

  const renderMonthCalendarDayComponent = (day: DayComponentProps) => {
    const dayDate = new Date(day.date.dateString);
    const isHighlightedDate =
      dayDate.getDate() == props.date.getDate() &&
      dayDate.getMonth() == props.date.getMonth() &&
      dayDate.getFullYear() == props.date.getFullYear();

    const isDisabled = props.minDate
      ? moment(props.minDate).format('YYYY-MM-DD') > moment(dayDate).format('YYYY-MM-DD') ||
        moment(props.maxDate).format('YYYY-MM-DD') < moment(dayDate).format('YYYY-MM-DD')
      : false;

    const disabledCheck =
      !!props.source && props.source == 'Tests' ? isDisabled : day.state === 'disabled';

    const dayViewStyle: StyleProp<ViewStyle> = {
      marginTop: -11,
      height: 32,
      width: 32,
      borderRadius: 18,
      backgroundColor: disabledCheck
        ? theme.colors.CLEAR
        : isHighlightedDate
        ? theme.colors.APP_GREEN
        : theme.colors.CLEAR,
      alignItems: 'center',
      justifyContent: 'center',
    };
    const dayTextStyle: StyleProp<TextStyle> = disabledCheck
      ? {
          backgroundColor: theme.colors.CLEAR,
          ...theme.fonts.IBMPlexSansSemiBold(14),
          color: 'rgba(128,128,128, 0.3)',
        }
      : isHighlightedDate
      ? {
          backgroundColor: theme.colors.APP_GREEN,
          ...theme.fonts.IBMPlexSansSemiBold(14),
          letterSpacing: 0.35,
          color: theme.colors.WHITE,
        }
      : {
          ...theme.fonts.IBMPlexSansSemiBold(14),
          color: theme.colors.APP_GREEN,
          backgroundColor: theme.colors.CLEAR,
        };
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (!disabledCheck) {
            props.onPressDate(dayDate);
            setCalendarDate(dayDate);
          }
        }}
        // activeOpacity={day.state === 'disabled' ? 1 : 0}
        style={dayViewStyle}
      >
        <Text style={dayTextStyle}>{dayDate.getDate()}</Text>
      </TouchableOpacity>
    );
  };

  const renderMonthCalendar = () => {
    return (
      <View>
        <View style={{ height: 8.5 }} />
        <Calendar
          ref={(ref) => {
            calendarRef.current = ref as CalendarRefType;
          }}
          current={calendarDate}
          minDate={props.minDate}
          maxDate={props.maxDate}
          dayComponent={(day) => renderMonthCalendarDayComponent(day)}
          markedDates={{
            [props.date.toISOString().slice(0, 10)]: {
              selected: true,
              color: theme.colors.APP_GREEN,
            },
          }}
          onDayPress={(day: DateObject) => {
            props.onPressDate(new Date(day.timestamp));
            setCalendarDate(new Date(day.timestamp));
          }}
          onMonthChange={(m) => {
            const monthDate = new Date(m.dateString);
            setCalendarDate(monthDate);
            props.onMonthChanged && props.onMonthChanged(monthDate);
          }}
          style={{
            paddingBottom: 5,
            backgroundColor: theme.colors.CARD_BG,
            // marginHorizontal: 0
            // ...theme.viewStyles.cardContainer,
          }}
          theme={{
            'stylesheet.calendar.header': {
              header: { height: 0 },
              week: {
                marginTop: 12,
                marginBottom: 15,
                marginHorizontal: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
              },
            },
            calendarBackground: theme.colors.CARD_BG,
          }}
          hideDayNames={true}
          hideExtraDays={true}
          firstDay={1}
          hideArrows={true}
        />
      </View>
    );
  };

  return (
    <View
      style={[
        {
          ...theme.viewStyles.cardContainer,
          backgroundColor: theme.colors.CARD_BG,
        },
        props.styles,
      ]}
    >
      {renderCalendarMothYearAndControls()}
      {renderWeekDays()}
      {props.calendarType == CALENDAR_TYPE.WEEK ? renderWeekCalendar() : renderMonthCalendar()}
    </View>
  );
};

CalendarView.defaultProps = {
  showWeekView: true,
};
