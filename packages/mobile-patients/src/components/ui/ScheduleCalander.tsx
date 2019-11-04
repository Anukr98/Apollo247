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
} from '@aph/mobile-patients/src/components/ui/Icons';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { DeviceHelper } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { timeTo12HrFormat } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

type TimeArray = {
  label: string;
  time: string[];
}[];

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
});

export interface ScheduleCalanderProps {
  setdisplayoverlay: (args0: boolean) => void;
  setDate: (args0: Date) => void;
  date: Date;
  selectedTimeSlot: string;
  setselectedTimeSlot: (args0: string) => void;
  timeArray: TimeArray;
  CALENDAR_TYPE: CALENDAR_TYPE;
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

  const [type, setType] = useState<CALENDAR_TYPE>(props.CALENDAR_TYPE);
  const [date, setDate] = useState<Date>(props.date);
  const [selectedtiming, setselectedtiming] = useState<string>(timings[0].title);
  const [timeArray, settimeArray] = useState<TimeArray>(props.timeArray);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>(props.selectedTimeSlot);

  useEffect(() => {
    if (!!props.selectedTimeSlot) {
      timeArray &&
        timeArray.length > 0 &&
        timeArray.map((value) => {
          value.time.map((name: string) => {
            if (name === props.selectedTimeSlot) {
              setselectedtiming(value.label);
            }
          });
        });
    }
  }, [props.selectedTimeSlot]);

  const renderCalendarView = () => {
    return (
      <CalendarView
        date={date}
        onPressDate={(selectedDate) => {
          setDate(selectedDate);
        }}
        calendarType={type}
        onCalendarTypeChanged={(type) => {
          setType(type);
        }}
        minDate={new Date()}
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
            props.setDate(date);
            props.setdisplayoverlay(false);
            props.setselectedTimeSlot(selectedTimeSlot);
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
            onPress={() => props.setdisplayoverlay(false)}
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
              {renderTimings()}
            </View>
            <View style={{ height: 96 }} />
          </ScrollView>
          {renderTimeSelectButton()}
        </View>
      </View>
    </View>
  );
};
