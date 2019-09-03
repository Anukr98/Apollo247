import gql from 'graphql-tag';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { Resolver } from 'api-gateway';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import fs from 'fs';
import uuid from 'uuid/v4';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import path from 'path';
import { rxPdfDataToRxPdfDocument, caseSheetToRxPdfData } from 'consults-service/rxPdfHelper';

export const rxPdfTypeDefs = gql`
  input RxPdfInput {
    caseSheetId: ID!
  }
`;

type GenerateRxPdfInputArgs = {
  caseSheetId: string;
};

type GenerateRxPdfResult = {
  rxPdfDocUrl: string;
};

const generateRxPdf: Resolver<
  null,
  GenerateRxPdfInputArgs,
  ConsultServiceContext,
  GenerateRxPdfResult
> = async (parent, { caseSheetId }, { consultsDb }) => {
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const caseSheet = await caseSheetRepo.findOneOrFail(caseSheetId);
  const rxPdfData = caseSheetToRxPdfData(caseSheet);
  const rxPdfDoc = rxPdfDataToRxPdfDocument(rxPdfData);
  const name = `${uuid()}.pdf`;
  const filePath = path.resolve(__dirname, name);
  rxPdfDoc.pipe(fs.createWriteStream(name));
  const client = new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API,
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );
  const rxPdfDocBlob = await client.uploadFile({ name, filePath });
  const rxPdfDocUrl = rxPdfDocBlob.url;
  fs.unlink(filePath, (error) => console.log(error));
  return { rxPdfDocUrl };
};

export const rxPdfResolvers = {
  Query: {
    generateRxPdf,
  },
};
