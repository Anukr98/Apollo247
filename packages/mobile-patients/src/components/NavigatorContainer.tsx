import { ApplyCouponScene } from '@aph/mobile-patients/src/components/Medicines/ApplyCouponScene';
import { AppointmentDetails } from '@aph/mobile-patients/src/components/AppointmentDetails';
import { Consult } from '@aph/mobile-patients/src/components/Consult';
import { ConsultRoom } from '@aph/mobile-patients/src/components/ConsultRoom';
import { DoctorDetails } from '@aph/mobile-patients/src/components/DoctorDetails';
import { DoctorSearch } from '@aph/mobile-patients/src/components/DoctorSearch';
import { DoctorSearchListing } from '@aph/mobile-patients/src/components/DoctorSearchListing';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { HealthRecords } from '@aph/mobile-patients/src/components/HealthRecords';
import { Login } from '@aph/mobile-patients/src/components/Login';
import { Medicine } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { MedicineDetailsScene } from '@aph/mobile-patients/src/components/Medicines/MedicineDetailsScene';
import { MultiSignup } from '@aph/mobile-patients/src/components/MultiSignup';
import { MyAccount } from '@aph/mobile-patients/src/components/MyAccount';
import { Onboarding } from '@aph/mobile-patients/src/components/Onboarding';
import { OTPVerification } from '@aph/mobile-patients/src/components/OTPVerification';
import { SearchMedicineScene } from '@aph/mobile-patients/src/components/Medicines/SearchMedicineScene';
import { SignUp } from '@aph/mobile-patients/src/components/SignUp';
import { SplashScreen } from '@aph/mobile-patients/src/components/SplashScreen';
import { StorePickupScene } from '@aph/mobile-patients/src/components/Medicines/StorePickupScene';
import { TabBar } from '@aph/mobile-patients/src/components/TabBar';
import { ChatRoom } from '@aph/mobile-patients/src/components/ChatRoom';

import {
  createAppContainer,
  createStackNavigator,
  NavigationRouteConfig,
  StackNavigatorConfig,
} from 'react-navigation';
import { YourOrdersScene } from '@aph/mobile-patients/src/components/YourOrdersScene';
import { OrderDetailsScene } from '@aph/mobile-patients/src/components/OrderDetailsScene';
import { SelectPrescription } from '@aph/mobile-patients/src/components/Medicines/SelectPrescription';
import { UploadPrescription } from '@aph/mobile-patients/src/components/Medicines/UploadPrescription';
import { YourCart } from '@aph/mobile-patients/src/components/Medicines/YourCart';
import { AddAddress } from '@aph/mobile-patients/src/components/Medicines/AddAddress';

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
  SelectPrescription = 'SelectPrescription',
  UploadPrescription = 'UploadPrescription',
  YourCart = 'YourCart',
  AddAddress = 'AddAddress',
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
