import React, { useEffect } from 'react';
import firebase from 'react-native-firebase';
import { Notification, NotificationOpen } from 'react-native-firebase/notifications';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { aphConsole } from '../helpers/helperFunctions';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from './NavigatorContainer';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_APPOINTMENT_DATA } from '../graphql/profiles';
import {
  getAppointmentData,
  getAppointmentDataVariables,
} from '../graphql/types/getAppointmentData';
import { useAllCurrentPatients } from '../hooks/authHooks';
import { View, TouchableOpacity, StyleSheet, Text, AsyncStorage } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import InCallManager from 'react-native-incall-manager';

const styles = StyleSheet.create({
  rescheduleTextStyles: {
    ...theme.viewStyles.yellowTextStyle,
    marginVertical: 10,
    textAlign: 'center',
  },
  claimStyles: {
    flex: 0.5,
    marginLeft: 5,
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    ...theme.viewStyles.shadowStyle,
  },
  rescheduletyles: {
    flex: 0.5,
    marginRight: 5,
    marginLeft: 8,
    backgroundColor: theme.colors.APP_YELLOW_COLOR,
    borderRadius: 10,
    ...theme.viewStyles.shadowStyle,
  },
});

type CustomNotificationType =
  | 'Reschedule_Appointment'
  | 'Upload-Prescription-Order'
  | 'call_started'
  | 'chat_room';

export interface NotificationListenerProps extends NavigationScreenProps {}

