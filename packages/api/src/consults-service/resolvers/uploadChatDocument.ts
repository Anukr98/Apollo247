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
import { AppointmentDocuments } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AppointmentDocumentRepository } from 'consults-service/repositories/appointmentDocumentRepository';

export const uploadChatDocumentTypeDefs = gql`
  type UploadChatDocumentResult {
    filePath: String
  }

  type UploadedDocumentDetails {
    id: String
    filePath: String
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

    addChatDocument(appointmentId: ID!, documentPath: String!): UploadedDocumentDetails
    removeChatDocument(documentPathId: ID!): ChatDocumentDeleteResult
  }
`;
type UploadChatDocumentResult = {
  filePath: string;
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
  const fileName = format(new Date(), 'ddmmyyyy-HHmmss') + '.' + args.fileType.toLowerCase();
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

type UploadedDocumentDetails = {
  id: string;
  filePath: string;
};

const addChatDocument: Resolver<
  null,
  { appointmentId: string; documentPath: string },
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

  if (args.documentPath.length == 0) throw new AphError(AphErrorMessages.INVALID_DOCUMENT_PATH);

  const documentAttrs: Partial<AppointmentDocuments> = {
    documentPath: args.documentPath,
    appointment: appointmentData,
  };
  const appointmentDocumentRepo = consultsDb.getCustomRepository(AppointmentDocumentRepository);
  const appointmentDocuments = await appointmentDocumentRepo.saveDocument(documentAttrs);
  return { id: appointmentDocuments.id, filePath: appointmentDocuments.documentPath };
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
    addChatDocument,
    removeChatDocument,
  },
};
