import { format, getTime, addMilliseconds, getUnixTime } from 'date-fns';
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
  MEDICINE_CONSUMPTION_DURATION,
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
import { UploadDocumentInput } from 'profiles-service/resolvers/uploadDocumentToPrism';
import { ApiConstants } from 'ApiConstants';
import {
  uploadPrescriptions,
  prescriptionSource,
  PrescriptionInputArgs,
} from 'profiles-service/resolvers/prescriptionUpload';
import { Doctor, ROUTE_OF_ADMINISTRATION } from 'doctors-service/entities';

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
    medicineFormTypes?: MEDICINE_FORM_TYPES;
    genericName: string;
  };

  let prescriptions: PrescriptionData[] | [];
  if (caseSheet.medicinePrescription == null || caseSheet.medicinePrescription == '') {
    prescriptions = [];
  } else {
    prescriptions = caseSheetMedicinePrescription.map((csRx) => {
      const name = _capitalize(csRx.medicineName);
      const ingredients = [] as string[];
      let frequency;
      let genericName;
      const plural =
        csRx.medicineUnit == MEDICINE_UNIT.ML ||
        csRx.medicineUnit == MEDICINE_UNIT.MG ||
        csRx.medicineUnit == MEDICINE_UNIT.AS_PRESCRIBED
          ? ''
          : '(s)';
      const customDosage = csRx.medicineCustomDosage
        ? csRx.medicineCustomDosage
            .split('-')
            .filter((value) => parseInt(value, 10))
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
      if (csRx.medicineCustomDetails) {
        frequency = csRx.medicineCustomDetails;
      } else {
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
            const medicineUnit = csRx.medicineUnit.split('_').join(' ') + plural;
            if (csRx.medicineDosage) frequency = frequency + ' ' + csRx.medicineDosage;
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
            const medicineUnit = csRx.medicineUnit.split('_').join(' ') + plural;
            if (csRx.medicineDosage) frequency = frequency + ' ' + csRx.medicineDosage;
            if (csRx.medicineUnit) frequency = frequency + ' ' + medicineUnit;
          }
        }

        if (csRx.medicineFrequency && !csRx.medicineCustomDosage)
          frequency = frequency + ' ' + csRx.medicineFrequency.split('_').join(' ');

        if (
          csRx.medicineConsumptionDurationInDays &&
          csRx.medicineConsumptionDurationUnit != MEDICINE_CONSUMPTION_DURATION.TILL_NEXT_REVIEW
        ) {
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

        if (
          csRx.medicineConsumptionDurationUnit == MEDICINE_CONSUMPTION_DURATION.TILL_NEXT_REVIEW
        ) {
          frequency += ' ' + csRx.medicineConsumptionDurationUnit.split('_').join(' ');
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
          } else if (
            csRx.medicineTimings.length == 1 &&
            csRx.medicineTimings[0] != MEDICINE_TIMINGS.NOT_SPECIFIC
          ) {
            frequency = frequency + ' in the';
            frequency =
              frequency +
              ' ' +
              csRx.medicineTimings
                .join(', ')
                .replace(/,(?=[^,]*$)/, ' and')
                .split('_')
                .join(' ');
          } else if (csRx.medicineTimings.length > 1) {
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
        if (frequency.includes(ApiConstants.STAT_LOWECASE))
          frequency = frequency.replace(ApiConstants.STAT_LOWECASE, ApiConstants.STAT_UPPERCASE);
        frequency += '.';
      }
      const instructions = csRx.medicineInstructions;
      const routeOfAdministration = _capitalize(csRx.routeOfAdministration);
      if (csRx.includeGenericNameInPrescription) {
        genericName = csRx.genericName;
      }
      return {
        name,
        ingredients,
        frequency,
        instructions,
        routeOfAdministration,
        medicineFormTypes: csRx.medicineFormTypes,
        genericName,
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
    email: '',
    phoneNumber: '',
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
        email: patientData.emailAddress,
        phoneNumber: patientData.mobileNumber,
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
          streetLine2: hospitalDetails.streetLine2 || '',
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
      console.log(doctorInfo);
    }
  }

  //appointment details starts
  let appointmentDetails = {
    displayId: '',
    consultDate: '',
    consultType: '',
    consultTime: '',
  };

  if (caseSheet.appointment) {
    /*const consultDate = caseSheet.appointment.sdConsultationDate
      ? caseSheet.appointment.sdConsultationDate
      : caseSheet.appointment.appointmentDateTime; */
    const consultDate = caseSheet.prescriptionGeneratedDate
      ? caseSheet.prescriptionGeneratedDate
      : new Date();
    const istDateTime = addMilliseconds(consultDate, 19800000);
    appointmentDetails = {
      displayId: caseSheet.appointment.displayId.toString(),
      consultDate: format(istDateTime, 'dd/MM/yyyy'),
      consultTime: format(istDateTime, 'hh:mm a'),
      consultType: _capitalize(caseSheet.appointment.appointmentType),
    };
  }
  //appointment details ends

  let followUpDetails = '';

  if (caseSheet.followUp) {
    followUpDetails = 'Follow up ';
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
    followUpDetails = followUpDetails + ' with reports';
  }

  const referralSpecialtyName = caseSheet.referralSpecialtyName
    ? caseSheet.referralSpecialtyName
    : '';
  const referralSpecialtyDescription = caseSheet.referralDescription
    ? caseSheet.referralDescription
    : '';

  const removedMedicinesList: string[] = [];
  const removedMedicines = JSON.parse(JSON.stringify(caseSheet.removedMedicinePrescription));
  if (removedMedicines) {
    removedMedicines.forEach((item: CaseSheetMedicinePrescription) => {
      removedMedicinesList.push(item.medicineName);
    });
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
    referralSpecialtyName,
    referralSpecialtyDescription,
    removedMedicinesList,
  };
};

const assetsDir = <string>process.env.ASSETS_DIRECTORY;

const loadAsset = (file: string) => path.resolve(assetsDir, file);

export const generateRxPdfDocument = (rxPdfData: RxPdfData): typeof PDFDocument => {
  const margin = 35;
  const doc = new PDFDocument({ margin, bufferPages: true });

  const drawHorizontalDivider = (y: number) => {
    return (
      doc
        .moveTo(margin, y)
        .lineTo(doc.page.width - margin, y)
        .lineWidth(1)
        //.opacity(0.15)
        .fill('#02475b')
    );
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
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#02475b')
      .text('')
      .moveDown(0.01);
    return doc;
  };

  const renderSectionHeader = (headerText: string, image: string, y?: number) => {
    if (doc.y > doc.page.height - 150) {
      pageBreak();
    }

    if (image.length > 0)
      return (
        doc
          .image(loadAsset(image), margin, doc.y, { valign: 'bottom', height: 24, width: 24 })
          //.opacity(0.7)
          .fillColor('#02475b')
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fontSize(11)
          .text(headerText.toUpperCase(), margin + 30, doc.y - 20, { lineBreak: false })
          .moveDown(1.7)

          .moveTo(margin, doc.y)
          .lineTo(doc.page.width - margin, doc.y)
          .lineWidth(1)
          .fill('#02475b')
          .moveDown(0.5)
      );
    else
      return (
        doc
          //.opacity(0.7)
          .fillColor('#02475b')
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fontSize(11)
          .text(headerText.toUpperCase(), margin, doc.y, { fill: true })
          .moveDown(0.5)

          .moveTo(margin, doc.y)
          .lineTo(doc.page.width - margin, doc.y)
          .lineWidth(1)
          .fill('#02475b')
          .moveDown(0.5)
      );
  };

  const renderFourColumnRow = (
    labelText1: string,
    labelValue1: string,
    labelText2: string,
    labelValue2: string,
    y?: number
  ) => {
    const secondCloumnMoveDownLength = labelValue1.length < 40 ? 0 : labelValue1.length / 40;
    return doc
      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#7f7f7f')
      .text(labelText1, margin + 15, y, { lineBreak: false, width: 100 })

      .fontSize(11)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#333333')
      .text(`${labelValue1}`, 100, y, { lineBreak: false, width: 240 })

      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#7f7f7f')
      .text(labelText2, margin + 340, y, { lineBreak: false, width: 100 })

      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#333333')
      .text(`${labelValue2}`, 450, y, { width: 190 })
      .moveDown(secondCloumnMoveDownLength + 0.5);
  };

  const headerEndY = 120;

  const renderHeader = (
    doctorInfo: RxPdfData['doctorInfo'],
    hospitalAddress: RxPdfData['hospitalAddress']
  ) => {
    doc
      .opacity(1)
      .image(loadAsset('apolloLogo.png'), margin, margin / 2, { width: 87, height: 64 });

    //Doctor Details
    const nameLine = `${doctorInfo.salutation.replace('.', '')}. ${doctorInfo.firstName} ${
      doctorInfo.lastName
    }`;
    const specialty = doctorInfo.specialty;
    const registrationLine = `Reg.No. ${doctorInfo.registrationNumber}`;

    doc
      .fontSize(11)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#02475b')
      .text(nameLine, 320, margin);

    if (doctorInfo.qualifications) {
      doc
        .moveDown(0.3)
        .fontSize(9)
        .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
        .fillColor('#02475b')
        .text(`${doctorInfo.qualifications}`);
    }

    doc
      .fontSize(9)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#02475b')
      .text(`${specialty} | ${registrationLine}`);

    //Doctor Address Details
    const addressLastLine = `${hospitalAddress.city}  ${
      hospitalAddress.zipcode ? ' - ' + hospitalAddress.zipcode : ''
    } | ${hospitalAddress.state}, ${hospitalAddress.country}`;

    doc
      .moveDown(0.3)
      .fontSize(8)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#666666')
      .text(hospitalAddress.name);

    doc.moveDown(0.2).text(hospitalAddress.streetLine1);
    if (hospitalAddress.streetLine2) doc.moveDown(0.2).text(hospitalAddress.streetLine2);
    doc.moveDown(0.2).text(addressLastLine);

    doc
      .moveDown(0.6)
      .fillColor('#999999')
      .text(`${ApiConstants.CASESHEET_WHATSAPP_LABEL.toString()}`, { lineBreak: false })
      .text(`${ApiConstants.CASESHEET_EMAIL_LABEL.toString()}`, 435, doc.y);

    doc
      .moveDown(0.5)
      .fillColor('#333333')
      .image(loadAsset('ic-phone.png'), 320, doc.y, {
        valign: 'bottom',
        height: 12,
        width: 12,
      })
      .fontSize(10)
      .text(`${ApiConstants.CASESHEET_WHATSAPP_NUMBER.toString()}`, 340, doc.y - 12, {
        lineBreak: false,
      })
      .image(loadAsset('ic-email.png'), 435, doc.y, {
        valign: 'bottom',
        height: 12,
        width: 12,
      })
      .text(`${ApiConstants.CASESHEET_EMAIL.toString()}`, 455, doc.y - 12);

    doc.moveDown(0.5);
  };

  const renderFooter = () => {
    doc
      .moveTo(margin, doc.page.height - 80)
      .lineTo(doc.page.width - margin, doc.page.height - 80)
      .lineWidth(1)
      .fill('#d9e3e6');

    const disclaimerText =
      'This prescription is issued on the basis of your inputs during teleconsultation. It is valid from the date of issue until the specific period/dosage of each medicine as advised.';

    doc
      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#666666')
      .text('Disclaimer:', margin, doc.page.height - 75, { lineBreak: false });

    doc
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fontSize(9)
      .fillColor('#7f7f7f')
      .text(disclaimerText, margin + 55, doc.page.height - 75, { align: 'left' });
    return doc;
  };

  const renderSymptoms = (
    prescriptions: RxPdfData['caseSheetSymptoms'],
    vitals: RxPdfData['vitals']
  ) => {
    renderSectionHeader('Chief Complaints', '', headerEndY + 150);

    if (prescriptions)
      prescriptions.forEach((prescription, index) => {
        const textArray = [];
        if (prescription.since.length > 0) textArray.push('Since: ' + prescription.since);
        if (prescription.howOften) textArray.push('How Often: ' + prescription.howOften);
        if (prescription.severity) textArray.push('Severity: ' + prescription.severity);
        if (prescription.details) textArray.push('Details: ' + prescription.details);

        doc
          .fontSize(12)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#333333')
          .text(`${_capitalize(prescription.symptom)}`, margin + 15)
          .moveDown(0.5);
        doc
          .fontSize(11)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#666666')
          .text(`${textArray.join('  |  ')}`, margin + 15)
          .moveDown(0.8);

        // if (prescription.details) {
        //   doc
        //     .fontSize(12)
        //     .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
        //     .fillColor('#666666')
        //     .text(`${prescription.details}`, margin + 15)
        //     .moveDown(0.8);
        // }

        if (doc.y > doc.page.height - 150) {
          pageBreak();
        }
      });

    const vitalsArray = [];
    if (vitals.weight) vitalsArray.push(`Weight : ${vitals.weight}`);
    if (vitals.height) vitalsArray.push(`Height : ${vitals.height}`);
    if (vitals.bp) vitalsArray.push(`BP: ${vitals.bp}`);
    if (vitals.temperature) vitalsArray.push(`Temperature: ${vitals.temperature}`);

    if (vitalsArray.length > 0) {
      doc
        .fontSize(11)
        .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
        .fillColor('#02475b')
        .text('VITALS', margin + 15, doc.y, { lineBreak: false });
      doc
        .fontSize(8)
        .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
        .fillColor('#7f7f7f')
        .text('(as declared by patient)', margin + 55, doc.y + 3)
        .moveDown(0.5);
      doc
        .fontSize(11)
        .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
        .fillColor('#333333')
        .text(`${vitalsArray.join('   |   ')}`, margin + 15)
        .moveDown(0.5);
    }
  };

  const renderPrescriptions = (
    prescriptions: RxPdfData['prescriptions'],
    removedMedicines: RxPdfData['removedMedicinesList']
  ) => {
    renderSectionHeader('Medication Prescribed', 'ic-medicines.png', headerEndY + 150);
    prescriptions.forEach((prescription, index) => {
      // const medicineTimings = prescripti
      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }
      doc
        .fontSize(12)
        .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
        .fillColor('#333333')
        .text(`${index + 1}.  ${prescription.name}`, margin + 15)
        .moveDown(0.5);
      if (prescription.genericName) {
        doc
          .fontSize(9)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#7f7f7f')
          .text(`${prescription.genericName}`, margin + 15)
          .moveDown(0.5);
      }
      doc
        .fontSize(11)
        .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
        .fillColor('#666666')
        .text(`${prescription.frequency} `, margin + 30)
        .moveDown(0.8);

      if (prescription.routeOfAdministration) {
        doc
          .fontSize(11)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#666666')
          .text(
            `To be ${
              prescription.medicineFormTypes != MEDICINE_FORM_TYPES.OTHERS ? 'Applied' : 'taken'
            }: ${
              prescription.routeOfAdministration != ROUTE_OF_ADMINISTRATION.INTRA_ARTICULAR
                ? prescription.routeOfAdministration.split('_').join(' ')
                : 'Intra-articular'
            } `,
            margin + 30
          )
          .moveDown(0.8);
      }

      if (prescription.instructions) {
        if (doc.y > doc.page.height - 150) {
          pageBreak();
        }
        const instructionsArray = prescription.instructions.split('\n');
        instructionsArray.forEach((instruction, instructionIndex) => {
          if (doc.y > doc.page.height - 150) {
            pageBreak();
          }
          doc
            .fontSize(11)
            .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
            .fillColor('#666666')
            .text(`${instructionIndex == 0 ? 'Instructions: ' : ''}${instruction} `, margin + 30)
            .moveDown(0.8);
        });
      }
    });

    removedMedicines.forEach((prescription, index) => {
      const newIndex = prescriptions.length + index;
      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }

      const docY = doc.y;
      doc
        .fontSize(12)
        .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
        .fillColor('#333333')
        .text(`${newIndex + 1}.  ${prescription}`, margin + 15, docY, {
          strike: true,
        })
        .fillColor('#890000')
        .text(
          '( This medication has been discontinued )',
          margin + 15 + doc.widthOfString(`${newIndex + 1}.  ${prescription}`) + 5,
          docY
        )
        .moveDown(0.5);
    });
  };

  const renderGeneralAdvice = (
    generalAdvice: RxPdfData['generalAdvice'],
    followUpData: RxPdfData['followUpDetails'],
    referralSpecialtyName: RxPdfData['referralSpecialtyName'],
    referralDescription: RxPdfData['referralSpecialtyDescription']
  ) => {
    if (generalAdvice) {
      renderSectionHeader('Advice/ Instructions', 'ic-doctors-2.png');
      generalAdvice.forEach((advice, index) => {
        if (doc.y > doc.page.height - 150) {
          pageBreak();
        }

        const instructionsArray = advice.instruction.split('\n');

        instructionsArray.forEach((instruction, newIndex) => {
          const labelText = newIndex == 0 && index == 0 ? "Doctor's Advice" : ' ';
          if (doc.y > doc.page.height - 150) {
            pageBreak();
          }
          doc
            .fontSize(10)
            .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
            .fillColor('#7f7f7f')
            .text(`${labelText}`, margin + 15, doc.y, { lineBreak: false })

            .fontSize(11)
            .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
            .fillColor('#666666')
            .text(`${instruction}`, 150, doc.y)
            .moveDown(0.5);
        });
      });
      if (followUpData) {
        if (doc.y > doc.page.height - 150) {
          pageBreak();
        }
        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#7f7f7f')
          .text('Follow Up', margin + 15, doc.y, { lineBreak: false })

          .fontSize(12)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#333333')
          .text(`${followUpData}`, 150, doc.y)
          .moveDown(0.5);
      }

      if (referralSpecialtyName) {
        if (doc.y > doc.page.height - 150) {
          pageBreak();
        }
        doc.moveDown(0.5);
        doc
          .fontSize(10)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#7f7f7f')
          .text('Referral', margin + 15, doc.y, { lineBreak: false })

          .fontSize(12)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#333333')
          .text(`${referralSpecialtyName}`, 150, doc.y)
          .moveDown(0.5);

        doc
          .fontSize(10)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#7f7f7f')
          .text(' ', margin + 15, doc.y, { lineBreak: false })

          .fontSize(11)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#666666')
          .text(`${referralDescription}`, 150, doc.y)
          .moveDown(0.5);
      }
    }
  };

  const renderDiagnoses = (diagnoses: RxPdfData['diagnoses']) => {
    if (diagnoses) {
      renderSectionHeader(ApiConstants.CASESHEET_PROVISIONAL_HEADING.toString(), '');
      diagnoses.forEach((diag, index) => {
        if (doc.y > doc.page.height - 150) {
          pageBreak();
        }
        doc
          .fontSize(12)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#333333')
          .text(`${diag.name}`, margin + 15)
          .moveDown(0.5);
      });
    }
  };

  const renderDiagnosticTest = (diagnosticTests: RxPdfData['diagnosesTests']) => {
    if (diagnosticTests) {
      renderSectionHeader('Diagnostic Tests', 'ic-microscope-solid.png');
      diagnosticTests.forEach((diagTest, index) => {
        if (doc.y > doc.page.height - 150) {
          pageBreak();
        }

        doc
          .fontSize(12)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#333333')
          .text(`${index + 1}. ${diagTest.itemname}`, margin + 15)
          .moveDown(0.5);

        if (diagTest.testInstruction)
          doc
            .fontSize(11)
            .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
            .fillColor('#666666')
            .text(`${diagTest.testInstruction}`, margin + 30)
            .moveDown(0.8);
      });
    }
  };

  const renderpatients = (
    patientInfo: RxPdfData['patientInfo'],
    appointmentData: RxPdfData['appointmentDetails']
  ) => {
    renderSectionHeader('Appointment Details', '');

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
      renderFourColumnRow(
        'Patient',
        `${textArray.join('   |   ')}`,
        'Consult Date',
        `${appointmentData.consultDate + ' at ' + appointmentData.consultTime}`,
        doc.y
      );
    }

    const contactDetails = [];
    if (patientInfo.email) contactDetails.push(patientInfo.email);
    if (patientInfo.phoneNumber) contactDetails.push(patientInfo.phoneNumber);

    if (contactDetails.length > 0) {
      renderFourColumnRow(
        'Contact',
        `${contactDetails.join('   |   ')}`,
        'Consult Type',
        `${appointmentData.consultType}`,
        doc.y
      );
    }

    if (patientInfo.uhid) {
      renderFourColumnRow('UHID', `${patientInfo.uhid}`, ' ', ' ', doc.y);
    }

    if (appointmentData.displayId) {
      renderFourColumnRow('Appt ID', `${appointmentData.displayId}`, ' ', ' ', doc.y);
    }
  };

  const renderDoctorData = async (
    doctorInfo: RxPdfData['doctorInfo'],
    appointmentData: RxPdfData['appointmentDetails']
  ) => {
    if (doctorInfo) {
      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }
      const prescribedText = 'Prescribed on ' + appointmentData.consultDate + ' by';
      drawHorizontalDivider(doc.y);
      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
        .fillColor('#666666')
        .text(`${prescribedText}`, margin + 15)
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
      const nameLine = `${doctorInfo.salutation.replace('.', '')}. ${doctorInfo.firstName} ${
        doctorInfo.lastName
      }`;
      const specialty = doctorInfo.specialty;
      const registrationLine = `Reg.No. ${doctorInfo.registrationNumber}`;

      if (doc.y > doc.page.height - 150) {
        pageBreak();
      }

      doc
        .fontSize(11)
        .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
        .fillColor('#02475b')
        .text(nameLine, margin + 15);

      if (doctorInfo.qualifications) {
        doc
          .fontSize(9)
          .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
          .fillColor('#02475b')
          .text(`${doctorInfo.qualifications}`, margin + 15)
          .moveDown(0.5);
      }

      doc
        .fontSize(9)
        .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
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
    doc.moveUp(1.5);
    renderpatients(rxPdfData.patientInfo, rxPdfData.appointmentDetails);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.caseSheetSymptoms) || !_isEmpty(rxPdfData.vitals)) {
    renderSymptoms(rxPdfData.caseSheetSymptoms, rxPdfData.vitals);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.diagnoses)) {
    renderDiagnoses(rxPdfData.diagnoses);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.prescriptions) || !_isEmpty(rxPdfData.removedMedicinesList)) {
    renderPrescriptions(rxPdfData.prescriptions, rxPdfData.removedMedicinesList);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.diagnosesTests)) {
    renderDiagnosticTest(rxPdfData.diagnosesTests);
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.generalAdvice)) {
    renderGeneralAdvice(
      rxPdfData.generalAdvice,
      rxPdfData.followUpDetails,
      rxPdfData.referralSpecialtyName,
      rxPdfData.referralSpecialtyDescription
    );
    doc.moveDown(1.5);
  }

  if (!_isEmpty(rxPdfData.doctorInfo)) {
    renderDoctorData(rxPdfData.doctorInfo, rxPdfData.appointmentDetails);
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
      .text(`Page ${i + 1} of ${range.count}`, margin, doc.page.height - 95, { align: 'right' });
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
  patientsDb: Connection,
  doctorData: Doctor,
  caseSheet: CaseSheet
) => {
  const currentTimeStamp = getUnixTime(new Date()) * 1000;
  const randomNumber = Math.floor(Math.random() * 10000);
  const fileFormat = uploadDocInput.fileType.toLowerCase();
  const documentName = `${currentTimeStamp}${randomNumber}.${fileFormat}`;

  const doctorFacilities = doctorData.doctorHospital;
  const appointmentFacilityId = caseSheet.appointment.hospitalId;
  const doctorHospital = doctorFacilities.filter(
    (item) => item.facility.id == appointmentFacilityId
  );
  const hospitalDetails = doctorHospital[0].facility;

  const prescriptionFiles = [];
  prescriptionFiles.push({
    id: '',
    fileName: documentName,
    mimeType: 'application/pdf',
    content: uploadDocInput.base64FileInput,
    dateCreated: getUnixTime(new Date()) * 1000,
  });

  const instructions: string[] = [];
  const generalAdvice = JSON.parse(
    JSON.stringify(caseSheet.otherInstructions)
  ) as CaseSheetOtherInstruction[];
  if (generalAdvice)
    generalAdvice.forEach((advice) => {
      instructions.push(advice.instruction);
    });

  const diagnosticPrescription: string[] = [];
  const diagnosesTests = JSON.parse(
    JSON.stringify(caseSheet.diagnosticPrescription)
  ) as CaseSheetDiagnosisPrescription[];

  if (diagnosesTests)
    diagnosesTests.forEach((tests) => {
      diagnosticPrescription.push(tests.itemname);
    });

  let caseSheetMedicinePrescription: CaseSheetMedicinePrescription[] = [];
  caseSheetMedicinePrescription = JSON.parse(
    JSON.stringify(caseSheet.medicinePrescription)
  ) as CaseSheetMedicinePrescription[];

  if (caseSheetMedicinePrescription)
    caseSheetMedicinePrescription.forEach((element) => {
      element.externalId = '';
    });

  const prescriptionInputArgs: PrescriptionInputArgs = {
    prescriptionInput: {
      prescribedBy: doctorData.fullName,
      prescriptionName: caseSheet.id,
      dateOfPrescription: getUnixTime(new Date()) * 1000,
      startDate: 0,
      endDate: 0,
      notes: '',
      prescriptionSource: prescriptionSource.EPRESCRIPTION,
      prescriptionDetail: [],
      prescriptionFiles: prescriptionFiles,
      speciality: doctorData.specialty.name,
      hospital_name: hospitalDetails.name,
      address: hospitalDetails.streetLine1,
      city: hospitalDetails.city,
      pincode: hospitalDetails.zipcode,
      instructions: instructions,
      diagnosis: [],
      diagnosticPrescription: diagnosticPrescription,
      medicinePrescriptions: caseSheetMedicinePrescription,
    },
    uhid: patientDetails.uhid,
  };

  const uploadedResult = (await uploadPrescriptions(null, prescriptionInputArgs, null)) as {
    recordId: string;
  };
  const fileId = uploadedResult.recordId;
  return fileId ? { status: true, fileId } : { status: false, fileId: '' };
};
