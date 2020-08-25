import { AppointmentsStyles } from '@aph/mobile-doctors/src/components/Appointments/Appointments.styles';
import { AppointmentsList } from '@aph/mobile-doctors/src/components/Appointments/AppointmentsList';
import { useNotification } from '@aph/mobile-doctors/src/components/Notification/NotificationContext';
import { NotificationListener } from '@aph/mobile-doctors/src/components/Notifications/NotificationListener';
import { CommonNotificationHeader } from '@aph/mobile-doctors/src/components/ui/CommonNotificationHeader';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  CalendarTodayIcon,
  Down,
  NoCalenderData,
  Up,
  ReloadBackground,
  ReloadGreen,
  RefreshIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { Loader } from '@aph/mobile-doctors/src/components/ui/Loader';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import {
  GET_DOCTOR_APPOINTMENTS,
  SAVE_DOCTOR_DEVICE_TOKEN,
} from '@aph/mobile-doctors/src/graphql/profiles';
import {
  GetDoctorAppointments,
  GetDoctorAppointmentsVariables,
  GetDoctorAppointments_getDoctorAppointments,
} from '@aph/mobile-doctors/src/graphql/types/GetDoctorAppointments';
import { DOCTOR_DEVICE_TYPE } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  saveDoctorDeviceToken,
  saveDoctorDeviceTokenVariables,
} from '@aph/mobile-doctors/src/graphql/types/saveDoctorDeviceToken';
import { DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Platform, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import firebase from 'react-native-firebase';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { WeekView } from './WeekView';
import { string } from '@aph/mobile-doctors/src/strings/string';

const styles = AppointmentsStyles;
let timerId: NodeJS.Timeout;

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
  goToDate?: Date;
  openAppointment?: string;
}
const intervalTime = 300 * 1000;
export const Appointments: React.FC<AppointmentsProps> = (props) => {
  const [doctorName, setDoctorName] = useState<string>(
    (props.navigation.state.params && props.navigation.state.params.displayName) || ''
  );
  const { fetchNotifications } = useNotification();
  const openAppointment = props.navigation.getParam('openAppointment');
  const defaultDate = props.navigation.getParam('goToDate') || new Date();

  const [date, setDate] = useState<Date>(defaultDate);
  const [calendarDate, setCalendarDate] = useState<Date>(defaultDate); // to maintain a sync between week view change and calendar month
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  const [currentmonth, setCurrentMonth] = useState(monthsName[defaultDate.getMonth()]);
  const [getAppointments, setgetAppointments] = useState<
    GetDoctorAppointments_getDoctorAppointments
  >();
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [appointmentError, setAppointmentError] = useState<boolean>(false);

  const { doctorDetails } = useAuth();
  const { isAlertVisible, showAphAlert } = useUIElements();

  useEffect(() => {
    setDoctorName((doctorDetails && doctorDetails.displayName) || '');
    if (doctorDetails) {
      fetchNotifications();
    }
  }, [doctorDetails]);

  const isPastDate = (date: Date) => {
    return moment(moment(date).format('YYYY-MM-DD')).isBefore(
      moment(new Date()).format('YYYY-MM-DD')
    );
  };
  useEffect(() => {
    getAppointmentsApi();
  }, [date]);

  useEffect(() => {
    if (!isPastDate(date) && !isAlertVisible) {
      console.log('future dates', date, new Date());
      timerId = setInterval(() => {
        getAppointmentsApi();
      }, intervalTime);
    }
    if (isAlertVisible) {
      timerId && clearInterval(timerId);
    }
    const _didFocusSubscription = props.navigation.addListener('didFocus', () => {
      console.log('didFocus');
      getAppointmentsApi();
      timerId && clearInterval(timerId);
      if (!isPastDate(date)) {
        console.log('future dates222222', date, new Date());

        timerId = setInterval(() => {
          getAppointmentsApi();
        }, intervalTime);
      }
    });

    const _willBlurSubscription = props.navigation.addListener('willBlur', () => {
      console.log('willBlur');
      timerId && clearInterval(timerId);
    });
    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
      timerId && clearInterval(timerId);
    };
  }, [date, isAlertVisible]);

  const client = useApolloClient();

  const callDeviceTokenAPI = async () => {
    const deviceToken = JSON.parse((await AsyncStorage.getItem('deviceToken')) || '');
    firebase
      .messaging()
      .getToken()
      .then((token) => {
        console.log('tokenFMC', token);
        if (token !== deviceToken.deviceToken) {
          const input = {
            deviceType: Platform.OS === 'ios' ? DOCTOR_DEVICE_TYPE.IOS : DOCTOR_DEVICE_TYPE.ANDROID,
            deviceToken: token,
            deviceOS: '',
            doctorId: doctorDetails ? doctorDetails.id : '',
          };
          if (doctorDetails) {
            client
              .mutate<saveDoctorDeviceToken, saveDoctorDeviceTokenVariables>({
                mutation: SAVE_DOCTOR_DEVICE_TOKEN,
                variables: {
                  SaveDoctorDeviceTokenInput: input,
                },
              })
              .then((data) => {
                AsyncStorage.setItem(
                  'deviceToken',
                  JSON.stringify(
                    g(data, 'data', 'saveDoctorDeviceToken', 'deviceToken', 'deviceToken')
                  )
                );
              })
              .catch((error) => {
                CommonBugFender('Save_Doctor_Device_Token', error);
              });
          }
        }
      });
  };

  const checkNotificationPermission = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      // user has permissions
      callDeviceTokenAPI();
    } else {
      // user doesn't have permission
      try {
        await firebase.messaging().requestPermission();
        // User has authorised
      } catch (error) {
        // User has rejected permissions
        CommonBugFender('FireBaseFCM_splashscreen', error);
        console.log('not enabled error', error);
      }
    }
  };

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const getAppointmentsApi = (selectedDate = date) => {
    const recordsDate = moment(selectedDate).format('YYYY-MM-DD');
    setAppointmentError(false);
    setshowSpinner(true);
    client
      .query<GetDoctorAppointments, GetDoctorAppointmentsVariables>({
        query: GET_DOCTOR_APPOINTMENTS,
        variables: {
          startDate: recordsDate,
          endDate: recordsDate,
        },
        fetchPolicy: 'no-cache',
      })
      .then(async ({ data }) => {
        if (data && data.getDoctorAppointments) {
          setgetAppointments(data.getDoctorAppointments);
          const requestStatus = JSON.parse(
            (await AsyncStorage.getItem('requestCompleted')) || 'false'
          );

          if (
            data.getDoctorAppointments.appointmentsHistory &&
            data.getDoctorAppointments.appointmentsHistory.length === 0 &&
            !requestStatus
          ) {
            AsyncStorage.setItem('requestCompleted', 'true');
            showAphAlert &&
              showAphAlert({
                title: 'Alert!',
                description: 'Not able to find appointment. Try again',
              });
          }
        }
      })
      .catch((err) => {
        setgetAppointments(undefined);
        setAppointmentError(true);
      })
      .finally(() => {
        setshowSpinner(false);
      });
  };

  const renderMonthSelection = () => {
    return (
      <TouchableOpacity style={styles.month} onPress={() => setCalendarVisible(!isCalendarVisible)}>
        <Text style={styles.currentmonth}>{currentmonth}</Text>
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
            // getAppointmentsApi(new Date(day.dateString));
          }}
          onVisibleMonthsChange={(months) => {
            setCurrentMonth(monthsName[months[0].month - 1]);
          }}
          hideExtraDays={false}
          disableMonthChange={false}
          firstDay={1}
          hideDayNames={false}
          showWeekNumbers={false}
          onPressArrowLeft={(substractMonth) => substractMonth()}
          onPressArrowRight={(addMonth) => addMonth()}
          markedDates={{
            [moment(calendarDate).format('YYYY-MM-DD')]: {
              selected: true,
              color: theme.colors.APP_GREEN,
            },
          }}
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

  const renderDoctorGreeting = () => {
    return (
      <View style={{ backgroundColor: '#ffffff' }}>
        <View style={styles.doctornameContainer}>
          <Text style={styles.doctorname}>{`${strings.case_sheet.hello_dr} `}</Text>
          <Text style={styles.doctorname1} numberOfLines={1}>
            {doctorName || ''}
          </Text>
          <Text style={styles.doctorname}>{` :)`}</Text>
        </View>
        <Text style={styles.schedule}>{`${strings.appointments.here_your_schedule} ${
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
            icon: <RefreshIcon />,
            onPress: () => {
              getAppointmentsApi();
            },
          },
          // {
          //   icon: <DotIcon />,
          //   onPress: () => {
          //     // setDropdownVisible(true);
          //   },
          // },
        ]}
      />
    );
  };

  // const renderDropdown = () => {
  //   return (
  //     <View style={styles.menuDropdown}>
  //       <DropDown
  //         containerStyle={{ marginRight: 20, width: 200 }}
  //         options={[
  //           {
  //             optionText: strings.appointments.block_Calendar,
  //             icon: <Block />,
  //             onPress: () => {
  //               // setDropdownVisible(false);
  //               setDropdownVisible(!isDropdownVisible);
  //               props.navigation.push(AppRoutes.BlockHomePage);
  //             },
  //           },
  //           {
  //             optionText: strings.appointments.manage_calendar,
  //             icon: <CalendarIcon />,
  //             onPress: () => {
  //               setDropdownVisible(false);
  //             },
  //           },
  //         ]}
  //       />
  //     </View>
  //   );
  // };

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
        <TouchableOpacity activeOpacity={1} onPress={() => getAppointmentsApi()}>
          <View style={styles.appointmentErrorReload}>
            <Text style={styles.appointmentErrorReloadText}>{string.appointments.reload}</Text>
            <ReloadGreen />
          </View>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderAppointmentError = () => {
    return (
      <View style={styles.appointmentErrorContainer}>
        <ReloadBackground />
        <Text style={styles.appointmentErrorText}>
          {string.appointments.reload_header}
          <Text style={styles.appointmentErrorText2}>{`‘${string.appointments.reload}’`}</Text>
          {string.appointments.reload_header_cont}
        </Text>
        <TouchableOpacity activeOpacity={1} onPress={() => getAppointmentsApi()}>
          <View style={styles.appointmentErrorReload}>
            <Text style={styles.appointmentErrorReloadText}>{string.appointments.reload}</Text>
            <ReloadGreen />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[theme.viewStyles.container]}>
      <CommonNotificationHeader navigation={props.navigation} />
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
              // getAppointmentsApi(date);
            }}
            onWeekChanged={(date) => {
              setCalendarDate(moment(date).toDate());
              setCurrentMonth(monthsName[moment(date).get('month')]);
            }}
          />
        </View>
        {showSpinner ? (
          <Loader flex1 />
        ) : appointmentError ? (
          renderAppointmentError()
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
            openAppointment={openAppointment}
          />
        )}
      </View>
      <NotificationListener navigation={props.navigation} />
    </SafeAreaView>
  );
};
