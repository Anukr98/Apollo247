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

import {
  getNotificationsTypeDefs,
  getNotificationsResolvers,
} from 'notifications-service/resolvers/notifications';
//import { AphMqClient, AphMqMessage, AphMqMessageTypes } from 'AphMqClient';
//import { AppointmentPayload } from 'types/appointmentTypes';
//import { bookAppointmentApollo } from 'notifications-service/bookAppointmentApollo';
import { connect } from 'consults-service/database/connect';
//import fetch from 'node-fetch';

(async () => {
  await connect();
  const server = new ApolloServer({
    schema: buildFederatedSchema([
      {
        typeDefs: getSearchesTypeDefs,
        resolvers: getSearchesResolvers,
      },
      {
        typeDefs: getNotificationsTypeDefs,
        resolvers: getNotificationsResolvers,
      },
    ]),
  });

  server.listen({ port: process.env.NOTIFICATIONS_SERVICE_PORT }).then(({ url }) => {
    console.log(`🚀 notifications-service ready`);
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

  /*const resp = await fetch(
    'http://bulkpush.mytoday.com/BulkSms/SingleMsgApi?feedid=370454&username=7993961498&password=popcorn123$$&To=8019677178&Text=Hellocheck'
  );
  console.log(resp, 'sms resp');

  const resp1 = await fetch(
    'http://bulkpush.mytoday.com/BulkSms/SingleMsgApi?feedid=370454&username=7993961498&password=popcorn123$$&To=9657585411&Text=Hellocheck'
  );
  console.log(resp1, 'sms resp');*/
})();
