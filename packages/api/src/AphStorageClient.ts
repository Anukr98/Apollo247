import { createBlobService } from 'azure-storage';
import uuid from 'uuid/v4';

const container = process.env.BLOB_STORAGE_CONTAINER_NAME;
const publicAccessLevel = 'container';

const blobService = createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);

const deleteContainer = () =>
  process.env.NODE_ENV !== 'local'
    ? Promise.resolve()
    : new Promise((resolve, reject) =>
        blobService.deleteContainerIfExists(container, (error, result, response) => {
          console.log('deleting blob container...');
          if (result) console.log(`container "${container}" deleted successfully`);
          if (!result) console.log(`container "${container}" doesn't exist, skipping deletion`);
          if (response) console.log('response', response);
          resolve();
        })
      );

const createContainer = () =>
  new Promise((resolve, reject) =>
    blobService.createContainerIfNotExists(
      container,
      { publicAccessLevel },
      (error, result, response) => {
        console.log('creating blob container...');
        if (error) throw error;
        if (result) console.log(`container "${container}" created successfully`);
        if (!result) console.log(`container "${container}" already exists, skipping creation`);
        if (response) console.log('response', response);
        resolve();
      }
    )
  );

const testBlobConnection = () =>
  new Promise((resolve, reject) =>
    blobService.getServiceProperties((error, result, response) => {
      console.log('testing blob connection...');
      if (error) throw error;
      if (result) console.log('result', result);
      if (response) console.log('response', response);
      resolve();
    })
  );

const initStoragePromise = testBlobConnection().then(() =>
  deleteContainer().then(() => createContainer())
);

// Idk why we can't import this from azure-storage, just find the type by following function paramters
type BlobResult = Parameters<Parameters<typeof blobService.createBlockBlobFromLocalFile>[3]>[1];

const uploadBlob = async ({ name = uuid(), file }: { name?: string; file: string }) => {
  await initStoragePromise;
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
