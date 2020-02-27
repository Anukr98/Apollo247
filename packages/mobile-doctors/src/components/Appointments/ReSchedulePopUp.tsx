import { Button } from '@aph/mobile-doctors/src/components/ui/Button';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-doctors/src/components/ui/CalendarView';
import {
  Afternoon,
  AfternoonUnselected,
  DropdownGreen,
  Evening,
  EveningUnselected,
  Morning,
  MorningUnselected,
  Night,
  NightUnselected,
  Remove,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-doctors/src/components/ui/MaterialMenu';
import { TabsComponent } from '@aph/mobile-doctors/src/components/ui/TabsComponent';
import {
  GET_AVAILABLE_SLOTS,
  INITIATE_RESCHDULE_APPONITMENT,
} from '@aph/mobile-doctors/src/graphql/profiles';
import { getDoctorAvailableSlots } from '@aph/mobile-doctors/src/graphql/types/getDoctorAvailableSlots';
import { TRANSFER_INITIATED_TYPE } from '@aph/mobile-doctors/src/graphql/types/globalTypes';
import {
  initiateRescheduleAppointment,
  initiateRescheduleAppointmentVariables,
} from '@aph/mobile-doctors/src/graphql/types/initiateRescheduleAppointment';
import { getNextAvailableSlots } from '@aph/mobile-doctors/src/helpers/clientCalls';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import ReSchedulePopUpStyles from '@aph/mobile-doctors/src/components/Appointments/ReSchedulePopUp.styles';
const { width } = Dimensions.get('window');
const styles = ReSchedulePopUpStyles;

type TimeArray = {
  label: string;
  time: string[];
}[];

export interface ReSchedulePopUpProps {
  onClose: () => void;
  doctorId: string;
  appointmentId: string;
  date: string;
  loading: (val: boolean) => void;
  onDone: (reschduleObject: {
    appointmentId: string;
    transferDateTime: any;
    doctorId: string;
    reschduleCount: React.ReactText;
    reschduleId: string;
  }) => void;
}

export const ReSchedulePopUp: React.FC<ReSchedulePopUpProps> = (props) => {
  const reasons = [
    {
      key: 1,
      value: 'I am running late from previous consult',
    },
    {
      key: 2,
      value: 'I have personal engagement',
    },
    {
      key: 3,
      value: 'I have a parallel appointment/ procedure',
    },
    {
      key: 4,
      value: 'Patient was not reachable',
    },
    {
      key: 5,
      value: 'Other',
    },
  ];

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

  const [selectedReason, setSelectedReason] = useState<number>(1);
  const [showSlot, setShowSlot] = useState<boolean>(false);
  const [type, setType] = useState<CALENDAR_TYPE>(CALENDAR_TYPE.MONTH);
  const [date, setDate] = useState<Date>(new Date(props.date));
  const [selectedtiming, setselectedtiming] = useState<string>(timings[0].title);
  const [timeArray, settimeArray] = useState<TimeArray>([
    { label: 'Morning', time: [] },
    { label: 'Afternoon', time: [] },
    { label: 'Evening', time: [] },
    { label: 'Night', time: [] },
  ]);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>('');
  const [NextAvailableSlot, setNextAvailableSlot] = useState<string>('');
  const [availableInMin, setavailableInMin] = useState<number>(0);
  const client = useApolloClient();

  useEffect(() => {
    checkAvailabilitySlot();
  }, []);

  useEffect(() => {
    if (NextAvailableSlot && timeArray) {
      for (const i in timeArray) {
        if (timeArray[i].time.length > 0) {
          if (timeArray[i].time.includes(NextAvailableSlot)) {
            setselectedtiming(timeArray[i].label);
            break;
          }
        }
      }
    }
  }, [NextAvailableSlot, timeArray]);

  const reschduleCall = () => {
    if (selectedTimeSlot && selectedReason) {
      props.loading && props.loading(true);
      client
        .mutate<initiateRescheduleAppointment, initiateRescheduleAppointmentVariables>({
          mutation: INITIATE_RESCHDULE_APPONITMENT,
          variables: {
            RescheduleAppointmentInput: {
              appointmentId: props.appointmentId,
              rescheduleReason: reasons.find((i) => i.key === selectedReason)
                ? reasons.find((i) => i.key === selectedReason)!.value
                : 'Other',
              rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.DOCTOR,
              rescheduleInitiatedId: props.doctorId,
              rescheduledDateTime: selectedTimeSlot,
            },
          },
        })
        .then(({ data }) => {
          if (data) {
            const reschduleObject = {
              appointmentId: props.appointmentId,
              transferDateTime: data.initiateRescheduleAppointment.rescheduleAppointment
                ? data.initiateRescheduleAppointment.rescheduleAppointment.rescheduledDateTime
                : '',
              doctorId: props.doctorId,
              reschduleCount: data.initiateRescheduleAppointment.rescheduleCount || '',
              reschduleId: data.initiateRescheduleAppointment.rescheduleAppointment
                ? data.initiateRescheduleAppointment.rescheduleAppointment.id
                : '',
            };
            props.onDone(reschduleObject);
          }
        })
        .catch((e) => {
          CommonBugFender('Initiate_Reschdule_Appointment_ReschdulePopup', e);
          console.log('Error occured while searching for Initiate reschdule apppointment', e);
        })
        .finally(() => {
          props.loading && props.loading(false);
        });
    }
  };

  const setTimeArrayData = async (availableSlots: string[], date: Date) => {
    console.log(availableSlots, 'setTimeArrayData availableSlots');
    setselectedtiming(timeArray[0].label);
    const array = divideSlots(availableSlots, date);
    console.log(array, 'array', timeArray, 'timeArray.......');
    if (array !== timeArray) settimeArray(array);
    for (const i in array) {
      if (array[i].time.length > 0) {
        setselectedtiming(array[i].label);
        setselectedTimeSlot(array[i].time[0]);
        break;
      }
    }
  };

  const fetchSlots = (selectedDate: Date = date) => {
    props.loading && props.loading(true);
    const availableDate = moment(selectedDate).format('YYYY-MM-DD');
    client
      .query<getDoctorAvailableSlots>({
        query: GET_AVAILABLE_SLOTS,
        fetchPolicy: 'no-cache',
        variables: {
          DoctorAvailabilityInput: {
            availableDate: availableDate,
            doctorId: props.doctorId,
          },
        },
      })
      .then(({ data }) => {
        try {
          console.log(data, 'availableSlots', availableDate);
          if (data && data.getDoctorAvailableSlots && data.getDoctorAvailableSlots.availableSlots) {
            props.loading && props.loading(false);
            setTimeArrayData(data.getDoctorAvailableSlots.availableSlots, selectedDate);
          }
        } catch {}
      })
      .catch((e) => {
        props.loading && props.loading(false);
        CommonBugFender('Get_Available_Slots_ReschdulePopup', e);
        console.log('Error occured', e);
      });
  };

  const checkAvailabilitySlot = () => {
    props.loading && props.loading(true);
    const todayDate = new Date().toISOString().slice(0, 10);
    getNextAvailableSlots(client, [props.doctorId], todayDate)
      .then(({ data }) => {
        try {
          props.loading && props.loading(false);
          if (data[0] && data[0].availableSlot && availableInMin === 0) {
            const nextSlot = data[0].availableSlot;
            const date2: Date = new Date(nextSlot);
            setavailableInMin(Math.ceil(moment(new Date()).diff(moment(date2), 'minute', true)));
            setNextAvailableSlot(nextSlot);
            setDate(date2);
            setselectedTimeSlot(nextSlot);
            fetchSlots(date2);
          }
        } catch {}
      })
      .catch((e) => {
        props.loading && props.loading(false);
        CommonBugFender('Check_Avaialablity_ReschdulePopup', e);
        console.log('error', e);
      });
  };

  const renderMainView = () => {
    return (
      <View>
        <View style={{ ...theme.viewStyles.cardContainer, marginVertical: 20 }}>
          <View style={{ marginHorizontal: 20, marginVertical: 16 }}>
            <Text style={{ ...theme.viewStyles.text('M', 14, '#01475b', 1, 20, 0) }}>
              {strings.appointments.appointment_will_reschedule}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ ...theme.viewStyles.text('S', 12, '#01475b', 0.6, 20, 0) }}>
                  {strings.appointments.date}
                </Text>
                <Text style={{ ...theme.viewStyles.text('M', 14, '#01475b', 1, 20, 0) }}>
                  {NextAvailableSlot && moment(NextAvailableSlot).format('ddd, DD/MM/YYYY')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ ...theme.viewStyles.text('S', 12, '#01475b', 0.6, 20, 0) }}>
                  {strings.appointments.time}
                </Text>
                <Text style={{ ...theme.viewStyles.text('M', 14, '#01475b', 1, 20, 0) }}>
                  {NextAvailableSlot && moment(NextAvailableSlot).format('hh:mm a')}
                </Text>
              </View>
            </View>
            <View style={{ ...theme.viewStyles.lightSeparatorStyle, marginVertical: 8 }} />
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  setShowSlot(true);
                }}
              >
                <Text style={{ ...theme.viewStyles.text('M', 14, '#fc9916', 1, 20, 0.06) }}>
                  {strings.appointments.pick_another_slot}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={{ ...theme.viewStyles.cardContainer, marginBottom: 20 }}>
          <View style={{ marginHorizontal: 20, marginVertical: 16 }}>
            <Text style={{ ...theme.viewStyles.text('M', 14, '#01475b', 1, 20, 0) }}>
              {strings.appointments.why_do_you_want_reschedule}
            </Text>
            <MaterialMenu
              onPress={(item) => {
                setSelectedReason(item.key as number);
              }}
              options={reasons}
              selectedText={selectedReason}
              menuContainerStyle={{ alignItems: 'flex-end', marginLeft: 25, marginTop: 10 }}
              itemContainer={{ height: 44.8, marginHorizontal: 12, width: width }}
              itemTextStyle={{
                ...theme.viewStyles.text('M', 14, '#01475b'),
                paddingHorizontal: 0,
              }}
              selectedTextStyle={{
                ...theme.viewStyles.text('M', 14, '#00b38e'),
                alignSelf: 'flex-start',
              }}
              bottomPadding={{ paddingBottom: 20 }}
            >
              <View style={{ flexDirection: 'row', marginBottom: 8, marginTop: 8 }}>
                <View style={styles.placeholderViewStyle}>
                  <Text
                    style={[
                      styles.placeholderTextStyle,
                      false !== undefined ? null : styles.placeholderStyle,
                    ]}
                  >
                    {reasons[selectedReason - 1].value}
                  </Text>
                  <View style={[{ flex: 1, alignItems: 'flex-end', marginRight: 5 }]}>
                    <DropdownGreen />
                  </View>
                </View>
              </View>
            </MaterialMenu>
          </View>
        </View>
      </View>
    );
  };

  const renderMainButton = () => {
    return (
      <Button
        style={{ width: width / 2, alignSelf: 'center' }}
        title={strings.buttons.reschedule_consult}
        onPress={() => reschduleCall()}
      />
    );
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
                          selectedTimeSlot === name
                            ? { backgroundColor: theme.colors.APP_GREEN }
                            : null,
                        ]}
                        titleTextStyle={[
                          styles.buttonTextStyle,
                          selectedTimeSlot === name ? { color: theme.colors.WHITE } : null,
                        ]}
                        onPress={() => {
                          setselectedTimeSlot(name);
                        }}
                      />
                    ));
                  } else {
                    return (
                      <Text
                        style={{
                          ...theme.fonts.IBMPlexSansMedium(14),
                          color: '#0087ba',
                          paddingTop: 16,
                        }}
                      >
                        {`${
                          strings.appointments.appointment_is_not_available
                        } ${selectedtiming.toLowerCase()} ${strings.appointments.slot}`}
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

  const renderSlotView = () => {
    return (
      <View>
        <View style={{ ...theme.viewStyles.cardContainer, marginTop: 20, marginBottom: 12 }}>
          <CalendarView
            date={date}
            onPressDate={(selectedDate) => {
              setDate(selectedDate);
              fetchSlots(selectedDate);
            }}
            onCalendarTypeChanged={(type) => {
              setType(type);
            }}
            calendarType={type}
            minDate={new Date()}
          />
        </View>
        <View style={{ ...theme.viewStyles.cardContainer, marginBottom: 20 }}>
          {renderTimings()}
        </View>
      </View>
    );
  };

  const renderSlotButton = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button
          title={strings.buttons.go_back}
          style={{ width: width / 2 - 65 }}
          variant={'white'}
          onPress={() => {
            setShowSlot(false);
          }}
        />
        <Button
          title={strings.buttons.done}
          style={{ width: width / 2 - 45 }}
          onPress={() => {
            setDate(new Date(selectedTimeSlot));
            setNextAvailableSlot(selectedTimeSlot);
            setShowSlot(false);
          }}
        />
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View
        style={[
          {
            ...theme.viewStyles.cardContainer,
            zIndex: 1,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            backgroundColor: theme.colors.WHITE,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 18,
            width: '100%',
          },
        ]}
      >
        <Text
          style={{
            ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE, 1, undefined, 0.5),
          }}
        >
          {showSlot ? strings.buttons.pcik_a_slot : strings.buttons.reschedule_consult}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 5,
        elevation: 500,
      }}
    >
      <View
        style={{
          paddingHorizontal: 30,
        }}
      >
        <View
          style={{
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              props.onClose();
            }}
            style={{
              marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 50,
              backgroundColor: 'white',
              height: 28,
              width: 28,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              marginRight: 0,
              marginBottom: 8,
            }}
          >
            <Remove style={{ width: 28, height: 28 }} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            ...theme.viewStyles.cardContainer,
            backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
            borderRadius: 10,
            maxHeight: '85%',
          }}
        >
          {renderHeader()}
          <ScrollView bounces={false}>{showSlot ? renderSlotView() : renderMainView()}</ScrollView>
          <View
            style={{
              ...theme.viewStyles.cardContainer,
              marginTop: 0,
              paddingHorizontal: 20,
              paddingVertical: 20,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            {showSlot ? renderSlotButton() : renderMainButton()}
          </View>
        </View>
      </View>
    </View>
  );
};
