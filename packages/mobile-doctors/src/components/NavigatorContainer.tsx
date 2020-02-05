import { MyAccountProfile } from '@aph/mobile-doctors/src/components/Account/MyAccountProfile';
import { MyAvailability } from '@aph/mobile-doctors/src/components/Account/MyAvailability';
import { AppointmentNotifications } from '@aph/mobile-doctors/src/components/Appointments/AppointmentNotifications';
import { Appointments } from '@aph/mobile-doctors/src/components/Appointments/Appointments';
import { CallRequestScreen } from '@aph/mobile-doctors/src/components/Appointments/CallRequestScreen';
import { NeedHelpAppointment } from '@aph/mobile-doctors/src/components/Appointments/NeedHelpAppointment';
import { AddCondition } from '@aph/mobile-doctors/src/components/ConsultRoom/AddCondition';
import { AddDiagnostics } from '@aph/mobile-doctors/src/components/ConsultRoom/AddDiagnostics';
import { AddMedicine } from '@aph/mobile-doctors/src/components/ConsultRoom/AddMedicine';
import { CaseSheetView } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetView';
import { ConsultRoomScreen } from '@aph/mobile-doctors/src/components/ConsultRoom/ConsultRoomScreen';
import { MedicineUpdate } from '@aph/mobile-doctors/src/components/ConsultRoom/MedicineUpdate';
import { HelpScreen } from '@aph/mobile-doctors/src/components/HelpScreen';
import { Inbox } from '@aph/mobile-doctors/src/components/Inbox';
import { LandingPage } from '@aph/mobile-doctors/src/components/LandingPage';
import { Login } from '@aph/mobile-doctors/src/components/Login';
import { MyAccount } from '@aph/mobile-doctors/src/components/MyAccount';
import { NeedHelp } from '@aph/mobile-doctors/src/components/NeedHelp';
import { NeedHelpDonePage } from '@aph/mobile-doctors/src/components/NeedHelpDonePage';
import { NotificationScreen } from '@aph/mobile-doctors/src/components/Notification/NotificationScreen';
import { Onboarding } from '@aph/mobile-doctors/src/components/Onboarding';
import { OnBoardingPage } from '@aph/mobile-doctors/src/components/OnBoardingPage';
import { OTPVerification } from '@aph/mobile-doctors/src/components/OTPVerification';
import { OTPVerificationApiCall } from '@aph/mobile-doctors/src/components/OTPVerificationApiCall';
import { Patients } from '@aph/mobile-doctors/src/components/Patients';
import { ProfileSetup } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileSetup';
import { SplashScreen } from '@aph/mobile-doctors/src/components/SplashScreen';
import { TabBar } from '@aph/mobile-doctors/src/components/TabBar';
import { TransitionPage } from '@aph/mobile-doctors/src/components/TransitionPage';
import { BasicAccount } from '@aph/mobile-doctors/src/components/Account/BasicAccount';
import { MyFees } from '@aph/mobile-doctors/src/components/Account/MyFees';
import { AddSymptons } from '@aph/mobile-doctors/src/components/ConsultRoom/AddSymptons';
import { TransferConsult } from '@aph/mobile-doctors/src/components/ConsultRoom/TransferConsult';
import { ReschduleConsult } from '@aph/mobile-doctors/src/components/ConsultRoom/ReschduleConsult';
import {
  createAppContainer,
  createStackNavigator,
  NavigationRouteConfig,
  StackNavigatorConfig,
} from 'react-navigation';
import { ShareConsult } from '@aph/mobile-doctors/src/components/ConsultRoom/ShareConsult';
import { ChatDoctor } from '@aph/mobile-doctors/src/components/ChatDoctor';
import { Sample } from '@aph/mobile-doctors/src/components/Sample';
import { PatientDetailsPage } from '@aph/mobile-doctors/src/components/PatientDetailsPage';
import { MedicineAddScreen } from '@aph/mobile-doctors/src/components/ConsultRoom/MedicineAddScreen';
import { CaseSheetDetails } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/CaseSheetDetails';
import { BlockHomePage } from '@aph/mobile-doctors/src/components/BlockCalender/BlockHomePage';

