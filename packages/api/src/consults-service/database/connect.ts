import '@aph/universal/dist/global';
import {
  Appointment,
  AppointmentCallDetails,
  AppointmentDocuments,
  AppointmentNoShow,
  AppointmentPayments,
  AppointmentSessions,
  CaseSheet,
  ConsultQueueItem,
  DoctorNextAvaialbleSlots,
  FeedbackDashboardSummary,
  JuniorAppointmentSessions,
  RescheduleAppointmentDetails,
  SdDashboardSummary,
  DoctorFeeSummary,
  PlannedDoctors,
  TransferAppointmentDetails,
  PhrDocumentsSummary,
  JdDashboardSummary,
  AuditHistory,
  CurrentAvailabilityStatus,
  UtilizationCapacity,
} from 'consults-service/entities';
import {
  AdminDoctorMapper,
  AdminUsers,
  BlockedCalendarItem,
  ConsultHours,
  Doctor,
  DoctorAndHospital,
  DoctorBankAccounts,
  DoctorDeviceTokens,
  DoctorLoginSessionHistory,
  DoctorSecretary,
  DoctorSpecialty,
  DoctorsFavouriteAdvice,
  DoctorsFavouriteMedicine,
  DoctorsFavouriteTests,
  Facility,
  Packages,
  Secretary,
  StarTeam,
  Auditor,
  AdminAuditorMapper,
  CityPincodeMapper,
} from 'doctors-service/entities';
import 'reflect-metadata';
import { createConnections } from 'typeorm';
import {
  Coupon,
  CouponConsultRules,
  CouponGenericRules,
  DiagnosticHotSellers,
  DiagnosticOrderLineItems,
  DiagnosticOrderPayments,
  DiagnosticOrders,
  DiagnosticOrdersStatus,
  DiagnosticOrgans,
  DiagnosticPincodeHubs,
  Diagnostics,
  LoginOtp,
  LoginOtpArchive,
  ReferralCodesMaster,
  ReferalCouponMapping,
  MedicalRecordParameters,
  MedicalRecords,
  MedicineOrderInvoice,
  MedicineOrderLineItems,
  MedicineOrderPayments,
  MedicineOrders,
  MedicineOrdersStatus,
  Patient,
  PatientAddress,
  PatientDeviceTokens,
  PatientFamilyHistory,
  PatientFeedback,
  PatientHealthVault,
  PatientHelpTickets,
  PatientLifeStyle,
  PatientMedicalHistory,
  PatientNotificationSettings,
  SearchHistory,
  RegistrationCodes,
} from 'profiles-service/entities';

export const connect = async () => {
  return await createConnections([
    {
      entities: [
        Appointment,
        AppointmentCallDetails,
        AppointmentDocuments,
        AppointmentNoShow,
        AppointmentPayments,
        AppointmentSessions,
        CaseSheet,
        ConsultQueueItem,
        DoctorNextAvaialbleSlots,
        FeedbackDashboardSummary,
        JuniorAppointmentSessions,
        RescheduleAppointmentDetails,
        SdDashboardSummary,
        DoctorFeeSummary,
        PlannedDoctors,
        TransferAppointmentDetails,
        PhrDocumentsSummary,
        JdDashboardSummary,
        AuditHistory,
        CurrentAvailabilityStatus,
        UtilizationCapacity,
      ],
      type: 'postgres',
      host: process.env.CONSULTS_DB_HOST,
      port: parseInt(process.env.CONSULTS_DB_PORT, 10),
      username: process.env.CONSULTS_DB_USER,
      password: process.env.CONSULTS_DB_PASSWORD,
      database: `consults_${process.env.NODE_ENV}`,
      logging: process.env.NODE_ENV === 'production' ? false : true,
      synchronize: true,
    },
    {
      name: 'doctors-db',
      entities: [
        AdminDoctorMapper,
        AdminUsers,
        BlockedCalendarItem,
        ConsultHours,
        Doctor,
        DoctorAndHospital,
        DoctorBankAccounts,
        DoctorDeviceTokens,
        DoctorLoginSessionHistory,
        DoctorSecretary,
        DoctorSpecialty,
        DoctorsFavouriteAdvice,
        DoctorsFavouriteMedicine,
        DoctorsFavouriteTests,
        Facility,
        Packages,
        Secretary,
        StarTeam,
        Auditor,
        AdminAuditorMapper,
        CityPincodeMapper,
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
        Coupon,
        CouponConsultRules,
        CouponGenericRules,
        DiagnosticHotSellers,
        DiagnosticOrderLineItems,
        DiagnosticOrderPayments,
        DiagnosticOrders,
        DiagnosticOrdersStatus,
        DiagnosticOrgans,
        DiagnosticPincodeHubs,
        Diagnostics,
        LoginOtp,
        LoginOtpArchive,
        ReferralCodesMaster,
        ReferalCouponMapping,
        MedicalRecordParameters,
        MedicalRecords,
        MedicineOrderInvoice,
        MedicineOrderLineItems,
        MedicineOrderPayments,
        MedicineOrders,
        MedicineOrdersStatus,
        Patient,
        PatientAddress,
        PatientDeviceTokens,
        PatientFamilyHistory,
        PatientFeedback,
        PatientHealthVault,
        PatientHelpTickets,
        PatientLifeStyle,
        PatientMedicalHistory,
        PatientNotificationSettings,
        SearchHistory,
        RegistrationCodes,
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
