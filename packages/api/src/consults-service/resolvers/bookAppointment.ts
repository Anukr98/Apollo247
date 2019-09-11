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
import { DOCTOR_ONLINE_STATUS, DoctorType } from 'doctors-service/entities';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';
//import { addMinutes, format, addMilliseconds } from 'date-fns';
import _sample from 'lodash/sample';

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
  console.log('current date', new Date());
  console.log(appointmentInput.appointmentDateTime, 'input date time');
  console.log(appointmentInput.appointmentDateTime.toISOString(), 'iso string');
  console.log(new Date(appointmentInput.appointmentDateTime.toISOString()), 'iso to date');

  //check if patient id is valid
  const patient = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patient.findById(appointmentInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  if (patientDetails.dateOfBirth == null || !patientDetails.dateOfBirth) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }

  if (patientDetails.lastName == null || !patientDetails.lastName) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }

  //check if docotr id is valid
  const doctor = doctorsDb.getCustomRepository(DoctorRepository);
  const docDetails = await doctor.findById(appointmentInput.doctorId);
  if (!docDetails) {
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

  console.log(checkHours, 'check hours');

  const appointmentAttrs: Omit<AppointmentBooking, 'id'> = {
    ...appointmentInput,
    status: STATUS.PENDING,
    patientName: patientDetails.firstName + ' ' + patientDetails.lastName,
    appointmentDateTime: new Date(appointmentInput.appointmentDateTime.toISOString()),
    appointmentState: APPOINTMENT_STATE.NEW,
  };
  const appointment = await appts.saveAppointment(appointmentAttrs);
  //message queue starts
  /*const doctorName = docDetails.firstName + '' + docDetails.lastName;
  const speciality = docDetails.specialty.name;
  const istDateTime = addMilliseconds(appointmentInput.appointmentDateTime, 19800000);
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

  (async () => {
    const cqRepo = consultsDb.getCustomRepository(ConsultQueueRepository);
    const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
    const onlineJrDocs = await docRepo.find({
      onlineStatus: DOCTOR_ONLINE_STATUS.ONLINE,
      doctorType: DoctorType.JUNIOR,
    });
    const chosenJrDoc = _sample(onlineJrDocs);
    if (!chosenJrDoc) throw new AphError(AphErrorMessages.NO_ONLINE_DOCTORS);
    const appointmentId = appointment.id;
    const doctorId = chosenJrDoc.id;
    await cqRepo.save(cqRepo.create({ appointmentId, doctorId }));
  })();

  //TODO after junior doctor flow.. casesheet creation should be changed.
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const caseSheetAttrs: Partial<CaseSheet> = {
    consultType: appointment.appointmentType,
    doctorId: appointment.doctorId,
    patientId: appointment.patientId,
    appointment: appointment,
  };
  await caseSheetRepo.savecaseSheet(caseSheetAttrs);
  ///////////

  return { appointment };
};

export const bookAppointmentResolvers = {
  Mutation: {
    bookAppointment,
  },
};
