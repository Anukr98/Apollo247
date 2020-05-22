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
  specialization: string;
  salutation: string;
  registrationNumber: string;
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
  // console.log('orders Response', JSON.stringify(patientResponse, null, 2));

  const patientDetails = await patientsRep.findById(args.patientId);
  // console.log('orders Response', JSON.stringify(patientDetails, null, 2));

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
      .fontSize(11)
      .text(headerText, margin + 100, doc.y + 10, { fill: true })
      .moveDown(2);
  };

  const renderFourColumnRow = (
    labelText1: string,
    labelValue1: string,
    labelText2: string,
    labelValue2: string,
    y?: number
  ) => {
    return doc
      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#7f7f7f')
      .text(labelText1, margin + 10, y, { lineBreak: false })

      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#333333')
      .text(`${labelValue1}`, 200, y, { lineBreak: false })
      .moveDown(0.5)

      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#7f7f7f')
      .text(labelText2, margin + 300, y, { lineBreak: false })

      .fontSize(10)
      .font(assetsDir + '/fonts/IBMPlexSans-Regular.ttf')
      .fillColor('#333333')
      .text(`${labelValue2}`, 450, y)

      .moveDown(0.5);
  };

  const renderHeader = (
    doctorInfo: AppointmentsResult['doctor'],
    hospitalAddress: AppointmentsResult['hospitalAddress']
  ) => {
    doc.image(loadAsset('apolloLogo.png'), margin, margin / 2, { height: 65 });

    //Doctor Details
    const nameLine = `${doctorInfo.salutation}. ${doctorInfo.firstName} ${doctorInfo.lastName}`;
    const specialty = doctorInfo.specialization;
    const registrationLine = `MCI Reg.No. ${doctorInfo.registrationNumber}`;

    doc
      .fontSize(10)
      .fillColor('#02475b')
      .text(nameLine, 370, margin);

    doc
      .moveDown(0.3)
      .fontSize(9)
      .fillColor('#02475b')
      .text(`${specialty} | ${registrationLine}`);

    //Doctor Address Details
    const addressLastLine = `${hospitalAddress.city}  ${
      hospitalAddress.zipcode ? ' - ' + hospitalAddress.zipcode : ''
    } | ${hospitalAddress.state}, ${hospitalAddress.country}`;

    doc
      .moveDown(1)
      .fontSize(8)
      .fillColor('#000000')
      .text(hospitalAddress.name);

    doc.moveDown(0.2).text(hospitalAddress.streetLine1);
    if (hospitalAddress.streetLine2) doc.moveDown(0.2).text(hospitalAddress.streetLine2);
    doc.moveDown(0.2).text(addressLastLine);

    doc.moveDown(2);
  };

  const renderFooter = () => {
    drawHorizontalDivider(doc.page.height - 80);
    const disclaimerText = 'This is a computer generated Receipt. No signature required.';
    doc
      .fontSize(10)
      .fillColor('#000000')
      .opacity(0.5)
      .text(disclaimerText, margin, doc.page.height - 80, { align: 'left' });
    return doc;
  };

  const renderpatients = (
    patientInfo: AppointmentsResult['patient'],
    appointmentData: AppointmentsResult['appointments'],
    doctorInfo: AppointmentsResult['doctor']
  ) => {
    renderSectionHeader('PAYMENT RECEIPT');

    const textArray = [];
    let patientName = '';
    if (patientInfo.firstName) patientName = patientInfo.firstName;
    if (patientInfo.lastName) {
      if (patientName.length > 0) patientName = patientName + ' ' + patientInfo.lastName;
      else patientName = patientInfo.lastName;
    }
    if (patientName) textArray.push(`${patientName}`);
    // console.log('text Array ', textArray);
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
        'Email Address',
        `${patientInfo.emailAddress}`,
        doc.y + 10
      );
    }
    if (appointmentData[0].displayId) {
      const formattedDate = format(
        addMinutes(appointmentData[0].appointmentDateTime, 330),
        'dd MMM yyyy hh:mm a'
      );
      renderFourColumnRow(
        'Appointment ID',
        `${appointmentData[0].displayId}`,
        'Date of Appointment',
        `${formattedDate}`,
        doc.y + 10
      );
    }
    if (appointmentData[0].appointmentType || doctorInfo.specialization) {
      const specialty = doctorInfo.specialization;
      renderFourColumnRow(
        'Service Type',
        `${_capitalize(appointmentData[0].appointmentType)}`,
        'Doctor Speciality',
        `${specialty}`,
        doc.y + 20
      );
    }
    if (doctorInfo.firstName || doctorInfo.lastName || doctorInfo.salutation) {
      const nameLine = `${doctorInfo.salutation}. ${doctorInfo.firstName} ${doctorInfo.lastName}`;
      renderFourColumnRow('Doctor Name', `${nameLine}`, '', '', doc.y + 10);
    }
    if (appointmentData[0].actualAmount) {
      renderFourColumnRow(
        _capitalize(appointmentData[0].appointmentType) + ' Consultation Fees',
        `Rs ${appointmentData[0].actualAmount}`,
        '',
        '',
        doc.y + 50
      );
    }
    if (appointmentData[0].discountedAmount && appointmentData[0].actualAmount) {
      const discount: number =
        (appointmentData[0].actualAmount as number) -
        (appointmentData[0].discountedAmount as number);
      renderFourColumnRow('Discount Applied', `Rs ${discount}`, '', '', doc.y + 10);
    }
    if (appointmentData[0].discountedAmount) {
      renderFourColumnRow(
        'Total Amount',
        `Rs ${appointmentData[0].discountedAmount}`,
        '',
        '',
        doc.y + 10
      );
    }
  };
  if (AppointmentsResult.doctor && AppointmentsResult.doctor == null)
    throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
  doc.on('pageAdded', () => {
    renderFooter();
    if (AppointmentsResult.doctor && AppointmentsResult.hospitalAddress) {
      renderHeader(AppointmentsResult.doctor, AppointmentsResult.hospitalAddress);
    }
  });

  renderFooter();
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
  if (
    patientResponse &&
    patientResponse.length > 0 &&
    process.env.AZURE_STORAGE_INVOICES_CONTAINER_NAME
  ) {
    const client = new AphStorageClient(
      process.env.AZURE_STORAGE_CONNECTION_STRING_API,
      process.env.AZURE_STORAGE_INVOICES_CONTAINER_NAME
    );
    return await uploadRxPdf(client, patientResponse[0].id, doc);
  } else throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
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
  // console.log('blobUrl===', blobUrl);
  // const base64pdf = await convertPdfUrlToBase64(blobUrl);
  fs.unlink(filePath, (error) => console.log(error));
  //const uploadData = { ...blob, base64pdf }; // returning blob details and base64Pdf
  // return uploadData;
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
