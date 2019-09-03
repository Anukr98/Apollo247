import PDFDocument from 'pdfkit';
import faker from 'faker';
import fs from 'fs';
import path from 'path';
import _times from 'lodash/times';
import _random from 'lodash/random';
import { format } from 'date-fns';
import { Gender } from 'profiles-service/entities';
import { randomEnum } from 'helpers/factoryHelpers';

// interface DiagnosticPrescription {
//   name: String;
// }

// enum MEDICINE_TIMINGS {
//   EVENING = 'EVENING',
//   MORNING = 'MORNING',
//   NIGHT = 'NIGHT',
//   NOON = 'NOON',
// }

// enum MEDICINE_TO_BE_TAKEN {
//   AFTER_FOOD = 'AFTER_FOOD',
//   BEFORE_FOOD = 'BEFORE_FOOD',
// }

// interface MedicinePrescription {
//   medicineConsumptionDurationInDays: String;
//   medicineDosage: String;
//   medicineInstructions: String;
//   medicineTimings: [MEDICINE_TIMINGS];
//   medicineToBeTaken: [MEDICINE_TO_BE_TAKEN];
//   medicineName: String;
//   id: String;
// }

interface RxPdfPrescription {
  name: string;
  ingredients: string[];
  frequency: string;
  instructions?: string;
}

interface RxPdfInput {
  prescriptions: RxPdfPrescription[];
}

const rxPdfInput: RxPdfInput = {
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

const dir = (file: string) =>
  path.resolve(`/Users/sarink/Projects/apollo-hospitals/packages/api/src/pdf/${file}`);

const margin = 25;

const doc = new PDFDocument({ margin });

doc.pipe(fs.createWriteStream(dir('output.pdf')));

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
  const logo = dir('logo.png');
  doc.image(logo, margin, margin / 2, { width: 150 });

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
  const rx = dir('rx.png');
  doc.image(rx, margin, 200, { width: 35 });
  doc.text('Prescription', margin, 250, { underline: true });
};

const renderPrescriptions = (prescriptions: RxPdfPrescription[]) => {
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
renderPrescriptions(rxPdfInput.prescriptions);

doc.end();
