import { AppRoute, AppRoutes } from 'app/src/components/AppNavigatorContainer';
import { ConsultRoom } from 'app/src/components/ConsultRoom';
import { ConsultationRoom } from 'app/src/components/ui/Icons';
import { theme } from 'app/src/theme/theme';
import React from 'react';
import { createBottomTabNavigator, NavigationRouteConfig } from 'react-navigation';

const routeToIcon: Partial<Record<keyof typeof AppRoutes, any>> = {
  ConsultRoom: <ConsultationRoom />,
};

const routeConfigMap: Partial<Record<keyof typeof AppRoutes, NavigationRouteConfig>> = {
  ConsultRoom: ConsultRoom,
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
