import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import fs from 'fs';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { format } from 'date-fns';
import path from 'path';

export const uploadFileTypeDefs = gql`
  enum UPLOAD_FILE_TYPES {
    JPG
    PNG
    JPEG
    PDF
  }

  type UploadFileResult {
    filePath: String
  }

  extend type Mutation {
    uploadFile(fileType: String, base64FileInput: String): UploadFileResult!
  }
`;
type UploadFileResult = {
  filePath: string;
};

const uploadFile: Resolver<
  null,
  { fileType: string; base64FileInput: string },
  ProfilesServiceContext,
  UploadFileResult
> = async (parent, args, { profilesDb }) => {
  let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  const randomNumber = Math.floor(Math.random() * 10000);
  const fileName =
    format(new Date(), 'ddmmyyyy-HHmmss') + '_' + randomNumber + '.' + args.fileType.toLowerCase();
  const uploadPath = assetsDir + '/' + fileName;
  fs.writeFile(uploadPath, args.base64FileInput, { encoding: 'base64' }, (err) => {
  });
  const client = new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API,
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );

  if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'dev') {
    await client
      .deleteContainer()
      .then((res) => null)
      .catch((error) => null);
    await client
      .setServiceProperties()
      .then((res) => null)
      .catch((error) => null);
    await client
      .createContainer()
      .then((res) => null)
      .catch((error) => null);
  }
  await client
    .testStorageConnection()
    .then((res) => null)
    .catch((error) => null);

  const localFilePath = assetsDir + '/' + fileName;
  const readmeBlob = await client
    .uploadFile({ name: fileName, filePath: localFilePath })
    .catch((error) => {
      throw error;
    });
  fs.unlinkSync(localFilePath);
  return { filePath: client.getBlobUrl(readmeBlob.name) };
};

export const uploadFileResolvers = {
  Mutation: {
    uploadFile,
  },
};
