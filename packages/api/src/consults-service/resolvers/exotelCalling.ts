import gql from 'graphql-tag';
import { log } from 'customWinstonLogger';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { ExotelDetailsRepository } from 'consults-service/repositories/exotelDetailsRepository';
import { uploadFileToBlobStorage } from 'helpers/uploadFileToBlob';
import { DEVICETYPE, Appointment } from 'consults-service/entities';
import { ApiConstants } from 'ApiConstants';

export const exotelTypeDefs = gql`
  input exotelInput {
    from: String
    to: String
    appointmentId: String!
    deviceType: DEVICETYPE
  }

  type exotelResult {
    isError: Boolean
    from: String
    to: String
    response: String
    errorMessage: String
  }

  input callStatusInput {
    status: String
  }

  type callStatusResult {
    updatedCallSidArray: [String]
    errorArray: String
  }

  input appointment {
    id: String
  }

  type callDetails {
    callSid: String
    callEndTime: String
    callStartTime: String
    patientPickedUp: String
    doctorPickedUp: String
    totalCallDuration: String
    deviceType: String
    recordingUrl: String
    appointment: Appointment
    status: String
  }

  type callDetailsResult {
    calls: [callDetails!]!
  }

  extend type Query {
    initateConferenceTelephoneCall(exotelInput: exotelInput): exotelResult!
    getCallDetailsByAppintment(appointment: appointment): callDetailsResult!
  }
  extend type Mutation {
    updateCallStatusBySid(callStatusInput: callStatusInput): callStatusResult
  }
`;

type exotelInput = {
  from?: string;
  to?: string;
  appointmentId: string;
  deviceType?: DEVICETYPE;
};

type exotelInputArgs = { exotelInput: exotelInput };

type ExotelRequest = {
  From: string;
  To: string;
  CallerId: string | undefined;
};

type callInputs = {
  exotelUrl: string | undefined;
  exotelRequest: ExotelRequest;
};

interface ExotelCalling {
  isError: boolean;
  from: string;
  to: string;
  response: string;
  errorMessage: string;
}

async function exotelCalling(callInputs: callInputs): Promise<ExotelCalling> {
  if (!callInputs.exotelUrl || !callInputs.exotelRequest.CallerId) {
    throw new AphError(AphErrorMessages.INVALID_EXOTEL_PARAMETERS, undefined, {});
  }

  const reqBody = callInputs.exotelRequest;

  callInputs.exotelUrl += '.json?';
  for (const [key, value] of Object.entries(reqBody)) {
    callInputs.exotelUrl += '&' + key + '=' + value;
  }

  return await fetch(callInputs.exotelUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((res) => {
      log(
        'consultServiceLogger',
        'API_CALL_RESPONSE',
        'initateConferenceTelephoneCall()->API_CALL_RESPONSE',
        JSON.stringify(res),
        ''
      );

      const exotelResult = {
        isError: false,
        from: callInputs.exotelRequest.From,
        to: callInputs.exotelRequest.To,
        response: JSON.stringify(res),
        errorMessage: '',
      };

      return exotelResult;
    })
    .catch((error) => {
      log(
        'consultServiceLogger',
        'API_CALL_ERROR',
        'initateConferenceTelephoneCall()->CATCH_BLOCK',
        '',
        JSON.stringify(error)
      );

      throw new AphError(AphErrorMessages.EXOTEL_REQUEST_ERROR);

      const exotelResult = {
        isError: true,
        from: callInputs.exotelRequest.From,
        to: callInputs.exotelRequest.To,
        response: '',
        errorMessage: JSON.stringify(error),
      };

      return exotelResult;
    });
}

const initateConferenceTelephoneCall: Resolver<
  null,
  exotelInputArgs,
  ConsultServiceContext,
  ExotelCalling
> = async (parent, { exotelInput }, { mobileNumber, consultsDb, doctorsDb, patientsDb }) => {
  const exotelCallerId: string | undefined = process.env.EXOTEL_CALLER_ID;
  const exotelUrl: string | undefined = process.env.EXOTEL_API_URL;

  let fromMobileNumber = undefined;
  let toMobileNumber = undefined;
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);

  if (!exotelInput.appointmentId) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  const appt = await apptsRepo.findById(exotelInput.appointmentId);

  if (!appt) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  const patient = await patientRepo.getPatientDetails(appt.patientId);
  if (!patient) {
    throw new AphError(AphErrorMessages.GET_PATIENTS_ERROR, undefined, {});
  }

  const doctor = await doctorRepo.findByMobileNumber(mobileNumber, true);

  if (!doctor) {
    throw new AphError(AphErrorMessages.GET_DOCTORS_ERROR, undefined, {});
  }

  fromMobileNumber = doctor.mobileNumber;
  toMobileNumber = patient.mobileNumber;

  const apiBaseUrl = process.env.KALEYRA_OTP_API_BASE_URL;
  const apiUrlWithKey = `${apiBaseUrl}?api_key=${process.env.KALEYRA_NOTIFICATION_API_KEY}`;
  let message = ApiConstants.NOTIFICATION_MSG_FOR_DR_CALL.replace('{0}', patient.firstName);
  message = message.replace('{1}', doctor.fullName);
  if (exotelCallerId) {
    message = message.replace('{2}', exotelCallerId);
  }
  const queryParams = `&method=${ApiConstants.KALEYRA_OTP_SMS_METHOD}&message=${message}&to=${toMobileNumber}&sender=${ApiConstants.KALEYRA_OTP_SENDER}`;
  const apiUrl = `${apiUrlWithKey}${queryParams}`;
  await fetch(apiUrl)
    .then((res) => res.json())
    .catch((error) => {
      log(
        'initateConferenceTelephoneCallAPILogger',
        `SEND_SMS_ERROR`,
        'smsResponse()->CATCH_BLOCK',
        '',
        JSON.stringify(error)
      );
      throw new AphError(AphErrorMessages.MESSAGE_SEND_ERROR);
    });

  const exotelRequest = {
    From: fromMobileNumber,
    To: toMobileNumber,
    CallerId: exotelCallerId,
  };
  const exotelResult = await exotelCalling({ exotelUrl, exotelRequest });

  const exotelRepo = consultsDb.getCustomRepository(ExotelDetailsRepository);
  const exotelResponse = JSON.parse(exotelResult.response);
  let createObj = {
    callSid: exotelResponse['Call']['Sid'],
    accountSid: exotelResponse['Call']['AccountSid'],
    doctorMobileNumber: exotelResponse['Call']['From'],
    patientMobileNumber: exotelResponse['Call']['To'],
    callerId: exotelResponse['Call']['PhoneNumberSid'],
    status: exotelResponse['Call']['Status'],
    callStartTime: exotelResponse['Call']['StartTime'],
    direction: exotelResponse['Call']['Direction'],
    appointmentId: appt.id,
    doctorType: doctor.doctorType,
    doctorId: doctor.id,
  };

  if (exotelInput.deviceType) {
    createObj = Object.assign(createObj, { deviceType: exotelInput.deviceType });
  }

  try {
    await exotelRepo.saveExotelCallDetails(createObj);
  } catch (err) {
    console.error('error in saving exotel details > ', err);
  }

  return exotelResult;
};

