import { Appointments } from 'app/src/components/Appointments';
import { Inbox } from 'app/src/components/Inbox';
import { SplashScreen } from 'app/src/components/SplashScreen';
import { LandingPage } from 'app/src/components/LandingPage';
import { Login } from 'app/src/components/Login';
import { MyAccount } from 'app/src/components/MyAccount';
import { NeedHelp } from 'app/src/components/NeedHelp';
import { Onboarding } from 'app/src/components/Onboarding';
import { OnBoardingPage } from 'app/src/components/OnBoardingPage';
import { OTPVerification } from 'app/src/components/OTPVerification';
import { Patients } from 'app/src/components/Patients';
import { ProfileSetup } from 'app/src/components/ProfileSetup';
import { TabBar } from 'app/src/components/TabBar';
import { TransitionPage } from 'app/src/components/TransitionPage';
import {
  createAppContainer,
  createStackNavigator,
  NavigationRouteConfig,
  StackNavigatorConfig,
} from 'react-navigation';

export enum AppRoutes {
  Onboarding = 'Onboarding',
  Login = 'Login',
  Appointments = 'Appointments',
  TabBar = 'TabBar',
  OTPVerification = 'OTPVerification',
  Patients = 'Patients',
  Inbox = 'Inbox',
  MyAccount = 'MyAccount',
  SplashScreen = 'SplashScreen',
  LandingPage = 'LandingPage',
  OnBoardingPage = 'OnBoardingPage',
  NeedHelp = 'NeedHelp',
  ProfileSetup = 'ProfileSetup',
  TransitionPage = 'TransitionPage',
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
      gesturesEnabled: false,
    },
  },
  [AppRoutes.Login]: {
    screen: Login,
  },
  [AppRoutes.OTPVerification]: {
    screen: OTPVerification,
  },
  [AppRoutes.Appointments]: {
    screen: Appointments,
  },
  [AppRoutes.Patients]: {
    screen: Patients,
  },
  [AppRoutes.Inbox]: {
    screen: Inbox,
  },
  [AppRoutes.MyAccount]: {
    screen: MyAccount,
  },
  [AppRoutes.SplashScreen]: {
    screen: SplashScreen,
  },
  [AppRoutes.LandingPage]: {
    screen: LandingPage,
  },
  [AppRoutes.OnBoardingPage]: {
    screen: OnBoardingPage,
  },
  [AppRoutes.NeedHelp]: {
    screen: NeedHelp,
  },
  [AppRoutes.ProfileSetup]: {
    screen: ProfileSetup,
  },
  [AppRoutes.TransitionPage]: {
    screen: TransitionPage,
  },
};

const stackConfig: StackNavigatorConfig = {
  initialRouteName: AppRoutes.SplashScreen,
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
