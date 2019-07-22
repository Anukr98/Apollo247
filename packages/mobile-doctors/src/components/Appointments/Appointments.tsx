import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  CalendarTodayIcon,
  DropdownGreen,
  Notification,
  RoundIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { ProfileTabHeader } from '@aph/mobile-doctors/src/components/ui/ProfileTabHeader';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useRef, useState } from 'react';
import { Alert, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { CalendarHeader } from './CalendarHeader';
import { MonthDropDown } from './MonthDropDown';

export interface AppointmentsProps {}

export const Appointments: React.FC<AppointmentsProps> = (props) => {
  const [date, setDate] = useState<Date>(new Date());
  const [data, setData] = useState<any>([]);
  const CalendarHeaderRef = useRef<any>();

  const updateMonth = (date: Date, monthIndex: number) =>
    new Date(date.getFullYear(), monthIndex, 1);

  const renderMonthSelection = (
    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
      <DropdownGreen />
    </TouchableOpacity>
  );

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
        title="hello dr. rao :)"
        description="here’s your schedule for today"
        activeTabIndex={0}
      />
      <Header
        leftComponent={renderMonthSelection}
        rightIcons={[
          {
            icon: <CalendarTodayIcon />,
            onPress: () => {
              CalendarHeaderRef.current.scrollToCurrentDate();
            },
          },
          {
            icon: <Notification />,
            onPress: () => Alert.alert('click'),
          },
        ]}
      />
      <View style={{ height: 12 }} />
      <CalendarHeader
        ref={(ref: any) => (CalendarHeaderRef.current = ref)}
        date={date}
        onTapDate={(date: Date) => {
          setDate(date);
        }}
      />
      <MonthDropDown
        monthIndex={date.getMonth()}
        onPress={(monthIndex) => setDate(updateMonth(date, monthIndex))}
      />
    </SafeAreaView>
  );
};
