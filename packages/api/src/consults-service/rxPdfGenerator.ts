import { format, getTime } from 'date-fns';
import path from 'path';
import PDFDocument from 'pdfkit';
import {
  RxPdfData,
  CaseSheet,
  CaseSheetMedicinePrescription,
  CaseSheetOtherInstruction,
  CaseSheetDiagnosis,
  CaseSheetDiagnosisPrescription,
  CaseSheetSymptom,
} from 'consults-service/entities';
import _capitalize from 'lodash/capitalize';
import _isEmpty from 'lodash/isEmpty';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import fs from 'fs';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { Connection } from 'typeorm';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import { Patient } from 'profiles-service/entities';

export const convertCaseSheetToRxPdfData = async (
  caseSheet: Partial<CaseSheet>,
  doctorsDb: Connection,
  patientData: Patient
): Promise<RxPdfData> => {
  console.log(caseSheet);

  // medicine prescription starts
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
      const medicineUnit = csRx.medicineUnit === undefined ? '' : csRx.medicineUnit.toLowerCase();
      const frequency = `${csRx.medicineDosage} ${medicineUnit} (${timings}) for ${csRx.medicineConsumptionDurationInDays} days`;
      const instructions = csRx.medicineInstructions;
      return { name, ingredients, frequency, instructions } as PrescriptionData;
    });
  }
  //medicine prescription ends

  //other instruction starts
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
  // other instruction ends

  //diagnoses starts
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
  //diagnoses ends

  //diagnosticTests starts
  const diagnosesTests = JSON.parse(
    JSON.stringify(caseSheet.diagnosticPrescription)
  ) as DiagnosticPrescription[];
  /*type diagnosesTestsData = {
    name: string;
  };
  let diagnosesTests: diagnosesTestsData[] | [];
  if (caseSheet.diagnosticPrescription == null || caseSheet.diagnosticPrescription == '') {
    diagnosesTests = [];
  } else {
    diagnosesTests = casesheetDiagnosesTests.map((diag) => ({
      name: diag.name,
    }));
  }  */
  //diagnosticTests ends

  //symptoms starts
  const caseSheetSymptoms = JSON.parse(JSON.stringify(caseSheet.symptoms)) as CaseSheetSymptom[];

  //symptoms ends

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

  let vitals = {
    height: '',
    weight: '',
    temperature: '',
    bp: '',
  };

  if (caseSheet.patientId) {
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

    if (patientData.patientMedicalHistory != null) {
      vitals = {
        height: patientData.patientMedicalHistory.height,
        weight: patientData.patientMedicalHistory.weight,
        temperature: patientData.patientMedicalHistory.temperature,
        bp: patientData.patientMedicalHistory.bp,
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

  let appointmentDetails = {
    displayId: '',
    consultDate: '',
    consultType: '',
  };

  if (caseSheet.appointment) {
    appointmentDetails = {
      displayId: caseSheet.appointment.displayId.toString(),
      consultDate: format(caseSheet.appointment.appointmentDateTime, 'dd/MM/yy'),
      consultType: caseSheet.appointment.appointmentType,
    };
  }

  return {
    prescriptions,
    generalAdvice,
    diagnoses,
    doctorInfo,
    hospitalAddress,
    patientInfo,
    vitals,
    appointmentDetails,
    diagnosesTests,
  };
};

const assetsDir = <string>process.env.ASSETS_DIRECTORY;

const loadAsset = (file: string) => path.resolve(assetsDir, file);

export const generateRxPdfDocument = (rxPdfData: RxPdfData): typeof PDFDocument => {
  const margin = 35;
  //const indentedMargin = margin + 30;
  //const patientIndentedMargin = margin + 100;

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

  const renderSectionHeader = (headerText: string, y?: number) => {
    return doc
      .moveTo(margin, doc.y)
      .lineTo(doc.page.width - margin, doc.y)
      .lineTo(doc.page.width - margin, doc.y + 30)
      .lineTo(margin, doc.y + 30)
      .lineTo(margin, doc.y)
      .fill('#f7f7f7')
      .fillColor('#000')
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fontSize(10)
      .text(headerText, margin + 10, doc.y + 10, { fill: true })
      .moveDown(2);
  };

  const renderDetailsRow = (labelText: string, labelValue: string, y?: number) => {
    doc
      .fontSize(9)
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fillColor('#000000')
      .text(labelText, margin + 15, y, { lineBreak: false });
    return doc
      .fontSize(labelText === 'Patient' ? 10 : 9)
      .font(
        labelText === 'Patient'
          ? assetsDir + '/fonts/IBMPlexSans-Bold.ttf'
          : assetsDir + '/fonts/IBMPlexSans-Medium.ttf'
      )
      .fillColor('#02475b')
      .text(`${labelValue}`, 115, y)
      .moveDown(0.5);
  };

  const headerEndY = 120;

  const renderHeader = (
    doctorInfo: RxPdfData['doctorInfo'],
    hospitalAddress: RxPdfData['hospitalAddress']
  ) => {
    doc.image(loadAsset('apollo-logo.png'), margin, margin / 2, { height: 85 });

    //Doctor Details
    const nameLine = `${doctorInfo.salutation}. ${doctorInfo.firstName} ${doctorInfo.lastName}`;
    const specialty = 'General Physician';
    const registrationLine = `MCI Reg.No. ${doctorInfo.registrationNumber}`;

    doc
      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fillColor('#02475b')
      .text(nameLine, 370, margin);

    doc
      .moveDown(0.3)
      .fontSize(9)
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fillColor('#02475b')
      .text(`${specialty} | ${registrationLine}`);

    //Doctor Address Details
    const addressLastLine = `${hospitalAddress.city}  ${
      hospitalAddress.zipcode ? ' - ' + hospitalAddress.zipcode : ''
    } | ${hospitalAddress.state}, ${hospitalAddress.country}`;

    doc
      .moveDown(1)
      .fontSize(8)
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fillColor('#000000')
      .text(hospitalAddress.name);

    doc.moveDown(0.2).text(hospitalAddress.streetLine1);
    if (hospitalAddress.streetLine2) doc.moveDown(0.2).text(hospitalAddress.streetLine2);
    doc.moveDown(0.2).text(addressLastLine);

    doc.moveDown(2);
  };

  const renderFooter = () => {
    const disclaimerText =
      'Disclaimer: The prescription has been issued based on your inputs during chat/call with the doctor. In case of emergency please visit a nearby hospital';
    doc
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fontSize(8)
      .text(disclaimerText, margin, doc.page.height - 70, { align: 'center' });
    drawHorizontalDivider(doc.page.height - 55);
    return doc;
  };

  const renderPrescriptions = (prescriptions: RxPdfData['prescriptions']) => {
    renderSectionHeader('Chief Complaints', headerEndY + 100);

    prescriptions.forEach((prescription, index) => {
      const textArray = [];
      if (prescription.ingredients.length > 0) textArray.push(prescription.ingredients.join(', '));
      if (prescription.frequency) textArray.push(prescription.frequency);
      if (prescription.instructions) textArray.push(prescription.instructions);

      doc
        .fontSize(10)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#02475b')
        .text(`${prescription.name.toUpperCase()}`, margin + 15)
        .moveDown(0.5);
      doc
        .fontSize(10)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#000000')
        .text(`${textArray.join('  |  ')}`, margin + 15)
        .moveDown(0.8);

      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }
    });
  };

  const renderGeneralAdvice = (generalAdvice: RxPdfData['generalAdvice']) => {
    renderSectionHeader('Advise Given');

    generalAdvice.forEach((advice, index) => {
      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }

      doc
        .fontSize(10)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#000000')
        .text(`${advice.title}`, margin + 15)
        .moveDown(0.5);
    });
  };

  const renderDiagnoses = (diagnoses: RxPdfData['diagnoses']) => {
    renderSectionHeader('Diagnosis');

    diagnoses.forEach((diag, index) => {
      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }

      doc
        .fontSize(10)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#02475b')
        .text(`${diag.title}`, margin + 15)
        .moveDown(0.5);
    });
  };

  const renderDiagnosticTest = (diagnosticTests: RxPdfData['diagnosesTests']) => {
    renderSectionHeader('Diagnostic Tests');
    diagnosticTests.forEach((diagTest, index) => {
      console.log('-----------', diagTest.itemname);
      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }

      doc
        .fontSize(10)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#02475b')
        // .text(`${index + 1}. ${diagTest.itemname}`, margin + 15)
        .moveDown(0.5);
    });
  };

  const renderpatients = (
    patientInfo: RxPdfData['patientInfo'],
    vitals: RxPdfData['vitals'],
    appointmentData: RxPdfData['appointmentDetails']
  ) => {
    renderSectionHeader('Appointment Details');

    const textArray = [];
    let patientName = '';
    if (patientInfo.firstName) patientName = patientInfo.firstName;
    if (patientInfo.lastName) {
      if (patientName.length > 0) patientName = patientName + ' ' + patientInfo.lastName;
      else patientName = patientInfo.lastName;
    }
    if (patientInfo.firstName) textArray.push(`${patientName}`);
    if (patientInfo.gender) textArray.push(patientInfo.gender);
    if (patientInfo.age) textArray.push(`${patientInfo.age} yrs`);

    if (textArray.length > 0) {
      renderDetailsRow('Patient', `${textArray.join('   |   ')}`, doc.y);
    }

    const vitalsArray = [];
    if (vitals.weight) vitalsArray.push(`Weight : ${vitals.weight}`);
    if (vitals.height) vitalsArray.push(`Height : ${vitals.height}`);
    if (vitals.bp) vitalsArray.push(`BP: ${vitals.bp}`);
    if (vitals.temperature) vitalsArray.push(`Temperature: ${vitals.temperature}`);

    if (vitalsArray.length > 0) {
      renderDetailsRow('Vitals', `${vitalsArray.join('   |   ')}`, doc.y);
    }

    if (patientInfo.uhid) {
      renderDetailsRow('UHID', `${patientInfo.uhid}`, doc.y);
    }

    if (appointmentData.displayId) {
      renderDetailsRow('Appt ID', `${appointmentData.displayId}`, doc.y);
    }

    if (appointmentData.consultDate) {
      renderDetailsRow('Consult Date', `${appointmentData.consultDate}`, doc.y);
    }

    if (appointmentData.consultType) {
      renderDetailsRow('Consult Type', `${appointmentData.consultType}`, doc.y);
    }
  };

  doc.on('pageAdded', () => {
    renderFooter();
    renderHeader(rxPdfData.doctorInfo, rxPdfData.hospitalAddress);
  });

  renderFooter();
  renderHeader(rxPdfData.doctorInfo, rxPdfData.hospitalAddress);

  if (!_isEmpty(rxPdfData.patientInfo)) {
    renderpatients(rxPdfData.patientInfo, rxPdfData.vitals, rxPdfData.appointmentDetails);
    doc.moveDown(1.5);
  }

  /*if (!_isEmpty(rxPdfData.symptoms)) {
    renderSymptoms(rxPdfData.symptoms);
    doc.moveDown(1.5);
  } */

  if (!_isEmpty(rxPdfData.diagnoses)) {
    renderDiagnoses(rxPdfData.diagnoses);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.prescriptions)) {
    renderPrescriptions(rxPdfData.prescriptions);
    doc.moveDown(1.5);
  }

  //static method
  renderDiagnosticTest(rxPdfData.diagnosesTests);

  if (!_isEmpty(rxPdfData.generalAdvice)) {
    renderGeneralAdvice(rxPdfData.generalAdvice);
    doc.moveDown(1.5);
  }

  /*if (!_isEmpty(rxPdfData.followUp)) {
    renderFollowUp(rxPdfData.followUp);
    doc.moveDown(1.5);
  } */

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
  const blob = { name, filePath };
  //const blob = await client.uploadFile({ name, filePath });
  //fs.unlink(filePath, (error) => console.log(error));
  return blob;

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
