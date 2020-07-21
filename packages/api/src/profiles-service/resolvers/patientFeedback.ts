import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientFeedback, FEEDBACKTYPE } from 'profiles-service/entities';
import { PatientFeedbackRepository } from 'profiles-service/repositories/patientFeedbackRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
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
    transactionId: ID!
  }

  type GetPatientFeedback {
    patientId: String
    rating: String
    thankyouNote: String
    reason: String
    feedbackType: FEEDBACKTYPE
    transactionId: String
  }

  type GetPatientFeedbackResult {
    feedback: [GetPatientFeedback]
  }

  type AddPatientFeedbackResult {
    status: Boolean
  }

  extend type Mutation {
    addPatientFeedback(patientFeedbackInput: PatientFeedbackInput): AddPatientFeedbackResult!
  }
  extend type Query {
    getPatientFeedback(patientId: String, transactionId: String): GetPatientFeedbackResult!
  }
`;

type PatientFeedbackInput = {
  patientId: string;
  rating: string;
  thankyouNote?: string;
  reason: string;
  feedbackType: FEEDBACKTYPE;
  transactionId: string;
};

type PatientFeedbackInputArgs = { patientFeedbackInput: PatientFeedbackInput };

type AddPatientFeedbackResult = {
  status: boolean;
};

type GetPatientFeedbackResult = {
  feedback: PatientFeedback[];
};

const addPatientFeedback: Resolver<
  null,
  PatientFeedbackInputArgs,
  ProfilesServiceContext,
  AddPatientFeedbackResult
> = async (parent, { patientFeedbackInput }, { profilesDb, consultsDb }) => {
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  const patient = await patientsRepo.getPatientDetails(patientFeedbackInput.patientId);
  if (patient == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  let doctorId = '';
  if (patientFeedbackInput.feedbackType === FEEDBACKTYPE.CONSULT) {
    const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
    const appointmentDetails = await appointmentRepo.findByAppointmentId(
      patientFeedbackInput.transactionId
    );
    if (!appointmentDetails[0]) {
      throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
    }
    doctorId = appointmentDetails[0].doctorId;
  }

  const addPatientFeedbackAttrs: Partial<PatientFeedback> = {
    patient: patient,
    rating: patientFeedbackInput.rating,
    thankyouNote: patientFeedbackInput.thankyouNote || '',
    reason: patientFeedbackInput.reason,
    feedbackType: patientFeedbackInput.feedbackType,
    transactionId: patientFeedbackInput.transactionId,
    doctorId: doctorId ? doctorId : '',
  };

  const patientFeedbackRepo = profilesDb.getCustomRepository(PatientFeedbackRepository);
  await patientFeedbackRepo.addFeedbackRecord(addPatientFeedbackAttrs);
  return { status: true };
};

const getPatientFeedback: Resolver<
  null,
  { patientId: string; transactionId: string },
  ProfilesServiceContext,
  GetPatientFeedbackResult
> = async (parent, args, { profilesDb, consultsDb }) => {
  const patientFeedbackRepo = profilesDb.getCustomRepository(PatientFeedbackRepository);
  const feedback = await patientFeedbackRepo.getFeedbackRecord(args.patientId, args.transactionId);
  console.log(feedback);
  return { feedback };
};

export const addPatientFeedbackResolvers = {
  Mutation: {
    addPatientFeedback,
  },
  Query: {
    getPatientFeedback,
  },
};
