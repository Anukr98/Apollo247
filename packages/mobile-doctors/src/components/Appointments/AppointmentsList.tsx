import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, ScrollView } from 'react-navigation';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { DoctorProfile } from '@aph/mobile-doctors/src/helpers/commonTypes';
import { CalenderCard } from '@aph/mobile-doctors/src/components/Appointments/CalenderCard';

const styles = StyleSheet.create({});

type AppointmentStatus = 'prev' | 'current' | 'next';

export interface AppointmentsListProps {
  getDoctorProfile: DoctorProfile;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = (props) => {
  const getDoctorProfile = props.getDoctorProfile;

  const getStatusCircle = (status: AppointmentStatus) => {
    const color = status == 'current' ? '#0087ba' : '#ff748e';
    if (status == 'current')
      return (
        <View
          style={{
            marginLeft: 20,
            borderRadius: 10,
            height: 20,
            width: 20,
            backgroundColor: color,
          }}
        ></View>
      );
    return (
      <View
        style={{
          marginLeft: 20,
          borderRadius: 10,
          height: 20,
          width: 20,
          backgroundColor: color,
        }}
      />
    );
  };
  const renderLeftTimeLineView = () => {
    // console.log('prev', type.prev);
    // console.log('current', type.current);
    // console.log('next', type.next);
    return (
      <View
        style={{
          // flex: 1,
          height: 100,
          width: 2,
          backgroundColor: true ? '#ff748e' : '#f7f7f7',
          marginRight: 9,
          marginLeft: 30,
        }}
      />
    );
  };

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
    <ScrollView bounces={false}>
      <View style={{ backgroundColor: '#f7f7f7', flex: 1, flexDirection: 'row' }}>
        <View style={{ marginTop: 70 }}>
          {getDoctorProfile.appointments.map((i: any, index: number, array: any) => {
            return (
              <>
                {getStatusCircle('current')}
                {index == array.length - 1 ? null : renderLeftTimeLineView()}
              </>
            );
          })}
        </View>

        <View>
          {getDoctorProfile.appointments.map((i: any, index: number, array: any) => {
            console.log('array', array);
            const containerStyle =
              i.timeslottype == 'MISSED'
                ? {
                    borderColor: '#e50000',
                    borderWidth: 1,
                    backgroundColor: '#f0f4f5',
                  }
                : i.timeslottype == 'UP NEXT'
                ? {
                    borderColor: '#ff748e',
                    borderWidth: 2,
                    backgroundColor: '#ffffff',
                  }
                : i.timeslottype == 'OLD'
                ? {
                    borderColor: '#0087ba',
                    borderWidth: 2,
                    backgroundColor: '#ffffff',
                  }
                : {
                    borderColor: 'rgba(2, 71, 91, 0.1)',
                    borderWidth: 1,
                    backgroundColor: '#f0f4f5',
                  };
            return (
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <View>
                  {showText(i)}
                  <CalenderCard
                    doctorname={i.doctorname}
                    type={i.type}
                    containerStyle={containerStyle}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};
