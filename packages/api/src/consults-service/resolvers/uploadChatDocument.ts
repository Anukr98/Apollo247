import gql from 'graphql-tag';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { Resolver } from 'api-gateway';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Appointment, AppointmentDocuments } from 'consults-service/entities';
import { UPLOAD_FILE_TYPES, PRISM_DOCUMENT_CATEGORY } from 'profiles-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AppointmentDocumentRepository } from 'consults-service/repositories/appointmentDocumentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { Connection } from 'typeorm';
import { uploadFileToBlobStorage } from 'helpers/uploadFileToBlob';
import { PrescriptionUploadRequest, PrescriptionUploadResponse } from 'types/phrv1';
import { getUnixTime } from 'date-fns';
import { ApiConstants } from 'ApiConstants';
import { lowerCase } from 'lodash';
import { savePrescription } from 'helpers/phrV1Services';
import { getFileTypeFromMime } from 'helpers/generalFunctions';

export const uploadChatDocumentTypeDefs = gql`
  enum PRISM_DOCUMENT_CATEGORY {
    HealthChecks
    OpSummary
    TestReports
  }

  enum UPLOAD_FILE_TYPES {
    JPG
    PNG
    JPEG
    PDF
  }

  type UploadChatDocumentResult {
    filePath: String
  }

  type UploadPrismChatDocumentResult {
    status: Boolean!
    fileId: String
  }

  type UploadedDocumentDetails {
    id: String
    documentPath: String
    prismFileId: String
  }

  type ChatDocumentDeleteResult {
    status: Boolean
  }

  type MediaPrescriptionResponse {
    recordId: String
    fileUrl: String
  }
  enum mediaPrescriptionSource {
    SELF
    EPRESCRIPTION
  }

  input MediaPrescriptionFileProperties {
    fileName: String!
    mimeType: String!
    content: String!
  }

  input MediaPrescriptionUploadRequest {
    prescribedBy: String!
    dateOfPrescription: Date!
    startDate: Date
    endDate: Date
    notes: String
    prescriptionSource: mediaPrescriptionSource!
    prescriptionFiles: [MediaPrescriptionFileProperties]
  }

  extend type Mutation {
    uploadChatDocument(
      appointmentId: String
      fileType: String
      base64FileInput: String
    ): UploadChatDocumentResult!

    uploadChatDocumentToPrism(
      appointmentId: String
      patientId: String!
      fileType: UPLOAD_FILE_TYPES!
      base64FileInput: String!
    ): UploadPrismChatDocumentResult!

    addChatDocument(
      appointmentId: ID!
      documentPath: String
      prismFileId: String
    ): UploadedDocumentDetails
    removeChatDocument(documentPathId: ID!): ChatDocumentDeleteResult

    uploadMediaDocument(
      prescriptionInput: MediaPrescriptionUploadRequest
      uhid: String!
      appointmentId: ID!
    ): MediaPrescriptionResponse
  }
`;
type UploadChatDocumentResult = {
  filePath: string;
};

type UploadPrismChatDocumentResult = {
  status: Boolean;
  fileId: string;
};

const uploadChatDocument: Resolver<
  null,
  { appointmentId: string; fileType: string; base64FileInput: string },
  ConsultServiceContext,
  UploadChatDocumentResult
> = async (parent, args, { consultsDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentDetails = await appointmentRepo.findById(args.appointmentId);
  if (appointmentDetails == null)
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});

  const documentPath = await uploadFileToBlobStorage(args.fileType, args.base64FileInput);

  const documentAttrs: Partial<AppointmentDocuments> = {
    documentPath: documentPath,
    appointment: appointmentDetails,
  };
  const appointmentDocumentRepo = consultsDb.getCustomRepository(AppointmentDocumentRepository);
  await appointmentDocumentRepo.saveDocument(documentAttrs);
  return { filePath: documentPath };
};

const uploadChatDocumentToPrism: Resolver<
  null,
  {
    appointmentId: string;
    patientId: string;
    fileType: UPLOAD_FILE_TYPES;
    base64FileInput: string;
  },
  ConsultServiceContext,
  UploadPrismChatDocumentResult
