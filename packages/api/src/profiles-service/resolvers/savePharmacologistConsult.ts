import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PharmacologistConsult } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { PharmacologistConsultRepository } from 'profiles-service/repositories/patientPharmacologistConsults';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { pharmacologistEmailTemplate } from 'helpers/emailTemplates/pharmacologistEmailTemplate';
import { sendMail } from 'notifications-service/resolvers/email';
import { ApiConstants } from 'ApiConstants';
import { EmailMessage } from 'types/notificationMessageTypes';

export const savePharmacologistConsultTypeDefs = gql`
  input SavePharmacologistConsultInput {
    patientId: ID
    prescriptionImageUrl: String
    prismPrescriptionFileId: String
    emailId: String!
    queries: String
  }

  type SavePharmacologistConsultResult {
    status: Boolean
  }

  extend type Mutation {
    savePharmacologistConsult(
      savePharmacologistConsultInput: SavePharmacologistConsultInput
    ): SavePharmacologistConsultResult!
  }
`;

type SavePharmacologistConsultInput = {
  patientId: string;
  prescriptionImageUrl: string;
  prismPrescriptionFileId: string;
  emailId: string;
  queries: string;
};

type SavePharmacologistConsultInputArgs = {
  savePharmacologistConsultInput: SavePharmacologistConsultInput;
};

type SavePharmacologistConsultResult = {
  status: boolean;
};

const savePharmacologistConsult: Resolver<
  null,
  SavePharmacologistConsultInputArgs,
  ProfilesServiceContext,
  SavePharmacologistConsultResult
> = async (parent, { savePharmacologistConsultInput }, { profilesDb }) => {
  let patientDetails;
  if (savePharmacologistConsultInput.patientId) {
    const patientRepo = profilesDb.getCustomRepository(PatientRepository);
    patientDetails = await patientRepo.findById(savePharmacologistConsultInput.patientId);
    if (patientDetails == null) {
      throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    }
  }

  const pharmacologistRepo = profilesDb.getCustomRepository(PharmacologistConsultRepository);
  const pharmacologistAttrs: Partial<PharmacologistConsult> = {
    patient: patientDetails,
    prescriptionImageUrl: savePharmacologistConsultInput.prescriptionImageUrl,
    emailId: savePharmacologistConsultInput.emailId,
    queries: savePharmacologistConsultInput.queries,
  };
  try {
    await pharmacologistRepo.savePharmacologistConsult(pharmacologistAttrs);
  } catch (e) {
    throw new AphError(AphErrorMessages.SAVE_PHARMACOLOGIST_CONSULT_ERROR, undefined, {});
  }

  const mailContent = pharmacologistEmailTemplate({
    patientName: patientDetails ? patientDetails.firstName : '',
    date: new Date(),
    patientQueries: savePharmacologistConsultInput.queries,
  });

  const subjectLine = ApiConstants.PHARMACOLOGIST_CONSULT_TITLE + new Date();
  const subject =
    process.env.NODE_ENV == 'production'
      ? subjectLine
      : subjectLine + ' from ' + process.env.NODE_ENV;

  const toEmailId =
    process.env.NODE_ENV == 'production'
      ? ApiConstants.PHARMACOLOGIST_EMAIL_ID
      : ApiConstants.PHARMACOLOGIST_EMAIL_ID_TEST;

  const emailContent: EmailMessage = {
    subject: subject,
    fromEmail: <string>ApiConstants.PATIENT_HELP_FROM_EMAILID,
    fromName: <string>ApiConstants.PATIENT_HELP_FROM_NAME,
    messageContent: <string>mailContent,
    toEmail: <string>toEmailId,
    ccEmail: <string>savePharmacologistConsultInput.emailId,
  };

  sendMail(emailContent);

  return {
    status: true,
  };
};

export const savePharmacologistConsultResolvers = {
  Mutation: {
    savePharmacologistConsult,
  },
};
