import React, { useEffect } from 'react';
import firebase from 'react-native-firebase';
import { Notification, NotificationOpen } from 'react-native-firebase/notifications';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { aphConsole } from '../helpers/helperFunctions';
import { NavigationScreenProps } from 'react-navigation';
import { AppRoutes } from './NavigatorContainer';

type CustomNotificationType = 'Reschedule-Appointment' | 'Upload-Prescription-Order' | '';

export interface NotificationListenerProps extends NavigationScreenProps {}

export const NotificationListener: React.FC<NotificationListenerProps> = (props) => {
  const { showAphAlert } = useUIElements();

  const processNotification = (notification: Notification) => {
    const { title, body, data } = notification;
    const notificationType: CustomNotificationType = data.type;
    aphConsole.log({ notificationType, title, body, data });

    switch (notificationType) {
      case 'Reschedule-Appointment':
        {
          console.log('Reschedule-Appointment called');
        }
        break;

      case 'Upload-Prescription-Order':
        {
          console.log('Upload-Prescription-Order called');
          props.navigation.navigate(AppRoutes.YourCart);
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

  return null;
};
