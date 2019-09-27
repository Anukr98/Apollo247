import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { STATUS, APPOINTMENT_TYPE, CaseSheet, APPOINTMENT_STATE } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorHospitalRepository } from 'doctors-service/repositories/doctorHospitalRepository';
//import { AphMqClient, AphMqMessage, AphMqMessageTypes } from 'AphMqClient';
//import { AppointmentPayload } from 'types/appointmentTypes';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
//import { addMinutes, format, addMilliseconds } from 'date-fns';
import { sendSMS } from 'notifications-service/resolvers/notifications';
import { ApiConstants } from 'ApiConstants';
import { addMilliseconds, format } from 'date-fns';
import { sendNotification, NotificationType } from 'notifications-service/resolvers/notifications';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';

export const bookAppointmentTypeDefs = gql`
  enum STATUS {
    IN_PROGRESS
    CONFIRMED
    CANCELLED
    COMPLETED
    PENDING
    PAYMENT_PENDING
    NO_SHOW
  }

  enum APPOINTMENT_TYPE {
    ONLINE
    PHYSICAL
  }

  type AppointmentBooking {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    status: STATUS!
    patientName: String!
    appointmentState: APPOINTMENT_STATE!
  }

  type AppointmentBookingResult {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    status: STATUS!
    patientName: String!
    appointmentState: APPOINTMENT_STATE!
    displayId: Int!
  }

  input BookAppointmentInput {
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
  }

  type BookAppointmentResult {
    appointment: AppointmentBookingResult
  }

  extend type Mutation {
    bookAppointment(appointmentInput: BookAppointmentInput): BookAppointmentResult!
  }
`;

type BookAppointmentResult = {
  appointment: AppointmentBookingResult;
};

type BookAppointmentInput = {
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
};

type AppointmentBooking = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
  status: STATUS;
  patientName: string;
  appointmentState: APPOINTMENT_STATE;
};

type AppointmentBookingResult = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
  status: STATUS;
  patientName: string;
  appointmentState: APPOINTMENT_STATE;
  displayId: number;
};

type AppointmentInputArgs = { appointmentInput: BookAppointmentInput };

