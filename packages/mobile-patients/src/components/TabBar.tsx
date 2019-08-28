import { MyAccount } from '@aph/mobile-patients/src/components/Account/MyAccount';
import { Consult } from '@aph/mobile-patients/src/components/ConsultRoom/Consult';
import { HealthRecordsHome } from '@aph/mobile-patients/src/components/HealthRecords/HealthRecordsHome';
import { Medicine } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { AppRoute } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  ConsultationRoom,
  ConsultationRoomFocused,
  MyHealth,
  MyHealthFocused,
  Person,
  PersonFocused,
  ShoppingCart,
  ShoppingCartFocused,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { createBottomTabNavigator, NavigationRouteConfig } from 'react-navigation';

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
  'CONSULT ROOM': Consult,
  'HEALTH RECORDS': HealthRecordsHome,
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
