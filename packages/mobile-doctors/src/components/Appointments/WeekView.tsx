import moment from 'moment';
import React, { useRef } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import GestureRecognizer from 'react-native-swipe-gestures';
import WeekViewStyles from '@aph/mobile-doctors/src/components/Appointments/WeekView.styles';

const styles = WeekViewStyles;

interface CalendarStripRefType extends CalendarStrip {
  getNextWeek: () => void;
  getPreviousWeek: () => void;
}

export interface WeekViewProps {
  date: Date;
  onTapDate: (date: Date) => void;
  onWeekChanged: (date: Date) => void;
}

export const WeekView: React.FC<WeekViewProps> = (props) => {
  const calendarStripRef = useRef<CalendarStrip | null>(null);

  const renderDayComponent = (item: Date) => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const isHighlitedDate =
      props.date.getDate() == item.getDate() &&
      props.date.getMonth() == item.getMonth() &&
      props.date.getFullYear() == item.getFullYear();

    const now = new Date();
    const isTodaysDate =
      now.getDate() == item.getDate() &&
      now.getMonth() == item.getMonth() &&
      now.getFullYear() == item.getFullYear();

    return (
      <TouchableOpacity
        onPress={() => props.onTapDate(item)}
        style={[styles.viewStyle, isHighlitedDate ? styles.highlightedViewStyle : {}]}
      >
        <Text
          numberOfLines={1}
          style={[isHighlitedDate ? styles.textStyleToday : styles.textStyle, { marginBottom: 6 }]}
        >
          {isTodaysDate ? 'today' : days[item.getDay()]}
        </Text>
        <Text numberOfLines={1} style={isHighlitedDate ? styles.textStyleToday : styles.textStyle}>
          {moment(item).format('DD')}
        </Text>
      </TouchableOpacity>
    );
  };

  const onSwipeRight = () => {
    ((calendarStripRef.current &&
      calendarStripRef.current) as CalendarStripRefType).getPreviousWeek();
  };

  const onSwipeLeft = () => {
    ((calendarStripRef.current && calendarStripRef.current) as CalendarStripRefType).getNextWeek();
  };

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  return (
    <GestureRecognizer onSwipeLeft={onSwipeLeft} onSwipeRight={onSwipeRight} config={config}>
      <CalendarStrip
        showMonth={false}
        onDateSelected={(date) => props.onTapDate(date)}
        selectedDate={props.date}
        onWeekChanged={(date) => props.onWeekChanged(date)}
        style={styles.calendarStripStyle}
        ref={(ref) => {
          calendarStripRef.current = ref;
        }}
        iconLeft={null}
        iconRight={null}
        // dateNameStyle={styles.textStyle}
        // dateNumberStyle={styles.textStyle}
        // highlightDateNameStyle={[styles.textStyleToday, {}]}
        // highlightDateNumberStyle={[styles.textStyleToday, {}]}
        dayComponent={(dayComponentProps) => {
          return renderDayComponent(new Date(dayComponentProps.date.toISOString()));
        }}
      />
    </GestureRecognizer>
  );
};
