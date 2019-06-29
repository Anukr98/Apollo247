import { createStackNavigator, createAppContainer, StackNavigatorConfig } from 'react-navigation';

import { Login } from 'app/src/components/Login';
import { Onboarding } from 'app/src/components/Onboarding';
import { TabBar } from 'app/src/components/TabBar';
import { DoctorSearch } from 'app/src/components/DoctorSearch';
import { SignUp } from 'app/src/components/SignUp';
import { MultiSignup } from 'app/src/components/MultiSignup';
import { OTPVerification } from 'app/src/components/OTPVerification';
import { NavigationRouteConfig } from 'react-navigation';
import { ConsultRoom } from 'app/src/components/ConsultRoom';
import { DoctorSearchListing } from 'app/src/components/DoctorSearchListing';

export enum AppRoutes {
  Onboarding = 'Onboarding',
  Login = 'Login',
  ConsultRoom = 'ConsultRoom',
  TabBar = 'TabBar',
  DoctorSearch = 'DoctorSearch',
  SignUp = 'SignUp',
  MultiSignup = 'MultiSignup',
  OTPVerification = 'OTPVerification',
  DoctorSearchListing = 'DoctorSearchListing',
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
  [AppRoutes.DoctorSearchListing]: {
    screen: DoctorSearchListing,
  },
};

const stackConfig: StackNavigatorConfig = {
  initialRouteName: AppRoutes.Onboarding,
  headerMode: 'none',
  cardStyle: { backgroundColor: 'transparent' },
  transitionConfig: () => {
    return {
      transitionSpec: {
        // duration: 100,
      },
    };
  },
};

const Navigator = createStackNavigator(routeConfigMap, stackConfig);

export const NavigatorContainer = createAppContainer(Navigator);
