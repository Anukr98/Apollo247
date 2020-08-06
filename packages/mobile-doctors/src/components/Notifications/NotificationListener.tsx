import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect } from 'react';
import firebase from 'react-native-firebase';
import { Notification, NotificationOpen } from 'react-native-firebase/notifications';
import { NavigationScreenProps } from 'react-navigation';
import moment from 'moment';
import { useNotification } from '@aph/mobile-doctors/src/components/Notification/NotificationContext';

type CustomNotificationType =
  | 'doctor_appointment_reminder'
  | 'doctor_new_appointment_booked'
  | 'doctor_chat_message'
  | 'doctor_booked_appointment_reschedule';

type NotificationBody = {
  title?: string;
  body?: string;
  type: CustomNotificationType;
  appointmentId?: string;
  patientName?: string;
  date?: string;
};

export interface NotificationListenerProps extends NavigationScreenProps {}

export const NotificationListener: React.FC<NotificationListenerProps> = (props) => {
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { markAsRead, fetchNotifications } = useNotification();

  useEffect(() => {
    try {
      const channel = new firebase.notifications.Android.Channel(
        'fcm_FirebaseNotifiction_default_channel',
        'Apollo',
        firebase.notifications.Android.Importance.Default
      ).setDescription('Demo app description');
      firebase.notifications().android.createChannel(channel);
    } catch (error) {
      CommonBugFender('NotificationListener_channel_try', error);
    }

    /*
     * Triggered when a particular notification has been received in foreground
     * */
    const notificationListener = firebase.notifications().onNotification((notification) => {
      console.log('notificationListener');
      const localNotification = new firebase.notifications.Notification()
        // .setSound('incallmanager_ringtone.mp3')
        .setNotificationId(notification.notificationId)
        .setTitle(notification.title)
        .setBody(notification.body)
        .setData(notification.data)
        .android.setChannelId('fcm_FirebaseNotifiction_default_channel') // e.g. the id you chose above
        .android.setSmallIcon('@drawable/ic_notification_white') // create this icon in Android Studio
        .android.setColor('#0087ba') // you can set a color here
        .android.setPriority(firebase.notifications.Android.Priority.Default);
      firebase
        .notifications()
        .displayNotification(localNotification)
        .catch((err) => console.error(err));

      processNotification(notification);
    });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    firebase
      .notifications()
      .getInitialNotification()
      .then(async (_notificationOpen: NotificationOpen) => {
        if (_notificationOpen) {
          console.log('_notificationOpen');
          const notification = _notificationOpen.notification;
          const lastNotification = await AsyncStorage.getItem('lastNotification');
          if (lastNotification !== notification.notificationId) {
            await AsyncStorage.setItem('lastNotification', notification.notificationId);
            // App was opened by a notification
            // Get the action triggered by the notification being opened
            // const action = _notificationOpen.action;
            processNotification(_notificationOpen.notification);
            dismissNotification(_notificationOpen.notification.notificationId);
          }
        }
      })
      .catch((e) => {
        CommonBugFender('NotificationListener_firebase', e);
      });

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
      notificationListener();
      onNotificationListener();
    };
  }, []);

  const dismissNotification = (notificationId: string) => {
    try {
      firebase.notifications().removeDeliveredNotification(notificationId);
    } catch (error) {
      CommonBugFender('Dismiss_Notification', error);
    }
  };
  const processNotification = async (notification: Notification) => {
    const showInApp = JSON.parse((await AsyncStorage.getItem('showInAppNotification')) || 'true');
    if (!showInApp) {
      return;
    }
    const data = notification.data as NotificationBody;
    if (data.type === 'doctor_chat_message') {
      fetchNotifications();
      showAphAlert &&
        showAphAlert({
          title: `${data.patientName || 'Patient'} sent message`,
          description: notification.body || data.body,
          CTAs: [
            {
              text: 'CANCEL',
              type: 'white-button',
              onPress: () => {
                hideAphAlert && hideAphAlert();
              },
            },
            {
              text: 'CHAT',
              type: 'orange-button',
              onPress: () => {
                hideAphAlert && hideAphAlert();
                props.navigation.push(AppRoutes.ConsultRoomScreen, {
                  AppId: data.appointmentId,
                  activeTabIndex: 1,
                });
                if (data.appointmentId) {
                  markAsRead(data.appointmentId, () => {
                    fetchNotifications();
                  });
                }
              },
            },
          ],
        });
    } else if (data.type === 'doctor_appointment_reminder') {
      const date =
        data.date && moment(data.date, 'YYYY-MM-DD HH:mm:ss').isValid()
          ? moment(data.date).toDate()
          : new Date();
      dismissNotification(notification.notificationId);
      showAphAlert &&
        showAphAlert({
          title: data.title || 'Appointment Reminder!',
          description: data.body,
          CTAs: [
            {
              text: 'CANCEL',
              type: 'white-button',
              onPress: () => {
                hideAphAlert && hideAphAlert();
              },
            },
            {
              text: 'CONSULT ROOM',
              type: 'orange-button',
              onPress: () => {
                hideAphAlert && hideAphAlert();
                if (data.appointmentId) {
                  AsyncStorage.setItem('requestCompleted', 'false');
                  props.navigation.replace(AppRoutes.TabBar, {
                    goToDate: date,
                    openAppointment: data.appointmentId,
                  });
                } else {
                  showAphAlert &&
                    showAphAlert({
                      title: 'Alert!',
                      description: 'Unable to open appointment',
                      CTAs: [
                        {
                          text: 'CANCEL',
                          type: 'white-button',
                          onPress: () => {
                            hideAphAlert && hideAphAlert();
                          },
                        },
                        {
                          text: 'OPEN CALENDER',
                          type: 'orange-button',
                          onPress: () => {
                            hideAphAlert && hideAphAlert();
                            props.navigation.replace(AppRoutes.TabBar, { goToDate: new Date() });
                          },
                        },
                      ],
                    });
                }
              },
            },
          ],
        });
    } else if (data.type === 'doctor_new_appointment_booked') {
      const date =
        data.date && moment(data.date, 'YYYY-MM-DD HH:mm:ss').isValid()
          ? moment(data.date).toDate()
          : new Date();
      dismissNotification(notification.notificationId);
      showAphAlert &&
        showAphAlert({
          title: data.title || `A New Appointment is scheduled with ${data.patientName}`,
          description: data.body || `at ${moment(date).format('YYYY-MM-DD hh:mm A')}`,
          CTAs: [
            {
              text: 'CANCEL',
              type: 'white-button',
              onPress: () => {
                hideAphAlert && hideAphAlert();
              },
            },
            {
              text: 'OPEN CALENDER',
              type: 'orange-button',
              onPress: () => {
                hideAphAlert && hideAphAlert();
                props.navigation.replace(AppRoutes.TabBar, { goToDate: date });
              },
            },
          ],
        });
    } else if (data.type === 'doctor_booked_appointment_reschedule') {
      const date =
        data.date && moment(data.date, 'YYYY-MM-DD HH:mm:ss').isValid()
          ? moment(data.date).toDate()
          : new Date();
      dismissNotification(notification.notificationId);
      showAphAlert &&
        showAphAlert({
          title: data.title || `Your appointment with ${data.patientName} has been rescheduled`,
          description: data.body || `to ${moment(date).format('YYYY-MM-DD hh:mm A')}`,
          CTAs: [
            {
              text: 'CANCEL',
              type: 'white-button',
              onPress: () => {
                hideAphAlert && hideAphAlert();
              },
            },
            {
              text: 'OPEN CALENDER',
              type: 'orange-button',
              onPress: () => {
                hideAphAlert && hideAphAlert();
                props.navigation.replace(AppRoutes.TabBar, { goToDate: date });
              },
            },
          ],
        });
    } else {
      dismissNotification(notification.notificationId);
      showAphAlert &&
        showAphAlert({
          title: notification.title || data.title,
          description: notification.body || data.date,
        });
    }
  };

  return <></>;
};
