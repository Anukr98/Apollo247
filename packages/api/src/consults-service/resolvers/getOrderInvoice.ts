import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { FacilityRepository } from 'doctors-service/repositories/facilityRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';
import _ from 'lodash';
import _capitalize from 'lodash/capitalize';
import _isEmpty from 'lodash/isEmpty';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

export const getOrderInvoiceTypeDefs = gql`
type AppointmentsResult {
  appointments : [ApptResponse]
  doctor: docResponse
  patient: patientDetails
}
type patientDetails {
  uhid: String
  mobileNumber: String
  emailAddress: String
}
type docResponse {
  firstName: String
  lastName: String
  specialization: String
}
type ApptResponse {
    displayId: Int
    id: String
    patientName: String
    appointmentType: String
    appointmentDateTime: DateTime
    actualAmount: Float
    discountedAmount: Float
    appointmentPayments: [appointmentPayment]
    status: String
  }
type appointmentPayment {
  amountPaid: Float
  bankTxnId: String
  id: String
  paymentRefId: String
  paymentStatus: String
  paymentType: String
  responseMessage: String
}
  extend type Query {
    getOrderInvoice(patientId: String, appointmentId: String): AppointmentsResult
  }
`;

type ApptResponse = {
  displayId: number;
  id: string;
  patientName: string;
  appointmentDateTime: Date;
  actualAmount: Number;
  discountedAmount: Number;
  appointmentType: string
  appointmentPayments: appointmentPayment[];
  status: String;
};

type AppointmentsResult = {
  appointments: ApptResponse[];
  doctor: doctorResponse;
  patient: patientResponse
  hospitalAddress: hospitalDetails
}

type appointmentPayment = {
  amountPaid: Number;
  bankTxnId: string;
  id: string;
  paymentRefId: string;
  paymentStatus: string;
  paymentType: string;
  responseMessage: string;
}

