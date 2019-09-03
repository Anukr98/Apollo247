import { format } from 'date-fns';
import PDFDocument from 'pdfkit';
import path from 'path';
import faker from 'faker';
import fs from 'fs';
import _times from 'lodash/times';
import _random from 'lodash/random';

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
  const margin = 25;

  const doc = new PDFDocument({ margin });

  const drawHorizontalDivider = (y: number) => {
    const origPos = { x: doc.x, y: doc.y };
    return doc
      .moveTo(margin, y)
      .lineTo(doc.page.width - margin, y)
      .lineWidth(1)
      .opacity(0.7)
      .stroke()
      .moveTo(origPos.x, origPos.y);
  };

  const headerEndY = 140;

  const renderHeader = () => {
    const logo = loadAsset('apollo-logo.png');
    doc.image(logo, margin, margin / 2, { height: 85 });

    doc
      .text(faker.phone.phoneNumber('#### ### ###'), 400, margin)
      .text('Apollo Hospitals')
      .text(`${faker.address.streetAddress()}`)
      .text(`${faker.address.streetName()}, ${faker.address.streetName()}`)
      .text(faker.address.city())
      .text(
        `${faker.address.city()}, ${faker.address.stateAbbr()} ${faker.address.zipCode('######')}`
      );

    drawHorizontalDivider(headerEndY)
      .text('', margin, headerEndY)
      .text(`Date - ${format(faker.date.recent(), 'dd/MM/yy')}`, { align: 'right' });
  };

  const renderPrescriptionsHeader = () => {
    const rx = loadAsset('rx-icon.png');
    doc.image(rx, margin, 200, { width: 35 });
    doc.text('Prescription', margin, 250, { underline: true });
  };

  const renderPrescriptions = (prescriptions: RxPdfData['prescriptions']) => {
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

  renderHeader();
  renderPrescriptionsHeader();
  renderPrescriptions(rxPdfData.prescriptions);

  doc.end();

  return doc;
};

const rxPdfData = {
  prescriptions: _times(_random(1, 5), () => {
    const name = faker.commerce.productName();
    const ingredients = _times(
      _random(1, 5),
      () => `${faker.commerce.product()} ${_random(1, 10)}%`
    );
    const frequency = faker.hacker.phrase();
    const instructions = faker.random.boolean() ? faker.lorem.sentences(_random(2, 5)) : undefined;
    return { name, ingredients, frequency, instructions };
  }),
};
const rxPdfDoc = rxPdfDataToRxPdfDocument(rxPdfData);
const file = path.resolve(__dirname, assetsDir, 'rxPdfDoc.pdf');
rxPdfDoc.pipe(fs.createWriteStream(file));
