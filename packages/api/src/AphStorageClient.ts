import { createBlobService } from 'azure-storage';

const blobService = createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);

export const AphStorageClient = {
  blobService,
};
