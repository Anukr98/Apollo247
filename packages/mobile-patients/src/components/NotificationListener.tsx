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

type CustomNotificationType = 'Reschedule-Appointment' | 'Upload-Prescription-Order' | 'Chat-Room';

export interface NotificationListenerProps extends NavigationScreenProps {}

export const NotificationListener: React.FC<NotificationListenerProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();

  const { showAphAlert } = useUIElements();
  const client = useApolloClient();

  const processNotification = (notification: Notification) => {
    const { title, body, data } = notification;
    const notificationType = data.type as CustomNotificationType;
    aphConsole.log({ notificationType, title, body, data });

    switch (notificationType) {
      case 'Reschedule-Appointment':
        {
          console.log('Reschedule-Appointment called');
          let userName =
            currentPatient && currentPatient.firstName
              ? currentPatient.firstName.split(' ')[0]
              : '';
          userName = userName.toLowerCase();
          let doctorName = 'Anuradha';
          showAphAlert!({
            title: `Hi ${userName},`,
            description: `Unfortunately ${doctorName} will not be able to make it for your appointment due to an emergency`,
            onPressOk: () => {},
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
          console.log('Chat-Room');
          showAphAlert!({
            title: 'Hi :)',
            description: 'Dr. Sushma is waiting for you in chat room. Please join.',
            onPressOk: () => {
              getAppointmentData(data.appointmentId);
            },
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

  const getAppointmentData = (appointmentId: string) => {
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
            props.navigation.navigate(AppRoutes.ChatRoom, {
              data: appointmentData[0],
            });
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
