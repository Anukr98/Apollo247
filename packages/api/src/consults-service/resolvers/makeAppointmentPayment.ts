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
  AppointmentUpdateHistory,
  VALUE_TYPE,
  APPOINTMENT_UPDATED_BY,
} from 'consults-service/entities';
import { initiateRefund } from 'consults-service/helpers/refundHelper';
import { PaytmResponse } from 'types/refundHelperTypes';
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
import { addMilliseconds, format, differenceInSeconds } from 'date-fns';
import {
  sendNotification,
  sendDoctorAppointmentNotification,
} from 'notifications-service/handlers';
import { NotificationType } from 'notifications-service/constants';
import { DoctorType } from 'doctors-service/entities';
import { appointmentPaymentEmailTemplate } from 'helpers/emailTemplates/appointmentPaymentEmailTemplate';
import { log } from 'customWinstonLogger';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';
import { acceptCoupon } from 'helpers/couponServices';
import { AcceptCouponRequest } from 'types/coupons';
import { updateDoctorSlotStatusES } from 'doctors-service/entities/doctorElastic';

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
    partnerInfo: String
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
  partnerInfo: string;
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
  const currentStatus = processingAppointment.status;
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
    paymentInputUpdates.responseCode = paymentInput.responseCode;
    paymentInputUpdates.responseMessage = paymentInput.responseMessage;
    paymentInputUpdates.bankName = paymentInput.bankName;
    paymentInputUpdates.paymentStatus = paymentInput.paymentStatus;
    paymentInputUpdates.bankTxnId = paymentInput.bankTxnId;
    paymentInputUpdates.paymentDateTime = paymentInput.paymentDateTime;
    paymentInputUpdates.orderId = paymentInput.orderId;
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
  let appointmentStatus = STATUS.PENDING;

  //update appointment status to PENDING
  if (paymentInput.paymentStatus == 'TXN_SUCCESS') {
    if (processingAppointment.couponCode) {
      const patient = patientsDb.getCustomRepository(PatientRepository);
      const patientDetails = await patient.getPatientDetails(processingAppointment.patientId);
      if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
      const payload: AcceptCouponRequest = {
        mobile: patientDetails.mobileNumber.replace('+91', ''),
        coupon: processingAppointment.couponCode,
      };
      await acceptCoupon(payload);
    }

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
      await apptsRepo.systemCancelAppointment(
        processingAppointment.id,
        { paymentInfo },
        processingAppointment
      );
      let isRefunded: boolean = false;
      if (paymentInfo.amountPaid && paymentInfo.amountPaid >= 1) {
        let refundResponse = await initiateRefund(
          {
            appointment: processingAppointment,
            appointmentPayments: paymentInfo,
            refundAmount: paymentInfo.amountPaid,
            txnId: paymentInfo.paymentRefId,
            orderId: processingAppointment.paymentOrderId,
          },
          consultsDb
        );

        paymentInfo.appointment = processingAppointment;
        refundResponse = refundResponse as PaytmResponse;
        if (refundResponse.refundId) {
          sendNotification(
            {
              appointmentId: processingAppointment.id,
              notificationType: NotificationType.APPOINTMENT_PAYMENT_REFUND,
            },
            patientsDb,
            consultsDb,
            doctorsDb
          );
          isRefunded = true;
        } else {
          log(
            'consultServiceLogger',
            'Refund failed makeAppointmentPayment',
            'makeAppointmentPayment()',
            JSON.stringify(refundResponse),
            'true'
          );
        }
      }

      return {
        appointment: paymentInfo,
        isRefunded: isRefunded,
      };
    }

    //cannot remove this from here
    updateDoctorSlotStatusES(
      processingAppointment.doctorId,
      processingAppointment.appointmentType,
      ES_DOCTOR_SLOT_STATUS.BOOKED,
      processingAppointment.appointmentDateTime,
      processingAppointment
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

    //autosubmit case sheet code starts
    const currentTime = new Date();
    const timeDifference = differenceInSeconds(
      processingAppointment.appointmentDateTime,
      currentTime
    );

    //submit casesheet if skipAutoQuestions:false, isJdrequired = false
    const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
    const doctorDets = await doctorRepo.findById(processingAppointment.doctorId);
    let submitFlag = 0;

    let notes = ApiConstants.APPOINTMENT_BOOKED_WITHIN_10_MIN.toString().replace(
      '{0}',
      ApiConstants.AUTO_SUBMIT_CASESHEET_TIME_APPOINMENT.toString()
    );
    if (doctorDets && doctorDets.skipAutoQuestions == true && doctorDets.isJdAllowed == false) {
      submitFlag = 1;
      notes = ApiConstants.APPOINTMENT_BOOKED_SKIP_QUESTIONS.toString();
    }
    if (
      timeDifference / 60 <=
        parseInt(ApiConstants.AUTO_SUBMIT_CASESHEET_TIME_APPOINMENT.toString(), 10) ||
      submitFlag == 1
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
        notes,
        isJdConsultStarted: true,
      };

      caseSheetRepo.savecaseSheet(casesheetAttrs);
      processingAppointment.isConsultStarted = true;
      processingAppointment.isJdQuestionsComplete = true;
      const historyAttrs: Partial<AppointmentUpdateHistory> = {
        appointment: processingAppointment,
        userType: APPOINTMENT_UPDATED_BY.PATIENT,
        fromValue: currentStatus,
        toValue: STATUS.PENDING,
        fromState: processingAppointment.appointmentState,
        toState: processingAppointment.appointmentState,
        valueType: VALUE_TYPE.STATUS,
        userName: processingAppointment.patientId,
        reason: ApiConstants.APPOINTMENT_AUTO_SUBMIT_HISTORY.toString(),
      };
      apptsRepo.saveAppointmentHistory(historyAttrs);
    } else {
      const historyAttrs: Partial<AppointmentUpdateHistory> = {
        appointment: processingAppointment,
        userType: APPOINTMENT_UPDATED_BY.PATIENT,
        fromValue: currentStatus,
        toValue: STATUS.PENDING,
        valueType: VALUE_TYPE.STATUS,
        fromState: processingAppointment.appointmentState,
        toState: processingAppointment.appointmentState,
        userName: processingAppointment.patientId,
        reason: ApiConstants.BOOK_APPOINTMENT_HISTORY_REASON.toString(),
      };
      apptsRepo.saveAppointmentHistory(historyAttrs);
    }
  } else if (paymentInput.paymentStatus == 'TXN_FAILURE') {
    const historyAttrs: Partial<AppointmentUpdateHistory> = {
      appointment: processingAppointment,
      userType: APPOINTMENT_UPDATED_BY.PATIENT,
      fromValue: STATUS.PAYMENT_PENDING,
      toValue: STATUS.PAYMENT_FAILED,
      fromState: processingAppointment.appointmentState,
      toState: processingAppointment.appointmentState,
      valueType: VALUE_TYPE.STATUS,
      userName: processingAppointment.patientId,
    };
    apptsRepo.saveAppointmentHistory(historyAttrs);
    if (paymentInput.responseCode == '141' || paymentInput.responseCode == '810') {
      appointmentStatus = STATUS.PAYMENT_ABORTED;
    } else {
      appointmentStatus = STATUS.PAYMENT_FAILED;

      if (paymentInfo.paymentStatus === 'PENDING') {
        //NOTIFICATION logic starts here
        sendNotification(
          {
            appointmentId: processingAppointment.id,
            notificationType: NotificationType.PAYMENT_PENDING_FAILURE,
          },
          patientsDb,
          consultsDb,
          doctorsDb
        );
        const historyAttrs: Partial<AppointmentUpdateHistory> = {
          appointment: processingAppointment,
          userType: APPOINTMENT_UPDATED_BY.PATIENT,
          fromValue: STATUS.PAYMENT_PENDING,
          toValue: STATUS.PAYMENT_PENDING_PG,
          fromState: processingAppointment.appointmentState,
          toState: processingAppointment.appointmentState,
          valueType: VALUE_TYPE.STATUS,
          userName: processingAppointment.patientId,
        };
        apptsRepo.saveAppointmentHistory(historyAttrs);
      }
    }
  } else if (paymentInput.paymentStatus == 'PENDING') {
    appointmentStatus = STATUS.PAYMENT_PENDING_PG;
  }

  paymentInfo.paymentStatus = paymentInput.paymentStatus;
  paymentInfo.responseCode = paymentInput.responseCode;
  paymentInfo.responseMessage = paymentInput.responseMessage;
  paymentInfo.partnerInfo = paymentInput.partnerInfo;
  await apptsRepo.updateAppointment(
    processingAppointment.id,
    {
      status: appointmentStatus,
      paymentInfo,
    },
    processingAppointment
  );
  processingAppointment.status = appointmentStatus;
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
  const patientDetails = await patient.getPatientDetails(appointmentData.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const istDateTime = addMilliseconds(appointmentData.appointmentDateTime, 19800000);

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
  sendDoctorAppointmentNotification(
    appointmentData.appointmentDateTime,
    appointmentData.patientName,
    appointmentData.id,
    appointmentData.doctorId,
    doctorsDb
  );
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
