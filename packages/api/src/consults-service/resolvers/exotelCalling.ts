import gql from 'graphql-tag';
import { log } from 'customWinstonLogger';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

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

  extend type Query {
    initateConferenceTelephoneCall(exotelInput: exotelInput): exotelResult!
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

  callInputs.exotelUrl += '?';
  for (const [key, value] of Object.entries(reqBody)) {
    callInputs.exotelUrl += '&' + key + '=' + value;
  }

  return await fetch(callInputs.exotelUrl, {
    method: 'POST',
  })
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

  if (!exotelInput.from && !exotelInput.to) {
    // check if appointmentId exist
    if (!exotelInput.appointmentId) {
      throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
    }

    const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
    const appt = await apptsRepo.findById(exotelInput.appointmentId);

    // check if appointment exist
    if (!appt) {
      throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
    }

    // lookup with patientId
    const patientRepo = patientsDb.getCustomRepository(PatientRepository);
    const patient = await patientRepo.findById(appt.patientId);

    if (!patient) {
      throw new AphError(AphErrorMessages.GET_PATIENTS_ERROR, undefined, {});
    }

    // lookup with doctorId
    const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
    const doctor = await doctorRepo.findById(appt.doctorId);

    if (!doctor) {
      throw new AphError(AphErrorMessages.GET_DOCTORS_ERROR, undefined, {});
    }

    // we have got both phone numbers as doctor.mobileNumber and patient.mobileNumber
    fromMobileNumber = doctor.mobileNumber;
    toMobileNumber = patient.mobileNumber;
  }

  if (exotelInput.from && !exotelInput.to) {
    throw new AphError(AphErrorMessages.INVALID_PARAMETERS, undefined, {});
  }

  if (!exotelInput.from && exotelInput.to) {
    throw new AphError(AphErrorMessages.INVALID_PARAMETERS, undefined, {});
  }

  // TODO: Put back this condition
  //const reg = new RegExp(/^\d{10}$/);
  //if (!reg.test(exotelInput.from) || !reg.test(exotelInput.to)) {
  //  throw new AphError(AphErrorMessages.INVALID_PARAMETERS, undefined, {});
  //}
  // else we have both mobile numbers in params.
  // check for validity of both numbers.

  fromMobileNumber = exotelInput.from;
  toMobileNumber = exotelInput.to;

  const exotelRequest = {
    From: fromMobileNumber,
    To: toMobileNumber,
    CallerId: exotelCallerId,
  };
  return await exotelCalling({ exotelUrl, exotelRequest });
};

export const exotelCallingResolvers = {
  Query: {
    initateConferenceTelephoneCall,
  },
};
