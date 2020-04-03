import { MyAccountProfile } from '@aph/mobile-doctors/src/components/Account/MyAccountProfile';
import { MyAvailability } from '@aph/mobile-doctors/src/components/Account/MyAvailability';
import { AppointmentNotifications } from '@aph/mobile-doctors/src/components/Appointments/AppointmentNotifications';
import { Appointments } from '@aph/mobile-doctors/src/components/Appointments/Appointments';
import { CallRequestScreen } from '@aph/mobile-doctors/src/components/Appointments/CallRequestScreen';
import { NeedHelpAppointment } from '@aph/mobile-doctors/src/components/Appointments/NeedHelpAppointment';
import { CaseSheetView } from '@aph/mobile-doctors/src/components/ConsultRoom/CaseSheetView';
import { ConsultRoomScreen } from '@aph/mobile-doctors/src/components/ConsultRoom/ConsultRoomScreen';
import { HelpScreen } from '@aph/mobile-doctors/src/components/HelpScreen';
import { Inbox } from '@aph/mobile-doctors/src/components/Inbox';
import { LandingPage } from '@aph/mobile-doctors/src/components/LandingPage';
import { Login } from '@aph/mobile-doctors/src/components/Login';
import { MyAccount } from '@aph/mobile-doctors/src/components/MyAccount';
import { NeedHelp } from '@aph/mobile-doctors/src/components/NeedHelp';
import { NeedHelpDonePage } from '@aph/mobile-doctors/src/components/NeedHelpDonePage';
import { NotificationScreen } from '@aph/mobile-doctors/src/components/Notification/NotificationScreen';
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
import { TransferConsult } from '@aph/mobile-doctors/src/components/ConsultRoom/TransferConsult';
import { ReschduleConsult } from '@aph/mobile-doctors/src/components/ConsultRoom/ReschduleConsult';
import {
  createAppContainer,
  createStackNavigator,
  NavigationRouteConfig,
  StackNavigatorConfig,
} from 'react-navigation';
import { RenderPdf } from '@aph/mobile-doctors/src/components/ui/RenderPdf';
import { ShareConsult } from '@aph/mobile-doctors/src/components/ConsultRoom/ShareConsult';
import { ChatDoctor } from '@aph/mobile-doctors/src/components/ChatDoctor';
import { Sample } from '@aph/mobile-doctors/src/components/Sample';
import { PatientDetailsPage } from '@aph/mobile-doctors/src/components/PatientDetailsPage';
import { CaseSheetDetails } from '@aph/mobile-doctors/src/components/ProfileSetup/ProfileTab/CaseSheetDetails';
import { SmartPrescription } from '@aph/mobile-doctors/src/components/Account/SmartPrescription';
import { MyStats } from '@aph/mobile-doctors/src/components/Account/MyStats';
import { PaymentHistory } from '@aph/mobile-doctors/src/components/Account/PaymentHistory';
import { BlockHomePage } from '@aph/mobile-doctors/src/components/BlockCalender/BlockHomePage';
import { PreviewPrescription } from '@aph/mobile-doctors/src/components/ConsultRoom/PreviewPrescription';

export enum AppRoutes {
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
  BasicAccount = 'BasicAccount',
  MyFees = 'MyFees',
  TransferConsult = 'TransferConsult',
  ReschduleConsult = 'ReschduleConsult',
  ShareConsult = 'ShareConsult',
  ChatDoctor = 'ChatDoctor',
  Sample = 'Sample',
  PatientDetailsPage = 'PatientDetailsPage',
  CaseSheetDetails = 'CaseSheetDetails',
  SmartPrescription = 'SmartPrescription',
  MyStats = 'MyStats',
  RenderPdf = 'RenderPdf',
  PaymentHistory = 'PaymentHistory',
  BlockHomePage = 'BlockHomePage',
  PreviewPrescription = 'PreviewPrescription',
}

export type AppRoute = keyof typeof AppRoutes;

const routeConfigMap: Partial<Record<AppRoute, NavigationRouteConfig>> = {
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
    path: 'AppointmentsPage',
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
    navigationOptions: {
      gesturesEnabled: false,
    },
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
  [AppRoutes.BasicAccount]: {
    screen: BasicAccount,
  },
  [AppRoutes.MyFees]: {
    screen: MyFees,
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

  [AppRoutes.CaseSheetDetails]: {
    screen: CaseSheetDetails,
  },
  [AppRoutes.SmartPrescription]: {
    screen: SmartPrescription,
  },
  [AppRoutes.MyStats]: {
    screen: MyStats,
  },
  [AppRoutes.RenderPdf]: {
    screen: RenderPdf,
  },
  [AppRoutes.PaymentHistory]: {
    screen: PaymentHistory,
  },
  [AppRoutes.BlockHomePage]: {
    screen: BlockHomePage,
  },
  [AppRoutes.PreviewPrescription]: {
    screen: PreviewPrescription,
  },
};

const stackConfig: StackNavigatorConfig = {
  initialRouteName: AppRoutes.SplashScreen,
  headerMode: 'none',
  cardStyle: { backgroundColor: 'transparent' },
  navigationOptions: {
    gesturesEnabled: false,
  },
  transitionConfig: (sceneProps) => {
    return {
      transitionSpec: {
        duration: sceneProps.scene.route.routeName === 'TabBar' ? 0 : 100,
      },
    };
  },
};

const Navigator = createStackNavigator(routeConfigMap, stackConfig);

export const NavigatorContainer = createAppContainer(Navigator);
