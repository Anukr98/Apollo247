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

export const uploadChatDocumentTypeDefs = gql`
  type UploadChatDocumentResult {
    filePath: String
  }

  extend type Mutation {
    uploadChatDocument(
      appointmentId: String
      fileType: String
      base64FileInput: String
    ): UploadChatDocumentResult!
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
  await appointmentRepo.saveDocument(documentAttrs);
  return { filePath: client.getBlobUrl(readmeBlob.name) };
};

export const uploadChatDocumentResolvers = {
  Mutation: {
    uploadChatDocument,
  },
};
