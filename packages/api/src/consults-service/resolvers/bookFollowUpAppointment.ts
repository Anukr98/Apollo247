import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { STATUS, APPOINTMENT_TYPE, APPOINTMENT_STATE } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorHospitalRepository } from 'doctors-service/repositories/doctorHospitalRepository';
//import { AphMqClient, AphMqMessage, AphMqMessageTypes } from 'AphMqClient';
//import { AppointmentPayload } from 'types/appointmentTypes';
//import { addMinutes, format } from 'date-fns';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';

export const bookFollowUpAppointmentTypeDefs = gql`
  type FollowUpAppointmentBooking {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    status: STATUS!
    patientName: String!
    appointmentState: APPOINTMENT_STATE
    isFollowUp: Int
    followUpParentId: String!
  }

  input BookFollowUpAppointmentInput {
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    followUpParentId: ID!
  }

  type BookFollowUpAppointmentResult {
    appointment: FollowUpAppointmentBooking
  }

  extend type Mutation {
    bookFollowUpAppointment(
      followUpAppointmentInput: BookFollowUpAppointmentInput
    ): BookFollowUpAppointmentResult!
  }

  extend type Query {
    checkIfFollowUpBooked(appointmentId: String): Int!
  }
`;

type BookFollowUpAppointmentResult = {
  appointment: FollowUpAppointmentBooking;
};

type BookFollowUpAppointmentInput = {
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
  followUpParentId: string;
};

type FollowUpAppointmentBooking = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
  status: STATUS;
  patientName: string;
  appointmentState: APPOINTMENT_STATE;
  isFollowUp: Boolean;
  followUpParentId: string;
  isFollowPaid: Boolean;
};

type FollowUpAppointmentInputArgs = { followUpAppointmentInput: BookFollowUpAppointmentInput };

const bookFollowUpAppointment: Resolver<
  null,
  FollowUpAppointmentInputArgs,
  ConsultServiceContext,
  BookFollowUpAppointmentResult
> = async (parent, { followUpAppointmentInput }, { consultsDb, doctorsDb, patientsDb }) => {
  //check if patient id is valid
  const patient = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patient.getPatientDetails(followUpAppointmentInput.patientId);
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
  const docDetails = await doctor.findById(followUpAppointmentInput.doctorId);
  if (!docDetails) {
    throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  }

  //check if docotr and hospital are matched
  const facilityId = followUpAppointmentInput.hospitalId;
  if (facilityId) {
    const doctorHospRepo = doctorsDb.getCustomRepository(DoctorHospitalRepository);
    const docHospital = await doctorHospRepo.findDoctorHospital(
      followUpAppointmentInput.doctorId,
      facilityId
    );
    if (!docHospital) {
      throw new AphError(AphErrorMessages.INVALID_FACILITY_ID, undefined, {});
    }
  }

  //check if given appointment datetime is greater than current date time
  if (followUpAppointmentInput.appointmentDateTime <= new Date()) {
    throw new AphError(AphErrorMessages.APPOINTMENT_BOOK_DATE_ERROR, undefined, {});
  }

  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  //check parent appointment
  const parentApptDetails = await appts.findById(followUpAppointmentInput.followUpParentId);
  if (!parentApptDetails) {
    throw new AphError(AphErrorMessages.INVALID_PARENT_APPOINTMENT_ID, undefined, {});
  }

  //check if doctor slot is blocked
  const blockRepo = doctorsDb.getCustomRepository(BlockedCalendarItemRepository);
  const slotDetails = await blockRepo.checkIfSlotBlocked(
    followUpAppointmentInput.appointmentDateTime,
    followUpAppointmentInput.doctorId
  );
  if (slotDetails[0]) {
    throw new AphError(AphErrorMessages.DOCTOR_SLOT_BLOCKED, undefined, {});
  }

  const apptCount = await appts.checkIfAppointmentExist(
    followUpAppointmentInput.doctorId,
    followUpAppointmentInput.appointmentDateTime
  );

  if (apptCount > 0) {
    throw new AphError(AphErrorMessages.APPOINTMENT_EXIST_ERROR, undefined, {});
  }

  const patientConsults = await appts.checkPatientConsults(
    followUpAppointmentInput.patientId,
    followUpAppointmentInput.appointmentDateTime
  );
  if (patientConsults) {
    throw new AphError(AphErrorMessages.ANOTHER_DOCTOR_APPOINTMENT_EXIST, undefined, {});
  }

  let isFollowPaid: Boolean = false;
  const followUpCount = await appts.followUpBookedCount(followUpAppointmentInput.followUpParentId);
  isFollowPaid = followUpCount > 1 ? true : false;
  const appointmentAttrs: Omit<FollowUpAppointmentBooking, 'id'> = {
    ...followUpAppointmentInput,
    status: STATUS.PENDING,
    patientName: patientDetails.firstName + ' ' + patientDetails.lastName,
    isFollowUp: true,
    isFollowPaid,
    appointmentState: APPOINTMENT_STATE.NEW,
    appointmentDateTime: new Date(followUpAppointmentInput.appointmentDateTime.toISOString()),
  };
  const appointment = await appts.saveAppointment(appointmentAttrs);

  //copy parent case-sheet details
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const caseSheetDetails = await caseSheetRepo.getCaseSheetByAppointmentId(
    followUpAppointmentInput.followUpParentId
  );

  if (caseSheetDetails != null) {
    caseSheetDetails.forEach(async (caseSheetRecord) => {
      const caseSheetRow = {
        ...caseSheetRecord,
        appointment,
      };
      delete caseSheetRow.id;
      await caseSheetRepo.savecaseSheet(caseSheetRow);
    });
  }
  //case-sheet copy ends

  return { appointment };
};

const checkIfFollowUpBooked: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  number
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const followUpCount = await appointmentRepo.followUpBookedCount(args.appointmentId);
  return followUpCount;
};

export const bookFollowUpAppointmentResolvers = {
  Mutation: {
    bookFollowUpAppointment,
  },
  Query: {
    checkIfFollowUpBooked,
  },
};
