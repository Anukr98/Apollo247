import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import { doctorTypeDefs, doctorResolvers } from 'doctors-service/resolvers/doctorResolvers';
import {
  starDoctorTypeDefs,
  starDoctorResolvers,
} from 'doctors-service/resolvers/starDoctorProgramResolver';
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

export interface DoctorsServiceContext extends GatewayContext {}

export type Resolver<Parent = any, Args = any> = (
  parent: Parent,
  args: Args,
  context: DoctorsServiceContext
) => any;

(async () => {
  const server = new ApolloServer({
    schema: buildFederatedSchema([
      {
        typeDefs: doctorTypeDefs,
        resolvers: doctorResolvers,
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
        typeDefs: getSpecialtyDoctorsTypeDefs,
        resolvers: getSpecialtyDoctorsResolvers,
      },
    ]),
  });

  server.listen({ port: 80 }).then(({ url }) => {
    console.log(`🚀 doctors-service ready`);
  });
})();