type callStatusInput = {
  status: string;
};

type callStatusResult = {
  updatedCallSidArray: string[];
  errorArray: string;
};

type callStatusInputArgs = { callStatusInput: callStatusInput };

const updateCallStatusBySid: Resolver<
  null,
  callStatusInputArgs,
  ConsultServiceContext,
  callStatusResult
> = async (parent, { callStatusInput }, { consultsDb }) => {
  const exotelRepo = consultsDb.getCustomRepository(ExotelDetailsRepository);

  const inProgressCalls = await exotelRepo.getAllCallDetailsByStatus(callStatusInput.status);

  const exotel_url = `https://${process.env.EXOTEL_API_KEY}:${process.env.EXOTEL_API_TOKEN}@${process.env.EXOTEL_SUB_DOMAIN}${process.env.EXOTEL_URI}`;

  const updatedCallSidArray: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorArray: any[] = [];

  for (const each of inProgressCalls) {
    await fetch(exotel_url + '/' + each.callSid + '.json', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then(async (res) => {
        let updateObj = {
          status: res['Call']['Status'],
          callEndTime: res['Call']['EndTime'],
          totalCallDuration: res['Call']['Duration'],
          price: res['Call']['Price'],
          patientPickedUp: res['Call']['Status'] === 'completed' ? true : false,
          doctorPickedUp: res['Call']['Status'] === 'completed' ? true : false,
        };

        if (res['Call']['RecordingUrl']) {
          await fetch(res['Call']['RecordingUrl'], {
            method: 'GET',
          })
            .then((response) => response.arrayBuffer())
            .then(async (resp) => {
              const uploadDocumentInput = {
                fileType: 'MPEG',
                base64FileInput: Buffer.from(resp).toString('base64'),
              };

              //upload file to blob storage
              const blobUrl = await uploadFileToBlobStorage(
                uploadDocumentInput.fileType,
                uploadDocumentInput.base64FileInput
              );

              updateObj = Object.assign(updateObj, { recordingUrl: blobUrl });

              await exotelRepo.updateCallDetails(each.id, updateObj);
            });
        } else {
          await exotelRepo.updateCallDetails(each.id, updateObj);
        }

        updatedCallSidArray.push(each.callSid);
      })
      .catch((error) => {
        console.error('exotelError in update: ', error);
        errorArray.push(error);
      });
  }

  return { updatedCallSidArray, errorArray: JSON.stringify(errorArray) };
};

type appointment = {
  id: string;
};

type callDetails = {
  callSid: string;
  callEndTime: string;
  callStartTime: string;
  patientPickedUp: string;
  doctorPickedUp: string;
  totalCallDuration: string;
  deviceType: string;
  recordingUrl: string;
  appointment: Appointment;
  status: string;
};

type callDetailsResult = {
  calls: callDetails[];
};

type appointmentInputArgs = { appointment: appointment };

const getCallDetailsByAppintment: Resolver<
  null,
  appointmentInputArgs,
  ConsultServiceContext,
  callDetailsResult
> = async (parent, { appointment }, { consultsDb }) => {
  const exotelRepo = consultsDb.getCustomRepository(ExotelDetailsRepository);

  const calls = await exotelRepo.findAllByAppointmentId(appointment.id);

  if (!calls.length) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callsArray: any[] = [];
  for (const call of calls) {
    const newCallObj = {
      callSid: call.callSid,
      callStartTime: call.callStartTime && call.callStartTime.toUTCString(),
      callEndTime: call.callEndTime ? call.callEndTime.toUTCString() : '',
      patientPickedUp: call.patientPickedUp ? 'Yes' : 'No',
      doctorPickedUp: call.doctorPickedUp ? 'Yes' : 'No',
      totalCallDuration: call.totalCallDuration ? call.totalCallDuration.toString() : '',
      deviceType: call.deviceType,
      recordingUrl: call.recordingUrl,
      appointment: call.appointment,
      status: call.status,
    };

    callsArray.push(newCallObj);
  }

  return { calls: callsArray };
};

export const exotelCallingResolvers = {
  Query: {
    initateConferenceTelephoneCall,
    getCallDetailsByAppintment,
  },
  Mutation: {
    updateCallStatusBySid,
  },
};
