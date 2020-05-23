import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  Appointment,
  AppointmentPayments,
  STATUS,
  PAYMENT_METHODS,
  PAYMENT_METHODS_REVERSE,
  APPOINTMENT_PAYMENT_TYPE,
  ES_DOCTOR_SLOT_STATUS,
  CASESHEET_STATUS,
} from 'consults-service/entities';
import { initiateRefund } from 'consults-service/helpers/refundHelper';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Connection } from 'typeorm';
import { sendMail } from 'notifications-service/resolvers/email';
import { EmailMessage } from 'types/notificationMessageTypes';
import { ApiConstants } from 'ApiConstants';
import { addMilliseconds, format, addDays, differenceInSeconds } from 'date-fns';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';

import { DoctorType } from 'doctors-service/entities';
import { appointmentPaymentEmailTemplate } from 'helpers/emailTemplates/appointmentPaymentEmailTemplate';
import { log } from 'customWinstonLogger';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';

export const makeAppointmentPaymentTypeDefs = gql`
  enum APPOINTMENT_PAYMENT_TYPE {
    ONLINE
  }

  enum PAYMENT_METHODS {
    DC
    CC
    NB
    PPI
    EMI
    UPI
    PAYTMCC
    COD
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
    bankName: String
    refundAmount: Float
    paymentMode: PAYMENT_METHODS
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
    appointment: Appointment
  }

  type AppointmentPaymentResult {
    appointment: AppointmentPayment
    isRefunded: Boolean
  }

  extend type Mutation {
    makeAppointmentPayment(paymentInput: AppointmentPaymentInput): AppointmentPaymentResult!
  }
`;

type AppointmentPaymentResult = {
  appointment: AppointmentPayment;
  isRefunded: boolean;
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
  appointment: Appointment;
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
  bankName: string;
  refundAmount: number;
  paymentMode: PAYMENT_METHODS_REVERSE;
};

type AppointmentInputArgs = { paymentInput: AppointmentPaymentInput };

