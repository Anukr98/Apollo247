import { webDoctorsBaseUrl } from '@aph/universal/aphRoutes';

export const clientRoutes = {
  welcome: () => '/',
  patients: () => '/patients',
  DoctorsProfile: () => '/profile',
  ConsultTabs: () => '/consultTabs',
  consultRoom: () => '/consultRoom',
  testsAndMedicine: () => '#',
  healthRecords: () => '#',
  calendar: () => '/calendar',
  consult: () => '/consult',
};

export const clientBaseUrl = () => webDoctorsBaseUrl();
