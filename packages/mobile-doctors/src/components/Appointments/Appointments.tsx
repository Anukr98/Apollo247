import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  CalendarTodayIcon,
  Notification,
  RoundIcon,
  DotIcon,
  Up,
  Down,
  Send,
  Block,
  CalendarIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { ProfileTabHeader } from '@aph/mobile-doctors/src/components/ui/ProfileTabHeader';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useRef, useState, useEffect } from 'react';
import { Alert, SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarHeader } from './CalendarHeader';
import { doctorProfile } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { AppointmentsList } from '@aph/mobile-doctors/src/components/Appointments/AppointmentsList';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { CalendarList } from 'react-native-calendars';
import { DropDown } from '@aph/mobile-doctors/src/components/ui/DropDown';

let data = [
  {
    value: 'Banana',
  },
  {
    value: 'Mango',
  },
  {
    value: 'Pear',
  },
];
const styles = StyleSheet.create({
  noappointments: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: 'rgba(2, 71, 91, 0.6)',
    textAlign: 'center',
  },
  calendershow: {
    position: 'absolute',
    zIndex: 2,
    top: 0,
    width: '100%',
    height: 300,
  },
  calenderdropdown: {
    position: 'absolute',
    zIndex: 2,
    top: -40,
    width: '100%',
    alignItems: 'flex-end',
    marginLeft: 10,
  },
});
export interface AppointmentsProps extends NavigationScreenProps {
  profileData: DoctorProfile;
}

export const Appointments: React.FC<AppointmentsProps> = (props) => {
  const doctorName = props.navigation.state.params && props.navigation.state.params.Firstname;
  const [date, setDate] = useState<Date>(new Date());
  const CalendarHeaderRef = useRef<{ scrollToCurrentDate: () => void }>();
  const [show, setshow] = useState(false);
  const [dropdownshow, setDropDownShow] = useState(false);
  const monthsname = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'MAY',
    6: 'June',
    7: 'July',
    8: 'Aug',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
  };

  const currentDate = new Date();
  const a: number = currentDate.getMonth() + 1;

  const [currentmonth, setCurrentMonth] = useState(monthsname[a]);
  console.log('thisMonth', currentmonth);

  const renderMonthSelection = (
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ color: '#02475b', ...theme.fonts.IBMPlexSansBold(14) }}>{currentmonth}</Text>
      <TouchableOpacity onPress={() => setshow(!show)}>{show ? <Up /> : <Down />}</TouchableOpacity>
    </View>
  );

  const {
    data: { getDoctorProfile },
    error,
  } = doctorProfile;
  if (error) {
    Alert.alert('Error', 'Unable to get the data');
  } else {
    //console.log('Calender', getDoctorProfile!.appointments.length);
  }
  const showCalenderView = () => {
    return (
      <View>
        <CalendarList
          style={{
            height: 310,
          }}
          horizontal={true}
          pagingEnabled={true}
          current={'2019-07-25'}
          minDate={'2019-07-01'}
          maxDate={'2019-12-31'}
          onDayPress={(day) => {
            console.log('selected day', day);
          }}
          monthFormat={''}
          onVisibleMonthsChange={(months) => {
            months.map((i: any, index: number, array: any) => {
              setCurrentMonth(monthsname[i.month]);
            });
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
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={theme.viewStyles.container}>
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
      <ProfileTabHeader
        title={`hello dr. ${doctorName} :)`}
        description="here’s your schedule for today"
        activeTabIndex={0}
      />
      <View>
        <Header
          leftComponent={renderMonthSelection}
          rightIcons={[
            {
              icon: <CalendarTodayIcon />,
              onPress: () => {
                setDropDownShow(!dropdownshow);
              },
            },
            {
              icon: <DotIcon />,
              onPress: () => Alert.alert('click'),
            },
          ]}
        />
        <View>
          {show ? (
            <View style={styles.calendershow}>
              <View
                style={{
                  borderBottomColor: '#f7f7f7',
                  borderBottomWidth: 1,
                  marginLeft: 16,
                  marginRight: 16,
                }}
              ></View>
              {showCalenderView()}
            </View>
          ) : null}
        </View>
      </View>
      <View>
        {dropdownshow ? (
          <View style={styles.calenderdropdown}>
            <DropDown
              options={[
                {
                  optionText: '  Block Calendar',
                  icon: <Block />,
                  onPress: () => {
                    setDropDownShow(false);
                  },
                },
                {
                  optionText: '  Manage Calendar',
                  icon: <CalendarIcon />,
                  onPress: () => {
                    setDropDownShow(false);
                  },
                },
              ]}
            />
          </View>
        ) : null}
      </View>
      <View style={{ zIndex: -1 }}>
        <View style={{ marginTop: 12 }} />
        <CalendarHeader
          ref={(ref: any) => (CalendarHeaderRef.current = ref)}
          date={date}
          onTapDate={(date: Date) => {
            setDate(date);
          }}
        />
        <ScrollView bounces={false}>
          <View>
            {getDoctorProfile!.appointments.length == 0 ? (
              <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                <Notification />
                <Text style={styles.noappointments}>No consults scheduled today!</Text>
              </View>
            ) : (
              <AppointmentsList getDoctorProfile={getDoctorProfile!} />
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
