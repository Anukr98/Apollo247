import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { useNotification } from '@aph/mobile-doctors/src/components/Notification/NotificationContext';
import { CommonNotificationHeaderStyles } from '@aph/mobile-doctors/src/components/ui/CommonNotificationHeader.styles';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { ApploLogo, Notification, RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import React from 'react';
import { NavigationScreenProps } from 'react-navigation';

const styles = CommonNotificationHeaderStyles;

export interface CommonNotificationHeaderProps extends NavigationScreenProps {}

export const CommonNotificationHeader: React.FC<CommonNotificationHeaderProps> = (props) => {
  const { setShowNeedHelp } = useUIElements();
  const { notifications } = useNotification();
  return (
    <Header
      leftIcons={[
        {
          icon: <ApploLogo />,
        },
      ]}
      rightIcons={[
        {
          icon: <RoundIcon />,
          onPress: () => setShowNeedHelp(true),
        },
        {
          icon: <Notification />,
          onPress: () => props.navigation.push(AppRoutes.NotificationScreen),
          count: notifications ? notifications.length : undefined,
        },
      ]}
    />
  );
};
