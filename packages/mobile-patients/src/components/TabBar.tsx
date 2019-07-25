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
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { createBottomTabNavigator, NavigationRouteConfig } from 'react-navigation';

const routeToIcon: Partial<Record<keyof typeof AppRoutes, any>> = {
  'Consult Room': <ConsultationRoom />,
  'Health Records': <MyHealth />,
  'TESTS & MEDICINES': <ShoppingCart />,
  'My Account': <Person />,
};

const routeConfigMap: Partial<Record<keyof typeof AppRoutes, NavigationRouteConfig>> = {
  'Consult Room': ConsultRoom,
  'Health Records': HealthRecords,
  'TESTS & MEDICINES': Medicine,
  'My Account': MyAccount,
};

export const TabBar = createBottomTabNavigator(routeConfigMap, {
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: () => routeToIcon[navigation.state.routeName as AppRoute],
  }),
  tabBarOptions: {
    activeTintColor: theme.colors.TAB_BAR_ACTIVE_TINT_COLOR,
    inactiveTintColor: theme.colors.TAB_BAR_INACTIVE_TINT_COLOR,
    labelStyle: {
      fontFamily: 'IBMPlexSans-SemiBold',
      fontSize: 8,
      letterSpacing: 0.5,
      textAlign: 'center',
      textTransform: 'uppercase',
      top: -2,
    },
  },
});
