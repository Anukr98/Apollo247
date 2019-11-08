import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import { UPLOAD_FILE_TYPES } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import { format } from 'date-fns';

export const uploadDocumentTypeDefs = gql`
  type UploadPrismDocumentResult {
    status: Boolean
  }
  input UploadDocumentInput {
    fileType: UPLOAD_FILE_TYPES
    base64FileInput: String
    patientId: String
  }

  extend type Mutation {
    uploadDocument(uploadDocumentInput: UploadDocumentInput): UploadPrismDocumentResult!
  }
`;
type UploadPrismDocumentResult = {
  status: Boolean;
};

type UploadDocumentInput = {
  fileType: UPLOAD_FILE_TYPES;
  base64FileInput: string;
  patientId: string;
};

type UploadDocInputArgs = { uploadDocumentInput: UploadDocumentInput };

const uploadDocument: Resolver<
  null,
  UploadDocInputArgs,
  ProfilesServiceContext,
  UploadPrismDocumentResult
> = async (parent, { uploadDocumentInput }, { mobileNumber, profilesDb }) => {
  console.log(uploadDocumentInput.base64FileInput, uploadDocumentInput.fileType);
  const fileName =
    format(new Date(), 'ddmmyyyy-HHmmss') + '.' + uploadDocumentInput.fileType.toLowerCase();
  console.log(fileName);

  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  //get authtoken for the logged in user mobile number
  const prismAuthToken = await patientsRepo.getPrismAuthToken(mobileNumber);

  if (!prismAuthToken) return { status: false };

  //get users list for the mobile number
  const prismUserList = await patientsRepo.getPrismUsersList(mobileNumber, prismAuthToken);
  console.log(prismUserList);

  //check if current user uhid matches with response uhids
  const uhid = await patientsRepo.validateAndGetUHID(uploadDocumentInput.patientId, prismUserList);
  console.log(uhid);

  if (!uhid) {
    throw new Error('Patient UHID Error');
  }

  //just call get prism user details with the corresponding uhid
  patientsRepo.getPrismUsersDetails(uhid, prismAuthToken);

  const uploadResponse = patientsRepo.uploadDocumentToPrism(uhid, prismAuthToken);
  console.log(uploadResponse);

  return { status: true };
};

export const uploadDocumentResolvers = {
  Mutation: {
    uploadDocument,
  },
};
