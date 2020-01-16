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
  TestsIconFocused,
  TestsIcon,
  MedicineIcon,
  MedicineIconWhite,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { createBottomTabNavigator, NavigationRouteConfig } from 'react-navigation';
import { Tests } from '@aph/mobile-patients/src/components/Tests/Tests';

const routeToIcon: Partial<Record<string, NavigationRouteConfig>> = {
  APPOINTMENTS: <ConsultationRoom />,
  'HEALTH RECORDS': <MyHealth />,
  MEDICINES: <MedicineIcon />,
  TESTS: <TestsIcon />,
  'MY ACCOUNT': <Person />,
};

const routeToFocusedIcon: Partial<Record<string, NavigationRouteConfig>> = {
  APPOINTMENTS: <ConsultationRoomFocused />,
  'HEALTH RECORDS': <MyHealthFocused />,
  MEDICINES: <MedicineIconWhite />,
  TESTS: <TestsIconFocused />,
  'MY ACCOUNT': <PersonFocused />,
};

const routeConfigMap: Partial<Record<string, NavigationRouteConfig>> = {
  APPOINTMENTS: Consult,
  'HEALTH RECORDS': HealthRecordsHome,
  MEDICINES: Medicine,
  TESTS: Tests,
  'MY ACCOUNT': MyAccount,
};

export const TabBar = createBottomTabNavigator(routeConfigMap, {
  initialRouteName: 'APPOINTMENTS',
  backBehavior: 'none',
  resetOnBlur: true,
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
      shadowColor: 'black',
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 10,
      borderTopWidth: 0,
      top: 1,
      height: 57,
    },
    labelStyle: {
      borderTopColor: 'transparent',
      fontFamily: 'IBMPlexSans-SemiBold',
      fontSize: 7,
      letterSpacing: 0.5,
      textAlign: 'center',
      marginBottom: 8,
    },
    iconStyle: {
      marginTop: 8,
      marginBottom: 8,
    },
  },
});
