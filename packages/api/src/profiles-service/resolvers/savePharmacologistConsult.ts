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
import { EmailMessage, EmailAttachMent } from 'types/notificationMessageTypes';
import { format, addMinutes } from 'date-fns';
import path from 'path';
import fetch from 'node-fetch';

export const savePharmacologistConsultTypeDefs = gql`
  input SavePharmacologistConsultInput {
    patientId: ID!
    prescriptionImageUrl: String
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
  if (!savePharmacologistConsultInput.patientId) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  const patientRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(savePharmacologistConsultInput.patientId);
  if (patientDetails == null) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
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
  const date = format(addMinutes(new Date(), 330), 'yyyy-MM-dd hh:mm');
  const mailContent = pharmacologistEmailTemplate({
    patientName: patientDetails.firstName,
    date: date,
    patientQueries: savePharmacologistConsultInput.queries,
    email: savePharmacologistConsultInput.emailId,
    phone: patientDetails.mobileNumber,
  });
  const attachments: EmailAttachMent[] = [];
  if (savePharmacologistConsultInput.prescriptionImageUrl) {
    const prescriptionImageUrls = savePharmacologistConsultInput.prescriptionImageUrl.split(' ');
    const imagePromises = prescriptionImageUrls.map(async (url, index) => {
      return await fetch(url);
    });
    const imageResponse = await Promise.all(imagePromises);
    const imageBufferPromises = imageResponse.map(async (response) => {
      return await response.buffer();
    });
    const imageBuffers = await Promise.all(imageBufferPromises);
    imageBuffers.forEach((buffer, index) => {
      const url = prescriptionImageUrls[index];
      const baseUrl = path.basename(url);
      const extname = path.extname(url);
      attachments.push({
        content: buffer.toString('base64'),
        filename: baseUrl.split('?')[0],
        type: extname.split('?')[0],
        disposition: 'attachment',
      });
    });
  }

  let subjectLine: string = '';
  subjectLine = ApiConstants.PHARMACOLOGIST_CONSULT_TITLE;
  subjectLine = subjectLine.replace('{0}', patientDetails.firstName);
  subjectLine = subjectLine.replace('{1}', date);

  const emailContent: EmailMessage = {
    subject: subjectLine,
    fromEmail: <string>ApiConstants.PATIENT_HELP_FROM_EMAILID,
    fromName: <string>ApiConstants.PATIENT_HELP_FROM_NAME,
    messageContent: <string>mailContent,
    toEmail: <string>process.env.PHARMACOLOGIST_EMAIL,
    ccEmail: <string>savePharmacologistConsultInput.emailId,
    attachments: attachments,
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
