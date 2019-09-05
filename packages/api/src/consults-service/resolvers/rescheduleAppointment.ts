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
import {
  sendNotification,
  NotificationPriority,
  PushNotificationSuccessMessaage,
} from 'notifications-service/resolvers/notifications';
import { PatientDeviceTokenRepository } from 'profiles-service/repositories/patientDeviceTokenRepository';

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
    notificationResult: NotificationSuccessMessage
  }

  type BookRescheduleAppointmentResult {
    appointmentDetails: Appointment
  }

  extend type Mutation {
    initiateRescheduleAppointment(
      RescheduleAppointmentInput: RescheduleAppointmentInput
    ): RescheduleAppointmentResult!
    bookRescheduleAppointment(
      bookRescheduleAppointmentInput: BookRescheduleAppointmentInput
    ): BookRescheduleAppointmentResult!
  }
`;

type RescheduleAppointmentResult = {
  rescheduleAppointment: RescheduleAppointment;
  rescheduleCount: number;
  notificationResult: PushNotificationSuccessMessaage | undefined;
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

type RescheduleAppointmentInputArgs = { RescheduleAppointmentInput: RescheduleAppointmentInput };
type BookRescheduleAppointmentInputArgs = {
  bookRescheduleAppointmentInput: BookRescheduleAppointmentInput;
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

  //get patient device tokens
  const deviceTokenRepo = patientsDb.getCustomRepository(PatientDeviceTokenRepository);
  const deviceTokens = await deviceTokenRepo.getDeviceToken(appointment.patientId);

  let notificationBody = <string>process.env.RESCHEDULE_INITIATION_BODY;
  notificationBody = notificationBody.replace('{0}', appointment.displayId + '');

  let notificationResult;

  if (deviceTokens.length) {
    deviceTokens.forEach((value) => {
      if (value.deviceToken.length) {
        const pushNotificationInput = {
          title: <string>process.env.RESCHEDULE_INITIATION_TITLE,
          body: notificationBody,
          priority: NotificationPriority.high,
          registrationToken: value.deviceToken,
        };
        notificationResult = sendNotification(pushNotificationInput);
      }
    });
  }

  const rescheduleAppointment = await rescheduleApptRepo.saveReschedule(rescheduleAppointmentAttrs);

  return {
    rescheduleAppointment,
    rescheduleCount: appointment.rescheduleCount,
    notificationResult,
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

  if (!apptDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  const apptCount = await appointmentRepo.checkIfAppointmentExist(
    bookRescheduleAppointmentInput.doctorId,
    bookRescheduleAppointmentInput.newDateTimeslot
  );
  if (apptCount > 0) {
    throw new AphError(AphErrorMessages.APPOINTMENT_EXIST_ERROR, undefined, {});
  }

  await appointmentRepo.rescheduleAppointment(
    bookRescheduleAppointmentInput.appointmentId,
    bookRescheduleAppointmentInput.newDateTimeslot,
    apptDetails.rescheduleCount + 1,
    APPOINTMENT_STATE.RESCHEDULE
  );

  if (bookRescheduleAppointmentInput.initiatedBy == TRANSFER_INITIATED_TYPE.PATIENT) {
    const rescheduleAppointmentAttrs: Omit<RescheduleAppointment, 'id'> = {
      rescheduledDateTime: bookRescheduleAppointmentInput.newDateTimeslot,
      rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE.PATIENT,
      rescheduleInitiatedId: bookRescheduleAppointmentInput.patientId,
      rescheduleStatus: TRANSFER_STATUS.COMPLETED,
      rescheduleReason: 'initiated by patient',
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

  const appointmentDetails = await appointmentRepo.findById(
    bookRescheduleAppointmentInput.appointmentId
  );
  if (!appointmentDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  console.log(appointmentDetails, 'modified details');
  return { appointmentDetails };
};

export const rescheduleAppointmentResolvers = {
  Mutation: {
    initiateRescheduleAppointment,
    bookRescheduleAppointment,
  },
};
