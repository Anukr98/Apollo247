import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientFeedback, FEEDBACKTYPE } from 'profiles-service/entities';
import { PatientFeedbackRepository } from 'profiles-service/repositories/patientFeedbackRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const addPatientFeedbackTypeDefs = gql`
  enum FEEDBACKTYPE {
    CONSULT
    PHARMACY
    DIAGNOSTICS
  }

  input PatientFeedbackInput {
    patientId: ID!
    rating: String
    thankyouNote: String
    reason: String
    feedbackType: FEEDBACKTYPE
  }

  type AddPatientFeedbackResult {
    status: Boolean
  }

  extend type Mutation {
    addPatientFeedback(patientFeedbackInput: PatientFeedbackInput): AddPatientFeedbackResult!
  }
`;

type PatientFeedbackInput = {
  patientId: string;
  rating: string;
  thankyouNote: string;
  reason: string;
  feedbackType: FEEDBACKTYPE;
};

type PatientFeedbackInputArgs = { patientFeedbackInput: PatientFeedbackInput };

type AddPatientFeedbackResult = {
  status: boolean;
};

const addPatientFeedback: Resolver<
  null,
  PatientFeedbackInputArgs,
  ProfilesServiceContext,
  AddPatientFeedbackResult
> = async (parent, { patientFeedbackInput }, { profilesDb }) => {
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  const patient = await patientsRepo.findById(patientFeedbackInput.patientId);
  if (patient == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const addPatientFeedbackAttrs: Partial<PatientFeedback> = {
    patient: patient,
    rating: patientFeedbackInput.rating,
    thankyouNote: patientFeedbackInput.thankyouNote,
    reason: patientFeedbackInput.reason,
    feedbackType: patientFeedbackInput.feedbackType,
  };
  const patientFeedbackRepo = profilesDb.getCustomRepository(PatientFeedbackRepository);
  const patientFeedbackRecord = await patientFeedbackRepo.addFeedbackRecord(
    addPatientFeedbackAttrs
  );
  return { status: true };
};

export const addPatientFeedbackResolvers = {
  Mutation: {
    addPatientFeedback,
  },
};
