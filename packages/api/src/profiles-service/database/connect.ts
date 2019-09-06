import '@aph/universal/dist/global';
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
} from 'doctors-service/entities';
import {
  Patient,
  PatientAddress,
  PatientFamilyHistory,
  PatientHealthVault,
  PatientLifeStyle,
  SearchHistory,
  MedicineOrders,
  MedicineOrderLineItems,
  MedicineOrderPayments,
  Coupon,
  PatientDeviceTokens,
  PatientNotificationSettings,
  MedicineOrdersStatus,
  MedicalRecords,
  MedicalRecordParameters,
} from 'profiles-service/entities';
import 'reflect-metadata';
import { createConnections } from 'typeorm';

export const connect = async () => {
  return await createConnections([
    {
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
        Coupon,
        MedicineOrdersStatus,
        PatientDeviceTokens,
        PatientNotificationSettings,
        MedicalRecords,
        MedicalRecordParameters,
      ],
      type: 'postgres',
      host: process.env.PROFILES_DB_HOST,
      port: parseInt(process.env.PROFILES_DB_PORT, 10),
      username: process.env.PROFILES_DB_USER,
      password: process.env.PROFILES_DB_PASSWORD,
      database: `profiles_${process.env.NODE_ENV}`,
      logging: true,
      synchronize: true,
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
      ],
      type: 'postgres',
      host: process.env.DOCTORS_DB_HOST,
      port: parseInt(process.env.DOCTORS_DB_PORT, 10),
      username: process.env.DOCTORS_DB_USER,
      password: process.env.DOCTORS_DB_PASSWORD,
      database: `doctors_${process.env.NODE_ENV}`,
      logging: true,
    },
  ]).catch((error) => {
    throw new Error(error);
  });
};
