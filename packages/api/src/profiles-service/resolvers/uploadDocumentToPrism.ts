import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import {
  UPLOAD_FILE_TYPES,
  PRISM_DOCUMENT_CATEGORY,
  MedicalRecordType,
} from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { uploadFileToBlobStorage } from 'helpers/uploadFileToBlob';
import { MedicalRecordsRepository } from 'profiles-service/repositories/medicalRecordsRepository';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AppointmentDocumentRepository } from 'consults-service/repositories/appointmentDocumentRepository';
import { downloadDocumentAndSaveToBlob } from 'helpers/phrV1Services';

export const uploadDocumentTypeDefs = gql`
  enum PRISM_DOCUMENT_CATEGORY {
    HealthChecks
    OpSummary
    TestReports
  }
  type UploadPrismDocumentResult {
    status: Boolean!
    fileId: String
    filePath: String
  }
  input UploadDocumentInput {
    fileType: UPLOAD_FILE_TYPES!
    base64FileInput: String!
    patientId: String!
    category: PRISM_DOCUMENT_CATEGORY!
  }

  type Bloburl {
    blobUrl: String!
  }

  extend type Mutation {
    uploadDocument(uploadDocumentInput: UploadDocumentInput): UploadPrismDocumentResult!
    fetchBlobURLWithPRISMData(patientId: ID!, fileUrl: String!): Bloburl
  }
`;
type UploadPrismDocumentResult = {
  status: Boolean;
  fileId: string;
  filePath: string;
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

  //upload file to blob storage
  const blobUrl = await uploadFileToBlobStorage(
    uploadDocumentInput.fileType,
    uploadDocumentInput.base64FileInput
  );

  const patientDetails = await patientsRepo.getPatientDetails(uploadDocumentInput.patientId);
  if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});

  if (!patientDetails.uhid) throw new AphError(AphErrorMessages.INVALID_UHID);

  const fileId = await patientsRepo.uploadDocumentToPrism(
    patientDetails.uhid,
    '',
    uploadDocumentInput
  );

  return fileId
    ? { status: true, fileId, filePath: blobUrl }
    : { status: false, fileId: '', filePath: blobUrl };
};

export const fetchBlobURLWithPRISMData: Resolver<
  null,
  { patientId: string; fileUrl: string },
  ProfilesServiceContext,
  { blobUrl: string }
> = async (parent, args, { profilesDb, consultsDb }) => {
  if (!args.fileUrl || (args.fileUrl && args.fileUrl.length == 0)) return args.fileUrl;
  if (args.fileUrl.indexOf('authToken=') < 0) return args.fileUrl;

  //get recordid from the url
  const fileUrlArray = args.fileUrl.split('&');
  const recordId = fileUrlArray.filter((item) => item.indexOf('recordId') >= 0);
  if (recordId.length == 0) return args.fileUrl;

  const prismFileId = recordId[0].replace('recordId=', '');
  console.log('recordId ...', recordId);

  const category =
    args.fileUrl.indexOf('labresults=') > 0
      ? MedicalRecordType.TEST_REPORT
      : MedicalRecordType.PRESCRIPTION;

  //check in medical records
  const medicalRepo = profilesDb.getCustomRepository(MedicalRecordsRepository);
  const medicalRecord = await medicalRepo.getBlobUrl(args.patientId, prismFileId, category);
  if (medicalRecord) return medicalRecord.documentURLs;

  //check in appointment documents
  if (category == MedicalRecordType.PRESCRIPTION) {
    const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
    const appointmentData = await appointmentRepo.getAppointmenIdsFromPatientID(args.patientId);
    if (appointmentData.length > 0) {
      const appointmentIds = appointmentData.map((item) => item.id);
      const appointmentDocumentRepo = consultsDb.getCustomRepository(AppointmentDocumentRepository);
      const documentData = await appointmentDocumentRepo.getDocumentsByAppointmentId(
        appointmentIds,
        prismFileId
      );
      if (documentData) return documentData.documentPath;
    }
  }

  //download from prism and generate blob url
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientsRepo.getPatientDetails(args.patientId);
  if (patientDetails == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const blobUrl = await downloadDocumentAndSaveToBlob(
    patientDetails.uhid,
    args.fileUrl,
    prismFileId
  );

  return { blobUrl };
};

export const uploadDocumentResolvers = {
  Mutation: {
    uploadDocument,
    fetchBlobURLWithPRISMData,
  },
};
