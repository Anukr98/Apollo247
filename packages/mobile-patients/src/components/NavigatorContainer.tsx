import { createStackNavigator, createAppContainer, StackNavigatorConfig } from 'react-navigation';

import { Login } from '@aph/mobile-patients/src/components/Login';
import { Onboarding } from '@aph/mobile-patients/src/components/Onboarding';
import { TabBar } from '@aph/mobile-patients/src/components/TabBar';
import { DoctorSearch } from '@aph/mobile-patients/src/components/DoctorSearch';
import { SignUp } from '@aph/mobile-patients/src/components/SignUp';
import { MultiSignup } from '@aph/mobile-patients/src/components/MultiSignup';
import { OTPVerification } from '@aph/mobile-patients/src/components/OTPVerification';
import { NavigationRouteConfig } from 'react-navigation';
import { ConsultRoom } from '@aph/mobile-patients/src/components/ConsultRoom';
import { DoctorSearchListing } from '@aph/mobile-patients/src/components/DoctorSearchListing';
import { HealthRecords } from '@aph/mobile-patients/src/components/HealthRecords';
import { Medicine } from '@aph/mobile-patients/src/components/Medicine';
import { MyAccount } from '@aph/mobile-patients/src/components/MyAccount';
import { SplashScreen } from '@aph/mobile-patients/src/components/SplashScreen';
import { Consult } from '@aph/mobile-patients/src/components/Consult';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { DoctorDetails } from '@aph/mobile-patients/src/components/DoctorDetails';
import { AppointmentDetails } from '@aph/mobile-patients/src/components/AppointmentDetails';

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
  Consult = 'Consult',
  FilterScene = 'FilterScene',
  DoctorDetails = 'DoctorDetails',
  AppointmentDetails = 'AppointmentDetails',
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
  [AppRoutes.SplashScreen]: {
    screen: SplashScreen,
  },
  [AppRoutes.Consult]: {
    screen: Consult,
  },
  [AppRoutes.FilterScene]: {
    screen: FilterScene,
  },
  [AppRoutes.DoctorDetails]: {
    screen: DoctorDetails,
  },
  [AppRoutes.AppointmentDetails]: {
    screen: AppointmentDetails,
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
