import { webPatientsBaseUrl } from '@aph/universal/dist/aphRoutes';

export const clientRoutes = {
  welcome: () => '/',
  doctorDetails: (doctorId: string) => `/doctor-details/${doctorId}`,
  doctorsLanding: () => '/doctors',
  consultRoom: () => '/consult-room',
  testsAndMedicine: () => '/tests-medicines',
  healthRecords: () => '/health-records',
  patients: () => '/patients',
  prescriptionsLanding: () => '/prescriptions',
  cartLanding: () => '/cart',
  cartPoc: () => '/cart-poc',
  chatRoom: (appointmentId: string, doctorId: string) => `/chat-room/${appointmentId}/${doctorId}`,
  myAccount: () => '/profile',
  notificationSettings: () => '/settings',
  addRecords: () => '/add-records',
  yourOrders: () => '/orders',
  trackOrders: () => '/track-orders',
};

export const clientBaseUrl = () => webPatientsBaseUrl();
