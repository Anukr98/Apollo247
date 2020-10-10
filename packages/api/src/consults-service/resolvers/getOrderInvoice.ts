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
import { log } from 'customWinstonLogger';
import { Doctor, Facility } from 'doctors-service/entities';
import { Appointment } from 'consults-service/entities';
import { Patient } from 'profiles-service/entities';
import { sendMail } from 'notifications-service/resolvers/email'
import { EmailAttachMent, EmailMessage } from 'types/notificationMessageTypes';
import { ApiConstants } from 'ApiConstants';
import { Connection } from 'typeorm';
import { invoiceEmail } from "helpers/emailTemplates/invoiceEmailTemplate";

export const getOrderInvoiceTypeDefs = gql`
  extend type Query {
    getOrderInvoice(patientId: String, appointmentId: String, emailId: Email): String
  }
`;

type AppointmentsResult = {
  appointments: Appointment[];
  doctor: Doctor;
  patient: Patient;
  hospitalAddress: Facility;
};

const assetsDir = <string>process.env.ASSETS_DIRECTORY;
// console.log('assets', assetsDir);
const loadAsset = (file: string) => path.resolve(assetsDir, file);

// const getOrderInvoice: Resolver<
//   null,
//   { patientId: string; appointmentId: string },
//   ConsultServiceContext,
//   string
// > = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {


//   /**
//    * Method checks if appoinment related to appointmentId exists, 
//    * if yes then return type AppointmentsResult
//    */
//   const appointmentsResult = await getAppointmentDetails(consultsDb, doctorsDb, patientsDb, args);
//   const {
//     appointments
//   } = appointmentsResult
//   const appointment = appointments[0];

//   // either blobUrl is returned or boolean false is returned
//   const response = await checkIfBlobExists(appointment);

//   // If invoice exists in storage for the appointment, return the URL  
//   if (response) {
//     return response;
//   }

//   // Generate the pdf document with required details
//   const doc = invoiceFormat(appointmentsResult);

//   // Upload pdf doc to azure storage
//   const [blobUrl] = await uploadRxPdf(appointment.id, appointment.appointmentDateTime, doc).catch(e => {
//     log(
//       'consultServiceLogger',
//       `UPLOAD_TO_AZURE_STORAGE_FAILED - ${appointment.id}`,
//       'uploadRxPdf()',
//       e.stack,
//       'true'
//     )
//     throw new AphError(AphErrorMessages.UPLOAD_INVOICE_TO_STORAGE_FAILED, undefined, e);

//   })
//   return blobUrl;

// };

const getOrderInvoice: Resolver<
  null,
  { patientId: string; appointmentId: string, emailId?: string },
  ConsultServiceContext,
  string
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const appointmentsResult = await getAppointmentDetails(consultsDb, doctorsDb, patientsDb, args);
  const {
    appointments
  } = appointmentsResult
  const appointment = appointments[0];

  // blobUrlCreated can be either url or boolean false
  let blobUrlCreated = await checkIfBlobExists(appointment);

  const name = getFileName(appointment.id, appointment.appointmentDateTime);

  // filePath where pdf will be stored if pdf does not exist in storage already
  const filePath = loadAsset(name);

  if (blobUrlCreated && !args.emailId) {
    return blobUrlCreated;
  } else if (!blobUrlCreated && !args.emailId) {
    const [blobUrl] = await generatePDFAndUpload();
    unlinkFile(filePath);
    return blobUrl;
  } else {

    // PDF file to be sent as attachment with the email
    const attachment: EmailAttachMent[] = [];

    let attachmentContent: string = '';

    if (blobUrlCreated) {
      // Download file from storage, it gives readablestream
      const rawData = await getStorageInstance().downloadFile(name);
      if (rawData.readableStreamBody) {
        // Generate content from the stream of data
        attachmentContent = (await streamToBuffer(rawData.readableStreamBody!)).toString('base64');
      }
    } else {
      const [blobUrl, filePath] = await generatePDFAndUpload();
      attachmentContent = fs.readFileSync(filePath).toString("base64");
      blobUrlCreated = blobUrl;
      unlinkFile(filePath);

    }
    attachment.push({
      content: attachmentContent,
      filename: name,
      type: "application/pdf",
      disposition: "attachment"
    })

    const emailContent: EmailMessage = {
      messageContent: <string>invoiceEmail({
        name: appointment.patientName,
        displayId: appointment.displayId
      }),
      fromEmail: <string>ApiConstants.PATIENT_HELP_FROM_EMAILID,
      fromName: <string>ApiConstants.PATIENT_HELP_FROM_NAME,
      toEmail: <string>args.emailId,
      subject: `Invoice for Appointment- ${appointment.displayId}`,
      attachments: attachment
    };
    sendMail(emailContent);
    return blobUrlCreated;
  }

  async function generatePDFAndUpload() {
    const doc = invoiceFormat(appointmentsResult);
    const fileUploaded = await uploadRxPdf(appointment.id, appointment.appointmentDateTime, doc).catch(e => {
      log(
        'consultServiceLogger',
        `UPLOAD_TO_AZURE_STORAGE_FAILED - ${appointment.id}`,
        'uploadRxPdf()',
        e.stack,
        'true'
      )
      throw new AphError(AphErrorMessages.UPLOAD_INVOICE_TO_STORAGE_FAILED, undefined, e);
    });
    return fileUploaded;
  }
}

