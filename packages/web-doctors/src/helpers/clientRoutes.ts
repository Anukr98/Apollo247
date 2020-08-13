import { webDoctorsBaseUrl } from '@aph/universal/dist/aphRoutes';

export interface JDConsultRoomParams {
  appointmentId: string;
  patientId: string;
  queueId: string;
  isActive: string;
}

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
  juniorDoctorActive: () => '/junior-doctor/active',
  juniorDoctorPast: () => '/junior-doctor/past',
  patientDetails: () => '/patient-details',
  juniorDoctorProfile: () => '/jd-profile',
  ConsultTabs: (appointmentId: string, patientId: string, tabValue: string) =>
    `/Consulttabs/${appointmentId}/${patientId}/${tabValue}`,
  JDConsultRoom: ({ appointmentId, patientId, queueId, isActive }: JDConsultRoomParams) =>
    `/jd-consultroom/${appointmentId}/${patientId}/${queueId}/${isActive}`,
  juniorDoctorAdmin: () => '/jd-admin',
  secretaryDashboard: () => '/secretary',
};

export const clientBaseUrl = () => webDoctorsBaseUrl();
