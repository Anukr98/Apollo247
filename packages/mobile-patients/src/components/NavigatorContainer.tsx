import analytics from '@react-native-firebase/analytics';
import { isNumber } from 'lodash';
import { AddressBook } from '@aph/mobile-patients/src/components/Account/AddressBook';
import { MyAccount } from '@aph/mobile-patients/src/components/Account/MyAccount';
import { NotificationSettings } from '@aph/mobile-patients/src/components/Account/NotificationSettings';
import { ChatRoom } from '@aph/mobile-patients/src/components/Consult/ChatRoom';
import { AppointmentDetails } from '@aph/mobile-patients/src/components/ConsultRoom/AppointmentDetails';
import { AppointmentDetailsPhysical } from '@aph/mobile-patients/src/components/ConsultRoom/AppointmentDetailsPhysical';
import { Consult } from '@aph/mobile-patients/src/components/ConsultRoom/Consult';
import { HomeScreen, tabBarOptions } from '@aph/mobile-patients/src/components/HomeScreen';
import { DoctorDetails } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorDetails';
import { DoctorDetailsBookingOnRequest } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorDetailsBookingOnRequest';
import { DoctorSearch } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearch';
import { DoctorSearchListing } from '@aph/mobile-patients/src/components/ConsultRoom/DoctorSearchListing';
import { FilterScene } from '@aph/mobile-patients/src/components/FilterScene';
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
import { AddAddressNew } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import { LocationSearch } from '@aph/mobile-patients/src/components/AddressSelection/LocationSearch';
import { EditAddress } from '@aph/mobile-patients/src/components/AddressSelection/EditAddress';
import { ApplyCouponScene } from '@aph/mobile-patients/src/components/Medicines/ApplyCouponScene';
import { ViewCoupons } from '@aph/mobile-patients/src/components/Medicines/ViewCoupons';
import { Medicine } from '@aph/mobile-patients/src/components/Medicines/Medicine';
import { MedicineSearch } from '@aph/mobile-patients/src/components/MedicineSearch/MedicineSearch';
import { MedicineListing } from '@aph/mobile-patients/src/components/MedicineListing/MedicineListing';
import { MedicineBuyAgain } from '@aph/mobile-patients/src/components/MedicineBuyAgain/MedicineBuyAgain';
import { ProductDetailPage } from '@aph/mobile-patients/src/components/ProductDetailPage/ProductDetailPage';
import { SelectDeliveryAddress } from '@aph/mobile-patients/src/components/Medicines/SelectDeliveryAddress';
import { StorePickupScene } from '@aph/mobile-patients/src/components/Medicines/StorePickupScene';
import { UploadPrescription } from '@aph/mobile-patients/src/components/Medicines/UploadPrescription';
import { UploadPrescriptionView } from '@aph/mobile-patients/src/components/UploadPrescription/UploadPrescriptionView';
import { SamplePrescription } from '@aph/mobile-patients/src/components/UploadPrescription/SamplePrescription';
import { PharmacyPaymentStatus } from '@aph/mobile-patients/src/components/Medicines/PharmacyPaymentStatus';
import { MultiSignup } from '@aph/mobile-patients/src/components/MultiSignup';
import { OrderDetailsScene } from '@aph/mobile-patients/src/components/OrderDetailsScene';
import { OrderModifiedScreen } from '@aph/mobile-patients/src/components/OrderModifiedScreen';
import { OTPVerification } from '@aph/mobile-patients/src/components/OTPVerification';
import SignUp from '@aph/mobile-patients/src/components/SignUp';
import { SplashScreen } from '@aph/mobile-patients/src/components/SplashScreen';
import { TabBar } from '@aph/mobile-patients/src/components/TabBar';
import { YourOrdersScene } from '@aph/mobile-patients/src/components/YourOrdersScene';
import { ReturnMedicineOrder } from '@aph/mobile-patients/src/components/ReturnMedicineOrder';
import { AppointmentOnlineDetails } from '@aph/mobile-patients/src/components/Consult/AppointmentOnlineDetails';
import { ChooseDoctor } from '@aph/mobile-patients/src/components/Consult/ChooseDoctor';
import { TestListing } from '@aph/mobile-patients/src/components/Tests/TestListing';
import { TestWidgetListing } from '@aph/mobile-patients/src/components/Tests/TestWidgetListing';
import {
  createAppContainer,
  createStackNavigator,
  NavigationRouteConfig,
  StackNavigatorConfig,
  StackViewTransitionConfigs,
} from 'react-navigation';
import { HealthRecordsHome } from '@aph/mobile-patients/src/components/HealthRecords/HealthRecordsHome';
import { ConsultDetails } from '@aph/mobile-patients/src/components/HealthRecords/ConsultDetails';
import { HealthRecordDetails } from '@aph/mobile-patients/src/components/HealthRecords/HealthRecordDetails';
import { SearchAppointmentScreen } from '@aph/mobile-patients/src/components/ConsultRoom/SearchAppointmentScreen';
import { AppointmentFilterScene } from '@aph/mobile-patients/src/components/ConsultRoom/AppointmentFilterScene';
import { MedicineConsultDetails } from '@aph/mobile-patients/src/components/HealthRecords/MedicineConsultDetails';
import { NeedHelp } from '@aph/mobile-patients/src/components/NeedHelp';
import { NeedHelpPharmacyOrder } from '@aph/mobile-patients/src/components/NeedHelpPharmacyOrder';
import { NeedHelpConsultOrder } from '@aph/mobile-patients/src/components/NeedHelpConsultOrder';
import { NeedHelpQueryDetails } from '@aph/mobile-patients/src/components/NeedHelpQueryDetails';
import { NeedHelpContentView } from '@aph/mobile-patients/src/components/NeedHelpContentView';
import { HelpChatScreen } from '@aph/mobile-patients/src/components/NeedHelp/HelpChatScreen';
import { ShopByBrand } from '@aph/mobile-patients/src/components/Medicines/ShopByBrand';
import { ImageSliderScreen } from '@aph/mobile-patients/src/components/ui/ImageSiderScreen';
import AsyncStorage from '@react-native-community/async-storage';
import { TestsCart } from '@aph/mobile-patients/src/components/Tests/TestsCart';
import { MedAndTestCart } from '@aph/mobile-patients/src/components/Tests/MedAndTestCart';
import { TestDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';

import { SearchTestScene } from '@aph/mobile-patients/src/components/Tests/SearchTestScene';
import { YourOrdersTest } from '@aph/mobile-patients/src/components/Tests/PostOrderJourney/YourOrdersTests';
import { OrderedTestStatus } from '@aph/mobile-patients/src/components/Tests/PostOrderJourney/OrderedTestStatus';
import { TestOrderDetails } from '@aph/mobile-patients/src/components/Tests/PostOrderJourney/TestOrderDetails';
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
import { CovidScan } from '@aph/mobile-patients/src/components/CovidScan';
import { ConsultCheckout } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultCheckout';
import { ConsultPaymentnew } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultPaymentnew';
import { ConsultPaymentStatus } from '@aph/mobile-patients/src/components/ConsultRoom/ConsultPaymentStatus';
import { PaymentStatus } from '@aph/mobile-patients/src/components/PaymentStatus';
import { OneApolloMembership } from '@aph/mobile-patients/src/components/OneApollo/OneApolloMembership';
import { Tests } from './Tests/Tests';
import { NotificationScreen } from '@aph/mobile-patients/src/components/Account/NotificationScreen';
import { ChennaiNonCartOrderForm } from '@aph/mobile-patients/src/components/Medicines/ChennaiNonCartOrderForm';
import MyPaymentsScreen from '@aph/mobile-patients/src/components/MyPayments/MyPaymentsScreen';
import PaymentStatusScreen from '@aph/mobile-patients/src/components/MyPayments/PaymentStatus/PaymentStatusScreen';
import { CommonWebView } from '@aph/mobile-patients/src/components/CommonWebView';
import { RefundStatus } from '@aph/mobile-patients/src/components/RefundStatus';
import { MedicineCartPrescription } from '@aph/mobile-patients/src/components/MedicineCartPrescription';
import { StorePickup } from '@aph/mobile-patients/src/components/MedicineCart/StorePickup';
import { PickUpCartSummary } from '@aph/mobile-patients/src/components/MedicineCart/PickUpCartSummary';
import { SymptomTracker } from '@aph/mobile-patients/src/components/SymptomTracker';
import { SymptomSelection } from '@aph/mobile-patients/src/components/SymptomSelection';
import { PaymentCheckout } from '@aph/mobile-patients/src/components/Consult/PaymentCheckout';
import { PaymentCheckoutPhysical } from '@aph/mobile-patients/src/components/Consult/PaymentCheckoutPhysical';
import { SubscriptionCart } from '@aph/mobile-patients/src/components/CirclePlan/SubscriptionCart';
import { PrescriptionOrderSummary } from '@aph/mobile-patients/src/components/Medicines/PrescriptionOrderSummary';
import { Maps } from '@aph/mobile-patients/src/components/ui/Maps';
import { PaymentMethods } from '@aph/mobile-patients/src/components/PaymentGateway/PaymentMethods';
import { OtherBanks } from '@aph/mobile-patients/src/components/PaymentGateway/OtherBanks';
import { OrderStatus } from '@aph/mobile-patients/src/components/Tests/OrderStatus';
import { ProHealthWebView } from '@aph/mobile-patients/src/components/ProHealthWebView';
import MyOrdersScreen from '@aph/mobile-patients/src/components/MyOrders/MyOrdersScreen';
import { TestRatingScreen } from '@aph/mobile-patients/src/components/Tests/PostOrderJourney/TestRatingScreen';
import { SlotSelection } from '@aph/mobile-patients/src/components/Consult/SlotSelection';
import { VaccineBookingScreen } from '@aph/mobile-patients/src/components/Vaccination/VaccineBookingScreen';
import { AddPatients } from '@aph/mobile-patients/src/components/Tests/TestCartPage/AddPatients';
import { AddressSlotSelection } from '@aph/mobile-patients/src/components/Tests/TestCartPage/AddressSlotSelection';
import { CartPage } from '@aph/mobile-patients/src/components/Tests/TestCartPage/CartPage';
import { ReviewOrder } from '@aph/mobile-patients/src/components/Tests/TestCartPage/ReviewOrder';
import { VaccineBookingConfirmationScreen } from '@aph/mobile-patients//src/components/Vaccination/VaccineBookingConfirmationScreen';
import { BookedVaccineScreen } from '@aph/mobile-patients//src/components/Vaccination/BookedVaccineScreen';
import { ActivateCorporateMembership } from '@aph/mobile-patients//src/components/Vaccination/ActivateCorporateMembership';
import { VaccineTermsAndConditions } from '@aph/mobile-patients//src/components/Vaccination/VaccineTermsAndConditions';
import { TxnsandPayments } from '@aph/mobile-patients/src/components/MyPayments/TxnsandPayments';
import { ManagePayments } from '@aph/mobile-patients/src/components/MyPayments/ManagePayments';
import { NeedHelpDiagnosticsOrder } from '@aph/mobile-patients/src/components/NeedHelpDiagnosticsOrder/NeedHelpDiagnosticsOrder';
import { TestReportViewScreen } from '@aph/mobile-patients/src/components/HealthRecords/TestReportScreenView';
import { CowinRegistrationScreen } from './Vaccination/CowinRegistrationScreen';
import { VaccinationScreen } from '@aph/mobile-patients/src/components/HealthRecords/VaccinationScreen';
import { VaccinationDoseScreen } from '@aph/mobile-patients/src/components/HealthRecords/VaccinationDoseScreen';
import { AddVaccinationRecord } from '@aph/mobile-patients/src/components/HealthRecords/AddVaccinationRecord';
import { CowinCertificateOTPScreen } from '@aph/mobile-patients/src/components/HealthRecords/CowinCertificateOTPScreen';
import { CowinCertificateGetOTP } from '@aph/mobile-patients/src/components/HealthRecords/CowinCertificateGetOTP';
import { CowinProfileSelection } from '@aph/mobile-patients/src/components/HealthRecords/CowinProfileSelection';
import { PostShareAppointmentSelectorScreen } from '@aph/mobile-patients/src/components/ConsultRoom/PostShareAppointmentSelectorScreen';
import { PrescriptionCamera } from '@aph/mobile-patients/src/components/Tests/PrescriptionCamera';
import { SubmittedPrescription } from '@aph/mobile-patients/src/components/Tests/SubmittedPrescription';
import { SpecialOffersScreen } from '@aph/mobile-patients/src/components/SpecialOffers/SpecialOffers';
import { PaymentConfirmation } from '@aph/mobile-patients/src/components/PaymentGateway/PaymentConfirmaiton';
import { ConsultPaymentScreen } from '@aph/mobile-patients/src/components/MyPayments/PaymentStatus/ConsultPaymentScreen';
import { ConsultPackageList } from '@aph/mobile-patients/src/components/Consult/ConsultPackageList';
import { ConsultPackageDetail } from '@aph/mobile-patients/src/components/Consult/ConsultPackageDetail';
import { ConsultPackagePostPurchase } from '@aph/mobile-patients/src/components/Consult/ConsultPackagePostPurchase';
import { ConsultPackageCancellation } from '@aph/mobile-patients/src/components/Consult/ConsultPackageCancellation';
import { PackageCheckout } from '@aph/mobile-patients/src/components/Consult/PackageCheckout';
import { PackagePaymentStatus } from '@aph/mobile-patients/src/components/Consult/PackagePaymentStatus';
import { ConfirmPackageConsult } from '@aph/mobile-patients/src/components/ConsultRoom/ConfirmPackageConsult';
import { AskApolloQuickBook } from '@aph/mobile-patients/src/components/Consult/AskApolloQuickBook';
import { SelectLocation } from '@aph/mobile-patients/src/components/ui/SelectLocation';
import { ShareReferLink } from '@aph/mobile-patients/src/components//ReferAndEarn/ShareReferLink';
import { YourRewardsScreen } from '@aph/mobile-patients/src/components//ReferAndEarn/YourRewardsScreen';
import { EarnedPoints } from '@aph/mobile-patients/src/components/ReferAndEarn/EarnedPoint';
import { RefererTermsAndCondition } from '@aph/mobile-patients/src/components/ReferAndEarn/RefererTermsAndCondition';
import { RefererFAQ } from '@aph/mobile-patients/src/components/ReferAndEarn/ReferrerFAQ';
import { BrandPages } from '@aph/mobile-patients/src/components/BrandPages/BrandPages';
import { CouponScreen } from '@aph/mobile-patients/src/components/Tests/TestCartPage/CouponScreen';
import { InformativeContent } from '@aph/mobile-patients/src/components/HealthRecords/InformationContent';
import { ServerCart } from '@aph/mobile-patients/src/components/ServerCart/ServerCart';
import { ReviewCart } from '@aph/mobile-patients/src/components/ServerCart/ReviewCart';

export enum AppRoutes {
  Login = 'Login',
  HomeScreen = 'HomeScreen',
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
  NeedHelpDiagnosticsOrder = 'NeedHelpDiagnosticsOrder',
  NeedHelpConsultOrder = 'NeedHelpConsultOrder',
  NeedHelpQueryDetails = 'NeedHelpQueryDetails',
  NeedHelpContentView = 'NeedHelpContentView',
  HelpChatScreen = 'HelpChatScreen',
  Consult = 'Consult',
  FilterScene = 'FilterScene',
  DoctorDetails = 'DoctorDetails',
  DoctorDetailsBookingOnRequest = 'DoctorDetailsBookingOnRequest',
  AssociateDoctorDetails = 'AssociateDoctorDetails',
  AppointmentDetails = 'AppointmentDetails',
  AppointmentDetailsPhysical = 'AppointmentDetailsPhysical',
  StorPickupScene = 'StorPickupScene',
  SearchTestScene = 'SearchTestScene',
  MedicineSearch = 'MedicineSearch',
  MedicineListing = 'MedicineListing',
  MedicineBuyAgain = 'MedicineBuyAgain',
  ProductDetailPage = 'ProductDetailPage',
  ApplyCouponScene = 'ApplyCouponScene',
  ViewCoupons = 'ViewCoupons',
  ChatRoom = 'ChatRoom',
  YourOrdersScene = 'YourOrdersScene',
  ReturnMedicineOrder = 'ReturnMedicineOrder',
  OrderDetailsScene = 'OrderDetailsScene',
  OrderModifiedScreen = 'OrderModifiedScreen',
  PharmacyPaymentStatus = 'PharmacyPaymentStatus',
  TestsCheckoutScene = 'TestsCheckoutScene',
  AddAddress = 'AddAddress',
  AddAddressNew = 'AddAddressNew',
  LocationSearch = 'LocationSearch',
  EditAddress = 'EditAddress',
  UploadPrescription = 'UploadPrescription',
  UploadPrescriptionView = 'UploadPrescriptionView',
  SamplePrescription = 'SamplePrescription',
  ChennaiNonCartOrderForm = 'ChennaiNonCartOrderForm',
  SelectDeliveryAddress = 'SelectDeliveryAddress',
  HealthRecordsHome = 'HealthRecordsHome',
  ConsultDetails = 'ConsultDetails',
  HealthRecordDetails = 'HealthRecordDetails',
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
  AppointmentOnlineDetails = 'AppointmentOnlineDetails',
  ChooseDoctor = 'ChooseDoctor',
  MedicineConsultDetails = 'MedicineConsultDetails',
  ShopByBrand = 'ShopByBrand',
  ImageSliderScreen = 'ImageSliderScreen',
  TestsByCategory = 'TestsByCategory',
  TestsCart = 'TestsCart',
  MedAndTestCart = 'MedAndTestCart',
  TestDetails = 'TestDetails',
  EditProfile = 'EditProfile',
  ManageProfile = 'ManageProfile',
  LinkUHID = 'LinkUHID',
  ReadMoreLinkUHID = 'ReadMoreLinkUHID',
  MyMembership = 'MyMembership',
  MembershipDetails = 'MembershipDetails',
  YourOrdersTest = 'YourOrdersTest',
  OrderedTestStatus = 'OrderedTestStatus',
  TestOrderDetails = 'TestOrderDetails',
  RenderPdf = 'RenderPdf',
  Tests = 'Tests',
  CovidScan = 'CovidScan',
  ConsultCheckout = 'ConsultCheckout',
  ConsultPaymentnew = 'ConsultPaymentnew',
  ConsultPaymentStatus = 'ConsultPaymentStatus',
  PaymentStatus = 'PaymentStatus',
  NotificationScreen = 'NotificationScreen',
  MyPaymentsScreen = 'MyPaymentsScreen',
  PaymentStatusScreen = 'PaymentStatusScreen',
  OneApolloMembership = 'OneApolloMembership',
  CommonWebView = 'CommonWebView',
  RefundStatus = 'RefundStatus',
  MedicineCartPrescription = 'MedicineCartPrescription',
  StorePickup = 'StorePickup',
  PickUpCartSummary = 'PickUpCartSummary',
  SymptomTracker = 'SymptomTracker',
  SymptomSelection = 'SymptomSelection',
  Maps = 'Maps',
  SearchAppointmentScreen = 'SearchAppointmentScreen',
  AppointmentFilterScene = 'AppointmentFilterScene',
  PaymentCheckout = 'PaymentCheckout',
  PaymentCheckoutPhysical = 'PaymentCheckoutPhysical',
  SubscriptionCart = 'SubscriptionCart',
  PrescriptionOrderSummary = 'PrescriptionOrderSummary',
  PaymentMethods = 'PaymentMethods',
  OtherBanks = 'OtherBanks',
  OrderStatus = 'OrderStatus',
  TestListing = 'TestListing',
  TestWidgetListing = 'TestWidgetListing',
  ProHealthWebView = 'ProHealthWebView',
  MyOrdersScreen = 'MyOrdersScreen',
  SlotSelection = 'SlotSelection',
  VaccineBookingScreen = 'VaccineBookingScreen',
  VaccineBookingConfirmationScreen = 'VaccineBookingConfirmationScreen',
  BookedVaccineScreen = 'BookedVaccineScreen',
  ActivateCorporateMembership = 'ActivateCorporateMembership',
  VaccineTermsAndConditions = 'VaccineTermsAndConditions',
  TestRatingScreen = 'TestRatingScreen',
  TxnsandPayments = 'TxnsandPayments',
  ManagePayments = 'ManagePayments',
  TestReportViewScreen = 'TestReportViewScreen',
  CowinRegistration = 'CowinRegistration',
  AddPatients = 'AddPatients',
  AddressSlotSelection = 'AddressSlotSelection',
  CartPage = 'CartPage',
  ReviewOrder = 'ReviewOrder',
  VaccinationScreen = 'VaccinationScreen',
  VaccinationDoseScreen = 'VaccinationDoseScreen',
  AddVaccinationRecord = 'AddVaccinationRecord',
  CowinCertificateOTPScreen = 'CowinCertificateOTPScreen',
  CowinCertificateGetOTP = 'CowinCertificateGetOTP',
  CowinProfileSelection = 'CowinProfileSelection',
  PostShareAppointmentSelectorScreen = 'PostShareAppointmentSelectorScreen',
  PrescriptionCamera = 'PrescriptionCamera',
  SubmittedPrescription = 'SubmittedPrescription',
  SpecialOffersScreen = 'SpecialOffersScreen',
  PaymentConfirmation = 'PaymentConfirmation',
  ConsultPaymentScreen = 'ConsultPaymentScreen',
  ConsultPackageList = 'ConsultPackageList',
  ConsultPackageDetail = 'ConsultPackageDetail',
  ConsultPackagePostPurchase = 'ConsultPackagePostPurchase',
  ConsultPackageCancellation = 'ConsultPackageCancellation',
  PackageCheckout = 'PackageCheckout',
  PackagePaymentStatus = 'PackagePaymentStatus',
  ConfirmPackageConsult = 'ConfirmPackageConsult',
  AskApolloQuickBook = 'AskApolloQuickBook',
  SelectLocation = 'SelectLocation',
  ShareReferLink = 'ShareReferLink',
  YourRewardsScreen = 'YourRewardsScreen',
  EarnedPoints = 'EarnedPoints',
  RefererTermsAndCondition = 'RefererTermsAndCondition',
  RefererFAQ = 'RefererFAQ',
  BrandPages = 'BrandPages',
  CouponScreen = 'CouponScreen',
  InformativeContent = 'InformativeContent',
  ServerCart = 'ServerCart',
  ReviewCart = 'ReviewCart',
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
  [AppRoutes.SelectLocation]: {
    screen: SelectLocation,
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
  [AppRoutes.HomeScreen]: {
    screen: HomeScreen,
    path: 'HomeScreen',
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
    screen: NeedHelp,
    path: 'MobileHelpPage',
  },
  [AppRoutes.NeedHelpPharmacyOrder]: {
    screen: NeedHelpPharmacyOrder,
  },
  [AppRoutes.NeedHelpDiagnosticsOrder]: {
    screen: NeedHelpDiagnosticsOrder,
  },
  [AppRoutes.NeedHelpConsultOrder]: {
    screen: NeedHelpConsultOrder,
  },
  [AppRoutes.NeedHelpQueryDetails]: {
    screen: NeedHelpQueryDetails,
  },
  [AppRoutes.NeedHelpContentView]: {
    screen: NeedHelpContentView,
  },
  [AppRoutes.HelpChatScreen]: {
    screen: HelpChatScreen,
  },
  [AppRoutes.Consult]: {
    screen: Consult,
    path: 'ConsultPage',
  },
  [AppRoutes.FilterScene]: {
    screen: FilterScene,
  },
  [AppRoutes.DoctorDetails]: {
    screen: DoctorDetails,
    path: 'DoctorDetailsPage',
  },
  [AppRoutes.DoctorDetailsBookingOnRequest]: {
    screen: DoctorDetailsBookingOnRequest,
    path: 'DoctorDetailsBookingOnRequestPage',
  },
  [AppRoutes.AssociateDoctorDetails]: {
    screen: DoctorDetails,
  },
  [AppRoutes.AppointmentDetails]: {
    screen: AppointmentDetails,
  },
  [AppRoutes.AppointmentDetailsPhysical]: {
    screen: AppointmentDetailsPhysical,
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
  [AppRoutes.ProductDetailPage]: {
    screen: ProductDetailPage,
  },
  [AppRoutes.ApplyCouponScene]: {
    screen: ApplyCouponScene,
  },
  [AppRoutes.ViewCoupons]: {
    screen: ViewCoupons,
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
  [AppRoutes.ReturnMedicineOrder]: {
    screen: ReturnMedicineOrder,
  },
  [AppRoutes.YourOrdersScene]: {
    screen: YourOrdersScene,
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
  [AppRoutes.UploadPrescriptionView]: {
    screen: UploadPrescriptionView,
  },
  [AppRoutes.SamplePrescription]: {
    screen: SamplePrescription,
  },
  [AppRoutes.ChennaiNonCartOrderForm]: {
    screen: ChennaiNonCartOrderForm,
  },
  [AppRoutes.PharmacyPaymentStatus]: {
    screen: PharmacyPaymentStatus,
  },
  [AppRoutes.AddAddress]: {
    screen: AddAddress,
  },
  [AppRoutes.AddAddressNew]: {
    screen: AddAddressNew,
  },
  [AppRoutes.LocationSearch]: {
    screen: LocationSearch,
  },
  [AppRoutes.EditAddress]: {
    screen: EditAddress,
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
  [AppRoutes.HealthRecordDetails]: {
    screen: HealthRecordDetails,
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
  [AppRoutes.OrderedTestStatus]: {
    screen: OrderedTestStatus,
  },
  [AppRoutes.TestOrderDetails]: {
    screen: TestOrderDetails,
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
  [AppRoutes.PaymentStatus]: {
    screen: PaymentStatus,
  },
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
  [AppRoutes.CommonWebView]: {
    screen: CommonWebView,
  },
  [AppRoutes.RefundStatus]: {
    screen: RefundStatus,
  },
  [AppRoutes.MedicineCartPrescription]: {
    screen: MedicineCartPrescription,
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
  [AppRoutes.PaymentCheckoutPhysical]: {
    screen: PaymentCheckoutPhysical,
  },
  [AppRoutes.SubscriptionCart]: {
    screen: SubscriptionCart,
  },
  [AppRoutes.PrescriptionOrderSummary]: {
    screen: PrescriptionOrderSummary,
  },
  [AppRoutes.PaymentMethods]: {
    screen: PaymentMethods,
  },
  [AppRoutes.OtherBanks]: {
    screen: OtherBanks,
  },
  [AppRoutes.OrderStatus]: {
    screen: OrderStatus,
  },
  [AppRoutes.TestListing]: {
    screen: TestListing,
  },
  [AppRoutes.TestWidgetListing]: {
    screen: TestWidgetListing,
  },
  [AppRoutes.ProHealthWebView]: {
    screen: ProHealthWebView,
  },
  [AppRoutes.MyOrdersScreen]: {
    screen: MyOrdersScreen,
  },
  [AppRoutes.VaccineBookingScreen]: {
    screen: VaccineBookingScreen,
  },
  [AppRoutes.VaccineBookingConfirmationScreen]: {
    screen: VaccineBookingConfirmationScreen,
  },
  [AppRoutes.BookedVaccineScreen]: {
    screen: BookedVaccineScreen,
  },
  [AppRoutes.ActivateCorporateMembership]: {
    screen: ActivateCorporateMembership,
  },
  [AppRoutes.VaccineTermsAndConditions]: {
    screen: VaccineTermsAndConditions,
  },
  [AppRoutes.TestRatingScreen]: {
    screen: TestRatingScreen,
  },
  [AppRoutes.TxnsandPayments]: {
    screen: TxnsandPayments,
  },
  [AppRoutes.ManagePayments]: {
    screen: ManagePayments,
  },
  [AppRoutes.SlotSelection]: {
    screen: SlotSelection,
  },
  [AppRoutes.TestReportViewScreen]: {
    screen: TestReportViewScreen,
  },
  [AppRoutes.CowinRegistration]: {
    screen: CowinRegistrationScreen,
  },
  [AppRoutes.AddPatients]: {
    screen: AddPatients,
  },
  [AppRoutes.AddressSlotSelection]: {
    screen: AddressSlotSelection,
  },
  [AppRoutes.CartPage]: {
    screen: CartPage,
  },
  [AppRoutes.ReviewOrder]: {
    screen: ReviewOrder,
  },
  [AppRoutes.VaccinationScreen]: {
    screen: VaccinationScreen,
  },
  [AppRoutes.VaccinationDoseScreen]: {
    screen: VaccinationDoseScreen,
  },
  [AppRoutes.AddVaccinationRecord]: {
    screen: AddVaccinationRecord,
  },
  [AppRoutes.CowinCertificateOTPScreen]: {
    screen: CowinCertificateOTPScreen,
  },
  [AppRoutes.CowinCertificateGetOTP]: {
    screen: CowinCertificateGetOTP,
  },
  [AppRoutes.CowinProfileSelection]: {
    screen: CowinProfileSelection,
  },
  [AppRoutes.PostShareAppointmentSelectorScreen]: {
    screen: PostShareAppointmentSelectorScreen,
  },
  [AppRoutes.PrescriptionCamera]: {
    screen: PrescriptionCamera,
  },
  [AppRoutes.SubmittedPrescription]: {
    screen: SubmittedPrescription,
  },
  [AppRoutes.SpecialOffersScreen]: {
    screen: SpecialOffersScreen,
  },
  [AppRoutes.PaymentConfirmation]: {
    screen: PaymentConfirmation,
  },
  [AppRoutes.ConsultPaymentScreen]: {
    screen: ConsultPaymentScreen,
  },
  [AppRoutes.ConsultPackageList]: {
    screen: ConsultPackageList,
  },
  [AppRoutes.ConsultPackageDetail]: {
    screen: ConsultPackageDetail,
  },
  [AppRoutes.ConsultPackagePostPurchase]: {
    screen: ConsultPackagePostPurchase,
  },
  [AppRoutes.ConsultPackageCancellation]: {
    screen: ConsultPackageCancellation,
  },
  [AppRoutes.PackageCheckout]: {
    screen: PackageCheckout,
  },
  [AppRoutes.PackagePaymentStatus]: {
    screen: PackagePaymentStatus,
  },
  [AppRoutes.ConfirmPackageConsult]: {
    screen: ConfirmPackageConsult,
  },
  [AppRoutes.AskApolloQuickBook]: {
    screen: AskApolloQuickBook,
  },
  [AppRoutes.ShareReferLink]: {
    screen: ShareReferLink,
  },
  [AppRoutes.YourRewardsScreen]: {
    screen: YourRewardsScreen,
  },
  [AppRoutes.EarnedPoints]: {
    screen: EarnedPoints,
  },
  [AppRoutes.RefererTermsAndCondition]: {
    screen: RefererTermsAndCondition,
  },
  [AppRoutes.RefererFAQ]: {
    screen: RefererFAQ,
  },
  [AppRoutes.BrandPages]: {
    screen: BrandPages,
  },
  [AppRoutes.CouponScreen]: {
    screen: CouponScreen,
  },
  [AppRoutes.InformativeContent]: {
    screen: InformativeContent,
  },
  [AppRoutes.ServerCart]: {
    screen: ServerCart,
  },
  [AppRoutes.ReviewCart]: {
    screen: ReviewCart,
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
