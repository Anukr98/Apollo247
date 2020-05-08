import gql from 'graphql-tag';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Resolver } from 'api-gateway';
import fs from 'fs';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { format } from 'date-fns';
import path from 'path';
import { ApiConstants } from 'ApiConstants';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const uploadDoctorSignatureTypeDefs = gql`
  type uploadDoctorSignatureResult {
    filePath: String
  }

  extend type Mutation {
    uploadDoctorSignature(
      doctorId: String!
      fileType: String!
      base64FileInput: String!
    ): uploadDoctorSignatureResult!
  }
`;
type uploadDoctorSignatureResult = {
  filePath: string;
};

const uploadDoctorSignature: Resolver<
  null,
  { doctorId: string; fileType: string; base64FileInput: string },
  DoctorsServiceContext,
  uploadDoctorSignatureResult
> = async (parent, args, { doctorsDb }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findDoctorByIdWithoutRelations(args.doctorId);
  if (!doctordata) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);

  let assetsDir = path.resolve(ApiConstants.ASSETS_DIR);
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }

  const fileName = args.doctorId + '.' + args.fileType.toLowerCase();
  const uploadPath = assetsDir + '/' + fileName;
  fs.writeFile(uploadPath, args.base64FileInput, { encoding: 'base64' }, (err) => {
    console.log(err);
  });
  const client = new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API_SIGNATURE,
    process.env.AZURE_STORAGE_CONTAINER_NAME_SIGNATURE
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
  const filePath = client.getBlobUrl(readmeBlob.name);

  doctorRepository.updateDoctorSignature(args.doctorId, filePath);

  return { filePath };
};

export const uploadDoctorSignatureResolvers = {
  Mutation: {
    uploadDoctorSignature,
  },
};
