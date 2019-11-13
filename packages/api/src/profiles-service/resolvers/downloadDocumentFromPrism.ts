import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

export const downloadDocumentTypeDefs = gql`
  type DownloadDocumentResult {
    status: Boolean!
  }
  input DownloadDocumentInput {
    fileId: String!
    patientId: String!
  }

  extend type Query {
    downloadDocument(downloadDocumentInput: DownloadDocumentInput): DownloadDocumentResult!
  }
`;
type DownloadDocumentResult = {
  status: Boolean;
};

export type DownloadDocumentInput = {
  fileId: string;
  patientId: string;
};

type DownloadDocInputArgs = { downloadDocumentInput: DownloadDocumentInput };

const downloadDocument: Resolver<
  null,
  DownloadDocInputArgs,
  ProfilesServiceContext,
  DownloadDocumentResult
> = async (parent, { downloadDocumentInput }, { mobileNumber, profilesDb }) => {
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  //get authtoken for the logged in user mobile number
  const prismAuthToken = await patientsRepo.getPrismAuthToken(mobileNumber);

  if (!prismAuthToken) return { status: false, fileId: '' };

  //get users list for the mobile number
  const prismUserList = await patientsRepo.getPrismUsersList(mobileNumber, prismAuthToken);
  console.log(prismUserList);

  //check if current user uhid matches with response uhids
  const uhid = await patientsRepo.validateAndGetUHID(
    downloadDocumentInput.patientId,
    prismUserList
  );

  if (!uhid) {
    return { status: false };
  }

  //just call get prism user details with the corresponding uhid
  await patientsRepo.getPrismUsersDetails(uhid, prismAuthToken);

  const fileId = await patientsRepo.downloadDocumentFromPrism(
    uhid,
    prismAuthToken,
    downloadDocumentInput
  );

  return fileId ? { status: true } : { status: false };
};

export const downloadDocumentResolvers = {
  Mutation: {
    downloadDocument,
  },
};
