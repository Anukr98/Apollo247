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
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';

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

type CustomNotificationType = 'Reschedule-Appointment' | 'Upload-Prescription-Order' | 'Chat-Room';

export interface NotificationListenerProps extends NavigationScreenProps {}

export const NotificationListener: React.FC<NotificationListenerProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();

  const { showAphAlert, hideAphAlert } = useUIElements();
  const client = useApolloClient();

  const processNotification = (notification: Notification) => {
    const { title, body, data } = notification;
    const notificationType = data.type as CustomNotificationType;
    aphConsole.log({ notificationType, title, body, data });
    aphConsole.log('notification', notification);

    switch (notificationType) {
      case 'Reschedule-Appointment':
        {
          console.log('Reschedule-Appointment called');
          let userName = data.patientName;
          let doctorName = data.doctorName;

          showAphAlert!({
            title: `Hi ${userName},`,
            description: `Unfortunately ${doctorName} will not be able to make it for your appointment due to an emergency`,
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
                    getAppointmentData(data.appointmentId, notificationType);
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
          console.log('Upload-Prescription-Order called');
          props.navigation.navigate(AppRoutes.YourCart);
        }
        break;

      case 'Chat-Room':
        {
          let doctorName = data.doctorName;

          console.log('Chat-Room');
          showAphAlert!({
            title: 'Hi :)',
            description: `Dr. ${doctorName} is waiting for you in chat room. Please join.`,
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
                    getAppointmentData(data.appointmentId, notificationType);
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
      console.log('notificationListener');
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
          console.log('_notificationOpen');

          // App was opened by a notification
          // Get the action triggered by the notification being opened
          // const action = _notificationOpen.action;
          processNotification(_notificationOpen.notification);
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
          console.log('notificationOpen');

          const notification: Notification = notificationOpen.notification;
          processNotification(notification);
        }
      });

    return function cleanup() {
      console.log('didmount clean up');
      notificationListener();
      onNotificationListener();
    };
  }, []);

  const getAppointmentData = (appointmentId: string, notificationType: string) => {
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
          console.log(
            'GetDoctorNextAvailableSlot',
            _data.data.getAppointmentData.appointmentsHistory
          );
          const appointmentData = _data.data.getAppointmentData.appointmentsHistory;
          if (appointmentData) {
            hideAphAlert && hideAphAlert();

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

              case 'Chat-Room':
                {
                  hideAphAlert && hideAphAlert();
                  props.navigation.navigate(AppRoutes.ChatRoom, {
                    data: appointmentData[0],
                  });
                }
                break;

              default:
                break;
            }
          }
        } catch (error) {}
      })
      .catch((e: any) => {
        const error = JSON.parse(JSON.stringify(e));
        console.log('Error occured while GetDoctorNextAvailableSlot', error);
      });
  };
  return null;
};
