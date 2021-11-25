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
  SAVE_DEVICE_TOKEN,
  GET_SECRETARY_DETAILS_BY_DOCTOR_ID,
  GET_PARTICIPANTS_LIVE_STATUS,
  DELETE_PATIENT_PRISM_MEDICAL_RECORD,
  GET_PHR_USER_NOTIFY_EVENTS,
  GET_MEDICAL_PRISM_RECORD_V3,
  GET_ALL_GROUP_BANNERS_OF_USER,
  GET_PACKAGE_INCLUSIONS,
  UPDATE_PATIENT_APP_VERSION,
  GET_ALL_PRO_HEALTH_APPOINTMENTS,
  GET_PATIENT_LATEST_PRESCRIPTION,
  GET_DIAGNOSTIC_OPEN_ORDERLIST,
  GET_DIAGNOSTIC_CLOSED_ORDERLIST,
  GET_PHLOBE_DETAILS,
  GET_INTERNAL_ORDER,
  UPDATE_APPOINTMENT,
  SAVE_PHLEBO_FEEDBACK,
  PROCESS_DIAG_COD_ORDER,
  CREATE_ORDER,
  GET_DIAGNOSTIC_SERVICEABILITY,
  SAVE_DIAGNOSTIC_ORDER_V2,
  GET_CUSTOMIZED_DIAGNOSTIC_SLOTS_V2,
  CREATE_INTERNAL_ORDER,
  MODIFY_DIAGNOSTIC_ORDERS,
  GET_DIAGNOSTIC_PHLEBO_CHARGES,
  DIAGNOSTIC_CANCEL_V2,
  DIAGNOSTIC_RESCHEDULE_V2,
  DIAGNOSITC_EXOTEL_CALLING,
  DIAGNOSTIC_WRAPPER_PROCESS_HC,
  GET_DIAGNOSTIC_ORDERSLIST_BY_PARENT_ORDER_ID,
  GET_DIAGNOSTIC_PAYMENT_SETTINGS,
  GET_DIAGNOSTICS_RECOMMENDATIONS,
  GET_DIAGNOSTIC_EXPRESS_SLOTS_INFO,
  GET_DIAGNOSTIC_REPORT_TAT,
  SAVE_JUSPAY_SDK_RESPONSE,
  GET_DIAGNOSTIC_SEARCH_RESULTS,
  CHANGE_DIAGNOSTIC_ORDER_PATIENT_ID,
  GET_OFFERS_LIST,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  getUserNotifyEvents as getUserNotifyEventsQuery,
  getUserNotifyEventsVariables,
} from '@aph/mobile-patients/src/graphql/types/getUserNotifyEvents';

