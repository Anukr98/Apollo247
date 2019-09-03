import { format } from 'date-fns';
import PDFDocument from 'pdfkit';
import path from 'path';
import faker from 'faker';
import fs from 'fs';
import _capitalize from 'lodash/capitalize';
import _random from 'lodash/random';
import _sample from 'lodash/sample';
import _times from 'lodash/times';
import { CaseSheet } from 'consults-service/entities';
import uuid from 'uuid/v4';

export interface RxPdfData {
  prescriptions: {
    name: string;
    ingredients: string[];
    frequency: string;
    instructions?: string;
  }[];
}

const assetsDir = path.resolve(`/Users/sarink/Projects/apollo-hospitals/packages/api/src/assets`);

const loadAsset = (file: string) => path.resolve(assetsDir, file);

export const rxPdfDataToRxPdfDocument = (rxPdfData: RxPdfData): typeof PDFDocument => {
  const margin = 35;

  const doc = new PDFDocument({ margin });

  const drawHorizontalDivider = (y: number) => {
    const origPos = { x: doc.x, y: doc.y };
    return doc
      .moveTo(margin, y)
      .lineTo(doc.page.width - margin, y)
      .lineWidth(1)
      .opacity(0.7)
      .stroke();
    // .moveTo(origPos.x, origPos.y);
  };

  const headerEndY = 120;

  const renderHeader = () => {
    const logo = loadAsset('apollo-logo.png');
    doc.image(logo, margin, margin / 2, { height: 85 });

    doc
      .text('1860 500 1066', 320, margin)
      .text('Apollo Hospitals')
      .text('No. 1, Old No. 28, , Platform Road Near Mantri')
      .text('Square Mall, Hotel Swathi, Sheshadripuram')
      .text('Bangalore, KA 560020');

    drawHorizontalDivider(headerEndY)
      .moveDown()
      .moveDown()
      .text(`DATE - ${format(faker.date.recent(), 'dd/MM/yy')}`, { align: 'right' });
  };

  const renderPrescriptions = (prescriptions: RxPdfData['prescriptions']) => {
    const rx = loadAsset('rx-icon.png');
    doc.image(rx, margin, headerEndY + 40, { width: 35 });
    doc.text('Prescription', margin, headerEndY + 100, { underline: true });
    prescriptions.forEach((prescription, index) => {
      doc
        .text('')
        .moveDown()
        .text(`${index + 1}. ${prescription.name}`)
        .text(prescription.ingredients.join(', '))
        .text(prescription.frequency);
      if (prescription.instructions) doc.text(prescription.instructions);
    });
  };

  const renderFooter = () => {
    return doc;
  };

  renderHeader();
  renderPrescriptions(rxPdfData.prescriptions);
  renderFooter();

  doc.end();

  return doc;
};

enum MEDICINE_TIMINGS {
  EVENING = 'EVENING',
  MORNING = 'MORNING',
  NIGHT = 'NIGHT',
  NOON = 'NOON',
}

enum MEDICINE_TO_BE_TAKEN {
  AFTER_FOOD = 'AFTER_FOOD',
  BEFORE_FOOD = 'BEFORE_FOOD',
}

type CaseSheetMedicinePrescription = {
  medicineConsumptionDurationInDays: string;
  medicineDosage: string;
  medicineInstructions: string;
  medicineTimings: [MEDICINE_TIMINGS];
  medicineToBeTaken: [MEDICINE_TO_BE_TAKEN];
  medicineName: string;
  id: string;
};

export const caseSheetToRxPdfData = (
  caseSheet: Partial<CaseSheet> & { medicinePrescription: CaseSheet['medicinePrescription'] }
): RxPdfData => {
  const caseSheetMedicinePrescription = JSON.parse(
    caseSheet.medicinePrescription
  ) as CaseSheetMedicinePrescription[];
  console.log(caseSheetMedicinePrescription);

  const prescriptions = caseSheetMedicinePrescription.map((csRx) => {
    const name = csRx.medicineName;
    const ingredients = ['Ingredients unknown'];
    const timings = csRx.medicineTimings.map(_capitalize).join(', ');
    const frequency = `${csRx.medicineDosage} (${timings}) for ${csRx.medicineConsumptionDurationInDays} days`;
    const instructions = csRx.medicineInstructions;
    return { name, ingredients, frequency, instructions };
  });
  return { prescriptions };
};

const fakeCaseSheet = {
  medicinePrescription: JSON.stringify(
    _times(_random(1, 6), () => ({
      id: uuid(),
      medicineName: faker.commerce.productName(),
      medicineConsumptionDurationInDays: _random(3, 20),
      medicineDosage: `${_random(1, 2)} times/day`,
      medicineInstructions: faker.random.boolean ? faker.lorem.sentences(_random(1, 5)) : null,
      medicineTimings: [_sample(['EVENING', 'MORNING', 'NIGHT', 'NOON'])],
      medicineToBeTaken: _sample(['AFTER_FOOD', 'BEFORE_FOOD']),
    }))
  ),
};
const rxPdfData = caseSheetToRxPdfData(fakeCaseSheet);
const rxPdfDoc = rxPdfDataToRxPdfDocument(rxPdfData);
const file = path.resolve(__dirname, assetsDir, 'rxPdfDoc.pdf');
rxPdfDoc.pipe(fs.createWriteStream(file));
