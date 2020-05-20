import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Resolver } from 'api-gateway';
import { UPLOAD_FILE_TYPES, PRISM_DOCUMENT_CATEGORY } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import fs from 'fs';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { format } from 'date-fns';
import path from 'path';

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

  extend type Mutation {
    uploadDocument(uploadDocumentInput: UploadDocumentInput): UploadPrismDocumentResult!
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
  const blobUrl = await uploadFileToBlobStorage(uploadDocumentInput);

  //get authtoken for the logged in user mobile number
  const prismAuthToken = await patientsRepo.getPrismAuthToken(mobileNumber);

  if (!prismAuthToken) return { status: false, fileId: '', filePath: blobUrl };

  //get users list for the mobile number
  const prismUserList = await patientsRepo.getPrismUsersList(mobileNumber, prismAuthToken);
  console.log(prismUserList);

  //check if current user uhid matches with response uhids
  const uhid = await patientsRepo.validateAndGetUHID(uploadDocumentInput.patientId, prismUserList);

  if (!uhid) {
    return { status: false, fileId: '', filePath: blobUrl };
  }

  //get authtoken for the logged in user mobile number
  const prismUHIDAuthToken = await patientsRepo.getPrismAuthTokenByUHID(uhid);

  if (!prismUHIDAuthToken) return { status: false, fileId: '', filePath: blobUrl };

  //just call get prism user details with the corresponding uhid
  await patientsRepo.getPrismUsersDetails(uhid, prismUHIDAuthToken);

  const fileId = await patientsRepo.uploadDocumentToPrism(
    uhid,
    prismUHIDAuthToken,
    uploadDocumentInput
  );

  return fileId
    ? { status: true, fileId, filePath: blobUrl }
    : { status: false, fileId: '', filePath: blobUrl };
};

const uploadFileToBlobStorage = async (args: UploadDocumentInput) => {
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
  return client.getBlobUrl(readmeBlob.name);
};

export const uploadDocumentResolvers = {
  Mutation: {
    uploadDocument,
  },
};
