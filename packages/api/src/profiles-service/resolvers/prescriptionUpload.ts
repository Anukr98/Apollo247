import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PrescriptionUploadRequest, PrescriptionUploadResponse } from 'types/phrv1';
import { ApiConstants } from 'ApiConstants';
import { getUnixTime } from 'date-fns';
import { savePrescription } from 'helpers/phrV1Services';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { lowerCase } from 'lodash';

export const prescriptionUploadTypeDefs = gql`
  enum prescriptionSource {
    SELF
    EPRESCRIPTION
  }

  input prescriptionFileProperties {
    fileName: String!
    mimeType: String!
    content: String!
  }

  input PrescriptionUploadRequest {
    prescribedBy: String!
    dateOfPrescription: Date!
    startDate: Date
    endDate: Date
    notes: String
    prescriptionSource: prescriptionSource!
    prescriptionFiles: [prescriptionFileProperties]
  }

  type PrescriptionResponse {
    recordId: String
  }

  extend type Mutation {
    uploadPrescriptions(
      prescriptionInput: PrescriptionUploadRequest
      uhid: String
    ): PrescriptionResponse
  }
`;

type PrescriptionInputArgs = { prescriptionInput: PrescriptionUploadRequest; uhid: string };
export enum prescriptionSource {
  SELF = 'SELF',
  EPRESCRIPTION = 'EPRESCRIPTION',
}

export const uploadPrescriptions: Resolver<
  null,
  PrescriptionInputArgs,
  ProfilesServiceContext,
  { recordId: string }
> = async (parent, { prescriptionInput, uhid }, {}) => {
  if (!uhid) throw new AphError(AphErrorMessages.INVALID_UHID);

  prescriptionInput.prescriptionName = 'Prescribed By' + prescriptionInput.prescribedBy;
  prescriptionInput.dateOfPrescription =
    getUnixTime(new Date(prescriptionInput.dateOfPrescription)) * 1000;
  prescriptionInput.startDate = prescriptionInput.startDate
    ? getUnixTime(new Date(prescriptionInput.startDate)) * 1000
    : 0;
  prescriptionInput.endDate = prescriptionInput.endDate
    ? getUnixTime(new Date(prescriptionInput.endDate)) * 1000
    : 0;
  prescriptionInput.prescriptionSource =
    ApiConstants.PRESCRIPTION_SOURCE_PREFIX + lowerCase(prescriptionInput.prescriptionSource);
  prescriptionInput.prescriptionDetail = [];

  prescriptionInput.prescriptionFiles.map((item) => {
    item.id = '';
    item.dateCreated = getUnixTime(new Date()) * 1000;
  });

  const uploadedFileDetails: PrescriptionUploadResponse = await savePrescription(
    uhid,
    prescriptionInput
  );
  return { recordId: uploadedFileDetails.response };
};
export const prescriptionUploadResolvers = {
  Mutation: {
    uploadPrescriptions,
  },
};
