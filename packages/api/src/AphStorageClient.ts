import { createBlobService } from 'azure-storage';
import uuid from 'uuid/v4';

const container = process.env.BLOB_STORAGE_CONTAINER_NAME;

const blobService = createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);

const createContainerPromise = new Promise((resolve, reject) =>
  blobService.createContainerIfNotExists(container, (error, result, response) => {
    console.log('creating blob container...', container);
    if (error) throw error;
    if (result) console.log(`container "${container}" already exists, skipping creation`);
    if (!result) console.log(`container "${container}" created successfully`);
    if (response) console.log('response', response);
    resolve();
  })
);

const testBlobConnectionPromise = new Promise((resolve, reject) =>
  blobService.getServiceProperties((error, result, response) => {
    console.log('testing blob connection...');
    if (error) throw error;
    if (result) console.log('result', result);
    if (response) console.log('response', response);
    resolve();
  })
);

const initStorage = () => Promise.all([createContainerPromise, testBlobConnectionPromise]);

// Idk why we can't import this from azure-storage, just find the type by following function paramters
type BlobResult = Parameters<Parameters<typeof blobService.createBlockBlobFromLocalFile>[3]>[1];

const uploadBlob = async ({ name = uuid(), file }: { name?: string; file: string }) => {
  await initStorage();
  return new Promise<BlobResult>((resolve, reject) =>
    blobService.createBlockBlobFromLocalFile(container, name, file, (error, result) =>
      !error ? resolve(result) : reject(error)
    )
  );
};

const getBlobUrl = (name: string) => blobService.getUrl(container, name);

export const AphStorageClient = {
  uploadBlob,
  getBlobUrl,
};