export const NotificationListener: React.FC<NotificationListenerProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();

  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();

  const processNotification = async (notification: Notification) => {
    const { title, body, data } = notification;
    const notificationType = data.type as CustomNotificationType;
    aphConsole.log({ notificationType, title, body, data });
    aphConsole.log('processNotification', notification);

    const setCurrentName = await AsyncStorage.getItem('setCurrentName');
    aphConsole.log('setCurrentName', setCurrentName);

    if (
      setCurrentName === AppRoutes.ChatRoom ||
      setCurrentName === AppRoutes.AppointmentDetails ||
      setCurrentName === AppRoutes.AppointmentOnlineDetails
    )
      return;

    aphConsole.log('processNotification after return statement');

    switch (notificationType) {
      case 'Reschedule_Appointment':
        {
          aphConsole.log('Reschedule_Appointment');
          let userName = data.patientName;
          let doctorName = data.doctorName;

          showAphAlert!({
            title: `Hi ${userName},`,
            description: `Unfortunately ${doctorName} will not be able to make it for your appointment due to an emergency`,
            unDismissable: true,
            children: (
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 20,
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginVertical: 18,
                }}
              >
                <TouchableOpacity
                  style={styles.claimStyles}
                  onPress={() => {
                    hideAphAlert && hideAphAlert();
                  }}
                >
                  <Text style={styles.rescheduleTextStyles}>{'CLAIM REFUND'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rescheduletyles}
                  onPress={() => {
                    console.log('data.appointmentId', data.appointmentId);
                    console.log('data.callType', data.callType);
                    getAppointmentData(data.appointmentId, notificationType, '');
                  }}
                >
                  <Text style={[styles.rescheduleTextStyles, { color: 'white' }]}>
                    {'RESCHEDULE'}
                  </Text>
                </TouchableOpacity>
              </View>
            ),
          });
        }
        break;

      case 'Upload-Prescription-Order':
        {
          aphConsole.log('Upload-Prescription-Order called');
          props.navigation.navigate(AppRoutes.YourCart);
        }
        break;

      case 'chat_room':
        {
          let doctorName = data.doctorName;
          let userName = data.patientName;

          aphConsole.log('chat_room');
          showAphAlert!({
            title: `Hi ${userName} :)`,
            description: `Dr. ${doctorName} is waiting to start your consultation. Please proceed to the Consult Room`,
            unDismissable: true,
            children: (
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 20,
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginVertical: 18,
                }}
              >
                <TouchableOpacity
                  style={styles.claimStyles}
                  onPress={() => {
                    hideAphAlert && hideAphAlert();
                  }}
                >
                  <Text style={styles.rescheduleTextStyles}>{'CANCEL'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rescheduletyles}
                  onPress={() => {
                    console.log('data.appointmentId', data.appointmentId);
                    getAppointmentData(data.appointmentId, notificationType, '');
                  }}
                >
                  <Text style={[styles.rescheduleTextStyles, { color: 'white' }]}>
                    {'CONSULT ROOM'}
                  </Text>
                </TouchableOpacity>
              </View>
            ),
          });
        }
        break;

      case 'call_started':
        {
          InCallManager.startRingtone('_BUNDLE_');
          InCallManager.start({ media: 'audio' }); // audio/video, default: audio
          aphConsole.log('call_started');

          let doctorName = data.doctorName;
          let userName = data.patientName;

          showAphAlert!({
            title: `Hi ${userName} :)`,
            description: `Dr. ${doctorName} is waiting for your call response. Please proceed to the Consult Room`,
            unDismissable: true,
            children: (
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 20,
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginVertical: 18,
                }}
              >
                <TouchableOpacity
                  style={styles.claimStyles}
                  onPress={() => {
                    hideAphAlert && hideAphAlert();
                    InCallManager.stopRingtone();
                    InCallManager.stop();
                  }}
                >
                  <Text style={styles.rescheduleTextStyles}>{'CANCEL'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rescheduletyles}
                  onPress={() => {
                    aphConsole.log('data.appointmentId', data.appointmentId);
                    aphConsole.log('data.callType', data.callType);
                    getAppointmentData(data.appointmentId, notificationType, data.callType);
                  }}
                >
                  <Text style={[styles.rescheduleTextStyles, { color: 'white' }]}>
                    {'CONSULT ROOM'}
                  </Text>
                </TouchableOpacity>
              </View>
            ),
          });
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    console.log('createNotificationListeners');
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    const notificationListener = firebase.notifications().onNotification((notification) => {
      aphConsole.log('notificationListener');
      processNotification(notification);
    });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    firebase
      .notifications()
      .getInitialNotification()
      .then((_notificationOpen: NotificationOpen) => {
        if (_notificationOpen) {
          aphConsole.log('_notificationOpen');

          // App was opened by a notification
          // Get the action triggered by the notification being opened
          // const action = _notificationOpen.action;
          processNotification(_notificationOpen.notification);

          try {
            aphConsole.log('notificationOpen', _notificationOpen.notification.notificationId);

            firebase
              .notifications()
              .removeDeliveredNotification(_notificationOpen.notification.notificationId);
          } catch (error) {
            aphConsole.log('notificationOpen error', error);
          }
        }
      })
      .catch(() => {});

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    const onNotificationListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen: NotificationOpen) => {
        if (notificationOpen) {
          aphConsole.log('notificationOpen');

          const notification: Notification = notificationOpen.notification;
          processNotification(notification);
        }
      });

    return function cleanup() {
      aphConsole.log('didmount clean up');
      notificationListener();
      onNotificationListener();
    };
  }, []);

  const getAppointmentData = (
    appointmentId: string,
    notificationType: string,
    callType: string
  ) => {
    aphConsole.log('getAppointmentData', appointmentId, notificationType, callType);
    client
      .query<getAppointmentData, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: {
          appointmentId: appointmentId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((_data: any) => {
        try {
          hideAphAlert && hideAphAlert();

          console.log(
            'GetDoctorNextAvailableSlot',
            _data.data.getAppointmentData.appointmentsHistory
          );
          const appointmentData = _data.data.getAppointmentData.appointmentsHistory;
          if (appointmentData) {
            switch (notificationType) {
              case 'Reschedule-Appointment':
                {
                  appointmentData[0].appointmentType === 'ONLINE'
                    ? props.navigation.navigate(AppRoutes.AppointmentOnlineDetails, {
                        data: appointmentData[0],
                        from: 'notification',
                      })
                    : props.navigation.navigate(AppRoutes.AppointmentDetails, {
                        data: appointmentData[0],
                        from: 'notification',
                      });
                }
                break;

              case 'call_started':
                {
                  // InCallManager.stopRingtone();
                  // InCallManager.stop();
                  props.navigation.navigate(AppRoutes.ChatRoom, {
                    data: appointmentData[0],
                    callType: callType,
                  });
                }
                break;

              case 'chat_room':
                {
                  // InCallManager.stopRingtone();
                  // InCallManager.stop();
                  props.navigation.navigate(AppRoutes.ChatRoom, {
                    data: appointmentData[0],
                    callType: callType,
                  });
                }
                break;

              default:
                break;
            }
          }
        } catch (error) {
          hideAphAlert && hideAphAlert();
        }
      })
      .catch((e: any) => {
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while GetDoctorNextAvailableSlot', error);
      });
  };
  return null;
};
