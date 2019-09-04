import { webDoctorsBaseUrl } from '@aph/universal/dist/aphRoutes';

export const clientRoutes = {
  welcome: () => '/',
  patients: () => '/patients',
  DoctorsProfile: () => '/profile',
  MyAccount: () => '/myaccount',
  PatientLog: () => '/patientlog',
  PatientLogDetailsPage: (appointmentId: string) => `/patientlogdetailspage/${appointmentId}`,
  testsAndMedicine: () => '#',
  healthRecords: () => '#',
  calendar: () => '/calendar',
  ConsultTabs: (appointmentId: string, patientId: string) =>
    `/Consulttabs/${appointmentId}/${patientId}`,
};

export const clientBaseUrl = () => webDoctorsBaseUrl();
