import { createStackNavigator, createAppContainer, StackNavigatorConfig } from 'react-navigation';

import { Login } from 'app/src/__new__/components/Login';
import { Onboarding } from 'app/src/__new__/components/Onboarding';
import { TabBar } from 'app/src/__new__/components/TabBar';
import { DoctorSearch } from 'app/src/__new__/components/DoctorSearch';
import { NavigationRouteConfig } from 'react-navigation';

export enum AppRoutes {
  Onboarding = 'Onboarding',
  Login = 'Login',
  OtpVerification = 'OtpVerification',
  ConsultRoom = 'ConsultRoom',
  TabBar = 'TabBar',
  DoctorSearch = 'DoctorSearch',
  MyHealth = 'MyHealth',
}

export type AppRoute = keyof typeof AppRoutes;

const routeConfigMap: Partial<Record<AppRoute, NavigationRouteConfig>> = {
  [AppRoutes.Onboarding]: {
    screen: Onboarding,
    navigationOptions: {
      header: null,
    },
  },
  [AppRoutes.TabBar]: {
    screen: TabBar,
    navigationOptions: {
      header: null,
    },
  },
  [AppRoutes.Login]: {
    screen: Login,
  },
  [AppRoutes.DoctorSearch]: {
    screen: DoctorSearch,
    navigationOptions: {
      header: null,
    },
  },
};

const stackConfig: StackNavigatorConfig = {
  initialRouteName: AppRoutes.Onboarding,
  headerMode: 'none',
  cardStyle: { backgroundColor: 'transparent' },
  transitionConfig: () => {
    return {
      transitionSpec: {
        duration: 0,
      },
    };
  },
};

const AppNavigator = createStackNavigator(routeConfigMap, stackConfig);

export const AppNavigatorContainer = createAppContainer(AppNavigator);
