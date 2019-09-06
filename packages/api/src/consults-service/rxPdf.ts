import path from 'path';
import fs from 'fs';
import { buildRxPdfData } from 'consults-service/database/factories/rxPdfFactory';
import { generateRxPdfDocument } from 'consults-service/rxPdfGenerator';

const rxPdfData = buildRxPdfData();
const rxPdfDoc = generateRxPdfDocument(rxPdfData);
const assetsDir = path.resolve(`/Users/sarink/Projects/apollo-hospitals/packages/api/src/assets`);
const file = path.resolve(__dirname, assetsDir, 'rxPdfDoc.pdf');
rxPdfDoc.pipe(fs.createWriteStream(file));
