import PDFDocument from 'pdfkit';
import faker from 'faker';
import fs from 'fs';
import path from 'path';
import _sample from 'lodash/sample';
import _times from 'lodash/times';
import _random from 'lodash/random';
import { format } from 'date-fns';

const dir = (file: string) =>
  path.resolve(`/Users/sarink/Projects/apollo-hospitals/packages/api/src/pdf/${file}`);

const margin = 25;

const doc = new PDFDocument({ margin });

doc.pipe(fs.createWriteStream(dir('output.pdf')));

const drawHorizontalDivider = (y: number) => {
  const origPos = { x: doc.x, y: doc.y };
  doc
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

  drawHorizontalDivider(headerEndY);
};

const renderPatientInfo = () => {
  doc
    .text('', margin, headerEndY)
    .moveDown()
    .text(`Name - ${faker.name.findName()}`)
    .moveUp()
    .text(`Date - ${format(faker.date.recent(), 'dd/MM/yy')}`, { align: 'right' })
    .text(`Age - ${faker.random.number({ min: 1, max: 120 })}`)
    .text(`Sex - ${_sample(['Male', 'Female', 'Other'])}`);
};

const renderPrescriptionsHeader = () => {
  const rx = dir('rx.png');
  doc.image(rx, margin, 200, { width: 35 });
  doc.text('Prescription', margin, 250, { underline: true });
};

const renderPrescriptions = () => {
  interface Prescription {
    name: string;
    ingredients: string[];
    frequency: string;
    instructions?: string;
  }

  const buildPrescription = (): Prescription => {
    const name = faker.commerce.productName();
    const ingredients = _times(
      _random(1, 5),
      () => `${faker.commerce.product()} ${_random(1, 10)}%`
    );
    const frequency = faker.hacker.phrase();
    const instructions = faker.random.boolean() ? faker.lorem.sentences(_random(2, 5)) : undefined;
    return { name, ingredients, frequency, instructions };
  };

  const prescriptions = _times(_random(1, 5), () => buildPrescription());
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
renderPatientInfo();
renderPrescriptionsHeader();
renderPrescriptions();

doc.end();
