import gql from 'graphql-tag';
import { log } from 'customWinstonLogger';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { ExotelDetailsRepository } from 'consults-service/repositories/exotelDetailsRepository'

export const exotelTypeDefs = gql`
  input exotelInput {
    from: String
    to: String
    appointmentId: String
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
    errorArray: String
  }

  input appointment {
    id: String
  }

  type callDetailsResult {
    callEndTime: String
    callStartTime: String
    patientPickedUp: String
    doctorPickedUp: String
    totalCallDuration: String
    deviceType: String
  }

  extend type Query {
    initateConferenceTelephoneCall(exotelInput: exotelInput): exotelResult!
    updateCallStatusBySid(callStatusInput: callStatusInput): callStatusResult!
    getCallDetailsByAppintment(appointment: appointment): callDetailsResult!
  }
`;

type exotelInput = {
  from: string;
  to: string;
  appointmentId: string;
};

type exotelResult = {
  isError: boolean;
  from: string;
  to: string;
  response: string;
  errorMessage: string;
};

type exotelInputArgs = { exotelInput: exotelInput };

type exotelOutputResult = {
  exotel: exotelResult;
};

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
  .then(res => res.json())
  .then((res) => {

      console.log('API_response==>', res);

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
      console.error('exotelError:', error);

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
> = async (parent, { exotelInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const exotelCallerId: string | undefined = process.env.EXOTEL_CALLER_ID;
  const exotelUrl: string | undefined = process.env.EXOTEL_API_URL;

  let fromMobileNumber = undefined;
  let toMobileNumber = undefined;
  let doctor;
  let patient;
  let appt;
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);

  if (!exotelInput.from && !exotelInput.to) {
    if (!exotelInput.appointmentId) {
      throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
    }

    appt = await apptsRepo.findById(exotelInput.appointmentId);

    if (!appt) {
      throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
    }

    patient = await patientRepo.findById(appt.patientId);

    if (!patient) {
      throw new AphError(AphErrorMessages.GET_PATIENTS_ERROR, undefined, {});
    }

    doctor = await doctorRepo.findById(appt.doctorId);

    if (!doctor) {
      throw new AphError(AphErrorMessages.GET_DOCTORS_ERROR, undefined, {});
    }

    fromMobileNumber = doctor.mobileNumber;
    toMobileNumber = patient.mobileNumber;
  }

  if (exotelInput.from && !exotelInput.to) {
    throw new AphError(AphErrorMessages.INVALID_PARAMETERS, undefined, {});
  }

  if (!exotelInput.from && exotelInput.to) {
    throw new AphError(AphErrorMessages.INVALID_PARAMETERS, undefined, {});
  }

  fromMobileNumber = exotelInput.from;
  toMobileNumber = exotelInput.to;

  if(!fromMobileNumber.includes('+91')){
    fromMobileNumber = '+91' + fromMobileNumber
  }
  if(!toMobileNumber.includes('+91')){
    toMobileNumber = '+91' + toMobileNumber
  }

  doctor = await doctorRepo.searchDoctorByMobileNumber(fromMobileNumber, true);
  if (!doctor) {
    throw new AphError(AphErrorMessages.GET_DOCTORS_ERROR, undefined, {});
  }

  patient = await patientRepo.findByMobileNumber(toMobileNumber);
  if (!patient.length) {
    throw new AphError(AphErrorMessages.GET_PATIENTS_ERROR, undefined, {});
  }

  appt = await apptsRepo.getPatientAndDoctorsAppointments(patient[0].id, [doctor.id])
  if (!appt.length) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }


  const exotelRequest = {
    From: fromMobileNumber,
    To: toMobileNumber,
    CallerId: exotelCallerId,
  };
  const exotelResult = await exotelCalling({ exotelUrl, exotelRequest });

  const exotelRepo = consultsDb.getCustomRepository(ExotelDetailsRepository);
  const exotelResponse = JSON.parse(exotelResult.response)
  const createObj = {
    callSid: exotelResponse['Call']['Sid'],
    accountSid: exotelResponse['Call']['AccountSid'],
    doctorMobileNumber: exotelResponse['Call']['From'],
    patientMobileNumber: exotelResponse['Call']['To'],
    callerId: exotelResponse['Call']['PhoneNumberSid'],
    status: exotelResponse['Call']['Status'],
    callStartTime: exotelResponse['Call']['StartTime'],
    direction: exotelResponse['Call']['Direction'],
    appointmentId: appt[0].id,
    doctorType: doctor.doctorType,
    doctorId: doctor.id,
    device: "",
  }

  try {
    await exotelRepo.saveExotelCallDetails(createObj);
  } catch(err){
    console.error("error in saving exotel details > ", err);
  }

  return exotelResult;

};


type callStatusInput = {
  status: string
};

type callStatusResult = {
  errorArray: string
};

type callStatusInputArgs = { callStatusInput: callStatusInput };


// bulkUpdateInProgressCalls by a cron-job (after half an hour)
const updateCallStatusBySid: Resolver<null, callStatusInputArgs, ConsultServiceContext, callStatusResult>
= async (parent, { callStatusInput }, { consultsDb }) => {

  const exotelRepo = consultsDb.getCustomRepository(ExotelDetailsRepository);

  const inProgressCalls = await exotelRepo.getAllCallDetailsByStatus(callStatusInput.status);

  let exotel_url = `https://${process.env.EXOTEL_API_KEY}:${process.env.EXOTEL_API_TOKEN}@${process.env.EXOTEL_SUB_DOMAIN}${process.env.EXOTEL_URI}`;


  let errorArray: any[] = [];
  for(let each of inProgressCalls){

    await fetch(exotel_url + '/'  + each.callSid + '.json', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    .then(res => res.json())
    .then(async (res) => {

      await exotelRepo.updateCallDetails(each.id, {
        status: res['Call']['Status'],
        callEndTime: res['Call']['EndTime'],
        totalCallDuration: res['Call']['Duration'],
        price: res['Call']['Price'],
        recordingUrl: res['Call']['RecordingUrl']
      });
    })
    .catch((error) => {
      console.error('exotelError in update: ', error);
      errorArray.push(error);
    })

  }

  return { errorArray: JSON.stringify(errorArray) };

}


type appointment = {
  id: string
};

type callDetailsResult = {
  callEndTime: string
  callStartTime: string
  patientPickedUp: string
  doctorPickedUp: string
  totalCallDuration: string
  deviceType: string
};

type appointmentInputArgs = { appointment: appointment };


const getCallDetailsByAppintment: Resolver<
  null,
  appointmentInputArgs,
  ConsultServiceContext,
  callDetailsResult
> = async (parent, { appointment }, { consultsDb }) => {

  const exotelRepo = consultsDb.getCustomRepository(ExotelDetailsRepository);

  const calls = await exotelRepo.findByAppointmentId(appointment.id)
  
  return {
    callEndTime: calls? calls.callEndTime.toUTCString() : "",
    callStartTime: calls? calls.callStartTime.toUTCString() : "",
    patientPickedUp: calls? (calls.patientPickedUp ? "Yes" : "No") : "",
    doctorPickedUp: calls? (calls.doctorPickedUp ? "Yes" : "No") : "",
    totalCallDuration: calls? calls.totalCallDuration.toString() : "",
    deviceType: calls? calls.deviceType: "",
  };

};

export const exotelCallingResolvers = {
  Query: {
    initateConferenceTelephoneCall,
    updateCallStatusBySid,
    getCallDetailsByAppintment
  },
};
