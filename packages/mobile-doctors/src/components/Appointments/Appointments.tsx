import { AppointmentsList } from '@aph/mobile-doctors/src/components/Appointments/AppointmentsList';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { DropDown } from '@aph/mobile-doctors/src/components/ui/DropDown';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  ApploLogo,
  Block,
  CalendarIcon,
  CalendarTodayIcon,
  DotIcon,
  Down,
  NoCalenderData,
  Notification,
  RoundIcon,
  Up,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { NeedHelpCard } from '@aph/mobile-doctors/src/components/ui/NeedHelpCard';
import { GET_DOCTOR_APPOINTMENTS } from '@aph/mobile-doctors/src/graphql/profiles';
import {
  GetDoctorAppointments,
  GetDoctorAppointmentsVariables,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorAppointments';
import { DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { WeekView } from './WeekView';
import AppointmentsStyles from '@aph/mobile-doctors/src/components/Appointments/Appointments.styles';

const styles = AppointmentsStyles;

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
  const [doctorName, setDoctorName] = useState<string>(
    (props.navigation.state.params && props.navigation.state.params.Firstname) || ''
  );
  const [DoctorId, setDoctorId] = useState<string>(
    (props.navigation.state.params && props.navigation.state.params.DoctorId) || ''
  );
  const { doctorDetails } = useAuth();

  useEffect(() => {
    console.log(doctorDetails, 'doctorDetailshi');

    setDoctorName((doctorDetails && doctorDetails.firstName) || '');
    setDoctorId((doctorDetails && doctorDetails!.id) || '');
    // getLocalData()
    //   .then((data) => {
    //     console.log('data', data);
    //     setDoctorName((data.doctorDetails! || {}).lastName);
    //     setDoctorId((data.doctorDetails! || {}).id);
    //   })
    //   .catch(() => {});
    // console.log('DoctirNAME', doctorName);
  }, [doctorDetails]);

  const [date, setDate] = useState<Date>(new Date());
  const [calendarDate, setCalendarDate] = useState<Date>(new Date()); // to maintain a sync between week view change and calendar month
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [showNeedHelp, setshowNeedHelp] = useState(false);
  const [currentmonth, setCurrentMonth] = useState(monthsName[new Date().getMonth()]);

  const startDate = moment(date).format('YYYY-MM-DD');
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  const endDate = moment(nextDate).format('YYYY-MM-DD');

  const { data, error, loading } = useQuery<GetDoctorAppointments, GetDoctorAppointmentsVariables>(
    GET_DOCTOR_APPOINTMENTS,
    {
      variables: {
        startDate: startDate,
        endDate: startDate, //'2019-09-13',
      },
      fetchPolicy: 'no-cache',
    }
  );

  const getAppointments = data && data.getDoctorAppointments;
  console.log('getAppointments', getAppointments);

  const renderMonthSelection = () => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
          paddingBottom: 12,
        }}
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
          style={{ height: 300 }}
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
          // markingType={'custom'}
          // markedDates={mark}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#80a3ad',
            selectedDayBackgroundColor: '#00b38e',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#000000',
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
        leftIcons={[
          {
            icon: <ApploLogo />,
          },
        ]}
        rightIcons={[
          {
            icon: <RoundIcon />,
            onPress: () => setshowNeedHelp(true),
          },
          {
            icon: <Notification />,
            onPress: () => props.navigation.push(AppRoutes.NotificationScreen),
          },
        ]}
      />
    );
  };

  const renderDoctorGreeting = () => {
    return (
      // <ProfileTabHeader
      //   title={`hello dr. ${(doctorName || '').toLowerCase()} :)`}
      //   description={`here’s your schedule for ${
      //     moment(date).format('DD/MM/YYYY') == moment(new Date()).format('DD/MM/YYYY')
      //       ? 'today'
      //       : moment(date).format('MMM, DD')
      //   }`}
      //   activeTabIndex={0}/>
      <View style={{ backgroundColor: '#ffffff' }}>
        <Text
          style={{
            ...theme.fonts.IBMPlexSansSemiBold(28),
            color: '#02475b',
            marginLeft: 20,
            marginBottom: 2,
          }}
        >{`${strings.case_sheet.hello_dr} ${(doctorName || '').toLowerCase()} :)`}</Text>
        <Text
          style={{
            ...theme.fonts.IBMPlexSansMedium(16),
            color: '#0087ba',
            marginLeft: 20,
            marginBottom: 14,
            lineHeight: 24,
          }}
        >{`${strings.appointments.here_your_schedule} ${
          moment(date).format('DD/MM/YYYY') == moment(new Date()).format('DD/MM/YYYY')
            ? 'today'
            : moment(date).format('MMM, DD')
        }`}</Text>
      </View>
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
              setDropdownVisible(true);
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
          containerStyle={{ marginRight: 20, width: 200 }}
          options={[
            {
              optionText: strings.appointments.block_Calendar,
              icon: <Block />,
              onPress: () => {
                // setDropdownVisible(false);
                setDropdownVisible(!isDropdownVisible);
                props.navigation.push(AppRoutes.BlockHomePage);
              },
            },
            {
              optionText: strings.appointments.manage_calendar,
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
    const now = new Date();
    const isTodaysDate = (date: Date) =>
      now.getDate() == date.getDate() &&
      now.getMonth() == date.getMonth() &&
      now.getFullYear() == date.getFullYear();
    const getCurrentDaytext = isTodaysDate(date) ? 'today' : 'for this day';
    return (
      <ScrollView bounces={false}>
        <View style={styles.noAppointmentsView}>
          <NoCalenderData />
          <Text
            style={styles.noAppointmentsText}
          >{`${strings.appointments.no_consults_scheduled} ${getCurrentDaytext}!`}</Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[theme.viewStyles.container]}>
      {renderMainHeader()}
      <View style={{ marginBottom: 0 }}>{renderDoctorGreeting()}</View>

      <View>
        {renderHeader()}
        <View style={{ flex: 1 }}>{isCalendarVisible ? renderCalenderView() : null}</View>
      </View>
      {/* {isDropdownVisible ? renderDropdown() : null} */}

      {/* <View style={isDropdownVisible ? {} : { zIndex: -1 }}> */}
      <View style={[{ zIndex: -1 }, theme.viewStyles.container]}>
        <View style={[styles.weekViewContainer, { zIndex: 0 }]}>
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
        {loading ? (
          <Loader flex1 />
        ) : (
            (getAppointments &&
              getAppointments.appointmentsHistory &&
              getAppointments.appointmentsHistory) ||
            []
          ).length == 0 ? (
          renderNoConsultsView()
        ) : (
          <AppointmentsList
            navigation={props.navigation}
            appointmentsHistory={(getAppointments && getAppointments.appointmentsHistory) || []}
            newPatientsList={(getAppointments && getAppointments.newPatientsList) || []}
          />
        )}
      </View>
      {showNeedHelp && <NeedHelpCard onPress={() => setshowNeedHelp(false)} />}
    </SafeAreaView>
  );
};
