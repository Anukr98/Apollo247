import React, { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  Switch,
  BackHandler,
} from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { More, ToggleOn, ToggleOff } from '@aph/mobile-patients/src/components/ui/Icons';
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
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

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
    // {
    //   id: 6,
    //   title: 'Chats from Patients',
    //   value: upcomingAppointmentReminders,
    // setValue: setupcomingAppointmentReminders
    // },
    {
      id: 7,
      title: 'Play sounds for notifications',
      value: playNotificationSound,
      setValue: setplayNotificationSound,
    },
    // {
    //   id: 8,
    //   title: 'Vibrate on notifications',
    //   value: playNotificationSound,
    //   setValue: setplayNotificationSound,
    // },
    // {
    //   id: 9,
    //   title: 'Do Not Disturb Mode',
    //   value: upcomingAppointmentReminders,
    // setValue: setupcomingAppointmentReminders
    // },
  ];

  console.log(currentPatient);
  const { data, error } = useQuery<getPatientNotificationSettings>(GET_NOTIFICATION_SETTINGS, {
    fetchPolicy: 'no-cache',
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
        console.log(data, 'result');
        props.navigation.goBack();
      })
      .catch((error) => {
        setshowSpinner(false);
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

  // useEffect(() => {
  //   saveData();
  // }, [saveData, upcomingAppointmentReminders]);

  const renderRow = (
    label: string,
    value: boolean,
    setValue: Dispatch<SetStateAction<boolean>>
  ) => {
    return (
      <View>
        <View style={styles.viewRowStyle}>
          <Text style={styles.textStyle}>{label}</Text>
          {/* <Switch value={value} onValueChange={(value) => setValue(value)} /> */}
          {value && (
            <TouchableOpacity onPress={() => setValue(!value)}>
              <ToggleOn />
            </TouchableOpacity>
          )}
          {!value && (
            <TouchableOpacity onPress={() => setValue(!value)}>
              <ToggleOff />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.separatorStyles} />
      </View>
    );
  };

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
        {/* <View>
          <View style={styles.viewRowStyle}>
            <Text style={styles.textStyle}></Text>
            <Switch value={false} onValueChange={(value) => {}} />
          </View>
          <View style={styles.separatorStyles} />
        </View> */}
      </View>
    );

    // return (
    //   <View style={styles.containerStyle}>
    //     {NotificationArray.map((serviceTitle, i) => (
    //       <View key={i} style={{}}>
    //         <View>
    //           <>
    //             <View style={styles.viewRowStyle}>
    //               <Text style={styles.textStyle}>{serviceTitle.title}</Text>
    //               <Switch value={false} onValueChange={(value) => {}} />
    //             </View>
    //             <View style={styles.separatorStyles} />
    //           </>
    //         </View>
    //       </View>
    //     ))}
    //   </View>
    // );
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
          // rightComponent={
          //   <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          //     <More />
          //   </TouchableOpacity>
          // }
          onPressLeftIcon={onPressBack}
        />
        <ScrollView bounces={false}>{renderNotificationView()}</ScrollView>
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
