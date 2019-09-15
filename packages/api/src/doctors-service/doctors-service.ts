import '@aph/universal/dist/global';
import { buildFederatedSchema } from '@apollo/federation';
import { GatewayHeaders } from 'api-gateway';
import { ApolloServer } from 'apollo-server';
import { connect } from 'doctors-service/database/connect';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor } from 'doctors-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import {
  delegateFunctionsResolvers,
  delegateFunctionsTypeDefs,
} from 'doctors-service/resolvers/delegateFunctions';
import {
  getAllSpecialtiesResolvers,
  getAllSpecialtiesTypeDefs,
} from 'doctors-service/resolvers/getAllSpecialties';
import {
  getDoctorDetailsResolvers,
  getDoctorDetailsTypeDefs,
} from 'doctors-service/resolvers/getDoctorDetails';
import { doctorResolvers, doctorTypeDefs } from 'doctors-service/resolvers/getDoctors';
import {
  getDoctorsBySpecialtyAndFiltersTypeDefs,
  getDoctorsBySpecialtyAndFiltersTypeDefsResolvers,
} from 'doctors-service/resolvers/getDoctorsBySpecialtyAndFilters';
import {
  getSpecialtyResolvers,
  getSpecialtyTypeDefs,
} from 'doctors-service/resolvers/getSpecialties';
import {
  getSpecialtyDoctorsResolvers,
  getSpecialtyDoctorsTypeDefs,
} from 'doctors-service/resolvers/getSpecialtyDoctorsWithFilters';
import {
  searchDoctorAndSpecialtyResolvers,
  searchDoctorAndSpecialtyTypeDefs,
} from 'doctors-service/resolvers/searchDoctorAndSpecialty';
import {
  searchDoctorAndSpecialtyByNameResolvers,
  searchDoctorAndSpecialtyByNameTypeDefs,
} from 'doctors-service/resolvers/searchDoctorAndSpecialtyByName';
import {
  starDoctorProgramResolvers,
  starDoctorTypeDefs,
} from 'doctors-service/resolvers/starDoctorProgram';
import { starTeamResolvers, starTeamTypeDefs } from 'doctors-service/resolvers/starTeam';
import {
  saveDoctorDeviceTokenTypeDefs,
  saveDoctorDeviceTokenResolvers,
} from 'doctors-service/resolvers/saveDoctorDeviceToken';
import { GraphQLTime, GraphQLDate } from 'graphql-iso-date';
import gql from 'graphql-tag';
import 'reflect-metadata';
import { getConnection } from 'typeorm';
import {
  doctorOnlineStatusTypeDefs,
  doctorOnlineStatusResolvers,
} from 'doctors-service/resolvers/doctorOnlineStatus';
import { doctorDataTypeDefs, doctorDataResolvers } from 'doctors-service/resolvers/doctorData';

(async () => {
  await connect();

  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const firebaseUid = headers.firebaseuid;
      const mobileNumber = headers.mobilenumber;
      const doctorsDb = getConnection();
      const consultsDb = getConnection('consults-db');

      const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
      const doctordata = (await doctorRepository.getDoctorDetails(firebaseUid)) as Doctor;
      const currentUser = doctordata;

      const context: DoctorsServiceContext = {
        firebaseUid,
        mobileNumber,
        doctorsDb,
        consultsDb,
        currentUser,
      };
      return context;
    },
    schema: buildFederatedSchema([
      {
        typeDefs: gql`
          scalar Date
          scalar Time
        `,
        resolvers: {
          Date: GraphQLDate,
          Time: GraphQLTime,
        },
      },
      {
        typeDefs: doctorTypeDefs,
        resolvers: doctorResolvers,
      },
      {
        typeDefs: delegateFunctionsTypeDefs,
        resolvers: delegateFunctionsResolvers,
      },
      {
        typeDefs: getSpecialtyDoctorsTypeDefs,
        resolvers: getSpecialtyDoctorsResolvers,
      },
      {
        typeDefs: getDoctorsBySpecialtyAndFiltersTypeDefs,
        resolvers: getDoctorsBySpecialtyAndFiltersTypeDefsResolvers,
      },
      {
        typeDefs: getSpecialtyTypeDefs,
        resolvers: getSpecialtyResolvers,
      },
      {
        typeDefs: getAllSpecialtiesTypeDefs,
        resolvers: getAllSpecialtiesResolvers,
      },
      {
        typeDefs: searchDoctorAndSpecialtyTypeDefs,
        resolvers: searchDoctorAndSpecialtyResolvers,
      },
      {
        typeDefs: searchDoctorAndSpecialtyByNameTypeDefs,
        resolvers: searchDoctorAndSpecialtyByNameResolvers,
      },
      {
        typeDefs: starDoctorTypeDefs,
        resolvers: starDoctorProgramResolvers,
      },
      {
        typeDefs: getDoctorDetailsTypeDefs,
        resolvers: getDoctorDetailsResolvers,
      },
      {
        typeDefs: starTeamTypeDefs,
        resolvers: starTeamResolvers,
      },
      {
        typeDefs: saveDoctorDeviceTokenTypeDefs,
        resolvers: saveDoctorDeviceTokenResolvers,
      },
      {
        typeDefs: doctorOnlineStatusTypeDefs,
        resolvers: doctorOnlineStatusResolvers,
      },
      {
        typeDefs: doctorDataTypeDefs,
        resolvers: doctorDataResolvers,
      },
    ]),
  });

  server.listen({ port: process.env.DOCTORS_SERVICE_PORT }).then(({ url }) => {
    console.log(`🚀 doctors-service ready`);
  });
})();
