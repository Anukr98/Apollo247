import { format, getTime } from 'date-fns';
import path from 'path';
import PDFDocument from 'pdfkit';
import {
  RxPdfData,
  CaseSheet,
  CaseSheetMedicinePrescription,
  CaseSheetOtherInstruction,
  CaseSheetDiagnosis,
} from 'consults-service/entities';
import _capitalize from 'lodash/capitalize';
import _isEmpty from 'lodash/isEmpty';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import fs from 'fs';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { Connection } from 'typeorm';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

export const convertCaseSheetToRxPdfData = async (
  caseSheet: Partial<CaseSheet> & {
    medicinePrescription: CaseSheet['medicinePrescription'];
    otherInstructions: CaseSheet['otherInstructions'];
    diagnosis: CaseSheet['diagnosis'];
  },
  doctorsDb: Connection,
  patientsDb: Connection
): Promise<RxPdfData> => {
  const caseSheetMedicinePrescription = JSON.parse(
    JSON.stringify(caseSheet.medicinePrescription)
  ) as CaseSheetMedicinePrescription[];

  type PrescriptionData = {
    name: string;
    ingredients: string[];
    frequency: string;
    instructions: string;
  };

  let prescriptions: PrescriptionData[] | [];
  if (caseSheet.medicinePrescription == null || caseSheet.medicinePrescription == '') {
    prescriptions = [];
  } else {
    prescriptions = caseSheetMedicinePrescription.map((csRx) => {
      const name = csRx.medicineName;
      const ingredients = [] as string[];
      const timings = csRx.medicineTimings.map(_capitalize).join(', ');
      const frequency = `${
        csRx.medicineDosage
      } ${csRx.medicineUnit.toLowerCase()} (${timings}) for ${
        csRx.medicineConsumptionDurationInDays
      } days`;
      const instructions = csRx.medicineInstructions;
      return { name, ingredients, frequency, instructions } as PrescriptionData;
    });
  }

  const caseSheetOtherInstructions = JSON.parse(
    JSON.stringify(caseSheet.otherInstructions)
  ) as CaseSheetOtherInstruction[];

  type GeneralAdviceData = {
    title: string;
    description: string[];
  };
  let generalAdvice: GeneralAdviceData[] | [];

  if (caseSheet.otherInstructions == null || caseSheet.otherInstructions == '') {
    generalAdvice = [];
  } else {
    generalAdvice = caseSheetOtherInstructions.map((otherInst) => ({
      title: otherInst.instruction,
      description: [] as string[],
    }));
  }

  const caseSheetDiagnoses = JSON.parse(
    JSON.stringify(caseSheet.diagnosis)
  ) as CaseSheetDiagnosis[];
  type diagnosesData = {
    title: string;
    description: string;
  };
  let diagnoses: diagnosesData[] | [];
  if (caseSheet.diagnosis == null || caseSheet.diagnosis == '') {
    diagnoses = [];
  } else {
    diagnoses = caseSheetDiagnoses.map((diag) => ({
      title: diag.name,
      description: '',
    }));
  }

  let doctorInfo = {
    salutation: '',
    firstName: '',
    lastName: '',
    qualifications: '',
    registrationNumber: '',
  };

  let hospitalAddress = {
    name: '',
    streetLine1: '',
    streetLine2: '',
    city: '',
    zipcode: '',
    state: '',
    country: '',
  };

  let patientInfo = {
    firstName: '',
    lastName: '',
    gender: '',
    uhid: '',
    age: '',
  };

  if (caseSheet.patientId) {
    const patientRepo = patientsDb.getCustomRepository(PatientRepository);
    const patientData = await patientRepo.findById(caseSheet.patientId);
    if (patientData != null) {
      const patientAge =
        patientData.dateOfBirth === null
          ? ''
          : Math.abs(
              new Date(Date.now()).getUTCFullYear() -
                new Date(patientData.dateOfBirth).getUTCFullYear()
            ).toString();
      patientInfo = {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        gender: patientData.gender,
        uhid: patientData.uhid,
        age: patientAge,
      };
    }
  }

  if (caseSheet.doctorId) {
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    const doctordata = await doctorRepository.getDoctorProfileData(caseSheet.doctorId);

    const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
    let hospitalDetails;
    if (caseSheet.appointment)
      hospitalDetails = await facilityRepo.getfacilityDetails(caseSheet.appointment.hospitalId);

    if (doctordata != null) {
      if (hospitalDetails) {
        hospitalAddress = {
          name: hospitalDetails.name,
          streetLine1: hospitalDetails.streetLine1,
          streetLine2: hospitalDetails.streetLine2,
          city: hospitalDetails.city,
          zipcode: hospitalDetails.zipcode,
          state: hospitalDetails.state,
          country: hospitalDetails.country,
        };
      }

      doctorInfo = {
        salutation: doctordata.salutation,
        firstName: doctordata.firstName,
        lastName: doctordata.lastName,
        qualifications: doctordata.qualification,
        registrationNumber: doctordata.registrationNumber,
      };
    }
  }

  return { prescriptions, generalAdvice, diagnoses, doctorInfo, hospitalAddress, patientInfo };
};

