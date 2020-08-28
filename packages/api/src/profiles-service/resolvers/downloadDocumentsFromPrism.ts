import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { getAuthToken } from 'helpers/phrV1Services';

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

//not in use, preserved for backward compatability
export const downloadDocuments: Resolver<
  null,
  DownloadDocsInputArgs,
  ProfilesServiceContext,
  DownloadDocumentsResult
> = async (parent, { downloadDocumentsInput }, { mobileNumber, profilesDb }) => {
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientsRepo.getPatientDetails(downloadDocumentsInput.patientId);
  if (patientDetails == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const getToken = await getAuthToken(patientDetails.uhid);

  const downloadPaths = downloadDocumentsInput.fileIds.map((fileIdName) => {
    if (fileIdName == '') return '';
    const fileIdNameArray = fileIdName.split('_');
    const fileId = fileIdNameArray.shift();
    const fileName = fileIdNameArray.join('_');

    let prescriptionDocumentUrl = process.env.PHR_V1_DONLOAD_PRESCRIPTION_DOCUMENT!.toString();
    prescriptionDocumentUrl = prescriptionDocumentUrl.replace('{AUTH_KEY}', getToken.response);
    prescriptionDocumentUrl = prescriptionDocumentUrl.replace('{UHID}', patientDetails!.uhid);
    prescriptionDocumentUrl = prescriptionDocumentUrl.replace('{RECORDID}', fileId!);
    prescriptionDocumentUrl = prescriptionDocumentUrl.replace('{FILE_NAME}', fileName);
    return prescriptionDocumentUrl;
    //return `${process.env.PRISM_DOWNLOAD_FILE_API}?authToken=${prismAuthToken}&fileId=${fileId}&fileName=${fileName}`;
  });

  return { downloadPaths };
};

export const downloadDocumentsResolvers = {
  Query: {
    downloadDocuments,
  },
};
