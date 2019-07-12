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
import { HealthRecords } from 'app/src/components/HealthRecords';
import { Medicine } from 'app/src/components/Medicine';
import { MyAccount } from 'app/src/components/MyAccount';
//import { SplashScreen } from 'app/src/components/SplashScreen';
import { LandingPage } from 'app/src/components/LandingPage';
import { OnBoardingPage } from 'app/src/components/OnBoardingPage';
import { NeedHelp } from 'app/src/components/NeedHelp';
import { ProfilePage } from 'app/src/components/ProfilePage';
import { FeeTab } from 'app/src/components/FeeTab';
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
  HealthRecords = 'HealthRecords',
  Medicine = 'Medicine',
  MyAccount = 'MyAccount',
  SplashScreen = 'SplashScreen',
  LandingPage = 'LandingPage',
  OnBoardingPage = 'OnBoardingPage',
  NeedHelp = 'NeedHelp',
  ProfilePage = 'ProfilePage',
  FeeTab = 'FeeTab',
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
  [AppRoutes.DoctorSearch]: {
    screen: DoctorSearch,
    navigationOptions: {
      header: null,
    },
  },

  [AppRoutes.SignUp]: {
    screen: SignUp,
    navigationOptions: {
      gesturesEnabled: false,
    },
  },
  [AppRoutes.MultiSignup]: {
    screen: MultiSignup,
    navigationOptions: {
      gesturesEnabled: false,
    },
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
  [AppRoutes.HealthRecords]: {
    screen: HealthRecords,
  },
  [AppRoutes.Medicine]: {
    screen: Medicine,
  },
  [AppRoutes.MyAccount]: {
    screen: MyAccount,
  },
  // [AppRoutes.SplashScreen]: {
  //   screen: SplashScreen,
  // },
  [AppRoutes.LandingPage]: {
    screen: LandingPage,
  },
  [AppRoutes.OnBoardingPage]: {
    screen: OnBoardingPage,
  },
  [AppRoutes.NeedHelp]: {
    screen: NeedHelp,
  },
  [AppRoutes.ProfilePage]: {
    screen: ProfilePage,
  },
  [AppRoutes.FeeTab]: {
    screen: FeeTab,
  },
};

const stackConfig: StackNavigatorConfig = {
  initialRouteName: AppRoutes.ProfilePage,
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
