import { AppRoute, AppRoutes } from 'app/src/components/NavigatorContainer';
import { ConsultRoom } from 'app/src/components/ConsultRoom';
import { HealthRecords } from 'app/src/components/HealthRecords';
import { MyAccount } from 'app/src/components/MyAccount';
import { Medicine } from 'app/src/components/Medicine';

import { ConsultationRoom, MyHealth, Person, ShoppingCart } from 'app/src/components/ui/Icons';
import { theme } from 'app/src/theme/theme';
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
