import gql from 'graphql-tag';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { Resolver } from 'api-gateway';
import fs from 'fs';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { format, addMilliseconds } from 'date-fns';
import path from 'path';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { STATUS } from 'consults-service/entities';

export const appointmentsSummaryTypeDefs = gql`
  type summaryResult {
    azureFilePath: String!
  }
  extend type Query {
    appointmentsSummary(fromDate: Date, toDate: Date, limit: Int): summaryResult!
  }
`;
type summaryResult = {
  azureFilePath: string;
};
const appointmentsSummary: Resolver<
  null,
  { fromDate: Date; toDate: Date; limit: number },
  ConsultServiceContext,
  summaryResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const fileName =
    process.env.NODE_ENV + '_appointments_' + format(new Date(), 'yyyyMMddhhmmss') + '.xls';
  let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const apptsList = await apptRepo.getAllAppointments(args.fromDate, args.toDate, args.limit);
  let serialNo = 1;
  let row1 = '';
  function getAppointments() {
    return new Promise(async (resolve, reject) => {
      if (apptsList.length == 0) {
        resolve(row1);
      }
      await apptsList.map(async (appt) => {
        const patientDetails = await patientRepo.findById(appt.patientId);
        if (!patientDetails) {
          throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
        }
        const doctorDetails = await doctorRepo.findById(appt.doctorId);
        if (!doctorDetails) {
          throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
        }
        const istDateTime = format(
          addMilliseconds(appt.appointmentDateTime, 19800000),
          'yyyy-MM-dd HH:mm'
        );
        const bookingDateTime = format(
          addMilliseconds(appt.bookingDate, 19800000),
          'yyyy-MM-dd HH:mm'
        );
        const followupCount = await apptRepo.followUpBookedCount(appt.id);
        let followUpBooked = false,
          prescriptionIssued = false,
          isCancelled = false,
          caseSheetId = '';
        if (followupCount > 0) {
          followUpBooked = true;
        }
        if (appt.caseSheet.length > 0 && appt.caseSheet[0].medicinePrescription != '') {
          prescriptionIssued = true;
          caseSheetId = appt.caseSheet[0].id;
        }
        if (appt.status == STATUS.CANCELLED) {
          isCancelled = true;
        }
        row1 +=
          serialNo +
          '\t' +
          appt.id +
          '\t' +
          patientDetails.mobileNumber.toString() +
          '\t' +
          patientDetails.uhid +
          '\t' +
          patientDetails.firstName +
          ' ' +
          patientDetails.lastName +
          '\t' +
          bookingDateTime +
          '\t' +
          istDateTime +
          '\t' +
          appt.appointmentType +
          '\t' +
          doctorDetails.mobileNumber.toString() +
          '\t' +
          doctorDetails.firstName +
          ' ' +
          doctorDetails.lastName +
          '\t' +
          doctorDetails.doctorType +
          '\t' +
          doctorDetails.specialty.name +
          '\t' +
          appt.isFollowUp +
          '\t' +
          followUpBooked +
          '\t' +
          caseSheetId +
          '\t' +
          caseSheetId +
          '\t' +
          prescriptionIssued +
          '\t' +
          'NA' +
          '\t' +
          'NA' +
          '\t' +
          isCancelled +
          '\n';
        if (serialNo == apptsList.length) {
          resolve(row1);
        }
        console.log(row1, 'ro11');
        serialNo++;
      });
    });
  }
  try {
    const writeStream = fs.createWriteStream(assetsDir + '/' + fileName);
    const header =
      'Sl No' +
      '\t' +
      ' Appointment Id' +
      '\t' +
      'Patient Mobile' +
      '\t' +
      'Patient UHID' +
      '\t' +
      'Patient Name' +
      '\t' +
      'Booking Date Time' +
      '\t' +
      'Appointment Date Time' +
      '\t' +
      'Appointment Type' +
      '\t' +
      'SD Mobile' +
      '\t' +
      'SD Name' +
      '\t' +
      'Doctor Type' +
      '\t' +
      'Doctor Speciality' +
      '\t' +
      'Is Followup' +
      '\t' +
      'Is Followup Booked' +
      '\t' +
      'Prescription Id' +
      '\t' +
      'Case Sheet Id' +
      '\t' +
      'Prescription Issued Y/N' +
      '\t' +
      'Consult Rescheduled' +
      '\t' +
      'Reschedule Reason' +
      '\t' +
      'Is Cancelled' +
      '\n';

    //const row1 = '0' + '\t' + ' 21' + '\t' + 'Rob' + '\n';
    writeStream.write(header);
    await getAppointments();
    writeStream.write(row1);
    writeStream.close();
  } catch (err) {
    console.log('file error', err);
  }

  const client = new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API,
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );

  if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'dev') {
    console.log('deleting container...');
    await client
      .deleteContainer()
      .then((res) => console.log(res))
      .catch((error) => console.log('error deleting', error));

    console.log('setting service properties...');
    await client
      .setServiceProperties()
      .then((res) => console.log(res))
      .catch((error) => console.log('error setting service properties', error));

    console.log('creating container...');
    await client
      .createContainer()
      .then((res) => console.log(res))
      .catch((error) => console.log('error creating', error));
  }

  console.log('testing storage connection...');
  await client
    .testStorageConnection()
    .then((res) => console.log(res))
    .catch((error) => console.log('error testing', error));

  const localFilePath = assetsDir + '/' + fileName;
  console.log(`uploading ${localFilePath}`);
  const readmeBlob = await client
    .uploadFile({ name: fileName, filePath: localFilePath })
    .catch((error) => {
      console.log('error final', error);
      throw error;
    });
  fs.unlinkSync(localFilePath);
  console.log(client.getBlobUrl(readmeBlob.name));
  const azureFilePath = client.getBlobUrl(readmeBlob.name);
  //const azureFilePath = fileName;
  return { azureFilePath };
};

export const appointmentsSummaryResolvers = {
  Query: {
    appointmentsSummary,
  },
};
