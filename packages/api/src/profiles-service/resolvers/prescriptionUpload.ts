import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';

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
    fileUrl: String
  }

  extend type Mutation {
    uploadPrescriptions(
      prescriptionInput: PrescriptionUploadRequest
      uhid: String
    ): PrescriptionResponse
  }
`;

export type PrescriptionInputArgs = { prescriptionInput: PrescriptionUploadRequest; uhid: string };

export enum prescriptionSource {
  SELF = 'SELF',
  EPRESCRIPTION = 'EPRESCRIPTION',
}

export const uploadPrescriptions: Resolver<
  null,
  PrescriptionInputArgs,
  null,
  { recordId: string }
> = async (parent, { prescriptionInput, uhid }) => {
  if (!uhid) throw new AphError(AphErrorMessages.INVALID_UHID);
  if (!process.env.PHR_V1_DONLOAD_PRESCRIPTION_DOCUMENT || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  const prescriptionName =
    prescriptionInput.prescribedBy == ApiConstants.PRESCRIPTION_UPLOADED_BY_PATIENT
      ? ApiConstants.PRESCRIPTION_UPLOADED_BY_PATIENT
      : 'Prescribed By ' + prescriptionInput.prescribedBy;

  prescriptionInput.prescriptionName = prescriptionName;
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

  let prescriptionDocumentUrl = process.env.PHR_V1_DONLOAD_PRESCRIPTION_DOCUMENT.toString();
  prescriptionDocumentUrl = prescriptionDocumentUrl.replace(
    '{ACCESS_KEY}',
    process.env.PHR_V1_ACCESS_TOKEN
  );
  prescriptionDocumentUrl = prescriptionDocumentUrl.replace('{UHID}', uhid);
  prescriptionDocumentUrl = prescriptionDocumentUrl.replace(
    '{RECORDID}',
    uploadedFileDetails.response
  );

  return { recordId: uploadedFileDetails.response, fileUrl: prescriptionDocumentUrl };
};

export const prescriptionUploadResolvers = {
  Mutation: {
    uploadPrescriptions,
  },
};
