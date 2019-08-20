import '@aph/universal/dist/global';
import 'reflect-metadata';
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { createConnections, getConnection } from 'typeorm';
import { Patient, SearchHistory, PatientAddress } from 'profiles-service/entities';
import {
  Doctor,
  DoctorSpecialty,
  StarTeam,
  DoctorAndHospital,
  Facility,
  ConsultHours,
  DoctorBankAccounts,
  Packages,
} from 'doctors-service/entities';
import {
  getCurrentPatientsTypeDefs,
  getCurrentPatientsResolvers,
} from 'profiles-service/resolvers/getCurrentPatients';
import {
  updatePatientTypeDefs,
  updatePatientResolvers,
} from 'profiles-service/resolvers/updatePatient';
import { getPatientTypeDefs, getPatientResolvers } from 'profiles-service/resolvers/getPatients';
import { saveSearchTypeDefs, saveSearchResolvers } from 'profiles-service/resolvers/saveSearch';
import {
  getPastSearchesTypeDefs,
  getPastSearchesResolvers,
} from 'profiles-service/resolvers/getPastSearches';
import {
  getPatientPastSearchesTypeDefs,
  getPatientPastSearchesResolvers,
} from 'profiles-service/resolvers/getPatientPastSearches';
import {
  addPatientAddressTypeDefs,
  addPatientAddressResolvers,
} from 'profiles-service/resolvers/patientAddress';
import gql from 'graphql-tag';
import { GatewayHeaders } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';

(async () => {
  await createConnections([
    {
      entities: [Patient, SearchHistory, PatientAddress],
      type: 'postgres',
      host: process.env.PROFILES_DB_HOST,
      port: parseInt(process.env.PROFILES_DB_PORT, 10),
      username: process.env.PROFILES_DB_USER,
      password: process.env.PROFILES_DB_PASSWORD,
      database: `profiles_${process.env.NODE_ENV}`,
      logging: true,
      synchronize: true,
    },
    {
      name: 'doctors-db',
      entities: [
        Doctor,
        DoctorSpecialty,
        StarTeam,
        DoctorAndHospital,
        Facility,
        ConsultHours,
        DoctorBankAccounts,
        Packages,
      ],
      type: 'postgres',
      host: process.env.DOCTORS_DB_HOST,
      port: parseInt(process.env.DOCTORS_DB_PORT, 10),
      username: process.env.DOCTORS_DB_USER,
      password: process.env.DOCTORS_DB_PASSWORD,
      database: `doctors_${process.env.NODE_ENV}`,
      logging: true,
      synchronize: true,
    },
  ]).catch((error) => {
    throw new Error(error);
  });

  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const firebaseUid = headers.firebaseuid;
      const mobileNumber = headers.mobilenumber;

      const profilesDb = getConnection();
      const doctorsDb = getConnection('doctors-db');
      const currentPatient = null;
      const context: ProfilesServiceContext = {
        firebaseUid,
        mobileNumber,
        profilesDb,
        doctorsDb,
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
    ]),
  });

  server.listen({ port: 80 }).then(({ url }) => {
    console.log(`🚀 profiles-service ready`);
  });
})();
