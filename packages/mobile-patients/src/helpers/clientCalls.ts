import ApolloClient from 'apollo-client';
import { GetDoctorNextAvailableSlot } from '@aph/mobile-patients/src/graphql/types/GetDoctorNextAvailableSlot';
import {
  NEXT_AVAILABLE_SLOT,
  ADD_TO_CONSULT_QUEUE,
  CHECK_IF_RESCHDULE,
  AUTOMATED_QUESTIONS,
  END_APPOINTMENT_SESSION,
  GET_APPOINTMENT_DATA,
  DOWNLOAD_DOCUMENT,
  GET_PATIENT_APPOINTMENTS,
  LOGIN,
  VERIFY_LOGIN_OTP,
} from '@aph/mobile-patients/src/graphql/profiles';
import { addToConsultQueueVariables } from '../graphql/types/addToConsultQueue';
import { checkIfRescheduleVariables } from '../graphql/types/checkIfReschedule';
import { addToConsultQueueWithAutomatedQuestionsVariables } from '../graphql/types/addToConsultQueueWithAutomatedQuestions';
import {
  ConsultQueueInput,
  REQUEST_ROLES,
  STATUS,
  EndAppointmentSessionInput,
  LOGIN_TYPE,
} from '../graphql/types/globalTypes';
import {
  EndAppointmentSessionVariables,
  EndAppointmentSession,
} from '../graphql/types/EndAppointmentSession';
import {
  getAppointmentData,
  getAppointmentDataVariables,
} from '../graphql/types/getAppointmentData';
import { downloadDocuments } from '../graphql/types/downloadDocuments';
import { getPatinetAppointments } from '../graphql/types/getPatinetAppointments';
import moment from 'moment';
import { LoginVariables, Login } from '../graphql/types/Login';
import { verifyLoginOtpVariables, verifyLoginOtp } from '../graphql/types/verifyLoginOtp';

export const getNextAvailableSlots = (
  client: ApolloClient<object>,
  doctorIds: (string | null)[] | (string | undefined)[] | string[],
  todayDate: string
) => {
  return new Promise((res, rej) => {
    client
      .query<GetDoctorNextAvailableSlot>({
        query: NEXT_AVAILABLE_SLOT,
        variables: {
          DoctorNextAvailableSlotInput: {
            doctorIds: doctorIds,
            availableDate: todayDate,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        if (data) {
          if (
            data &&
            data.getDoctorNextAvailableSlot &&
            data.getDoctorNextAvailableSlot.doctorAvailalbeSlots
          ) {
            res({ data: data.getDoctorNextAvailableSlot.doctorAvailalbeSlots });
          }
        }
      })
      .catch((e: string) => {
        console.log('Error occured while searching Doctor', e);
        rej({ error: e });
      });
  });
};

export const addToConsultQueue = (client: ApolloClient<object>, appointmentId: string) => {
  return new Promise((res, rej) => {
    client
      .mutate<addToConsultQueueVariables>({
        mutation: ADD_TO_CONSULT_QUEUE,
        variables: {
          appointmentId: appointmentId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e: string) => {
        rej({ error: e });
      });
  });
};

export const addToConsultQueueWithAutomatedQuestions = (
  client: ApolloClient<object>,
  consultQueueInput: ConsultQueueInput
) => {
  return new Promise((res, rej) => {
    client
      .mutate<addToConsultQueueWithAutomatedQuestionsVariables>({
        mutation: AUTOMATED_QUESTIONS,
        variables: {
          ConsultQueueInput: consultQueueInput,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e: string) => {
        rej({ error: e });
      });
  });
};

export const checkIfRescheduleAppointment = (
  client: ApolloClient<object>,
  existAppointmentId: string,
  rescheduleDate: string
) => {
  return new Promise((res, rej) => {
    client
      .query<checkIfRescheduleVariables>({
        query: CHECK_IF_RESCHDULE,
        variables: {
          existAppointmentId: existAppointmentId,
          rescheduleDate: rescheduleDate,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e: any) => {
        const error = JSON.parse(JSON.stringify(e));
        rej({ error: e });
      });
  });
};

export const endCallSessionAppointment = (
  client: ApolloClient<object>,
  existAppointmentId: string,
  status: STATUS,
  noShowBy: REQUEST_ROLES
) => {
  return new Promise((res, rej) => {
    client
      .mutate<EndAppointmentSession, EndAppointmentSessionVariables>({
        mutation: END_APPOINTMENT_SESSION,
        variables: {
          endAppointmentSessionInput: {
            appointmentId: existAppointmentId,
            status: status,
            noShowBy: noShowBy,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e: any) => {
        const error = JSON.parse(JSON.stringify(e));
        rej({ error: e });
      });
  });
};

export const getAppointmentDataDetails = (client: ApolloClient<object>, appointmentId: string) => {
  return new Promise((res, rej) => {
    client
      .query<getAppointmentData, getAppointmentDataVariables>({
        query: GET_APPOINTMENT_DATA,
        variables: {
          appointmentId: appointmentId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e: any) => {
        const error = JSON.parse(JSON.stringify(e));
        rej({ error: e });
      });
  });
};

export const getPrismUrls = (
  client: ApolloClient<object>,
  patientId: string,
  fileIds: string[]
) => {
  return new Promise((res, rej) => {
    client
      .query<downloadDocuments>({
        query: DOWNLOAD_DOCUMENT,
        fetchPolicy: 'no-cache',
        variables: {
          downloadDocumentsInput: {
            patientId: patientId,
            fileIds: fileIds,
          },
        },
      })
      .then(({ data }) => {
        res({ urls: data.downloadDocuments.downloadPaths });
      })
      .catch((e: any) => {
        const error = JSON.parse(JSON.stringify(e));
        rej({ error: e });
      });
  });
};

export const getAppointments = (
  client: ApolloClient<object>,
  patientId: string | null | undefined
) => {
  return new Promise((res, rej) => {
    const inputData = {
      patientId: patientId || '',
      appointmentDate: moment(new Date(), 'YYYY-MM-DD').format('YYYY-MM-DD'),
    };
    client
      .query<getPatinetAppointments>({
        query: GET_PATIENT_APPOINTMENTS,
        fetchPolicy: 'no-cache',
        variables: {
          patientAppointmentsInput: inputData,
        },
      })
      .then((data) => {
        res(data.data.getPatinetAppointments);
      })
      .catch((e) => {
        rej(e);
      });
  });
};

export const loginAPI = (client: ApolloClient<object>, mobileNumber: string) => {
  return new Promise((res, rej) => {
    const inputData = {
      mobileNumber: mobileNumber,
      loginType: LOGIN_TYPE.PATIENT,
    };
    client
      .query<Login, LoginVariables>({
        query: LOGIN,
        fetchPolicy: 'no-cache',
        variables: inputData,
      })
      .then((data) => {
        console.log('logindata', data);
        res(data.data.login);
      })
      .catch((e) => {
        rej(e);
      });
  });
};

export const verifyOTP = (client: ApolloClient<object>, mobileNumber: string, otp: string) => {
  return new Promise((res, rej) => {
    const inputData = {
      mobileNumber: mobileNumber,
      loginType: LOGIN_TYPE.PATIENT,
      otp: otp,
    };
    client
      .query<verifyLoginOtp, verifyLoginOtpVariables>({
        query: VERIFY_LOGIN_OTP,
        fetchPolicy: 'no-cache',
        variables: { otpVerificationInput: inputData },
      })
      .then((data) => {
        console.log('verifyOTPdata', data);
        res(data.data.verifyLoginOtp);
      })
      .catch((e) => {
        rej(e);
      });
  });
};
