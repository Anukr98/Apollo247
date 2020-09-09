import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { Connection } from 'typeorm';
import { Doctor } from 'doctors-service/entities';
import path from 'path';
import { format } from 'date-fns';
import { Appointment } from 'consults-service/entities';
import { NotificationType } from 'notifications-service/constants';
import fs from 'fs';
import { Patient } from 'profiles-service/entities';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { PatientDeviceTokenRepository } from 'profiles-service/repositories/patientDeviceTokenRepository';
import { getCache } from 'notifications-service/database/connectRedis';
import { log } from 'customWinstonLogger';

const REDIS_PREFIX_WHITELISTED_KEY = 'whitelisted:mobilenumber:';
type validCheckInput = {
  consultsDb: Connection;
  patientsDb: Connection;
  appointmentId: string;
  doctorsDb: Connection;
};

type validCheckOutput = {
  appointment: Appointment;
  doctorDetails: Doctor;
  patientDetails: Patient;
};

export const checkForValidAppointmentDoctorAndPatient = async function(
  args: validCheckInput
): Promise<validCheckOutput> {
  const { consultsDb, doctorsDb, patientsDb, appointmentId } = args;
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointment = await appointmentRepo.findById(appointmentId);
  if (appointment == null) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  //get doctor details
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);

  const doctorDetails = await doctorRepo.getDoctorSecretary(appointment.doctorId);
  if (doctorDetails == null) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);
  //check patient existence and get his details
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patientRepo.getPatientDetails(appointment.patientId);
  if (patientDetails == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  return { appointment, doctorDetails, patientDetails };
};

//utility method to log the notification response
export function logNotificationResponse(type: NotificationType, logData: Object) {
  //get log file name
  const fileName = getNotificationLogFileName(type);

  let assetsDir = path.resolve('/apollo-hospitals/packages/api/src/assets');
  if (process.env.NODE_ENV != 'local') {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }

  let content = format(new Date(), 'yyyy-MM-dd hh:mm');
  Object.entries(logData).forEach(([key, value]) => {
    content += `\n ${key}: ${value.toString()}`;
  });
  content += '\n-----------------------------------------------------------------\n';

  console.log(type, fileName, content);

  fs.appendFile(`${assetsDir}/${fileName}`, content, (err) => {
    if (err) {
      console.log('notification file saving error', err);
    }
    console.log('notification results saved successfully');
  });
}

//common method to get all the patient device tokens
export async function getPatientDeviceTokens(mobileNumber: string, patientsDb: Connection) {
  const patientDeviceTokens: string[] = [];
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);

  //get all patients of a mobile number
  const allRelatedPatients = await patientRepo.getIdsByMobileNumber(mobileNumber);
  const patientIds = allRelatedPatients.map((patient) => patient.id);

  //get all device tokens data of related patients
  const deviceTokenRepo = patientsDb.getCustomRepository(PatientDeviceTokenRepository);
  const patientAllDeviceTokens = await deviceTokenRepo.deviceTokensOfAllIds(patientIds);

  //collect the deviceToken values
  if (patientAllDeviceTokens.length > 0) {
    patientAllDeviceTokens.forEach((values) => {
      patientDeviceTokens.push(values.deviceToken);
    });
  }

  return patientDeviceTokens;
}

//utility method to get the notification log file name based on notification type
export function getNotificationLogFileName(notificationType: NotificationType) {
  const currentDate = format(new Date(), 'yyyyMMdd');
  switch (notificationType) {
    case NotificationType.PATIENT_REGISTRATION:
      return `${process.env.NODE_ENV}_registration_notification_${currentDate}.txt`;
    case NotificationType.MEDICINE_ORDER_PLACED:
      return `${process.env.NODE_ENV}_order_placed_notification_${currentDate}.txt`;
    case NotificationType.MEDICINE_ORDER_CONFIRMED:
      return `${process.env.NODE_ENV}_order_cofirmed_notification_${currentDate}.txt`;
    case NotificationType.MEDICINE_ORDER_OUT_FOR_DELIVERY:
      return `${process.env.NODE_ENV}_order_out_for_delivery_notification_${currentDate}.txt`;
    default:
      return `${process.env.NODE_ENV}_registration_notification_${currentDate}.txt`;
  }
}

const isWhitelisted = async (mobileNumber: string) => {
  const whiteListedContacts = await getCache(`${REDIS_PREFIX_WHITELISTED_KEY}${mobileNumber}`);
  const isWhiteListedBool: boolean =
    whiteListedContacts && typeof whiteListedContacts == 'string' ? true : false;
  log(
    'notificationServiceLogger',
    `isWhitelisted tracker, isWhiteListed: ${isWhiteListedBool} for number ${mobileNumber}`,
    'common.ts/isWhitelisted',
    '',
    ''
  );
  console.log(
    `isWhitelisted tracker, isWhiteListed: ${isWhiteListedBool} for number ${mobileNumber}`
  );
  return isWhiteListedBool; //should always retrun boolean
};

export async function isNotificationAllowed(mobileNumber: string) {
  return process.env.NODE_ENV == 'production' || (await isWhitelisted(mobileNumber));
}
