import { format, getTime } from 'date-fns';
import path from 'path';
import util from 'util';

import PDFDocument from 'pdfkit';
import {
  RxPdfData,
  CaseSheet,
  CaseSheetMedicinePrescription,
  CaseSheetOtherInstruction,
  CaseSheetDiagnosis,
  CaseSheetDiagnosisPrescription,
  CaseSheetSymptom,
  MEDICINE_FORM_TYPES,
  MEDICINE_TIMINGS,
  MEDICINE_UNIT,
} from 'consults-service/entities';
import _capitalize from 'lodash/capitalize';
import _isEmpty from 'lodash/isEmpty';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import fs from 'fs';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { Connection } from 'typeorm';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import { Patient } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { UploadDocumentInput } from 'profiles-service/resolvers/uploadDocumentToPrism';
import { ApiConstants } from 'ApiConstants';

export const convertCaseSheetToRxPdfData = async (
  caseSheet: Partial<CaseSheet>,
  doctorsDb: Connection,
  patientData: Patient
): Promise<RxPdfData> => {
  // medicine prescription starts
  const caseSheetMedicinePrescription = JSON.parse(
    JSON.stringify(caseSheet.medicinePrescription)
  ) as CaseSheetMedicinePrescription[];

  type PrescriptionData = {
    name: string;
    ingredients: string[];
    frequency: string;
    instructions: string;
    routeOfAdministration?: string;
  };

  let prescriptions: PrescriptionData[] | [];
  if (caseSheet.medicinePrescription == null || caseSheet.medicinePrescription == '') {
    prescriptions = [];
  } else {
    prescriptions = caseSheetMedicinePrescription.map((csRx) => {
      const name = _capitalize(csRx.medicineName);
      const ingredients = [] as string[];
      let frequency;
      const plural =
        csRx.medicineUnit == MEDICINE_UNIT.ML || csRx.medicineUnit == MEDICINE_UNIT.MG ? '' : '(s)';
      const customDosage = csRx.medicineCustomDosage
        ? csRx.medicineCustomDosage
            .split('-')
            .filter((value) => value)
            .join(
              ' ' +
                csRx.medicineUnit
                  .split('_')
                  .join(' ')
                  .toLowerCase() +
                plural +
                ' - '
            ) +
          ' ' +
          csRx.medicineUnit
            .split('_')
            .join(' ')
            .toLowerCase() +
          plural
        : '';
      if (csRx.medicineFormTypes != MEDICINE_FORM_TYPES.OTHERS) {
        frequency = 'Apply';
        if (csRx.medicineCustomDosage) {
          frequency =
            frequency +
            ' ' +
            customDosage +
            ' (' +
            csRx.medicineTimings
              .join(', ')
              .replace(/,(?=[^,]*$)/, ' and')
              .split('_')
              .join(' ') +
            ')';
        } else if (csRx.medicineUnit) {
          const medicineUnit =
            csRx.medicineUnit == MEDICINE_UNIT.AS_PRESCRIBED
              ? csRx.medicineUnit.split('_').join(' ')
              : csRx.medicineUnit + plural;
          frequency = frequency + ' ' + medicineUnit;
        }
      } else {
        frequency = 'Take';
        if (csRx.medicineCustomDosage) {
          frequency =
            frequency +
            ' ' +
            customDosage +
            ' (' +
            csRx.medicineTimings
              .join(', ')
              .replace(/,(?=[^,]*$)/, ' and')
              .split('_')
              .join(' ') +
            ')';
        } else {
          const medicineUnit =
            csRx.medicineUnit == MEDICINE_UNIT.AS_PRESCRIBED
              ? csRx.medicineUnit.split('_').join(' ')
              : csRx.medicineUnit + plural;
          if (csRx.medicineDosage) frequency = frequency + ' ' + csRx.medicineDosage;
          if (csRx.medicineUnit) frequency = frequency + ' ' + medicineUnit;
        }
      }

      if (csRx.medicineFrequency && !csRx.medicineCustomDosage)
        frequency = frequency + ' ' + csRx.medicineFrequency.split('_').join(' ');

      if (csRx.medicineConsumptionDurationInDays) {
        frequency = frequency + ' for';
        frequency = frequency + ' ' + csRx.medicineConsumptionDurationInDays;
        if (csRx.medicineConsumptionDurationUnit) {
          const unit =
            parseInt(csRx.medicineConsumptionDurationInDays.toString(), 10) > 1
              ? csRx.medicineConsumptionDurationUnit
              : csRx.medicineConsumptionDurationUnit.replace('S', '');
          frequency = frequency + ' ' + unit;
        }
      }

      if (csRx.medicineToBeTaken)
        frequency =
          frequency +
          ' ' +
          csRx.medicineToBeTaken
            .join(', ')
            .split('_')
            .join(' ');

      if (csRx.medicineTimings && !csRx.medicineCustomDosage) {
        if (
          csRx.medicineTimings.length == 1 &&
          csRx.medicineTimings[0] == MEDICINE_TIMINGS.AS_NEEDED
        ) {
          frequency = frequency + ' ' + csRx.medicineTimings[0].split('_').join(' ');
        } else {
          frequency = frequency + ' in the';
          frequency =
            frequency +
            ' ' +
            csRx.medicineTimings
              .join(', ')
              .replace(/,(?=[^,]*$)/, ' and')
              .split('_')
              .join(' ');
        }
      }

      frequency = _capitalize(frequency);
      frequency += '.';

      const instructions = csRx.medicineInstructions;
      const routeOfAdministration = _capitalize(csRx.routeOfAdministration);
      return {
        name,
        ingredients,
        frequency,
        instructions,
        routeOfAdministration,
      } as PrescriptionData;
    });
  }
  //medicine prescription ends

  //other instruction starts
  const generalAdvice = JSON.parse(
    JSON.stringify(caseSheet.otherInstructions)
  ) as CaseSheetOtherInstruction[];

  // other instruction ends

  //diagnoses starts
  const diagnoses = JSON.parse(JSON.stringify(caseSheet.diagnosis)) as CaseSheetDiagnosis[];
  //diagnoses ends

  //diagnosticTests starts
  const diagnosesTests = JSON.parse(
    JSON.stringify(caseSheet.diagnosticPrescription)
  ) as CaseSheetDiagnosisPrescription[];
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
    specialty: '',
    signature: '',
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
        specialty: doctordata.specialty.name,
        signature: doctordata.signature,
      };
    }
  }

  //appointment details starts
  let appointmentDetails = {
    displayId: '',
    consultDate: '',
    consultType: '',
  };

  if (caseSheet.appointment) {
    const consultDate = caseSheet.appointment.sdConsultationDate
      ? caseSheet.appointment.sdConsultationDate
      : caseSheet.appointment.appointmentDateTime;
    appointmentDetails = {
      displayId: caseSheet.appointment.displayId.toString(),
      consultDate: format(consultDate, 'dd/MM/yyyy'),
      consultType: _capitalize(caseSheet.appointment.appointmentType),
    };
  }
  //appointment details ends

  let followUpDetails = '';

  if (caseSheet.followUp) {
    followUpDetails = ' Follow up ';
    if (caseSheet.followUpConsultType)
      followUpDetails = followUpDetails + '(' + _capitalize(caseSheet.followUpConsultType) + ') ';
    let followUpDays;
    if (caseSheet.followUpAfterInDays && caseSheet.followUpAfterInDays <= 7) {
      followUpDays = caseSheet.followUpAfterInDays;
      if (followUpDays) followUpDetails = followUpDetails + 'after ' + followUpDays + ' days';
    } else if (caseSheet.followUpDate) {
      //followUpDays = differenceInCalendarDays(caseSheet.followUpDate, caseSheet.createdDate!);
      followUpDetails = followUpDetails + 'on ' + format(caseSheet.followUpDate, 'dd/MM/yyyy');
    }
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
    caseSheetSymptoms,
    followUpDetails,
  };
};

