import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  Appointment,
  APPOINTMENT_STATE,
  TRANSFER_STATUS,
  TRANSFER_INITIATED_TYPE,
  STATUS,
  REQUEST_ROLES,
  ES_DOCTOR_SLOT_STATUS,
  RescheduleAppointmentDetails,
  AppointmentUpdateHistory,
  VALUE_TYPE,
  APPOINTMENT_UPDATED_BY,
} from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import _ from 'lodash';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { format, addDays } from 'date-fns';
import { sendMail } from 'notifications-service/resolvers/email';
import { EmailMessage } from 'types/notificationMessageTypes';
import { ApiConstants } from 'ApiConstants';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { RescheduleAppointmentRepository } from 'consults-service/repositories/rescheduleAppointmentRepository';
import {
  sendReminderNotification,
  NotificationType,
  sendNotification,
  sendDoctorRescheduleAppointmentNotification,
} from 'notifications-service/resolvers/notifications';
import { addMilliseconds, differenceInDays } from 'date-fns';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';
import { AdminDoctorMap } from 'doctors-service/repositories/adminDoctorRepository';
import { rescheduleAppointmentEmailTemplate } from 'helpers/emailTemplates/rescheduleAppointmentEmailTemplate';
import { initiateRefund } from 'consults-service/helpers/refundHelper';
import { PaytmResponse } from 'types/refundHelperTypes';
import { log } from 'customWinstonLogger';

export const rescheduleAppointmentTypeDefs = gql`
  type NotificationMessage {
    messageId: String
  }

  type NotificationSuccessMessage {
    results: [NotificationMessage]
    canonicalRegistrationTokenCount: Int
    failureCount: Int
    successCount: Int
    multicastId: Int
  }

  type RescheduleAppointment {
    id: ID!
    appointmentId: ID!
    rescheduleStatus: TRANSFER_STATUS!
    rescheduleReason: String!
    rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE!
    rescheduleInitiatedId: String!
    rescheduledDateTime: DateTime
  }

  input RescheduleAppointmentInput {
    appointmentId: ID!
    rescheduleReason: String!
    rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE!
    rescheduleInitiatedId: String!
    rescheduledDateTime: DateTime
    autoSelectSlot: Int
  }

  input BookRescheduleAppointmentInput {
    appointmentId: ID!
    doctorId: ID!
    newDateTimeslot: DateTime!
    initiatedBy: TRANSFER_INITIATED_TYPE!
    initiatedId: ID!
    patientId: ID!
    rescheduledId: ID
  }

  type RescheduleAppointmentResult {
    rescheduleAppointment: RescheduleAppointment
    rescheduleCount: Int
    doctorRescheduleCount: Int
  }

  type BookRescheduleAppointmentResult {
    appointmentDetails: Appointment
  }

  type CheckRescheduleResult {
    isPaid: Int!
    isCancel: Int!
    rescheduleCount: Int!
    doctorRescheduleCount: Int!
    appointmentState: APPOINTMENT_STATE!
    isFollowUp: Int!
  }

  type RescheduleAppointmentDetails {
    id: String!
    rescheduledDateTime: DateTime!
    rescheduleReason: String!
    rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE
    rescheduleInitiatedId: String!
    rescheduleStatus: TRANSFER_STATUS!
  }

  extend type Mutation {
    initiateRescheduleAppointment(
      RescheduleAppointmentInput: RescheduleAppointmentInput
    ): RescheduleAppointmentResult!
    bookRescheduleAppointment(
      bookRescheduleAppointmentInput: BookRescheduleAppointmentInput
    ): BookRescheduleAppointmentResult!
  }

  extend type Query {
    checkIfReschedule(
      existAppointmentId: String!
      rescheduleDate: DateTime!
    ): CheckRescheduleResult!
    getAppointmentRescheduleDetails(appointmentId: String!): RescheduleAppointmentDetails!
  }
`;

type RescheduleAppointmentResult = {
  rescheduleAppointment: RescheduleAppointment;
  rescheduleCount: number;
  doctorRescheduleCount: number;
};

type RescheduleAppointment = {
  id: string;
  appointment: Appointment;
  rescheduleStatus: TRANSFER_STATUS;
  rescheduleReason: string;
  rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE;
  rescheduleInitiatedId: string;
  rescheduledDateTime: Date;
};

