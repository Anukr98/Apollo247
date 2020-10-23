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
  paymentStatusTypeDefs,
  paymentStatusResolvers,
} from 'profiles-service/resolvers/pharmaPaymentStatus';
import {
  refundOrderTypeDefs,
  refundInitResolver,
} from 'profiles-service/resolvers/pharmaOrderRefund';
import {
  saveMedicineOrderOMSTypeDefs,
  saveMedicineOrderOMSResolvers,
} from 'profiles-service/resolvers/saveMedicineOrdersOMS';
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
  getMedicineOrdersOMSListTypeDefs,
  getMedicineOrdersOMSListResolvers,
} from 'profiles-service/resolvers/getMedicineOrdersOMSList';
import { oneApolloTypeDefs, oneApolloResolvers } from 'profiles-service/resolvers/oneApollo';
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
import { uhidTypeDefs, uhidResolvers } from 'profiles-service/resolvers/uhid';
import {
  updateOrderStatusTypeDefs,
  updateOrderStatusResolvers,
} from 'profiles-service/resolvers/pharmaUpdateOrderStatus';
import {
  saveOrderShipmentsTypeDefs,
  saveOrderShipmentsResolvers,
} from 'profiles-service/resolvers/pharmaOrderShipmentsCreated';
import {
  saveOrderShipmentInvoiceTypeDefs,
  saveOrderShipmentInvoiceResolvers,
} from 'profiles-service/resolvers/pharmaOrderBilled';
import {
  saveOrderVerifiedTypeDefs,
  saveOrderVerifiedResolvers,
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
  medicineOrderCancelOMSTypeDefs,
  medicineOrderCancelOMSResolvers,
} from 'profiles-service/resolvers/cancelMedicineOrderOMS';
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
import {
  cancelDiagnosticOrdersTypeDefs,
  cancelDiagnosticOrdersResolvers,
} from 'profiles-service/resolvers/cancelDiagnosticOrders';
import { loginTypeDefs, loginResolvers } from 'profiles-service/resolvers/login';
import {
  verifyLoginOtpTypeDefs,
  verifyLoginOtpResolvers,
} from 'profiles-service/resolvers/verifyLoginOtp';
import {
  getMedicineOrderCancelReasonsTypeDefs,
  getMedicineOrderCancelReasonsResolvers,
} from 'profiles-service/resolvers/getMedicineOrderCancelReasons';
import {
  reUploadPrescriptionTypeDefs,
  reUploadPrescriptionResolvers,
} from 'profiles-service/resolvers/reUploadPrescription';

import 'reflect-metadata';
import { getConnection } from 'typeorm';
import { helpTypeDefs, helpResolvers } from 'profiles-service/resolvers/help';
import { format, differenceInMilliseconds } from 'date-fns';
import { winstonLogger } from 'customWinstonLogger';
import {
  registerPatientsTypeDefs,
  registerPatientsResolvers,
} from 'profiles-service/resolvers/registerPatients';
import {
  pharmaOrdersTypeDefs,
  pharmacyOrdersResolvers,
} from 'profiles-service/resolvers/pharmacyOrders';
import {
  savePharmacologistConsultResolvers,
  savePharmacologistConsultTypeDefs,
} from 'profiles-service/resolvers/savePharmacologistConsult';
import {
  createPatientTypeDefs,
  createPatientResolvers,
} from 'profiles-service/resolvers/createPatient';
import {
  labResultsUploadTypeDefs,
  labResultsUploadResolvers,
} from 'profiles-service/resolvers/labResultsUpload';

import {
  prescriptionUploadTypeDefs,
  prescriptionUploadResolvers,
} from 'profiles-service/resolvers/prescriptionUpload';

import {
  alertMedicineOrderPickupTypeDefs,
  alertMedicineOrderPickupResolvers,
} from 'profiles-service/resolvers/alertMedicineOrderPickup';

import {
  patientDeviceVoipTokenTypeDefs,
  patientDeviceVoipTokenResolvers,
} from 'profiles-service/resolvers/savepatientDeviceVoipToken';
import {
  validateHDFCCustomerTypeDefs,
  validateHDFCCustomer,
} from 'profiles-service/resolvers/hdfcCustomerValidation';

import {
  addPatientHealthCheckRecordTypeDefs,
  addPatientHealthCheckRecordsResolvers,
} from 'profiles-service/resolvers/addHealthCheckRecords';

import {
  addPatientHospitalizationRecordTypeDefs,
  addPatientHospitalizationRecordResolvers,
} from 'profiles-service/resolvers/addHospitalizationRecords';

import {
  addPatientPrescriptionRecordsTypeDefs,
  addPatientPrescriptionRecordResolvers,
} from 'profiles-service/resolvers/addPrescriptionRecords';

import {
  addPatientLabTestRecordTypeDefs,
  addPatientLabTestRecordResolvers,
} from 'profiles-service/resolvers/addLabTestRecords';

