import '@aph/universal/dist/global';
import {
  Appointment,
  AppointmentPayments,
  AppointmentSessions,
  CaseSheet,
  TransferAppointmentDetails,
  RescheduleAppointmentDetails,
  AppointmentDocuments,
  JuniorAppointmentSessions,
  AppointmentCallDetails,
  DoctorNextAvaialbleSlots,
} from 'consults-service/entities';
import {
  ConsultHours,
  Doctor,
  DoctorAndHospital,
  DoctorBankAccounts,
  DoctorSpecialty,
  Facility,
  Packages,
  StarTeam,
  DoctorDeviceTokens,
  BlockedCalendarItem,
  AdminUsers,
  Secretary,
  DoctorSecretary,
} from 'doctors-service/entities';
import 'reflect-metadata';
import { createConnections } from 'typeorm';
import {
  Patient,
  SearchHistory,
  PatientAddress,
  PatientFamilyHistory,
  PatientLifeStyle,
  PatientHealthVault,
  MedicineOrders,
  MedicineOrderLineItems,
  MedicineOrderPayments,
  MedicineOrdersStatus,
  PatientDeviceTokens,
  PatientNotificationSettings,
  MedicalRecords,
  MedicalRecordParameters,
  MedicineOrderInvoice,
  PatientMedicalHistory,
} from 'profiles-service/entities';

export const connect = async () => {
  return await createConnections([
    {
      entities: [
        Appointment,
        AppointmentPayments,
        AppointmentSessions,
        CaseSheet,
        TransferAppointmentDetails,
        RescheduleAppointmentDetails,
        JuniorAppointmentSessions,
        AppointmentDocuments,
        AppointmentCallDetails,
        DoctorNextAvaialbleSlots,
      ],
      type: 'postgres',
      host: process.env.CONSULTS_DB_HOST,
      port: parseInt(process.env.CONSULTS_DB_PORT, 10),
      username: process.env.CONSULTS_DB_USER,
      password: process.env.CONSULTS_DB_PASSWORD,
      database: `consults_${process.env.NODE_ENV}`,
      logging: process.env.NODE_ENV === 'production' ? false : true,
    },
    {
      name: 'doctors-db',
      entities: [
        Doctor,
        DoctorSpecialty,
        StarTeam,
        DoctorAndHospital,
        Facility,
        ConsultHours,
        DoctorBankAccounts,
        Packages,
        DoctorDeviceTokens,
        BlockedCalendarItem,
        AdminUsers,
        Secretary,
        DoctorSecretary,
      ],
      type: 'postgres',
      host: process.env.DOCTORS_DB_HOST,
      port: parseInt(process.env.DOCTORS_DB_PORT, 10),
      username: process.env.DOCTORS_DB_USER,
      password: process.env.DOCTORS_DB_PASSWORD,
      database: `doctors_${process.env.NODE_ENV}`,
      logging: process.env.NODE_ENV === 'production' ? false : true,
    },
    {
      name: 'patients-db',
      entities: [
        Patient,
        SearchHistory,
        PatientAddress,
        PatientFamilyHistory,
        PatientLifeStyle,
        PatientHealthVault,
        MedicineOrders,
        MedicineOrderLineItems,
        MedicineOrderPayments,
        MedicineOrdersStatus,
        PatientDeviceTokens,
        PatientNotificationSettings,
        MedicalRecords,
        MedicalRecordParameters,
        MedicineOrderInvoice,
        PatientMedicalHistory,
      ],
      type: 'postgres',
      host: process.env.PROFILES_DB_HOST,
      port: parseInt(process.env.PROFILES_DB_PORT, 10),
      username: process.env.PROFILES_DB_USER,
      password: process.env.PROFILES_DB_PASSWORD,
      database: `profiles_${process.env.NODE_ENV}`,
      logging: process.env.NODE_ENV === 'production' ? false : true,
    },
  ]).catch((error) => {
    throw new Error(error);
  });
};
