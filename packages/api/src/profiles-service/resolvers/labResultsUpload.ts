import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { LabResultsUploadRequest, LabResultsUploadResponse } from 'types/phrv1';
import { ApiConstants } from 'ApiConstants';
import { getUnixTime } from 'date-fns';
import { saveLabResults } from 'helpers/phrV1Services';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const labResultsUploadTypeDefs = gql`
  input LabResultFileProperties {
    fileName: String!
    mimeType: String!
    content: String!
  }

  input TestResultsParameter {
    parameterName: String!
    result: String!
    unit: String!
    range: String
  }

  input LabResultsUploadRequest {
    labTestName: String!
    labTestDate: Date!
    labTestRefferedBy: String
    observation: String
    identifier: String
    additionalNotes: String
    labTestResults: [TestResultsParameter]
    testResultFiles: [LabResultFileProperties]
  }

  type LabResultsResponse {
    recordId: String
    fileUrl: String
  }

  extend type Mutation {
    uploadLabResults(labResultsInput: LabResultsUploadRequest, uhid: String): LabResultsResponse
  }
`;

export type LabResultsInputArgs = { labResultsInput: LabResultsUploadRequest; uhid: string };

export const uploadLabResults: Resolver<
  null,
  LabResultsInputArgs,
  null,
  { recordId: string }
> = async (parent, { labResultsInput, uhid }) => {
  if (!uhid) throw new AphError(AphErrorMessages.INVALID_UHID);
  if (!process.env.PHR_V1_DONLOAD_LABRESULT_DOCUMENT || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  labResultsInput.labTestSource = ApiConstants.LABTEST_SOURCE_SELF_UPLOADED;
  labResultsInput.labTestDate = getUnixTime(new Date(labResultsInput.labTestDate)) * 1000;
  labResultsInput.identifier = '';
  labResultsInput.visitId = '';
  labResultsInput.labTestResults.map((item) => {
    item.outOfRange = false;
    item.resultDate = getUnixTime(new Date(labResultsInput.labTestDate)) * 1000;
  });
  labResultsInput.testResultFiles.map((item) => {
    item.id = '';
    item.dateCreated = getUnixTime(new Date()) * 1000;
  });

  const uploadedFileDetails: LabResultsUploadResponse = await saveLabResults(uhid, labResultsInput);

  let labResultDocumentUrl = process.env.PHR_V1_DONLOAD_LABRESULT_DOCUMENT.toString();
  labResultDocumentUrl = labResultDocumentUrl.replace(
    '{ACCESS_KEY}',
    process.env.PHR_V1_ACCESS_TOKEN
  );
  labResultDocumentUrl = labResultDocumentUrl.replace('{UHID}', uhid);
  labResultDocumentUrl = labResultDocumentUrl.replace('{RECORDID}', uploadedFileDetails.response);

  return { recordId: uploadedFileDetails.response, fileUrl: labResultDocumentUrl };
};
export const labResultsUploadResolvers = {
  Mutation: {
    uploadLabResults,
  },
};
