import React from 'react';
import { StyleSheet, SafeAreaView, View, TouchableOpacity, Text, Switch } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { More } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';

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
  const renderNotificationView = () => {
    return (
      <View style={styles.containerStyle}>
        {NotificationArray.map((serviceTitle, i) => (
          <View key={i} style={{}}>
            <TouchableOpacity key={i} onPress={() => {}}>
              <>
                <View style={styles.viewRowStyle} key={i}>
                  <Text style={styles.textStyle}>{serviceTitle.title}</Text>
                  <Switch />
                </View>
                {i + 1 !== NotificationArray.length && (
                  <View
                    style={{
                      ...theme.viewStyles.lightSeparatorStyle,
                      opacity: 0.5,
                      marginHorizontal: 20,
                    }}
                  />
                )}
              </>
            </TouchableOpacity>
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
          <TouchableOpacity onPress={() => {}}>
            <More />
          </TouchableOpacity>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
      <ScrollView bounces={false}>{renderNotificationView()}</ScrollView>
    </SafeAreaView>
  );
};
