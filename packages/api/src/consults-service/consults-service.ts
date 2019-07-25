import 'reflect-metadata';
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import { ApolloServer } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';
import gql from 'graphql-tag';
import {
  getAvailableSlotsTypeDefs,
  getAvailableSlotsResolvers,
} from 'consults-service/resolvers/getDoctorAvailability';
import { GatewayContext } from 'api-gateway';

export interface ConsultServiceContext extends GatewayContext {}
(async () => {
  const server = new ApolloServer({
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
        typeDefs: getAvailableSlotsTypeDefs,
        resolvers: getAvailableSlotsResolvers,
      },
    ]),
  });

  server.listen({ port: 80 }).then(({ url }) => {
    console.log(`🚀 consults-service ready`);
  });
})();
