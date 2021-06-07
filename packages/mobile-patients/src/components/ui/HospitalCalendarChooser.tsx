import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextStyle,
  StyleProp,
  ViewStyle,
  Platform,
  Text,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import Menu, { MenuItem } from 'react-native-material-menu';
import { ArrowLeft, ArrowRight, PreviousPrescriptionIcon, WhiteSearchIcon } from './Icons';
import { SearchInput } from '@aph/mobile-patients/src/components/ui/SearchInput';
import { Spearator } from './BasicComponents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Calendar, DateObject, DayComponentProps } from 'react-native-calendars';
import { default as Moment, default as moment } from 'moment';
import { VaccineSlotChooser } from './VaccineSlotChooser';
import { renderVaccinesTimeSlotsLoaderShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import { DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';

const styles = StyleSheet.create({
  menuContainer: {
    width: '83%',
    marginHorizontal: -10,
    marginTop: 40,
    borderRadius: 10,
    maxWidth: 800,
    flexDirection: 'column',
    ...theme.viewStyles.shadowStyle,
    alignItems: 'center',
  },
  calendarStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#f7f8f5',
    padding: 16,
    marginTop: 5,
    marginBottom: 10,
  },
  calendarArrowContainer: {
    flexDirection: 'row',
  },
  monthTitle: {
    ...theme.viewStyles.text('R', 14, '#01475B'),
    flex: 1,
  },

  monthDayContainer_Selected: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#00B38E',
    borderRadius: 10,
  },
  monthDayContainer_UnSelected: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  monthDate_Unavailable: {
    ...theme.viewStyles.text('M', 16, '#B5B4B4'),
    textAlign: 'center',
  },
  monthDate_Avaiable: {
    ...theme.viewStyles.text('M', 16, '#00B38E'),
    textAlign: 'center',
  },
  monthDate_Selected: {
    ...theme.viewStyles.text('M', 16, '#FFF'),
    textAlign: 'center',
  },

  monthDay_Unavailable: {
    ...theme.viewStyles.text('R', 10, '#B5B4B4'),
    textAlign: 'center',
  },
  monthDay_Available: {
    ...theme.viewStyles.text('R', 10, '#00B38E'),
    textAlign: 'center',
  },
  monthDay_Selected: {
    ...theme.viewStyles.text('R', 10, '#FFF'),
    textAlign: 'center',
  },
  slotContainer: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: '#f7f8f5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 7,
    marginBottom: 7,
  },
  slotTitle: {
    ...theme.viewStyles.text('R', 14, '#02475B'),
  },
  cityChooser: {
    alignItems: 'center',
  },
  cityDropDownContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 12,
  },
  separator: {
    height: 2,
    marginTop: 7,
    backgroundColor: '#00b38e',
    opacity: 1,
  },
  selectSlotPlaceHolder: {
    ...theme.viewStyles.text('M', 16, '#02475B'),
    opacity: 0.3,
    flex: 1,
  },
  selectSlotStyle: {
    ...theme.viewStyles.text('M', 16, '#02475B'),
    flex: 1,
  },
  errorMessageSiteDate: {
    ...theme.viewStyles.text('M', 12, '#890000'),
    marginVertical: 8,
  },
});

export interface HospitalCalendarChooserProps {
  menuContainerStyle?: StyleProp<ViewStyle> | undefined;
  showMenu?: boolean;
  menuHidden?: () => void;
  onDateChoosed?: (date: string) => void;
  onSlotChoosed?: (slot: any) => void;
  onDonePressed?: () => void;
  availableDates: string[];
  availableSlots: string[];
  isSlotLoading: boolean;
  selectedSlot: any;
}

