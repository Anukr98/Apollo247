import { webPatientsBaseUrl } from '@aph/universal/dist/aphRoutes';

export const clientRoutes = {
  patients: () => '/patients',
  cartPoc: () => '/cart-poc',
  storagePoc: () => '/storage-poc',

  welcome: () => '/',
  doctorDetails: (doctorId: string) => `/doctor-details/${doctorId}`,
  doctorsLanding: () => '/doctors',
  appointments: () => '/appointments',
  testsAndMedicine: () => '/tests-medicines',
  medicines: () => `/medicines`,
  mediciness: () => `/medicines/added-to-cart`,
  healthRecords: () => '/health-records',
  prescriptionsLanding: () => '/prescriptions',
  cartLanding: () => '/cart',
  medicinesCart: () => '/medicines-cart',
  testsCart: () => '/tests-cart',
  chatRoom: (appointmentId: string, doctorId: string) => `/chat-room/${appointmentId}/${doctorId}`,
  myAccount: () => '/profile',
  notificationSettings: () => '/settings',
  addRecords: () => '/add-records',
  yourOrders: () => '/orders',
  medicineAllBrands: () => '/view-all-brands',
  medicineSearchByBrand: (id: string) => `/search-by-brand/${id}`,
  searchByMedicine: (searchText: string) => `/search-medicine/${searchText}`,
  medicineDetails: (sku: string) => `/medicine-details/${sku}`,
};

export const clientBaseUrl = () => webPatientsBaseUrl();
