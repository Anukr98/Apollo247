import { webPatientsBaseUrl } from '@aph/universal/dist/aphRoutes';

export const clientRoutes = {
  patients: () => '/patients',
  cartPoc: () => '/cart-poc',
  storagePoc: () => '/storage-poc',

  welcome: () => '/',
  doctorDetails: (doctorId: string) => `/doctor-details/${doctorId}`,
  doctorsLanding: () => '/doctors',
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
  testsCart: () => '/tests-cart',
  chatRoom: (appointmentId: string, doctorId: string) => `/chat-room/${appointmentId}/${doctorId}`,
  myAccount: () => '/my-account',
  notificationSettings: () => '/settings',
  addRecords: () => '/add-records',
  yourOrders: () => '/orders',
  medicineAllBrands: () => '/view-all-brands',
  medicineSearchByBrand: (id: string) => `/search-by-brand/${id}`,
  searchByMedicine: (searchMedicineType: string, searchText: string) =>
    `/${searchMedicineType}/${searchText}`,
  medicineDetails: (sku: string) => `/medicine-details/${sku}`,
  addressBook: () => '/address-book',
};

export const clientBaseUrl = () => webPatientsBaseUrl();
