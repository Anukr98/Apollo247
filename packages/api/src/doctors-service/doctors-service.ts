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
  searchDoctorAndSpecialtyTypeDefs,
  searchDoctorAndSpecialtyResolvers,
} from 'doctors-service/resolvers/searchDoctorAndSpecialty';
import {
  getSpecialtyDoctorsTypeDefs,
  getSpecialtyDoctorsResolvers,
} from 'doctors-service/resolvers/getSpecialtyDoctorsWithFilters';

import { GatewayContext } from 'api-gateway';
import gql from 'graphql-tag';
import { GraphQLTime } from 'graphql-iso-date';
import { createConnection } from 'typeorm';
import { Doctor } from 'doctors-service/entity/doctor';
import { DoctorSpeciality } from 'doctors-service/entity/doctorSpeciality';

export interface DoctorsServiceContext extends GatewayContext {}

export type Resolver<Parent = any, Args = any> = (
  parent: Parent,
  args: Args,
  context: DoctorsServiceContext
) => any;

(async () => {
  await createConnection({
    entities: [Doctor, DoctorSpeciality],
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
        typeDefs: searchDoctorAndSpecialtyTypeDefs,
        resolvers: searchDoctorAndSpecialtyResolvers,
      },
      {
        typeDefs: starDoctorTypeDefs,
        resolvers: starDoctorProgramResolvers,
      },
    ]),
  });

  server.listen({ port: 80 }).then(({ url }) => {
    console.log(`🚀 doctors-service ready`);
  });
})();
