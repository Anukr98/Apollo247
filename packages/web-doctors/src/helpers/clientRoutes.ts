import { webDoctorsBaseUrl } from '@aph/universal/dist/aphRoutes';

export const clientRoutes = {
  welcome: () => '/',
  patients: () => '/patients',
  DoctorsProfile: () => '/profile',
  consultRoom: () => '#',
  testsAndMedicine: () => '#',
  healthRecords: () => '#',
  calendar: () => '/calendar',
  consult: () => '/consult',
};

export const clientBaseUrl = () => webDoctorsBaseUrl();
