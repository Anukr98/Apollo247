import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  CalendarTodayIcon,
  DropdownGreen,
  Notification,
  RoundIcon,
  Send,
  DotIcon,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { ProfileTabHeader } from '@aph/mobile-doctors/src/components/ui/ProfileTabHeader';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React, { useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  TouchableOpacity,
  View,
  ScrollView,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { CalendarHeader } from './CalendarHeader';
import { MonthDropDown } from './MonthDropDown';
import { CalenderCard } from '@aph/mobile-doctors/src/components/Appointments/CalenderCard';
import { doctorProfile } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { Dropdown } from 'react-native-material-dropdown';
import { AppointmentsList } from '@aph/mobile-doctors/src/components/Appointments/AppointmentsList';
const styles = StyleSheet.create({});
export interface AppointmentsProps {
  profileData: DoctorProfile;
}

export const Appointments: React.FC<AppointmentsProps> = (props) => {
  const [date, setDate] = useState<Date>(new Date());
  const CalendarHeaderRef = useRef<{ scrollToCurrentDate: () => void }>();
  const months = [
    { value: 'jan' },
    { value: 'feb' },
    { value: 'mar' },
    { value: 'apr' },
    { value: 'may' },
    { value: 'jun' },
    { value: 'jul' },
    { value: 'aug' },
    { value: 'sep' },
    { value: 'oct' },
    { value: 'nov' },
    { value: 'dec' },
  ];
  const updateMonth = (date: Date, monthIndex: number) =>
    new Date(date.getFullYear(), monthIndex, 1);

  const changeMonth = (value: string) => {
    console.log('month', value);
    if (value == months[date.getMonth()].value.toString()) {
      //CalendarHeaderRef.current.scrollToCurrentDate();
      CalendarHeaderRef &&
        CalendarHeaderRef.current &&
        CalendarHeaderRef.current.scrollToCurrentDate();
    } else {
      CalendarHeaderRef.current;
    }
  };

  const renderMonthSelection = (
    <Dropdown
      value={months[date.getMonth()].value.toString()}
      data={months}
      containerStyle={{ width: 60 }}
      selectedItemColor="#02475b"
      onChangeText={(value, index, data) => {
        changeMonth(value);
      }}
      renderBase={(a) => {
        console.log('a', a);
        return (
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ ...theme.fonts.IBMPlexSansBold(14), color: '#02475b' }}>{a.title}</Text>
            <View style={{ marginTop: 7, marginLeft: 30, position: 'absolute' }}>
              <DropdownGreen />
            </View>
          </View>
        );
      }}
    />
  );

  // const {
  //   data: { getDoctorProfile },
  //   error,
  //   loading,
  // } = useQuery(GET_DOCTOR_PROFILE) as any;

  const {
    data: { getDoctorProfile },
    error,
  } = doctorProfile;
  if (error) {
    Alert.alert('Error', 'Unable to get the data');
  } else {
    console.log('Calender', getDoctorProfile!.appointments);
  }

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
              CalendarHeaderRef &&
                CalendarHeaderRef.current &&
                CalendarHeaderRef.current.scrollToCurrentDate();
            },
          },
          {
            icon: <DotIcon />,
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
      <AppointmentsList getDoctorProfile={getDoctorProfile!} />
    </SafeAreaView>
  );
};
