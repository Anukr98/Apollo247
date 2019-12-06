import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  STATUS,
  REQUEST_ROLES,
  TRANSFER_STATUS,
  APPOINTMENT_STATE,
} from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { ApiConstants } from 'ApiConstants';
import { EmailMessage } from 'types/notificationMessageTypes';
import { sendMail } from 'notifications-service/resolvers/email';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';
import { addMilliseconds, format } from 'date-fns';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';

export const cancelAppointmentTypeDefs = gql`
  input CancelAppointmentInput {
    appointmentId: ID!
    cancelReason: String
    cancelledBy: REQUEST_ROLES!
    cancelledById: ID!
  }

  type CancelAppointmentResult {
    status: STATUS
  }

  extend type Mutation {
    cancelAppointment(cancelAppointmentInput: CancelAppointmentInput): CancelAppointmentResult!
  }
`;

type CancelAppointmentResult = {
  status: STATUS;
};

type CancelAppointmentInput = {
  appointmentId: string;
  cancelReason: string;
  cancelledBy: REQUEST_ROLES;
  cancelledById: string;
};

type CancelAppointmentInputArgs = {
  cancelAppointmentInput: CancelAppointmentInput;
};

const cancelAppointment: Resolver<
  null,
  CancelAppointmentInputArgs,
  ConsultServiceContext,
  CancelAppointmentResult
> = async (parent, { cancelAppointmentInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointment = await appointmentRepo.findById(cancelAppointmentInput.appointmentId);
  if (!appointment) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  if (
    appointment.status == STATUS.IN_PROGRESS &&
    cancelAppointmentInput.cancelledBy !== REQUEST_ROLES.DOCTOR &&
    appointment.appointmentState != APPOINTMENT_STATE.AWAITING_RESCHEDULE
  )
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});

  if (
    appointment.appointmentDateTime <= new Date() &&
    cancelAppointmentInput.cancelledBy == REQUEST_ROLES.PATIENT
  ) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const caseSheetDetails = await caseSheetRepo.getJuniorDoctorCaseSheet(
    cancelAppointmentInput.appointmentId
  );

  if (
    cancelAppointmentInput.cancelledBy == REQUEST_ROLES.PATIENT &&
    caseSheetDetails &&
    caseSheetDetails.status == STATUS.PENDING.toString()
  ) {
    throw new AphError(AphErrorMessages.JUNIOR_DOCTOR_CONSULTATION_INPROGRESS, undefined, {});
  }

  if (
    appointment.status !== STATUS.PENDING &&
    appointment.status !== STATUS.CONFIRMED &&
    appointment.status !== STATUS.IN_PROGRESS &&
    appointment.status !== STATUS.NO_SHOW &&
    appointment.status !== STATUS.CALL_ABANDON
  ) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  await appointmentRepo.cancelAppointment(
    cancelAppointmentInput.appointmentId,
    cancelAppointmentInput.cancelledBy,
    cancelAppointmentInput.cancelledById,
    cancelAppointmentInput.cancelReason
  );

  //remove from consult queue
  const cqRepo = consultsDb.getCustomRepository(ConsultQueueRepository);
  const existingQueueItem = await cqRepo.findByAppointmentId(appointment.id);
  if (existingQueueItem !== undefined && existingQueueItem != null)
    await cqRepo.update(existingQueueItem.id, { isActive: false });

  if (cancelAppointmentInput.cancelledBy == REQUEST_ROLES.DOCTOR) {
    const pushNotificationInput = {
      appointmentId: appointment.id,
      notificationType: NotificationType.DOCTOR_CANCEL_APPOINTMENT,
    };
    sendNotification(pushNotificationInput, patientsDb, consultsDb, doctorsDb);
  }

  const mailSubject = ApiConstants.CANCEL_APPOINTMENT_SUBJECT;

  const istDateTime = addMilliseconds(appointment.appointmentDateTime, 19800000);

  const apptDate = format(istDateTime, 'dd/MM/yyyy');
  const apptTime = format(istDateTime, 'hh:mm');
  const patientName = appointment.patientName;
  const mailContent = `Appointment booked on Apollo 247 by ${patientName} on ${apptDate} at ${apptTime} has been cancelled`;
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
    subject: mailSubject.toString(),
    fromEmail: ApiConstants.PATIENT_HELP_FROM_EMAILID.toString(),
    fromName: ApiConstants.PATIENT_HELP_FROM_NAME.toString(),
    messageContent: mailContent,
  };
  if (cancelAppointmentInput.cancelledBy == REQUEST_ROLES.PATIENT) {
    sendMail(emailContent);
  }
  return { status: STATUS.CANCELLED };
};

export const cancelAppointmentResolvers = {
  Mutation: {
    cancelAppointment,
  },
};