const invoiceFormat = (AppointmentsResult: AppointmentsResult) => {
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

    const nameLine = `${doctorInfo.salutation} ${doctorInfo.firstName} ${doctorInfo.lastName}`;

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
  if (AppointmentsResult.doctor && AppointmentsResult.doctor == null) {
    throw new AphError(AphErrorMessages.FILE_SAVE_ERROR);
  }
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
  return doc;
}

const getAppointmentDetails = async (consultsDb: Connection,
  doctorsDb: Connection,
  patientsDb: Connection,
  args: { patientId: string, appointmentId: string, emailId?: string }) => {

  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const docConsultRep = doctorsDb.getCustomRepository(DoctorRepository);
  const patientsRep = patientsDb.getCustomRepository(PatientRepository);
  const appointments = await apptsRepo.findByAppointmentId(args.appointmentId);
  if (
    appointments == null ||
    appointments.length == 0 ||
    !process.env.AZURE_STORAGE_INVOICES_CONTAINER_NAME
  ) {
    throw new AphError(AphErrorMessages.APPOINTMENT_ID_NOT_FOUND, undefined, { appointmentId: args.appointmentId });
  }

  const patientDetails = await patientsRep.getPatientDetails(args.patientId);
  const docResponse = await docConsultRep.findDoctorByIdWithoutRelations(
    appointments[0].doctorId
  );
  const facilityRepo = doctorsDb.getCustomRepository(FacilityRepository);
  const hospitalDetails = await facilityRepo.getfacilityDetails(appointments[0].hospitalId);

  if (!patientDetails || !hospitalDetails || !docResponse) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, { patientDetails, hospitalDetails, docResponse });
  }

  const AppointmentsResult: AppointmentsResult = {
    appointments: appointments,
    doctor: docResponse,
    patient: patientDetails,
    hospitalAddress: hospitalDetails,
  };
  return AppointmentsResult;
}

const checkIfBlobExists = async (appointment: Appointment) => {
  const name = getFileName(appointment.id, appointment.appointmentDateTime);

  const client = getStorageInstance();
  const blobUrlCreated = client.getBlobUrl(name)

  const response = await fetch(blobUrlCreated, {
    method: 'GET'
  }).catch(e => {
    log(
      'consultServiceLogger',
      `FETCH_REQUEST_FAILED- ${appointment.id}`,
      'checkIfBlobExists()',
      e.stack,
      'true'
    )
    throw new AphError(AphErrorMessages.GET_INVOICE_BLOB_FAILED, undefined, e);

  })
  if (response && response.status === 200) {
    return blobUrlCreated;
  } else {
    return false;
  }
}

const getFileName = (id: Appointment['id'], dateTime: Appointment['appointmentDateTime']) => {
  return `${id}_${getTime(new Date(dateTime))}.pdf`;
}

//TODO see if can do it in child process to unblock the main process
const uploadRxPdf = async (
  appointmentId: Appointment['id'],
  appointmentDateTime: Appointment['appointmentDateTime'],
  pdfDoc: PDFKit.PDFDocument
): Promise<string[]> => {
  const name = getFileName(appointmentId, appointmentDateTime);
  const filePath = loadAsset(name);
  return new Promise((resolve, reject) => {
    const client = getStorageInstance();
    const writeableStream = fs.createWriteStream(filePath);
    pdfDoc.pipe(writeableStream);
    writeableStream.on('finish', async () => {
      const blob = await client.uploadFile({ name, filePath });
      const blobUrl = await client.getBlobUrl(blob.name);

      resolve([blobUrl, filePath]);
    });
    pdfDoc.on('error', (error) => {
      log(
        'consultServiceLogger',
        'uploadRxPdf()',
        'getOrderInvoice->uploadRxPdf()',
        JSON.stringify(error),
        'true'
      );
      reject(error);
    });
  });
};

const unlinkFile = (filePath: string) => {
  fs.unlink(filePath, (error) => {
    if (error) {
      log(
        'consultServiceLogger',
        'getOrderInvoice fs.unlink error',
        'getOrderInvoice()->fs.unlink',
        JSON.stringify(error),
        'true'
      );
    }
  });
}

const getStorageInstance = () => {
  return new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API,
    <string>process.env.AZURE_STORAGE_INVOICES_CONTAINER_NAME
  );
}

// A helper method used to read a Node.js readable stream into a Buffer
async function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on("data", (data: Buffer | string) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

export const getOrderInvoiceResolvers = {
  Query: {
    getOrderInvoice,
  },
};
