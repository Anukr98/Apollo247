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
import {
  Alert,
  SafeAreaView,
  TouchableOpacity,
  View,
  ScrollView,
  Text,
  StyleSheet,
} from 'react-native';
import { CalendarHeader } from './CalendarHeader';
import { MonthDropDown } from './MonthDropDown';
import { CalenderCard } from '@aph/mobile-doctors/src/components/Appointments/CalenderCard';
import { doctorProfile } from '@aph/mobile-doctors/src/helpers/APIDummyData';
import { DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.whiteRoundedCornerCard,
    marginTop: 6,
    marginLeft: 48,
    marginRight: 20,
    backgroundColor: '#f0f4f5',
    borderWidth: 1,
    borderColor: 'rgba(2, 71, 91, 0.1)',
    borderRadius: 10,
  },
});
export interface AppointmentsProps {
  profileData: DoctorProfile;
}

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

  // const {
  //   data: { getDoctorProfile },
  //   error,
  //   loading,
  // } = useQuery(GET_DOCTOR_PROFILE) as any;

  const {
    data: { getDoctorProfile },
    error,
    loading,
  } = doctorProfile as any;
  if (error) {
    Alert.alert('Error', 'Unable to get the data');
  } else {
    console.log('Calender', getDoctorProfile.appointments);
  }
  const showText = (apdata: any) => {
    return (
      <View>
        <Text
          style={[
            {
              color:
                apdata.timeslottype == 'MISSED'
                  ? '#890000'
                  : apdata.timeslottype == 'UP NEXT'
                  ? '#ff748e'
                  : apdata.timeslottype == ''
                  ? '#0087ba'
                  : '#0087ba',
              marginLeft: 50,
              marginTop: 20,
            },
            apdata.timeslottype == ''
              ? theme.fonts.IBMPlexSansMedium(12)
              : theme.fonts.IBMPlexSansBold(12),
            ,
          ]}
        >
          {apdata.timings}
        </Text>
      </View>
    );
  };

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
      {/* <MonthDropDown
        monthIndex={date.getMonth()}
        onPress={(monthIndex) => setDate(updateMonth(date, monthIndex))}
      /> */}
      <ScrollView bounces={false}>
        <View style={{ backgroundColor: '#f7f7f7', flex: 1 }}>
          {getDoctorProfile.appointments.map((i: any) => {
            return (
              <View>
                {showText(i)}
                {i.timeslottype == 'MISSED' ? (
                  <CalenderCard
                    doctorname={i.doctorname}
                    type={i.type}
                    containerStyle={{
                      borderColor: '#e50000',
                      borderWidth: 1,
                      backgroundColor: '#f0f4f5',
                    }}
                  />
                ) : i.timeslottype == 'UP NEXT' ? (
                  <CalenderCard
                    doctorname={i.doctorname}
                    type={i.type}
                    containerStyle={{
                      borderColor: '#ff748e',
                      borderWidth: 2,
                      backgroundColor: '#ffffff',
                    }}
                  />
                ) : i.timeslottype == 'OLD' ? (
                  <CalenderCard
                    doctorname={i.doctorname}
                    type={i.type}
                    containerStyle={{
                      borderColor: '#0087ba',
                      borderWidth: 2,
                      backgroundColor: '#ffffff',
                    }}
                  />
                ) : (
                  <CalenderCard
                    doctorname={i.doctorname}
                    type={i.type}
                    containerStyle={{
                      borderColor: 'rgba(2, 71, 91, 0.1)',
                      borderWidth: 1,
                      backgroundColor: '#f0f4f5',
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
