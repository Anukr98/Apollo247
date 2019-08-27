import { createBlobService } from 'azure-storage';
import uuid from 'uuid/v4';

const container = process.env.BLOB_STORAGE_CONTAINER_NAME;

const blobService = createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);

if (process.env.NODE_ENV === 'local') {
  blobService.createContainerIfNotExists(container, (error, result) => {
    if (error) console.log('error creating blob container', error);
    if (result) console.log('blob container', container, 'successfully created');
  });
}

blobService.getServiceProperties((error, result, response) => {
  console.log('connecting to blob storage...');
  if (error) console.log('error', error);
  if (result) console.log('result', result);
  if (response) console.log('response', response);
});

// Idk why we can't import this from azure-storage, just find the type by following function paramters
type BlobResult = Parameters<Parameters<typeof blobService.createBlockBlobFromLocalFile>[3]>[1];
const uploadBlob = ({ name = uuid(), file }: { name?: string; file: string }) =>
  new Promise<BlobResult>((resolve, reject) =>
    blobService.createBlockBlobFromLocalFile(container, name, file, (error, result) =>
      !error ? resolve(result) : reject(error)
    )
  );

const getBlobUrl = (name: string) => blobService.getUrl(container, name);

export const AphStorageClient = {
  uploadBlob,
  getBlobUrl,
};
