import gql from 'graphql-tag';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { Resolver } from 'api-gateway';
import fs from 'fs';
import { AphStorageClient } from '@aph/universal/dist/AphStorageClient';
import { format, addMilliseconds } from 'date-fns';
import path from 'path';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { ConsultQueueRepository } from 'consults-service/repositories/consultQueueRepository';
import { RescheduleAppointmentRepository } from 'consults-service/repositories/rescheduleAppointmentRepository';
import { AppointmentCallDetailsRepository } from 'consults-service/repositories/appointmentCallDetailsRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { STATUS } from 'consults-service/entities';
import { DOCTOR_CALL_TYPE, APPT_CALL_TYPE } from 'notifications-service/constants';
import _isEmpty from 'lodash/isEmpty';

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
  const rescheduleDetailsRepo = consultsDb.getCustomRepository(RescheduleAppointmentRepository);
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
        // console.log('appt=', appt);
        const patientDetails = await patientRepo.getPatientDetails(appt.patientId);
        if (!patientDetails) {
          throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
        }

        const doctorDetails = await doctorRepo.findById(appt.doctorId);
        if (!doctorDetails) {
          throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
        }
        //new fields
        const JDDetails = await consultQueueRepo.findByAppointmentId(appt.id);
        // if (!JDDetails) {
        //   console.log(2222);
        //   throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
        // }
        let JDPhone;
        if (JDDetails) {
          JDPhone = await doctorRepo.getDoctorProfileData(JDDetails.doctorId);
          // if (!JDPhone) {
          //   console.log(333333);
          //   throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
          // }
          // console.log('JDPhone==', JDPhone.mobileNumber);
        }
        const callDetails = await appointmentCallDetailsRepo.findAllByAppointmentId(appt.id);
        // if (!callDetails) {
        //   console.log(444444);
        //   throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
        // }
        const rescheduleDetails = await rescheduleDetailsRepo.findByAppointmentId(appt.id);
        //end
        const istDateTime = format(
          addMilliseconds(appt.appointmentDateTime, 19800000),
          'yyyy-MM-dd HH:mm'
        );
        // const bookingDateTime = format(
        //   addMilliseconds(appt.bookingDate, 19800000),
        //   'yyyy-MM-dd HH:mm'
        // );
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
        // console.log('appointment details==', appt);
        // console.log('appointment id==', appt.id);
        const callDetailsStartTime =
          !_isEmpty(callDetails) && callDetails[0].startTime
            ? format(addMilliseconds(callDetails[0].startTime, 19800000), 'yyyy-MM-dd HH:mm')
            : '';
        const callDetailsEndTime =
          !_isEmpty(callDetails) && callDetails[callDetails.length - 1].endTime
            ? format(
                addMilliseconds(callDetails[callDetails.length - 1].endTime, 19800000),
                'yyyy-MM-dd HH:mm'
              )
            : '';
        const numberOfCallsBySD = await appointmentCallDetailsRepo.findSeniorAppointments(appt.id);
        const numberOfCallsByJD = await appointmentCallDetailsRepo.findJuniorAppointments(appt.id);
        const numberOfAudioCallsBySD = [];
        const numberOfVideoCallsBySD = [];
        const numberOfAudioCallsByJD = [];
        const numberOfVideoCallsByJD = [];
        if (numberOfCallsBySD) {
          numberOfCallsBySD.forEach((callDetails) => {
            if (callDetails.callType === APPT_CALL_TYPE.AUDIO) {
              numberOfAudioCallsBySD.push(callDetails);
            }
            if (callDetails.callType === APPT_CALL_TYPE.VIDEO) {
              numberOfVideoCallsBySD.push(callDetails);
            }
          });
        }
        if (numberOfCallsByJD) {
          numberOfCallsByJD.forEach((callDetails) => {
            if (callDetails.callType === APPT_CALL_TYPE.AUDIO) {
              numberOfAudioCallsByJD.push(callDetails);
            }
            if (callDetails.callType === APPT_CALL_TYPE.VIDEO) {
              numberOfVideoCallsByJD.push(callDetails);
            }
          });
        }
        row1 +=
          serialNo +
          '\t' +
          appt.id +
          '\t' +
          patientDetails.mobileNumber +
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
          (JDPhone ? (JDPhone.mobileNumber ? JDPhone.mobileNumber : '') : '') +
          '\t' +
          doctorDetails.mobileNumber +
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
          (!_isEmpty(callDetails) && callDetails[0].doctorType == DOCTOR_CALL_TYPE.SENIOR
            ? callDetailsStartTime
            : '') +
          '\t' +
          (!_isEmpty(callDetails) && callDetails[0].doctorType == DOCTOR_CALL_TYPE.SENIOR
            ? callDetailsEndTime
            : '') +
          '\t' +
          (!_isEmpty(callDetails) &&
          callDetails[0].doctorType == DOCTOR_CALL_TYPE.SENIOR &&
          callDetails[0].callType == APPT_CALL_TYPE.AUDIO
            ? callDetailsStartTime
            : '') +
          '\t' +
          (!_isEmpty(callDetails) &&
          callDetails[0].doctorType == DOCTOR_CALL_TYPE.SENIOR &&
          callDetails[0].callType == APPT_CALL_TYPE.AUDIO
            ? callDetailsEndTime
            : '') +
          '\t' +
          numberOfAudioCallsBySD.length +
          '\t' +
          (!_isEmpty(callDetails) &&
          callDetails[0].doctorType == DOCTOR_CALL_TYPE.SENIOR &&
          callDetails[0].callType == APPT_CALL_TYPE.VIDEO
            ? callDetailsStartTime
            : '') +
          '\t' +
          (!_isEmpty(callDetails) &&
          callDetails[0].doctorType == DOCTOR_CALL_TYPE.SENIOR &&
          callDetails[0].callType == APPT_CALL_TYPE.VIDEO
            ? callDetailsEndTime
            : '') +
          '\t' +
          numberOfVideoCallsBySD.length +
          '\t' +
          (!_isEmpty(callDetails) && callDetails[0].doctorType == DOCTOR_CALL_TYPE.JUNIOR
            ? callDetailsStartTime
            : '') +
          '\t' +
          (!_isEmpty(callDetails) && callDetails[0].doctorType == DOCTOR_CALL_TYPE.JUNIOR
            ? callDetailsEndTime
            : '') +
          '\t' +
          (!_isEmpty(callDetails) &&
          callDetails[0].doctorType == DOCTOR_CALL_TYPE.JUNIOR &&
          callDetails[0].callType == APPT_CALL_TYPE.AUDIO
            ? callDetailsStartTime
            : '') +
          '\t' +
          (!_isEmpty(callDetails) &&
          callDetails[0].doctorType == DOCTOR_CALL_TYPE.JUNIOR &&
          callDetails[0].callType == APPT_CALL_TYPE.AUDIO
            ? callDetailsEndTime
            : '') +
          '\t' +
          numberOfAudioCallsByJD.length +
          '\t' +
          (!_isEmpty(callDetails) &&
          callDetails[0].doctorType == DOCTOR_CALL_TYPE.JUNIOR &&
          callDetails[0].callType == APPT_CALL_TYPE.VIDEO
            ? callDetailsStartTime
            : '') +
          '\t' +
          (!_isEmpty(callDetails) &&
          callDetails[0].doctorType == DOCTOR_CALL_TYPE.JUNIOR &&
          callDetails[0].callType == APPT_CALL_TYPE.VIDEO
            ? callDetailsEndTime
            : '') +
          '\t' +
          numberOfVideoCallsByJD.length +
          '\t' +
          appt.isFollowUp +
          '\t' +
          followUpBooked +
          '\t' +
          'NA' +
          '\t' +
          (!_isEmpty(callDetails) && callDetails[0].callType == APPT_CALL_TYPE.AUDIO
            ? callDetails[0].id
            : '') +
          '\t' +
          (!_isEmpty(callDetails) && callDetails[0].callType == APPT_CALL_TYPE.VIDEO
            ? callDetails[0].id
            : '') +
          '\t' +
          caseSheetId +
          '\t' +
          caseSheetId +
          '\t' +
          prescriptionIssued +
          '\t' +
          (rescheduleDetails !== undefined ? 'TRUE' : 'FALSE') +
          '\t' +
          (rescheduleDetails !== undefined ? rescheduleDetails.rescheduleReason : '') +
          '\t' +
          isCancelled +
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
    // console.log('file error', err);
  }
  return { azureFilePath: 'test' };

  const client = new AphStorageClient(
    process.env.AZURE_STORAGE_CONNECTION_STRING_API,
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );

  if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'dev') {
    await client
      .deleteContainer()
      .then((res) => null)
      .catch((error) => null);

    await client
      .setServiceProperties()
      .then((res) => null)
      .catch((error) => null);

    await client
      .createContainer()
      .then((res) => null)
      .catch((error) => null);
  }

  await client
    .testStorageConnection()
    .then((res) => null)
    .catch((error) => null);

  const localFilePath = assetsDir + '/' + fileName;

  const readmeBlob = await client
    .uploadFile({ name: fileName, filePath: localFilePath })
    .catch((error) => {
      throw error;
    });
  fs.unlinkSync(localFilePath);
  const azureFilePath = client.getBlobUrl(readmeBlob.name);
  //const azureFilePath = fileName;
  return { azureFilePath };
};

export const appointmentsSummaryResolvers = {
  Query: {
    appointmentsSummary,
  },
};