const assetsDir = <string>process.env.ASSETS_DIRECTORY;

const loadAsset = (file: string) => path.resolve(assetsDir, file);

export const generateRxPdfDocument = (rxPdfData: RxPdfData): typeof PDFDocument => {
  const margin = 35;
  const indentedMargin = margin + 30;
  const patientIndentedMargin = margin + 100;

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

  const renderSectionTitle = (titleText: string, y?: number) => {
    return doc
      .fillColor('blue')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(titleText, margin, y);
  };

  const headerEndY = 120;

  const renderHeader = (hospitalAddress: RxPdfData['hospitalAddress']) => {
    doc.image(loadAsset('apollo-logo.png'), margin, margin / 2, { height: 85 });
    const addressLastLine =
      hospitalAddress.city + ', ' + hospitalAddress.state + ' ' + hospitalAddress.zipcode;

    doc.fontSize(9.5).text(hospitalAddress.name, 370, margin);
    doc.moveDown(0.5).text(hospitalAddress.streetLine1);
    if (hospitalAddress.streetLine2) doc.moveDown(0.5).text(hospitalAddress.streetLine2);
    doc.moveDown(0.5).text(addressLastLine);
    if (!hospitalAddress.streetLine2) doc.moveDown(0.5);

    doc.moveDown(2);
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
    doc.image(rx, margin, headerEndY + 60, { width: 35 });

    renderSectionTitle('PRESCRIPTION', headerEndY + 100);

    prescriptions.forEach((prescription, index) => {
      doc.fillColor('black').moveDown(index === 0 ? 0.4 : 1);

      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(`${index + 1}. ${prescription.name.toUpperCase()}`, margin)
        .moveDown(0.4);

      if (prescription.ingredients.length > 0) {
        doc
          .font('Helvetica-Oblique')
          .fontSize(8)
          .text(prescription.ingredients.join(', '), indentedMargin)
          .moveDown(0.4);
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(prescription.frequency, indentedMargin)
        .moveDown(0.4);

      if (prescription.instructions) {
        doc
          .font('Helvetica-Oblique')
          .fontSize(10)
          .text(prescription.instructions, indentedMargin)
          .moveDown(0.4);
      }
    });
    doc.font('Helvetica').fontSize(10);
  };

  const renderGeneralAdvice = (generalAdvice: RxPdfData['generalAdvice']) => {
    renderSectionTitle('GENERAL ADVICE');

    generalAdvice.forEach((advice, index) => {
      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }
      doc
        .fillColor('black')
        .font('Helvetica-Bold')
        .fontSize(10)
        .moveDown(index === 0 ? 0.4 : 1);
      doc.text(`${index + 1}. ${advice.title}`, margin).moveDown(0.4);
      advice.description.forEach((descText) => doc.text(descText, indentedMargin).moveDown(0.4));
    });
  };

  const renderDiagnoses = (diagnoses: RxPdfData['diagnoses']) => {
    renderSectionTitle("DOCTOR'S NOTES / DIAGNOSIS");
    diagnoses.forEach((diag, index) => {
      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }
      doc
        .fillColor('black')
        .font('Helvetica-Bold')
        .fontSize(10)
        .moveDown(0.4);
      doc.text(`${index + 1}. ${diag.title}`, margin).moveDown(0.4);
      if (diag.description) {
        doc
          .fillColor('orange')
          .text(diag.description, indentedMargin)
          .moveDown(0.4);
      }
    });
  };

  const renderDoctorInfo = (doctorInfo: RxPdfData['doctorInfo']) => {
    const nameLine = `${doctorInfo.salutation}. ${doctorInfo.firstName} ${doctorInfo.lastName}`;
    const qualificationsLine = doctorInfo.qualifications;
    const registrationLine = `Registration No: ${doctorInfo.registrationNumber}`;
    if (nameLine) {
      doc
        .fillColor('black')
        .font('Helvetica-Bold')
        .fontSize(14);
      doc.text(nameLine, margin).moveDown(0.1);
    }
    doc.font('Helvetica').fontSize(10);
    if (qualificationsLine) {
      doc.text(qualificationsLine, margin).moveDown(0.4);
    }
    if (registrationLine) {
      doc.text(registrationLine, margin);
    }
  };

  const renderpatients = (patientInfo: RxPdfData['patientInfo']) => {
    renderSectionTitle('PATIENT DETAILS:');

    const nameLine = `NAME            ${patientInfo.firstName} ${patientInfo.lastName}`;
    const age = `AGE               ${patientInfo.age}`;
    const gender = `GENDER        ${patientInfo.gender}`;
    const uhid = `UHID               ${patientInfo.uhid}`;

    if (nameLine) {
      doc
        .fillColor('black')
        .font('Helvetica-Bold')
        .fontSize(8);
      doc.text(nameLine, patientIndentedMargin, headerEndY + 30).moveDown(0.4);
    }
    doc
      .fillColor('black')
      .font('Helvetica-Bold')
      .fontSize(8);
    if (patientInfo.age) {
      doc.text(age, patientIndentedMargin).moveDown(0.4);
    }
    doc
      .fillColor('black')
      .font('Helvetica-Bold')
      .fontSize(8);
    if (patientInfo.gender) {
      doc.text(gender, patientIndentedMargin).moveDown(0.4);
    }
    doc
      .fillColor('black')
      .font('Helvetica-Bold')
      .fontSize(8);
    if (patientInfo.uhid) {
      doc.text(uhid, patientIndentedMargin).moveDown(0.4);
    }
  };

  doc.on('pageAdded', () => {
    renderFooter();
    renderHeader(rxPdfData.hospitalAddress);
  });

  renderFooter();
  renderHeader(rxPdfData.hospitalAddress);

  if (!_isEmpty(rxPdfData.patientInfo)) {
    renderpatients(rxPdfData.patientInfo);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.prescriptions)) {
    renderPrescriptions(rxPdfData.prescriptions);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.generalAdvice)) {
    renderGeneralAdvice(rxPdfData.generalAdvice);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.diagnoses)) {
    renderDiagnoses(rxPdfData.diagnoses);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.doctorInfo)) {
    if (doc.y > doc.page.height - 150) {
      pageBreak();
    }
    renderDoctorInfo(rxPdfData.doctorInfo);
    doc.moveDown(1.5);
  }

  doc.end();

  return doc;
};

export const uploadRxPdf = async (
  client: AphStorageClient,
  caseSheetId: string,
  pdfDoc: PDFKit.PDFDocument
) => {
  const name = `${caseSheetId}_${getTime(new Date())}.pdf`;
  const filePath = loadAsset(name);
  pdfDoc.pipe(fs.createWriteStream(filePath));
  await delay(300);
  const blob = await client.uploadFile({ name, filePath });
  fs.unlink(filePath, (error) => console.log(error));
  return blob;

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
