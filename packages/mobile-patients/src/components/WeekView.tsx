import { theme } from '@aph/mobile-patients/src/theme/theme';
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

const styles = StyleSheet.create({
  calendarStripStyle: {
    height: 94,
    backgroundColor: theme.colors.CARD_BG,
    paddingHorizontal: 5,
  },
  viewStyle: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    // paddingRight: 2,
    // height: 48,
    // width: 44,
    backgroundColor: theme.colors.CARD_BG,
  },
  unSelectedDateStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    color: theme.colors.APP_GREEN,
    backgroundColor: theme.colors.CLEAR,
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    letterSpacing: 0.3,
    color: '#80a3ad',
    paddingTop: 3,
  },
  textStyleToday: {
    backgroundColor: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansSemiBold(14),
    letterSpacing: 0.35,
    color: theme.colors.WHITE,
  },
});

interface CalendarStripRefType extends CalendarStrip {
  getNextWeek: () => void;
  getPreviousWeek: () => void;
}

export interface WeekViewProps {
  date: Date;
  onTapDate: (date: Date) => void;
  onWeekChanged: (date: Date) => void;
}

export const WeekView: ForwardRefExoticComponent<
  PropsWithoutRef<WeekViewProps> &
    RefAttributes<{ getPreviousWeek: () => void; getNextWeek: () => void }>
> = forwardRef((props, ref) => {
  const calendarStripRef = useRef<CalendarStrip | null>(null);

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
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
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
      <TouchableOpacity onPress={() => props.onTapDate(item)} style={[styles.viewStyle]}>
        <Text numberOfLines={1} style={[styles.textStyle, { marginBottom: 18 }]}>
          {days[item.getDay()]}
        </Text>
        <View
          style={{
            height: 32,
            width: 32,
            borderRadius: 18,
            backgroundColor: isHighlitedDate ? theme.colors.APP_GREEN : 'transparenr',
            marginBottom: 13,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            numberOfLines={1}
            style={isHighlitedDate ? styles.textStyleToday : styles.unSelectedDateStyle}
          >
            {moment(item).format('DD')}
          </Text>
        </View>
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
        iconStyle={{
          width: 0,
          height: 0,
        }}
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
});
