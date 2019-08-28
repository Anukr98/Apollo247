import '@aph/universal/dist/global';
import { buildFederatedSchema } from '@apollo/federation';
//import { GatewayHeaders } from 'api-gateway';
import { ApolloServer } from 'apollo-server';
//import gql from 'graphql-tag';
import 'reflect-metadata';
import {
  getSearchesTypeDefs,
  getSearchesResolvers,
} from 'notifications-service/resolvers/getSearches';
//import { AphMqClient, AphMqMessage, AphMqMessageTypes } from 'AphMqClient';
//import { AppointmentPayload } from 'types/appointmentTypes';
//import { bookAppointmentApollo } from 'notifications-service/bookAppointmentApollo';
import { connect } from 'consults-service/database/connect';

(async () => {
  await connect();
  const server = new ApolloServer({
    schema: buildFederatedSchema([
      {
        typeDefs: getSearchesTypeDefs,
        resolvers: getSearchesResolvers,
      },
    ]),
  });

  server.listen({ port: process.env.NOTIFICATIONS_SERVICE_PORT }).then(({ url }) => {
    console.log(`🚀 notifications-service ready (internal url: ${url})`);
  });

  /*AphMqClient.connect();

  type TestMessage = AphMqMessage<AphMqMessageTypes.BOOKAPPOINTMENT, AppointmentPayload>;

  AphMqClient.onReceive<TestMessage>(AphMqMessageTypes.BOOKAPPOINTMENT, (receivedMessage) => {
    console.log('received message!', receivedMessage.message);
    console.log('accepting message');
    //SendMail.send(receivedMessage.message);
    bookAppointmentApollo.book(receivedMessage.message);
    receivedMessage.accept();
  });*/
})();
