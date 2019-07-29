import { BackArrow } from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { SafeAreaView, Alert } from 'react-native';
import { NotificationHeader } from '@aph/mobile-doctors/src/components/ui/NotificationHeader';

export interface AppointmentNotificationsProps {}

export const AppointmentNotifications: React.FC<AppointmentNotificationsProps> = (props) => {
  return (
    <SafeAreaView style={theme.viewStyles.container}>
      <NotificationHeader
        leftIcons={[
          {
            icon: <BackArrow />,
            onPress: () => Alert.alert('click'),
          },
        ]}
        middleText="NOTIFICATIONS"
      />
    </SafeAreaView>
  );
};
