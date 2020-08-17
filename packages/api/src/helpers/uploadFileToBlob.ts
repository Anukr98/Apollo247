import path from 'path';
import { format } from 'date-fns';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import fs from 'fs';
import PDFDocument from 'pdfkit';

export async function uploadFileToBlobStorage(
  fileType: string,
  base64FileInput: string
): Promise<string> {
  let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  const randomNumber = Math.floor(Math.random() * 10000);
  const fileName =
    format(new Date(), 'ddmmyyyy-HHmmss') + '_' + randomNumber + '.' + fileType.toLowerCase();
  const uploadPath = assetsDir + '/' + fileName;
  fs.writeFile(uploadPath, base64FileInput, { encoding: 'base64' }, (err) => {
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
}

export async function uploadPdfFileToBlobStorage(
  fileName: string,
  filePath: string
): Promise<string> {
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

  const readmeBlob = await client.uploadFile({ name: fileName, filePath }).catch((error) => {
    throw error;
  });
  fs.unlinkSync(filePath);
  return client.getBlobUrl(readmeBlob.name);
}

export function textInRow(doc: PDFKit.PDFDocument, text: string, heigth: number, st: number) {
  doc.y = heigth;
  doc.x = st;
  doc.fillColor('black');
  doc.text(text, {
    paragraphGap: 5,
    indent: 5,
    align: 'justify',
    columns: 1,
  });
  return doc;
}

export function writeRow(doc: PDFKit.PDFDocument, heigth: number) {
  doc
    .lineJoin('miter')
    .rect(30, heigth, 500, 20)
    .stroke();
  return doc;
}
