import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import _capitalize from 'lodash/capitalize';
import _isEmpty from 'lodash/isEmpty';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { getTime, format, addMinutes } from 'date-fns';

export const getOrderInvoiceTypeDefs = gql`
  extend type Query {
    getOrderInvoice(patientId: String, appointmentId: String): String
  }
`;

type ApptResponse = {
  displayId: number;
  id: string;
  patientName: string;
  appointmentDateTime: Date;
  actualAmount: number;
  discountedAmount: number;
  appointmentType: string;
  appointmentPayments: AppointmentPayment[];
  status: string;
};

type AppointmentsResult = {
  appointments: ApptResponse[];
  doctor: DoctorResponse;
  patient: PatientResponse;
  hospitalAddress: HospitalDetails;
};
type HospitalDetails = {
  name: string;
  city: string;
  streetLine1: string;
  zipcode: string;
  state: string;
  streetLine2: string;
  country: string;
};
type PatientResponse = {
  uhid: string;
  mobileNumber: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
};
type DoctorResponse = {
  firstName: string;
  lastName: string;
  specialty: Specialty;
  salutation: string;
  registrationNumber: string;
};
type Specialty = {
  name: string;
};
type AppointmentPayment = {
  amountPaid: number;
  bankTxnId: string;
  id: string;
  paymentRefId: string;
  paymentStatus: string;
  paymentType: string;
  responseMessage: string;
};

const assetsDir = <string>process.env.ASSETS_DIRECTORY;
// console.log('assets', assetsDir);
const loadAsset = (file: string) => path.resolve(assetsDir, file);