> = async (parent, args, { mobileNumber, consultsDb, patientsDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentDetails = await appointmentRepo.findById(args.appointmentId);
  if (appointmentDetails == null)
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});

  const patientsRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientsRepo.getPatientDetails(args.patientId);
  if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});

  if (!patientDetails.uhid) throw new AphError(AphErrorMessages.INVALID_UHID);

  const uploadDocInput = {
    ...args,
    category: PRISM_DOCUMENT_CATEGORY.OpSummary,
  };

  const fileId = await patientsRepo.uploadDocumentToPrism(patientDetails.uhid, '', uploadDocInput);

  //upload file to blob storage & save to appointment documents
  uploadFileToBlobStorageAndSave(
    args.fileType,
    args.base64FileInput,
    appointmentDetails,
    fileId!,
    consultsDb
  );

  return fileId ? { status: true, fileId } : { status: false, fileId: '' };
};

export const uploadFileToBlobStorageAndSave = async (
  fileType: string,
  base64FileInput: string,
  appointmentDetails: Appointment,
  fileId: string,
  consultsDb: Connection
) => {
  const documentPath = await uploadFileToBlobStorage(fileType, base64FileInput);

  const documentAttrs: Partial<AppointmentDocuments> = {
    documentPath: documentPath,
    prismFileId: fileId || '',
    appointment: appointmentDetails,
  };
  const appointmentDocumentRepo = consultsDb.getCustomRepository(AppointmentDocumentRepository);
  appointmentDocumentRepo.saveDocument(documentAttrs);
};

type UploadedDocumentDetails = {
  id: string;
  documentPath: string;
  prismFileId: string;
};

const addChatDocument: Resolver<
  null,
  { appointmentId: string; documentPath: string; prismFileId: string },
  ConsultServiceContext,
  UploadedDocumentDetails
> = async (parent, args, { consultsDb, doctorsDb, mobileNumber }) => {
  //check appointment id
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  const documentAttrs: Partial<AppointmentDocuments> = {
    documentPath: args.documentPath,
    prismFileId: args.prismFileId,
    appointment: appointmentData,
  };
  const appointmentDocumentRepo = consultsDb.getCustomRepository(AppointmentDocumentRepository);
  const appointmentDocuments = await appointmentDocumentRepo.saveDocument(documentAttrs);
  return {
    id: appointmentDocuments.id,
    documentPath: appointmentDocuments.documentPath,
    prismFileId: appointmentDocuments.prismFileId,
  };
};

type ChatDocumentDeleteResult = {
  status: boolean;
};

const removeChatDocument: Resolver<
  null,
  { documentPathId: string },
  ConsultServiceContext,
  ChatDocumentDeleteResult
> = async (parent, args, { consultsDb, doctorsDb, mobileNumber }) => {
  //access check
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //check for valid document id
  const appointmentDocumentRepo = consultsDb.getCustomRepository(AppointmentDocumentRepository);
  const appointmentDocuments = await appointmentDocumentRepo.getDocument(args.documentPathId);
  if (appointmentDocuments == null)
    throw new AphError(AphErrorMessages.GET_APPOINTMENT_DOCUMENT_ERROR);

  await appointmentDocumentRepo.removeFromAppointmentDocument(args.documentPathId);
  return { status: true };
};

export type MediaDocumentInputArgs = {
  prescriptionInput: PrescriptionUploadRequest;
  uhid: string;
  appointmentId: string;
};

export const uploadMediaDocument: Resolver<
  null,
  MediaDocumentInputArgs,
  ConsultServiceContext,
  { recordId: string }
> = async (parent, { prescriptionInput, uhid, appointmentId }, { consultsDb }) => {
  if (!uhid) throw new AphError(AphErrorMessages.INVALID_UHID);
  if (!process.env.PHR_V1_DONLOAD_PRESCRIPTION_DOCUMENT || !process.env.PHR_V1_ACCESS_TOKEN)
    throw new AphError(AphErrorMessages.INVALID_PRISM_URL);

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentDetails = await appointmentRepo.findById(appointmentId);
  if (appointmentDetails == null)
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});

  prescriptionInput.prescriptionName = 'MediaDocument';
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

  if (prescriptionInput.prescriptionFiles)
    prescriptionInput.prescriptionFiles.forEach((item) => {
      const uploadFileType = getFileTypeFromMime(item.mimeType);
      uploadFileToBlobStorageAndSave(
        uploadFileType,
        item.content,
        appointmentDetails,
        uploadedFileDetails.response,
        consultsDb
      );
    });

  return { recordId: uploadedFileDetails.response, fileUrl: prescriptionDocumentUrl };
};

export const uploadChatDocumentResolvers = {
  Mutation: {
    uploadChatDocument,
    uploadChatDocumentToPrism,
    addChatDocument,
    removeChatDocument,
    uploadMediaDocument,
  },
};
