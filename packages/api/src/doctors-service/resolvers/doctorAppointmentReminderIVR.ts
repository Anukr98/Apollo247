import gql from 'graphql-tag';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Resolver } from 'api-gateway';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { ConsultMode, Doctor } from 'doctors-service/entities/index';
import { omit } from "lodash";
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { ApiConstants } from 'ApiConstants';
import { log } from 'customWinstonLogger';
import {
  format,
  subMinutes,
  addHours,
} from 'date-fns';
import { Appointment, ExotelDetails } from 'consults-service/entities';

export const setAppointmentReminderIvrTypeDefs = gql`
  type ivrResult {
    isError: Boolean
    response: String
  }

  type RemindDoctorForAppointmentResult {
    isError: Boolean
    From: String
    Url: String
    response: String
    errorMessage: String
  }

  extend type Mutation {
    setAppointmentReminderIvr(
      doctorId: String!
      isIvrSet: Boolean
      ivrConsultType: ConsultMode
      ivrCallTimeOnline: Int
      ivrCallTimePhysical: Int
    ): ivrResult!
  }

  extend type Query {
    RemindDoctorForAppointment: [RemindDoctorForAppointmentResult]!
  }
`;

type ivrResult = {
  isError: boolean;
  response: string;
};

const setAppointmentReminderIvr: Resolver<
  null,
  { doctorId: string; isIvrSet: boolean; ivrConsultType: ConsultMode; ivrCallTimeOnline: number; ivrCallTimePhysical: number },
  DoctorsServiceContext,
  ivrResult
> = async (parent, args, { doctorsDb }) => {
  try {

    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    const doctordata = await doctorRepository.findDoctorByIdWithoutRelations(args.doctorId);
    if (!doctordata) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);

    const doctorId = args.doctorId;
    let appointmentReminderIvrAttrs: Omit<typeof args, 'doctorId'> = Object.assign({}, omit(args, 'doctorId'));

    await doctorRepository.updateAppointmentReminderIVR(doctorId, appointmentReminderIvrAttrs);
    return { isError: false, response: "Updated Successfully" };

  } catch (err) {
    console.error("error in updating appointment reminder IVR > ", err);
    return { isError: true, response: "Not Updated" };
  }
};

type RemindDoctorForAppointmentResult = {
  isError: boolean;
  From: string;
  Url: string;
  response: string;
  errorMessage: string;
}


async function exotelCalling(doctor: Doctor, appointment: Appointment): Promise<RemindDoctorForAppointmentResult> {

  let exotel_url = `https://${process.env.EXOTEL_API_KEY}:${process.env.EXOTEL_API_TOKEN}@${process.env.EXOTEL_SUB_DOMAIN}${process.env.EXOTEL_URI}/connect`;
  const IVR_url = `http://my.exotel.com/${process.env.EXOTEL_ACCOUNT_SID}/exoml/start_voice/${process.env.EXOTEL_APPOINTMENT_REMINDER_IVR_APP_ID || 311473 || 320240}`;

  const reqBody = {
    From: parseInt(doctor.mobileNumber, 10),
    CallerId: process.env.EXOTEL_CALLER_ID,
    Url: IVR_url,
    CustomField: format(appointment.appointmentDateTime, "yyyy-MM-dd'T'HH:mm:00.000X") + '_' + appointment.appointmentType
  }

  exotel_url += '.json?';
  for (const [key, value] of Object.entries(reqBody)) {
    exotel_url += key + '=' + value + '&';
  }

  return await fetch(exotel_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((res) => {
      log(
        'doctorServiceLogger',
        'API_CALL_RESPONSE',
        'RemindDoctorForAppointment()->API_CALL_RESPONSE',
        JSON.stringify(res),
        ''
      );

      const exotelResult = {
        isError: false,
        From: reqBody.From.toString(),
        Url: IVR_url,
        response: JSON.stringify(res),
        errorMessage: '',
      };

      return exotelResult;
    })
    .catch((error) => {
      log(
        'doctorServiceLogger',
        'API_CALL_ERROR',
        'RemindDoctorForAppointment()->CATCH_BLOCK',
        '',
        JSON.stringify(error)
      );

      const exotelResult = {
        isError: true,
        From: reqBody.From.toString(),
        Url: IVR_url,
        response: '',
        errorMessage: JSON.stringify(error),
      };

      return exotelResult;
    });
}


const RemindDoctorForAppointment: Resolver<
  null,
  {},
  DoctorsServiceContext,
  RemindDoctorForAppointmentResult[]
> = async (parent, args, { doctorsDb, consultsDb }) => {

  const currentDate = format(new Date(), "yyyy-MM-dd'T'HH:mm:00.000X");

  const limitedHoursFutureDate = addHours(
    new Date(currentDate),
    parseInt(ApiConstants.APPOINTMENTS_HOUR_LIMIT.toString(), 10)
  );

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentData = await appointmentRepo.getlimitedHoursFutureAppointments(new Date(currentDate), limitedHoursFutureDate);
  if (!appointmentData) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);

  let doctorIds: string[] = [];
  appointmentData.forEach((appointment) => {
    doctorIds.push(appointment.doctorId);
  });

  if (!doctorIds.length) {
    throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID);
  }

  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctorData = await doctorRepository.getAllDocsById(doctorIds);

  let responseArray: RemindDoctorForAppointmentResult[] = [];

  for (let index = 0; index < doctorData.length; index++) {
    if (doctorData[index].isIvrSet) {
      for (let appIndex = 0; appIndex < appointmentData.length; appIndex++) {
        if (appointmentData[appIndex].appointmentType === 'ONLINE' && appointmentData[appIndex].doctorId == doctorData[index].id &&
          currentDate === format(subMinutes(appointmentData[appIndex].appointmentDateTime, doctorData[index].ivrCallTimeOnline), "yyyy-MM-dd'T'HH:mm:00.000X")) {
          const response = await exotelCalling(doctorData[index], appointmentData[appIndex]);
          responseArray.push(response);
          break;
        } else if (appointmentData[appIndex].appointmentType === 'PHYSICAL' && appointmentData[appIndex].doctorId == doctorData[index].id &&
          currentDate === format(subMinutes(appointmentData[appIndex].appointmentDateTime, doctorData[index].ivrCallTimePhysical), "yyyy-MM-dd'T'HH:mm:00.000X")) {
          const response = await exotelCalling(doctorData[index], appointmentData[appIndex]);
          responseArray.push(response);
          break;
        }
      }
    }
  }

  return responseArray;
};

export const setAppointmentReminderIvrResolvers = {
  Mutation: {
    setAppointmentReminderIvr,
  },
  Query: {
    RemindDoctorForAppointment,
  },
};
