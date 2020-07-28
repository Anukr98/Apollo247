import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import { UPLOAD_FILE_TYPES, PRISM_DOCUMENT_CATEGORY } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { uploadFileToBlobStorage } from 'helpers/uploadFileToBlob';

export const uploadDocumentTypeDefs = gql`
  enum PRISM_DOCUMENT_CATEGORY {
    HealthChecks
    OpSummary
    TestReports
  }
  type UploadPrismDocumentResult {
    status: Boolean!
    fileId: String
    filePath: String
  }
  input UploadDocumentInput {
    fileType: UPLOAD_FILE_TYPES!
    base64FileInput: String!
    patientId: String!
    category: PRISM_DOCUMENT_CATEGORY!
  }

  extend type Mutation {
    uploadDocument(uploadDocumentInput: UploadDocumentInput): UploadPrismDocumentResult!
  }
`;
type UploadPrismDocumentResult = {
  status: Boolean;
  fileId: string;
  filePath: string;
};

export type UploadDocumentInput = {
  fileType: UPLOAD_FILE_TYPES;
  base64FileInput: string;
  patientId: string;
  category: PRISM_DOCUMENT_CATEGORY;
};

type UploadDocInputArgs = { uploadDocumentInput: UploadDocumentInput };

const uploadDocument: Resolver<
  null,
  UploadDocInputArgs,
  ProfilesServiceContext,
  UploadPrismDocumentResult
> = async (parent, { uploadDocumentInput }, { mobileNumber, profilesDb }) => {
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);

  //upload file to blob storage
  const blobUrl = await uploadFileToBlobStorage(
    uploadDocumentInput.fileType,
    uploadDocumentInput.base64FileInput
  );

  const patientDetails = await patientsRepo.getPatientDetails(uploadDocumentInput.patientId);
  if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});

  if (!patientDetails.uhid) throw new AphError(AphErrorMessages.INVALID_UHID);

  const fileId = await patientsRepo.uploadDocumentToPrism(
    patientDetails.uhid,
    '',
    uploadDocumentInput
  );

  return fileId
    ? { status: true, fileId, filePath: blobUrl }
    : { status: false, fileId: '', filePath: blobUrl };
};

export const uploadDocumentResolvers = {
  Mutation: {
    uploadDocument,
  },
};
