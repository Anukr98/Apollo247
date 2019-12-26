import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CalendarView, CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  Afternoon,
  AfternoonUnselected,
  CrossPopup,
  Evening,
  EveningUnselected,
  Morning,
  MorningUnselected,
  Night,
  NightUnselected,
  DropdownGreen,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { DeviceHelper } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { timeTo12HrFormat, g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import {
  getDiagnosticSlots,
  getDiagnosticSlotsVariables,
  getDiagnosticSlots_getDiagnosticSlots_diagnosticSlot,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlots';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { GET_DIAGNOSTIC_SLOTS } from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';

const { width, height } = Dimensions.get('window');

type TimeArray = {
  label: string;
  time: string[];
}[];
type TimeOptionArray = {
  label: string;
  time: string;
};
const styles = StyleSheet.create({
  yellowTextStyle: {
    ...theme.viewStyles.yellowTextStyle,
    padding: 16,
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
  placeholderViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 6,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    ...theme.viewStyles.text('M', 16, '#01475b'),
  },
});

export interface ScheduleCalanderProps {
  setdisplayoverlay: (args0: boolean) => void;
  setDate: (args0: Date) => void;
  date: Date;
  selectedTimeSlot: string;
  setselectedTimeSlot: (args0: string) => void;
  timeArray?: TimeArray;
  isDropDown?: boolean;
  dropdownArray?: TimeOptionArray[];
  CALENDAR_TYPE: CALENDAR_TYPE;
  setDropArray?: (args0: TimeOptionArray[]) => void;
}

export const ScheduleCalander: React.FC<ScheduleCalanderProps> = (props) => {
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
  const { isIphoneX } = DeviceHelper();

  const {
    diagnosticSlot,
    setDiagnosticSlot,
    addresses,
    deliveryAddressId,
    setDiagnosticClinic,
  } = useDiagnosticsCart();

  const [type, setType] = useState<CALENDAR_TYPE>(props.CALENDAR_TYPE);
  const [date, setDate] = useState<Date>(props.date);
  const [selectedtiming, setselectedtiming] = useState<string>(timings[0].title);
  const [timeArray, settimeArray] = useState<TimeArray>(props!.timeArray!);
  const [dropArray, setDropArray] = useState<TimeOptionArray[]>(props!.dropdownArray!);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>(props.selectedTimeSlot);
  const [selectedDrop, setSelectedDrop] = useState<TimeOptionArray>();
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const [showSpinner, setshowSpinner] = useState<boolean>(false);

  useEffect(() => {
    if (!!props.selectedTimeSlot && timeArray) {
      timeArray &&
        timeArray.length > 0 &&
        timeArray.forEach((value) => {
          value.time.forEach((name: string) => {
            console.log(name, props.selectedTimeSlot);

            if (name === props.selectedTimeSlot) {
              setselectedtiming(value.label);
            }
          });
        });
    } else if (!!props.selectedTimeSlot && dropArray) {
      if (dropArray.length > 0) {
        setSelectedDrop(dropArray.find((value) => value.time === props.selectedTimeSlot));
      } else {
        getDropArrayData(date, props.selectedTimeSlot);
      }
    }
  }, []);

  const getDropArrayData = (selectedDate: Date, selectedTime?: string) => {
    setshowSpinner(true);
    const selectedAddress = addresses.find((item) => deliveryAddressId == item.id);
    client
      .query<getDiagnosticSlots, getDiagnosticSlotsVariables>({
        query: GET_DIAGNOSTIC_SLOTS,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: currentPatient!.id,
          hubCode: 'HYD_HUB1',
          selectedDate: moment(selectedDate).format('YYYY-MM-DD'),
          zipCode: parseInt(selectedAddress!.zipcode!),
        },
      })
      .then(({ data }) => {
        setshowSpinner(false);
        const finalaray = g(data, 'getDiagnosticSlots', 'diagnosticSlot', '0' as any);
        setDiagnosticSlot &&
          setDiagnosticSlot({
            diagnosticBranchCode: g(data, 'getDiagnosticSlots', 'diagnosticBranchCode')!,
            employeeSlotId: finalaray!.slotInfo![0]!.slot!,
            diagnosticEmployeeCode: finalaray!.employeeCode || '',
            slotStartTime: finalaray!.slotInfo![0]!.startTime!.toString(),
            slotEndTime: finalaray!.slotInfo![0]!.endTime!.toString(),
            city: selectedAddress!.city || '',
            date: date.getTime(),
          });

        const t = finalaray!
          .slotInfo!.filter((item) => item!.status != 'booked')
          .map((item) => {
            return {
              label: (item!.slot || '').toString(),
              time: `${item!.startTime} - ${item!.endTime}`,
            };
          });
        setDropArray(t);
        props.setDropArray && props.setDropArray(t);
        if (selectedTime) {
          setSelectedDrop(t.find((value) => value.time === selectedTime));
        } else {
          setSelectedDrop(t[0]);
        }
      })
      .catch((e: string) => {
        setshowSpinner(false);
      })
      .finally(() => {
        setshowSpinner(false);
      });
  };

  const renderCalendarView = () => {
    return (
      <CalendarView
        date={date}
        onPressDate={(selectedDate) => {
          setDate(selectedDate);
          setshowSpinner(true);
          setDropArray([]);
          getDropArrayData(selectedDate);
        }}
        calendarType={type}
        onCalendarTypeChanged={(type) => {
          setType(type);
        }}
        minDate={new Date()}
      />
    );
  };
  const renderDropTimings = () => {
    const timeOptionsArray = dropArray.map((item) => {
      return { key: item.label, value: item.time };
    });
    return (
      <View>
        <Text style={{ ...theme.viewStyles.text('M', 14, '#02475b'), marginTop: 16 }}>Slot</Text>
        <View style={styles.optionsView}>
          <MaterialMenu
            options={timeOptionsArray}
            selectedText={selectedDrop && selectedDrop!.label}
            menuContainerStyle={{
              alignItems: 'flex-end',
              marginTop: 24,
              marginLeft: width / 2 - 110,
            }}
            itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b') }}
            selectedTextStyle={{ ...theme.viewStyles.text('M', 16, '#00b38e') }}
            onPress={(item) => {
              setselectedTimeSlot(item.value.toString());
              setSelectedDrop({ label: item.key, time: item.value.toString() });
            }}
          >
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <View style={[styles.placeholderViewStyle]}>
                <Text
                  style={[
                    styles.placeholderTextStyle,
                    ,
                    selectedDrop !== undefined ? null : styles.placeholderStyle,
                  ]}
                >
                  {selectedDrop !== undefined ? selectedDrop.time : 'Select Time'}
                </Text>
                <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
                  <DropdownGreen />
                </View>
              </View>
            </View>
          </MaterialMenu>
        </View>
      </View>
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
                        onPress={() => setselectedTimeSlot(name)}
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
                        {`Appointment is not available in the ${selectedtiming.toLowerCase()} slot :(`}
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

  const renderCalenderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
        title={'Schedule Appointment'}
        titleStyle={{ marginLeft: 20, fontSize: 16 }}
      />
    );
  };
  const renderTimeSelectButton = () => {
    return (
      <StickyBottomComponent
        defaultBG
        style={{
          paddingHorizontal: 16,
          height: 66,
          marginTop: 10,
        }}
      >
        <Button
          title={`Done`}
          onPress={() => {
            setDiagnosticSlot &&
              setDiagnosticSlot({
                ...diagnosticSlot!,
                slotStartTime: selectedDrop!.time.split('-')[0].trim(),
                slotEndTime: selectedDrop!.time.split('-')[1].trim(),
                date: date.getTime(),
              });
            props.setDate(date);
            props.setdisplayoverlay(false);
            props.setselectedTimeSlot(selectedDrop!.time);
          }}
        />
      </StickyBottomComponent>
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
        backgroundColor: 'rgba(0, 0, 0, .8)',
        zIndex: 5,
      }}
    >
      <View
        style={{
          paddingHorizontal: 20,
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
              props.setdisplayoverlay(false);
              selectedDrop && props.setselectedTimeSlot(selectedDrop!.time);
            }}
            style={{
              marginTop: Platform.OS === 'ios' ? (isIphoneX ? 58 : 34) : 14,
              backgroundColor: 'white',
              height: 28,
              width: 28,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              marginRight: 0,
            }}
          >
            <CrossPopup />
          </TouchableOpacity>
        </View>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginTop: 16,
            height: 'auto',
            maxHeight: height - 108,
            overflow: 'hidden',
          }}
        >
          {renderCalenderHeader()}
          <ScrollView bounces={false} style={{ paddingTop: 16 }}>
            {renderCalendarView()}
            <View
              style={{
                ...theme.viewStyles.cardContainer,
                paddingHorizontal: 16,
                marginTop: 16,
              }}
            >
              {props.isDropDown ? renderDropTimings() : renderTimings()}
            </View>
            <View style={{ height: 96 }} />
          </ScrollView>
          {renderTimeSelectButton()}
          {showSpinner && <Spinner />}
        </View>
      </View>
    </View>
  );
};