const makeAppointmentPayment: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  AppointmentPaymentResult
> = async (parent, { paymentInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  log(
    'consultServiceLogger',
    'payload received',
    'makeAppointmentPayment()',
    JSON.stringify(paymentInput),
    ''
  );
  let processingAppointment;
  if (paymentInput.amountPaid == 0 || paymentInput.amountPaid == 0.0) {
    processingAppointment = await apptsRepo.findByIdAndStatus(
      paymentInput.orderId,
      STATUS.PAYMENT_PENDING
    );

    if (!processingAppointment) {
      throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
    }
  } else {
    processingAppointment = await apptsRepo.findByPaymentOrderId(paymentInput.orderId);
    if (!processingAppointment) {
      log(
        'consultServiceLogger',
        'Could not find the order id',
        'makeAppointmentPayment()',
        `paymentOrderId - ${paymentInput.orderId}`,
        'true'
      );
      throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
    }
  }

  //insert payment details

  let paymentInfo = await apptsRepo.findAppointmentPayment(processingAppointment.id);
  let paymentMode: string = '';
  if (paymentInput.paymentMode) paymentMode = PAYMENT_METHODS[paymentInput.paymentMode];
  if (paymentInfo) {
    log(
      'consultServiceLogger',
      'Appointment payment Info already exists',
      'makeAppointmentPayment()',
      `${JSON.stringify(paymentInfo)}`,
      ''
    );

    if (
      processingAppointment.status !== STATUS.PAYMENT_PENDING &&
      processingAppointment.status !== STATUS.PAYMENT_PENDING_PG
    ) {
      paymentInfo.appointment = processingAppointment;
      return { appointment: paymentInfo, isRefunded: false };
    }
    const paymentInputUpdates: Partial<AppointmentPaymentInput> = {};
    paymentInputUpdates.responseCode = paymentInfo.responseCode;
    paymentInputUpdates.responseMessage = paymentInfo.responseMessage;
    paymentInputUpdates.bankName = paymentInfo.bankName;
    paymentInputUpdates.paymentStatus = paymentInfo.paymentStatus;
    paymentInputUpdates.bankTxnId = paymentInfo.bankTxnId;
    paymentInputUpdates.paymentDateTime = paymentInfo.paymentDateTime;
    paymentInputUpdates.orderId = paymentInfo.orderId;
    if (paymentMode) paymentInputUpdates.paymentMode = paymentMode as PAYMENT_METHODS_REVERSE;
    await apptsRepo.updateAppointmentPayment(paymentInfo.id, paymentInputUpdates);
  } else {
    const apptPaymentAttrs: Partial<AppointmentPayments> = paymentInput;
    apptPaymentAttrs.appointment = processingAppointment;
    apptPaymentAttrs.paymentType = APPOINTMENT_PAYMENT_TYPE.ONLINE;
    if (paymentMode) apptPaymentAttrs.paymentMode = paymentMode as PAYMENT_METHODS_REVERSE;
    paymentInfo = await apptsRepo.saveAppointmentPayment(apptPaymentAttrs);
  }
  delete paymentInfo.appointment;

  //update appointment status to PENDING
  if (paymentInput.paymentStatus == 'TXN_SUCCESS') {
    //check if any appointment already exists in this slot before confirming payment
    const apptCount = await apptsRepo.checkIfAppointmentExistWithId(
      processingAppointment.doctorId,
      processingAppointment.appointmentDateTime,
      processingAppointment.id
    );

    if (apptCount > 0) {
      log(
        'consultServiceLogger',
        'Appointment already exists',
        'makeAppointmentPayment()',
        `${JSON.stringify(processingAppointment)}`,
        'true'
      );
      await initiateRefund(
        {
          appointment: processingAppointment,
          appointmentPayments: paymentInfo,
          refundAmount: paymentInfo.amountPaid,
          txnId: paymentInfo.paymentRefId,
          orderId: processingAppointment.paymentOrderId,
        },
        consultsDb
      );
      await apptsRepo.systemCancelAppointment(processingAppointment.id);
      paymentInfo.appointment = processingAppointment;
      sendNotification({
        appointmentId: processingAppointment.id,
        notificationType: NotificationType.APPOINTMENT_PAYMENT_REFUND
      }
        , patientsDb
        , consultsDb
        , doctorsDb
      )
      return {
        appointment: paymentInfo,
        isRefunded: true,
      };
    }

    const slotApptDt =
      format(processingAppointment.appointmentDateTime, 'yyyy-MM-dd') + ' 18:30:00';
    const actualApptDt = format(processingAppointment.appointmentDateTime, 'yyyy-MM-dd');
    let apptDt = format(processingAppointment.appointmentDateTime, 'yyyy-MM-dd');
    if (processingAppointment.appointmentDateTime >= new Date(slotApptDt)) {
      apptDt = format(addDays(new Date(apptDt), 1), 'yyyy-MM-dd');
    }

    const sl = `${actualApptDt}T${processingAppointment.appointmentDateTime
      .getUTCHours()
      .toString()
      .padStart(2, '0')}:${processingAppointment.appointmentDateTime
      .getUTCMinutes()
      .toString()
      .padStart(2, '0')}:00.000Z`;
    console.log(slotApptDt, apptDt, sl, processingAppointment.doctorId, 'appoint date time');
    apptsRepo.updateDoctorSlotStatusES(
      processingAppointment.doctorId,
      apptDt,
      sl,
      processingAppointment.appointmentType,
      ES_DOCTOR_SLOT_STATUS.BOOKED
    );

    //Send booking confirmation SMS,EMAIL & NOTIFICATION to patient
    sendPatientAcknowledgements(
      processingAppointment,
      consultsDb,
      doctorsDb,
      patientsDb,
      paymentInput
    );

    //update appointment status
    //apptsRepo.updateAppointmentStatusUsingOrderId(paymentInput.orderId, STATUS.PENDING, false);
    await apptsRepo.updateAppointment(processingAppointment.id, {
      status: STATUS.PENDING,
      paymentInfo,
    });

    //autosubmit case sheet code starts
    const currentTime = new Date();
    const timeDifference = differenceInSeconds(
      processingAppointment.appointmentDateTime,
      currentTime
    );

    if (
      timeDifference / 60 <=
      parseInt(ApiConstants.AUTO_SUBMIT_CASESHEET_TIME_APPOINMENT.toString(), 10)
    ) {
      const consultQueueRepo = consultsDb.getCustomRepository(ConsultQueueRepository);
      const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);

      const virtualJDId = process.env.VIRTUAL_JD_ID;

      //Insert consult queue item record
      const consultQueueAttrs = {
        appointmentId: processingAppointment.id,
        createdDate: currentTime,
        doctorId: virtualJDId,
        isActive: false,
      };
      consultQueueRepo.save(consultQueueRepo.create(consultQueueAttrs));

      //Insert case sheet record
      const casesheetAttrs = {
        createdDate: currentTime,
        consultType: processingAppointment.appointmentType,
        createdDoctorId: process.env.VIRTUAL_JD_ID,
        doctorType: DoctorType.JUNIOR,
        doctorId: processingAppointment.doctorId,
        patientId: processingAppointment.patientId,
        appointment: processingAppointment,
        status: CASESHEET_STATUS.COMPLETED,
        notes: ApiConstants.APPOINTMENT_BOOKED_WITHIN_10_MIN.toString().replace(
          '{0}',
          ApiConstants.AUTO_SUBMIT_CASESHEET_TIME_APPOINMENT.toString()
        ),
      };
      caseSheetRepo.savecaseSheet(casesheetAttrs);
      apptsRepo.updateJdQuestionStatusbyIds([processingAppointment.id]);
    }
  } else if (paymentInput.paymentStatus == 'TXN_FAILURE') {
    await apptsRepo.updateAppointment(processingAppointment.id, {
      status: STATUS.PAYMENT_FAILED,
      paymentInfo,
    });
  } else if (paymentInput.paymentStatus == 'PENDING') {
    await apptsRepo.updateAppointment(processingAppointment.id, {
      status: STATUS.PAYMENT_PENDING_PG,
      paymentInfo,
    });
  }
  paymentInfo.appointment = processingAppointment;
  return { appointment: paymentInfo, isRefunded: false };
};