const bookAppointment: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  BookAppointmentResult
> = async (parent, { appointmentInput }, { consultsDb, doctorsDb, patientsDb }) => {
  //check if patient id is valid
  const patient = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patient.findById(appointmentInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  /*if (patientDetails.dateOfBirth == null || !patientDetails.dateOfBirth) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }

  if (patientDetails.lastName == null || !patientDetails.lastName) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }*/

  //check if docotr id is valid
  const doctor = doctorsDb.getCustomRepository(DoctorRepository);
  const docDetails = await doctor.findById(appointmentInput.doctorId);
  if (!docDetails) {
    throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  }

  //check if doctor is junior doctor
  const isJunior = await doctor.isJuniorDoctor(appointmentInput.doctorId);
  if (isJunior) {
    throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  }

  //check if docotr and hospital are matched
  const facilityId = appointmentInput.hospitalId;
  if (facilityId) {
    const doctorHospRepo = doctorsDb.getCustomRepository(DoctorHospitalRepository);
    const docHospital = await doctorHospRepo.findDoctorHospital(
      appointmentInput.doctorId,
      facilityId
    );
    if (!docHospital) {
      throw new AphError(AphErrorMessages.INVALID_FACILITY_ID, undefined, {});
    }
  }

  //check if doctor slot is blocked
  const blockRepo = doctorsDb.getCustomRepository(BlockedCalendarItemRepository);
  const recCount = await blockRepo.checkIfSlotBlocked(
    appointmentInput.appointmentDateTime,
    appointmentInput.doctorId
  );

  if (recCount > 0) {
    throw new AphError(AphErrorMessages.DOCTOR_SLOT_BLOCKED, undefined, {});
  }

  //check if given appointment datetime is greater than current date time
  if (appointmentInput.appointmentDateTime <= new Date()) {
    throw new AphError(AphErrorMessages.APPOINTMENT_BOOK_DATE_ERROR, undefined, {});
  }

  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const apptCount = await appts.checkIfAppointmentExist(
    appointmentInput.doctorId,
    appointmentInput.appointmentDateTime
  );
  if (apptCount > 0) {
    throw new AphError(AphErrorMessages.APPOINTMENT_EXIST_ERROR, undefined, {});
  }

  const checkHours = await appts.checkWithinConsultHours(
    appointmentInput.appointmentDateTime,
    appointmentInput.appointmentType,
    appointmentInput.doctorId,
    doctorsDb
  );

  if (!checkHours) {
    throw new AphError(AphErrorMessages.OUT_OF_CONSULT_HOURS, undefined, {});
  }

  const appointmentAttrs: Omit<AppointmentBooking, 'id'> = {
    ...appointmentInput,
    status: STATUS.PENDING,
    patientName: patientDetails.firstName + ' ' + patientDetails.lastName,
    appointmentDateTime: new Date(appointmentInput.appointmentDateTime.toISOString()),
    appointmentState: APPOINTMENT_STATE.NEW,
  };
  const appointment = await appts.saveAppointment(appointmentAttrs);
  let smsMessage = ApiConstants.BOOK_APPOINTMENT_SMS_MESSAGE.replace(
    '{0}',
    patientDetails.firstName
  );
  smsMessage = smsMessage.replace('{1}', appointment.displayId.toString());
  smsMessage = smsMessage.replace('{2}', docDetails.firstName + ' ' + docDetails.lastName);
  const istDateTime = addMilliseconds(appointmentInput.appointmentDateTime, 19800000);
  const smsDate = format(istDateTime, 'dd-MM-yyyy HH:mm');
  smsMessage = smsMessage.replace('{3}', smsDate.toString());
  smsMessage = smsMessage.replace('at {4}', '');
  console.log(smsMessage, 'sms message');
  sendSMS(smsMessage);
  // send notification
  const pushNotificationInput = {
    appointmentId: appointment.id,
    notificationType: NotificationType.BOOK_APPOINTMENT,
  };
  const notificationResult = sendNotification(
    pushNotificationInput,
    patientsDb,
    consultsDb,
    doctorsDb
  );
  console.log(notificationResult, 'book appt notification');
  //message queue starts
  /*const doctorName = docDetails.firstName + '' + docDetails.lastName;
  const speciality = docDetails.specialty.name;
  
  const aptEndTime = addMinutes(istDateTime, 15);
  console.log(istDateTime, aptEndTime);
  const slotTime = format(istDateTime, 'HH:mm') + '-' + format(aptEndTime, 'HH:mm');
  let patientDob: string = '01/08/1996';
  if (patientDetails.dateOfBirth !== null) {
    console.log(patientDetails.dateOfBirth.toString(), 'dob');
    patientDob = format(patientDetails.dateOfBirth, 'dd/MM/yyyy');
  }

  const payload: AppointmentPayload = {
    appointmentDate: format(appointmentInput.appointmentDateTime, 'dd/MM/yyyy'),
    appointmentTypeId: 1,
    askApolloReferenceIdForRelation: '52478bae-fab8-49ba-8f75-fce0e1a9f3ae',
    askApolloReferenceIdForSelf: '52478bae-fab8-49ba-8f75-fce0e1a9f3ae',
    cityId: 1,
    cityName: 'Chennai',
    dateOfBirth: patientDob,
    doctorId: 100,
    doctorName,
    gender: '1',
    hospitalId: '2',
    hospitalName: 'Apollo Hospitals Greams Road Chennai',
    leadSource: 'One Apollo-IOS',
    patientEmailId: patientDetails.emailAddress,
    patientFirstName: patientDetails.firstName,
    patientLastName: patientDetails.lastName,
    patientMobileNo: patientDetails.mobileNumber.substr(3),
    patientUHID: '',
    relationTypeId: 1,
    salutation: 1,
    slotId: '-1',
    slotTime,
    speciality,
    specialityId: '1898',
    userFirstName: patientDetails.firstName,
    userLastName: patientDetails.lastName,
    apptIdPg: appointment.id,
  };
  AphMqClient.connect();
  type TestMessage = AphMqMessage<AphMqMessageTypes.BOOKAPPOINTMENT, AppointmentPayload>;
  const testMessage: TestMessage = {
    type: AphMqMessageTypes.BOOKAPPOINTMENT,
    payload,
  };

  AphMqClient.send(testMessage);*/
  //message queue ends

  return { appointment };
};

export const bookAppointmentResolvers = {
  Mutation: {
    bookAppointment,
  },
};
