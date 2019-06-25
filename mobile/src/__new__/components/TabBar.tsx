import React from 'react';
import { createBottomTabNavigator, NavigationRouteConfig } from 'react-navigation';
import { ConsultRoom } from 'app/src/__new__/components/ConsultRoom';
import { theme } from 'app/src/__new__/theme/theme';
import { ConsultationRoom } from 'app/src/__new__/components/ui/Icons';
import { AppRoutes, AppRoute } from 'app/src/__new__/components/AppNavigatorContainer';

const routeToIcon: Partial<Record<keyof typeof AppRoutes, any>> = {
  [AppRoutes.ConsultRoom]: <ConsultationRoom />,
};

const routeConfigMap: Partial<Record<keyof typeof AppRoutes, NavigationRouteConfig>> = {
  [AppRoutes.ConsultRoom]: ConsultRoom,
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
