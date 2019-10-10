import React, { useEffect } from 'react';
import firebase from 'react-native-firebase';
import { Notification, NotificationOpen } from 'react-native-firebase/notifications';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';

export interface NotificationListenerProps {}

export const NotificationListener: React.FC<NotificationListenerProps> = (props) => {
  const { showAphAlert } = useUIElements();

  useEffect(() => {
    console.log('createNotificationListeners');

    /*
     * Triggered when a particular notification has been received in foreground
     * */
    const notificationListener = firebase.notifications().onNotification((notification) => {
      const { title, body, data } = notification;
      console.log('notificationListener', { notification });

      // const data = JSON.parse(notification.data.gcm.notification.data);
      console.log('notificationListener data', { data });

      showAphAlert!({
        title: `Uh oh.. :)`,
        description: body,
      });
    });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = firebase
      .notifications()
      .getInitialNotification()
      .then((_notificationOpen: NotificationOpen) => {
        if (_notificationOpen) {
          // App was opened by a notification
          // Get the action triggered by the notification being opened
          const action = _notificationOpen.action;
          // Get information about the notification that was opened
          const notification: Notification = _notificationOpen.notification;
          console.log('onNotificationOpened', notification);

          const { title, body } = _notificationOpen.notification;
          showAphAlert!({
            title: `Uh oh.. :)`,
            description: body,
          });
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
          console.log('onNotificationOpened', notification);

          const { title, body } = notificationOpen.notification;
          showAphAlert!({
            title: `Uh oh.. :)`,
            description: body,
          });
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
