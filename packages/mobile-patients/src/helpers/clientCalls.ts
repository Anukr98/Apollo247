import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  ADD_TO_CONSULT_QUEUE,
  AUTOMATED_QUESTIONS,
  CHECK_IF_RESCHDULE,
  DOWNLOAD_DOCUMENT,
  END_APPOINTMENT_SESSION,
  GET_APPOINTMENT_DATA,
  GET_CALL_DETAILS,
  GET_DEVICE_TOKEN_COUNT,
  GET_PATIENT_APPOINTMENTS,
  GET_PERSONALIZED_APPOITNMENTS,
  INSERT_MESSAGE,
  LINK_UHID,
  NEXT_AVAILABLE_SLOT,
  PAST_APPOINTMENTS_COUNT,
  SEND_CHAT_MESSAGE_TO_DOCTOR,
  UNLINK_UHID,
  UPDATE_SAVE_EXTERNAL_CONNECT,
  UPDATE_WHATSAPP_STATUS,
  GET_APPOINTMENT_RESCHEDULE_DETAILS,
  SAVE_SEARCH,
  GET_SECRETARY_DETAILS_BY_DOCTOR_ID,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetDoctorNextAvailableSlot } from '@aph/mobile-patients/src/graphql/types/GetDoctorNextAvailableSlot';
