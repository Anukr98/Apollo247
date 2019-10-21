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

export const appointmentsSummaryTypeDefs = gql`
  extend type Query {
    appointmentsSummary: String!
  }
`;

const appointmentsSummary: Resolver<
  null,
  { appointmentId: string; fileType: string; base64FileInput: string },
  ConsultServiceContext,
  string
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const fileName =
    process.env.NODE_ENV + '_appointments_' + format(new Date(), 'yyyyMMddhhmmss') + '.xls';
  const assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const apptsList = await apptRepo.getAllAppointments();
  let serialNo = 1;
  let row1 = '';
  function getAppointments() {
    return new Promise(async (resolve, reject) => {
      await apptsList.map(async (appt) => {
        const patientDetails = await patientRepo.findById(appt.patientId);
        if (!patientDetails) {
          throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
        }
        const doctorDetails = await doctorRepo.findById(appt.doctorId);
        if (!doctorDetails) {
          throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
        }
        const istDateTime = addMilliseconds(appt.appointmentDateTime, 19800000);
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
          '\n';
        if (serialNo == apptsList.length) {
          resolve(row1);
        }
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
      'Patient MobilePrescription Issued Y/N' +
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

  return client.getBlobUrl(readmeBlob.name);
};

export const appointmentsSummaryResolvers = {
  Query: {
    appointmentsSummary,
  },
};
