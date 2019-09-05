import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import {
  buildCaseSheet,
  CaseSheetMedicinePrescription,
} from 'consults-service/database/factories/caseSheetFactory';
import { CaseSheet } from 'consults-service/entities';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';
import { RxPdfData, buildRxPdfDocument } from 'consults-service/rxPdfBuilder';
import fs from 'fs';
import gql from 'graphql-tag';
import _capitalize from 'lodash/capitalize';
import _random from 'lodash/random';
import _times from 'lodash/times';
import path from 'path';
import uuid from 'uuid/v4';
import faker from 'faker';

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

export const caseSheetToRxPdfData = (
  caseSheet: Partial<CaseSheet> & { medicinePrescription: CaseSheet['medicinePrescription'] }
): RxPdfData => {
  const caseSheetMedicinePrescription = JSON.parse(
    caseSheet.medicinePrescription
  ) as CaseSheetMedicinePrescription[];

  const prescriptions = caseSheetMedicinePrescription.map((csRx) => {
    const name = csRx.medicineName;
    const ingredients = _times(
      _random(0, 3),
      () => `${faker.commerce.productName().toLowerCase()} ${_random(1, 4)}%`
    );
    const timings = csRx.medicineTimings.map(_capitalize).join(', ');
    const frequency = `${csRx.medicineDosage} (${timings}) for ${csRx.medicineConsumptionDurationInDays} days`;
    const instructions = csRx.medicineInstructions;
    return { name, ingredients, frequency, instructions };
  });
  return { prescriptions };
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
  const rxPdfDoc = buildRxPdfDocument(rxPdfData);
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

/////////////////////////////////////////////////////////////////////////////////////

const fakeCaseSheet = buildCaseSheet();
const rxPdfData = caseSheetToRxPdfData(fakeCaseSheet);
const rxPdfDoc = buildRxPdfDocument(rxPdfData);
const assetsDir = path.resolve(`/Users/sarink/Projects/apollo-hospitals/packages/api/src/assets`);
const file = path.resolve(__dirname, assetsDir, 'rxPdfDoc.pdf');
rxPdfDoc.pipe(fs.createWriteStream(file));
