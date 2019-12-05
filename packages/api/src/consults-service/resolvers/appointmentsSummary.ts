import gql from 'graphql-tag';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { Resolver } from 'api-gateway';
import fs from 'fs';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { format, addMilliseconds } from 'date-fns';
import path from 'path';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';
import { AppointmentCallDetailsRepository } from 'consults-service/repositories/appointmentCallDetailsRepository';
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
  const consultQueueRepo = consultsDb.getCustomRepository(ConsultQueueRepository);
  const appointmentCallDetailsRepo = consultsDb.getCustomRepository(
    AppointmentCallDetailsRepository
  );
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
        //new fields
        const JDDetails = await consultQueueRepo.findByAppointmentId(
          'ab37ca8f-7fbe-4a3a-a4b2-785405a62044'
        );
        if (!JDDetails) {
          throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
        }
        console.log('JDDetails==', JDDetails);
        const JDPhone = await doctorRepo.getDoctorProfileData(JDDetails.doctorId);
        if (!JDPhone) {
          throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
        }
        console.log('JDPhone==', JDPhone.mobileNumber);
        const callDetails = await appointmentCallDetailsRepo.findByAppointmentId(
          'ab37ca8f-7fbe-4a3a-a4b2-785405a62044'
        );
        if (!callDetails) {
          throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
        }
        console.log('callDetails==', callDetails);
        //end
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
            'NA' +
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
            'NA' +
            '\t' +
            'NA' +
            '\t' +
            JDPhone.mobileNumber.toString() +
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
            'NA' +
            '\t' +
            'NA' +
            '\t' +
            'NA' +
            '\t' +
            'NA' +
            '\t' +
            callDetails.doctorType ==
            'SENIOR' && callDetails.callType == 'AUDIO'
            ? callDetails.startTime
            : '' + '\t' + callDetails.doctorType == 'SENIOR' && callDetails.callType == 'AUDIO'
            ? callDetails.endTime
            : '' + '\t' + 'NA' + '\t' + callDetails.doctorType == 'SENIOR' &&
              callDetails.callType == 'VIDEO'
            ? callDetails.startTime
            : '' + '\t' + callDetails.doctorType == 'SENIOR' && callDetails.callType == 'VIDEO'
            ? callDetails.endTime
            : '' + '\t' + 'NA' + '\t' + 'NA' + '\t' + 'NA' + '\t' + callDetails.doctorType ==
                'JUNIOR' && callDetails.callType == 'AUDIO'
            ? callDetails.startTime
            : '' + '\t' + callDetails.doctorType == 'JUNIOR' && callDetails.callType == 'AUDIO'
            ? callDetails.endTime
            : '' + '\t' + 'NA' + '\t' + callDetails.doctorType == 'JUNIOR' &&
              callDetails.callType == 'VIDEO'
            ? callDetails.startTime
            : '' + '\t' + callDetails.doctorType == 'JUNIOR' && callDetails.callType == 'AUDIO'
            ? callDetails.endTime
            : '' +
                '\t' +
                'NA' +
                '\t' +
                appt.isFollowUp +
                '\t' +
                followUpBooked +
                '\t' +
                'NA' +
                '\t' +
                callDetails.callType ==
              'AUDIO'
            ? callDetails.id
            : '' + '\t' + callDetails.callType == 'VIDEO'
            ? callDetails.id
            : '' +
              '\t' +
              'NA' +
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
      'Date' +
      '\t' +
      'Consult id' +
      '\t' +
      'Patient Mobile' +
      '\t' +
      'Patient UHID' +
      '\t' +
      'Patient Full Name' +
      '\t' +
      'Appointment Date Time' +
      '\t' +
      'Appointment Type' +
      '\t' +
      'Start time of chat' +
      '\t' +
      'End time of chat' +
      '\t' +
      'JD Mobile' +
      '\t' +
      'SD Mobile' +
      '\t' +
      'SD Full Name' +
      '\t' +
      'Entity of Doctor' +
      '\t' +
      'Speciality of SD' +
      '\t' +
      'Patient Start Time' +
      '\t' +
      'Patient End Time' +
      '\t' +
      'SD start Time' +
      '\t' +
      'SD End Time' +
      '\t' +
      'Start time of Audio call done by SD' +
      '\t' +
      'End time of Audio call done by SD' +
      '\t' +
      'No. of Audio calls in this consult by SD' +
      '\t' +
      'Start time of Video call done by SD' +
      '\t' +
      'End time of Video call done by SD' +
      '\t' +
      'No. of video calls by SD in this consult by SD' +
      '\t' +
      'JD Start Time' +
      '\t' +
      'JD End Time' +
      '\t' +
      'Start time of Audio call done by JD' +
      '\t' +
      'End time of Audio call done by JD' +
      '\t' +
      'No. of Audio calls in this consult by JD' +
      '\t' +
      'Start time of Video call done by JD' +
      '\t' +
      'End time of Video call done by JD' +
      '\t' +
      'No. of video calls by SD in this consult by JD' +
      '\t' +
      'Fresh Consult or Follow Up?' +
      '\t' +
      'Followup booked Y/N' +
      '\t' +
      'Chat Transcript ID' +
      '\t' +
      'Audio Call ID' +
      '\t' +
      'Video Call ID' +
      '\t' +
      'Prescription ID' +
      '\t' +
      'Case Sheet ID' +
      '\t' +
      'Prescription issued by SD Y/N' +
      '\t' +
      'Consult Rescheduled?' +
      '\t' +
      'Reschedule Reason' +
      '\t' +
      'Consult cancelled Y/N' +
      '\n';

    //const row1 = '0' + '\t' + ' 21' + '\t' + 'Rob' + '\n';
    writeStream.write(header);
    await getAppointments();
    writeStream.write(row1);
    writeStream.close();
  } catch (err) {
    console.log('file error', err);
  }
  return { azureFilePath: 'test' };

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
