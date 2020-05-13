import '@aph/universal/dist/global';
import { buildFederatedSchema } from '@apollo/federation';
import { GatewayHeaders } from 'api-gateway';
import { ApolloServer } from 'apollo-server';
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';
import gql from 'graphql-tag';
import { connect } from 'profiles-service/database/connect';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import {
  getCurrentPatientsResolvers,
  getCurrentPatientsTypeDefs,
} from 'profiles-service/resolvers/getCurrentPatients';
import {
  getDigitizedOrderResolvers,
  getDigitizedOrderTypeDefs,
} from 'profiles-service/resolvers/getDigitizedOrderDetails';
import {
  getPastSearchesResolvers,
  getPastSearchesTypeDefs,
} from 'profiles-service/resolvers/getPastSearches';
import {
  getPatientPastSearchesResolvers,
  getPatientPastSearchesTypeDefs,
} from 'profiles-service/resolvers/getPatientPastSearches';
import { getPatientResolvers, getPatientTypeDefs } from 'profiles-service/resolvers/getPatients';
import {
  addPatientAddressResolvers,
  addPatientAddressTypeDefs,
} from 'profiles-service/resolvers/patientAddress';
import {
  saveDeviceTokenResolvers,
  saveDeviceTokenTypeDefs,
} from 'profiles-service/resolvers/savePatientDeviceToken';
import { saveSearchResolvers, saveSearchTypeDefs } from 'profiles-service/resolvers/saveSearch';
import {
  updatePatientResolvers,
  updatePatientTypeDefs,
} from 'profiles-service/resolvers/updatePatient';
import {
  savePatientNotificationSettingsResolvers,
  savePatientNotificationSettingsTypeDefs,
} from 'profiles-service/resolvers/savePatientNotificationSettings';
import {
  getPatientNotificationSettingsResolvers,
  getPatientNotificationSettingsTypeDefs,
} from 'profiles-service/resolvers/getPatientNotificationSettings';
import {
  saveMedicineOrderTypeDefs,
  saveMedicineOrderResolvers,
} from 'profiles-service/resolvers/saveMedicineOrders';
import {
  savePrescriptionMedicineOrderTypeDefs,
  savePrescriptionMedicineOrderResolvers,
} from 'profiles-service/resolvers/savePrescriptionMedicineOrders';
import {
  savePrescriptionMedicineOrderOMSTypeDefs,
  savePrescriptionMedicineOrderOMSResolvers,
} from 'profiles-service/resolvers/savePrescriptionMedicineOrdersOMS';
import {
  saveMedicineOrderPaymentTypeDefs,
  saveMedicineOrderPaymentResolvers,
} from 'profiles-service/resolvers/saveMedicineOrderPayment';
import {
  saveMedicineOrderPaymentMqTypeDefs,
  saveMedicineOrderPaymentMqResolvers,
} from 'profiles-service/resolvers/saveMedicineOrderPaymentmq';
import {
  getMedicineOrdersListTypeDefs,
  getMedicineOrdersListResolvers,
} from 'profiles-service/resolvers/getMedicineOrdersList';
import { uploadFileTypeDefs, uploadFileResolvers } from 'profiles-service/resolvers/uploadFile';
import {
  uploadDocumentTypeDefs,
  uploadDocumentResolvers,
} from 'profiles-service/resolvers/uploadDocumentToPrism';
import {
  downloadDocumentsTypeDefs,
  downloadDocumentsResolvers,
} from 'profiles-service/resolvers/downloadDocumentsFromPrism';
import {
  addPatientMedicalRecordTypeDefs,
  addPatientMedicalRecordResolvers,
} from 'profiles-service/resolvers/addMedicalRecord';
import {
  addPatientFeedbackTypeDefs,
  addPatientFeedbackResolvers,
} from 'profiles-service/resolvers/patientFeedback';
import {
  deletePatientMedicalRecordTypeDefs,
  deletePatientMedicalRecordResolvers,
} from 'profiles-service/resolvers/deleteMedicalRecord';
import {
  getPatientMedicalRecordsTypeDefs,
  getPatientMedicalRecordsResolvers,
} from 'profiles-service/resolvers/getPatientMedicalRecords';
import { getCouponsTypeDefs, getCouponsResolvers } from 'profiles-service/resolvers/getCoupons';
import {
  submitPrescriptionOrderTypeDefs,
  submitPrescriptionOrderResolvers,
} from 'profiles-service/resolvers/submitPrescriptionOrder';
import {
  updateOrderStatusTypeDefs,
  updateOrderStatusResolvers,
} from 'profiles-service/resolvers/pharmaUpdateOrderStatus';
import {
  saveOrderShipmentInvoiceTypeDefs,
  saveOrderShipmentInvoiceResolvers,
} from 'profiles-service/resolvers/pharmaOrderBilled';
import {
  saveOrderShipmentsTypeDefs,
  saveOrderShipmentsResolvers,
} from 'profiles-service/resolvers/pharmaOrderVerified';
import {
  pharmaOrderConfirmationTypeDefs,
  pharmaOrderConfirmationResolvers,
} from 'profiles-service/resolvers/pharmaOrderConfirmation';
import {
  pharmaOrderDeliveredTypeDefs,
  pharmaOrderDeliveryResolvers,
} from 'profiles-service/resolvers/pharmaOrderDelivered';
import {
  pharmaOrderPlacedTypeDefs,
  pharmaOrderPlacedResolvers,
} from 'profiles-service/resolvers/pharmaOrderPlaced';
import {
  pharmaOrderCancelledTypeDefs,
  pharmaOrderCancelResolvers,
} from 'profiles-service/resolvers/pharmaOrderCancelled';
import {
  medicineOrderCancelTypeDefs,
  medicineOrderCancelResolvers,
} from 'profiles-service/resolvers/cancelMedicineOrder';
import {
  patientLifeStyleTypeDefs,
  patientLifeStyleResolvers,
} from 'profiles-service/resolvers/patientLifeStyle';
import {
  patientFamilyHistoryTypeDefs,
  patientFamilyHistoryResolvers,
} from 'profiles-service/resolvers/patientFamilyHistory';
import {
  saveMedicineOrderInvoiceTypeDefs,
  saveMedicineOrderInvoiceResolvers,
} from 'profiles-service/resolvers/pharmaOrderInvoice';
import { diagnosticsTypeDefs, diagnosticsResolvers } from 'profiles-service/resolvers/diagnostics';
import {
  saveDiagnosticOrderTypeDefs,
  saveDiagnosticOrderResolvers,
} from 'profiles-service/resolvers/saveDiagnosticOrders';
import {
  saveDiagnosticOrderPaymentTypeDefs,
  saveDiagnosticOrderPaymentResolvers,
} from 'profiles-service/resolvers/saveDiagnosticOrderPayment';
import {
  cancelDiagnosticOrdersTypeDefs,
  cancelDiagnosticOrdersResolvers,
} from 'profiles-service/resolvers/cancelDiagnosticOrders';
import { loginTypeDefs, loginResolvers } from 'profiles-service/resolvers/login';
import {
  verifyLoginOtpTypeDefs,
  verifyLoginOtpResolvers,
} from 'profiles-service/resolvers/verifyLoginOtp';

