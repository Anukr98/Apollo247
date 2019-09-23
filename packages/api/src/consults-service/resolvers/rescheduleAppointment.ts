import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  Appointment,
  APPOINTMENT_STATE,
  TRANSFER_STATUS,
  TRANSFER_INITIATED_TYPE,
  STATUS,
} from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { RescheduleAppointmentRepository } from 'consults-service/repositories/rescheduleAppointmentRepository';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';
import { differenceInDays } from 'date-fns';
import { ApiConstants } from 'ApiConstants';

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
  }

  type BookRescheduleAppointmentResult {
    appointmentDetails: Appointment
  }

  type CheckRescheduleResult {
    isPaid: Int!
    isCancel: Int!
    rescheduleCount: Int!
    appointmentState: APPOINTMENT_STATE!
    isFollowUp: Int!
  }

  extend type Mutation {
    testInitiateRescheduleAppointment(
      RescheduleAppointmentInput: RescheduleAppointmentInput
    ): RescheduleAppointmentResult!
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
    isFollowUp: Boolean = false;

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await appointmentRepo.findById(args.existAppointmentId);
  if (!apptDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  rescheduleCount = apptDetails.rescheduleCount;
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
    appointmentState: apptDetails.appointmentState,
    isFollowUp,
  };
};
const testInitiateRescheduleAppointment: Resolver<
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
  const rescheduleApptRepo = consultsDb.getCustomRepository(RescheduleAppointmentRepository);
  const rescheduleAppointmentAttrs: Omit<RescheduleAppointment, 'id'> = {
    ...RescheduleAppointmentInput,
    rescheduleStatus: TRANSFER_STATUS.INITIATED,
    appointment,
  };
  const rescheduleAppointment = await rescheduleApptRepo.rescheduleAppointment(
    rescheduleAppointmentAttrs
  );
  return {
    rescheduleAppointment,
    rescheduleCount: appointment.rescheduleCount,
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

  if (appointment.status !== STATUS.PENDING && appointment.status !== STATUS.CONFIRMED) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  if (RescheduleAppointmentInput.autoSelectSlot == 1) {
    RescheduleAppointmentInput.rescheduledDateTime = new Date();
  }

  const rescheduleApptRepo = consultsDb.getCustomRepository(RescheduleAppointmentRepository);
  const rescheduleAppointmentAttrs: Omit<RescheduleAppointment, 'id'> = {
    ...RescheduleAppointmentInput,
    rescheduleStatus: TRANSFER_STATUS.INITIATED,
    appointment,
  };

  // send notification
  const pushNotificationInput = {
    appointmentId: appointment.id,
    notificationType: NotificationType.INITIATE_RESCHEDULE,
  };
  const notificationResult = sendNotification(
    pushNotificationInput,
    patientsDb,
    consultsDb,
    doctorsDb
  );
  console.log(notificationResult, 'notificationResult');

  const rescheduleAppointment = await rescheduleApptRepo.saveReschedule(rescheduleAppointmentAttrs);
  await appointmentRepo.updateTransferState(
    RescheduleAppointmentInput.appointmentId,
    APPOINTMENT_STATE.AWAITING_RESCHEDULE
  );
  return {
    rescheduleAppointment,
    rescheduleCount: appointment.rescheduleCount,
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
  let finalAppointmentId = bookRescheduleAppointmentInput.appointmentId;
  if (!apptDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  //check if given appointment datetime is greater than current date time
  if (bookRescheduleAppointmentInput.newDateTimeslot <= new Date()) {
    throw new AphError(AphErrorMessages.APPOINTMENT_BOOK_DATE_ERROR, undefined, {});
  }

  const apptCount = await appointmentRepo.checkIfAppointmentExist(
    bookRescheduleAppointmentInput.doctorId,
    bookRescheduleAppointmentInput.newDateTimeslot
  );
  if (apptCount > 0) {
    throw new AphError(AphErrorMessages.APPOINTMENT_EXIST_ERROR, undefined, {});
  }

  if (
    bookRescheduleAppointmentInput.initiatedBy == TRANSFER_INITIATED_TYPE.PATIENT &&
    apptDetails.rescheduleCount == 3
  ) {
    //cancel and book new appt
    appointmentRepo.cancelAppointment(
      bookRescheduleAppointmentInput.appointmentId,
      TRANSFER_INITIATED_TYPE.PATIENT,
      apptDetails.patientId
    );

    const appointmentAttrs = {
      patientId: apptDetails.patientId,
      doctorId: apptDetails.doctorId,
      status: STATUS.PENDING,
      patientName: apptDetails.patientName,
      appointmentDateTime: new Date(bookRescheduleAppointmentInput.newDateTimeslot.toISOString()),
      appointmentState: APPOINTMENT_STATE.NEW,
      isFollowUp: apptDetails.isFollowUp,
      isFollowPaid: apptDetails.isFollowPaid,
      followUpParentId: apptDetails.followUpParentId,
      appointmentType: apptDetails.appointmentType,
    };
    const appointment = await appointmentRepo.saveAppointment(appointmentAttrs);
    finalAppointmentId = appointment.id;
  } else {
    await appointmentRepo.rescheduleAppointment(
      bookRescheduleAppointmentInput.appointmentId,
      bookRescheduleAppointmentInput.newDateTimeslot,
      apptDetails.rescheduleCount + 1,
      APPOINTMENT_STATE.RESCHEDULE
    );
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
    await rescheduleApptRepo.updateReschedule(
      bookRescheduleAppointmentInput.rescheduledId,
      TRANSFER_STATUS.COMPLETED
    );
  }

  const appointmentDetails = await appointmentRepo.findById(finalAppointmentId);
  if (!appointmentDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  console.log(appointmentDetails, 'modified details');
  return { appointmentDetails };
};

export const rescheduleAppointmentResolvers = {
  Mutation: {
    initiateRescheduleAppointment,
    testInitiateRescheduleAppointment,
    bookRescheduleAppointment,
  },

  Query: {
    checkIfReschedule,
  },
};
