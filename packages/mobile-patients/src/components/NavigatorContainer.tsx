import { AppointmentDetails } from '@aph/mobile-patients/src/components/AppointmentDetails';
import { ChatRoom } from '@aph/mobile-patients/src/components/ChatRoom';
import { Consult } from '@aph/mobile-patients/src/components/Consult';
import { ConsultRoom } from '@aph/mobile-patients/src/components/ConsultRoom';
import { DoctorDetails } from '@aph/mobile-patients/src/components/DoctorDetails';
import { DoctorSearch } from '@aph/mobile-patients/src/components/DoctorSearch';
import { DoctorSearchListing } from '@aph/mobile-patients/src/components/DoctorSearchListing';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { HealthRecords } from '@aph/mobile-patients/src/components/HealthRecords';
import { Login } from '@aph/mobile-patients/src/components/Login';
import { AddAddress } from '@aph/mobile-patients/src/components/Medicines/AddAddress';
import { ApplyCouponScene } from '@aph/mobile-patients/src/components/Medicines/ApplyCouponScene';
import { Medicine } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { MedicineDetailsScene } from '@aph/mobile-patients/src/components/Medicines/MedicineDetailsScene';
import { SearchMedicineScene } from '@aph/mobile-patients/src/components/Medicines/SearchMedicineScene';
import { SelectDeliveryAddress } from '@aph/mobile-patients/src/components/Medicines/SelectDeliveryAddress';
import { SelectPrescription } from '@aph/mobile-patients/src/components/Medicines/SelectPrescription';
import { StorePickupScene } from '@aph/mobile-patients/src/components/Medicines/StorePickupScene';
import { UploadPrescription } from '@aph/mobile-patients/src/components/Medicines/UploadPrescription';
import { YourCart } from '@aph/mobile-patients/src/components/Medicines/YourCart';
import { MultiSignup } from '@aph/mobile-patients/src/components/MultiSignup';
import { MyAccount } from '@aph/mobile-patients/src/components/MyAccount';
import { Onboarding } from '@aph/mobile-patients/src/components/Onboarding';
import { OrderDetailsScene } from '@aph/mobile-patients/src/components/OrderDetailsScene';
import { OTPVerification } from '@aph/mobile-patients/src/components/OTPVerification';
import { SignUp } from '@aph/mobile-patients/src/components/SignUp';
import { SplashScreen } from '@aph/mobile-patients/src/components/SplashScreen';
import { TabBar } from '@aph/mobile-patients/src/components/TabBar';
import { YourOrdersScene } from '@aph/mobile-patients/src/components/YourOrdersScene';
import {
  createAppContainer,
  createStackNavigator,
  NavigationRouteConfig,
  StackNavigatorConfig,
} from 'react-navigation';
import { HealthRecordsHome } from '@aph/mobile-patients/src/components/HealthRecords/HealthRecordsHome';
import { ConsultDetails } from '@aph/mobile-patients/src/components/HealthRecords/ConsultDetails';
import { RecordDetails } from '@aph/mobile-patients/src/components/HealthRecords/RecordDetails';
import { SymptomChecker } from '@aph/mobile-patients/src/components/SymptomChecker';

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
  AssociateDoctorDetails = 'AssociateDoctorDetails',
  AppointmentDetails = 'AppointmentDetails',
  StorPickupScene = 'StorPickupScene',
  SearchMedicineScene = 'SearchMedicineScene',
  MedicineDetailsScene = 'MedicineDetailsScene',
  ApplyCouponScene = 'ApplyCouponScene',
  ChatRoom = 'ChatRoom',
  YourOrdersScene = 'YourOrdersScene',
  OrderDetailsScene = 'OrderDetailsScene',
  YourCart = 'YourCart',
  AddAddress = 'AddAddress',
  SelectPrescription = 'SelectPrescription',
  UploadPrescription = 'UploadPrescription',
  SelectDeliveryAddress = 'SelectDeliveryAddress',
  HealthRecordsHome = 'HealthRecordsHome',
  ConsultDetails = 'ConsultDetails',
  RecordDetails = 'RecordDetails',
  SymptomChecker = 'SymptomChecker',
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
  [AppRoutes.AssociateDoctorDetails]: {
    screen: DoctorDetails,
  },
  [AppRoutes.AppointmentDetails]: {
    screen: AppointmentDetails,
  },
  [AppRoutes.SearchMedicineScene]: {
    screen: SearchMedicineScene,
  },
  [AppRoutes.MedicineDetailsScene]: {
    screen: MedicineDetailsScene,
  },
  [AppRoutes.ApplyCouponScene]: {
    screen: ApplyCouponScene,
  },
  [AppRoutes.StorPickupScene]: {
    screen: StorePickupScene,
  },
  [AppRoutes.ChatRoom]: {
    screen: ChatRoom,
  },
  [AppRoutes.YourOrdersScene]: {
    screen: YourOrdersScene,
  },
  [AppRoutes.OrderDetailsScene]: {
    screen: OrderDetailsScene,
  },
  [AppRoutes.SelectPrescription]: {
    screen: SelectPrescription,
  },
  [AppRoutes.UploadPrescription]: {
    screen: UploadPrescription,
  },
  [AppRoutes.YourCart]: {
    screen: YourCart,
  },
  [AppRoutes.AddAddress]: {
    screen: AddAddress,
  },
  [AppRoutes.SelectDeliveryAddress]: {
    screen: SelectDeliveryAddress,
  },
  [AppRoutes.HealthRecordsHome]: {
    screen: HealthRecordsHome,
  },
  [AppRoutes.ConsultDetails]: {
    screen: ConsultDetails,
  },
  [AppRoutes.RecordDetails]: {
    screen: RecordDetails,
  },
  [AppRoutes.SymptomChecker]: {
    screen: SymptomChecker,
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
