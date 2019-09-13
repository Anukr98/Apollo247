import { webDoctorsBaseUrl } from '@aph/universal/dist/aphRoutes';

export interface JDConsultRoomParams {
  appointmentId: string;
  patientId: string;
  queueId: string;
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
  juniorDoctor: () => '/junior-doctor',
  patientDetails: () => '/patient-details',
  juniorDoctorProfile: () => '/juniordoctor-profile',
  ConsultTabs: (appointmentId: string, patientId: string) =>
    `/Consulttabs/${appointmentId}/${patientId}`,
  JDConsultRoom: ({ appointmentId, patientId, queueId }: JDConsultRoomParams) =>
    `/jd-consultroom/${appointmentId}/${patientId}/${queueId}`,
};

export const clientBaseUrl = () => webDoctorsBaseUrl();
