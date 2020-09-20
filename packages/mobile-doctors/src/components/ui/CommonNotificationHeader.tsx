import { AppRoutes } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { useNotification } from '@aph/mobile-doctors/src/components/Notification/NotificationContext';
import { CommonNotificationHeaderStyles } from '@aph/mobile-doctors/src/components/ui/CommonNotificationHeader.styles';
import { Header } from '@aph/mobile-doctors/src/components/ui/Header';
import { ApploLogo, Notification, RoundIcon } from '@aph/mobile-doctors/src/components/ui/Icons';
import { useUIElements } from '@aph/mobile-doctors/src/components/ui/UIElementsProvider';
import React from 'react';
import { NavigationScreenProps } from 'react-navigation';
import {
  postWebEngageEvent,
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-doctors/src/helpers/WebEngageHelper';
import { useAuth } from '@aph/mobile-doctors/src/hooks/authHooks';
import { g } from '@aph/mobile-doctors/src/helpers/helperFunctions';

const styles = CommonNotificationHeaderStyles;

export interface CommonNotificationHeaderProps extends NavigationScreenProps {}

export const CommonNotificationHeader: React.FC<CommonNotificationHeaderProps> = (props) => {
  const { setShowNeedHelp } = useUIElements();
  const { notifications } = useNotification();
  const { doctorDetails } = useAuth();
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
          onPress: () => {
            postWebEngageEvent(WebEngageEventName.DOCTOR_CLICKED_HELP, {
              'Doctor Mobile number': g(doctorDetails, 'mobileNumber') || '',
              'Doctor name': g(doctorDetails, 'fullName') || '',
            } as WebEngageEvents[WebEngageEventName.DOCTOR_CLICKED_HELP]);
            setShowNeedHelp(true);
          },
        },
        {
          icon: <Notification />,
          onPress: () => {
            postWebEngageEvent(WebEngageEventName.DOCTOR_CLICKED_NOTIFICATION, {});
            props.navigation.push(AppRoutes.NotificationScreen);
          },
          count: notifications ? notifications.length : undefined,
        },
      ]}
    />
  );
};
