import '@aph/universal/dist/global';
import { buildFederatedSchema } from '@apollo/federation';
import { ApolloServer } from 'apollo-server';
import 'reflect-metadata';
import gql from 'graphql-tag';
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';
import {
  getNotificationsTypeDefs,
  getNotificationsResolvers,
} from 'notifications-service/resolvers/notifications';
import { GatewayHeaders } from 'api-gateway';
import { getConnection } from 'typeorm';
import { NotificationsServiceContext } from 'notifications-service/NotificationsServiceContext';
import { connect } from 'notifications-service/database/connect';
import { emailTypeDefs, emailResolvers } from 'notifications-service/resolvers/email';
import { format, differenceInMilliseconds } from 'date-fns';
import { winstonLogger } from 'customWinstonLogger';
import {
  notificationBinTypeDefs,
  notificationBinResolvers,
} from 'notifications-service/resolvers/notificationBin';

(async () => {
  await connect();

  const notificationLogger = winstonLogger.loggers.get('notificationServiceLogger');

  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const mobileNumber = headers.mobilenumber;
      const consultsDb = getConnection();
      const doctorsDb = getConnection('doctors-db');
      const patientsDb = getConnection('patients-db');
      const context: NotificationsServiceContext = {
        mobileNumber,
        doctorsDb,
        consultsDb,
        patientsDb,
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
        typeDefs: getNotificationsTypeDefs,
        resolvers: getNotificationsResolvers,
      },
      {
        typeDefs: emailTypeDefs,
        resolvers: emailResolvers,
      },
      {
        typeDefs: notificationBinTypeDefs,
        resolvers: notificationBinResolvers,
      },
    ]),
    plugins: [
      /* This plugin is defined in-line. */
      {
        serverWillStart() {
          notificationLogger.log('info', 'Server starting up!');
        },
        requestDidStart({ operationName, request }) {
          /* Within this returned object, define functions that respond
             to request-specific lifecycle events. */
          const reqStartTime = new Date();
          const reqStartTimeFormatted = format(reqStartTime, "yyyy-MM-dd'T'HH:mm:ss.SSSX");
          return {
            parsingDidStart(requestContext) {
              notificationLogger.log({
                message: 'Request Starting',
                time: reqStartTimeFormatted,
                operation: requestContext.request.query,
                level: 'info',
              });
            },
            didEncounterErrors(requestContext) {
              requestContext.errors.forEach((error) => {
                notificationLogger.log(
                  'error',
                  `Encountered Error at ${reqStartTimeFormatted}: `,
                  error
                );
              });
            },
            willSendResponse({ response }) {
              const errorCount = (response.errors || []).length;
              const responseLog = {
                message: 'Request Ended',
                time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
                durationInMilliSeconds: differenceInMilliseconds(new Date(), reqStartTime),
                errorCount,
                level: 'info',
                response: response,
              };
              //remove response if there is no error
              if (errorCount === 0) delete responseLog.response;
              notificationLogger.log(responseLog);
            },
          };
        },
      },
    ],
  });

  server.listen({ port: process.env.NOTIFICATIONS_SERVICE_PORT }).then(({ url }) => {
    console.log(`🚀 notifications-service ready`);
  });
})();
