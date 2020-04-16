import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { STATUS, REQUEST_ROLES, APPOINTMENT_STATE } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { ApiConstants } from 'ApiConstants';
import { EmailMessage } from 'types/notificationMessageTypes';
import { sendMail } from 'notifications-service/resolvers/email';
import { cancellationEmailTemplate } from 'helpers/emailTemplates/cancellationEmailTemplate';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';
import { addMilliseconds, format } from 'date-fns';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import { AdminDoctorMap } from 'doctors-service/repositories/adminDoctorRepository';

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
    (appointment.status == STATUS.IN_PROGRESS ||
      appointment.status == STATUS.NO_SHOW ||
      appointment.status == STATUS.CALL_ABANDON) &&
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

  if (
    cancelAppointmentInput.cancelledBy == REQUEST_ROLES.DOCTOR ||
    cancelAppointmentInput.cancelledBy == REQUEST_ROLES.JUNIOR
  ) {
    const pushNotificationInput = {
      appointmentId: appointment.id,
      notificationType: NotificationType.DOCTOR_CANCEL_APPOINTMENT,
    };
    sendNotification(pushNotificationInput, patientsDb, consultsDb, doctorsDb);
  }

  if (cancelAppointmentInput.cancelledBy == REQUEST_ROLES.PATIENT) {
    const pushNotificationInput = {
      appointmentId: appointment.id,
      notificationType: NotificationType.PATIENT_CANCEL_APPOINTMENT,
    };
    console.log('sending notification for cancel', appointment.id);
    sendNotification(pushNotificationInput, patientsDb, consultsDb, doctorsDb);
  }

  const mailSubject = ApiConstants.CANCEL_APPOINTMENT_SUBJECT;

  const istDateTime = addMilliseconds(appointment.appointmentDateTime, 19800000);

  const apptDate = format(istDateTime, 'dd/MM/yyyy');
  const apptTime = format(istDateTime, 'hh:mm aa');
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorDetails = await doctorRepo.findById(appointment.doctorId);
  let docName = '';
  let hospitalName = '';
  if (doctorDetails) {
    docName = doctorDetails.displayName;
  }

  if (appointment.hospitalId != '' && appointment.hospitalId != null) {
    const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
    const facilityDets = await facilityRepo.getfacilityDetails(appointment.hospitalId);
    if (facilityDets) {
      const streetLine2 = facilityDets.streetLine2 == null ? '' : facilityDets.streetLine2 + ',';
      hospitalName =
        facilityDets.name +
        ', ' +
        facilityDets.streetLine1 +
        ', ' +
        streetLine2 +
        ' ' +
        facilityDets.city +
        ', ' +
        facilityDets.state;
    }
  }
  const mailContent = cancellationEmailTemplate({
    Title: ApiConstants.CANCEL_APPOINTMENT_BODY,
    PatientName: appointment.patientName,
    AppointmentDateTime: apptDate + ',  ' + apptTime,
    DoctorName: docName,
    HospitalName: hospitalName,
  });
  const toEmailId = process.env.BOOK_APPT_TO_EMAIL ? process.env.BOOK_APPT_TO_EMAIL : '';
  const ccEmailIds =
    process.env.NODE_ENV == 'dev' ||
    process.env.NODE_ENV == 'development' ||
    process.env.NODE_ENV == 'local'
      ? ApiConstants.PATIENT_APPT_CC_EMAILID
      : ApiConstants.PATIENT_APPT_CC_EMAILID_PRODUCTION;
  const ccTriggerEmailIds =
    process.env.NODE_ENV == 'dev' ||
    process.env.NODE_ENV == 'development' ||
    process.env.NODE_ENV == 'local'
      ? ApiConstants.PATIENT_APPT_CC_EMAILID_TRIGGER
      : ApiConstants.PATIENT_APPT_CC_EMAILID_PRODUCTION;
  const emailContent: EmailMessage = {
    ccEmail: ccEmailIds.toString(),
    toEmail: toEmailId.toString(),
    subject: mailSubject.toString(),
    fromEmail: ApiConstants.PATIENT_HELP_FROM_EMAILID.toString(),
    fromName: ApiConstants.PATIENT_HELP_FROM_NAME.toString(),
    messageContent: mailContent,
  };
  console.log('sending mail for cancel', appointment.id);
  if (cancelAppointmentInput.cancelledBy == REQUEST_ROLES.PATIENT) {
    sendMail(emailContent);
  }
  //send mail to doctor admin start
  if (cancelAppointmentInput.cancelledBy == REQUEST_ROLES.PATIENT) {
    const adminRepo = doctorsDb.getCustomRepository(AdminDoctorMap);
    const adminDetails = await adminRepo.findByadminId(appointment.doctorId);
    console.log(adminDetails, 'adminDetails');
    if (adminDetails == null) throw new AphError(AphErrorMessages.GET_ADMIN_USER_ERROR);

    const listOfEmails: string[] = [];

    adminDetails.length > 0 &&
      adminDetails.map((value) => listOfEmails.push(value.adminuser.email));
    console.log('listOfEmails', listOfEmails);
    listOfEmails.forEach(async (adminemail) => {
      const adminEmailContent: EmailMessage = {
        ccEmail: ccTriggerEmailIds.toString(),
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
  return { status: STATUS.CANCELLED };
};

export const cancelAppointmentResolvers = {
  Mutation: {
    cancelAppointment,
  },
};
