import { format } from 'date-fns';
import faker from 'faker';
import path from 'path';
import PDFDocument from 'pdfkit';

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

export const buildRxPdfDocument = (rxPdfData: RxPdfData): typeof PDFDocument => {
  const margin = 35;

  const doc = new PDFDocument({ margin });

  const drawHorizontalDivider = (y: number) => {
    return doc
      .moveTo(margin, y)
      .lineTo(doc.page.width - margin, y)
      .lineWidth(1)
      .opacity(0.7)
      .stroke();
  };

  const setY = (y: number) => {
    const up = doc.y > y;
    if (up) while (doc.y > y) doc.moveUp(0.01);
    else while (doc.y < y) doc.moveDown(0.01);
    return doc;
  };

  const pageBreak = () => {
    doc.flushPages();
    setY(doc.page.height);
    return doc;
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
      .text(`DATE - ${format(new Date(), 'dd/MM/yy')}`, { align: 'right' });
    doc.font('Helvetica-Bold');
  };

  const renderFooter = () => {
    const disclaimerText =
      'Disclaimer: The prescription has been issued based on your inputs during chat/call with the doctor. In case of emergency please visit a nearby hospital';
    doc
      .font('Helvetica')
      .fontSize(8)
      .text(disclaimerText, margin, doc.page.height - 70, { align: 'center' });
    drawHorizontalDivider(doc.page.height - 55);
    return doc;
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

      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }

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

  doc.on('pageAdded', () => {
    renderFooter();
    renderHeader();
  });
  renderFooter();
  renderHeader();
  renderPrescriptions(rxPdfData.prescriptions);

  doc.end();

  return doc;
};
