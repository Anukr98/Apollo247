import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CrossPopup } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  getDoctorDetailsById_getDoctorDetailsById,
  getDoctorDetailsById_getDoctorDetailsById_doctorHospital,
} from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, Text, TouchableOpacity, View, Alert } from 'react-native';
import { NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { getNetStatus } from '../../helpers/helperFunctions';
import { AppRoutes } from '../NavigatorContainer';
import { NoInterNetPopup } from '../ui/NoInterNetPopup';
import { CommonScreenLog, CommonLogEvent } from '../../FunctionHelpers/DeviceHelper';
import { BottomPopUp } from '../ui/BottomPopUp';

const { width, height } = Dimensions.get('window');

export interface ReschedulePopUpProps extends NavigationScreenProps {
  setResheduleoverlay: (arg0: boolean) => void;
  patientId: string;
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  clinics: getDoctorDetailsById_getDoctorDetailsById_doctorHospital[];
  doctorId: string;
  isbelowthree: boolean;
  setdisplayoverlay: () => void;
  acceptChange: () => void;
  appadatetime: string;
  reschduleDateTime: any;
  data: any;
  rescheduleCount: number;
}
export const ReschedulePopUp: React.FC<ReschedulePopUpProps> = (props) => {
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [rescheduleCounting, setRescheduleCounting] = useState<number>(1);
  const [networkStatus, setNetworkStatus] = useState<boolean>(false);
  const [bottompopup, setBottompopup] = useState<boolean>(false);
  // console.log('rescheduleCount', props.rescheduleCount);
  // console.log(
  //   'reschduleDateTime',
  //   props.reschduleDateTime.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0].availableSlot
  // );
  // console.log('isbelowthree', props.isbelowthree);

  useEffect(() => {
    CommonScreenLog('ReschedulePopUp', 'ReschedulePopUp');
    try {
      let count = 4 - props.rescheduleCount;

      if (count <= 0) {
        setRescheduleCounting(1);
      } else {
        setRescheduleCounting(count);
      }
    } catch (error) {
      setRescheduleCounting(1);
    }
  });
  const networkBack = () => {
    setNetworkStatus(false);
    props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.TabBar })],
      })
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
      <View style={{ paddingHorizontal: showSpinner ? 0 : 20 }}>
        <View
          style={{
            alignItems: 'flex-end',
          }}
        >
          <TouchableOpacity
            onPress={() => props.setResheduleoverlay(false)}
            style={{
              marginTop: Platform.OS === 'ios' ? 38 : 14,
              backgroundColor: 'white',
              height: 28,
              width: 28,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 14,
              marginRight: showSpinner ? 20 : 0,
            }}
          >
            <CrossPopup />
          </TouchableOpacity>
        </View>
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              marginTop: 16,
              width: width - 40,
              height: 'auto',
              maxHeight: height - 98,
              padding: 0,
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 56,
                backgroundColor: 'white',
                alignItems: 'center',
                ...theme.viewStyles.shadowStyle,
              }}
            >
              <Text
                style={{
                  color: 'rgba(2, 71, 91, 1)',
                  ...theme.fonts.IBMPlexSansMedium(16),
                  paddingTop: 18,
                  paddingBottom: 14,
                }}
              >
                Reschedule
              </Text>
            </View>
            <View>
              {/* {props.data.rescheduleCount >= 3 ? (
                <Text
                  style={{
                    color: '#01475b',
                    ...theme.fonts.IBMPlexSansMedium(14),
                    lineHeight: 20,
                    letterSpacing: 0.35,
                    paddingTop: 20,
                    paddingHorizontal: 16,
                  }}
                >
                  {`Since you hace already rescheduled ${
                    props.data.rescheduleCount
                  } times with Dr. ${props.doctor &&
                    props.doctor.firstName}, we will consider this a new paid appointment.`}
                </Text>
              ) : (
                <Text
                  style={{
                    color: '#01475b',
                    ...theme.fonts.IBMPlexSansMedium(14),
                    lineHeight: 20,
                    letterSpacing: 0.35,
                    paddingTop: 20,
                    paddingHorizontal: 16,
                  }}
                >
                  {`We’re sorry that you have to reschedule.\nYou can reschedule up to ${props.data.rescheduleCount}  times for free.`}
                </Text>
              )} */}
              {props.isbelowthree ? (
                <Text
                  style={{
                    color: '#01475b',
                    ...theme.fonts.IBMPlexSansMedium(14),
                    lineHeight: 20,
                    letterSpacing: 0.35,
                    paddingTop: 20,
                    paddingHorizontal: 16,
                  }}
                >
                  {`We’re sorry that you have to reschedule.\nYou can reschedule up to ${rescheduleCounting} ${
                    rescheduleCounting == 1 ? 'time' : 'times'
                  } for free.`}
                </Text>
              ) : (
                <Text
                  style={{
                    color: '#01475b',
                    ...theme.fonts.IBMPlexSansMedium(14),
                    lineHeight: 20,
                    letterSpacing: 0.35,
                    paddingTop: 20,
                    paddingHorizontal: 16,
                  }}
                >
                  {`Since you hace already rescheduled ${props.rescheduleCount -
                    1} times with Dr. ${props.doctor &&
                    props.doctor.firstName}, we will consider this a new paid appointment.`}
                </Text>
              )}

              <Text
                style={{
                  color: '#01475b',
                  ...theme.fonts.IBMPlexSansMedium(14),
                  lineHeight: 20,
                  letterSpacing: 0.35,
                  paddingTop: 20,
                  paddingHorizontal: 16,
                }}
              >
                {`Next slot for Dr. ${props.doctor && props.doctor.firstName} is available on —`}
              </Text>
              {props.reschduleDateTime &&
              props.reschduleDateTime.getDoctorNextAvailableSlot &&
              props.reschduleDateTime.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0] &&
              props.reschduleDateTime.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]
                .availableSlot ? (
                <Text
                  style={{
                    color: '#0087ba',
                    ...theme.fonts.IBMPlexSansMedium(14),
                    lineHeight: 24,
                    letterSpacing: 0.4,
                    paddingTop: 16,
                    paddingHorizontal: 16,
                  }}
                >
                  {moment(
                    props.reschduleDateTime &&
                      props.reschduleDateTime.getDoctorNextAvailableSlot &&
                      props.reschduleDateTime.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0] &&
                      props.reschduleDateTime.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]
                        .availableSlot
                  ).format(' DD MMMM YYYY, hh:mm a')}
                </Text>
              ) : (
                <Text
                  style={{
                    color: '#01475b',
                    ...theme.fonts.IBMPlexSansMedium(14),
                    lineHeight: 20,
                    letterSpacing: 0.35,
                    paddingTop: 20,
                    paddingHorizontal: 16,
                  }}
                >
                  No Slot Available
                </Text>
              )}

              <View
                style={{
                  paddingHorizontal: 0,
                  marginTop: 42,
                  marginBottom: 16,
                  height: 40,
                  flexDirection: 'row',
                }}
              >
                <Button
                  title={'CHANGE SLOT'}
                  style={{
                    flex: 0.5,
                    marginLeft: 20,
                    marginRight: 8,
                    backgroundColor: 'white',
                  }}
                  titleTextStyle={{ color: '#fc9916' }}
                  onPress={() =>
                    getNetStatus().then((status) => {
                      if (status) {
                        console.log('Network status', status);
                        console.log('appointmentdate', moment(props.appadatetime));
                        console.log('today', moment(new Date()));
                        const dateIsAfter = moment(props.appadatetime).isAfter(moment(new Date()));
                        console.log('changeslotbuttonconstion', dateIsAfter);
                        if (dateIsAfter) {
                          props.setdisplayoverlay();
                        } else {
                          setBottompopup(true);
                          //props.setResheduleoverlay(false);
                          // Alert.alert(
                          //   'Appointment cannot be rescheduled once it is past the scheduled time'
                          // );
                        }
                        //dateIsAfter ? props.setdisplayoverlay() : null;
                        // props.setdisplayoverlay();
                      } else {
                        setNetworkStatus(true);
                        setshowSpinner(false);
                        console.log('Network status failed', status);
                      }
                    })
                  }
                />
                <Button
                  title={'ACCEPT'}
                  style={{ flex: 0.5, marginRight: 20, marginLeft: 8 }}
                  onPress={() => {
                    CommonLogEvent('RESCHDULE_POPUP', 'RESCHDULE_POPUP_CLICKED');
                    console.log('appointmentdate', moment(props.appadatetime));
                    console.log('today', moment(new Date()));
                    const dateIsAfter = moment(props.appadatetime).isAfter(moment(new Date()));
                    console.log('changeslotbuttonconstion', dateIsAfter);
                    if (dateIsAfter) {
                      try {
                        props.reschduleDateTime &&
                        props.reschduleDateTime.getDoctorNextAvailableSlot &&
                        props.reschduleDateTime.getDoctorNextAvailableSlot
                          .doctorAvailalbeSlots[0] &&
                        props.reschduleDateTime.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]
                          .availableSlot
                          ? props.acceptChange()
                          : null;
                      } catch (error) {}
                    } else {
                      // Alert.alert(
                      //   'Appointment cannot be rescheduled once it is past the scheduled time'
                      // );
                      setBottompopup(true);
                    }
                    // try {
                    //   props.reschduleDateTime &&
                    //   props.reschduleDateTime.getDoctorNextAvailableSlot &&
                    //   props.reschduleDateTime.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0] &&
                    //   props.reschduleDateTime.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]
                    //     .availableSlot
                    //     ? props.acceptChange()
                    //     : null;
                    // } catch (error) {}
                    //props.acceptChange();
                  }}
                  titleTextStyle={{
                    color: '#ffffff',
                    opacity:
                      props.reschduleDateTime &&
                      props.reschduleDateTime.getDoctorNextAvailableSlot &&
                      props.reschduleDateTime.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0] &&
                      props.reschduleDateTime.getDoctorNextAvailableSlot.doctorAvailalbeSlots[0]
                        .availableSlot
                        ? 1
                        : 0.5,
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
      {networkStatus && <NoInterNetPopup onClickClose={() => networkBack()} />}
      {bottompopup && (
        <BottomPopUp
          title={'Hi:)'}
          description="Appointment cannot be rescheduled once it is past the scheduled time"
        >
          <View style={{ height: 60, alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={{
                height: 60,
                paddingRight: 25,
                backgroundColor: 'transparent',
              }}
              onPress={() => {
                setBottompopup(false);
                props.setResheduleoverlay(false);
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
