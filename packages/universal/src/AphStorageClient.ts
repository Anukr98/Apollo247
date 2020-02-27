import {
  Aborter,
  BlobUploadCommonResponse,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  StorageURL,
  uploadBrowserDataToBlockBlob,
  uploadFileToBlockBlob,
  AnonymousCredential,
  SharedKeyCredential,
} from '@azure/storage-blob';
import uuid from 'uuid/v4';
import { webDoctorsBaseUrl, webPatientsBaseUrl } from './aphRoutes';

// For some reason blobs don't have their name, build our own AphBlob for convenience.
interface AphBlob extends BlobUploadCommonResponse {
  name: string;
}

const parseConnectionString = (connString: string) => {
  type ConnectionStringKeys =
    | 'BlobEndpoint'
    | 'AccountName'
    | 'AccountKey'
    | 'SharedAccessSignature';
  const parsed = connString.split(';').reduce((accParsed, part) => {
    const splitIndex = part.indexOf('=');
    const key = part.substring(0, splitIndex) as ConnectionStringKeys;
    const val = part.substring(splitIndex + 1);
    return { ...accParsed, [key]: val };
  }, {});
  return parsed as Record<ConnectionStringKeys, string>;
};

const getServiceUrl = (connString: string) => {
  const parsedConn = parseConnectionString(connString);
  const blobEndpoint = parsedConn.BlobEndpoint;

  const isSharedKeyAuth = !!parsedConn.AccountName && !!parsedConn.AccountKey;
  if (isSharedKeyAuth) {
    const sharedKeyCredential = new SharedKeyCredential(
      parsedConn.AccountName,
      parsedConn.AccountKey
    );
    const pipeline = StorageURL.newPipeline(sharedKeyCredential);
    const serviceUrl = new ServiceURL(blobEndpoint, pipeline);
    return serviceUrl;
  }

  const isSasAuth = !!parsedConn.SharedAccessSignature;
  if (isSasAuth) {
    const anonymousCredential = new AnonymousCredential();
    const pipeline = StorageURL.newPipeline(anonymousCredential);
    const serviceUrl = new ServiceURL(
      `${blobEndpoint}?${parsedConn.SharedAccessSignature}`,
      pipeline
    );
    return serviceUrl;
  }

  throw new Error('Invalid AphStorageClient connection string');
};

export class AphStorageClient {
  private serviceUrl: ServiceURL;
  private containerUrl: ContainerURL;

  constructor(connectionString: string, containerName: string) {
    this.serviceUrl = getServiceUrl(connectionString);
    this.containerUrl = ContainerURL.fromServiceURL(this.serviceUrl, containerName);
  }

  testStorageConnection = () => this.serviceUrl.getProperties(Aborter.none);

  deleteContainer = () => this.containerUrl.delete(Aborter.none);

  setServiceProperties = () =>
    this.serviceUrl.setProperties(Aborter.none, {
      cors: [
        {
          allowedOrigins: webPatientsBaseUrl(),
          allowedHeaders:
            'x-ms-blob-type, x-ms-version, x-ms-client-request-id, x-ms-blob-content-type, content-length, accept',
          allowedMethods: 'PUT',
          exposedHeaders: '*',
          maxAgeInSeconds: 3600,
        },
        {
          allowedOrigins: webDoctorsBaseUrl(),
          allowedHeaders:
            'x-ms-blob-type, x-ms-version, x-ms-client-request-id, x-ms-blob-content-type, content-length, accept',
          allowedMethods: 'PUT',
          exposedHeaders: '*',
          maxAgeInSeconds: 3600,
        },
      ],
    });

  createContainer = () => this.containerUrl.create(Aborter.none, { access: 'container' });

  uploadBrowserFile = async ({
    name = uuid(),
    file,
  }: {
    name?: Parameters<typeof BlobURL.fromContainerURL>[1];
    file: Parameters<typeof uploadBrowserDataToBlockBlob>[1];
  }) => {
    const blockBlobUrl = BlockBlobURL.fromBlobURL(
      BlobURL.fromContainerURL(this.containerUrl, name)
    );
    const blob = await uploadBrowserDataToBlockBlob(Aborter.none, file, blockBlobUrl);
    const aphBlob: AphBlob = { ...blob, name };
    return aphBlob;
  };
  uploadPdfBrowserFile = async ({
    name = uuid()+'.pdf',
    file,
  }: {
    name?: Parameters<typeof BlobURL.fromContainerURL>[1];
    file: Parameters<typeof uploadBrowserDataToBlockBlob>[1];
  }) => {
    const blockBlobUrl = BlockBlobURL.fromBlobURL(
      BlobURL.fromContainerURL(this.containerUrl, name)
    );
    const blob = await uploadBrowserDataToBlockBlob(Aborter.none, file, blockBlobUrl);
    const aphBlob: AphBlob = { ...blob, name };
    return aphBlob;
  };
  uploadFile = async ({
    name = uuid(),
    filePath,
  }: {
    name?: Parameters<typeof BlobURL.fromContainerURL>[1];
    filePath: Parameters<typeof uploadFileToBlockBlob>[1];
  }) => {
    const blockBlobUrl = BlockBlobURL.fromBlobURL(
      BlobURL.fromContainerURL(this.containerUrl, name)
    );
    const blob = await uploadFileToBlockBlob(Aborter.none, filePath, blockBlobUrl);
    const aphBlob: AphBlob = { ...blob, name };
    return aphBlob;
  };

  getBlobUrl = (blobName: string) =>
    BlockBlobURL.fromBlobURL(BlobURL.fromContainerURL(this.containerUrl, blobName)).url;
}
