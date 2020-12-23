import analytics from '@react-native-firebase/analytics';
import { isNumber } from 'lodash';
import { AddressBook } from '@aph/mobile-patients/src/components/Account/AddressBook';
import { MyAccount } from '@aph/mobile-patients/src/components/Account/MyAccount';
import { NotificationSettings } from '@aph/mobile-patients/src/components/Account/NotificationSettings';
import { ChatRoom } from '@aph/mobile-patients/src/components/Consult/ChatRoom';
import { AppointmentDetails } from '@aph/mobile-patients/src/components/ConsultRoom/AppointmentDetails';
import { Consult } from '@aph/mobile-patients/src/components/ConsultRoom/Consult';
import {
  ConsultRoom,
  tabBarOptions,
} from '@aph/mobile-patients/src/components/ConsultRoom/ConsultRoom';
import { DoctorDetails } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorDetails';
import { DoctorSearch } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearch';
import { DoctorSearchListing } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
import { FilterHealthRecordScene } from '@aph/mobile-patients/src/components/FilterHealthRecordScene';
import { HealthRecords } from '@aph/mobile-patients/src/components/HealthRecords';
import { AddRecord } from '@aph/mobile-patients/src/components/HealthRecords/AddRecord';
import { ConsultRxScreen } from '@aph/mobile-patients/src/components/HealthRecords/ConsultRxScreen';
import { ClinicalDocumentScreen } from '@aph/mobile-patients/src/components/HealthRecords/ClinicalDocumentScreen';
import { HealthConditionScreen } from '@aph/mobile-patients/src/components/HealthRecords/HealthConditionScreen';
import { BillScreen } from '@aph/mobile-patients/src/components/HealthRecords/BillScreen';
import { TestReportScreen } from '@aph/mobile-patients/src/components/HealthRecords/TestReportScreen';
import { HospitalizationScreen } from '@aph/mobile-patients/src/components/HealthRecords/HospitalizationScreen';
import { InsuranceScreen } from '@aph/mobile-patients/src/components/HealthRecords/InsuranceScreen';
import { Login } from '@aph/mobile-patients/src/components/Login';
import { AddAddress } from '@aph/mobile-patients/src/components/Medicines/AddAddress';
import { ApplyCouponScene } from '@aph/mobile-patients/src/components/Medicines/ApplyCouponScene';
import { Medicine } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { MedicineSearch } from '@aph/mobile-patients/src/components/MedicineSearch/MedicineSearch';
import { MedicineListing } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListing';
import { MedicineBuyAgain } from '@aph/mobile-patients/src/components/MedicineBuyAgain/MedicineBuyAgain';
import { MedicineDetailsScene } from '@aph/mobile-patients/src/components/Medicines/MedicineDetailsScene';
import { SelectDeliveryAddress } from '@aph/mobile-patients/src/components/Medicines/SelectDeliveryAddress';
import { StorePickupScene } from '@aph/mobile-patients/src/components/Medicines/StorePickupScene';
import { UploadPrescription } from '@aph/mobile-patients/src/components/Medicines/UploadPrescription';
import { YourCart } from '@aph/mobile-patients/src/components/Medicines/YourCart';
import { YourCartUploadPrescriptions } from '@aph/mobile-patients/src/components/Medicines/YourCartUploadPrescriptions';
import { PharmacyPaymentStatus } from '@aph/mobile-patients/src/components/Medicines/PharmacyPaymentStatus';
import { MultiSignup } from '@aph/mobile-patients/src/components/MultiSignup';
import { OrderDetailsScene } from '@aph/mobile-patients/src/components/OrderDetailsScene';
import { OrderModifiedScreen } from '@aph/mobile-patients/src/components/OrderModifiedScreen';
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
  StackViewTransitionConfigs,
} from 'react-navigation';
import { HealthRecordsHome } from '@aph/mobile-patients/src/components/HealthRecords/HealthRecordsHome';
import { ConsultDetails } from '@aph/mobile-patients/src/components/HealthRecords/ConsultDetails';
import { RecordDetails } from '@aph/mobile-patients/src/components/HealthRecords/RecordDetails';
import { HealthRecordDetails } from '@aph/mobile-patients/src/components/HealthRecords/HealthRecordDetails';
import { SearchAppointmentScreen } from '@aph/mobile-patients/src/components/ConsultRoom/SearchAppointmentScreen';
import { AppointmentFilterScene } from '@aph/mobile-patients/src/components/ConsultRoom/AppointmentFilterScene';
import { SymptomChecker } from '@aph/mobile-patients/src/components/SymptomChecker';
import { PaymentScene } from '@aph/mobile-patients/src/components/PaymentScene';
import { MedicineConsultDetails } from '@aph/mobile-patients/src/components/HealthRecords/MedicineConsultDetails';
import { MobileHelp } from '@aph/mobile-patients/src/components/ui/MobileHelp';
import { NeedHelpPharmacyOrder } from '@aph/mobile-patients/src/components/NeedHelpPharmacyOrder';
import { NeedHelpConsultOrder } from '@aph/mobile-patients/src/components/NeedHelpConsultOrder';
import { NeedHelpQueryDetails } from '@aph/mobile-patients/src/components/NeedHelpQueryDetails';
import { ShopByBrand } from '@aph/mobile-patients/src/components/Medicines/ShopByBrand';
import { ImageSliderScreen } from '@aph/mobile-patients/src/components/ui/ImageSiderScreen';
import AsyncStorage from '@react-native-community/async-storage';
import { TestsCart } from '@aph/mobile-patients/src/components/Tests/TestsCart';
import { MedAndTestCart } from '@aph/mobile-patients/src/components/Tests/MedAndTestCart';
import { TestDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';

import { SearchTestScene } from '@aph/mobile-patients/src/components/Medicines/SearchTestScene';
import { YourOrdersTest } from '@aph/mobile-patients/src/components/Tests/YourOrdersTests';
import { YourTestDetails } from '@aph/mobile-patients/src/components/Tests/YourTestDetails';
import { TestOrderDetails } from '@aph/mobile-patients/src/components/Tests/TestOrderDetails';
import { TestOrderDetailsSummary } from '@aph/mobile-patients/src/components/Tests/TestOrderDetailsSummary';
import { ClinicSelection } from '@aph/mobile-patients/src/components/Tests/ClinicSelection';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { EditProfile } from '@aph/mobile-patients/src/components/Account/EditProfile';
import { ManageProfile } from '@aph/mobile-patients/src/components/Account/ManageProfile';
import { LinkUHID } from '@aph/mobile-patients/src/components/Account/LinkUHID';
import { ReadMoreLinkUHID } from '@aph/mobile-patients/src/components/Account/ReadMoreLinkUHID';
import { MyMembership } from '@aph/mobile-patients/src/components/SubscriptionMembership/MyMembership';
import { MembershipDetails } from '@aph/mobile-patients/src/components/SubscriptionMembership/MembershipDetails';
import { TestsByCategory } from '@aph/mobile-patients/src/components/Medicines/TestsByCategory';
import { RenderPdf } from '@aph/mobile-patients/src/components/ui/RenderPdf';
import { TestPayment } from '@aph/mobile-patients/src/components/Tests/TestPayment';
import { ApplyConsultCoupon } from '@aph/mobile-patients/src/components/ConsultRoom/ApplyConsultCoupon';
import { CovidScan } from '@aph/mobile-patients/src/components/CovidScan';
import { ConsultCheckout } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultCheckout';
import { ConsultPaymentnew } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultPaymentnew';
import { ConsultPaymentStatus } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultPaymentStatus';
import { CheckoutSceneNew } from '@aph/mobile-patients/src/components/CheckoutScenenew';
import { PaymentStatus } from '@aph/mobile-patients/src/components/PaymentStatus';
import { OneApolloMembership } from '@aph/mobile-patients/src/components/OneApollo/OneApolloMembership';
// import { ConsultDetailsById } from './ConsultRoom/ConsultDetailsById';
import { Tests } from './Tests/Tests';
import { NotificationScreen } from '@aph/mobile-patients/src/components/Account/NotificationScreen';
import { ChennaiNonCartOrderForm } from '@aph/mobile-patients/src/components/Medicines/ChennaiNonCartOrderForm';
import MyPaymentsScreen from '@aph/mobile-patients/src/components/MyPayments/MyPaymentsScreen';
import PaymentStatusScreen from '@aph/mobile-patients/src/components/MyPayments/PaymentStatus/PaymentStatusScreen';
import { ConsultTypeScreen } from './ConsultRoom/ConsultTypeScreen';
import { CommonWebView } from '@aph/mobile-patients/src/components/CommonWebView';
import { RefundStatus } from '@aph/mobile-patients/src/components/RefundStatus';
import { MedicineCart } from '@aph/mobile-patients/src/components/MedicineCart/MedicineCart';
import { CartSummary } from '@aph/mobile-patients/src/components/MedicineCart/CartSummary';
import { StorePickup } from '@aph/mobile-patients/src/components/MedicineCart/StorePickup';
import { PickUpCartSummary } from '@aph/mobile-patients/src/components/MedicineCart/PickUpCartSummary';

import { SymptomTracker } from '@aph/mobile-patients/src/components/SymptomTracker';
import { SymptomSelection } from '@aph/mobile-patients/src/components/SymptomSelection';
import { PaymentCheckout } from '@aph/mobile-patients/src/components/Consult/PaymentCheckout';
import { CircleSubscription } from '@aph/mobile-patients/src/components/CirclePlan/CircleSubscription';
import { SubscriptionPaymentGateway } from '@aph/mobile-patients/src/components/CirclePlan/SubscriptionPaymentGateway';

import { Maps } from '@aph/mobile-patients/src/components/ui/Maps';
export enum AppRoutes {
  Login = 'Login',
  ConsultRoom = 'ConsultRoom',
  ApplyConsultCoupon = 'ApplyConsultCoupon',
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
  NeedHelpPharmacyOrder = 'NeedHelpPharmacyOrder',
  NeedHelpConsultOrder = 'NeedHelpConsultOrder',
  NeedHelpQueryDetails = 'NeedHelpQueryDetails',
  Consult = 'Consult',
  FilterScene = 'FilterScene',
  FilterHealthRecordScene = 'FilterHealthRecordScene',
  DoctorDetails = 'DoctorDetails',
  AssociateDoctorDetails = 'AssociateDoctorDetails',
  AppointmentDetails = 'AppointmentDetails',
  StorPickupScene = 'StorPickupScene',
  SearchTestScene = 'SearchTestScene',
  MedicineSearch = 'MedicineSearch',
  MedicineListing = 'MedicineListing',
  MedicineBuyAgain = 'MedicineBuyAgain',
  MedicineDetailsScene = 'MedicineDetailsScene',
  ApplyCouponScene = 'ApplyCouponScene',
  ChatRoom = 'ChatRoom',
  YourOrdersScene = 'YourOrdersScene',
  OrderDetailsScene = 'OrderDetailsScene',
  OrderModifiedScreen = 'OrderModifiedScreen',
  YourCart = 'YourCart',
  YourCartUploadPrescriptions = 'YourCartUploadPrescriptions',
  PharmacyPaymentStatus = 'PharmacyPaymentStatus',
  TestsCheckoutScene = 'TestsCheckoutScene',
  PaymentScene = 'PaymentScene',
  AddAddress = 'AddAddress',
  UploadPrescription = 'UploadPrescription',
  ChennaiNonCartOrderForm = 'ChennaiNonCartOrderForm',
  SelectDeliveryAddress = 'SelectDeliveryAddress',
  HealthRecordsHome = 'HealthRecordsHome',
  ConsultDetails = 'ConsultDetails',
  RecordDetails = 'RecordDetails',
  HealthRecordDetails = 'HealthRecordDetails',
  SymptomChecker = 'SymptomChecker',
  AddressBook = 'AddressBook',
  NotificationSettings = 'NotificationSettings',
  AddRecord = 'AddRecord',
  ClinicalDocumentScreen = 'ClinicalDocumentScreen',
  HealthConditionScreen = 'HealthConditionScreen',
  ConsultRxScreen = 'ConsultRxScreen',
  BillScreen = 'BillScreen',
  TestReportScreen = 'TestReportScreen',
  HospitalizationScreen = 'HospitalizationScreen',
  InsuranceScreen = 'InsuranceScreen',
  AzureUpload = 'AzureUpload',
  AppointmentOnlineDetails = 'AppointmentOnlineDetails',
  ChooseDoctor = 'ChooseDoctor',
  MedicineConsultDetails = 'MedicineConsultDetails',
  ShopByBrand = 'ShopByBrand',
  ImageSliderScreen = 'ImageSliderScreen',
  TestsByCategory = 'TestsByCategory',
  TestsCart = 'TestsCart',
  TestPayment = 'TestPayment',
  MedAndTestCart = 'MedAndTestCart',
  TestDetails = 'TestDetails',
  EditProfile = 'EditProfile',
  ManageProfile = 'ManageProfile',
  LinkUHID = 'LinkUHID',
  ReadMoreLinkUHID = 'ReadMoreLinkUHID',
  MyMembership = 'MyMembership',
  MembershipDetails = 'MembershipDetails',
  YourOrdersTest = 'YourOrdersTest',
  YourTestDetails = 'YourTestDetails',
  TestOrderDetails = 'TestOrderDetails',
  TestOrderDetailsSummary = 'TestOrderDetailsSummary',
  ClinicSelection = 'ClinicSelection',
  RenderPdf = 'RenderPdf',
  Tests = 'Tests',
  CovidScan = 'CovidScan',
  ConsultCheckout = 'ConsultCheckout',
  ConsultPaymentnew = 'ConsultPaymentnew',
  ConsultPaymentStatus = 'ConsultPaymentStatus',
  CheckoutSceneNew = 'CheckoutSceneNew',
  PaymentStatus = 'PaymentStatus',
  // ConsultDetailsById = 'ConsultDetailsById',
  NotificationScreen = 'NotificationScreen',
  MyPaymentsScreen = 'MyPaymentsScreen',
  PaymentStatusScreen = 'PaymentStatusScreen',
  OneApolloMembership = 'OneApolloMembership',
  ConsultTypeScreen = 'ConsultTypeScreen',
  CommonWebView = 'CommonWebView',
  RefundStatus = 'RefundStatus',
  MedicineCart = 'MedicineCart',
  CartSummary = 'CartSummary',
  StorePickup = 'StorePickup',
  PickUpCartSummary = 'PickUpCartSummary',
  SymptomTracker = 'SymptomTracker',
  SymptomSelection = 'SymptomSelection',
  Maps = 'Maps',
  SearchAppointmentScreen = 'SearchAppointmentScreen',
  AppointmentFilterScene = 'AppointmentFilterScene',
  PaymentCheckout = 'PaymentCheckout',
  CircleSubscription = 'CircleSubscription',
  SubscriptionPaymentGateway = 'SubscriptionPaymentGateway',
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
  [AppRoutes.DoctorSearch]: {
    screen: DoctorSearch,
    path: 'DoctorSearchPage',
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
    navigationOptions: {
      gesturesEnabled: false,
    },
  },
  [AppRoutes.ConsultRoom]: {
    screen: ConsultRoom,
    path: 'ConsultRoomPage',
  },
  [AppRoutes.ApplyConsultCoupon]: {
    screen: ApplyConsultCoupon,
  },
  [AppRoutes.DoctorSearchListing]: {
    screen: DoctorSearchListing,
    path: 'DoctorSearchListingPage',
  },
  [AppRoutes.HealthRecords]: {
    screen: HealthRecords,
  },
  [AppRoutes.Medicine]: {
    screen: Medicine,
    path: 'MedicinePage',
  },
  [AppRoutes.Tests]: {
    screen: Tests,
    path: 'TestsPage',
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
  [AppRoutes.NeedHelpPharmacyOrder]: {
    screen: NeedHelpPharmacyOrder,
  },
  [AppRoutes.NeedHelpConsultOrder]: {
    screen: NeedHelpConsultOrder,
  },
  [AppRoutes.NeedHelpQueryDetails]: {
    screen: NeedHelpQueryDetails,
  },
  [AppRoutes.Consult]: {
    screen: Consult,
    path: 'ConsultPage',
  },
  [AppRoutes.FilterScene]: {
    screen: FilterScene,
  },
  [AppRoutes.FilterHealthRecordScene]: {
    screen: FilterHealthRecordScene,
  },
  [AppRoutes.DoctorDetails]: {
    screen: DoctorDetails,
    path: 'DoctorDetailsPage',
  },
  [AppRoutes.AssociateDoctorDetails]: {
    screen: DoctorDetails,
  },
  [AppRoutes.AppointmentDetails]: {
    screen: AppointmentDetails,
  },
  [AppRoutes.SearchTestScene]: {
    screen: SearchTestScene,
  },
  [AppRoutes.MedicineSearch]: {
    screen: MedicineSearch,
  },
  [AppRoutes.MedicineListing]: {
    screen: MedicineListing,
  },
  [AppRoutes.MedicineBuyAgain]: {
    screen: MedicineBuyAgain,
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
    path: 'ChatRoomPage',
    navigationOptions: {
      gesturesEnabled: false,
    },
  },
  [AppRoutes.YourOrdersScene]: {
    screen: YourOrdersScene,
  },
  [AppRoutes.PaymentScene]: {
    screen: PaymentScene,
  },
  [AppRoutes.OrderDetailsScene]: {
    screen: OrderDetailsScene,
  },
  [AppRoutes.OrderModifiedScreen]: {
    screen: OrderModifiedScreen,
  },
  [AppRoutes.UploadPrescription]: {
    screen: UploadPrescription,
    path: 'MedUploadPrescription',
    navigationOptions: {
      gesturesEnabled: false,
    },
  },
  [AppRoutes.ChennaiNonCartOrderForm]: {
    screen: ChennaiNonCartOrderForm,
  },
  [AppRoutes.YourCart]: {
    screen: YourCart,
  },
  [AppRoutes.YourCartUploadPrescriptions]: {
    screen: YourCartUploadPrescriptions,
  },
  [AppRoutes.PharmacyPaymentStatus]: {
    screen: PharmacyPaymentStatus,
  },
  [AppRoutes.AddAddress]: {
    screen: AddAddress,
  },
  [AppRoutes.SelectDeliveryAddress]: {
    screen: SelectDeliveryAddress,
  },
  [AppRoutes.HealthRecordsHome]: {
    screen: HealthRecordsHome,
    path: 'HealthPHRHome',
  },
  [AppRoutes.ConsultDetails]: {
    screen: ConsultDetails,
    path: 'ConsultPrescription',
  },
  [AppRoutes.RecordDetails]: {
    screen: RecordDetails,
  },
  [AppRoutes.HealthRecordDetails]: {
    screen: HealthRecordDetails,
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
  [AppRoutes.ConsultRxScreen]: {
    screen: ConsultRxScreen,
  },
  [AppRoutes.HealthConditionScreen]: {
    screen: HealthConditionScreen,
  },
  [AppRoutes.ClinicalDocumentScreen]: {
    screen: ClinicalDocumentScreen,
  },
  [AppRoutes.TestReportScreen]: {
    screen: TestReportScreen,
  },
  [AppRoutes.HospitalizationScreen]: {
    screen: HospitalizationScreen,
  },
  [AppRoutes.BillScreen]: {
    screen: BillScreen,
  },
  [AppRoutes.InsuranceScreen]: {
    screen: InsuranceScreen,
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
  [AppRoutes.TestsByCategory]: {
    screen: TestsByCategory,
  },
  [AppRoutes.TestsCart]: {
    screen: TestsCart,
  },
  [AppRoutes.TestPayment]: {
    screen: TestPayment,
  },
  [AppRoutes.MedAndTestCart]: {
    screen: MedAndTestCart,
  },
  [AppRoutes.TestDetails]: {
    screen: TestDetails,
    path: 'TestDetailsPage',
  },
  [AppRoutes.EditProfile]: {
    screen: EditProfile,
  },
  [AppRoutes.ManageProfile]: {
    screen: ManageProfile,
    path: 'ProfileSelection',
  },
  [AppRoutes.LinkUHID]: {
    screen: LinkUHID,
  },
  [AppRoutes.ReadMoreLinkUHID]: {
    screen: ReadMoreLinkUHID,
  },
  [AppRoutes.MyMembership]: {
    screen: MyMembership,
  },
  [AppRoutes.MembershipDetails]: {
    screen: MembershipDetails,
  },
  [AppRoutes.YourOrdersTest]: {
    screen: YourOrdersTest,
  },
  [AppRoutes.YourTestDetails]: {
    screen: YourTestDetails,
  },
  [AppRoutes.TestOrderDetails]: {
    screen: TestOrderDetails,
  },
  [AppRoutes.TestOrderDetailsSummary]: {
    screen: TestOrderDetailsSummary,
  },
  [AppRoutes.ClinicSelection]: {
    screen: ClinicSelection,
  },
  [AppRoutes.RenderPdf]: {
    screen: RenderPdf,
  },
  [AppRoutes.CovidScan]: {
    screen: CovidScan,
  },
  [AppRoutes.ConsultCheckout]: {
    screen: ConsultCheckout,
  },
  [AppRoutes.ConsultPaymentnew]: {
    screen: ConsultPaymentnew,
  },
  [AppRoutes.ConsultPaymentStatus]: {
    screen: ConsultPaymentStatus,
  },
  [AppRoutes.CheckoutSceneNew]: {
    screen: CheckoutSceneNew,
  },
  [AppRoutes.PaymentStatus]: {
    screen: PaymentStatus,
  },
  // [AppRoutes.ConsultDetailsById]: {
  //   screen: ConsultDetailsById,
  // },
  [AppRoutes.NotificationScreen]: {
    screen: NotificationScreen,
  },
  [AppRoutes.MyPaymentsScreen]: {
    screen: MyPaymentsScreen,
  },
  [AppRoutes.PaymentStatusScreen]: {
    screen: PaymentStatusScreen,
  },
  [AppRoutes.OneApolloMembership]: {
    screen: OneApolloMembership,
    path: 'OneApolloPage',
  },
  [AppRoutes.ConsultTypeScreen]: {
    screen: ConsultTypeScreen,
  },
  [AppRoutes.CommonWebView]: {
    screen: CommonWebView,
  },
  [AppRoutes.RefundStatus]: {
    screen: RefundStatus,
  },
  [AppRoutes.MedicineCart]: {
    screen: MedicineCart,
  },
  [AppRoutes.CartSummary]: {
    screen: CartSummary,
  },
  [AppRoutes.StorePickup]: {
    screen: StorePickup,
  },
  [AppRoutes.PickUpCartSummary]: {
    screen: PickUpCartSummary,
  },
  [AppRoutes.SymptomTracker]: {
    screen: SymptomTracker,
  },
  [AppRoutes.SymptomSelection]: {
    screen: SymptomSelection,
  },
  [AppRoutes.Maps]: {
    screen: Maps,
  },
  [AppRoutes.SearchAppointmentScreen]: {
    screen: SearchAppointmentScreen,
  },
  [AppRoutes.AppointmentFilterScene]: {
    screen: AppointmentFilterScene,
  },
  [AppRoutes.PaymentCheckout]: {
    screen: PaymentCheckout,
  },
  [AppRoutes.CircleSubscription]: {
    screen: CircleSubscription,
  },
  [AppRoutes.SubscriptionPaymentGateway]: {
    screen: SubscriptionPaymentGateway,
  },
};

const getTabBarRoute = (index: number) => {
  return tabBarOptions?.[index]?.title || '';
};

const logRouteChange = (route: string, routeIndex: number | undefined) => {
  const routeName = isNumber(routeIndex) ? getTabBarRoute(routeIndex) : route;
  analytics().logScreenView({
    screen_class: route,
    screen_name: routeName,
  });
};

let prevRoute = '';
export const getCurrentRoute = () => prevRoute;

const stackConfig: StackNavigatorConfig = {
  initialRouteName: AppRoutes.SplashScreen,
  headerMode: 'none',
  cardStyle: { backgroundColor: 'transparent' },
  mode: 'card',
  transitionConfig: (sceneProps) => {
    try {
      const currentRoute = sceneProps?.scene?.route?.routeName;
      const currentRouteIndex = sceneProps?.scene?.route?.index;
      if (prevRoute !== currentRoute) {
        AsyncStorage.setItem('setCurrentName', currentRoute);
        prevRoute = currentRoute;
        logRouteChange(currentRoute, currentRouteIndex);
      }
    } catch (error) {
      CommonBugFender('NavigatorContainer_stackConfig_try', error);
      console.log('sceneProps error', error);
    }
    return {
      ...StackViewTransitionConfigs.SlideFromRightIOS,
      transitionSpec: {
        duration: sceneProps.scene.route.routeName === 'TabBar' ? 0 : 100,
      },
    };
  },
};

const Navigator = createStackNavigator(routeConfigMap, stackConfig);

export const NavigatorContainer = createAppContainer(Navigator);