type RescheduleAppointmentInput = {
  appointmentId: string;
  rescheduleReason: string;
  rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE;
  rescheduleInitiatedId: string;
  autoSelectSlot: number;
  rescheduledDateTime: Date;
};

type BookRescheduleAppointmentInput = {
  appointmentId: string;
  doctorId: string;
  newDateTimeslot: Date;
  initiatedBy: TRANSFER_INITIATED_TYPE;
  initiatedId: string;
  patientId: string;
  rescheduledId: string;
};

type BookRescheduleAppointmentResult = {
  appointmentDetails: Appointment;
};

type CheckRescheduleResult = {
  isPaid: number;
  isCancel: number;
  rescheduleCount: number;
  appointmentState: APPOINTMENT_STATE;
  isFollowUp: Boolean;
};

type RescheduleAppointmentInputArgs = { RescheduleAppointmentInput: RescheduleAppointmentInput };
type BookRescheduleAppointmentInputArgs = {
  bookRescheduleAppointmentInput: BookRescheduleAppointmentInput;
};

const getAppointmentRescheduleDetails: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  RescheduleAppointmentDetails
> = async (parent, args, { consultsDb, doctorsDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await appointmentRepo.findById(args.appointmentId);
  if (!apptDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  const rescheduleRepo = consultsDb.getCustomRepository(RescheduleAppointmentRepository);
  const rescheduleDetails = await rescheduleRepo.getRescheduleDetailsByAppointment(apptDetails.id);
  if (!rescheduleDetails) throw new AphError(AphErrorMessages.NO_RESCHEDULE_DETAILS, undefined, {});
  const apptCount = await appointmentRepo.checkIfAppointmentExist(
    rescheduleDetails.rescheduleInitiatedId,
    rescheduleDetails.rescheduledDateTime
  );
  if (rescheduleDetails.rescheduledDateTime < new Date() || apptCount > 0) {
    let nextDate = new Date();
    let availableSlot;
    while (true) {
      const nextSlot = await appointmentRepo.getDoctorNextSlotDate(
        rescheduleDetails.rescheduleInitiatedId,
        nextDate,
        doctorsDb,
        apptDetails.appointmentType,
        new Date()
      );
      if (nextSlot != '' && nextSlot != undefined) {
        availableSlot = nextSlot;
        break;
      }
      nextDate = addDays(nextDate, 1);
    }
    rescheduleDetails.rescheduledDateTime = new Date(availableSlot);
  }

  return rescheduleDetails;
};

const checkIfReschedule: Resolver<
  null,
  { existAppointmentId: string; rescheduleDate: Date },
  ConsultServiceContext,
  CheckRescheduleResult
> = async (parent, args, { consultsDb }) => {
  let isPaid = 0,
    isCancel = 0,
    rescheduleCount = 0,
    doctorRescheduleCount = 0,
    isFollowUp: Boolean = false;

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await appointmentRepo.findById(args.existAppointmentId);
  if (!apptDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  rescheduleCount = apptDetails.rescheduleCount;
  doctorRescheduleCount = apptDetails.rescheduleCountByDoctor;
  isFollowUp = apptDetails.isFollowUp;
  if (apptDetails && apptDetails.isFollowUp == false) {
    if (apptDetails.rescheduleCount >= 3) {
      isPaid = 1;
      isCancel = 1;
    } else {
      isPaid = 0;
      isCancel = 0;
    }
  }

  if (apptDetails && apptDetails.isFollowUp == true) {
    if (apptDetails.rescheduleCount >= 3) {
      isPaid = 1;
      isCancel = 1;
    } else {
      if (
        Math.abs(differenceInDays(apptDetails.appointmentDateTime, args.rescheduleDate)) >
          ApiConstants.APPOINTMENT_RESCHEDULE_DAYS_LIMIT &&
        apptDetails.isFollowPaid === false
      ) {
        isPaid = 1;
        isCancel = 0;
      } else {
        isPaid = 0;
        isCancel = 0;
      }
    }
  }

  return {
    isPaid,
    isCancel,
    rescheduleCount,
    doctorRescheduleCount,
    appointmentState: apptDetails.appointmentState,
    isFollowUp,
  };
};

const initiateRescheduleAppointment: Resolver<
  null,
  RescheduleAppointmentInputArgs,
  ConsultServiceContext,
  RescheduleAppointmentResult
> = async (parent, { RescheduleAppointmentInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointment = await appointmentRepo.findById(RescheduleAppointmentInput.appointmentId);

  if (!appointment) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  if (
    appointment.status !== STATUS.PENDING &&
    appointment.status !== STATUS.CONFIRMED &&
    appointment.status !== STATUS.IN_PROGRESS
  ) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_STATUS_TO_RESCHEDULE, undefined, {});
  }

  if (RescheduleAppointmentInput.rescheduledDateTime < new Date())
    throw new AphError(AphErrorMessages.INVALID_DATES);

  if (RescheduleAppointmentInput.autoSelectSlot == 1) {
    RescheduleAppointmentInput.rescheduledDateTime = new Date();
  }

  const rescheduleAppointmentAttrs: Omit<RescheduleAppointment, 'id'> = {
    ...RescheduleAppointmentInput,
    rescheduleStatus: TRANSFER_STATUS.INITIATED,
    appointment,
  };

  const rescheduleApptRepo = consultsDb.getCustomRepository(RescheduleAppointmentRepository);
  const rescheduleAppointment = await rescheduleApptRepo.saveReschedule(rescheduleAppointmentAttrs);

  await appointmentRepo.updateTransferState(
    RescheduleAppointmentInput.appointmentId,
    APPOINTMENT_STATE.AWAITING_RESCHEDULE,
    appointment
  );

  const notificationType = NotificationType.INITIATE_RESCHEDULE;

  // send notification
  const pushNotificationInput = {
    appointmentId: appointment.id,
    notificationType,
  };
  const notificationResult = sendNotification(
    pushNotificationInput,
    patientsDb,
    consultsDb,
    doctorsDb
  );
  console.log(notificationResult, 'notificationResult');
  const historyAttrs: Partial<AppointmentUpdateHistory> = {
    appointment,
    userType: APPOINTMENT_UPDATED_BY.DOCTOR,
    fromValue: appointment.status,
    toValue: appointment.status,
    valueType: VALUE_TYPE.STATUS,
    fromState: appointment.appointmentState,
    toState: APPOINTMENT_STATE.AWAITING_RESCHEDULE,
    userName: RescheduleAppointmentInput.rescheduleInitiatedId,
    reason: ApiConstants.APPT_STATE_CHANGED_1.toString(),
  };
  appointmentRepo.saveAppointmentHistory(historyAttrs);

  return {
    rescheduleAppointment,
    rescheduleCount: appointment.rescheduleCount,
    doctorRescheduleCount: appointment.rescheduleCountByDoctor,
  };
};

const bookRescheduleAppointment: Resolver<
  null,
  BookRescheduleAppointmentInputArgs,
  ConsultServiceContext,
  BookRescheduleAppointmentResult
> = async (parent, { bookRescheduleAppointmentInput }, { consultsDb, doctorsDb, patientsDb }) => {
  //input - appointmentid, doctorid, newslot, initiatedby-patient, initiatedid-patientid, rescheduledid
  //same doctor different slot - update datetime, and state = rescheduled
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const rescheduleApptRepo = consultsDb.getCustomRepository(RescheduleAppointmentRepository);
  const apptDetails = await appointmentRepo.findById(bookRescheduleAppointmentInput.appointmentId);
  const finalAppointmentId = bookRescheduleAppointmentInput.appointmentId;
  let patientRecordExist = 0;
  if (!apptDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  const rescheduleDetails = await rescheduleApptRepo.getRescheduleDetails(
    bookRescheduleAppointmentInput.appointmentId
  );

  if (rescheduleDetails) {
    bookRescheduleAppointmentInput.initiatedBy = rescheduleDetails.rescheduleInitiatedBy;
    if (rescheduleDetails.rescheduleInitiatedBy == TRANSFER_INITIATED_TYPE.PATIENT) {
      patientRecordExist = 1;
    }
  }
  if (apptDetails.status == STATUS.COMPLETED || apptDetails.status == STATUS.CANCELLED) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  // doctor details
  const doctor = doctorsDb.getCustomRepository(DoctorRepository);
  const docDetails = await doctor.findById(apptDetails.doctorId);
  if (!docDetails) {
    throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  }

  //check if given appointment datetime is greater than current date time
  if (bookRescheduleAppointmentInput.newDateTimeslot <= new Date()) {
    throw new AphError(AphErrorMessages.APPOINTMENT_BOOK_DATE_ERROR, undefined, {});
  }
  //check if doctor slot is blocked
  const blockRepo = doctorsDb.getCustomRepository(BlockedCalendarItemRepository);
  const slotDetails = await blockRepo.checkIfSlotBlocked(
    bookRescheduleAppointmentInput.newDateTimeslot,
    bookRescheduleAppointmentInput.doctorId
  );
  if (slotDetails[0]) {
    throw new AphError(AphErrorMessages.DOCTOR_SLOT_BLOCKED, undefined, {});
  }

  const apptCount = await appointmentRepo.checkIfAppointmentExist(
    bookRescheduleAppointmentInput.doctorId,
    bookRescheduleAppointmentInput.newDateTimeslot
  );
  if (apptCount > 0) {
    throw new AphError(AphErrorMessages.APPOINTMENT_EXIST_ERROR, undefined, {});
  }

  const patientConsults = await appointmentRepo.checkPatientConsults(
    bookRescheduleAppointmentInput.patientId,
    bookRescheduleAppointmentInput.newDateTimeslot
  );
  if (patientConsults) {
    throw new AphError(AphErrorMessages.ANOTHER_DOCTOR_APPOINTMENT_EXIST, undefined, {});
  }

  //check details
  const patient = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patient.getPatientDetails(bookRescheduleAppointmentInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function updateSlotsInEs(appointment: any, appointmentDateTime: any, status: string) {
    const slotApptDt = format(appointmentDateTime, 'yyyy-MM-dd') + ' 18:30:00';
    const actualApptDt = format(appointmentDateTime, 'yyyy-MM-dd');
    let apptDt = format(appointmentDateTime, 'yyyy-MM-dd');
    if (appointmentDateTime >= new Date(slotApptDt)) {
      apptDt = format(addDays(new Date(apptDt), 1), 'yyyy-MM-dd');
    }
    const sl = `${actualApptDt}T${appointmentDateTime
      .getUTCHours()
      .toString()
      .padStart(2, '0')}:${appointmentDateTime
      .getUTCMinutes()
      .toString()
      .padStart(2, '0')}:00.000Z`;
    console.log(slotApptDt, apptDt, sl, appointment.doctorId, 'appoint date time');
    const esDocotrStatusOpen =
      status === 'OPEN' ? ES_DOCTOR_SLOT_STATUS.OPEN : ES_DOCTOR_SLOT_STATUS.BOOKED;
    await appointmentRepo.updateDoctorSlotStatusES(
      appointment.doctorId,
      apptDt,
      sl,
      appointment.appointmentType,
      esDocotrStatusOpen
    );
  }

  if (bookRescheduleAppointmentInput.initiatedBy == TRANSFER_INITIATED_TYPE.PATIENT) {
    if (apptDetails.rescheduleCount == ApiConstants.APPOINTMENT_MAX_RESCHEDULE_COUNT_PATIENT) {
      //cancel appt
      await appointmentRepo.cancelAppointment(
        bookRescheduleAppointmentInput.appointmentId,
        REQUEST_ROLES.PATIENT,
        apptDetails.patientId,
        'MAX_RESCHEDULES_EXCEEDED',
        apptDetails
      );
      const historyAttrs: Partial<AppointmentUpdateHistory> = {
        appointment: apptDetails,
        userType: APPOINTMENT_UPDATED_BY.PATIENT,
        fromValue: apptDetails.status,
        toValue: STATUS.CANCELLED,
        valueType: VALUE_TYPE.STATUS,
        fromState: apptDetails.appointmentState,
        toState: apptDetails.appointmentState,
        userName: bookRescheduleAppointmentInput.patientId,
        reason: ApiConstants.APPT_STATE_CHANGED_3.toString(),
      };
      appointmentRepo.saveAppointmentHistory(historyAttrs);

      const appointmentPayment = await appointmentRepo.findAppointmentPayment(apptDetails.id);
      if (appointmentPayment) {
        let refundResponse = await initiateRefund(
          {
            appointment: apptDetails,
            appointmentPayments: appointmentPayment,
            refundAmount: appointmentPayment.amountPaid,
            txnId: appointmentPayment.paymentRefId,
            orderId: appointmentPayment.orderId,
          },
          consultsDb
        );
        refundResponse = refundResponse as PaytmResponse;
        const notificationType = NotificationType.APPOINTMENT_PAYMENT_REFUND;
        if (refundResponse.refundId) {
          sendNotification(
            {
              appointmentId: apptDetails.id,
              notificationType,
            },
            patientsDb,
            consultsDb,
            doctorsDb
          );
        } else {
          log(
            'consultServiceLogger',
            'Refund failed',
            'rescheduleAppointment()',
            JSON.stringify(refundResponse),
            'true'
          );
        }
      }
    } else {
      await appointmentRepo.rescheduleAppointment(
        bookRescheduleAppointmentInput.appointmentId,
        bookRescheduleAppointmentInput.newDateTimeslot,
        apptDetails.rescheduleCount + 1,
        APPOINTMENT_STATE.RESCHEDULE,
        apptDetails
      );
      // update on ES, should update new slot to booked and previous slot to open
      //open old slot
      await updateSlotsInEs(apptDetails, apptDetails.appointmentDateTime, 'OPEN');
      // book new slot
      await updateSlotsInEs(apptDetails, bookRescheduleAppointmentInput.newDateTimeslot, 'BOOKED');
      //ends
      const historyAttrs: Partial<AppointmentUpdateHistory> = {
        appointment: apptDetails,
        userType: APPOINTMENT_UPDATED_BY.PATIENT,
        fromValue: apptDetails.status,
        toValue: apptDetails.status,
        valueType: VALUE_TYPE.STATUS,
        fromState: apptDetails.appointmentState,
        toState: APPOINTMENT_STATE.RESCHEDULE,
        userName: apptDetails.patientId,
        reason: ApiConstants.APPT_STATE_CHANGED_2.toString(),
      };
      appointmentRepo.saveAppointmentHistory(historyAttrs);
    }

    const notificationType = NotificationType.PATIENT_APPOINTMENT_RESCHEDULE;

    // send notification
    const pushNotificationInput = {
      appointmentId: bookRescheduleAppointmentInput.appointmentId,
      notificationType,
    };
    const notificationResult = sendReminderNotification(
      pushNotificationInput,
      patientsDb,
      consultsDb,
      doctorsDb
    );
    console.log(notificationResult, 'notificationResult');
  }

  if (bookRescheduleAppointmentInput.initiatedBy == TRANSFER_INITIATED_TYPE.DOCTOR) {
    if (
      apptDetails.rescheduleCountByDoctor == ApiConstants.APPOINTMENT_MAX_RESCHEDULE_COUNT_DOCTOR
    ) {
      //cancel appt
      await appointmentRepo.cancelAppointment(
        bookRescheduleAppointmentInput.appointmentId,
        REQUEST_ROLES.PATIENT,
        apptDetails.patientId,
        'MAX_RESCHEDULES_EXCEEDED',
        apptDetails
      );
      const historyAttrs: Partial<AppointmentUpdateHistory> = {
        appointment: apptDetails,
        userType: APPOINTMENT_UPDATED_BY.DOCTOR,
        fromValue: apptDetails.status,
        toValue: STATUS.CANCELLED,
        valueType: VALUE_TYPE.STATUS,
        fromState: apptDetails.appointmentState,
        toState: apptDetails.appointmentState,
        userName: bookRescheduleAppointmentInput.doctorId,
        reason: ApiConstants.APPT_STATE_CHANGED_3.toString(),
      };
      appointmentRepo.saveAppointmentHistory(historyAttrs);

      const appointmentPayment = await appointmentRepo.findAppointmentPayment(apptDetails.id);
      if (appointmentPayment) {
        let refundResponse = await initiateRefund(
          {
            appointment: apptDetails,
            appointmentPayments: appointmentPayment,
            refundAmount: appointmentPayment.amountPaid,
            txnId: appointmentPayment.paymentRefId,
            orderId: appointmentPayment.orderId,
          },
          consultsDb
        );
        refundResponse = refundResponse as PaytmResponse;
        const notificationType = NotificationType.APPOINTMENT_PAYMENT_REFUND;
        if (refundResponse.refundId) {
          sendNotification(
            {
              appointmentId: apptDetails.id,
              notificationType,
            },
            patientsDb,
            consultsDb,
            doctorsDb
          );
        } else {
          log(
            'consultServiceLogger',
            'Refund failed Doctor Reschedule  ',
            'rescheduleAppointment()',
            JSON.stringify(refundResponse),
            'true'
          );
        }
      }
    } else {
      await appointmentRepo.rescheduleAppointmentByDoctor(
        bookRescheduleAppointmentInput.appointmentId,
        bookRescheduleAppointmentInput.newDateTimeslot,
        apptDetails.rescheduleCountByDoctor + 1,
        APPOINTMENT_STATE.RESCHEDULE,
        apptDetails
      );

      // update on ES, should update new slot to booked and previous slot to open
      //open old slot
      await updateSlotsInEs(apptDetails, apptDetails.appointmentDateTime, 'OPEN');
      // book new slot
      await updateSlotsInEs(apptDetails, bookRescheduleAppointmentInput.newDateTimeslot, 'BOOKED');
      //ends
      const historyAttrs: Partial<AppointmentUpdateHistory> = {
        appointment: apptDetails,
        userType: APPOINTMENT_UPDATED_BY.PATIENT,
        fromValue: apptDetails.status,
        toValue: apptDetails.status,
        valueType: VALUE_TYPE.STATUS,
        fromState: apptDetails.appointmentState,
        toState: APPOINTMENT_STATE.RESCHEDULE,
        userName: bookRescheduleAppointmentInput.patientId,
        reason: ApiConstants.APPT_STATE_CHANGED_2.toString(),
      };
      appointmentRepo.saveAppointmentHistory(historyAttrs);
    }
  }

  if (patientRecordExist == 0) {
    const rescheduleAppointmentAttrs: Omit<RescheduleAppointment, 'id'> = {
      rescheduledDateTime: bookRescheduleAppointmentInput.newDateTimeslot,
      rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
      rescheduleInitiatedId: bookRescheduleAppointmentInput.patientId,
      rescheduleStatus: TRANSFER_STATUS.COMPLETED,
      rescheduleReason: ApiConstants.PATIENT_INITIATE_REASON.toString(),
      appointment: apptDetails,
    };
    await rescheduleApptRepo.saveReschedule(rescheduleAppointmentAttrs);
  } else {
    //update reschedule record.
    if (rescheduleDetails) {
      const rescheduleAppointmentAttrs = {
        id: rescheduleDetails.id,
        rescheduleStatus: TRANSFER_STATUS.COMPLETED,
      };
      await rescheduleApptRepo.saveReschedule(rescheduleAppointmentAttrs);
    }
  }
  if (bookRescheduleAppointmentInput.initiatedBy == TRANSFER_INITIATED_TYPE.DOCTOR) {
    if (rescheduleDetails) {
      rescheduleDetails.id;
      await rescheduleApptRepo.updateReschedule(rescheduleDetails.id, TRANSFER_STATUS.COMPLETED);
    }
  }

  const rescheduledapptDetails = await appointmentRepo.findById(
    bookRescheduleAppointmentInput.appointmentId
  );
  if (!rescheduledapptDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  const hospitalCity = docDetails.doctorHospital[0].facility.city;
  const istDateTime = addMilliseconds(rescheduledapptDetails.appointmentDateTime, 19800000);
  const apptDate = format(istDateTime, 'dd/MM/yyyy');
  const apptTime = format(istDateTime, 'hh:mm aa');
  const mailContent = rescheduleAppointmentEmailTemplate({
    hospitalCity: hospitalCity || 'N/A',
    apptDate,
    apptTime,
    PatientfirstName: patientDetails.firstName || 'N/A',
    PatientMobileNumber: patientDetails.mobileNumber || 'N/A',
    rescheduledapptType: rescheduledapptDetails.appointmentType || 'N/A',
    rescheduledapptNo: rescheduledapptDetails.displayId.toString() || 'N/A',
    docfirstName: docDetails.firstName || 'N/A',
  });

  const emailsubject = _.template(`
    Appointment rescheduled for ${hospitalCity},  Hosp Doctor – ${apptDate} ${apptTime}hrs, Dr. ${docDetails.firstName} ${docDetails.lastName}`);

  const mailSubject = emailsubject({
    docDetails,
    apptDate,
    apptTime,
    hospitalCity,
  });

  const toEmailId = process.env.BOOK_APPT_TO_EMAIL ? process.env.BOOK_APPT_TO_EMAIL : '';
  const ccEmailIds =
    process.env.NODE_ENV == 'dev' ||
    process.env.NODE_ENV == 'development' ||
    process.env.NODE_ENV == 'local'
      ? ApiConstants.PATIENT_APPT_CC_EMAILID
      : ApiConstants.PATIENT_APPT_CC_EMAILID_PRODUCTION;
  const emailContent: EmailMessage = {
    ccEmail: ccEmailIds.toString(),
    toEmail: toEmailId.toString(),
    subject: mailSubject,
    fromEmail: ApiConstants.PATIENT_HELP_FROM_EMAILID.toString(),
    fromName: ApiConstants.PATIENT_HELP_FROM_NAME.toString(),
    messageContent: mailContent,
  };
  sendMail(emailContent);
  // sendDoctorAppointmentNotification(
  //   rescheduledapptDetails.appointmentDateTime,
  //   rescheduledapptDetails.patientName,
  //   rescheduledapptDetails.id,
  //   rescheduledapptDetails.doctorId,
  //   doctorsDb
  // );
  sendDoctorRescheduleAppointmentNotification(
    rescheduledapptDetails.appointmentDateTime,
    rescheduledapptDetails.patientName,
    rescheduledapptDetails.id,
    rescheduledapptDetails.doctorId,
    doctorsDb
  );

  //send mail to doctor admin start
  if (bookRescheduleAppointmentInput.initiatedBy == TRANSFER_INITIATED_TYPE.PATIENT) {
    const adminRepo = doctorsDb.getCustomRepository(AdminDoctorMap);
    const adminDetails = await adminRepo.findByadminId(apptDetails.doctorId);
    console.log(adminDetails, 'adminDetails');
    if (adminDetails == null) throw new AphError(AphErrorMessages.GET_ADMIN_USER_ERROR);

    const listOfEmails: string[] = [];

    adminDetails.length > 0 &&
      adminDetails.map((value) => listOfEmails.push(value.adminuser.email));
    console.log('listOfEmails', listOfEmails);
    listOfEmails.forEach(async (adminemail) => {
      const adminEmailContent: EmailMessage = {
        ccEmail: ccEmailIds.toString(),
        toEmail: adminemail.toString(),
        subject: mailSubject.toString(),
        fromEmail: ApiConstants.PATIENT_HELP_FROM_EMAILID.toString(),
        fromName: ApiConstants.PATIENT_HELP_FROM_NAME.toString(),
        messageContent: mailContent,
      };
      sendMail(adminEmailContent);
    });
  }
  //send mail to doctor admin end

  //send SMS to patient after appintment reschedule accepted by patient

  const appointmentDetails = await appointmentRepo.findById(finalAppointmentId);
  if (!appointmentDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  const pushNotificationInput = {
    appointmentId: bookRescheduleAppointmentInput.appointmentId,
    notificationType: NotificationType.ACCEPT_RESCHEDULED_APPOINTMENT,
  };
  if (bookRescheduleAppointmentInput.initiatedBy == TRANSFER_INITIATED_TYPE.DOCTOR) {
    // const notificationResult = await sendNotification(
    //   pushNotificationInput,
    //   patientsDb,
    //   consultsDb,
    //   doctorsDb
    // );
    //console.log(notificationResult, 'appt rescheduled notification');
  }
  if ((bookRescheduleAppointmentInput.initiatedBy = TRANSFER_INITIATED_TYPE.PATIENT)) {
    // const pushNotificationInput = {
    //   appointmentId: bookRescheduleAppointmentInput.appointmentId,
    //   notificationType: NotificationType.RESCHEDULE_APPOINTMENT_BY_PATIENT,
    // };
    const notificationResult = await sendNotification(
      pushNotificationInput,
      patientsDb,
      consultsDb,
      doctorsDb
    );
    console.log(notificationResult, 'appt rescheduled notification');
  }
  return { appointmentDetails };
};

export const rescheduleAppointmentResolvers = {
  Mutation: {
    initiateRescheduleAppointment,
    bookRescheduleAppointment,
  },

  Query: {
    checkIfReschedule,
    getAppointmentRescheduleDetails,
  },
};
