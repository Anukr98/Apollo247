import { webDoctorsBaseUrl } from '@aph/universal/dist/aphRoutes';

export const clientRoutes = {
  welcome: () => '/',
  patients: () => '/patients',
  DoctorsProfile: () => '/profile',
  MyAccount: () => '/myaccount',
  //ConsultTabs: () => '/consultTabs',
  testsAndMedicine: () => '#',
  healthRecords: () => '#',
  calendar: () => '/calendar',
  ConsultTabs: (appointmentId: string) => `/ConsultTabs/${appointmentId}`,
};

export const clientBaseUrl = () => webDoctorsBaseUrl();
