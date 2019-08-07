import { AppointmentsList } from '@aph/mobile-doctors/src/components/Appointments/AppointmentsList';
import { DropDown } from '@aph/mobile-doctors/src/components/ui/DropDown';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  Block,
  CalendarIcon,
  CalendarTodayIcon,
  DotIcon,
  Down,
  Notification,
  RoundIcon,
  Up,
  NoCalenderData,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { ProfileTabHeader } from '@aph/mobile-doctors/src/components/ui/ProfileTabHeader';
import { doctorProfile } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { NavigationScreenProps } from 'react-navigation';
import { WeekView } from './WeekView';

const styles = StyleSheet.create({
  noAppointmentsText: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: 'rgba(2, 71, 91, 0.6)',
    textAlign: 'center',
  },
  calenderView: {
    position: 'absolute',
    zIndex: 2,
    top: 0,
    width: '100%',
    // height: 'auto',
  },
  menuDropdown: {
    position: 'absolute',
    top: 184,
    width: '100%',
    alignItems: 'flex-end',
    ...Platform.select({
      ios: {
        zIndex: 2,
      },
      android: {
        //elevation: 12,
        // zIndex: 2,
        overflow: 'visible',
      },
    }),
  },
  calendarSeparator: {
    height: 1,
    opacity: 0.1,
    borderWidth: 0.5,
    borderColor: '#02475b',
    marginLeft: 16,
    marginRight: 16,
  },
  noAppointmentsView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekViewContainer: {
    marginTop: 12,
    backgroundColor: theme.colors.WHITE,
    shadowColor: '#808080',
    shadowOffset: { width: 0, height: 1 },
    ...Platform.select({
      ios: {
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        shadowOpacity: 0.1,
        elevation: 12,
      },
    }),
  },
});

const monthsName = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export interface AppointmentsProps extends NavigationScreenProps {
  profileData: DoctorProfile;
}

export const Appointments: React.FC<AppointmentsProps> = (props) => {
  const doctorName: string | null =
    props.navigation.state.params && props.navigation.state.params.Firstname;
  const [date, setDate] = useState<Date>(new Date());
  const [calendarDate, setCalendarDate] = useState<Date | null>(new Date()); // to maintain a sync between week view change and calendar month
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [currentmonth, setCurrentMonth] = useState(monthsName[new Date().getMonth()]);

  const {
    data: { getDoctorProfile },
    error,
  } = doctorProfile;
  if (error) {
    Alert.alert('Error', 'Unable to get the data');
  } else {
    //console.log('Calender', getDoctorProfile!.appointments.length);
  }

  const renderMonthSelection = () => {
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
        onPress={() => setCalendarVisible(!isCalendarVisible)}
      >
        <Text style={{ color: '#02475b', ...theme.fonts.IBMPlexSansBold(14), marginRight: 4 }}>
          {currentmonth}
        </Text>
        {isCalendarVisible ? <Up /> : <Down />}
      </TouchableOpacity>
    );
  };

  const renderCalenderView = () => {
    return (
      <View style={styles.calenderView}>
        <View style={styles.calendarSeparator} />
        <CalendarList
          style={{ height: 'auto' }}
          horizontal={true}
          pagingEnabled={true}
          current={calendarDate || date}
          onDayPress={(day) => {
            setDate(new Date(day.dateString));
            setCalendarDate(new Date(day.dateString));
            setCurrentMonth(monthsName[moment(day.timestamp).get('month')]);
            setCalendarVisible(false);
          }}
          onVisibleMonthsChange={(months) => {
            setCurrentMonth(monthsName[months[0].month - 1]);
          }}
          // hideArrows={false}
          hideExtraDays={false}
          disableMonthChange={false}
          firstDay={1}
          hideDayNames={false}
          showWeekNumbers={false}
          onPressArrowLeft={(substractMonth) => substractMonth()}
          onPressArrowRight={(addMonth) => addMonth()}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#80a3ad',
            selectedDayBackgroundColor: '#00b38e',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#00b38e',
            dayTextColor: '#00b38e',
            textDisabledColor: '#d9e1e8',
            dotColor: '#00adf5',
            selectedDotColor: '#ffffff',
            arrowColor: 'orange',
            monthTextColor: 'blue',
            indicatorColor: 'blue',
            textDayFontFamily: 'IBMPlexSans',
            textMonthFontFamily: 'IBMPlexSans',
            textDayHeaderFontFamily: 'IBMPlexSans',
            textDayFontWeight: 'bold',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 14,
            textMonthFontSize: 14,
            textDayHeaderFontSize: 12,
            'stylesheet.calendar.header': { header: { height: 0 } },
          }}
        />
      </View>
    );
  };

  const renderMainHeader = () => {
    return (
      <Header
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => Alert.alert('click'),
          },
          {
            icon: <Notification />,
            onPress: () => Alert.alert('click'),
          },
        ]}
      />
    );
  };

  const renderDoctorGreeting = () => {
    return (
      <ProfileTabHeader
        title={`hello dr. ${(doctorName || '').toLowerCase()} :)`}
        description="here’s your schedule for today"
        activeTabIndex={0}
      />
    );
  };

  const renderHeader = () => {
    return (
      <Header
        leftComponent={renderMonthSelection()}
        rightIcons={[
          {
            icon: <CalendarTodayIcon />,
            onPress: () => {
              setDate(new Date());
              setCurrentMonth(monthsName[new Date().getMonth()]);
            },
          },
          {
            icon: <DotIcon />,
            onPress: () => {
              setDropdownVisible(!isDropdownVisible);
            },
          },
        ]}
      />
    );
  };

  const renderDropdown = () => {
    return (
      <View style={styles.menuDropdown}>
        <DropDown
          containerStyle={{ marginRight: 20 }}
          options={[
            {
              optionText: '  Block Calendar',
              icon: <Block />,
              onPress: () => {
                setDropdownVisible(false);
              },
            },
            {
              optionText: '  Manage Calendar',
              icon: <CalendarIcon />,
              onPress: () => {
                setDropdownVisible(false);
              },
            },
          ]}
        />
      </View>
    );
  };

  const renderNoConsultsView = () => {
    return (
      <View style={styles.noAppointmentsView}>
        <Notification />
        <Text style={styles.noAppointmentsText}>No consults scheduled today!</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
      {renderMainHeader()}
      {renderDoctorGreeting()}
      <View>
        {renderHeader()}
        <View>{isCalendarVisible ? renderCalenderView() : null}</View>
      </View>
      {isDropdownVisible ? renderDropdown() : null}

      {/* <View style={isDropdownVisible ? {} : { zIndex: -1 }}> */}
      <View style={{ zIndex: -1, flex: 1 }}>
        <View style={[styles.weekViewContainer, { zIndex: 1 }]}>
          <WeekView
            date={date}
            onTapDate={(date: Date) => {
              setDate(date);
              setCalendarDate(date);
              setCurrentMonth(monthsName[moment(date).get('month')]);
            }}
            onWeekChanged={(date) => {
              setCalendarDate(moment(date).toDate());
              setCurrentMonth(monthsName[moment(date).get('month')]);
            }}
          />
        </View>

        {getDoctorProfile!.appointments.length == 0 ? (
          renderNoConsultsView()
        ) : (
          <AppointmentsList doctorProfile={getDoctorProfile!} />
        )}
      </View>
    </SafeAreaView>
  );
};
