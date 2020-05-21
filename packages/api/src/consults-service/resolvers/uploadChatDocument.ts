import gql from 'graphql-tag';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { Resolver } from 'api-gateway';
import fs from 'fs';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { format } from 'date-fns';
import path from 'path';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Appointment, AppointmentDocuments } from 'consults-service/entities';
import { UPLOAD_FILE_TYPES, PRISM_DOCUMENT_CATEGORY } from 'profiles-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AppointmentDocumentRepository } from 'consults-service/repositories/appointmentDocumentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { Connection } from 'typeorm';

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

  let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  const randomNumber = Math.floor(Math.random() * 10000);
  const fileName =
    format(new Date(), 'ddmmyyyy-HHmmss') + '_' + randomNumber + '.' + args.fileType.toLowerCase();
  const uploadPath = assetsDir + '/' + fileName;
  fs.writeFile(uploadPath, args.base64FileInput, { encoding: 'base64' }, (err) => {
    console.log(err);
  });
  const client = new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API,
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );

  if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'dev') {
    console.log('deleting container...');
    await client
      .deleteContainer()
      .then((res) => console.log(res))
      .catch((error) => console.log('error deleting', error));

    console.log('setting service properties...');
    await client
      .setServiceProperties()
      .then((res) => console.log(res))
      .catch((error) => console.log('error setting service properties', error));

    console.log('creating container...');
    await client
      .createContainer()
      .then((res) => console.log(res))
      .catch((error) => console.log('error creating', error));
  }

  console.log('testing storage connection...');
  await client
    .testStorageConnection()
    .then((res) => console.log(res))
    .catch((error) => console.log('error testing', error));

  const localFilePath = assetsDir + '/' + fileName;
  console.log(`uploading ${localFilePath}`);
  const readmeBlob = await client
    .uploadFile({ name: fileName, filePath: localFilePath })
    .catch((error) => {
      console.log('error final', error);
      throw error;
    });
  fs.unlinkSync(localFilePath);
  const documentAttrs: Partial<AppointmentDocuments> = {
    documentPath: client.getBlobUrl(readmeBlob.name),
    appointment: appointmentDetails,
  };
  const appointmentDocumentRepo = consultsDb.getCustomRepository(AppointmentDocumentRepository);
  await appointmentDocumentRepo.saveDocument(documentAttrs);
  return { filePath: client.getBlobUrl(readmeBlob.name) };
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
  //get authtoken for the logged in user mobile number
  const prismAuthToken = await patientsRepo.getPrismAuthToken(mobileNumber);
  if (!prismAuthToken) return { status: false, fileId: '' };

  //get users list for the mobile number
  const prismUserList = await patientsRepo.getPrismUsersList(mobileNumber, prismAuthToken);

  //check if current user uhid matches with response uhids
  const uhid = await patientsRepo.validateAndGetUHID(args.patientId, prismUserList);

  if (!uhid) {
    return { status: false, fileId: '' };
  }

  //get authtoken for the logged in user mobile number
  const prismUHIDAuthToken = await patientsRepo.getPrismAuthTokenByUHID(uhid);

  if (!prismUHIDAuthToken) return { status: false, fileId: '' };

  //just call get prism user details with the corresponding uhid
  await patientsRepo.getPrismUsersDetails(uhid, prismUHIDAuthToken);

  const uploadDocInput = {
    ...args,
    category: PRISM_DOCUMENT_CATEGORY.OpSummary,
  };

  const fileId = await patientsRepo.uploadDocumentToPrism(uhid, prismUHIDAuthToken, uploadDocInput);

  //upload file to blob storage & save to appointment documents
  uploadFileToBlobStorage(
    args.fileType,
    args.base64FileInput,
    appointmentDetails,
    fileId,
    consultsDb
  );

  return fileId ? { status: true, fileId } : { status: false, fileId: '' };
};

const uploadFileToBlobStorage = async (
  fileType: UPLOAD_FILE_TYPES,
  base64FileInput: string,
  appointmentDetails: Appointment,
  fileId: string | null,
  consultsDb: Connection
) => {
  let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  const randomNumber = Math.floor(Math.random() * 10000);
  const fileName =
    format(new Date(), 'ddmmyyyy-HHmmss') + '_' + randomNumber + '.' + fileType.toLowerCase();
  const uploadPath = assetsDir + '/' + fileName;
  fs.writeFile(uploadPath, base64FileInput, { encoding: 'base64' }, (err) => {
    console.log(err);
  });
  const client = new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API,
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );

  if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'dev') {
    await client
      .deleteContainer()
      .then((res) => console.log(res))
      .catch((error) => console.log('error deleting', error));

    await client
      .setServiceProperties()
      .then((res) => console.log(res))
      .catch((error) => console.log('error setting service properties', error));

    await client
      .createContainer()
      .then((res) => console.log(res))
      .catch((error) => console.log('error creating', error));
  }

  await client
    .testStorageConnection()
    .then((res) => console.log(res))
    .catch((error) => console.log('error testing', error));

  const localFilePath = assetsDir + '/' + fileName;
  const readmeBlob = await client
    .uploadFile({ name: fileName, filePath: localFilePath })
    .catch((error) => {
      throw error;
    });
  fs.unlinkSync(localFilePath);

  const documentAttrs: Partial<AppointmentDocuments> = {
    documentPath: client.getBlobUrl(readmeBlob.name),
    prismFileId: fileId || '',
    appointment: appointmentDetails,
  };
  const appointmentDocumentRepo = consultsDb.getCustomRepository(AppointmentDocumentRepository);
  appointmentDocumentRepo.saveDocument(documentAttrs);

  //return client.getBlobUrl(readmeBlob.name);
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
  //access check
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //check appointment id
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.findById(args.appointmentId);
  if (appointmentData == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //if (args.prismFileId.length == 0) throw new AphError(AphErrorMessages.INVALID_DOCUMENT_PATH);

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

export const uploadChatDocumentResolvers = {
  Mutation: {
    uploadChatDocument,
    uploadChatDocumentToPrism,
    addChatDocument,
    removeChatDocument,
  },
};
