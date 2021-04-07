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
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import Moment from 'moment';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import {
  timeTo12HrFormat,
  divideSlots,
  getNetStatus,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { getDoctorAvailableSlots } from '@aph/mobile-patients/src/graphql/types/getDoctorAvailableSlots';
import { getNextAvailableSlots } from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

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
    ...theme.fonts.IBMPlexSansMedium(16),
    letterSpacing: -0.36,
  },
});

type TimeArray = {
  label: string;
  time: string[];
}[];

export interface ConsultDoctorOnlineProps {
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  timeArray: TimeArray;
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
  setshowSpinner?: (arg0: boolean) => void;
  availableSlots?: [];
  scrollToSlots: (top?: number) => void;
  setshowOfflinePopup: (arg0: boolean) => void;
}
export const ConsultDoctorOnline: React.FC<ConsultDoctorOnlineProps> = (props) => {
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

  const [selectedtiming, setselectedtiming] = useState<string>(timings[0].title);
  const [selectedCTA, setselectedCTA] = useState<string>(onlineCTA[0]);
  const [type, setType] = useState<CALENDAR_TYPE>(CALENDAR_TYPE.MONTH);
  const [networkStatus, setNetworkStatus] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(props.date);
  const [availableInMin, setavailableInMin] = useState<Number>(0);
  const [NextAvailableSlot, setNextAvailableSlot] = useState<string>('');
  const [timeArray, settimeArray] = useState<TimeArray>([
    { label: 'Morning', time: [] },
    { label: 'Afternoon', time: [] },
    { label: 'Evening', time: [] },
    { label: 'Night', time: [] },
  ]);

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
          if (timeArray[i].time.includes(NextAvailableSlot)) {
            setselectedtiming(timeArray[i].label);
            props.setselectedTimeSlot(NextAvailableSlot);
            props.scrollToSlots();
            break;
          }
        }
      }
    }
  }, [NextAvailableSlot, timeArray]);

  const setTimeArrayData = async (availableSlots: string[], date: Date) => {
    setselectedtiming(timeArray[0].label);

    const array = await divideSlots(availableSlots, date);
    if (array !== timeArray) settimeArray(array);
    for (const i in array) {
      if (array[i].time.length > 0) {
        // setSelectedSlotTitle(array[i].label);
        setselectedtiming(array[i].label);
        props.setselectedTimeSlot(array[i].time[0]);
        props.scrollToSlots();
        break;
      }
    }
  };

  const fetchSlots = (selectedDate: Date = date) => {
    getNetStatus()
      .then((status) => {
        if (status) {
          props.setshowSpinner && props.setshowSpinner(true);
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
                  props.setshowSpinner && props.setshowSpinner(false);
                  setTimeArrayData(data.getDoctorAvailableSlots.availableSlots, selectedDate);
                }
              } catch (e) {
                CommonBugFender('ConsultDoctorOnline_fetchSlots_try', e);
              }
            })
            .catch((e) => {
              CommonBugFender('ConsultDoctorOnline_fetchSlots', e);
              props.setshowSpinner && props.setshowSpinner(false);
            });
        } else {
          props.setshowSpinner && props.setshowSpinner(false);
          props.setshowOfflinePopup(true);
        }
      })
      .catch((e) => {
        CommonBugFender('ConsultDoctorOnline_getNetStatus', e);
      });
  };

  const todayDate = new Date().toISOString().slice(0, 10);

  const client = useApolloClient();

  const checkAvailabilitySlot = () => {
    props.setshowSpinner && props.setshowSpinner(true);

    const todayDate = new Date().toISOString().slice(0, 10);

    getNextAvailableSlots(client, props.doctor ? [props.doctor.id] : [], todayDate)
      .then(({ data }: any) => {
        try {
          props.setshowSpinner && props.setshowSpinner(false);
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
          CommonBugFender('ConsultDoctorOnline_checkAvailabilitySlot_try', e);
        }
      })
      .catch((e: any) => {
        CommonBugFender('ConsultDoctorOnline_checkAvailabilitySlot', e);
        props.setshowSpinner && props.setshowSpinner(false);
      });
  };

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
                          props.doctor ? props.doctor.fullName : ''
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
          CommonLogEvent('CONSULT_DOCTOR_ONLINE', 'ConsultDoctorOnline_Clicked');
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
    <View
      style={{
        ...theme.viewStyles.cardContainer,
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: 20,
        marginBottom: 16,
      }}
    >
      <View>
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
      {networkStatus && (
        <BottomPopUp
          title={'Oops!'}
          description="There is no internet. Please check your internet connection."
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setNetworkStatus(false);
              }}
            >
              <Text
                style={{
                  paddingTop: 16,
                  ...theme.viewStyles.yellowTextStyle,
                }}
              >
                OK, GOT IT
              </Text>
            </TouchableOpacity>
          </View>
        </BottomPopUp>
      )}
    </View>
  );
};
