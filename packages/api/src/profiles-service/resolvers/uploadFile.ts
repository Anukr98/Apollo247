import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import fs from 'fs';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { format } from 'date-fns';

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
  const fileName = format(new Date(), 'ddmmyyyy-HHmmss') + '.' + args.fileType.toLowerCase();
  const uploadPath = '/apollo-uploads/' + fileName;
  fs.writeFile(uploadPath, args.base64FileInput, { encoding: 'base64' }, (err) => {
    console.log(err);
  });
  fs.writeFile(fileName, args.base64FileInput, { encoding: 'base64' }, (err) => {
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

  //const localFilePath = '/apollo-hospitals/packages/api/' + fileName;
  const localFilePath = '/apollo-uploads/' + fileName;
  console.log(`uploading ${localFilePath}`);
  const readmeBlob = await client
    .uploadFile({ name: fileName, filePath: localFilePath })
    .catch((error) => {
      console.log('error final', error);
      throw error;
    });
  /*console.log('file saved!', readmeBlob.url);
  if (!readmeBlob.url) {
    throw new AphError(AphErrorMessages.FILE_SAVE_ERROR, undefined, {});
  }*/
  fs.unlinkSync(localFilePath);
  console.log(readmeBlob.name, readmeBlob, 'readme blob');
  return { filePath: fileName };
};

export const uploadFileResolvers = {
  Mutation: {
    uploadFile,
  },
};
