import { Appointments } from '@aph/mobile-doctors/src/components/Appointments/Appointments';
import { Inbox } from '@aph/mobile-doctors/src/components/Inbox';
import { MyAccount } from '@aph/mobile-doctors/src/components/MyAccount';
import { AppRoute } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Patients } from '@aph/mobile-doctors/src/components/Patients';
import {
  ConsultationRoom,
  InboxIcon,
  MyHealth,
  Person,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { createBottomTabNavigator, NavigationRouteConfig } from 'react-navigation';

const routeToIcon: Partial<Record<string, any>> = {
  APPOINTMENTS: <ConsultationRoom />,
  PATIENTS: <MyHealth />,
  INBOX: <InboxIcon />,
  'MY ACCOUNT': <Person />,
};

const routeConfigMap: Partial<Record<string, NavigationRouteConfig>> = {
  APPOINTMENTS: Appointments,
  PATIENTS: Patients,
  INBOX: Inbox,
  'MY ACCOUNT': MyAccount,
};

export const TabBar = createBottomTabNavigator(routeConfigMap, {
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: () => routeToIcon[navigation.state.routeName as AppRoute],
  }),
  tabBarOptions: {
    activeBackgroundColor: theme.colors.TAB_BAR_ACTIVE_BG_COLOR,
    activeTintColor: theme.colors.TAB_BAR_ACTIVE_TEXT_COLOR,
    inactiveTintColor: theme.colors.TAB_BAR_INACTIVE_TEXT_COLOR,
    labelStyle: {
      opacity: 0.6,
      ...theme.fonts.IBMPlexSansSemiBold(7),
      letterSpacing: 0.5,
      marginBottom: 7,
      marginTop: 7,
      textAlign: 'center',
    },
  },
});
