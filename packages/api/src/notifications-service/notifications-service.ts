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
//import { AppointmentPayload, SampleMessage } from 'types/appointmentTypes';
//import { bookAppointmentApollo } from 'notifications-service/bookAppointmentApollo';
import { GatewayHeaders } from 'api-gateway';
import { getConnection } from 'typeorm';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import { connect } from 'notifications-service/database/connect';
//import fetch from 'node-fetch';

(async () => {
  await connect();
  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const firebaseUid = headers.firebaseuid;
      const mobileNumber = headers.mobilenumber;
      const consultsDb = getConnection();
      const doctorsDb = getConnection('doctors-db');
      const patientsDb = getConnection('patients-db');
      const context: NotificationsServiceContext = {
        firebaseUid,
        mobileNumber,
        doctorsDb,
        consultsDb,
        patientsDb,
      };
      return context;
    },
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

  AphMqClient.onReceive<TestMessage>(AphMqMessageTypes.TESTRECEIVER, (receivedMessage) => {
    console.log('received message!', receivedMessage.message);
    console.log('accepting message hello');
    const message = new Date().toISOString();
    const payload: SampleMessage = { message };
    type TestMessage1 = AphMqMessage<AphMqMessageTypes.TESTRECEIVER, SampleMessage>;
    const testMessage: TestMessage1 = {
      type: AphMqMessageTypes.TESTRECEIVER,
      payload,
    };
    AphMqClient.send(testMessage);
    console.log('send test reciver');
    receivedMessage.accept();
  });

  AphMqClient.onReceive<TestMessage>(AphMqMessageTypes.BOOKAPPOINTMENT, (receivedMessage) => {
    console.log('received message!', receivedMessage.message);
    console.log('accepting message');
    //SendMail.send(receivedMessage.message);
    bookAppointmentApollo.book(receivedMessage.message);
    receivedMessage.accept();
  });

  const resp = await fetch(
    'http://bulkpush.mytoday.com/BulkSms/SingleMsgApi?feedid=370454&username=7993961498&password=popcorn123$$&To=8019677178&Text=Hellocheck'
  );
  console.log(resp, 'sms resp');

  const resp1 = await fetch(
    'http://bulkpush.mytoday.com/BulkSms/SingleMsgApi?feedid=370454&username=7993961498&password=popcorn123$$&To=9657585411&Text=Hellocheck'
  );
  console.log(resp1, 'sms resp');*/
})();
