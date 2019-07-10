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
  ConsultRoom: <ConsultationRoom />,
  HealthRecords: <MyHealth />,
  Medicine: <ShoppingCart />,
  MyAccount: <Person />,
};

const routeConfigMap: Partial<Record<keyof typeof AppRoutes, NavigationRouteConfig>> = {
  ConsultRoom: ConsultRoom,
  HealthRecords: HealthRecords,
  Medicine: Medicine,
  MyAccount: MyAccount,
};

export const TabBar = createBottomTabNavigator(routeConfigMap, {
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: () => routeToIcon[navigation.state.routeName as AppRoute],
  }),
  tabBarOptions: {
    activeTintColor: theme.colors.TAB_BAR_ACTIVE_TINT_COLOR,
    inactiveTintColor: theme.colors.TAB_BAR_INACTIVE_TINT_COLOR,
  },
});