import { GetDoctorNextAvailableSlot } from '@aph/mobile-patients/src/graphql/types/GetDoctorNextAvailableSlot';
import { linkUhidsVariables } from '@aph/mobile-patients/src/graphql/types/linkUhids';
import ApolloClient from 'apollo-client';
import moment from 'moment';
import { addToConsultQueueVariables } from '@aph/mobile-patients/src/graphql/types/addToConsultQueue';
import { addToConsultQueueWithAutomatedQuestionsVariables } from '@aph/mobile-patients/src/graphql/types/addToConsultQueueWithAutomatedQuestions';
import { checkIfRescheduleVariables } from '@aph/mobile-patients/src/graphql/types/checkIfReschedule';
import { downloadDocuments } from '@aph/mobile-patients/src/graphql/types/downloadDocuments';
import { deletePatientPrismMedicalRecord } from '@aph/mobile-patients/src/graphql/types/deletePatientPrismMedicalRecord';
import {
  EndAppointmentSession,
  EndAppointmentSessionVariables,
} from '@aph/mobile-patients/src/graphql/types/EndAppointmentSession';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
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
import { getPatinetAppointments } from '@aph/mobile-patients/src/graphql/types/getPatinetAppointments';
import {
  ConsultQueueInput,
  MessageInput,
  REQUEST_ROLES,
  STATUS,
  SEARCH_TYPE,
  DEVICE_TYPE,
  USER_TYPE,
  BOOKINGSOURCE,
  USER_STATUS,
  DEVICETYPE,
  MedicalRecordType,
  UserState,
  BannerDisplayType,
  ProcessDiagnosticHCOrderInput,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  SaveBookHomeCollectionOrderInputv2,
  patientObjWithLineItems,
  patientAddressObj,
  DiagnosticsServiceability,
  OrderCreate,
  saveModifyDiagnosticOrderInput,
  ChargeDetailsInput,
  CancellationDiagnosticsInputv2,
  DiagnosticsRescheduleSource,
  slotInfo,
  ProcessDiagnosticHCOrderInputCOD,
  DiagnosticsBookingSource,
  REPORT_TAT_SOURCE
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
  saveDeviceToken,
  saveDeviceTokenVariables,
} from '@aph/mobile-patients/src/graphql/types/saveDeviceToken';
import { Platform } from 'react-native';
import {
  getSecretaryDetailsByDoctorId,
  getSecretaryDetailsByDoctorIdVariables,
} from '@aph/mobile-patients/src/graphql/types/getSecretaryDetailsByDoctorId';
import {
  setAndGetNumberOfParticipants,
  setAndGetNumberOfParticipantsVariables,
} from '@aph/mobile-patients/src/graphql/types/setAndGetNumberOfParticipants';
import {
  getPatientPrismMedicalRecords_V3,
  getPatientPrismMedicalRecords_V3Variables,
} from '@aph/mobile-patients/src/graphql/types/getPatientPrismMedicalRecords_V3';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  GetAllGroupBannersOfUser,
  GetAllGroupBannersOfUserVariables,
} from '@aph/mobile-patients/src/graphql/types/GetAllGroupBannersOfUser';
import {
  bannerType,
  LocationData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  getInclusionsOfMultipleItems,
  getInclusionsOfMultipleItemsVariables,
} from '@aph/mobile-patients/src/graphql/types/getInclusionsOfMultipleItems';
import {
  UpdatePatientAppVersion,
  UpdatePatientAppVersionVariables,
} from '@aph/mobile-patients/src/graphql/types/UpdatePatientAppVersion';
import AsyncStorage from '@react-native-community/async-storage';
import DeviceInfo from 'react-native-device-info';
import appsFlyer from 'react-native-appsflyer';
import {
  getAllProhealthAppointments,
  getAllProhealthAppointmentsVariables,
} from '@aph/mobile-patients/src/graphql/types/getAllProhealthAppointments';
import {
  getPatientLatestPrescriptions,
  getPatientLatestPrescriptionsVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientLatestPrescriptions';
import {
  getDiagnosticOpenOrdersList,
  getDiagnosticOpenOrdersListVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOpenOrdersList';
import {
  getDiagnosticClosedOrdersList,
  getDiagnosticClosedOrdersListVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticClosedOrdersList';
import {
  getOrderPhleboDetailsBulk,
  getOrderPhleboDetailsBulkVariables,
} from '@aph/mobile-patients/src/graphql/types/getOrderPhleboDetailsBulk';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import {
  getOrderInternal,
  getOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/getOrderInternal';
import {
  updateAppointmentVariables,
  updateAppointment,
} from '@aph/mobile-patients/src/graphql/types/updateAppointment';
import {
  getDiagnosticServiceability,
  getDiagnosticServiceabilityVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticServiceability';
import {
  saveDiagnosticBookHCOrderv2,
  saveDiagnosticBookHCOrderv2Variables,
} from '@aph/mobile-patients/src/graphql/types/saveDiagnosticBookHCOrderv2';
import {
  getCustomizedSlotsv2,
  getCustomizedSlotsv2Variables,
} from '@aph/mobile-patients/src/graphql/types/getCustomizedSlotsv2';
import {
  createOrderInternal,
  createOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/createOrderInternal';
import {
  saveModifyDiagnosticOrder,
  saveModifyDiagnosticOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/saveModifyDiagnosticOrder';
import {
  getPhleboCharges,
  getPhleboChargesVariables,
} from '@aph/mobile-patients/src/graphql/types/getPhleboCharges';
import {
  cancelDiagnosticOrdersv2,
  cancelDiagnosticOrdersv2Variables,
} from '@aph/mobile-patients/src/graphql/types/cancelDiagnosticOrdersv2';
import {
  rescheduleDiagnosticsOrderv2,
  rescheduleDiagnosticsOrderv2Variables,
} from '@aph/mobile-patients/src/graphql/types/rescheduleDiagnosticsOrderv2';
import {
  diagnosticExotelCalling,
  diagnosticExotelCallingVariables,
} from '@aph/mobile-patients/src/graphql/types/diagnosticExotelCalling';
import {
  wrapperProcessDiagnosticHCOrderCOD,
  wrapperProcessDiagnosticHCOrderCODVariables,
} from '@aph/mobile-patients/src/graphql/types/wrapperProcessDiagnosticHCOrderCOD';
import {
  getDiagnosticOrdersListByParentOrderID,
  getDiagnosticOrdersListByParentOrderIDVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByParentOrderID';
import {
  savePhleboFeedbackVariables,
  savePhleboFeedback_savePhleboFeedback,
} from '@aph/mobile-patients/src/graphql/types/savePhleboFeedback';
import {
  processDiagnosticHCOrder,
  processDiagnosticHCOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/processDiagnosticHCOrder';
import {
  getDiagnosticPaymentSettings,
  getDiagnosticPaymentSettingsVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticPaymentSettings';
import {
  getDiagnosticItemRecommendations,
  getDiagnosticItemRecommendationsVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticItemRecommendations';
import {
  getUpcomingSlotInfo,
  getUpcomingSlotInfoVariables,
} from '@aph/mobile-patients/src/graphql/types/getUpcomingSlotInfo';
import {
  getConfigurableReportTAT,
  getConfigurableReportTATVariables,
} from '@aph/mobile-patients/src/graphql/types/getConfigurableReportTAT';
import {
  searchDiagnosticItem,
  searchDiagnosticItemVariables,
} from '@aph/mobile-patients/src/graphql/types/searchDiagnosticItem';
import {
  switchDiagnosticOrderPatientID,
  switchDiagnosticOrderPatientIDVariables,
} from '@aph/mobile-patients/src/graphql/types/switchDiagnosticOrderPatientID';

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

export const deletePatientPrismMedicalRecords = (
  client: ApolloClient<object>,
  id: string,
  patientId: string,
  recordType: MedicalRecordType
) => {
  return new Promise((res, rej) => {
    client
      .query<deletePatientPrismMedicalRecord>({
        query: DELETE_PATIENT_PRISM_MEDICAL_RECORD,
        fetchPolicy: 'no-cache',
        variables: {
          deletePatientPrismMedicalRecordInput: {
            id: id,
            patientId: patientId,
            recordType: recordType,
          },
        },
      })
      .then(({ data }) => {
        res({ status: data?.deletePatientPrismMedicalRecord?.status });
      })
      .catch((e: any) => {
        CommonBugFender('clientCalls_deletePatientPrismMedicalRecords', e);
        const error = JSON.parse(JSON.stringify(e));
        rej({ error: e });
      });
  });
};

export const phrNotificationCountApi = (client: ApolloClient<object>, patientId: string) => {
  return new Promise((res, rej) => {
    client
      .query<getUserNotifyEventsQuery, getUserNotifyEventsVariables>({
        query: GET_PHR_USER_NOTIFY_EVENTS,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: patientId,
        },
      })
      .then(({ data }) => {
        res(data?.getUserNotifyEvents?.phr?.newRecordsCount);
      })
      .catch((e: any) => {
        CommonBugFender('clientCalls_phrNotificationCountApi', e);
        const error = JSON.parse(JSON.stringify(e));
        rej({ error: e });
      });
  });
};

export const getPatientPrismMedicalRecordsApi = (
  client: ApolloClient<object>,
  patientId: string,
  records: MedicalRecordType[],
  comingFrom?: string
) => {
  return new Promise((res, rej) => {
    client
      .query<getPatientPrismMedicalRecords_V3, getPatientPrismMedicalRecords_V3Variables>({
        query: GET_MEDICAL_PRISM_RECORD_V3,
        context: {
          headers: {
            callingsource: comingFrom == 'Diagnostics' ? '' : 'healthRecords',
          },
        },
        variables: {
          patientId: patientId || '',
          records: records,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        res(data);
      })
      .catch((e) => {
        CommonBugFender('clientCalls_getPatientPrismMedicalRecordsApi', e);
        rej(e);
      });
  });
};

export const getPatientPrismSingleMedicalRecordApi = (
  client: ApolloClient<object>,
  patientId: string,
  records: MedicalRecordType[],
  recordId: string,
  source: string | null = null
) => {
  return new Promise((res, rej) => {
    client
      .query<getPatientPrismMedicalRecords_V3, getPatientPrismMedicalRecords_V3Variables>({
        query: GET_MEDICAL_PRISM_RECORD_V3,
        variables: {
          patientId: patientId || '',
          records: records,
        },
        fetchPolicy: 'no-cache',
      })
      .then(({ data }) => {
        res(data);
      })
      .catch((e) => {
        CommonBugFender('clientCalls_getPatientPrismMedicalRecordsApi', e);
        rej(e);
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

export const saveTokenDevice = (client: ApolloClient<object>, token: any, patientId: string) => {
  if (!token || token === '' || token.length == 0) {
    return;
  }

  const input = {
    deviceType: Platform.OS === 'ios' ? DEVICE_TYPE.IOS : DEVICE_TYPE.ANDROID,
    deviceToken: token,
    deviceOS: '',
    patientId: patientId,
    appVersion:
      AppConfig.APP_ENV + ' ' + Platform.OS === 'ios'
        ? AppConfig.Configuration.iOS_Version
        : AppConfig.Configuration.Android_Version,
  };

  return client.mutate<saveDeviceToken, saveDeviceTokenVariables>({
    mutation: SAVE_DEVICE_TOKEN,
    variables: {
      SaveDeviceTokenInput: input,
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

export const getParticipantsLiveStatus = (
  client: ApolloClient<object>,
  appointmentId: string,
  userStatus: USER_STATUS
) => {
  const input = {
    appointmentId: appointmentId,
    userType: USER_TYPE.PATIENT,
    sourceType: BOOKINGSOURCE.MOBILE,
    deviceType: Platform.OS === 'ios' ? DEVICETYPE.IOS : DEVICETYPE.ANDROID,
    userStatus: userStatus,
  };
  return new Promise((res, rej) => {
    client
      .query<setAndGetNumberOfParticipants, setAndGetNumberOfParticipantsVariables>({
        query: GET_PARTICIPANTS_LIVE_STATUS,
        variables: input,
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res(data);
      })
      .catch((e) => {
        rej(e);
      });
  });
};

export const getUserBannersList = (
  client: ApolloClient<object>,
  currentPatient: any,
  banner_context: string,
  banner_display_type: any[] = [BannerDisplayType.banner]
) => {
  return new Promise((res, rej) => {
    const mobile_number = g(currentPatient, 'mobileNumber');
    mobile_number &&
      client
        .query<GetAllGroupBannersOfUser, GetAllGroupBannersOfUserVariables>({
          query: GET_ALL_GROUP_BANNERS_OF_USER,
          variables: {
            mobile_number,
            banner_context: banner_context,
            user_state: UserState.LOGGED_IN,
            banner_display_type: banner_display_type,
          },
          fetchPolicy: 'no-cache',
        })
        .then((data) => {
          const bannersData = g(data, 'data', 'GetAllGroupBannersOfUser', 'response');
          const banners: bannerType[] = [];
          if (bannersData && bannersData.length) {
            bannersData.forEach((value) => {
              const { _id, is_active, banner, cta_action, meta } = value;
              banners.push({
                _id,
                is_active: !!is_active,
                banner,
                cta_action,
                meta,
                ...value,
              });
            });
            res(banners);
          } else {
            res(null);
          }
        })
        .catch((e) => {
          rej(e);
          CommonBugFender('ConsultRoom_GetAllGroupBannersOfUser', e);
        });
  });
};

export const getPackageInclusions = (client: ApolloClient<object>, itemId: any) => {
  const input = {
    itemID: itemId,
  };
  return new Promise((res, rej) => {
    client
      .query<getInclusionsOfMultipleItems, getInclusionsOfMultipleItemsVariables>({
        query: GET_PACKAGE_INCLUSIONS,
        variables: input,
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res(data);
      })
      .catch((e) => {
        rej(e);
      });
  });
};

export const updatePatientAppVersion = async (
  client: ApolloClient<object>,
  currentPatient: any
) => {
  try {
    appsFlyer.getAppsFlyerUID((error, appsFlyerUID) => {
      if (appsFlyerUID) {
        notifyAppVersion(client, currentPatient, appsFlyerUID);
      } else {
        notifyAppVersion(client, currentPatient);
        CommonBugFender('getAppsFlyerUID', error);
      }
    });
  } catch (error) {}
};

const notifyAppVersion = async (
  client: ApolloClient<object>,
  currentPatient: any,
  appsflyerId?: string
) => {
  try {
    const key = `${currentPatient?.id}-appVersion`;
    const savedAppVersion = await AsyncStorage.getItem(key);
    const appVersion = DeviceInfo.getVersion();
    const appsflyerIdKey = `${currentPatient?.id}-appsflyerId`;
    const appsflyerSaved = await AsyncStorage.getItem(appsflyerIdKey);

    const variables = {
      appVersion,
      patientId: currentPatient?.id,
      osType: Platform.OS == 'ios' ? DEVICETYPE.IOS : DEVICETYPE.ANDROID,
      appsflyerId,
    };
    if (savedAppVersion !== appVersion || appsflyerSaved !== appsflyerId) {
      const res = await client.mutate<UpdatePatientAppVersion, UpdatePatientAppVersionVariables>({
        mutation: UPDATE_PATIENT_APP_VERSION,
        variables,
        fetchPolicy: 'no-cache',
      });
      await AsyncStorage.setItem(key, appVersion);
      await AsyncStorage.setItem(appsflyerIdKey, appsflyerId!);
    }
  } catch (error) {}
};

export const getAllProHealthAppointments = (client: ApolloClient<object>, patientId: string) => {
  return new Promise((res, rej) => {
    client
      .query<getAllProhealthAppointments, getAllProhealthAppointmentsVariables>({
        query: GET_ALL_PRO_HEALTH_APPOINTMENTS,
        variables: {
          patientId: patientId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_ getAllProHealthAppointments', e);
        rej({ error: e });
      });
  });
};

export const getDiagnosticPatientPrescription = (
  client: ApolloClient<object>,
  mobileNumber: string,
  limit: number,
  cityId: number | string
) => {
  return new Promise((res, rej) => {
    client
      .query<getPatientLatestPrescriptions, getPatientLatestPrescriptionsVariables>({
        query: GET_PATIENT_LATEST_PRESCRIPTION,
        context: {
          sourceHeaders,
        },
        variables: {
          mobileNumber: mobileNumber,
          limit: limit,
          cityId: Number(cityId),
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_getDiagnosticPatientPrescription', e);
        rej({ error: e });
      });
  });
};

export const getDiagnosticOpenOrders = (
  client: ApolloClient<object>,
  mobileNumber: string,
  skip: number,
  take: number
) => {
  return new Promise((res, rej) => {
    client
      .query<getDiagnosticOpenOrdersList, getDiagnosticOpenOrdersListVariables>({
        query: GET_DIAGNOSTIC_OPEN_ORDERLIST,
        context: {
          sourceHeaders,
        },
        variables: {
          mobileNumber: mobileNumber,
          skip: skip, //for pagination
          take: take, // number of orders to show
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_getDiagnosticOpenOrders', e);
        rej({ error: e });
      });
  });
};

export const getDiagnosticClosedOrders = (
  client: ApolloClient<object>,
  mobileNumber: string,
  skip: number,
  take: number
) => {
  return new Promise((res, rej) => {
    client
      .query<getDiagnosticClosedOrdersList, getDiagnosticClosedOrdersListVariables>({
        query: GET_DIAGNOSTIC_CLOSED_ORDERLIST,
        context: {
          sourceHeaders,
        },
        variables: {
          mobileNumber: mobileNumber,
          skip: skip, //for pagination
          take: take, // number of orders to show
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_getDiagnosticClosedOrders', e);
        rej({ error: e });
      });
  });
};

export const getDiagnosticPhelboDetails = (client: ApolloClient<object>, orderId: any) => {
  return new Promise((res, rej) => {
    client
      .query<getOrderPhleboDetailsBulk, getOrderPhleboDetailsBulkVariables>({
        query: GET_PHLOBE_DETAILS,
        context: {
          sourceHeaders,
        },
        variables: {
          diagnosticOrdersIds: orderId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_getDiagnosticPhelboDetails', e);
        rej({ error: e });
      });
  });
};

export const getDiagnosticRefundOrders = (client: ApolloClient<object>, paymentId: any) => {
  return new Promise((res, rej) => {
    client
      .query<getOrderInternal, getOrderInternalVariables>({
        query: GET_INTERNAL_ORDER,
        context: {
          sourceHeaders,
        },
        variables: {
          order_id: paymentId,
        },
        fetchPolicy: 'no-cache',
      })
      .then((data: any) => {
        res({ data });
      })
      .catch((e) => {
        CommonBugFender('clientCalls_getDiagnosticRefundOrders', e);
        rej({ error: e });
      });
  });
};

export const saveConsultationLocation = async (
  client: ApolloClient<object>,
  appointmentId: string,
  location: LocationData
) => {
  try {
    const query: updateAppointmentVariables = {
      appointmentInput: {
        appointmentId,
        patientLocation: {
          city: location?.city,
          pincode: Number(location?.pincode),
        },
      },
    };
    await client.query<updateAppointment>({
      query: UPDATE_APPOINTMENT,
      fetchPolicy: 'no-cache',
      variables: query,
    });
  } catch (error) {
    CommonBugFender('saveLocationWithConsultation', error);
  }
};
export const savePhleboFeedback = (
  client: ApolloClient<object>,
  rating: number,
  feedback: string,
  orderId: string,
  userComment: string
) => {
  return client.mutate<savePhleboFeedback_savePhleboFeedback, savePhleboFeedbackVariables>({
    mutation: SAVE_PHLEBO_FEEDBACK,
    variables: {
      phleboRating: rating,
      phleboFeedback: feedback,
      diagnosticOrdersId: orderId,
      patientComments: userComment,
    },
    fetchPolicy: 'no-cache',
  });
};

export const processDiagnosticsCODOrder = (
  client: ApolloClient<object>,
  orderId: string,
  amount: number
) => {
  const processDiagnosticHCOrderInput: ProcessDiagnosticHCOrderInput = {
    orderID: orderId,
    paymentMode: DIAGNOSTIC_ORDER_PAYMENT_TYPE.COD,
    amount: amount,
  };
  return client.mutate<processDiagnosticHCOrder, processDiagnosticHCOrderVariables>({
    mutation: PROCESS_DIAG_COD_ORDER,
    variables: { processDiagnosticHCOrderInput: processDiagnosticHCOrderInput },
    fetchPolicy: 'no-cache',
  });
};

export const diagnosticPaymentSettings = (client: ApolloClient<object>, paymentId: string) => {
  return client.query<getDiagnosticPaymentSettings, getDiagnosticPaymentSettingsVariables>({
    query: GET_DIAGNOSTIC_PAYMENT_SETTINGS,
    context: {
      sourceHeaders,
    },
    variables: { paymentOrderId: paymentId },
    fetchPolicy: 'no-cache',
  });
};
export const diagnosticServiceability = (
  client: ApolloClient<object>,
  latitude: number,
  longitude: number
) => {
  return client.query<getDiagnosticServiceability, getDiagnosticServiceabilityVariables>({
    query: GET_DIAGNOSTIC_SERVICEABILITY,
    variables: { latitude: Number(latitude), longitude: Number(longitude) },
    context: {
      sourceHeaders,
    },
    fetchPolicy: 'no-cache',
  });
};

export const diagnosticGetPhleboCharges = (
  client: ApolloClient<object>,
  chargeDetailsInput: ChargeDetailsInput
) => {
  return client.query<getPhleboCharges, getPhleboChargesVariables>({
    query: GET_DIAGNOSTIC_PHLEBO_CHARGES,
    variables: {
      chargeDetailsInput: chargeDetailsInput,
    },
    context: {
      sourceHeaders,
    },
    fetchPolicy: 'no-cache',
  });
};

export const diagnosticGetCustomizedSlotsV2 = (
  client: ApolloClient<object>,
  patientAddressObject: patientAddressObj,
  patientsObjWithLineItemsObject: (patientObjWithLineItems | null)[],
  billAmount: number,
  selectedDate: any,
  serviceabilityObject?: DiagnosticsServiceability,
  diagnosticOrdersId?: string
) => {
  return client.query<getCustomizedSlotsv2, getCustomizedSlotsv2Variables>({
    query: GET_CUSTOMIZED_DIAGNOSTIC_SLOTS_V2,
    variables: {
      patientAddressObj: patientAddressObject,
      patientsObjWithLineItems: patientsObjWithLineItemsObject,
      billAmount: billAmount,
      selectedDate: selectedDate,
      serviceability: serviceabilityObject,
      diagnosticOrdersId: diagnosticOrdersId,
      patientAddressID: patientAddressObject?.patientAddressID,
      bookingSource: DiagnosticsBookingSource.MOBILE,
    },
    context: {
      sourceHeaders,
    },
    fetchPolicy: 'no-cache',
  });
};

export const diagnosticSaveBookHcCollectionV2 = (
  client: ApolloClient<object>,
  orderInfo: SaveBookHomeCollectionOrderInputv2
) => {
  return client.mutate<saveDiagnosticBookHCOrderv2, saveDiagnosticBookHCOrderv2Variables>({
    mutation: SAVE_DIAGNOSTIC_ORDER_V2,
    variables: { diagnosticOrderInput: orderInfo },
    context: {
      sourceHeaders,
    },
  });
};

export const createInternalOrder = (client: ApolloClient<object>, orders: OrderCreate) => {
  return client.mutate<createOrderInternal, createOrderInternalVariables>({
    mutation: CREATE_INTERNAL_ORDER,
    context: {
      sourceHeaders,
    },
    variables: { order: orders },
  });
};

export const diagnosticSaveModifyOrder = (
  client: ApolloClient<object>,
  orderInfo: saveModifyDiagnosticOrderInput
) => {
  return client.mutate<saveModifyDiagnosticOrder, saveModifyDiagnosticOrderVariables>({
    mutation: MODIFY_DIAGNOSTIC_ORDERS,
    context: {
      sourceHeaders,
    },
    variables: { saveModifyDiagnosticOrder: orderInfo },
  });
};

export const diagnosticCancelOrder = (
  client: ApolloClient<object>,
  orderInput: CancellationDiagnosticsInputv2
) => {
  return client.mutate<cancelDiagnosticOrdersv2, cancelDiagnosticOrdersv2Variables>({
    mutation: DIAGNOSTIC_CANCEL_V2,
    context: { sourceHeaders },
    variables: { cancellationDiagnosticsInput: orderInput },
    fetchPolicy: 'no-cache',
  });
};

export const diagnosticRescheduleOrder = (
  client: ApolloClient<object>,
  parentOrderID: string,
  slotInfo: slotInfo,
  selectedDate: any,
  comment: string,
  reason: string,
  source: DiagnosticsRescheduleSource
) => {
  return client.mutate<rescheduleDiagnosticsOrderv2, rescheduleDiagnosticsOrderv2Variables>({
    mutation: DIAGNOSTIC_RESCHEDULE_V2,
    variables: {
      parentOrderID: parentOrderID,
      slotInfo: slotInfo,
      selectedDate: selectedDate,
      comment: comment,
      reason: reason,
      source: source,
    },
    context: { sourceHeaders },
    fetchPolicy: 'no-cache',
  });
};

export const diagnosticExotelCall = (client: ApolloClient<object>, orderId: string) => {
  return client.mutate<diagnosticExotelCalling, diagnosticExotelCallingVariables>({
    mutation: DIAGNOSITC_EXOTEL_CALLING,
    context: {
      sourceHeaders,
    },
    variables: { orderId: orderId },
  });
};

export const processDiagnosticsCODOrderV2 = (
  client: ApolloClient<object>,
  array: [ProcessDiagnosticHCOrderInputCOD]
) => {
  return client.mutate<
    wrapperProcessDiagnosticHCOrderCOD,
    wrapperProcessDiagnosticHCOrderCODVariables
  >({
    mutation: DIAGNOSTIC_WRAPPER_PROCESS_HC,
    context: {
      sourceHeaders,
    },
    variables: { processDiagnosticHCOrdersInput: array },
    fetchPolicy: 'no-cache',
  });
};

export const diagnosticsOrderListByParentId = (
  client: ApolloClient<object>,
  parentOrderID: string
) => {
  return client.query<
    getDiagnosticOrdersListByParentOrderID,
    getDiagnosticOrdersListByParentOrderIDVariables
  >({
    query: GET_DIAGNOSTIC_ORDERSLIST_BY_PARENT_ORDER_ID,
    context: {
      sourceHeaders,
    },
    variables: { parentOrderID: parentOrderID },
    fetchPolicy: 'no-cache',
  });
};

export const saveJusPaySDKresponse = (client: ApolloClient<object>, payload: any) => {
  client.query({
    query: SAVE_JUSPAY_SDK_RESPONSE,
    context: {
      sourceHeaders,
    },
    variables: payload,
    fetchPolicy: 'no-cache',
  });
};

export const getDiagnosticCartRecommendations = (
  client: ApolloClient<object>,
  itemIds: any,
  numOfRecords: number
) => {
  return client.query<getDiagnosticItemRecommendations, getDiagnosticItemRecommendationsVariables>({
    query: GET_DIAGNOSTICS_RECOMMENDATIONS,
    context: {
      sourceHeaders,
    },
    variables: {
      itemIds: itemIds,
      records: numOfRecords,
    },
    fetchPolicy: 'no-cache',
  });
};

export const getDiagnosticExpressSlots = (
  client: ApolloClient<object>,
  latitude: number,
  longitude: number,
  zipcode: string,
  serviceabilityObj: DiagnosticsServiceability
) => {
  return client.query<getUpcomingSlotInfo, getUpcomingSlotInfoVariables>({
    query: GET_DIAGNOSTIC_EXPRESS_SLOTS_INFO,
    context: {
      sourceHeaders,
    },
    variables: {
      latitude: latitude,
      longitude: longitude,
      zipcode: zipcode,
      serviceability: serviceabilityObj,
    },
    fetchPolicy: 'no-cache',
  });
};

export const getReportTAT = (
  client: ApolloClient<object>,
  slotDateTimeInUTC: string | null,
  cityId: number,
  pincode: number,
  itemIds: number[],
  source?: REPORT_TAT_SOURCE
) =>
{
  return client.query<getConfigurableReportTAT, getConfigurableReportTATVariables>({
    query: GET_DIAGNOSTIC_REPORT_TAT,
    context: {
      sourceHeaders,
    },
    variables: {
      slotDateTimeInUTC: slotDateTimeInUTC,
      cityId: cityId,
      pincode: pincode,
      itemIds: itemIds,
      source: source
    },
    fetchPolicy: 'no-cache',
  });
};

export const getDiagnosticSearchResults = (
  client: ApolloClient<object>,
  keyword: string,
  cityId: number,
  results: number
) => {
  return client.query<searchDiagnosticItem, searchDiagnosticItemVariables>({
    query: GET_DIAGNOSTIC_SEARCH_RESULTS,
    context: {
      sourceHeaders,
    },
    variables: {
      keyword: keyword,
      cityId: cityId,
      size: results,
    },
    fetchPolicy: 'no-cache',
  });
};

export const switchDiagnosticOrderPatientId = (
  client: ApolloClient<object>,
  orderId: string,
  newPatientId: string
) => {
  return client.mutate<switchDiagnosticOrderPatientID, switchDiagnosticOrderPatientIDVariables>({
    mutation: CHANGE_DIAGNOSTIC_ORDER_PATIENT_ID,
    context: {
      sourceHeaders,
    },

    variables: {
      diagnosticOrdersId: orderId,
      newPatientId: newPatientId,
    },
    fetchPolicy: 'no-cache',
  });
};

export const getOffersList = (
  client: ApolloClient<object>,
  orderInfo: any,
  businessLine: string,
  paymentMethodInfo: []
) => {
  const variables = {
    listOffersInput: {
      order: {
        order_id: orderInfo?.paymentId,
        amount: orderInfo?.amount,
      },
      payment_method_info: paymentMethodInfo,
    },
    is_juspay_pharma: businessLine == 'pharma' ? true : false,
  };
  return client.query({
    query: GET_OFFERS_LIST,
    variables: variables,
    fetchPolicy: 'no-cache',
  });
};
