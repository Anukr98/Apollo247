import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

export const downloadDocumentsTypeDefs = gql`
  input DownloadDocumentsInput {
    fileIds: [String!]!
    patientId: String!
  }
  type DownloadDocumentsResult {
    downloadPaths: [String!]
  }

  extend type Query {
    downloadDocuments(downloadDocumentsInput: DownloadDocumentsInput): DownloadDocumentsResult!
  }
`;
type DownloadDocumentsResult = {
  downloadPaths: string[];
};

export type DownloadDocumentsInput = {
  fileIds: string[];
  patientId: string;
};

type DownloadDocsInputArgs = { downloadDocumentsInput: DownloadDocumentsInput };

const downloadDocuments: Resolver<
  null,
  DownloadDocsInputArgs,
  ProfilesServiceContext,
  DownloadDocumentsResult
> = async (parent, { downloadDocumentsInput }, { mobileNumber, profilesDb }) => {
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);

  //get authtoken for the logged in user mobile number
  const prismAuthToken = await patientsRepo.getPrismAuthToken(mobileNumber);

  if (!prismAuthToken) return { downloadPaths: [] };

  const downloadPaths = downloadDocumentsInput.fileIds.map((fileId) => {
    const fileIdName = fileId.split('_');
    if (fileId == '') return '';
    return `${process.env.PRISM_DOWNLOAD_FILE_API}?authToken=${prismAuthToken}&fileId=${fileIdName[0]}&fileName=${fileIdName[1]}`;
  });

  return { downloadPaths };
};

export const downloadDocumentsResolvers = {
  Query: {
    downloadDocuments,
  },
};
