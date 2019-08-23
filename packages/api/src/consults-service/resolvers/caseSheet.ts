import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { CaseSheet, Appointment } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const caseSheetTypeDefs = gql`
  enum ConsultMode {
    ONLINE
    PHYSICAL
    BOTH
  }

  input CaseSheetInput {
    appointmentId: String
    createdDoctorId: String
  }

  type AppointmentId {
    id: String
  }

  type CaseSheet {
    appointment: AppointmentId
    consultType: String
    diagnosis: String
    diagnosisPrescription: String
    doctorId: String
    followUp: Boolean
    followUpAfterInDays: String
    followUpDate: String
    id: String
    notes: String
    otherInstructions: String
    patientId: String
    symptoms: String
  }

  extend type Mutation {
    createCaseSheet(CaseSheetInput: CaseSheetInput): CaseSheet
  }
`;

type CaseSheetInput = {
  appointmentId: string;
  createdDoctorId: string;
};

type caseSheetInputArgs = { CaseSheetInput: CaseSheetInput };
const createCaseSheet: Resolver<
  null,
  caseSheetInputArgs,
  ConsultServiceContext,
  CaseSheet
> = async (parent, { CaseSheetInput }, { consultsDb, doctorsDb }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);

  //check appointmnet id
  const appointmentData = await appointmentRepo.findById(CaseSheetInput.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //check createdByDoctor id
  if (CaseSheetInput.createdDoctorId.length > 0) {
    const doctordata = await doctorRepository.getDoctorProfileData(CaseSheetInput.createdDoctorId);
    if (doctordata == null) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);
  }

  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const appointment: Partial<Appointment> = {
    id: CaseSheetInput.appointmentId,
  };
  const caseSheetAttrs: Partial<CaseSheet> = {
    ...CaseSheetInput,
    consultType: appointmentData.appointmentType,
    doctorId: appointmentData.doctorId,
    patientId: appointmentData.patientId,
    appointment: <Appointment>appointment,
  };
  return await caseSheetRepo.savecaseSheet(caseSheetAttrs);
};

export const caseSheetResolvers = {
  Mutation: {
    createCaseSheet,
  },
};
