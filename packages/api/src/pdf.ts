import PDFDocument from 'pdfkit';
import faker from 'faker';
import fs from 'fs';
import path from 'path';

const dir = (file: string) =>
  path.resolve(`/Users/sarink/Projects/apollo-hospitals/packages/api/src/pdf/${file}`);

const margin = 25;

const doc = new PDFDocument({ margin });

doc.pipe(fs.createWriteStream(dir('output.pdf')));

const buildHeader = () => {
  const logo = dir('logo.png');
  doc
    .image(logo, margin, margin, { width: 150 })
    .text(faker.company.companyName(), margin, margin, { align: 'right' })
    .text(`${faker.address.streetAddress()}`, { align: 'right' })
    .text(
      `${faker.address.city()}, ${faker.address.stateAbbr()} ${faker.address.zipCode('#####')}`,
      {
        align: 'right',
      }
    );
};

buildHeader();

doc.end();
