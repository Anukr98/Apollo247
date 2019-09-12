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
  saveMedicineOrderPaymentTypeDefs,
  saveMedicineOrderPaymentResolvers,
} from 'profiles-service/resolvers/saveMedicineOrderPayment';
import {
  getMedicineOrdersListTypeDefs,
  getMedicineOrdersListResolvers,
} from 'profiles-service/resolvers/getMedicineOrdersList';
import { uploadFileTypeDefs, uploadFileResolvers } from 'profiles-service/resolvers/uploadFile';
import {
  addPatientMedicalRecordTypeDefs,
  addPatientMedicalRecordResolvers,
} from 'profiles-service/resolvers/addMedicalRecord';
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
} from 'profiles-service/resolvers/updateOrderStatusPharma';
import {
  pharmaOrderConfirmationTypeDefs,
  pharmaOrderConfirmationResolvers,
} from 'profiles-service/resolvers/pharmaOrderConfirmation';
import {
  pharmaOrderDeliveredTypeDefs,
  pharmaOrderDeliveryResolvers,
} from 'profiles-service/resolvers/pharmaOrderDelivered';
import {
  pharmaOrderCancelledTypeDefs,
  pharmaOrderCancelResolvers,
} from 'profiles-service/resolvers/pharmaOrderCancelled';
import {
  medicineOrderCancelTypeDefs,
  medicineOrderCancelResolvers,
} from 'profiles-service/resolvers/cancelMedicineOrder';
import 'reflect-metadata';
import { getConnection } from 'typeorm';
import { helpTypeDefs, helpResolvers } from 'profiles-service/resolvers/help';

(async () => {
  await connect();

  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const firebaseUid = headers.firebaseuid;
      const mobileNumber = headers.mobilenumber;

      const profilesDb = getConnection();
      const doctorsDb = getConnection('doctors-db');
      const consultsDb = getConnection('consults-db');
      const currentPatient = null;
      const context: ProfilesServiceContext = {
        firebaseUid,
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
        typeDefs: saveMedicineOrderPaymentTypeDefs,
        resolvers: saveMedicineOrderPaymentResolvers,
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
        typeDefs: addPatientMedicalRecordTypeDefs,
        resolvers: addPatientMedicalRecordResolvers,
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
        typeDefs: pharmaOrderConfirmationTypeDefs,
        resolvers: pharmaOrderConfirmationResolvers,
      },
      {
        typeDefs: pharmaOrderDeliveredTypeDefs,
        resolvers: pharmaOrderDeliveryResolvers,
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
    ]),
  });

  server.listen({ port: process.env.PROFILES_SERVICE_PORT }).then(({ url }) => {
    console.log(`🚀 profiles-service ready`);
  });
})();
