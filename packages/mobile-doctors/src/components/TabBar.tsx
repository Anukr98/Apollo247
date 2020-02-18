import { BasicAccount } from '@aph/mobile-doctors/src/components/Account/BasicAccount';
import { Appointments } from '@aph/mobile-doctors/src/components/Appointments/Appointments';
import { AppRoute } from '@aph/mobile-doctors/src/components/NavigatorContainer';
import { Patients } from '@aph/mobile-doctors/src/components/Patients';
import {
  ConsultationRoom,
  ConsultationRoomFocused,
  MyHealth,
  MyHealthFocused,
  Person,
  PersonFocused,
} from '@aph/mobile-doctors/src/components/ui/Icons';
import { theme } from '@aph/mobile-doctors/src/theme/theme';
import React from 'react';
import { createBottomTabNavigator, NavigationRouteConfig } from 'react-navigation';

const routeToIcon: Partial<Record<string, NavigationRouteConfig>> = {
  APPOINTMENTS: <ConsultationRoom />,
  PATIENTS: <MyHealth />,
  // INBOX: <InboxIcon />,
  'MY ACCOUNT': <Person />,
};

const routeToFocusedIcon: Partial<Record<string, NavigationRouteConfig>> = {
  APPOINTMENTS: <ConsultationRoomFocused />,
  PATIENTS: <MyHealthFocused />,
  // INBOX: <InboxIcon />,
  'MY ACCOUNT': <PersonFocused />,
};

const routeConfigMap: Partial<Record<string, NavigationRouteConfig>> = {
  APPOINTMENTS: Appointments,
  PATIENTS: Patients,
  // INBOX: Inbox,
  'MY ACCOUNT': BasicAccount,
};

export const TabBar = createBottomTabNavigator(routeConfigMap, {
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused }) =>
      focused
        ? routeToFocusedIcon[navigation.state.routeName as AppRoute]
        : routeToIcon[navigation.state.routeName as AppRoute],
  }),
  tabBarOptions: {
    activeBackgroundColor: theme.colors.TAB_BAR_ACTIVE_BG_COLOR,
    activeTintColor: theme.colors.TAB_BAR_ACTIVE_TEXT_COLOR,
    inactiveTintColor: theme.colors.TAB_BAR_INACTIVE_TEXT_COLOR,
    style: {
      borderTopColor: 'transparent',
      shadowColor: '#808080',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 20,
    },
    labelStyle: {
      ...theme.fonts.IBMPlexSansSemiBold(7),
      letterSpacing: 0.5,
      lineHeight: 8,
      marginBottom: 7,
      marginTop: 9,
      textAlign: 'center',
    },
  },
});