export const HospitalCalendarChooser: React.FC<HospitalCalendarChooserProps> = (props) => {
  const flatListRef = useRef<FlatList<any> | undefined | null>();
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(-1);
  const [currentWeekStartIndex, setCurrentWeekStartIndex] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<any>(props.selectedSlot);
  const [monthDates, setMonthDates] = useState([]);

  useEffect(() => {
    populateDaysInMonth();
  }, []);

  useEffect(() => {
    if (currentWeekStartIndex > 0 && monthDates.length > 0) {
      flatListRef.current! &&
        flatListRef.current!.scrollToIndex({
          index: currentWeekStartIndex,
          animated: true,
        });
    }
  }, [currentWeekStartIndex]);

  const populateDaysInMonth = () => {
    var arrDays: any = [];

    let today = moment();

    for (let day = 0; day <= 30; day++) {
      //add next 30 days
      var newDay = today.add(1, 'days');
      var newDayString = newDay.format('YYYY-MM-DD');

      arrDays.push({
        date: newDay.date(),
        day: newDay.format('ddd'),
        month: today.format('MMM'),
        isAvailable: props.availableDates.includes(newDayString),
        dateString: newDayString,
      });

      if (
        props.availableDates != undefined &&
        props.availableDates.length > 0 &&
        (props.availableDates[0] != undefined || props.availableDates[0] != '') &&
        newDayString == props.availableDates[0]
      ) {
        setSelectedDateIndex(day);
        props.onDateChoosed(props.availableDates[0]);
        setSelectedSlot(undefined);
      }
    }
    setMonthDates(arrDays);
  };

  const renderMonthDayItem = (monthDay: any, index: number) => {
    return (
      <TouchableOpacity
        style={
          index == selectedDateIndex
            ? styles.monthDayContainer_Selected
            : styles.monthDayContainer_UnSelected
        }
        onPress={() => {
          if (monthDay.isAvailable) {
            setSelectedDateIndex(index);
            props.onDateChoosed(monthDay.dateString);
            setSelectedSlot(undefined);
          }
        }}
      >
        <Text
          style={[
            index == selectedDateIndex
              ? styles.monthDay_Selected
              : monthDay.isAvailable
              ? styles.monthDay_Available
              : styles.monthDay_Unavailable,
            ,
          ]}
        >
          {monthDay.month}{' '}
        </Text>
        <Text
          style={
            index == selectedDateIndex
              ? styles.monthDate_Selected
              : monthDay.isAvailable
              ? styles.monthDate_Avaiable
              : styles.monthDate_Unavailable
          }
        >
          {monthDay.date}{' '}
        </Text>
        <Text
          style={
            index == selectedDateIndex
              ? styles.monthDay_Selected
              : monthDay.isAvailable
              ? styles.monthDay_Available
              : styles.monthDay_Unavailable
          }
        >
          {monthDay.day}{' '}
        </Text>
      </TouchableOpacity>
    );
  };

  const getHorizontalCalendar = () => {
    let today = moment();
    var todayMonth = today.format('MMM YYYY');
    return (
      <View style={styles.calendarStyle}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.monthTitle}>{todayMonth}</Text>

          <View style={styles.calendarArrowContainer}>
            <TouchableOpacity
              onPress={() => {
                if (currentWeekStartIndex < 7) {
                  setCurrentWeekStartIndex(0);
                } else {
                  setCurrentWeekStartIndex(currentWeekStartIndex - 7);
                }
              }}
            >
              <ArrowLeft
                style={{ marginRight: 12, opacity: currentWeekStartIndex < 7 ? 0.5 : 1 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (currentWeekStartIndex >= 21) {
                  setCurrentWeekStartIndex(21);
                } else {
                  setCurrentWeekStartIndex(currentWeekStartIndex + 7);
                }
              }}
            >
              <ArrowRight
                style={{ marginLeft: 12, opacity: currentWeekStartIndex >= 21 ? 0.5 : 1 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* horizontal strip  */}
        <FlatList
          ref={(ref) => (flatListRef.current = ref)}
          horizontal
          data={monthDates}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => renderMonthDayItem(item, index)}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderSlotSelector = () => {
    return props.isSlotLoading ? (
      renderVaccinesTimeSlotsLoaderShimmer()
    ) : (
      <View style={styles.slotContainer}>
        <Text style={styles.slotTitle}> {string.vaccineBooking.slot_title}</Text>
        <VaccineSlotChooser
          menuContainerStyle={styles.cityChooser}
          vaccineSlotList={props.availableSlots}
          onVaccineTypeChoosed={(selectedSlot) => {
            setSelectedSlot(selectedSlot);
            props.onSlotChoosed(selectedSlot);
          }}
        >
          <View style={styles.cityDropDownContainer}>
            <Text
              style={
                selectedSlot != undefined ? styles.selectSlotStyle : styles.selectSlotPlaceHolder
              }
            >
              {selectedSlot != undefined
                ? selectedSlot?.session_name
                : string.vaccineBooking.choose_slot}
            </Text>
            <DropdownGreen />
          </View>

          <Spearator style={styles.separator} />

          {(props.availableSlots == undefined || props.availableSlots.length == 0) &&
          props.isSlotLoading == false ? (
            <Text style={styles.errorMessageSiteDate}>
              {string.vaccineBooking.no_date_slots_available}{' '}
            </Text>
          ) : null}
        </VaccineSlotChooser>
      </View>
    );
  };

  return (
    <View>
      {getHorizontalCalendar()}

      {renderSlotSelector()}
    </View>
  );
};
