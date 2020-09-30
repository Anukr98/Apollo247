import '@aph/universal/dist/global';
import {
  Appointment,
  AppointmentCallDetails,
  AppointmentDocuments,
  AppointmentRefunds,
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
  TransferAppointmentDetails,
  PhrDocumentsSummary,
  JdDashboardSummary,
  AuditHistory,
  NotificationBin,
  NotificationBinArchive,
  AppointmentUpdateHistory,
  ExotelDetails
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
  Deeplink,
  DoctorPatientExternalConnect,
  AdminAuditLogs,
  DoctorProfileHistory,
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
  MedicalRecordParameters,
  MedicalRecords,
  MedicineOrderInvoice,
  MedicineOrderLineItems,
  MedicineOrderPayments,
  MedicineOrderRefunds,
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
  ReferralCodesMaster,
  ReferalCouponMapping,
  CouponPharmaRules,
  MedicineOrderCancelReason,
  PharmacologistConsult,
  MedicineOrderAddress,
  PatientEntitiySubscriber,
} from 'profiles-service/entities';
import { AppointmentEntitySubscriber } from 'consults-service/entities/observers/appointmentObserver';
import { AppointmentCallFeedback } from 'consults-service/entities/appointmentCallFeedbackEntity'
import { MedicineEntitySubscriber } from 'profiles-service/entities/observers/medicinePaymentSuccessObserver';
import { DiagnosticEntitySubscriber } from 'profiles-service/entities/observers/diagnosticPaymentSuccessObserver';

export const connect = async () => {
  return await createConnections([
    {
      entities: [
        Appointment,
        AppointmentCallDetails,
        AppointmentDocuments,
        AppointmentNoShow,
        AppointmentRefunds,
        AppointmentPayments,
        AppointmentSessions,
        AuditHistory,
        ConsultQueueItem,
        CaseSheet,
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
        AppointmentUpdateHistory,
        ExotelDetails,
        AppointmentCallFeedback
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
        MedicalRecordParameters,
        MedicalRecords,
        MedicineOrderInvoice,
        MedicineOrderLineItems,
        MedicineOrderPayments,
        MedicineOrderRefunds,
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
        ReferralCodesMaster,
        ReferalCouponMapping,
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
      subscribers: [PatientEntitiySubscriber, MedicineEntitySubscriber, DiagnosticEntitySubscriber],
      logging: process.env.NODE_ENV === 'production' ? false : true,
      extra: {
        connectionLimit: process.env.CONNECTION_POOL_LIMIT,
      },
    },
  ]).catch((error) => {
    throw new Error(error);
  });
};
