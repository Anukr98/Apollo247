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
import { getNetStatus } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NoInterNetPopup } from '@aph/mobile-patients/src/components/ui/NoInterNetPopup';
import {
  CommonScreenLog,
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { BottomPopUp } from '@aph/mobile-patients/src/components/ui/BottomPopUp';
import { APPOINTMENT_STATE } from '@aph/mobile-patients/src/graphql/types/globalTypes';

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
  reschduleDateTime: string;
  data: any;
  rescheduleCount: number;
  cancelAppointmentApi: () => void;
}
export const ReschedulePopUp: React.FC<ReschedulePopUpProps> = (props) => {
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [rescheduleCounting, setRescheduleCounting] = useState<number>(1);
  const [networkStatus, setNetworkStatus] = useState<boolean>(false);
  const [bottompopup, setBottompopup] = useState<boolean>(false);

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
      CommonBugFender('ReschedulePopUp_setRescheduleCounting_try', error);
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

  const acceptChange = () => {
    try {
      props.reschduleDateTime ? props.acceptChange() : null;
    } catch (error) {
      CommonBugFender('ReschedulePopUp_acceptChange_try', error);
    }
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
              {props.isbelowthree || props.data.appointmentState === 'AWAITING_RESCHEDULE' ? (
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
                  {`We’re sorry that you have to reschedule.`}
                  {props.data.appointmentState !== 'AWAITING_RESCHEDULE' &&
                    `\nYou can reschedule up to ${rescheduleCounting} ${
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
                  {`You have reached limit of rescheduling the same appointment for 3 times, please confirm if you want to proceed with Cancelling this appointment`}
                  {/* {`Since you hace already rescheduled ${props.rescheduleCount -
                    1} times with Dr. ${props.doctor &&
                    props.doctor.firstName}, we will consider this a new paid appointment.`} */}
                </Text>
              )}
              {props.isbelowthree || props.data.appointmentState === 'AWAITING_RESCHEDULE' ? (
                <>
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
                    {`Next slot for Dr. ${props.doctor &&
                      props.doctor.firstName} is available on —`}
                  </Text>
                  {props.reschduleDateTime ? (
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
                      {moment(props.reschduleDateTime && props.reschduleDateTime).format(
                        ' DD MMMM YYYY, hh:mm A'
                      )}
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
                </>
              ) : null}

              {props.isbelowthree || props.data.appointmentState === 'AWAITING_RESCHEDULE' ? (
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
                      getNetStatus()
                        .then((status) => {
                          if (status) {
                            const dateIsAfter = moment(props.appadatetime).isAfter(
                              moment(new Date())
                            );
                            if (
                              props.data.appointmentState ===
                                APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
                              dateIsAfter
                            )
                              props.setdisplayoverlay();
                            else {
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
                          }
                        })
                        .catch((e) => {
                          CommonBugFender('ReschedulePopUp_getNetStatus', e);
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

                      if (
                        props.data.appointmentState === APPOINTMENT_STATE.AWAITING_RESCHEDULE ||
                        dateIsAfter
                      )
                        acceptChange();
                      else {
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
                      opacity: props.reschduleDateTime ? 1 : 0.5,
                    }}
                  />
                </View>
              ) : (
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
                    title={'NO'}
                    style={{
                      flex: 0.5,
                      marginLeft: 20,
                      marginRight: 8,
                      backgroundColor: 'white',
                    }}
                    titleTextStyle={{ color: '#fc9916' }}
                    onPress={() => props.setResheduleoverlay(false)}
                  />
                  <Button
                    title={'YES'}
                    style={{ flex: 0.5, marginRight: 20, marginLeft: 8 }}
                    onPress={() => {
                      props.setResheduleoverlay(false);
                      props.cancelAppointmentApi();
                    }}
                  />
                </View>
              )}
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
