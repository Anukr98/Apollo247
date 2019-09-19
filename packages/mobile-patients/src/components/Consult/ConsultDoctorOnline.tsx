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
import { NEXT_AVAILABLE_SLOT } from '@aph/mobile-patients/src/graphql/profiles';
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  GetDoctorNextAvailableSlot,
  GetDoctorNextAvailableSlotVariables,
} from '@aph/mobile-patients/src/graphql/types/GetDoctorNextAvailableSlot';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { useQuery, useApolloClient } from 'react-apollo-hooks';
import Moment from 'moment';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CalendarView, CALENDAR_TYPE } from '../ui/CalendarView';
import {
  timeTo12HrFormat,
  divideSlots,
  getNetStatus,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { BottomPopUp } from '../ui/BottomPopUp';

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

  useEffect(() => {
    if (date !== props.date) {
      setDate(props.date);
    }
    getNetStatus().then((status) => {
      if (status) {
        console.log('Network status', status);
        checkAvailabilitySlot();
      } else {
        setNetworkStatus(true);
        console.log('Network status failed', status);
      }
    });

    // if (availableSlots !== props.availableSlots && props.availableSlots) {
    //   setTimeArrayData(props.availableSlots, props.date);
    //   setavailableSlots(props.availableSlots);
    // }
  }, [props.date, date]);

  const todayDate = new Date().toISOString().slice(0, 10);

  const client = useApolloClient();

  const checkAvailabilitySlot = () => {
    console.log('checkAvailabilitySlot consult online');

    client
      .query<GetDoctorNextAvailableSlot, GetDoctorNextAvailableSlotVariables>({
        query: NEXT_AVAILABLE_SLOT,
        variables: {
          DoctorNextAvailableSlotInput: {
            doctorIds: props.doctor ? [props.doctor.id] : [],
            availableDate: todayDate,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((availability: any) => {
        if (
          availability &&
          availability.data &&
          availability.data.getDoctorNextAvailableSlot &&
          availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots &&
          availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots.length > 0 &&
          availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0] &&
          availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]!.availableSlot &&
          availableInMin === 0
        ) {
          const nextSlot = availability.data.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]!
            .availableSlot;
          // const IOSFormat =  `${todayDate}T${nextSlot}:00.000Z`;
          let timeDiff: Number = 0;
          const today: Date = new Date();
          const date2: Date = new Date(nextSlot);
          if (date2 && today) {
            timeDiff = Math.round(((date2 as any) - (today as any)) / 60000);
          }
          console.log(timeDiff, 'timeDiff');

          props.setNextAvailableSlot(nextSlot);
          props.setavailableInMin(timeDiff);
          setavailableInMin(timeDiff);
          setNextAvailableSlot(nextSlot);
        }
      })
      .catch((e: any) => {
        console.log('error', e);
      });
  };

  const renderTimings = () => {
    console.log(props.timeArray, 'timeArray123456789', selectedtiming);
    return (
      <View>
        <TabsComponent
          style={{
            backgroundColor: theme.colors.CARD_BG,
            // borderRadius: 10,
            borderBottomWidth: 0.5,
            borderBottomColor: 'rgba(2, 71, 91, 0.3)',
          }}
          data={timings}
          onChange={(selectedtiming: string) => {
            setselectedtiming(selectedtiming);
            // setselectedTimeSlot('');
          }}
          selectedTab={selectedtiming}
          showIcons={true}
        />
        <View style={styles.optionsView}>
          {props.timeArray && props.timeArray.length > 0
            ? props.timeArray.map((value) => {
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
                          props.doctor ? props.doctor.firstName : ''
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
          // setDate(date);
          console.log('selectedDate', selectedDate !== date, selectedDate, date);

          if (
            Moment(selectedDate).format('YYYY-MM-DD') !== Moment(date).format('YYYY-MM-DD') &&
            props.setshowSpinner
          )
            props.setshowSpinner(true);
          props.setDate(selectedDate);
          props.setselectedTimeSlot('');
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
        <BottomPopUp title={'Hi:)'} description="Please check your Internet connection!">
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
