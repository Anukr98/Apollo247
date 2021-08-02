import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  Afternoon,
  AfternoonUnselected,
  Evening,
  EveningUnselected,
  Morning,
  MorningUnselected,
  Night,
  NightUnselected,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { GET_AVAILABLE_SLOTS } from '@aph/mobile-patients/src/graphql/profiles';
import { getDoctorAvailableSlots } from '@aph/mobile-patients/src/graphql/types/getDoctorAvailableSlots';
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { getNextAvailableSlots } from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  divideSlots,
  getNetStatus,
  nextAvailability,
  timeTo12HrFormat,
  g,
  postWebEngageEvent,
  getUserType,
  postCleverTapEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import moment from 'moment';
import {
  CleverTapEventName,
  CleverTapEvents,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';

const styles = StyleSheet.create({
  selectedButtonView: {
    backgroundColor: theme.colors.APP_GREEN,
  },
  selectedButtonText: {
    color: theme.colors.WHITE,
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
  },
  buttonStyle: {
    width: 'auto',
    marginRight: 8,
    marginTop: 12,
    backgroundColor: theme.colors.WHITE,
  },
  buttonTextStyle: {
    paddingHorizontal: 12,
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(15),
  },
  ctaTextStyle: {
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(isIphone5s() ? 13 : 16),
    letterSpacing: -0.36,
  },
});

type TimeArray = {
  label: string;
  time: string[];
}[];

export interface ConsultOnlineProps {
  source: 'List' | 'Profile';
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  date: Date;
  setDate: (arg0: Date) => void;
  setNextAvailableSlot: (arg0: string) => void;
  nextAvailableSlot: string;
  isConsultOnline: boolean;
  setisConsultOnline: (arg0: boolean) => void;
  setavailableInMin: (arg0: Number) => void;
  availableInMin: Number;
  setselectedTimeSlot: (arg0: string) => void;
  selectedTimeSlot: string;
  setshowSpinner: (arg0: boolean) => void;
  availableSlots?: [];
  scrollToSlots: (top?: number) => void;
  setshowOfflinePopup: (arg0: boolean) => void;
}
export const ConsultOnline: React.FC<ConsultOnlineProps> = (props) => {
  const timings = [
    {
      title: 'Morning',
      selectedIcon: <Morning />,
      unselectedIcon: <MorningUnselected />,
    },
    {
      title: 'Afternoon',
      selectedIcon: <Afternoon />,
      unselectedIcon: <AfternoonUnselected />,
    },
    {
      title: 'Evening',
      selectedIcon: <Evening />,
      unselectedIcon: <EveningUnselected />,
    },
    {
      title: 'Night',
      selectedIcon: <Night />,
      unselectedIcon: <NightUnselected />,
    },
  ];
  const onlineCTA = ['Consult Now', 'Schedule For Later'];
  const [timeArray, settimeArray] = useState<TimeArray>([
    { label: 'Morning', time: [] },
    { label: 'Afternoon', time: [] },
    { label: 'Evening', time: [] },
    { label: 'Night', time: [] },
  ]);

  const [selectedtiming, setselectedtiming] = useState<string>(timings[0].title);
  const [selectedCTA, setselectedCTA] = useState<string>(onlineCTA[0]);
  const [type, setType] = useState<CALENDAR_TYPE>(CALENDAR_TYPE.MONTH);

  const [date, setDate] = useState<Date>(props.date);
  const [availableInMin, setavailableInMin] = useState<number>(0);
  const [NextAvailableSlot, setNextAvailableSlot] = useState<string>('');
  const [checkingAvailability, setCheckingAvailability] = useState<boolean>(false);
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();

  useEffect(() => {
    if (date !== props.date) {
      setDate(props.date);
    }
    checkAvailabilitySlot();
  }, [props.date, date]);

  useEffect(() => {
    if (NextAvailableSlot && timeArray) {
      for (const i in timeArray) {
        if (timeArray[i].time.length > 0) {
          props.setshowSpinner?.(false);
          if (timeArray[i].time.includes(NextAvailableSlot)) {
            setselectedtiming(timeArray[i].label);
            props.setselectedTimeSlot(NextAvailableSlot);
            break;
          }
        }
      }
      props.scrollToSlots();
    }
  }, [NextAvailableSlot, timeArray]);

  const setTimeArrayData = async (availableSlots: string[], date: Date) => {
    if (availableSlots?.length === 0) props.setshowSpinner?.(false);
    setselectedtiming(timeArray[0].label);
    const array = await divideSlots(availableSlots, date);
    if (array !== timeArray) {
      settimeArray(array);
    } else {
      props.setshowSpinner?.(false);
    }
  };

  const fetchSlots = (selectedDate: Date = date) => {
    getNetStatus()
      .then((status) => {
        if (status) {
          props.setshowSpinner(true);
          const availableDate = Moment(selectedDate).format('YYYY-MM-DD');
          client
            .query<getDoctorAvailableSlots>({
              query: GET_AVAILABLE_SLOTS,
              fetchPolicy: 'no-cache',
              variables: {
                DoctorAvailabilityInput: {
                  availableDate: availableDate,
                  doctorId: props.doctor ? props.doctor.id : '',
                },
              },
            })
            .then(({ data }) => {
              try {
                if (
                  data &&
                  data.getDoctorAvailableSlots &&
                  data.getDoctorAvailableSlots.availableSlots
                ) {
                  setTimeArrayData(data.getDoctorAvailableSlots.availableSlots, selectedDate);
                }
              } catch (e) {
                CommonBugFender('ConsultOnline_fetchSlots_try', e);
                props.setshowSpinner?.(false);
              }
            })
            .catch((e) => {
              CommonBugFender('ConsultOnline_fetchSlots', e);
              props.setshowSpinner(false);
            });
        } else {
          props.setshowSpinner(false);
          props.setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('ConsultOnline_getNetStatus', e);
        props.setshowSpinner?.(false);
      });
  };

  const todayDate = new Date().toISOString().slice(0, 10);

  const client = useApolloClient();

  const checkAvailabilitySlot = () => {
    if (!checkingAvailability) {
      setCheckingAvailability(true);
      props.setshowSpinner && props.setshowSpinner(true);

      const todayDate = new Date().toISOString().slice(0, 10);

      getNextAvailableSlots(client, props.doctor ? [props.doctor.id] : [], todayDate)
        .then(({ data }: any) => {
          try {
            if (data[0] && data[0]!.availableSlot && availableInMin === 0) {
              const nextSlot = data[0]!.availableSlot;
              let timeDiff: Number = 0;
              const today: Date = new Date();
              const date2: Date = new Date(nextSlot);
              if (date2 && today) {
                timeDiff = Math.ceil(((date2 as any) - (today as any)) / 60000);
              }
              props.setNextAvailableSlot(nextSlot);
              props.setavailableInMin(timeDiff);
              setavailableInMin(timeDiff);
              setNextAvailableSlot(nextSlot);
              if (timeDiff > 60) {
                setselectedCTA(onlineCTA[1]);
              }
              setDate(date2);
              props.setDate(date2);
              fetchSlots(date2);
            }
          } catch (e) {
            CommonBugFender('ConsultOnline_checkAvailabilitySlot_try', e);
            props.setshowSpinner?.(false);
          } finally {
            setCheckingAvailability(false);
          }
        })
        .catch((e: any) => {
          CommonBugFender('ConsultOnline_checkAvailabilitySlot', e);
          props.setshowSpinner && props.setshowSpinner(false);
        })
        .finally(() => {
          setCheckingAvailability(false);
        });
    }
  };

  const postConsultNowOrScheduleLaterEvent = (type: 'now' | 'later') => {
    let eventAttributes:
      | WebEngageEvents[WebEngageEventName.CONSULT_SCHEDULE_FOR_LATER_CLICKED]
      | WebEngageEvents[WebEngageEventName.CONSULT_NOW_CLICKED] = {
      'Consult Date Time': moment(NextAvailableSlot).toDate(),
      'Consult Mode': 'Online',
      specialisation: g(props.doctor, 'specialty', 'name')!,
      'Doctor Experience': Number(g(props.doctor, 'experience')!),
      'Doctor ID': g(props.doctor, 'id')!,
      'Doctor Name': g(props.doctor, 'fullName')!,
      'Speciality ID': g(props.doctor, 'specialty', 'id')!,
      'Hospital Name': g(props.doctor, 'doctorHospital', '0' as any, 'facility', 'name')!,
      'Hospital City': g(props.doctor, 'doctorHospital', '0' as any, 'facility', 'city')!,
      'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
      'Patient UHID': g(currentPatient, 'uhid'),
      Relation: g(currentPatient, 'relation'),
      'Patient Age': Math.round(
        moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
      ),
      'Patient Gender': g(currentPatient, 'gender'),
      'Customer ID': g(currentPatient, 'id'),
      User_Type: getUserType(allCurrentPatients),
    };

    if (type == 'now') {
      eventAttributes = {
        ...eventAttributes,
        'Available in Minutes': availableInMin,
        Source: props.source,
        'Language Known': g(props.doctor, 'languages')! || 'NA',
        'Doctor Speciality': g(props.doctor, 'specialty', 'name')!,
      } as WebEngageEvents[WebEngageEventName.CONSULT_NOW_CLICKED];

      postWebEngageEvent(WebEngageEventName.CONSULT_NOW_CLICKED, eventAttributes);
    } else {
      postWebEngageEvent(WebEngageEventName.CONSULT_SCHEDULE_FOR_LATER_CLICKED, eventAttributes);
    }
  };

  useEffect(() => {
    const isScheduleForLaterActive = selectedCTA == onlineCTA[1];
    if (!isScheduleForLaterActive || !timeArray || !selectedtiming) {
      return;
    }
    const selectedTabSlots = (timeArray || []).find((item) => item.label == selectedtiming);
    if (selectedTabSlots && selectedTabSlots.time.length == 0) {
      const data: getDoctorDetailsById_getDoctorDetailsById = props.doctor!;
      const eventAttributes:
        | WebEngageEvents[WebEngageEventName.NO_SLOTS_FOUND]
        | CleverTapEvents[CleverTapEventName.CONSULT_NO_SLOTS_FOUND] = {
        'Doctor Name': g(data, 'fullName')!,
        'Speciality ID': g(data, 'specialty', 'id')!,
        'Speciality Name': g(data, 'specialty', 'name')!,
        'Doctor Category': g(data, 'doctorType')!,
        'Consult Date Time': moment().toDate(),
        'Consult Mode': 'Online',
        'Hospital Name': g(data, 'doctorHospital', '0' as any, 'facility', 'name')!,
        'Hospital City': g(data, 'doctorHospital', '0' as any, 'facility', 'city')!,
        // 'Consult ID': g(data, 'id')!,
        'Patient Name': `${g(currentPatient, 'firstName')} ${g(currentPatient, 'lastName')}`,
        'Patient UHID': g(currentPatient, 'uhid'),
        Relation: g(currentPatient, 'relation'),
        'Patient Age': Math.round(
          moment().diff(g(currentPatient, 'dateOfBirth') || 0, 'years', true)
        ),
        'Patient Gender': g(currentPatient, 'gender'),
        'Customer ID': g(currentPatient, 'id'),
      };
      postWebEngageEvent(WebEngageEventName.NO_SLOTS_FOUND, eventAttributes);
      postCleverTapEvent(CleverTapEventName.CONSULT_NO_SLOTS_FOUND, eventAttributes);
    }
  }, [selectedtiming, timeArray, selectedCTA]);

  const renderTimings = () => {
    return (
      <View>
        <TabsComponent
          style={{
            backgroundColor: theme.colors.CARD_BG,
            borderBottomWidth: 0.5,
            borderBottomColor: 'rgba(2, 71, 91, 0.3)',
          }}
          data={timings}
          onChange={(selectedtiming: string) => {
            setselectedtiming(selectedtiming);
          }}
          selectedTab={selectedtiming}
          showIcons={true}
        />
        <View style={styles.optionsView}>
          {timeArray && timeArray.length > 0
            ? timeArray.map((value) => {
                if (value.label === selectedtiming) {
                  if (value.time.length > 0) {
                    return value.time.map((name: string, index: number) => (
                      <Button
                        key={index}
                        title={timeTo12HrFormat(name)}
                        style={[
                          styles.buttonStyle,
                          props.selectedTimeSlot === name
                            ? { backgroundColor: theme.colors.APP_GREEN }
                            : null,
                        ]}
                        titleTextStyle={[
                          styles.buttonTextStyle,
                          props.selectedTimeSlot === name ? { color: theme.colors.WHITE } : null,
                        ]}
                        onPress={() => props.setselectedTimeSlot(name)}
                      />
                    ));
                  } else {
                    return (
                      <Text
                        style={{
                          ...theme.fonts.IBMPlexSansMedium(14),
                          color: theme.colors.SKY_BLUE,
                          paddingTop: 16,
                        }}
                      >
                        {`${
                          props.doctor ? `${props.doctor.displayName}` : ''
                        } is not available in the ${selectedtiming.toLowerCase()} slot :(`}
                      </Text>
                    );
                  }
                }
              })
            : null}
        </View>
      </View>
    );
  };

  const renderCalendar = () => {
    return (
      <CalendarView
        date={date}
        onPressDate={(selectedDate) => {
          props.setDate(selectedDate);
          props.setselectedTimeSlot('');
          fetchSlots(selectedDate);
        }}
        calendarType={type}
        onCalendarTypeChanged={(type) => {
          setType(type);
        }}
        minDate={new Date()}
      />
    );
  };

  return (
    <View>
      <View
        style={{
          ...theme.viewStyles.cardContainer,
          paddingHorizontal: 16,
          paddingTop: 15,
          paddingBottom: 20,
          marginTop: 20,
        }}
      >
        {availableInMin ? (
          <Text
            style={{
              color: theme.colors.SHERPA_BLUE,
              ...theme.fonts.IBMPlexSansMedium(14),
            }}
          >
            {`${props.doctor ? `${props.doctor.displayName}` : 'Doctor'} is ${nextAvailability(
              NextAvailableSlot
            )}!\nWould you like to consult now or schedule for later?`}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
          <Button
            title="Consult Now"
            style={[
              {
                flex: 2,
                paddingHorizontal: 12,
                backgroundColor: theme.colors.WHITE,
              },
              selectedCTA === onlineCTA[0] ? styles.selectedButtonView : null,
            ]}
            titleTextStyle={[
              styles.ctaTextStyle,
              selectedCTA === onlineCTA[0] ? styles.selectedButtonText : null,
            ]}
            onPress={() => {
              postConsultNowOrScheduleLaterEvent('now');
              CommonLogEvent(AppRoutes.DoctorDetails, WebEngageEventName.CONSULT_NOW_CLICKED);
              setselectedCTA(onlineCTA[0]);
              props.setisConsultOnline(true);
            }}
          />
          <View style={{ width: 16 }} />
          <Button
            title="Schedule For Later"
            style={[
              {
                flex: 3,
                paddingHorizontal: 12,
                backgroundColor: theme.colors.WHITE,
              },
              selectedCTA === onlineCTA[1] ? styles.selectedButtonView : null,
            ]}
            titleTextStyle={[
              styles.ctaTextStyle,
              selectedCTA === onlineCTA[1] ? styles.selectedButtonText : null,
            ]}
            onPress={() => {
              postConsultNowOrScheduleLaterEvent('later');
              CommonLogEvent(AppRoutes.DoctorDetails, 'Schedule For Later clicked');
              fetchSlots();
              setselectedCTA(onlineCTA[1]);
              props.setisConsultOnline(false);
              props.scrollToSlots && props.scrollToSlots();
            }}
          />
        </View>
      </View>
      {selectedCTA === onlineCTA[1] && (
        <View style={{ marginTop: 16 }}>
          {renderCalendar()}
          <View
            style={{
              ...theme.viewStyles.cardContainer,
              paddingHorizontal: 16,
              marginTop: 16,
            }}
          >
            {renderTimings()}
          </View>
        </View>
      )}
    </View>
  );
};
