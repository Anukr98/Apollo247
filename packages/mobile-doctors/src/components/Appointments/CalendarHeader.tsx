import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-navigation';
import { theme } from '@aph/mobile-doctors/src/theme/theme';

const styles = StyleSheet.create({
  wrapperStyle: {
    backgroundColor: theme.colors.WHITE,
    shadowColor: '#808080',
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
    elevation: 5,
  },
  container: {
    paddingHorizontal: 20,
  },
  viewStyle: {
    padding: 8,
    alignItems: 'center',
    height: 50,
    paddingRight: 2,
    width: 44,
    backgroundColor: theme.colors.WHITE,
  },
  highlightedViewStyle: {
    width: 48,
    backgroundColor: '#00b38e', //theme.colors.darkBlueColor(),
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    letterSpacing: 0.3,
    color: 'rgba(101, 143, 155, 0.6)',
  },
  textStyleToday: {
    ...theme.fonts.IBMPlexSansBold(14),
    letterSpacing: 0.35,
    color: theme.colors.WHITE,
  },
});

const getDaysInMonth = (month: number, year: number) => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export interface CalendarHeaderProps {
  date: Date;
  onTapDate: (date: Date) => void;
  ref: (ref: { scrollToCurrentDate: () => void }) => void;
}

export type CalendarHeaderRefProps = {
  scrollToCurrentDate: () => void;
};

export const CalendarHeader: ForwardRefExoticComponent<
  PropsWithoutRef<CalendarHeaderProps> & RefAttributes<CalendarHeaderRefProps>
> = forwardRef((props, ref) => {
  const arrayRef = useRef<FlatList<Date> | null>();

  useImperativeHandle(ref, () => ({
    // To expose this function to parent component through ref
    scrollToCurrentDate() {
      const date = new Date();
      const scrollIndex = date.getDate() - 1;
      arrayRef.current &&
        arrayRef.current.scrollToIndex({
          animated: true,
          index: scrollIndex > 0 ? scrollIndex : 0,
        });
      props.onTapDate(date);
    },
  }));

  const _getdaysInMonth = (date: Date) => getDaysInMonth(date.getMonth(), date.getFullYear());

  const renderItem = (item: Date) => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const isHighlitedSate =
      props.date.getDate() == item.getDate() && props.date.getFullYear() == item.getFullYear();
    const date = new Date();
    const isTodaysDate =
      date.getDate() == item.getDate() &&
      date.getMonth() == item.getMonth() &&
      date.getFullYear() == item.getFullYear();
    return (
      <TouchableOpacity
        onPress={() => props.onTapDate(item)}
        style={[styles.viewStyle, isHighlitedSate ? styles.highlightedViewStyle : {}]}
      >
        <Text style={isHighlitedSate ? styles.textStyleToday : styles.textStyle}>
          {isTodaysDate ? 'today' : days[item.getDay()]}
        </Text>
        <Text style={isHighlitedSate ? styles.textStyleToday : styles.textStyle}>
          {item.getDate() < 10 ? `0${item.getDate()}` : item.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapperStyle}>
      <FlatList
        contentContainerStyle={styles.container}
        showsHorizontalScrollIndicator={false}
        ref={(ref) => (arrayRef.current = ref)}
        horizontal
        bounces={false}
        data={_getdaysInMonth(props.date)}
        keyExtractor={(_, i) => `${i}`}
        renderItem={({ item }) => renderItem(item)}
      />
    </View>
  );
});