const getOrderInvoice: Resolver<
  null,
  { patientId: string, appointmentId: string },
  ConsultServiceContext,
  AppointmentsResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const docConsultRep = doctorsDb.getCustomRepository(DoctorRepository);
  const patientsRep = patientsDb.getCustomRepository(PatientRepository);
  const response = await apptsRepo.findByAppointmentId(args.appointmentId);
  console.log('orders Response', JSON.stringify(response, null, 2));

  const patientDetails = await patientsRep.findById(args.patientId);
  console.log('orders Response', JSON.stringify(patientDetails, null, 2));

  const docResponse = await docConsultRep.findDoctorByIdWithoutRelations(response[0].doctorId);
  console.log('doc Response', JSON.stringify(docResponse, null, 2));
  const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
  let hospitalDetails;
  if (response && response.length > 0)
    hospitalDetails = await facilityRepo.getfacilityDetails(response[0].hospitalId);

  const assetsDir = <string>process.env.ASSETS_DIRECTORY;
  console.log('assets', assetsDir);
  const loadAsset = (file: string) => path.resolve(assetsDir, file);
  const AppointmentsResult = { appointments: response, doctor: docResponse, patient: patientDetails, hospitalAddress: hospitalDetails };

  // export const generateRxPdfDocument = (AppointmentsResult: RxPdfData): typeof PDFDocument => {
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
      .text(_capitalize(headerText), margin + 100, doc.y + 10, { fill: true })
      .moveDown(2);
  };

  const renderDetailsRow = (labelText: string, labelValue: string, y?: number) => {
    doc
      .fontSize(9)
      // .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fillColor('#000000')
      .text(labelText, margin + 10, y, { lineBreak: false });
    return doc
      .fontSize(labelText === 'Patient' ? 10 : 9)
      .fillColor('#02475b')
      .text(`${labelValue}`, 200, y)
      .opacity(0.6)
      .moveDown(0.5);
  };

  const headerEndY = 120;

  const renderHeader = (
    doctorInfo: AppointmentsResult['doctor'],
    hospitalAddress: AppointmentsResult['hospitalAddress']
  ) => {
    // doc.image(loadAsset('apolloLogo.png'), margin, margin / 2, { height: 65 });

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
      // .font(assetsDir + '/fonts/IBMPlexSans-Medium.ttf')
      .fillColor('#000000')
      .text(hospitalAddress.name);

    doc.moveDown(0.2).text(hospitalAddress.streetLine1);
    if (hospitalAddress.streetLine2) doc.moveDown(0.2).text(hospitalAddress.streetLine2);
    doc.moveDown(0.2).text(addressLastLine);

    doc.moveDown(2);
  };

  const renderFooter = () => {
    drawHorizontalDivider(doc.page.height - 80);
    const disclaimerText = 'This is a computer generated Receipt. No signature required.'
    doc
      .fontSize(10)
      .fillColor('#000000')
      .opacity(0.5)
      .text(disclaimerText, margin, doc.page.height - 80, { align: 'left' });
    return doc;
  };

  const renderpatients = (
    patientInfo: AppointmentsResult['patient'],
    appointmentData: AppointmentsResult['appointments']
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
    console.log('text Array ', textArray);
    if (textArray.length > 0) {
      renderDetailsRow('Patient Name', `${textArray.join('   |   ')}`, doc.y);
    }

    // if (patientInfo.uhid) {
    renderDetailsRow('Patient UHID', `${patientInfo.uhid}`, doc.y);
    // }
    if (patientInfo.mobileNumber) {
      renderDetailsRow('Mobile Number', `${patientInfo.mobileNumber}`, doc.y);
    }
    // if (patientInfo.emailAddress) {
    renderDetailsRow('Email Address', `${patientInfo.emailAddress}`, doc.y);
    // }
    if (appointmentData[0].displayId) {
      renderDetailsRow('Appointment ID', `${appointmentData[0].displayId}`, doc.y);
    }

    if (appointmentData[0].appointmentDateTime) {
      renderDetailsRow('Consult Date', `${moment(appointmentData[0].appointmentDateTime).format('DD MMM YYYY hh:mm A')}`, doc.y);
    }

    if (appointmentData[0].appointmentType) {
      renderDetailsRow('Consult Type', `${appointmentData[0].appointmentType}`, doc.y);
    };
    if (appointmentData[0].appointmentPayments && appointmentData[0].appointmentPayments.length > 0) {
      renderDetailsRow('Payment Reference Number', `${appointmentData[0].appointmentPayments[0].paymentRefId}`, doc.y);
    };
    if (appointmentData[0].appointmentPayments && appointmentData[0].appointmentPayments.length > 0) {
      renderDetailsRow('Payment Status', `${appointmentData[0].appointmentPayments[0].paymentStatus}`, doc.y);
    };
    if (appointmentData[0].actualAmount) {
      renderDetailsRow(appointmentData[0].appointmentType + ' Consultation Fees', `${appointmentData[0].actualAmount}`, doc.y);
    };
    if (appointmentData[0].discountedAmount) {
      renderDetailsRow('Discount Applied', ` - ${appointmentData[0].discountedAmount}`, doc.y);
    };
    if (appointmentData[0].discountedAmount) {
      let totalAmount = parseInt(appointmentData[0].actualAmount) - parseInt(appointmentData[0].discountedAmount)
      renderDetailsRow('Total Amount', `${totalAmount}`, doc.y);
    };
  };
  doc.on('pageAdded', () => {
    renderFooter();
    renderHeader(AppointmentsResult.doctor, AppointmentsResult.hospitalAddress);
  });

  renderFooter();
  renderHeader(AppointmentsResult.doctor, AppointmentsResult.hospitalAddress);

  if (!_isEmpty(AppointmentsResult.patient)) {
    renderpatients(AppointmentsResult.patient, AppointmentsResult.appointments);
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

  doc.pipe(fs.createWriteStream('./file.pdf'));
  doc.end();
  if (response && response.length > 0) {
    return { appointments: response, doctor: docResponse, patient: patientDetails }
  } else throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  // }
};

export const getOrderInvoiceResolvers = {
  Query: {
    getOrderInvoice,
  },
};