import { webPatientsBaseUrl } from '@aph/universal/dist/aphRoutes';

export const clientRoutes = {
  welcome: () => '/',
  doctorDetails: (doctorId: string) => `/doctor-details/${doctorId}`,
  doctorsLanding: () => '/doctors',
  consultRoom: () => '/consult-room',
  testsAndMedicine: () => '/tests-medicines',
  healthRecords: () => '#',
  patients: () => '/patients',
  prescriptionsLanding: () => '/prescriptions',
  cartLanding: () => '/cart',
  cartPoc: () => '/cart-poc',
  chatRoom: (appointmentId: string, doctorId: string) => `/chat-room/${appointmentId}/${doctorId}`,
  myAccount: () => '/profile',
};

export const clientBaseUrl = () => webPatientsBaseUrl();
