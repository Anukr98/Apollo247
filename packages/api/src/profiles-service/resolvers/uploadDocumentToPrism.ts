import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import { UPLOAD_FILE_TYPES, PRISM_DOCUMENT_CATEGORY } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

export const uploadDocumentTypeDefs = gql`
  enum PRISM_DOCUMENT_CATEGORY {
    HealthChecks
    OpSummary
  }
  type UploadPrismDocumentResult {
    status: Boolean!
    fileId: String
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
  //get authtoken for the logged in user mobile number
  const prismAuthToken = await patientsRepo.getPrismAuthToken(mobileNumber);

  if (!prismAuthToken) return { status: false, fileId: '' };

  //get users list for the mobile number
  const prismUserList = await patientsRepo.getPrismUsersList(mobileNumber, prismAuthToken);
  console.log(prismUserList);

  //check if current user uhid matches with response uhids
  const uhid = await patientsRepo.validateAndGetUHID(uploadDocumentInput.patientId, prismUserList);

  if (!uhid) {
    return { status: false, fileId: '' };
  }

  //just call get prism user details with the corresponding uhid
  await patientsRepo.getPrismUsersDetails(uhid, prismAuthToken);

  const fileId = await patientsRepo.uploadDocumentToPrism(
    uhid,
    prismAuthToken,
    uploadDocumentInput
  );

  return fileId ? { status: true, fileId } : { status: false, fileId: '' };
};

export const uploadDocumentResolvers = {
  Mutation: {
    uploadDocument,
  },
};
