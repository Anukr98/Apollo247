import '@aph/universal/dist/global';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { doctorTypeDefs, doctorResolvers } from 'doctors-service/resolvers/getDoctors';
import {
  starDoctorTypeDefs,
  starDoctorProgramResolvers,
} from 'doctors-service/resolvers/starDoctorProgram';
import {
  getSpecialtyTypeDefs,
  getSpecialtyResolvers,
} from 'doctors-service/resolvers/getSpecialties';
import {
  getAllSpecialtiesTypeDefs,
  getAllSpecialtiesResolvers,
} from 'doctors-service/resolvers/getAllSpecialties';
import {
  searchDoctorAndSpecialtyTypeDefs,
  searchDoctorAndSpecialtyResolvers,
} from 'doctors-service/resolvers/searchDoctorAndSpecialty';
import {
  getSpecialtyDoctorsTypeDefs,
  getSpecialtyDoctorsResolvers,
} from 'doctors-service/resolvers/getSpecialtyDoctorsWithFilters';
import {
  getDoctorDetailsTypeDefs,
  getDoctorDetailsResolvers,
} from 'doctors-service/resolvers/getDoctorDetails';

import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';

import { starTeamTypeDefs, starTeamResolvers } from 'doctors-service/resolvers/starTeam';

import gql from 'graphql-tag';
import { GraphQLTime } from 'graphql-iso-date';
import { createConnection, getConnection } from 'typeorm';
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
import { GatewayHeaders } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';

(async () => {
  await createConnection({
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
  }).catch((error) => {
    throw new Error(error);
  });

  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const firebaseUid = headers.firebaseuid;
      const mobileNumber = headers.mobilenumber;
      const doctorsDb = getConnection('doctors-db');

      const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
      const doctordata = (await doctorRepository.getDoctorDetails(firebaseUid)) as Doctor;
      const currentUser = doctordata;

      const context: DoctorsServiceContext = {
        firebaseUid,
        mobileNumber,
        doctorsDb,
        currentUser,
      };
      return context;
    },
    schema: buildFederatedSchema([
      {
        typeDefs: gql`
          scalar Time
        `,
        resolvers: {
          Time: GraphQLTime,
        },
      },
      {
        typeDefs: doctorTypeDefs,
        resolvers: doctorResolvers,
      },
      {
        typeDefs: getSpecialtyDoctorsTypeDefs,
        resolvers: getSpecialtyDoctorsResolvers,
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
    ]),
  });

  server.listen({ port: 80 }).then(({ url }) => {
    console.log(`🚀 doctors-service ready`);
  });
})();
