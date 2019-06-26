import { createStackNavigator, createAppContainer, StackNavigatorConfig } from 'react-navigation';

import { Login } from 'app/src/__new__/components/Login';
import { Onboarding } from 'app/src/__new__/components/Onboarding';
import { TabBar } from 'app/src/__new__/components/TabBar';
import { DoctorSearch } from 'app/src/__new__/components/DoctorSearch';
import { SignUp } from 'app/src/__new__/components/SignUp';
import { MultiSignup } from 'app/src/__new__/components/MultiSignup';
import { OTPVerification } from 'app/src/__new__/components/OTPVerification';
import { NavigationRouteConfig } from 'react-navigation';
import { ConsultRoom } from 'app/src/__new__/components/ConsultRoom';

export enum AppRoutes {
  Onboarding = 'Onboarding',
  Login = 'Login',
  ConsultRoom = 'ConsultRoom',
  TabBar = 'TabBar',
  DoctorSearch = 'DoctorSearch',
  SignUp = 'SignUp',
  MultiSignup = 'MultiSignup',
  OTPVerification = 'OTPVerification',
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

  [AppRoutes.SignUp]: {
    screen: SignUp,
  },
  [AppRoutes.MultiSignup]: {
    screen: MultiSignup,
  },
  [AppRoutes.OTPVerification]: {
    screen: OTPVerification,
  },
  [AppRoutes.ConsultRoom]: {
    screen: ConsultRoom,
  },

  // [appRoutes.otpVerification()]: {
  //   screen: OTPVerification,
  // },
  // Home: {
  //   screen: Home,
  // },
  // AddTodo: {
  //   screen: AddTodo,
  // },
  // SignUp: {
  //   screen: SignUp,
  // },
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
