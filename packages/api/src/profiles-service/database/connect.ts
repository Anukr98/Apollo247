import '@aph/universal/dist/global';
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
  Deeplink,
  DoctorPatientExternalConnect,
  AdminAuditLogs,
  DoctorProfileHistory,
} from 'doctors-service/entities';
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
  MedicineOrderRefunds,
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
  CouponPharmaRules,
  MedicineOrderShipments,
  MedicineOrderCancelReason,
  PharmacologistConsult,
  MedicineOrderAddress,
  PatientEntitiySubscriber,
} from 'profiles-service/entities';
import 'reflect-metadata';
import { createConnections } from 'typeorm';
import {
  Appointment,
  AppointmentCallDetails,
  AppointmentDocuments,
  AppointmentNoShow,
  AppointmentPayments,
  ConsultQueueItem,
  AppointmentRefunds,
  AppointmentSessions,
  CaseSheet,
  DoctorNextAvaialbleSlots,
  FeedbackDashboardSummary,
  JuniorAppointmentSessions,
  RescheduleAppointmentDetails,
  SdDashboardSummary,
  TransferAppointmentDetails,
  PhrDocumentsSummary,
  JdDashboardSummary,
  AuditHistory,
  CurrentAvailabilityStatus,
  UtilizationCapacity,
  NotificationBin,
  NotificationBinArchive,
  AppointmentUpdateHistory,
  ExotelDetails,
} from 'consults-service/entities';
import { AppointmentEntitySubscriber } from 'consults-service/entities/observers/appointmentObserver';
import { migrationDir } from 'ApiConstants';

export const connect = async () => {
  return await createConnections([
    {
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
        MedicalRecordParameters,
        MedicalRecords,
        MedicineOrderInvoice,
        MedicineOrderLineItems,
        MedicineOrderPayments,
        MedicineOrderShipments,
        MedicineOrders,
        MedicineOrdersStatus,
        MedicineOrderRefunds,
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
        ReferalCouponMapping,
        ReferralCodesMaster,
        RegistrationCodes,
        SearchHistory,
        MedicineOrderCancelReason,
        PharmacologistConsult,
        MedicineOrderAddress,
      ],
      type: 'postgres',
      host: process.env.PROFILES_DB_HOST,
      port: parseInt(process.env.PROFILES_DB_PORT, 10),
      username: process.env.PROFILES_DB_USER,
      password: process.env.PROFILES_DB_PASSWORD,
      database: `profiles_${process.env.DB_NODE_ENV}`,
      subscribers: [PatientEntitiySubscriber],
      logging: process.env.NODE_ENV === 'production' ? false : true,
      synchronize: false,
      migrations: [migrationDir.profiles_db],
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
        DoctorProfileHistory,
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
      synchronize: false,
      migrations: [migrationDir.doctors_db],
    },
    {
      name: 'consults-db',
      entities: [
        Appointment,
        AppointmentCallDetails,
        AppointmentRefunds,
        AppointmentDocuments,
        AppointmentNoShow,
        AppointmentPayments,
        AppointmentSessions,
        AuditHistory,
        CaseSheet,
        CurrentAvailabilityStatus,
        DoctorNextAvaialbleSlots,
        FeedbackDashboardSummary,
        JdDashboardSummary,
        JuniorAppointmentSessions,
        NotificationBin,
        NotificationBinArchive,
        PhrDocumentsSummary,
        RescheduleAppointmentDetails,
        SdDashboardSummary,
        TransferAppointmentDetails,
        UtilizationCapacity,
        AppointmentUpdateHistory,
        ExotelDetails,
        ConsultQueueItem,
      ],
      type: 'postgres',
      host: process.env.CONSULTS_DB_HOST,
      port: parseInt(process.env.CONSULTS_DB_PORT, 10),
      username: process.env.CONSULTS_DB_USER,
      password: process.env.CONSULTS_DB_PASSWORD,
      database: `consults_${process.env.DB_NODE_ENV}`,
      subscribers: [AppointmentEntitySubscriber],
      logging: process.env.NODE_ENV === 'production' ? false : true,
      extra: {
        connectionLimit: process.env.CONNECTION_POOL_LIMIT,
      },
      synchronize: false,
      migrations: [migrationDir.consults_db],
    },
  ]).catch((error) => {
    throw new Error(error);
  });
};
