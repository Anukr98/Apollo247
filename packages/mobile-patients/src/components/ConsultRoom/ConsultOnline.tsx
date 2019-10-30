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
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { StyleSheet, Text, View } from 'react-native';
import { CalendarView, CALENDAR_TYPE } from '../ui/CalendarView';
import { CommonLogEvent } from '../../FunctionHelpers/DeviceHelper';

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

export interface ConsultOnlineProps {
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
  const [availableInMin, setavailableInMin] = useState<Number>(0);
  const [NextAvailableSlot, setNextAvailableSlot] = useState<string>('');

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
            break;
          }
        }
      }
      props.scrollToSlots();
    }
  }, [NextAvailableSlot, timeArray]);

  const setTimeArrayData = async (availableSlots: string[], date: Date) => {
    setselectedtiming(timeArray[0].label);

    const array = await divideSlots(availableSlots, date);
    if (array !== timeArray) settimeArray(array);
  };

  const fetchSlots = (selectedDate: Date = date) => {
    getNetStatus().then((status) => {
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
                props.setshowSpinner(false);
                setTimeArrayData(data.getDoctorAvailableSlots.availableSlots, selectedDate);
              }
            } catch {}
          })
          .catch((e: string) => {
            props.setshowSpinner(false);
            console.log('Error occured', e);
          });
      } else {
        props.setshowSpinner(false);
        props.setshowOfflinePopup(true);
      }
    });
  };

  const todayDate = new Date().toISOString().slice(0, 10);

  const client = useApolloClient();

  const checkAvailabilitySlot = () => {
    props.setshowSpinner && props.setshowSpinner(true);

    const todayDate = new Date().toISOString().slice(0, 10);

    getNextAvailableSlots(client, props.doctor ? [props.doctor.id] : [], todayDate)
      // client
      //   .query<GetDoctorNextAvailableSlot, GetDoctorNextAvailableSlotVariables>({
      //     query: NEXT_AVAILABLE_SLOT,
      //     variables: {
      //       DoctorNextAvailableSlotInput: {
      //         doctorIds:
      //         availableDate: todayDate,
      //       },
      //     },
      //     fetchPolicy: 'no-cache',
      //   })
      .then(({ data }: any) => {
        try {
          props.setshowSpinner && props.setshowSpinner(false);
          if (data[0] && data[0]!.availableSlot && availableInMin === 0) {
            const nextSlot = data[0]!.availableSlot;
            // const IOSFormat =  `${todayDate}T${nextSlot}:00.000Z`;
            let timeDiff: Number = 0;
            const today: Date = new Date();
            const date2: Date = new Date(nextSlot);
            if (date2 && today) {
              timeDiff = Math.round(((date2 as any) - (today as any)) / 60000);
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
        } catch {}
      })
      .catch((e: any) => {
        props.setshowSpinner && props.setshowSpinner(false);
        console.log('error', e);
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
                        {`Dr. ${
                          props.doctor ? `${props.doctor.firstName} ${props.doctor.lastName}` : ''
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
          marginBottom: 16,
        }}
      >
        {availableInMin ? (
          <Text
            style={{
              color: theme.colors.SHERPA_BLUE,
              ...theme.fonts.IBMPlexSansMedium(14),
            }}
          >
            {`${
              props.doctor ? `Dr. ${props.doctor.firstName} ${props.doctor.lastName}` : 'Doctor'
            } is ${
              availableInMin <= 60 && availableInMin > 0
                ? `${nextAvailability(NextAvailableSlot)}`
                : // ? `in ${availableInMin} min${availableInMin == 1 ? '' : 's'}`
                  `on ${Moment(new Date(NextAvailableSlot), 'HH:mm:ss.SSSz').format(
                    'DD MMM, h:mm a'
                  )}`
            }!\nWould you like to consult now or schedule for later?`}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
          <Button
            title="Consult Now"
            style={[
              {
                flex: 2,
                // width: 'auto',
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
              CommonLogEvent('CONSULT_ONLINE', 'Consult Now clicked');
              setselectedCTA(onlineCTA[0]);
              props.setisConsultOnline(true);
              // props.setselectedTimeSlot('');
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
              CommonLogEvent('CONSULT_ONLINE', 'Schedule For Later clicked');
              fetchSlots();
              setselectedCTA(onlineCTA[1]);
              props.setisConsultOnline(false);
              props.scrollToSlots && props.scrollToSlots();
              // props.setselectedTimeSlot('');
            }}
          />
        </View>
      </View>
      {selectedCTA === onlineCTA[1] && (
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
      )}
    </View>
  );
};
