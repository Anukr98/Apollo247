import { AppRoute, AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { ConsultRoom } from '@aph/mobile-patients/src/components/ConsultRoom';
import { HealthRecords } from '@aph/mobile-patients/src/components/HealthRecords';
import { MyAccount } from '@aph/mobile-patients/src/components/MyAccount';
import { Medicine } from '@aph/mobile-patients/src/components/Medicine';

import {
  ConsultationRoom,
  MyHealth,
  Person,
  ShoppingCart,
  PersonFocused,
  MyHealthFocused,
  ConsultationRoomFocused,
  ShoppingCartFocused,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { createBottomTabNavigator, NavigationRouteConfig } from 'react-navigation';
import { Consult } from '@aph/mobile-patients/src/components/Consult';

const routeToIcon: Partial<Record<string, NavigationRouteConfig>> = {
  'CONSULT ROOM': <ConsultationRoom />,
  'HEALTH RECORDS': <MyHealth />,
  'TESTS & MEDICINES': <ShoppingCart />,
  'MY ACCOUNT': <Person />,
};

const routeToFocusedIcon: Partial<Record<string, NavigationRouteConfig>> = {
  'CONSULT ROOM': <ConsultationRoomFocused />,
  'HEALTH RECORDS': <MyHealthFocused />,
  'TESTS & MEDICINES': <ShoppingCartFocused />,
  'MY ACCOUNT': <PersonFocused />,
};

const routeConfigMap: Partial<Record<string, NavigationRouteConfig>> = {
  'CONSULT ROOM': ConsultRoom,
  'HEALTH RECORDS': HealthRecords,
  'TESTS & MEDICINES': Medicine,
  'MY ACCOUNT': MyAccount,
};

export const TabBar = createBottomTabNavigator(routeConfigMap, {
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused }) =>
      focused
        ? routeToFocusedIcon[navigation.state.routeName as AppRoute]
        : routeToIcon[navigation.state.routeName as AppRoute],
  }),
  tabBarOptions: {
    activeTintColor: theme.colors.TAB_BAR_ACTIVE_TINT_COLOR,
    inactiveTintColor: theme.colors.TAB_BAR_INACTIVE_TINT_COLOR,
    activeBackgroundColor: theme.colors.LIGHT_BLUE,
    style: {
      borderTopColor: 'transparent',
    },
    labelStyle: {
      borderTopColor: 'transparent',
      fontFamily: 'IBMPlexSans-SemiBold',
      fontSize: 7,
      letterSpacing: 0.5,
      textAlign: 'center',
      marginTop: 9,
      marginBottom: 7,
    },
  },
});
