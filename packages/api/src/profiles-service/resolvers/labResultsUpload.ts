import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { LabResultsUploadRequest, LabResultsUploadResponse } from 'types/phrv1';
import { ApiConstants } from 'ApiConstants';
import { getUnixTime } from 'date-fns';
import { saveLabResults } from 'helpers/phrV1Services';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const labResultsUploadTypeDefs = gql`
  input LabResultFileProperties {
    fileName: String
    mimeType: String
    content: String
  }

  input TestResultsParameter {
    parameterName: String
    result: String
    unit: String
    range: String
  }

  input LabResultsUploadRequest {
    labTestName: String
    labTestDate: Date
    labTestRefferedBy: String
    observation: String
    identifier: String
    additionalNotes: String
    labTestResults: [TestResultsParameter]
    testResultFiles: [LabResultFileProperties]
  }

  extend type Mutation {
    uploadLabResults(labResultsInput: LabResultsUploadRequest, uhid: String): String
  }
`;

type LabResultsInputArgs = { labResultsInput: LabResultsUploadRequest; uhid: string };

const uploadLabResults: Resolver<
  null,
  LabResultsInputArgs,
  ProfilesServiceContext,
  string
> = async (parent, { labResultsInput, uhid }, {}) => {
  if (!uhid) throw new AphError(AphErrorMessages.INVALID_UHID);
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
  console.log(labResultsInput);

  const uploadedFileDetails: LabResultsUploadResponse = await saveLabResults(uhid, labResultsInput);
  console.log('-------', uploadedFileDetails);
  return '';
};
export const labResultsUploadResolvers = {
  Mutation: {
    uploadLabResults,
  },
};
