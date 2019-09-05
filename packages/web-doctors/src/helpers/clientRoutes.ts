import { webDoctorsBaseUrl } from '@aph/universal/dist/aphRoutes';

export const clientRoutes = {
  welcome: () => '/',
  patients: () => '/patients',
  DoctorsProfile: () => '/profile',
  MyAccount: () => '/myaccount',
  PatientLog: () => '/patientlog',
  PatientLogDetailsPage: (appointmentId: string, consultscount: string) =>
    `/patientlogdetailspage/${appointmentId}/${consultscount}`,
  testsAndMedicine: () => '#',
  healthRecords: () => '#',
  calendar: () => '/calendar',
  ConsultTabs: (appointmentId: string, patientId: string) =>
    `/Consulttabs/${appointmentId}/${patientId}`,
};

export const clientBaseUrl = () => webDoctorsBaseUrl();