const assetsDir = <string>process.env.ASSETS_DIRECTORY;

const loadAsset = (file: string) => path.resolve(assetsDir, file);

export const generateRxPdfDocument = (rxPdfData: RxPdfData): typeof PDFDocument => {
  const margin = 35;
  const doc = new PDFDocument({ margin, bufferPages: true });

  const drawHorizontalDivider = (y: number) => {
    return doc
      .moveTo(margin, y)
      .lineTo(doc.page.width - margin, y)
      .lineWidth(1)
      .opacity(0.15)
      .fill('#02475b');
  };

  const setY = (y: number) => {
    const up = doc.y > y;
    if (up) while (doc.y > y) doc.moveUp(0.01);
    else while (doc.y < y) doc.moveDown(0.01);
    return doc;
  };

  const pageBreak = () => {
    //doc.flushPages();
    setY(doc.page.height);
    doc
      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fillColor('#02475b')
      .text('')
      .moveDown(0.01);
    return doc;
  };

  const renderSectionHeader = (headerText: string, y?: number) => {
    if (doc.y > doc.page.height - 150) {
      pageBreak();
    }
    return doc
      .moveTo(margin, doc.y)
      .lineTo(doc.page.width - margin, doc.y)
      .lineTo(doc.page.width - margin, doc.y + 30)
      .lineTo(margin, doc.y + 30)
      .lineTo(margin, doc.y)
      .fill('#f7f7f7')
      .opacity(0.7)
      .fillColor('#000')
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fontSize(11)
      .text(_capitalize(headerText), margin + 10, doc.y + 10, { fill: true })
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
      .opacity(0.6)
      .moveDown(0.5);
  };

  const headerEndY = 120;

  const renderHeader = (
    doctorInfo: RxPdfData['doctorInfo'],
    hospitalAddress: RxPdfData['hospitalAddress']
  ) => {
    doc.image(loadAsset('apolloLogo.png'), margin, margin / 2, { height: 65 });

    //Doctor Details
    const nameLine = `${doctorInfo.salutation}. ${doctorInfo.firstName} ${doctorInfo.lastName}`;
    const specialty = doctorInfo.specialty;
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
    drawHorizontalDivider(doc.page.height - 80);
    const disclaimerText =
      'Disclaimer: The prescription has been issued based on your inputs during chat/call with the doctor. In case of emergency please visit a nearby hospital. This is an electronically generated prescription and will not require a doctor signature.';
    doc
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fontSize(10)
      .fillColor('#000000')
      .opacity(0.5)
      .text(disclaimerText, margin, doc.page.height - 80, { align: 'left' });
    return doc;
  };

  const renderSymptoms = (prescriptions: RxPdfData['caseSheetSymptoms']) => {
    renderSectionHeader('Chief Complaints', headerEndY + 150);

    prescriptions.forEach((prescription, index) => {
      const textArray = [];
      if (prescription.since.length > 0) textArray.push('Since: ' + prescription.since);
      if (prescription.howOften) textArray.push('How Often: ' + prescription.howOften);
      if (prescription.severity) textArray.push('Severity: ' + prescription.severity);

      doc
        .fontSize(12)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#02475b')
        .text(`${_capitalize(prescription.symptom)}`, margin + 15)
        .moveDown(0.5);
      doc
        .fontSize(12)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#000000')
        .opacity(0.6)
        .text(`${textArray.join('  |  ')}`, margin + 15)
        .moveDown(0.8);

      if (prescription.details) {
        doc
          .fontSize(12)
          .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
          .fillColor('#000000')
          .opacity(0.6)
          .text(`${prescription.details}`, margin + 15)
          .moveDown(0.8);
      }

      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }
    });
  };

  const renderPrescriptions = (prescriptions: RxPdfData['prescriptions']) => {
    renderSectionHeader('Medication Prescribed', headerEndY + 150);

    prescriptions.forEach((prescription, index) => {
      // const medicineTimings = prescripti
      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }
      doc
        .fontSize(12)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#02475b')
        .text(`${index + 1}.  ${prescription.name}`, margin + 15)
        .moveDown(0.5);
      doc
        .fontSize(10)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#000000')
        .opacity(0.6)
        .text(`${prescription.frequency} `, margin + 30)
        .moveDown(0.8);

      if (prescription.routeOfAdministration) {
        doc
          .fontSize(10)
          .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
          .fillColor('#000000')
          .opacity(0.6)
          .text(
            `To be taken: ${prescription.routeOfAdministration.split('_').join(' ')} `,
            margin + 30
          )
          .moveDown(0.8);
      }

      if (prescription.instructions) {
        doc
          .fontSize(10)
          .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
          .fillColor('#000000')
          .opacity(0.6)
          .text(`Instructions: ${prescription.instructions} `, margin + 30)
          .moveDown(0.8);
      }
    });
  };

  const renderGeneralAdvice = (generalAdvice: RxPdfData['generalAdvice']) => {
    if (generalAdvice) {
      renderSectionHeader('Advise Given');
      generalAdvice.forEach((advice, index) => {
        if (doc.y > doc.page.height - 150) {
          pageBreak();
        }
        doc
          .fontSize(12)
          .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
          .fillColor('#000000')
          .opacity(0.6)
          .text(`${advice.instruction}`, margin + 15)
          .moveDown(0.5);
      });
    }
  };

  const renderDiagnoses = (diagnoses: RxPdfData['diagnoses']) => {
    if (diagnoses) {
      renderSectionHeader(ApiConstants.CASESHEET_PROVISIONAL_HEADING.toString());
      diagnoses.forEach((diag, index) => {
        if (doc.y > doc.page.height - 150) {
          pageBreak();
        }
        doc
          .fontSize(12)
          .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
          .fillColor('#02475b')
          .text(`${diag.name}`, margin + 15)
          .moveDown(0.5);
      });
    }
  };

  const renderDiagnosticTest = (diagnosticTests: RxPdfData['diagnosesTests']) => {
    if (diagnosticTests) {
      renderSectionHeader('Diagnostic Tests');
      diagnosticTests.forEach((diagTest, index) => {
        if (doc.y > doc.page.height - 150) {
          pageBreak();
        }

        doc
          .fontSize(12)
          .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
          .fillColor('#02475b')
          .text(`${index + 1}. ${diagTest.itemname}`, margin + 15)
          .moveDown(0.5);
      });
    }
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
    if (patientName) textArray.push(`${patientName}`);
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

  const renderFollowUp = (followUpData: RxPdfData['followUpDetails']) => {
    if (followUpData) {
      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }
      renderSectionHeader('Follow Up');
      doc
        .fontSize(12)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#02475b')
        .text(`${followUpData}`, margin + 15)
        .moveDown(0.3);
    }
  };

  const renderDoctorData = async (doctorInfo: RxPdfData['doctorInfo']) => {
    if (doctorInfo) {
      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }
      drawHorizontalDivider(doc.y);
      doc.moveDown(0.5);

      doc
        .opacity(0.6)
        .fontSize(12)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#000000')
        .text('Prescribed by', margin + 15)
        .moveDown(0.5);

      if (doctorInfo.signature) {
        const request = require('sync-request');
        const res = request('GET', doctorInfo.signature);
        if (doc.y > doc.page.height - 150) {
          pageBreak();
        }
        doc.image(res.body, margin + 15, doc.y, { height: 72, width: 200 });
        doc.moveDown(0.5);
      }

      //Doctor Details
      const nameLine = `${doctorInfo.salutation}. ${doctorInfo.firstName} ${doctorInfo.lastName}`;
      const specialty = doctorInfo.specialty;
      const registrationLine = `MCI Reg.No. ${doctorInfo.registrationNumber}`;

      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }

      doc
        .opacity(1)
        .fontSize(12)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#02475b')
        .text(nameLine, margin + 15);
      doc

        .fontSize(10)
        .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
        .fillColor('#02475b')
        .text(`${specialty} | ${registrationLine}`, margin + 15)
        .moveDown(0.5);
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

  if (!_isEmpty(rxPdfData.caseSheetSymptoms)) {
    renderSymptoms(rxPdfData.caseSheetSymptoms);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.diagnoses)) {
    renderDiagnoses(rxPdfData.diagnoses);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.prescriptions)) {
    renderPrescriptions(rxPdfData.prescriptions);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.diagnosesTests)) {
    renderDiagnosticTest(rxPdfData.diagnosesTests);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.generalAdvice)) {
    renderGeneralAdvice(rxPdfData.generalAdvice);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.followUpDetails)) {
    renderFollowUp(rxPdfData.followUpDetails);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.doctorInfo)) {
    renderDoctorData(rxPdfData.doctorInfo);
    doc.moveDown(1.5);
  }

  let i;
  let end;
  const range = doc.bufferedPageRange();
  for (i = range.start, end = range.start + range.count, range.start <= end; i < end; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor('#02475b')
      .text(`Page ${i + 1} of ${range.count}`, margin, doc.page.height - 95, { align: 'center' });
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
  await delay(350);

  const blob = await client.uploadFile({ name, filePath });
  const blobUrl = client.getBlobUrl(blob.name);
  console.log('blobUrl===', blobUrl);
  const base64pdf = await convertPdfUrlToBase64(blobUrl);
  fs.unlink(filePath, (error) => console.log(error));
  const uploadData = { ...blob, base64pdf }; // returning blob details and base64Pdf
  return uploadData;

  //previous code
  // const blob = await client.uploadFile({ name, filePath });
  // return blob;

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

const convertPdfUrlToBase64 = async (pdfUrl: string) => {
  const pdf2base64 = require('pdf-to-base64');
  util.promisify(pdf2base64);
  try {
    const base64pdf = await pdf2base64(pdfUrl);
    console.log('pdfData:', base64pdf);
    return base64pdf;
  } catch (e) {
    throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
  }
};

export const uploadPdfBase64ToPrism = async (
  uploadDocInput: UploadDocumentInput,
  patientDetails: Patient,
  patientsDb: Connection
) => {
  const patientsRepo = patientsDb.getCustomRepository(PatientRepository);
  const mobileNumber = patientDetails.mobileNumber;

  //get authtoken for the logged in user mobile number
  const prismAuthToken = await patientsRepo.getPrismAuthToken(mobileNumber);

  if (!prismAuthToken) return { status: false, fileId: '' };

  //get users list for the mobile number
  const prismUserList = await patientsRepo.getPrismUsersList(mobileNumber, prismAuthToken);

  //check if current user uhid matches with response uhids
  const uhid = await patientsRepo.validateAndGetUHID(patientDetails.id, prismUserList);

  if (!uhid) {
    return { status: false, fileId: '' };
  }

  //get authtoken for the logged in user mobile number
  const prismUHIDAuthToken = await patientsRepo.getPrismAuthTokenByUHID(uhid);

  if (!prismUHIDAuthToken) return { status: false, fileId: '' };

  //just call get prism user details with the corresponding uhid
  await patientsRepo.getPrismUsersDetails(uhid, prismUHIDAuthToken);

  const fileId = await patientsRepo.uploadDocumentToPrism(uhid, prismUHIDAuthToken, uploadDocInput);

  return fileId ? { status: true, fileId } : { status: false, fileId: '' };
};
