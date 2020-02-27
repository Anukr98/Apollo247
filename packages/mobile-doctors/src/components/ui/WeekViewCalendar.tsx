import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import GestureRecognizer from 'react-native-swipe-gestures';
import WeekViewCalendarStyles from '@aph/mobile-doctors/src/components/ui/WeekViewCalendar.styles';

const styles = WeekViewCalendarStyles;

interface CalendarStripRefType extends CalendarStrip {
  getNextWeek: () => void;
  getPreviousWeek: () => void;
}

export interface WeekViewProps {
  date: Date;
  onTapDate: (date: Date) => void;
  // onWeekChanged: (date: Date) => void;
  minDate?: Date;
}

export const WeekViewCalendar: ForwardRefExoticComponent<
  PropsWithoutRef<WeekViewProps> &
    RefAttributes<{ getPreviousWeek: () => void; getNextWeek: () => void }>
> = forwardRef((props, ref) => {
  const calendarStripRef = useRef<CalendarStripRefType | null>(null);

  useImperativeHandle(ref, () => ({
    // To expose this functions to parent through ref
    getPreviousWeek() {
      onSwipeRight();
    },
    getNextWeek() {
      onSwipeLeft();
    },
  }));

  const renderDayComponent = (item: Date) => {
    // const days = ['S', 'M', 'T ', 'W', 'T', 'F', 'S'];
    const isHighlitedDate =
      props.date.getDate() == item.getDate() &&
      props.date.getMonth() == item.getMonth() &&
      props.date.getFullYear() == item.getFullYear();

    const isDiabled = props.minDate
      ? moment(props.minDate).format('YYYY-MM-DD') > moment(new Date(item)).format('YYYY-MM-DD')
      : false;

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => props.onTapDate(item)}
        style={[styles.viewStyle]}
      >
        <View
          style={{
            height: 32,
            width: 32,
            borderRadius: 18,
            backgroundColor: isDiabled
              ? theme.colors.CLEAR
              : isHighlitedDate
              ? theme.colors.APP_GREEN
              : theme.colors.CLEAR,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            numberOfLines={1}
            style={
              isDiabled
                ? styles.disabledTextStyle
                : isHighlitedDate
                ? styles.textStyleToday
                : styles.unSelectedDateStyle
            }
          >
            {moment(item).format('D')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const onSwipeRight = () => {
    calendarStripRef.current && calendarStripRef.current.getPreviousWeek();
  };

  const onSwipeLeft = () => {
    calendarStripRef.current && calendarStripRef.current.getNextWeek();
  };

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };
  console.log(props.date, 'props.date weekview');

  return (
    <GestureRecognizer onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} config={config}>
      <CalendarStrip
        showMonth={false}
        minDate={props.minDate}
        onDateSelected={(date) => {
          props.onTapDate(date);
        }}
        selectedDate={props.date}
        // onWeekChanged={(date) => props.onWeekChanged(date)}
        style={styles.calendarStripStyle}
        ref={(ref) => {
          calendarStripRef.current = ref as CalendarStripRefType;
        }}
        showDayName={false}
        iconLeft={null}
        iconRight={null}
        iconStyle={{
          width: 0,
          height: 0,
        }}
        dayComponent={(dayComponentProps) => {
          return renderDayComponent(new Date(dayComponentProps.date.toISOString()));
        }}
      />
    </GestureRecognizer>
  );
});
