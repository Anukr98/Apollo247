import {
  BackArrow,
  PlaceHolderDoctor,
  PlaceHolderDoctors,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const notifications = [
  {
    id: 'Today, 10.05 AM',
    messagename: 'Dr. Neha has assigned 1 of her casesto you',
  },
  {
    id: 'Yesterday, 09.30 PM',
    messagename: 'You have been added to Dr. Vinay’sstar doctor’s team',
  },
  {
    id: 'Yesterday, 04.10 PM',
    messagename: 'New message from your follow up patient,Ms. Shreya Khannas',
  },
  {
    id: 'Wednesday, 16th July, 09.30 AM',
    messagename: 'Dr. Neha has assigned 1 of her casesto you',
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
  messageText: { ...theme.fonts.IBMPlexSansSemiBold(15), color: '#01475b' },
  commonview: { justifyContent: 'center', marginLeft: 5, flex: 1 },
});

const showHeaderView = () => {
  return (
    <View style={styles.mainview}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity>
          <View style={{ marginLeft: 20 }}>
            <BackArrow />
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 8 }}>
        <Text style={styles.notificationText}>NOTIFICATIONS</Text>
      </View>
    </View>
  );
};
const renderNotificationsListView = () => {
  return (
    <View>
      {notifications.map((i, index, array) => {
        return (
          <View>
            {index < 3 ? (
              <View style={styles.dataView}>
                <PlaceHolderDoctors />
                <View style={styles.commonview}>
                  <Text style={styles.messageText}>{i.messagename}</Text>
                  <Text style={styles.textView}>{i.id}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.dataView}>
                <PlaceHolderDoctor />
                <View style={styles.commonview}>
                  <Text style={styles.messageText}>{i.messagename}</Text>
                  <Text style={styles.textView}>{i.id}</Text>
                </View>
              </View>
            )}

            <View
              style={{
                height: 1,
                width: '100%',
                borderWidth: 1,
                borderColor: '#f0f4f5',
              }}
            ></View>
          </View>
        );
      })}
    </View>
  );
};

export interface NotificationScreenProps {}

export const NotificationScreen: React.FC<NotificationScreenProps> = (props) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      {showHeaderView()}
      <ScrollView>{renderNotificationsListView()}</ScrollView>
    </SafeAreaView>
  );
};
