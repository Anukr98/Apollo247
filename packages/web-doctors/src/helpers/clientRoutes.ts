import { webDoctorsBaseUrl } from '@aph/universal/aphRoutes';

export const clientRoutes = {
  welcome: () => '/',
  patients: () => '/patients',
  DoctorsProfile: () => '/profile',
  consultRoom: () => '/consultRoom',
  testsAndMedicine: () => '#',
  healthRecords: () => '#',
  calendar: () => '/calendar',
};

export const clientBaseUrl = () => webDoctorsBaseUrl();