import 'reflect-metadata';
import { getConnection } from 'typeorm';
import { helpTypeDefs, helpResolvers } from 'profiles-service/resolvers/help';
import { format, differenceInMilliseconds } from 'date-fns';
import { winstonLogger } from 'customWinstonLogger';
import {
  registerPatientsTypeDefs,
  registerPatientsResolvers,
} from 'profiles-service/resolvers/registerPatients';

(async () => {
  await connect();
  const profilesLogger = winstonLogger.loggers.get('profileServiceLogger');
  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const mobileNumber = headers.mobilenumber;
      const profilesDb = getConnection();
      const doctorsDb = getConnection('doctors-db');
      const consultsDb = getConnection('consults-db');
      const currentPatient = null;
      const context: ProfilesServiceContext = {
        mobileNumber,
        profilesDb,
        doctorsDb,
        consultsDb,
        currentPatient,
      };
      return context;
    },
    schema: buildFederatedSchema([
      {
        typeDefs: gql`
          scalar Date
          scalar Time
          scalar DateTime
        `,
        resolvers: {
          Date: GraphQLDate,
          Time: GraphQLTime,
          DateTime: GraphQLDateTime,
        },
      },
      {
        typeDefs: getCurrentPatientsTypeDefs,
        resolvers: getCurrentPatientsResolvers,
      },
      {
        typeDefs: updatePatientTypeDefs,
        resolvers: updatePatientResolvers,
      },
      {
        typeDefs: getPatientTypeDefs,
        resolvers: getPatientResolvers,
      },
      {
        typeDefs: getPastSearchesTypeDefs,
        resolvers: getPastSearchesResolvers,
      },
      {
        typeDefs: getPatientPastSearchesTypeDefs,
        resolvers: getPatientPastSearchesResolvers,
      },
      {
        typeDefs: saveSearchTypeDefs,
        resolvers: saveSearchResolvers,
      },
      {
        typeDefs: addPatientAddressTypeDefs,
        resolvers: addPatientAddressResolvers,
      },
      {
        typeDefs: getDigitizedOrderTypeDefs,
        resolvers: getDigitizedOrderResolvers,
      },
      {
        typeDefs: saveDeviceTokenTypeDefs,
        resolvers: saveDeviceTokenResolvers,
      },
      {
        typeDefs: savePatientNotificationSettingsTypeDefs,
        resolvers: savePatientNotificationSettingsResolvers,
      },
      {
        typeDefs: getPatientNotificationSettingsTypeDefs,
        resolvers: getPatientNotificationSettingsResolvers,
      },
      {
        typeDefs: saveMedicineOrderTypeDefs,
        resolvers: saveMedicineOrderResolvers,
      },
      {
        typeDefs: savePrescriptionMedicineOrderTypeDefs,
        resolvers: savePrescriptionMedicineOrderResolvers,
      },
      {
        typeDefs: savePrescriptionMedicineOrderOMSTypeDefs,
        resolvers: savePrescriptionMedicineOrderOMSResolvers,
      },
      {
        typeDefs: saveMedicineOrderPaymentTypeDefs,
        resolvers: saveMedicineOrderPaymentResolvers,
      },
      {
        typeDefs: saveMedicineOrderPaymentMqTypeDefs,
        resolvers: saveMedicineOrderPaymentMqResolvers,
      },
      {
        typeDefs: getMedicineOrdersListTypeDefs,
        resolvers: getMedicineOrdersListResolvers,
      },
      {
        typeDefs: uploadFileTypeDefs,
        resolvers: uploadFileResolvers,
      },
      {
        typeDefs: uploadDocumentTypeDefs,
        resolvers: uploadDocumentResolvers,
      },
      {
        typeDefs: downloadDocumentsTypeDefs,
        resolvers: downloadDocumentsResolvers,
      },
      {
        typeDefs: addPatientMedicalRecordTypeDefs,
        resolvers: addPatientMedicalRecordResolvers,
      },
      {
        typeDefs: addPatientFeedbackTypeDefs,
        resolvers: addPatientFeedbackResolvers,
      },
      {
        typeDefs: deletePatientMedicalRecordTypeDefs,
        resolvers: deletePatientMedicalRecordResolvers,
      },
      {
        typeDefs: getPatientMedicalRecordsTypeDefs,
        resolvers: getPatientMedicalRecordsResolvers,
      },
      {
        typeDefs: getCouponsTypeDefs,
        resolvers: getCouponsResolvers,
      },
      {
        typeDefs: submitPrescriptionOrderTypeDefs,
        resolvers: submitPrescriptionOrderResolvers,
      },
      {
        typeDefs: updateOrderStatusTypeDefs,
        resolvers: updateOrderStatusResolvers,
      },
      {
        typeDefs: saveOrderShipmentInvoiceTypeDefs,
        resolvers: saveOrderShipmentInvoiceResolvers,
      },
      {
        typeDefs: saveOrderShipmentsTypeDefs,
        resolvers: saveOrderShipmentsResolvers,
      },
      {
        typeDefs: pharmaOrderConfirmationTypeDefs,
        resolvers: pharmaOrderConfirmationResolvers,
      },
      {
        typeDefs: pharmaOrderDeliveredTypeDefs,
        resolvers: pharmaOrderDeliveryResolvers,
      },
      {
        typeDefs: pharmaOrderPlacedTypeDefs,
        resolvers: pharmaOrderPlacedResolvers,
      },
      {
        typeDefs: pharmaOrderCancelledTypeDefs,
        resolvers: pharmaOrderCancelResolvers,
      },
      {
        typeDefs: medicineOrderCancelTypeDefs,
        resolvers: medicineOrderCancelResolvers,
      },
      {
        typeDefs: helpTypeDefs,
        resolvers: helpResolvers,
      },
      {
        typeDefs: patientLifeStyleTypeDefs,
        resolvers: patientLifeStyleResolvers,
      },
      {
        typeDefs: patientFamilyHistoryTypeDefs,
        resolvers: patientFamilyHistoryResolvers,
      },
      {
        typeDefs: saveMedicineOrderInvoiceTypeDefs,
        resolvers: saveMedicineOrderInvoiceResolvers,
      },
      {
        typeDefs: diagnosticsTypeDefs,
        resolvers: diagnosticsResolvers,
      },
      {
        typeDefs: saveDiagnosticOrderTypeDefs,
        resolvers: saveDiagnosticOrderResolvers,
      },
      {
        typeDefs: saveDiagnosticOrderPaymentTypeDefs,
        resolvers: saveDiagnosticOrderPaymentResolvers,
      },
      {
        typeDefs: cancelDiagnosticOrdersTypeDefs,
        resolvers: cancelDiagnosticOrdersResolvers,
      },
      {
        typeDefs: loginTypeDefs,
        resolvers: loginResolvers,
      },
      {
        typeDefs: verifyLoginOtpTypeDefs,
        resolvers: verifyLoginOtpResolvers,
      },
      {
        typeDefs: registerPatientsTypeDefs,
        resolvers: registerPatientsResolvers,
      },
    ]),
    plugins: [
      /* This plugin is defined in-line. */
      {
        serverWillStart() {
          profilesLogger.log('info', 'Server starting up!');
        },
        requestDidStart({ operationName, request }) {
          /* Within this returned object, define functions that respond
             to request-specific lifecycle events. */
          const reqStartTime = new Date();
          const reqStartTimeFormatted = format(reqStartTime, "yyyy-MM-dd'T'HH:mm:ss.SSSX");
          return {
            parsingDidStart(requestContext) {
              profilesLogger.log({
                message: 'Request Starting',
                time: reqStartTimeFormatted,
                operation: requestContext.request.query,
                level: 'info',
              });
            },
            didEncounterErrors(requestContext) {
              requestContext.errors.forEach((error) => {
                profilesLogger.log(
                  'error',
                  `Encountered Error at ${reqStartTimeFormatted}: `,
                  error
                );
              });
            },
            willSendResponse({ response }) {
              const errorCount = (response.errors || []).length;
              const responseLog = {
                message: 'Request Ended',
                time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
                durationInMilliSeconds: differenceInMilliseconds(new Date(), reqStartTime),
                errorCount,
                level: 'info',
                response: response,
              };
              //remove response if there is no error
              if (errorCount === 0) delete responseLog.response;
              profilesLogger.log(responseLog);
            },
          };
        },
      },
    ],
  });

  server.listen({ port: process.env.PROFILES_SERVICE_PORT }).then(({ url }) => {
    console.log(`🚀 profiles-service ready`);
  });
})();
