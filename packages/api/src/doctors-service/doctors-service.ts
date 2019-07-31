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

import { GatewayContext, GatewayHeaders } from 'api-gateway';
import gql from 'graphql-tag';
import { GraphQLTime } from 'graphql-iso-date';
import { createConnection } from 'typeorm';
import { Doctor } from 'doctors-service/entity/doctor';
import { DoctorSpecialty } from 'doctors-service/entity/doctorSpecialty';
import { StarTeam } from 'doctors-service/entity/starTeam';
import { DoctorAndHospital } from 'doctors-service/entity/doctorAndHospital';
import { Facility } from 'doctors-service/entity/facility';
import { ConsultHours } from 'doctors-service/entity/consultHours';
import { DoctorBankAccounts } from 'doctors-service/entity/doctorBankAccounts';
import { Packages } from 'doctors-service/entity/packages';

export interface DoctorsServiceContext extends GatewayContext {}

(async () => {
  await createConnection({
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
    host: 'doctors-db',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
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
      const context: DoctorsServiceContext = { firebaseUid, mobileNumber };
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
    ]),
  });

  server.listen({ port: 80 }).then(({ url }) => {
    console.log(`🚀 doctors-service ready`);
  });
})();