import { linkUhidsVariables } from '@aph/mobile-patients/src/graphql/types/linkUhids';
import ApolloClient from 'apollo-client';
import moment from 'moment';
import { addToConsultQueueVariables } from '@aph/mobile-patients/src/graphql/types/addToConsultQueue';
import { addToConsultQueueWithAutomatedQuestionsVariables } from '@aph/mobile-patients/src/graphql/types/addToConsultQueueWithAutomatedQuestions';
import { checkIfRescheduleVariables } from '@aph/mobile-patients/src/graphql/types/checkIfReschedule';
import { downloadDocuments } from '@aph/mobile-patients/src/graphql/types/downloadDocuments';
import {
  EndAppointmentSession,
  EndAppointmentSessionVariables,
} from '@aph/mobile-patients/src/graphql/types/EndAppointmentSession';
import {
  getAppointmentData,
  getAppointmentDataVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentData';
import {
  getCallDetails,
  getCallDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/getCallDetails';
import {
  getDeviceCodeCount,
  getDeviceCodeCountVariables,
} from '@aph/mobile-patients/src/graphql/types/getDeviceCodeCount';
import {
  getPastAppointmentsCount,
  getPastAppointmentsCountVariables,
} from '@aph/mobile-patients/src/graphql/types/getPastAppointmentsCount';
import {
  getPatientPersonalizedAppointments,
  getPatientPersonalizedAppointmentsVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientPersonalizedAppointments';
import { getPatinetAppointments } from '@aph/mobile-patients/src/graphql/types/getPatinetAppointments';
import {
  ConsultQueueInput,
  MessageInput,
  REQUEST_ROLES,
  STATUS,
  SEARCH_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { insertMessageVariables } from '@aph/mobile-patients/src/graphql/types/insertMessage';
import {
  sendChatMessageToDoctor,
  sendChatMessageToDoctorVariables,
} from '@aph/mobile-patients/src/graphql/types/sendChatMessageToDoctor';
import {
  updateSaveExternalConnect,
  updateSaveExternalConnectVariables,
} from '@aph/mobile-patients/src/graphql/types/updateSaveExternalConnect';
import { updateWhatsAppStatus } from '@aph/mobile-patients/src/graphql/types/updateWhatsAppStatus';
import {
  getAppointmentRescheduleDetails,
  getAppointmentRescheduleDetailsVariables,
} from '@aph/mobile-patients/src/graphql/types/getAppointmentRescheduleDetails';
import { saveSearch, saveSearchVariables } from '@aph/mobile-patients/src/graphql/types/saveSearch';
import {
  getSecretaryDetailsByDoctorId,
  getSecretaryDetailsByDoctorIdVariables,
} from '../graphql/types/getSecretaryDetailsByDoctorId';

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
      .catch((e) => {
        CommonBugFender('clientCalls_getNextAvailableSlots', e);
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
      .catch((e) => {
        CommonBugFender('clientCalls_addToConsultQueue', e);
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
      .catch((e) => {
        CommonBugFender('clientCalls_addToConsultQueueWithAutomatedQuestions', e);
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
        CommonBugFender('clientCalls_checkIfRescheduleAppointment', e);
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
        CommonBugFender('clientCalls_endCallSessionAppointment', e);
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
        CommonBugFender('clientCalls_getAppointmentDataDetails', e);
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
        CommonBugFender('clientCalls_getPrismUrls', e);
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
        CommonBugFender('clientCalls_getAppointments', e);
        rej(e);
      });
  });
};

export const sendNotificationToDoctor = (
  client: ApolloClient<object>,
  appointmentId: string | null | undefined
) => {
  return new Promise((res, rej) => {
    const inputData = {
      appointmentId: appointmentId,
    };
    client
      .query<sendChatMessageToDoctor, sendChatMessageToDoctorVariables>({
        query: SEND_CHAT_MESSAGE_TO_DOCTOR,
        fetchPolicy: 'no-cache',
        variables: inputData,
      })
      .then((data) => {
        res(data.data);
      })
      .catch((e) => {
        CommonBugFender('clientCalls_sendNotificationToDoctor', e);
        rej(e);
      });
  });
};

export const getAppointmentCallStatus = (
  client: ApolloClient<object>,
  appointmentCallId: string
) => {
  return new Promise((res, rej) => {
    client
      .query<getCallDetails, getCallDetailsVariables>({
        query: GET_CALL_DETAILS,
        variables: {
          appointmentCallId: appointmentCallId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e: any) => {
        CommonBugFender('clientCalls_getAppointmentCallStatus', e);
        const error = JSON.parse(JSON.stringify(e));
        rej({ error: e });
      });
  });
};

export const getDeviceTokenCount = (client: ApolloClient<object>, uniqueDeviceId: string) => {
  return new Promise((res, rej) => {
    client
      .query<getDeviceCodeCount, getDeviceCodeCountVariables>({
        query: GET_DEVICE_TOKEN_COUNT,
        variables: {
          deviceCode: uniqueDeviceId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e: any) => {
        CommonBugFender('clientCalls_getDeviceTokenCount', e);
        rej({ error: e });
      });
  });
};

export const linkUHIDs = (
  client: ApolloClient<object>,
  primaryUhid: string,
  linkedUhids: string[]
) => {
  return new Promise((res, rej) => {
    client
      .mutate<linkUhidsVariables>({
        mutation: LINK_UHID,
        variables: {
          primaryUhid: primaryUhid,
          linkedUhids: linkedUhids,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_linkUHIDs', e);
        rej({ error: e });
      });
  });
};

export const deLinkUHIDs = (
  client: ApolloClient<object>,
  primaryUhid: string,
  unlinkUhids: string[]
) => {
  return new Promise((res, rej) => {
    client
      .mutate<linkUhidsVariables>({
        mutation: UNLINK_UHID,
        variables: {
          primaryUhid: primaryUhid,
          unlinkUhids: unlinkUhids,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_deLinkUHIDs', e);
        rej({ error: e });
      });
  });
};

export const insertMessage = (client: ApolloClient<object>, messageInput: MessageInput) => {
  return new Promise((res, rej) => {
    client
      .mutate<insertMessageVariables>({
        mutation: INSERT_MESSAGE,
        variables: { messageInput: messageInput },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_insertMessage', e);
        rej({ error: e });
      });
  });
};

export const whatsAppUpdateAPICall = (
  client: ApolloClient<object>,
  whatsAppMedicine: boolean,
  whatsAppConsult: boolean,
  patientId: string
) => {
  return new Promise((res, rej) => {
    const inputVariables = {
      whatsAppMedicine: whatsAppMedicine,
      whatsAppConsult: whatsAppConsult,
      patientId: patientId,
    };

    console.log('whatsAppUpdate', inputVariables);
    client
      .mutate<updateWhatsAppStatus>({
        mutation: UPDATE_WHATSAPP_STATUS,
        variables: inputVariables,
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_whatsAppUpdateAPICall', e);
        rej({ error: e });
      });
  });
};

export const updateExternalConnect = (
  client: ApolloClient<object>,
  doctorId: string,
  patientId: string,
  externalConnect: boolean,
  appointmentID: string
) => {
  return new Promise((res, rej) => {
    const inputVariables = {
      doctorId: doctorId,
      patientId: patientId,
      externalConnect: externalConnect,
      appointmentId: appointmentID,
    };

    console.log('inputVariables', inputVariables);
    client
      .mutate<updateSaveExternalConnect, updateSaveExternalConnectVariables>({
        mutation: UPDATE_SAVE_EXTERNAL_CONNECT,
        variables: inputVariables,
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_updateExternalConnect', e);
        rej({ error: e });
      });
  });
};

export const getPastAppoinmentCount = (
  client: ApolloClient<object>,
  doctorId: string,
  patientId: string,
  appointmentID: string
) => {
  return new Promise((res, rej) => {
    client
      .query<getPastAppointmentsCount, getPastAppointmentsCountVariables>({
        query: PAST_APPOINTMENTS_COUNT,
        variables: {
          doctorId: doctorId,
          patientId: patientId,
          appointmentId: appointmentID,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_getPastAppoinmentCount', e);
        rej({ error: e });
      });
  });
};

export const getPatientPersonalizedAppointmentList = (
  client: ApolloClient<object>,
  patientUhid: string
) => {
  return new Promise((res, rej) => {
    client
      .query<getPatientPersonalizedAppointments, getPatientPersonalizedAppointmentsVariables>({
        query: GET_PERSONALIZED_APPOITNMENTS,
        variables: {
          patientUhid: patientUhid,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_getPatientPersonalizedAppointmentList', e);
        rej({ error: e });
      });
  });
};

export const getRescheduleAppointmentDetails = (
  client: ApolloClient<object>,
  appointmentId: string
) => {
  return client.query<getAppointmentRescheduleDetails, getAppointmentRescheduleDetailsVariables>({
    query: GET_APPOINTMENT_RESCHEDULE_DETAILS,
    variables: {
      appointmentId: appointmentId,
    },
    fetchPolicy: 'no-cache',
  });
};

export const saveSearchDoctor = (client: ApolloClient<object>, typeId: any, patientId: string) => {
  const searchInput = {
    type: SEARCH_TYPE.DOCTOR,
    typeId: typeId,
    patient: patientId,
  };

  return client.mutate<saveSearch, saveSearchVariables>({
    mutation: SAVE_SEARCH,
    variables: {
      saveSearchInput: searchInput,
    },
    fetchPolicy: 'no-cache',
  });
};

export const saveSearchSpeciality = (
  client: ApolloClient<object>,
  typeId: any,
  patientId: string
) => {
  const searchInput = {
    type: SEARCH_TYPE.SPECIALTY,
    typeId: typeId,
    patient: patientId,
  };

  return client.mutate<saveSearch, saveSearchVariables>({
    mutation: SAVE_SEARCH,
    variables: {
      saveSearchInput: searchInput,
    },
    fetchPolicy: 'no-cache',
  });
};

export const getSecretaryDetailsByDoctor = (client: ApolloClient<object>, doctorId: string) => {
  return new Promise((res, rej) => {
    client
      .query<getSecretaryDetailsByDoctorId, getSecretaryDetailsByDoctorIdVariables>({
        query: GET_SECRETARY_DETAILS_BY_DOCTOR_ID,
        variables: {
          doctorId: doctorId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        rej({ error: e });
      });
  });
};
