import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, SafeAreaView, View, TouchableOpacity, Text, Switch } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { More } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  GET_NOTIFICATION_SETTINGS,
  SAVE_NOTIFICATION_SETTINGS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useQuery, useApolloClient } from 'react-apollo-hooks';
import {
  getPatientNotificationSettings,
  getPatientNotificationSettings_getPatientNotificationSettings_notificationSettings,
} from '@aph/mobile-patients/src/graphql/types/getPatientNotificationSettings';
import {
  savePatientNotificationSettings,
  savePatientNotificationSettingsVariables,
} from '@aph/mobile-patients/src/graphql/types/savePatientNotificationSettings';

const styles = StyleSheet.create({
  textStyle: {
    color: theme.colors.LIGHT_BLUE,
    lineHeight: 20,
    textAlign: 'left',
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  viewRowStyle: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 55,
    marginTop: 0,
  },
  containerStyle: {
    ...theme.viewStyles.cardContainer,
    shadowRadius: 20,
    marginTop: 20,
    marginBottom: 24,
    paddingVertical: 5,
    backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
  },
  separatorStyles: {
    ...theme.viewStyles.lightSeparatorStyle,
    opacity: 0.5,
    marginHorizontal: 20,
  },
});

type NotificationArray = {
  id: number;
  title: string;
  status: boolean;
};

const NotificationArray: NotificationArray[] = [
  {
    id: 1,
    title: 'Upcoming Appointment Reminders',
    status: false,
  },
  {
    id: 2,
    title: 'Reschedule/Cancellation Notifications',
    status: false,
  },
  {
    id: 3,
    title: 'Payment Notifications',
    status: false,
  },
  {
    id: 4,
    title: 'Commission Notifications',
    status: false,
  },
  {
    id: 5,
    title: 'Messages from Doctors',
    status: false,
  },
  {
    id: 6,
    title: 'Chats from Patients',
    status: false,
  },
  {
    id: 7,
    title: 'Play sounds for notifications',
    status: false,
  },
  {
    id: 8,
    title: 'Vibrate on notifications',
    status: false,
  },
  {
    id: 9,
    title: 'Do Not Disturb Mode',
    status: false,
  },
];

export interface NotificationSettingsProps extends NavigationScreenProps {}
export const NotificationSettings: React.FC<NotificationSettingsProps> = (props) => {
  const [notifications, setnotifications] = useState<
    getPatientNotificationSettings_getPatientNotificationSettings_notificationSettings
  >();
  const [commissionNotification, setcommissionNotification] = useState<boolean>(false);
  const [messageFromDoctorNotification, setmessageFromDoctorNotification] = useState<boolean>(
    false
  );

  const [playNotificationSound, setplayNotificationSound] = useState<boolean>(false);
  const [
    reScheduleAndCancellationNotification,
    setreScheduleAndCancellationNotification,
  ] = useState<boolean>(false);
  const [paymentNotification, setpaymentNotification] = useState<boolean>(false);
  const [upcomingAppointmentReminders, setupcomingAppointmentReminders] = useState<boolean>(false);

  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();

  console.log(currentPatient);
  const { data, error } = useQuery<getPatientNotificationSettings>(GET_NOTIFICATION_SETTINGS, {
    variables: {
      patient: currentPatient && currentPatient.id ? currentPatient.id : '',
    },
  });
  if (error) {
    console.log('error', error);
  } else {
    console.log(data);
    if (
      data &&
      data.getPatientNotificationSettings &&
      data.getPatientNotificationSettings.notificationSettings &&
      notifications !== data.getPatientNotificationSettings.notificationSettings
    ) {
      console.log(data, 'setnotifications');

      setnotifications(data.getPatientNotificationSettings.notificationSettings);
    }
  }

  const saveData = useCallback(() => {
    client
      .mutate<savePatientNotificationSettings, savePatientNotificationSettingsVariables>({
        mutation: SAVE_NOTIFICATION_SETTINGS,
        variables: {
          notificationSettingsInput: {
            patient: currentPatient && currentPatient.id ? currentPatient.id : '',
            commissionNotification,
            messageFromDoctorNotification,
            playNotificationSound,
            reScheduleAndCancellationNotification,
            paymentNotification,
            upcomingAppointmentReminders,
          },
        },
      })
      .then(({ data }) => {
        console.log(data, 'result');
      })
      .catch((error) => {
        console.log('Error occured', { error });
      });
  }, [
    client,
    commissionNotification,
    currentPatient,
    messageFromDoctorNotification,
    paymentNotification,
    playNotificationSound,
    reScheduleAndCancellationNotification,
    upcomingAppointmentReminders,
  ]);

  useEffect(() => {
    saveData();
  }, [saveData, upcomingAppointmentReminders]);

  const renderNotificationView = () => {
    return (
      <View style={styles.containerStyle}>
        {NotificationArray.map((serviceTitle, i) => (
          <View key={i} style={{}}>
            <View>
              <>
                <View style={styles.viewRowStyle}>
                  <Text style={styles.textStyle}>{serviceTitle.title}</Text>
                  <Switch value={false} onValueChange={(value) => {}} />
                </View>
                <View style={styles.separatorStyles} />
              </>
            </View>
          </View>
        ))}
      </View>
    );
  };
  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon="backArrow"
        title="NOTIFICATION SETTINGS"
        rightComponent={
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <More />
          </TouchableOpacity>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
      <ScrollView bounces={false}>{renderNotificationView()}</ScrollView>
    </SafeAreaView>
  );
};
