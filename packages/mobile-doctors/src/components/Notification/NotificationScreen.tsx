import NotificationScreenStyles from '@aph/mobile-doctors/src/components/Notification/NotificationScreen.styles';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import {
  BackArrow,
  PlaceHolderDoctor,
  PlaceHolderDoctors,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

const notifications = [];
const styles = NotificationScreenStyles;

const renderNotificationsListView = () => {
  return (
    <View>
      {/* {notifications.map((i, index, array) => {
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
      })} */}
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
        headerText={strings.appointments.notifications_title}
      />
    );
  };
  return (
    <SafeAreaView style={styles.scrollArea}>
      {showHeaderView()}
      <ScrollView bounces={false}>{renderNotificationsListView()}</ScrollView>
    </SafeAreaView>
  );
};