const sendPatientAcknowledgements = async (
  appointmentData: Appointment,
  consultsDb: Connection,
  doctorsDb: Connection,
  patientsDb: Connection,
  paymentInput: AppointmentPaymentInput
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
  //let smsMessage = ApiConstants.BOOK_APPOINTMENT_SMS_MESSAGE.replace(
  //'{0}',
  //patientDetails.firstName
  //);
  //smsMessage = smsMessage.replace('{1}', appointmentData.displayId.toString());
  //smsMessage = smsMessage.replace('{2}', docDetails.firstName + ' ' + docDetails.lastName);
  const istDateTime = addMilliseconds(appointmentData.appointmentDateTime, 19800000);
  //const smsDate = format(istDateTime, 'dd-MM-yyyy HH:mm');
  //smsMessage = smsMessage.replace('{3}', smsDate.toString());
  //smsMessage = smsMessage.replace('at {4}', '');
  //console.log(smsMessage, 'sms message');
  //sendSMS(smsMessage);
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

  const hospitalCity = docDetails.doctorHospital[0].facility.city;
  let displayHospitalCity;
  const apptDate = format(istDateTime, 'dd/MM/yyyy');
  const apptTime = format(istDateTime, 'hh:mm');

  let subjectLine = ApiConstants.APPOINTMENT_PAYMENT_SUBJECT.replace('{0}', hospitalCity);
  if (docDetails.doctorType == DoctorType.PAYROLL) {
    if (hospitalCity) {
      subjectLine = ApiConstants.APPOINTMENT_PAYMENT_SUBJECT.replace(
        '{0}',
        'ATHS' + '&nbsp;' + hospitalCity
      );
      displayHospitalCity = 'ATHS' + '&nbsp;' + hospitalCity;
    } else {
      subjectLine = ApiConstants.APPOINTMENT_PAYMENT_SUBJECT.replace('{0}', 'ATHS');
      displayHospitalCity = hospitalCity;
    }
  } else if (docDetails.doctorType == DoctorType.APOLLO) {
    subjectLine = ApiConstants.APPOINTMENT_PAYMENT_SUBJECT.replace('{0}', hospitalCity);
    displayHospitalCity = hospitalCity;
  }

  const apptTimeFormat = format(istDateTime, 'hh:mm aa');
  const mailContent = appointmentPaymentEmailTemplate({
    displayId: appointmentData.displayId.toString(),
    firstName: patientDetails.firstName,
    mobileNumber: patientDetails.mobileNumber,
    uhid: patientDetails.uhid,
    amountPaid: paymentInput.amountPaid,
    emailId: patientDetails.emailAddress,
    docfirstName: docDetails.firstName,
    doclastName: docDetails.lastName,
    hospitalcity: displayHospitalCity,
    appointmentType: appointmentData.appointmentType,
    apptDate,
    apptTimeFormat,
  });

  subjectLine = subjectLine.replace('{1}', apptDate);
  subjectLine = subjectLine.replace('{2}', apptTime);
  subjectLine = subjectLine.replace('{3}', docDetails.firstName);
  subjectLine = subjectLine.replace('{4}', docDetails.lastName);

  const subject =
    process.env.NODE_ENV == 'production'
      ? subjectLine
      : subjectLine + ' from ' + process.env.NODE_ENV;

  const toEmailId = process.env.BOOK_APPT_TO_EMAIL ? process.env.BOOK_APPT_TO_EMAIL : '';
  const ccEmailIds =
    process.env.NODE_ENV == 'dev' ||
    process.env.NODE_ENV == 'development' ||
    process.env.NODE_ENV == 'local'
      ? ApiConstants.PATIENT_APPT_CC_EMAILID
      : ApiConstants.PATIENT_APPT_CC_EMAILID_PRODUCTION;
  const emailContent: EmailMessage = {
    ccEmail: <string>ccEmailIds.toString(),
    toEmail: <string>toEmailId.toString(),
    subject: subject,
    fromEmail: <string>ApiConstants.PATIENT_HELP_FROM_EMAILID.toString(),
    fromName: <string>ApiConstants.PATIENT_HELP_FROM_NAME.toString(),
    messageContent: <string>mailContent,
  };
  sendMail(emailContent);
  //EMAIL logic ends here
};

export const makeAppointmentPaymentResolvers = {
  Mutation: {
    makeAppointmentPayment,
  },
};
