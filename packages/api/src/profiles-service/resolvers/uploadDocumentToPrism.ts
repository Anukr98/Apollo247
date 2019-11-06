import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import { format } from 'date-fns';

export const uploadFileTypeDefs = gql`
  enum UPLOAD_FILE_TYPES {
    JPG
    PNG
    JPEG
    PDF
  }

  type UploadPrismDocumentResult {
    status: Boolean
  }

  extend type Mutation {
    uploadDocument(fileType: String, base64FileInput: String): UploadPrismDocumentResult!
  }
`;
type UploadPrismDocumentResult = {
  status: Boolean;
};

const uploadDocument: Resolver<
  null,
  { fileType: string; base64FileInput: string },
  ProfilesServiceContext,
  UploadPrismDocumentResult
> = async (parent, args, { mobileNumber, profilesDb }) => {
  const fileName = format(new Date(), 'ddmmyyyy-HHmmss') + '.' + args.fileType.toLowerCase();
  console.log(fileName);

  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  //get authtoken for the logged in user mobile number
  const prismAuthToken = await patientsRepo.getPrismAuthToken(mobileNumber);

  if (!prismAuthToken) return { status: false };

  //get users list for the mobile number
  const prismUserList = await patientsRepo.getPrismUsersList(mobileNumber, prismAuthToken);
  console.log(prismUserList);

  // const authTokenPromise = await fetch(
  //   `${process.env.PRISM_GET_AUTH_TOKEN_API}?mobile=${mobileNumber}`
  // )
  // .then((res) => res.json())
  // .catch((error: JSON) => {
  //   throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR);
  // });

  // };

  return { status: true };
};

export const uploadFileResolvers = {
  Mutation: {
    uploadDocument,
  },
};
