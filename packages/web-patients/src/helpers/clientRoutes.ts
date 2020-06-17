import { webPatientsBaseUrl } from '@aph/universal/dist/aphRoutes';

export const clientRoutes = {
  patients: () => '/patients',
  cartPoc: () => '/cart-poc',
  storagePoc: () => '/storage-poc',

  welcome: () => '/',
  doctorDetails: (doctorName: string, doctorId: string) => `/doctors/${doctorName}-${doctorId}`,
  specialtyDoctorDetails: (specialty: string, doctorName: string, doctorId: string) =>
    `/specialties/${specialty}/${doctorName}-${doctorId}`,
  doctorsLanding: () => '/doctors',
  // specialties: (specialty: string) => `/specialties/${specialty}`,
  specialties: (specialty: string) => `/specialties/${specialty}`,
  appointments: () => '/appointments',
  appointmentSuccess: () => `/appointments/${status}`,
  testsAndMedicine: () => '/tests-medicines',
  medicines: () => `/medicines`,
  medicinesLandingViewCart: () => `/medicines/added-to-cart`,
  medicinesCartInfo: (orderAutoId: string, orderStatus: string) =>
    `/medicines/${orderAutoId}/${orderStatus}`,
  healthRecords: () => '/health-records',
  prescriptionsLanding: () => '/prescriptions',
  cartLanding: () => '/cart',
  medicinesCart: () => '/medicines-cart',
  medicinesCartFailed: (orderAutoId: string, orderStatus: string) =>
    `/medicines-cart/${orderAutoId}/${orderStatus}`,
  testsCart: () => '/tests-cart',
  chatRoom: (appointmentId: string, doctorId: string) => `/chat-room/${appointmentId}/${doctorId}`,
  myAccount: () => '/my-account',
  notificationSettings: () => '/settings',
  addRecords: () => '/add-records',
  yourOrders: () => '/orders',
  medicineAllBrands: () => '/view-all-brands',
  medicineSearchByBrand: (id: string) => `/search-by-brand/${id}`,
  searchByMedicine: (searchMedicineType: string, searchText: string) =>
    `/medicine/${searchMedicineType}/${searchText}`,
  medicineDetails: (sku: string) => `/medicine/${sku}`,
  medicineCategoryDetails: (searchMedicineType: string, searchText: string, sku: string) =>
    `/medicine/${searchMedicineType}/${searchText}/${sku}`,
  addressBook: () => '/address-book',
  symptomsTrackerFor: () => '/track-symptoms-for',
  symptomsTracker: () => '/track-symptoms',
  tests: () => '/tests',
  testDetails: (searchTestType: string, itemName: string, itemId: string) =>
    `/test-details/${searchTestType}/${itemName}/${itemId}`,
  searchByTest: (searchType: string, searchTestText: string) =>
    `/tests-list/${searchType}/${searchTestText}`,
  testOrders: () => '/order-details',
  orderSummary: (id: string) => `/orders/order-summary/${id}`,
  termsConditions: () => '/terms',
  privacy: () => '/privacy',
  FAQ: () => '/faq',
  partnerSBI: () => '/partners/sbi',
  contactUs: () => '/contact',
  covidLanding: () => '/covid19',
  covidDetails: () => '/covid19/*',
  aboutUs: () => '/aboutUs',
  needHelp: () => '/needHelp',
  myPayments: () => '/my-payments',
  payMedicine: (payType: string) => `/pay/${payType}`,
  payOnlineConsult: () => '/pay-online-consult',
  payOnlineClinicConsult: () => '/pay-clinic-visit',
  prescriptionReview: () => '/prescription-review',
  specialityListing: () => '/specialities',
  medicinePrescription: () => '/medicine-prescription',
};

export const clientBaseUrl = () => webPatientsBaseUrl();
