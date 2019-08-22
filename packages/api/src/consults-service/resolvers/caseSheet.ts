import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { CaseSheet, Appointment } from 'consults-service/entities';
import { ConsultMode } from 'doctors-service/entities';

export const caseSheetTypeDefs = gql`
  enum ConsultMode {
    ONLINE
    PHYSICAL
    BOTH
  }

  input CaseSheetInput {
    patientId: String
    consultType: ConsultMode
    appointmentId: String
    createdDoctorId: String
    doctorId: String
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
  patientId: string;
  consultType: ConsultMode;
  appointmentId: string;
  createdDoctorId: string;
  doctorId: string;
};

type caseSheetInputArgs = { CaseSheetInput: CaseSheetInput };
const createCaseSheet: Resolver<
  null,
  caseSheetInputArgs,
  ConsultServiceContext,
  CaseSheet
> = async (parent, { CaseSheetInput }, { consultsDb }) => {
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);

  const appointment: Partial<Appointment> = {
    id: CaseSheetInput.appointmentId,
  };
  const caseSheetAttrs: Partial<CaseSheet> = {
    ...CaseSheetInput,
    appointment: <Appointment>appointment,
  };
  return await caseSheetRepo.savecaseSheet(caseSheetAttrs);
};

export const caseSheetResolvers = {
  Mutation: {
    createCaseSheet,
  },
};
