import { AddressBook } from '@aph/mobile-patients/src/components/Account/AddressBook';
import { MyAccount } from '@aph/mobile-patients/src/components/Account/MyAccount';
import { NotificationSettings } from '@aph/mobile-patients/src/components/Account/NotificationSettings';
import { ChatRoom } from '@aph/mobile-patients/src/components/Consult/ChatRoom';
import { AppointmentDetails } from '@aph/mobile-patients/src/components/ConsultRoom/AppointmentDetails';
import { Consult } from '@aph/mobile-patients/src/components/ConsultRoom/Consult';
import { ConsultRoom } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultRoom';
import { DoctorDetails } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorDetails';
import { DoctorSearch } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearch';
import { DoctorSearchListing } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { HealthRecords } from '@aph/mobile-patients/src/components/HealthRecords';
import { AddRecord } from '@aph/mobile-patients/src/components/HealthRecords/AddRecord';
import { Login } from '@aph/mobile-patients/src/components/Login';
import { AddAddress } from '@aph/mobile-patients/src/components/Medicines/AddAddress';
import { ApplyCouponScene } from '@aph/mobile-patients/src/components/Medicines/ApplyCouponScene';
import { Medicine } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { MedicineDetailsScene } from '@aph/mobile-patients/src/components/Medicines/MedicineDetailsScene';
import { SearchMedicineScene } from '@aph/mobile-patients/src/components/Medicines/SearchMedicineScene';
import { SelectDeliveryAddress } from '@aph/mobile-patients/src/components/Medicines/SelectDeliveryAddress';
import { StorePickupScene } from '@aph/mobile-patients/src/components/Medicines/StorePickupScene';
import { UploadPrescription } from '@aph/mobile-patients/src/components/Medicines/UploadPrescription';
import { YourCart } from '@aph/mobile-patients/src/components/Medicines/YourCart';
import { MultiSignup } from '@aph/mobile-patients/src/components/MultiSignup';
import { Onboarding } from '@aph/mobile-patients/src/components/Onboarding';
import { OrderDetailsScene } from '@aph/mobile-patients/src/components/OrderDetailsScene';
import { OTPVerification } from '@aph/mobile-patients/src/components/OTPVerification';
import { SignUp } from '@aph/mobile-patients/src/components/SignUp';
import { SplashScreen } from '@aph/mobile-patients/src/components/SplashScreen';
import { TabBar } from '@aph/mobile-patients/src/components/TabBar';
import { YourOrdersScene } from '@aph/mobile-patients/src/components/YourOrdersScene';
import { AzureUpload } from '@aph/mobile-patients/src/components/AzureUpload';
import { AppointmentOnlineDetails } from '@aph/mobile-patients/src/components/Consult/AppointmentOnlineDetails';
import { ChooseDoctor } from '@aph/mobile-patients/src/components/Consult/ChooseDoctor';
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
import { CheckoutScene } from '@aph/mobile-patients/src/components/CheckoutScene';
import { PaymentScene } from '@aph/mobile-patients/src/components/PaymentScene';
import { MedicineConsultDetails } from '@aph/mobile-patients/src/components/HealthRecords/MedicineConsultDetails';
import { MobileHelp } from '@aph/mobile-patients/src/components/ui/MobileHelp';
import { ShopByBrand } from '@aph/mobile-patients/src/components/Medicines/ShopByBrand';
import { ImageSliderScreen } from '@aph/mobile-patients/src/components/ui/ImageSiderScreen';
import { SearchByBrand } from '@aph/mobile-patients/src/components/Medicines/SearchByBrand';
import { AsyncStorage } from 'react-native';
import { CommonScreenLog, CommonLogEvent } from '../FunctionHelpers/DeviceHelper';
import { TestsDetailScene } from '@aph/mobile-patients/src/components/Tests/TestsDetailScene';
import { TestsCart } from '@aph/mobile-patients/src/components/Tests/TestsCart';
import { MedAndTestCart } from '@aph/mobile-patients/src/components/Tests/MedAndTestCart';
import { TestDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import { ManageProfile } from '@aph/mobile-patients/src/components/Account/ManageProfile';
import { EditProfile } from '@aph/mobile-patients/src/components/Account/EditProfile';

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
  MobileHelp = 'MobileHelp',
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
  CheckoutScene = 'CheckoutScene',
  PaymentScene = 'PaymentScene',
  AddAddress = 'AddAddress',
  UploadPrescription = 'UploadPrescription',
  SelectDeliveryAddress = 'SelectDeliveryAddress',
  HealthRecordsHome = 'HealthRecordsHome',
  ConsultDetails = 'ConsultDetails',
  RecordDetails = 'RecordDetails',
  SymptomChecker = 'SymptomChecker',
  AddressBook = 'AddressBook',
  NotificationSettings = 'NotificationSettings',
  AddRecord = 'AddRecord',
  AzureUpload = 'AzureUpload',
  AppointmentOnlineDetails = 'AppointmentOnlineDetails',
  ChooseDoctor = 'ChooseDoctor',
  MedicineConsultDetails = 'MedicineConsultDetails',
  ShopByBrand = 'ShopByBrand',
  ImageSliderScreen = 'ImageSliderScreen',
  SearchByBrand = 'SearchByBrand',
  TestsCart = 'TestsCart',
  MedAndTestCart = 'MedAndTestCart',
  TestDetails = 'TestDetails',
  ManageProfile = 'ManageProfile',
  EditProfile = 'EditProfile',
  TestsDetailScene = 'TestsDetailScene',
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
  [AppRoutes.MobileHelp]: {
    screen: MobileHelp,
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
  [AppRoutes.CheckoutScene]: {
    screen: CheckoutScene,
  },
  [AppRoutes.PaymentScene]: {
    screen: PaymentScene,
  },
  [AppRoutes.OrderDetailsScene]: {
    screen: OrderDetailsScene,
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
  [AppRoutes.AddressBook]: {
    screen: AddressBook,
  },
  [AppRoutes.NotificationSettings]: {
    screen: NotificationSettings,
  },
  [AppRoutes.AddRecord]: {
    screen: AddRecord,
  },
  [AppRoutes.AzureUpload]: {
    screen: AzureUpload,
  },
  [AppRoutes.AppointmentOnlineDetails]: {
    screen: AppointmentOnlineDetails,
  },
  [AppRoutes.ChooseDoctor]: {
    screen: ChooseDoctor,
  },
  [AppRoutes.MedicineConsultDetails]: {
    screen: MedicineConsultDetails,
  },
  [AppRoutes.ShopByBrand]: {
    screen: ShopByBrand,
  },
  [AppRoutes.ImageSliderScreen]: {
    screen: ImageSliderScreen,
  },
  [AppRoutes.SearchByBrand]: {
    screen: SearchByBrand,
  },
  [AppRoutes.TestsCart]: {
    screen: TestsCart,
  },
  [AppRoutes.MedAndTestCart]: {
    screen: MedAndTestCart,
  },
  [AppRoutes.TestDetails]: {
    screen: TestDetails,
  },
  [AppRoutes.ManageProfile]: {
    screen: ManageProfile,
  },
  [AppRoutes.EditProfile]: {
    screen: EditProfile,
  },
  [AppRoutes.TestsDetailScene]: {
    screen: TestsDetailScene,
  },
};

const logTabEvents = (routing: any) => {
  if (routing.routeName === 'TabBar') {
    switch (routing.index) {
      case 0:
        CommonLogEvent('TAB_BAR', 'CONSULT_ROOM clicked');
        break;
      case 1:
        CommonLogEvent('TAB_BAR', 'HEALTH_RECORDS clicked');
        break;
      case 2:
        CommonLogEvent('TAB_BAR', 'MEDICINES clicked');
        break;
      case 3:
        CommonLogEvent('TAB_BAR', 'MY_ACCOUNT clicked');
        break;
      default:
        break;
    }
  }
};

const stackConfig: StackNavigatorConfig = {
  initialRouteName: AppRoutes.SplashScreen,
  headerMode: 'none',
  cardStyle: { backgroundColor: 'transparent' },
  transitionConfig: (sceneProps) => {
    try {
      AsyncStorage.setItem('setCurrentName', sceneProps.scene.route.routeName);
      CommonScreenLog(sceneProps.scene.route.routeName, sceneProps.scene.route.routeName);
      logTabEvents(sceneProps.scene.route);
      console.log('sceneProps success', sceneProps.scene.route);
    } catch (error) {
      console.log('sceneProps error', error);
    }
    return {
      transitionSpec: {
        duration: sceneProps.scene.route.routeName === 'TabBar' ? 0 : 100,
      },
    };
  },
};

const Navigator = createStackNavigator(routeConfigMap, stackConfig);

export const NavigatorContainer = createAppContainer(Navigator);
