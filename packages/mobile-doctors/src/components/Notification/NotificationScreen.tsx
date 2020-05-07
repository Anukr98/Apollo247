import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { useNotification } from '@aph/mobile-doctors/src/components/Notification/NotificationContext';
import NotificationScreenStyles from '@aph/mobile-doctors/src/components/Notification/NotificationScreen.styles';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { BackArrow, ChatWhite } from '@aph/mobile-doctors/src/components/ui/Icons';
import { getNotifications_getNotifications_notificationData } from '@aph/mobile-doctors/src/graphql/types/getNotifications';
import strings from '@aph/mobile-doctors/src/strings/strings.json';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import moment from 'moment';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image as ImageNative } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';

const styles = NotificationScreenStyles;
export interface NotificationScreenProps extends NavigationScreenProps {}

export const NotificationScreen: React.FC<NotificationScreenProps> = (props) => {
  const { notifications, fetchNotifications, markAsRead } = useNotification();
  const showHeaderView = () => {
    return (
      <Header
        containerStyle={styles.headerContainer}
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => props.navigation.pop(),
          },
        ]}
        headerText={strings.appointments.notifications_title}
        titleTextViewStyle={{ marginLeft: -26 }}
      />
    );
  };
  const chatIcon = (url?: string) => {
    if (url) {
      return (
        <View style={styles.chatIconContainer}>
          <ImageNative
            placeholderStyle={styles.placeHolderLoading}
            PlaceholderContent={<ActivityIndicator animating={true} size="small" color="green" />}
            source={{ uri: url }}
            style={styles.imageStyle}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.chatIconContainer}>
          <ChatWhite />
        </View>
      );
    }
  };

  const renderNotification = (item: getNotifications_getNotifications_notificationData | null) => {
    if (item) {
      return (
        <TouchableOpacity
          onPress={() => {
            if (item.appointmentId) {
              markAsRead(item.appointmentId, (success) => {
                fetchNotifications();
              });
            }
            props.navigation.push(AppRoutes.ConsultRoomScreen, {
              DoctorId: item.doctorId,
              PatientId: item.patientId,
              PatientConsultTime: null,
              AppId: item.appointmentId,
              Appintmentdatetime: '',
              activeTabIndex: 1,
            });
          }}
        >
          <View style={styles.notificationContainer}>
            <View style={styles.iconContainer}>{chatIcon()}</View>
            <View style={styles.textContainer}>
              <Text style={styles.mainTextStyle}>
                {`There are ${item.unreadNotificationsCount} new message${
                  item.unreadNotificationsCount !== 1 ? 's' : ''
                } from your patient, `}
                <Text
                  style={styles.highText}
                >{`${item.patientFirstName} ${item.patientLastName}`}</Text>
              </Text>
              <Text style={styles.subText}>
                {moment(item.lastUnreadMessageDate).calendar('', {
                  sameDay: '[Today], hh:mm A',
                  nextDay: '[Tomorrow]',
                  nextWeek: 'DD MMM YYYY, hh:mm A',
                  lastDay: '[Yesterday], hh:mm A',
                  lastWeek: 'DD MMM YYYY, hh:mm A',
                  sameElse: 'DD MMM YYYY, hh:mm A',
                })}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };
  const [refresh, setRefresh] = useState<boolean>(false);
  const [dataRefetched, setDataRefetched] = useState<boolean>(false);

  const renderEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTextStyle}>
          {dataRefetched ? 'No new notifications' : 'All caught up'}
        </Text>
        <Text style={styles.emptySubStyle}>{dataRefetched ? '' : 'pull to refresh'}</Text>
      </View>
    );
  };
  const renderSeperator = () => {
    return <View style={styles.seperatorStyle} />;
  };
  const renderNotificationsListView = () => {
    return (
      <FlatList
        data={notifications}
        renderItem={({ item }) => renderNotification(item)}
        // bounces={false}
        contentContainerStyle={styles.flatListStyle}
        ListEmptyComponent={renderEmptyComponent}
        ItemSeparatorComponent={renderSeperator}
        refreshControl={
          <RefreshControl
            tintColor={theme.colors.APP_GREEN}
            colors={[theme.colors.APP_GREEN]}
            progressBackgroundColor={theme.colors.WHITE}
            refreshing={refresh}
            onRefresh={() => {
              setRefresh(true);
              fetchNotifications((success) => {
                setRefresh(false);
                if (success) {
                  setTimeout(() => {
                    setDataRefetched(true);
                    setTimeout(() => {
                      setDataRefetched(false);
                    }, 5000);
                  }, 1000);
                }
              });
            }}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.scrollArea}>
      {showHeaderView()}
      {renderNotificationsListView()}
    </SafeAreaView>
  );
};
