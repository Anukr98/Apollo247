import { webPatientsBaseUrl } from '@aph/universal/aphRoutes';

export const clientRoutes = {
  welcome: () => '/',
  doctorDetails: (doctorId: string) => `/doctor-details/${doctorId}`,
  doctorsLanding: () => '/doctors',
  consultRoom: () => '#',
  testsAndMedicine: () => '#',
  healthRecords: () => '#',
  patients: () => '/patients',
  searchMedicines: () => '/search-medicines',
  cartLanding: () => '/cart',
  cartPoc: () => '/cart-poc',
};

export const clientBaseUrl = () => webPatientsBaseUrl();
