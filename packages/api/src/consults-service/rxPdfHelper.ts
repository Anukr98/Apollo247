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
    doc.image(loadAsset('apollo-logo.png'), margin, margin / 2, { height: 85 });

    doc
      .fontSize(9.5)
      .text('1860 500 1066', 370, margin)
      .moveDown(0.5)
      .text('Apollo Hospitals')
      .moveDown(0.5)
      .text('No. 1, Old No. 28, , Platform Road Near Mantri')
      .moveDown(0.5)
      .text('Square Mall, Hotel Swathi, Sheshadripuram')
      .moveDown(0.5)
      .text('Bangalore, KA 560020');

    drawHorizontalDivider(headerEndY)
      .moveDown()
      .moveDown()
      .text(`DATE - ${format(faker.date.recent(), 'dd/MM/yy')}`, { align: 'right' });
  };

  const renderPrescriptions = (prescriptions: RxPdfData['prescriptions']) => {
    const rx = loadAsset('rx-icon.png');
    doc
      .image(rx, margin, headerEndY + 40, { width: 35 })
      .fillColor('blue')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('PRESCRIPTION', margin, headerEndY + 100);

    prescriptions.forEach((prescription, index) => {
      doc.fillColor('black').moveDown();

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(`${index + 1}. ${prescription.name.toUpperCase()}`, margin)
        .moveDown(0.4);

      const detailIndentX = margin + 30;

      if (prescription.ingredients.length > 0) {
        doc
          .font('Helvetica-Oblique')
          .fontSize(8)
          .text(prescription.ingredients.join(', '), detailIndentX)
          .moveDown(0.4);
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(prescription.frequency, detailIndentX)
        .moveDown(0.4);

      if (prescription.instructions) {
        doc
          .font('Helvetica-Oblique')
          .fontSize(10)
          .text(prescription.instructions, detailIndentX)
          .moveDown(0.4);
      }
    });
    doc.font('Helvetica').fontSize(10);
  };

  const renderFooter = () => {
    doc
      .fontSize(8)
      .text(
        'Disclaimer: The prescription has been issued based on your inputs during chat/call with the doctor. In case of emergency please visit a nearby hospital',
        margin,
        doc.page.height - 70,
        { align: 'center' }
      );
    drawHorizontalDivider(doc.page.height - 55);
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

const fakeCaseSheet = {
  medicinePrescription: JSON.stringify(
    _times(_random(2, 5), () => ({
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
