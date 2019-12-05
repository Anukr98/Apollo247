import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  Appointment,
  APPOINTMENT_STATE,
  TRANSFER_STATUS,
  TRANSFER_INITIATED_TYPE,
  STATUS,
  REQUEST_ROLES,
} from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import _ from 'lodash';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { format, addMinutes } from 'date-fns';
import { sendMail } from 'notifications-service/resolvers/email';
import { EmailMessage } from 'types/notificationMessageTypes';
import { ApiConstants } from 'ApiConstants';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { RescheduleAppointmentRepository } from 'consults-service/repositories/rescheduleAppointmentRepository';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';
import { addMilliseconds, differenceInDays } from 'date-fns';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';

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
    APPOINTMENT_STATE.AWAITING_RESCHEDULE
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
  if (!apptDetails) {
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
  const patientDetails = await patient.findById(bookRescheduleAppointmentInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  if (bookRescheduleAppointmentInput.initiatedBy == TRANSFER_INITIATED_TYPE.PATIENT) {
    if (apptDetails.rescheduleCount == ApiConstants.APPOINTMENT_MAX_RESCHEDULE_COUNT_PATIENT) {
      //cancel appt
      appointmentRepo.cancelAppointment(
        bookRescheduleAppointmentInput.appointmentId,
        REQUEST_ROLES.PATIENT,
        apptDetails.patientId,
        'MAX_RESCHEDULES_EXCEEDED'
      );
    } else {
      await appointmentRepo.rescheduleAppointment(
        bookRescheduleAppointmentInput.appointmentId,
        bookRescheduleAppointmentInput.newDateTimeslot,
        apptDetails.rescheduleCount + 1,
        APPOINTMENT_STATE.RESCHEDULE
      );
    }
  }

  if (bookRescheduleAppointmentInput.initiatedBy == TRANSFER_INITIATED_TYPE.DOCTOR) {
    if (
      apptDetails.rescheduleCountByDoctor == ApiConstants.APPOINTMENT_MAX_RESCHEDULE_COUNT_DOCTOR
    ) {
      //cancel appt
      appointmentRepo.cancelAppointment(
        bookRescheduleAppointmentInput.appointmentId,
        REQUEST_ROLES.PATIENT,
        apptDetails.patientId,
        'MAX_RESCHEDULES_EXCEEDED'
      );
    } else {
      await appointmentRepo.rescheduleAppointmentByDoctor(
        bookRescheduleAppointmentInput.appointmentId,
        bookRescheduleAppointmentInput.newDateTimeslot,
        apptDetails.rescheduleCountByDoctor + 1,
        APPOINTMENT_STATE.RESCHEDULE
      );
    }
  }

  if (bookRescheduleAppointmentInput.initiatedBy == TRANSFER_INITIATED_TYPE.PATIENT) {
    const rescheduleAppointmentAttrs: Omit<RescheduleAppointment, 'id'> = {
      rescheduledDateTime: bookRescheduleAppointmentInput.newDateTimeslot,
      rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
      rescheduleInitiatedId: bookRescheduleAppointmentInput.patientId,
      rescheduleStatus: TRANSFER_STATUS.COMPLETED,
      rescheduleReason: ApiConstants.PATIENT_INITIATE_REASON.toString(),
      appointment: apptDetails,
    };
    await rescheduleApptRepo.saveReschedule(rescheduleAppointmentAttrs);
  }

  if (bookRescheduleAppointmentInput.initiatedBy == TRANSFER_INITIATED_TYPE.DOCTOR) {
    const rescheduleDetails = await rescheduleApptRepo.getRescheduleDetailsByAppointment(
      bookRescheduleAppointmentInput.appointmentId
    );
    if (rescheduleDetails) {
      rescheduleDetails.id;
      await rescheduleApptRepo.updateReschedule(rescheduleDetails.id, TRANSFER_STATUS.COMPLETED);
    }
  }
  const mailContentTemplate = _.template(
    `<html>
    <body>
    <p> Appointment has been rescheduled on Apollo 247 app with the following details:</p>
    <ul>
    <li>Appointment No  : <%- rescheduledapptNo %></li>
    <li>Patient Name  : <%- PatientfirstName %></li>
    <li>Mobile Number   : <%- PatientMobileNumber %></li>
    <li>Doctor Name  : <%- docfirstName %></li>
    <li>Doctor Location (ATHS/Hyd Hosp/Chennai Hosp) : <%- hospitalCity %></li>
    <li>Appointment Date  : <%- apptDate %></li>
    <li>Appointment Slot  : <%- apptTime %></li>
    <li>Mode of Consult : <%-  rescheduledapptType %></li>
    </ul>
    </body> 
    </html>
    `
  );

  const rescheduledapptDetails = await appointmentRepo.findById(
    bookRescheduleAppointmentInput.appointmentId
  );
  if (!rescheduledapptDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  const hospitalCity = docDetails.doctorHospital[0].facility.city;
  const istDateTime = addMilliseconds(rescheduledapptDetails.appointmentDateTime, 19800000);
  const apptDate = format(istDateTime, 'dd/MM/yyyy');
  const apptTime = format(istDateTime, 'hh:mm');

  const mailContent = mailContentTemplate({
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

  const appointmentDetails = await appointmentRepo.findById(finalAppointmentId);
  if (!appointmentDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
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
  },
};