import {
  updateOrderOnHoldTypeDefs,
  updateOrderOnHoldResolvers,
} from 'profiles-service/resolvers/pharmaOrderOnHold';

import {
  orderReturnPostDeliveryTypeDefs,
  orderReturnPostDeliveryResolvers,
} from 'profiles-service/resolvers/pharmaOrderReturnPostDelivery';

import {
  orderReturnedTypeDefs,
  orderReturnedResolvers,
} from 'profiles-service/resolvers/pharmaOrderReturnPreDelivery';

import {
  deletePatientPrismMedicalRecordTypeDefs,
  deletePatientPrismMedicalRecordResolvers,
} from 'profiles-service/resolvers/deletePatientPrismMedicalRecord';

import {
  updateOrderDspTypeDefs,
  updateOrderDspResolvers,
} from 'profiles-service/resolvers/pharmaOrderUpdateDsp';

import {
  orderDspStatusTypeDefs,
  orderDspStatusResolvers,
} from 'profiles-service/resolvers/pharmaOrderDspStatus';

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
        headers: headers,
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
        typeDefs: paymentStatusTypeDefs,
        resolvers: paymentStatusResolvers,
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
        typeDefs: getMedicineOrdersOMSListTypeDefs,
        resolvers: getMedicineOrdersOMSListResolvers,
      },
      {
        typeDefs: saveMedicineOrderOMSTypeDefs,
        resolvers: saveMedicineOrderOMSResolvers,
      },
      {
        typeDefs: savePrescriptionMedicineOrderOMSTypeDefs,
        resolvers: savePrescriptionMedicineOrderOMSResolvers,
      },
      {
        typeDefs: oneApolloTypeDefs,
        resolvers: oneApolloResolvers,
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
        typeDefs: uhidTypeDefs,
        resolvers: uhidResolvers,
      },
      {
        typeDefs: refundOrderTypeDefs,
        resolvers: refundInitResolver,
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
        typeDefs: medicineOrderCancelOMSTypeDefs,
        resolvers: medicineOrderCancelOMSResolvers,
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
      {
        typeDefs: pharmaOrdersTypeDefs,
        resolvers: pharmacyOrdersResolvers,
      },
      {
        typeDefs: getMedicineOrderCancelReasonsTypeDefs,
        resolvers: getMedicineOrderCancelReasonsResolvers,
      },
      {
        typeDefs: savePharmacologistConsultTypeDefs,
        resolvers: savePharmacologistConsultResolvers,
      },
      {
        typeDefs: createPatientTypeDefs,
        resolvers: createPatientResolvers,
      },
      {
        typeDefs: labResultsUploadTypeDefs,
        resolvers: labResultsUploadResolvers,
      },
      {
        typeDefs: prescriptionUploadTypeDefs,
        resolvers: prescriptionUploadResolvers,
      },
      {
        typeDefs: alertMedicineOrderPickupTypeDefs,
        resolvers: alertMedicineOrderPickupResolvers,
      },
      {
        typeDefs: patientDeviceVoipTokenTypeDefs,
        resolvers: patientDeviceVoipTokenResolvers,
      },
      {
        typeDefs: validateHDFCCustomerTypeDefs,
        resolvers: validateHDFCCustomer,
      },
      {
        typeDefs: addPatientHealthCheckRecordTypeDefs,
        resolvers: addPatientHealthCheckRecordsResolvers,
      },
      {
        typeDefs: addPatientHospitalizationRecordTypeDefs,
        resolvers: addPatientHospitalizationRecordResolvers,
      },
      {
        typeDefs: addPatientLabTestRecordTypeDefs,
        resolvers: addPatientLabTestRecordResolvers,
      },
      {
        typeDefs: saveOrderVerifiedTypeDefs,
        resolvers: saveOrderVerifiedResolvers,
      },
      {
        typeDefs: updateOrderOnHoldTypeDefs,
        resolvers: updateOrderOnHoldResolvers,
      },
      {
        typeDefs: orderReturnPostDeliveryTypeDefs,
        resolvers: orderReturnPostDeliveryResolvers,
      },
      {
        typeDefs: orderReturnedTypeDefs,
        resolvers: orderReturnedResolvers,
      },
      {
        typeDefs: addPatientPrescriptionRecordsTypeDefs,
        resolvers: addPatientPrescriptionRecordResolvers,
      },
      {
        typeDefs: deletePatientPrismMedicalRecordTypeDefs,
        resolvers: deletePatientPrismMedicalRecordResolvers,
      },
      {
        typeDefs: reUploadPrescriptionTypeDefs,
        resolvers: reUploadPrescriptionResolvers,
      },
      {
        typeDefs: updateOrderDspTypeDefs,
        resolvers: updateOrderDspResolvers,
      },
      {
        typeDefs: orderDspStatusTypeDefs,
        resolvers: orderDspStatusResolvers,
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
    console.log(`🚀 profiles-service ready`, url);
  });
})();
