import React, { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { StyleSheet, SafeAreaView, View, TouchableOpacity, Text, BackHandler } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ToggleOn, ToggleOff } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  GET_NOTIFICATION_SETTINGS,
  SAVE_NOTIFICATION_SETTINGS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { useQuery, useApolloClient } from 'react-apollo-hooks';
import {
  getPatientNotificationSettings,
  getPatientNotificationSettings_getPatientNotificationSettings_notificationSettings,
} from '@aph/mobile-patients/src/graphql/types/getPatientNotificationSettings';
import {
  savePatientNotificationSettings,
  savePatientNotificationSettingsVariables,
} from '@aph/mobile-patients/src/graphql/types/savePatientNotificationSettings';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';

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
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
};

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
  const [showSpinner, setshowSpinner] = useState<boolean>(true);
  const [backPressCount, setbackPressCount] = useState<number>(0);

  const { currentPatient } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

  const client = useApolloClient();
  const NotificationArray: NotificationArray[] = [
    {
      id: 1,
      title: 'Upcoming Appointment Reminders',
      value: upcomingAppointmentReminders,
      setValue: setupcomingAppointmentReminders,
    },
    {
      id: 2,
      title: 'Reschedule/Cancellation Notifications',
      value: reScheduleAndCancellationNotification,
      setValue: setreScheduleAndCancellationNotification,
    },
    {
      id: 3,
      title: 'Payment Notifications',
      value: paymentNotification,
      setValue: setpaymentNotification,
    },
    {
      id: 4,
      title: 'Commission Notifications',
      value: commissionNotification,
      setValue: setcommissionNotification,
    },
    {
      id: 5,
      title: 'Messages from Doctors',
      value: messageFromDoctorNotification,
      setValue: setmessageFromDoctorNotification,
    },
    {
      id: 7,
      title: 'Play sounds for notifications',
      value: playNotificationSound,
      setValue: setplayNotificationSound,
    },
  ];

  const { data, error } = useQuery<getPatientNotificationSettings>(GET_NOTIFICATION_SETTINGS, {
    fetchPolicy: 'no-cache',
    variables: {
      patient: currentPatient && currentPatient.id ? currentPatient.id : '',
    },
  });
  if (error) {
  } else {
    if (
      data &&
      data.getPatientNotificationSettings &&
      data.getPatientNotificationSettings.notificationSettings &&
      notifications !== data.getPatientNotificationSettings.notificationSettings
    ) {
      setshowSpinner(false);
      setnotifications(data.getPatientNotificationSettings.notificationSettings);
      const settings = data.getPatientNotificationSettings.notificationSettings;
      setcommissionNotification(settings.commissionNotification);
      setmessageFromDoctorNotification(settings.messageFromDoctorNotification);
      setpaymentNotification(settings.paymentNotification);
      setplayNotificationSound(settings.playNotificationSound);
      setreScheduleAndCancellationNotification(settings.reScheduleAndCancellationNotification);
      setupcomingAppointmentReminders(settings.upcomingAppointmentReminders);
    } else if (
      showSpinner &&
      data &&
      data.getPatientNotificationSettings &&
      data.getPatientNotificationSettings.notificationSettings === null
    ) {
      setshowSpinner(false);
    }
  }

  const saveData = useCallback(() => {
    setshowSpinner(true);
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
        setshowSpinner(false);
        props.navigation.goBack();
      })
      .catch((error) => {
        setshowSpinner(false);
        CommonBugFender('NotificationSettings_saveData', error);
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
    props.navigation,
  ]);

  const onPressBack = () => {
    saveData();
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      setbackPressCount(backPressCount + 1);
      if (backPressCount === 1) {
        saveData();
      }
      return true;
    });
    return function cleanup() {
      backHandler.remove();
    };
  }, [backPressCount, saveData]);

  const renderNotificationView = () => {
    return (
      <View style={styles.containerStyle}>
        {NotificationArray.map((item, index) => {
          return (
            <View key={index}>
              <View style={styles.viewRowStyle}>
                <Text style={styles.textStyle}>{item.title}</Text>
                {item.value ? (
                  <TouchableOpacity onPress={() => item.setValue(!item.value)}>
                    <ToggleOn />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => item.setValue(!item.value)}>
                    <ToggleOff />
                  </TouchableOpacity>
                )}
              </View>
              {NotificationArray.length !== index + 1 && <View style={styles.separatorStyles} />}
            </View>
          );
        })}
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          container={{
            ...theme.viewStyles.cardViewStyle,
            borderRadius: 0,
          }}
          leftIcon="backArrow"
          title="NOTIFICATION SETTINGS"
          onPressLeftIcon={onPressBack}
        />
        <ScrollView bounces={false}>{renderNotificationView()}</ScrollView>
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