const getOrderInvoice: Resolver<
  null,
  { patientId: string; appointmentId: string },
  ConsultServiceContext,
  string
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const docConsultRep = doctorsDb.getCustomRepository(DoctorRepository);
  const patientsRep = patientsDb.getCustomRepository(PatientRepository);
  const patientResponse = await apptsRepo.findByAppointmentId(args.appointmentId);
  if (
    patientResponse == null ||
    patientResponse.length == 0 ||
    !process.env.AZURE_STORAGE_INVOICES_CONTAINER_NAME
  ) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const patientDetails = await patientsRep.getPatientDetails(args.patientId);

  const docResponse = await docConsultRep.findDoctorByIdWithoutRelations(
    patientResponse[0].doctorId
  );
  // console.log('doc Response', JSON.stringify(docResponse, null, 2));
  const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
  let hospitalDetails;
  if (patientResponse && patientResponse.length > 0)
    hospitalDetails = await facilityRepo.getfacilityDetails(patientResponse[0].hospitalId);

  const AppointmentsResult = {
    appointments: patientResponse,
    doctor: docResponse,
    patient: patientDetails,
    hospitalAddress: hospitalDetails,
  };

  const margin = 35;
  const doc = new PDFDocument({ margin, bufferPages: true });

  const renderFourColumnRow = (
    labelText1: string,
    labelValue1: string,
    labelText2: string,
    labelValue2: string,
    y?: number
  ) => {
    return doc
      .fontSize(11)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#01475b')
      .text(labelText1, margin + 10, y, { lineBreak: false })

      .fontSize(11)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#6d7278')
      .text(`${labelValue1}`, 150, y, { lineBreak: false })
      .moveDown(0.5)

      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#01475b')
      .text(labelText2, margin + 300, y, { lineBreak: false })

      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#6d7278')
      .text(`${labelValue2}`, 450, y)

      .moveDown(0.5);
  };

  const todayDate = 'Date : ' + format(new Date(), 'dd MMM yyyy');

  const renderHeader = (
    doctorInfo: AppointmentsResult['doctor'],
    hospitalAddress: AppointmentsResult['hospitalAddress']
  ) => {
    doc
      .moveTo(0, 1)
      .lineTo(doc.page.width, 1)
      .lineTo(doc.page.width, 140)
      .lineTo(doc.page.width, 140)
      .lineTo(0, 140)

      .fill('#fbfbfb');
    doc.moveDown(2);

    doc
      .opacity(1)
      .image(loadAsset('apolloLogo.png'), margin, margin / 2, { height: 65, align: 'center' });

    doc
      .fontSize(11)
      .fillColor('#01475b')
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .text('Apollo 24X7', 370, margin, { align: 'right' })
      .moveDown(0.3)

      .fillColor('#828691')
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .text('Apollo Hospitals Enterprise Ltd.,', { align: 'right' })
      .moveDown(0.3)

      .fillColor('#828691')
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .text('Redg Off : 19, Bishop Gardens,', { align: 'right' })
      .moveDown(0.3)

      .fillColor('#828691')
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .text(' RA Puram, Chennai - 600028', { align: 'right' })
      .moveDown(0.4)

      .text('GST Number - 33AAACA5443N1ZP', { align: 'right' })
      .fillColor('#6d7278')
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .moveDown(0.2)

      .fillColor('#828691')
      .text(`${todayDate}`, { align: 'right' });
    doc.moveDown(2);
  };

  const renderpatients = (
    patientInfo: AppointmentsResult['patient'],
    appointmentData: AppointmentsResult['appointments'],
    doctorInfo: AppointmentsResult['doctor']
  ) => {
    doc.moveDown(1.5);
    doc
      .fontSize(16)
      .fillColor('#01475b')
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .text('PAYMENT RECEIPT', margin, doc.y, { align: 'center' })
      .moveDown(0.3);

    doc
      .fontSize(16)
      .fillColor('#6d7278')
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .text(`Invoice Number: APOLLO-CON-A${appointmentData[0].displayId} `, margin, doc.y, {
        align: 'center',
      })
      .moveDown(1.5);

    doc
      .moveTo(margin, doc.y)
      .lineTo(doc.page.width - margin, doc.y)
      .lineTo(doc.page.width - margin, doc.y + 170)
      .lineTo(margin, doc.y + 170)
      .lineTo(margin, doc.y)

      .fill('#fbfbfb');

    const textArray = [];
    let patientName = '';
    if (patientInfo.firstName) patientName = patientInfo.firstName;
    if (patientInfo.lastName) {
      if (patientName.length > 0) patientName = patientName + ' ' + patientInfo.lastName;
      else patientName = patientInfo.lastName;
    }
    if (patientName) textArray.push(`${patientName}`);

    if (textArray.length > 0) {
      renderFourColumnRow(
        'Patient Name',
        `${textArray.join('   |   ')}`,
        'Patient UHID',
        `${patientInfo.uhid}`,
        doc.y + 10
      );
    }
    if (patientInfo.mobileNumber) {
      renderFourColumnRow(
        'Contact No.',
        `${patientInfo.mobileNumber.slice(3)}`,
        'Email ID',
        `${patientInfo.emailAddress ? patientInfo.emailAddress : '-'}`,
        doc.y + 10
      );
    }

    renderFourColumnRow(
      'Service Name',
      'Medical Consult',
      'Service Type',
      `${_capitalize(appointmentData[0].appointmentType)}`,
      doc.y + 10
    );

    const nameLine = `${doctorInfo.salutation}. ${doctorInfo.firstName} ${doctorInfo.lastName}`;

    const specialty = doctorInfo.specialty.name;
    renderFourColumnRow(
      'Doctor Name',
      `${nameLine}`,
      'Doctor Speciality',
      `${specialty}`,
      doc.y + 10
    );

    const formattedDate = format(
      addMinutes(appointmentData[0].appointmentDateTime, 330),
      'dd MMM yyyy'
    );
    renderFourColumnRow(
      'Appointment ID',
      `${appointmentData[0].displayId}`,
      'Date of Appointment',
      `${formattedDate}`,
      doc.y + 10
    );

    // doc.moveDown(4);

    doc
      .moveTo(margin, doc.y)
      .lineTo(doc.page.width - margin, doc.y)
      .lineWidth(1)
      .fill('#e7e8ec')
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fillColor('#01475b')
      .text('Apollo 24X7 Online Teleconsultation Fees', margin + 165, doc.y, {
        lineBreak: false,
        align: 'right',
      })
      .fillColor('#02475b')
      .text(`Rs ${appointmentData[0].actualAmount}`, margin + 450, doc.y, { align: 'left' })
      .moveDown(1);

    const discount: number =
      (appointmentData[0].actualAmount as number) - (appointmentData[0].discountedAmount as number);
    doc
      .fontSize(12)
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fillColor('#0087ba')
      .text('Discount Applied', margin + 300, doc.y, {
        lineBreak: false,
        align: 'right',
      })
      .fillColor('#0087ba')
      .text(`Rs ${discount}`, margin + 450, doc.y, { align: 'left' })
      .moveDown(1.5);

    doc
      .moveTo(margin, doc.y)
      .lineTo(doc.page.width - margin, doc.y)
      .lineWidth(1)
      .fill('#e7e8ec')
      .moveDown(1);

    doc
      .fontSize(15)
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fillColor('#01475b')
      .text('Total Amount', margin + 300, doc.y, {
        lineBreak: false,
        align: 'right',
      })
      .fillColor('#01475b')
      .fontSize(15)
      .text(`Rs ${appointmentData[0].discountedAmount}`, margin + 450, doc.y, { align: 'left' })
      .moveDown(1);

    doc
      .moveTo(margin, doc.y)
      .lineTo(doc.page.width - margin, doc.y)
      .lineWidth(1)
      .fill('#e7e8ec')
      .moveDown(4);

    doc
      .fontSize(11)
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fillColor('#01475b')
      .text('SUPPORT', margin + 15, doc.y)
      .moveDown(1);

    doc
      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fillColor('#6d7278')
      .text('help@apollo247.org', margin + 15, doc.y, {
        lineBreak: false,
        align: 'center',
      })
      .fontSize(11)
      .fillColor('#6d7278')
      .text('This is a computer generated Receipt. No signature required.', 200, doc.y, {
        align: 'right',
      })
      .moveDown(0.5);
  };
  if (AppointmentsResult.doctor && AppointmentsResult.doctor == null)
    throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
  doc.on('pageAdded', () => {
    //renderFooter();
    if (AppointmentsResult.doctor && AppointmentsResult.hospitalAddress) {
      renderHeader(AppointmentsResult.doctor, AppointmentsResult.hospitalAddress);
    }
  });

  //renderFooter();
  if (AppointmentsResult.doctor && AppointmentsResult.hospitalAddress) {
    renderHeader(AppointmentsResult.doctor, AppointmentsResult.hospitalAddress);
  }
  if (!_isEmpty(AppointmentsResult.patient)) {
    if (AppointmentsResult.patient && AppointmentsResult.doctor) {
      renderpatients(
        AppointmentsResult.patient,
        AppointmentsResult.appointments,
        AppointmentsResult.doctor
      );
      doc.moveDown(1.5);
    }
  }

  doc.end();

  const client = new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API,
    process.env.AZURE_STORAGE_INVOICES_CONTAINER_NAME
  );
  return await uploadRxPdf(client, patientResponse[0].id, doc);
};

export const uploadRxPdf = async (
  client: AphStorageClient,
  appointmentId: String,
  pdfDoc: PDFKit.PDFDocument
) => {
  const name = `${appointmentId}_${getTime(new Date())}.pdf`;
  const filePath = loadAsset(name);
  pdfDoc.pipe(fs.createWriteStream(filePath));
  await delay(350);

  const blob = await client.uploadFile({ name, filePath });
  const blobUrl = client.getBlobUrl(blob.name);
  fs.unlink(filePath, (error) => null);
  return blobUrl;

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};

export const getOrderInvoiceResolvers = {
  Query: {
    getOrderInvoice,
  },
};
