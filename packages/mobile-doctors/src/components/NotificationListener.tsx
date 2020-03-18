import { NavigationScreenProps } from 'react-navigation';
import React, { useEffect, useState } from 'react';
import firebase from 'react-native-firebase';
import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Notification, NotificationOpen } from 'react-native-firebase/notifications';
import { CommonBugFender } from '@aph/mobile-doctors/src/helpers/DeviceHelper';
import AsyncStorage from '@react-native-community/async-storage';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import { useApolloClient } from 'react-apollo-hooks';
import { GetCaseSheet } from '@aph/mobile-doctors/src/graphql/types/GetCaseSheet';
import { GET_CASESHEET, CREATE_CASESHEET_FOR_SRD } from '@aph/mobile-doctors/src/graphql/profiles';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';
import { CreateSeniorDoctorCaseSheet } from '@aph/mobile-doctors/src/graphql/types/CreateSeniorDoctorCaseSheet';

type CustomNotificationType = 'Reminder_Appointment_Casesheet_15' | 'NOTIFICATION_TYPE2';

export interface NotificationListenerProps extends NavigationScreenProps {}

export const NotificationListener: React.FC<NotificationListenerProps> = (props) => {
  const { showAphAlert, hideAphAlert, loading, setLoading } = useUIElements();
  const client = useApolloClient();

  useEffect(() => {
    console.log('createNotificationListeners');
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
        .android.setSmallIcon('@mipmap/ic_launcher') // create this icon in Android Studio
        .android.setColor('#000000') // you can set a color here
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

            try {
              console.log('notificationOpen', _notificationOpen.notification.notificationId);

              firebase
                .notifications()
                .removeDeliveredNotification(_notificationOpen.notification.notificationId);
            } catch (error) {
              CommonBugFender('NotificationListener_firebase_try', error);
            }
          }
        }
      })
      .catch((e) => {
        CommonBugFender('NotificationListener_firebase', e);
      });

    try {
      const channel = new firebase.notifications.Android.Channel(
        'fcm_FirebaseNotifiction_default_channel',
        'Apollo',
        firebase.notifications.Android.Importance.Default
      ).setDescription('Demo app description');
      // .setSound('incallmanager_ringtone.mp3');
      firebase.notifications().android.createChannel(channel);
    } catch (error) {
      CommonBugFender('NotificationListener_channel_try', error);
    }

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

  const processNotification = async (notification: Notification) => {
    const { title, body, data } = notification;
    const notificationType = 'Reminder_Appointment_Casesheet_15'; //data.type as CustomNotificationType;
    // console.log({ notificationType, title, body, data });
    // console.log('processNotification', notification);

    // if (notificationType === 'PRESCRIPTION_READY') {
    //   if (currentScreenName === AppRoutes.ConsultDetails) return;
    // }

    if (
      ['Reminder_Appointment_Casesheet_15', 'Reminder_Appointment_15'].includes(notificationType)
    ) {
      showAlert(data);
    }
    // else if (notificationType === 'NOTIFICATION_TYPE2') {
    //   //do other
    // }
  };
  const showAlert = (data: { [key: string]: string }) => {
    const userName = data.patientName;

    showAphAlert &&
      showAphAlert({
        title: 'Appointment Reminder!',
        description: `Your appointment with ${userName} will start in 15 mins. Please be available online and prepared, accordingly.`,
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
              goConsultRoom(data.appointmentId);
              hideAphAlert && hideAphAlert();
            },
          },
        ],
      });
  };

  const createCaseSheetSRDAPI = (AppId: string) => {
    setLoading && setLoading(true);
    client
      .mutate<CreateSeniorDoctorCaseSheet>({
        mutation: CREATE_CASESHEET_FOR_SRD,
        variables: {
          appointmentId: AppId,
        },
      })
      .then((data) => {
        const caseSheet = g(data, 'data', 'createSeniorDoctorCaseSheet');
        props.navigation.push(AppRoutes.ConsultRoomScreen, {
          AppId: AppId,
          DoctorId: g(caseSheet, 'doctorId'),
          PatientId: g(caseSheet, 'patientId'),
          PatientConsultTime: null,
          PatientInfoAll: null,
          Appintmentdatetime: g(caseSheet, 'appointment', 'appointmentDateTime'),
          AppointmentStatus: g(caseSheet, 'appointment', 'status'),
          AppoinementData: g(caseSheet, 'appointment'),
        });
      })
      .catch(() => {
        setLoading && setLoading(false);
        showAphAlert &&
          showAphAlert({
            title: 'Alert!',
            description: 'Error occured while creating Case Sheet. Please try again',
          });
      });
  };

  const goConsultRoom = (appointmentId: string) => {
    setLoading && setLoading(true);
    client
      .query<GetCaseSheet>({
        query: GET_CASESHEET,
        fetchPolicy: 'no-cache',
        variables: { appointmentId: appointmentId },
      })
      .then((_data) => {
        const caseSheet = g(_data, 'data', 'getCaseSheet');
        props.navigation.push(AppRoutes.ConsultRoomScreen, {
          AppId: appointmentId,
          DoctorId: g(caseSheet, 'caseSheetDetails', 'doctorId'),
          PatientId: g(caseSheet, 'caseSheetDetails', 'patientId'),
          PatientConsultTime: null,
          PatientInfoAll: g(caseSheet, 'patientDetails'),
          Appintmentdatetime: g(
            caseSheet,
            'caseSheetDetails',
            'appointment',
            'appointmentDateTime'
          ),
          AppointmentStatus: g(caseSheet, 'caseSheetDetails', 'appointment', 'status'),
          AppoinementData: g(caseSheet, 'caseSheetDetails', 'appointment'),
        });
      })
      .catch((e) => {
        setLoading && setLoading(false);
        const message = e.message ? e.message.split(':')[1].trim() : '';
        if (message === 'NO_CASESHEET_EXIST') {
          createCaseSheetSRDAPI(appointmentId);
        }
        console.log('Error occured while fetching Doctor GetJuniorDoctorCaseSheet', message);
      });
  };
  return <></>;
};