export enum AppRoutes {
  Onboarding = 'Onboarding',
  Login = 'Login',
  Appointments = 'Appointments',
  TabBar = 'TabBar',
  OTPVerification = 'OTPVerification',
  OTPVerificationApiCall = 'OTPVerificationApiCall',
  Patients = 'Patients',
  Inbox = 'Inbox',
  MyAccount = 'MyAccount',
  SplashScreen = 'SplashScreen',
  LandingPage = 'LandingPage',
  OnBoardingPage = 'OnBoardingPage',
  NeedHelp = 'NeedHelp',
  ProfileSetup = 'ProfileSetup',
  TransitionPage = 'TransitionPage',
  NeedHelpDonePage = 'NeedHelpDonePage',
  AppointmentNotifications = 'AppointmentNotifications',
  NeedHelpAppointment = 'NeedHelpAppointment',
  CallRequestScreen = 'CallRequestScreen',
  ConsultRoomScreen = 'ConsultRoomScreen',
  TabPage = 'TabPage',
  CaseSheetView = 'CaseSheetView',
  NotificationScreen = 'NotificationScreen',
  HelpScreen = 'HelpScreen',
  MyAccountProfile = 'MyAccountProfile',
  MyAvailability = 'MyAvailability',
  AddCondition = 'AddCondition',
  AddDiagnostics = 'AddDiagnostics',
  AddMedicine = 'AddMedicine',
  MedicineUpdate = 'MedicineUpdate',
  BasicAccount = 'BasicAccount',
  MyFees = 'MyFees',
  AddSymptons = 'AddSymptons',
  TransferConsult = 'TransferConsult',
  ReschduleConsult = 'ReschduleConsult',
  ShareConsult = 'ShareConsult',
  ChatDoctor = 'ChatDoctor',
  Sample = 'Sample',
  PatientDetailsPage = 'PatientDetailsPage',
  MedicineAddScreen = 'MedicineAddScreen',
  CaseSheetDetails = 'CaseSheetDetails',
  BlockHomePage = 'BlockHomePage',
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
  [AppRoutes.OTPVerificationApiCall]: {
    screen: OTPVerificationApiCall,
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
  [AppRoutes.NeedHelpDonePage]: {
    screen: NeedHelpDonePage,
  },
  [AppRoutes.AppointmentNotifications]: {
    screen: AppointmentNotifications,
  },
  [AppRoutes.NeedHelpAppointment]: {
    screen: NeedHelpAppointment,
  },
  [AppRoutes.CallRequestScreen]: {
    screen: CallRequestScreen,
  },
  [AppRoutes.ConsultRoomScreen]: {
    screen: ConsultRoomScreen,
  },

  [AppRoutes.CaseSheetView]: {
    screen: CaseSheetView,
  },
  [AppRoutes.NotificationScreen]: {
    screen: NotificationScreen,
  },
  [AppRoutes.HelpScreen]: {
    screen: HelpScreen,
  },
  [AppRoutes.MyAccountProfile]: {
    screen: MyAccountProfile,
  },
  [AppRoutes.MyAvailability]: {
    screen: MyAvailability,
  },
  [AppRoutes.AddCondition]: {
    screen: AddCondition,
  },
  [AppRoutes.AddDiagnostics]: {
    screen: AddDiagnostics,
  },
  [AppRoutes.AddMedicine]: {
    screen: AddMedicine,
  },
  [AppRoutes.MedicineUpdate]: {
    screen: MedicineUpdate,
  },
  [AppRoutes.BasicAccount]: {
    screen: BasicAccount,
  },
  [AppRoutes.MyFees]: {
    screen: MyFees,
  },
  [AppRoutes.AddSymptons]: {
    screen: AddSymptons,
  },
  [AppRoutes.TransferConsult]: {
    screen: TransferConsult,
  },
  [AppRoutes.ReschduleConsult]: {
    screen: ReschduleConsult,
  },
  [AppRoutes.ShareConsult]: {
    screen: ShareConsult,
  },
  [AppRoutes.ChatDoctor]: {
    screen: ChatDoctor,
  },
  [AppRoutes.Sample]: {
    screen: Sample,
  },
  [AppRoutes.PatientDetailsPage]: {
    screen: PatientDetailsPage,
  },
  [AppRoutes.MedicineAddScreen]: {
    screen: MedicineAddScreen,
  },
  [AppRoutes.CaseSheetDetails]: {
    screen: CaseSheetDetails,
  },
  [AppRoutes.BlockHomePage]: {
    screen: BlockHomePage,
  },
};

const stackConfig: StackNavigatorConfig = {
  initialRouteName: AppRoutes.SplashScreen,
  headerMode: 'none',
  cardStyle: { backgroundColor: 'transparent' },
  navigationOptions: {
    gesturesEnabled: false,
  },
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
