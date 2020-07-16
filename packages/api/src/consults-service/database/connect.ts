import '@aph/universal/dist/global';
import {
  Appointment,
  AppointmentCallDetails,
  AppointmentDocuments,
  AppointmentNoShow,
  AppointmentRefunds,
  AppointmentPayments,
  AppointmentSessions,
  CaseSheet,
  ConsultQueueItem,
  DoctorNextAvaialbleSlots,
  ExotelDetails,
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
  NotificationBin,
  NotificationBinArchive,
  AppointmentUpdateHistory,
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
  DoctorPatientExternalConnect,
  Deeplink,
  AdminAuditLogs,
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
  MedicineOrderShipments,
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
  CouponPharmaRules,
  MedicineOrderCancelReason,
  PharmacologistConsult,
} from 'profiles-service/entities';

export const connect = async () => {
  return await createConnections([
    {
      entities: [
        Appointment,
        AppointmentCallDetails,
        AppointmentDocuments,
        AppointmentRefunds,
        AppointmentNoShow,
        AppointmentPayments,
        AppointmentSessions,
        AuditHistory,
        CaseSheet,
        ConsultQueueItem,
        CurrentAvailabilityStatus,
        DoctorFeeSummary,
        DoctorNextAvaialbleSlots,
        ExotelDetails,
        FeedbackDashboardSummary,
        JdDashboardSummary,
        JuniorAppointmentSessions,
        NotificationBin,
        NotificationBinArchive,
        PhrDocumentsSummary,
        PlannedDoctors,
        RescheduleAppointmentDetails,
        SdDashboardSummary,
        TransferAppointmentDetails,
        UtilizationCapacity,
        AppointmentUpdateHistory,
      ],
      type: 'postgres',
      host: process.env.CONSULTS_DB_HOST,
      port: parseInt(process.env.CONSULTS_DB_PORT, 10),
      username: process.env.CONSULTS_DB_USER,
      password: process.env.CONSULTS_DB_PASSWORD,
      database: `consults_${process.env.DB_NODE_ENV}`,
      logging: process.env.NODE_ENV === 'production' ? false : true,
      synchronize: true,
      extra: {
        connectionLimit: process.env.CONNECTION_POOL_LIMIT,
      },
    },
    {
      name: 'doctors-db',
      entities: [
        AdminDoctorMapper,
        AdminUsers,
        BlockedCalendarItem,
        ConsultHours,
        Deeplink,
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
        DoctorPatientExternalConnect,
        AdminAuditLogs,
      ],
      type: 'postgres',
      host: process.env.DOCTORS_DB_HOST,
      port: parseInt(process.env.DOCTORS_DB_PORT, 10),
      username: process.env.DOCTORS_DB_USER,
      password: process.env.DOCTORS_DB_PASSWORD,
      database: `doctors_${process.env.DB_NODE_ENV}`,
      logging: process.env.NODE_ENV === 'production' ? false : true,
      extra: {
        connectionLimit: process.env.CONNECTION_POOL_LIMIT,
      },
    },
    {
      name: 'patients-db',
      entities: [
        Coupon,
        CouponConsultRules,
        CouponGenericRules,
        CouponPharmaRules,
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
        MedicineOrderShipments,
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
        MedicineOrderCancelReason,
        PharmacologistConsult,
      ],
      type: 'postgres',
      host: process.env.PROFILES_DB_HOST,
      port: parseInt(process.env.PROFILES_DB_PORT, 10),
      username: process.env.PROFILES_DB_USER,
      password: process.env.PROFILES_DB_PASSWORD,
      database: `profiles_${process.env.DB_NODE_ENV}`,
      logging: process.env.NODE_ENV === 'production' ? false : true,
      extra: {
        connectionLimit: process.env.CONNECTION_POOL_LIMIT,
      },
    },
  ]).catch((error) => {
    throw new Error(error);
  });
};
