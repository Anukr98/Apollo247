import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  BackArrow,
  PlaceHolderDoctor,
  PlaceHolderDoctors,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

const notifications = [
  {
    id: 'Today, 10.05 AM',
    messagename: 'Dr. Neha has assigned 1 of her cases to you',
  },
  {
    id: 'Yesterday, 09.30 PM',
    messagename: 'You have been added to Dr. Vinay’s star doctor’s team',
  },
  {
    id: 'Yesterday, 04.10 PM',
    messagename: 'New message from your follow up patient,Ms. Shreya Khannas',
  },
  {
    id: 'Wednesday, 16th July, 09.30 AM',
    messagename: 'Dr. Neha has assigned 1 of her cases to you',
  },
  {
    id: 'Yesterday, 04.10 PM',
    messagename: 'New message from your follow up patient,Ms. Shreya Khanna',
  },
  {
    id: 'Wednesday, 16th July, 09.30 AM',
    messagename: 'New message from your follow up patient,Ms. Shreya Khanna',
  },

  {
    id: 'Wednesday, 16th July, 06.30 AM',
    messagename: 'New message from your follow up patient,Ms. Shreya Khannas',
  },
];
const styles = StyleSheet.create({
  mainview: {
    backgroundColor: '#ffffff',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationText: {
    ...theme.fonts.IBMPlexSansSemiBold(13),
    color: '#01475b',
    textAlign: 'center',
  },
  dataView: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
  },
  textView: { ...theme.fonts.IBMPlexSansLight(10), color: 'rgba(1, 71, 91, 0.6)' },
  messageText: { ...theme.fonts.IBMPlexSansSemiBold(15), color: '#01475b', marginRight: 20 },
  commonview: { justifyContent: 'center', marginLeft: 5, flex: 1 },
  underline: {
    height: 1,
    width: '100%',
    borderWidth: 1,
    borderColor: '#f0f4f5',
  },
});

const renderNotificationsListView = () => {
  return (
    <View>
      {notifications.map((i, index, array) => {
        return (
          <View>
            <View style={styles.dataView}>
              {index < 3 ? <PlaceHolderDoctors /> : <PlaceHolderDoctor />}
              <View style={styles.commonview}>
                <Text style={styles.messageText}>{i.messagename}</Text>
                <Text style={styles.textView}>{i.id}</Text>
              </View>
            </View>
            <View style={styles.underline}></View>
          </View>
        );
      })}
    </View>
  );
};

export interface NotificationScreenProps extends NavigationScreenProps {}

export const NotificationScreen: React.FC<NotificationScreenProps> = (props) => {
  const showHeaderView = () => {
    return (
      <Header
        containerStyle={{ height: 50 }}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText="NOTIFICATIONS"
      />
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      {showHeaderView()}
      <ScrollView>{renderNotificationsListView()}</ScrollView>
    </SafeAreaView>
  );
};
