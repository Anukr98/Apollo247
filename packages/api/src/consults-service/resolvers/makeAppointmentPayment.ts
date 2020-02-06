import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  Appointment,
  AppointmentPayments,
  STATUS,
  APPOINTMENT_PAYMENT_TYPE,
} from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Connection } from 'typeorm';

import { sendSMS } from 'notifications-service/resolvers/notifications';
import { sendMail } from 'notifications-service/resolvers/email';
import { EmailMessage } from 'types/notificationMessageTypes';
import { ApiConstants } from 'ApiConstants';
import { addMilliseconds, format, addMinutes } from 'date-fns';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';

export const makeAppointmentPaymentTypeDefs = gql`
  enum APPOINTMENT_PAYMENT_TYPE {
    ONLINE
  }

  input AppointmentPaymentInput {
    amountPaid: Float!
    paymentRefId: String
    paymentStatus: String!
    paymentDateTime: DateTime!
    responseCode: String!
    responseMessage: String!
    bankTxnId: String
    orderId: String
  }

  type AppointmentPayment {
    id: ID!
    amountPaid: Float!
    paymentRefId: String
    paymentStatus: String!
    paymentDateTime: DateTime!
    responseCode: String!
    responseMessage: String!
    bankTxnId: String!
    orderId: String!
  }

  type AppointmentPaymentResult {
    appointment: AppointmentPayment
  }

  extend type Mutation {
    makeAppointmentPayment(paymentInput: AppointmentPaymentInput): AppointmentPaymentResult!
  }
`;

type AppointmentPaymentResult = {
  appointment: AppointmentPayment;
};

type AppointmentPayment = {
  id: string;
  amountPaid: number;
  paymentRefId: string;
  paymentStatus: string;
  paymentDateTime: Date;
  responseCode: string;
  responseMessage: string;
  bankTxnId: string;
  orderId: string;
};

type AppointmentPaymentInput = {
  amountPaid: number;
  paymentRefId: string;
  paymentStatus: string;
  paymentDateTime: Date;
  responseCode: string;
  responseMessage: string;
  bankTxnId: string;
  orderId: string;
};

type AppointmentInputArgs = { paymentInput: AppointmentPaymentInput };

const makeAppointmentPayment: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  AppointmentPaymentResult
> = async (parent, { paymentInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const processingAppointment = await apptsRepo.findByOrderIdAndStatus(
    paymentInput.orderId,
    STATUS.PAYMENT_PENDING
  );
  if (!processingAppointment) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  //insert payment details
  const apptPaymentAttrs: Partial<AppointmentPayments> = paymentInput;
  apptPaymentAttrs.appointment = processingAppointment;
  apptPaymentAttrs.paymentType = APPOINTMENT_PAYMENT_TYPE.ONLINE;
  const paymentInfo = await apptsRepo.saveAppointmentPayment(apptPaymentAttrs);

  //update appointment status to PENDING
  if (paymentInput.paymentStatus == 'TXN_SUCCESS') {
    //check if any appointment already exists in this slot before confirming payment
    const apptCount = await apptsRepo.checkIfAppointmentExist(
      processingAppointment.doctorId,
      processingAppointment.appointmentDateTime
    );

    if (apptCount > 0) {
      throw new AphError(AphErrorMessages.APPOINTMENT_EXIST_ERROR, undefined, {});
    }

    //Send booking confirmation SMS,EMAIL & NOTIFICATION to patient
    sendPatientAcknowledgements(processingAppointment, consultsDb, doctorsDb, patientsDb);

    //update appointment status
    //apptsRepo.updateAppointmentStatusUsingOrderId(paymentInput.orderId, STATUS.PENDING, false);
    apptsRepo.updateAppointmentStatus(processingAppointment.id, STATUS.PENDING, false);
  }

  return { appointment: paymentInfo };
};

const sendPatientAcknowledgements = async (
  appointmentData: Appointment,
  consultsDb: Connection,
  doctorsDb: Connection,
  patientsDb: Connection
) => {
  const doctor = doctorsDb.getCustomRepository(DoctorRepository);
  const docDetails = await doctor.findById(appointmentData.doctorId);
  if (!docDetails) {
    throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  }

  const patient = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patient.findById(appointmentData.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  //SMS logic starts here
  let smsMessage = ApiConstants.BOOK_APPOINTMENT_SMS_MESSAGE.replace(
    '{0}',
    patientDetails.firstName
  );
  smsMessage = smsMessage.replace('{1}', appointmentData.displayId.toString());
  smsMessage = smsMessage.replace('{2}', docDetails.firstName + ' ' + docDetails.lastName);
  const istDateTime = addMilliseconds(appointmentData.appointmentDateTime, 19800000);
  const smsDate = format(istDateTime, 'dd-MM-yyyy HH:mm');
  smsMessage = smsMessage.replace('{3}', smsDate.toString());
  smsMessage = smsMessage.replace('at {4}', '');
  console.log(smsMessage, 'sms message');
  sendSMS(smsMessage);
  //SMS logic ends here

  //NOTIFICATION logic starts here
  const pushNotificationInput = {
    appointmentId: appointmentData.id,
    notificationType: NotificationType.BOOK_APPOINTMENT,
  };
  const notificationResult = sendNotification(
    pushNotificationInput,
    patientsDb,
    consultsDb,
    doctorsDb
  );
  console.log(notificationResult, 'book appt notification');
  // NOTIFICATION logic ends here

  //EMAIL logic starts here
  const hospitalCity = docDetails.doctorHospital[0].facility.city;
  const apptDate = format(istDateTime, 'dd/MM/yyyy');
  const apptTime = format(istDateTime, 'hh:mm');
  const mailSubject =
    'New Appointment for ' +
    hospitalCity +
    ' Hosp Doctor – ' +
    apptDate +
    ', ' +
    apptTime +
    'hrs, Dr. ' +
    docDetails.firstName +
    ' ' +
    docDetails.lastName;
  let mailContent =
    'New Appointment has been booked on Apollo 247 app with the following details:-';
  mailContent +=
    'Appointment No :-' +
    appointmentData.displayId.toString() +
    '<br>Patient Name :-' +
    patientDetails.firstName +
    '<br>Mobile Number :-' +
    patientDetails.mobileNumber +
    '<br>Doctor Name :-' +
    docDetails.firstName +
    ' ' +
    docDetails.lastName +
    '<br>Doctor Location (ATHS/Hyd Hosp/Chennai Hosp) :-' +
    hospitalCity +
    '<br>Appointment Date :-' +
    format(istDateTime, 'dd/MM/yyyy') +
    '<br>Appointment Slot :-' +
    format(istDateTime, 'hh:mm aa') +
    ' - ' +
    format(addMinutes(istDateTime, 15), 'hh:mm aa') +
    '<br>Mode of Consult :-' +
    appointmentData.appointmentType;

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
  //EMAIL logic ends here
};

export const makeAppointmentPaymentResolvers = {
  Mutation: {
    makeAppointmentPayment,
  },
};
