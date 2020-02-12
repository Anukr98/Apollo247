import '@aph/universal/dist/global';
import { buildFederatedSchema } from '@apollo/federation';
import { GatewayHeaders } from 'api-gateway';
import { ApolloServer } from 'apollo-server';
import { CouponServiceContext } from 'coupons-service/couponServiceContext';
import { connect } from 'consults-service/database/connect';
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';
import gql from 'graphql-tag';
import 'reflect-metadata';
import { getConnection } from 'typeorm';
import { format, differenceInMilliseconds } from 'date-fns';
import { winstonLogger } from 'customWinstonLogger';

(async () => {
  await connect();

  const consultsLogger = winstonLogger.loggers.get('consultServiceLogger');

  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const mobileNumber = headers.mobilenumber;
      const consultsDb = getConnection();
      const doctorsDb = getConnection('doctors-db');
      const patientsDb = getConnection('patients-db');
      const context: CouponServiceContext = {
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
    ]),
    plugins: [
      /* This plugin is defined in-line. */
      {
        serverWillStart() {
          consultsLogger.log('info', 'Server starting up!');
        },
        requestDidStart({ operationName, request }) {
          /* Within this returned object, define functions that respond
             to request-specific lifecycle events. */
          const reqStartTime = new Date();
          const reqStartTimeFormatted = format(reqStartTime, "yyyy-MM-dd'T'HH:mm:ss.SSSX");
          return {
            parsingDidStart(requestContext) {
              consultsLogger.log({
                message: 'Request Starting',
                time: reqStartTimeFormatted,
                operation: requestContext.request.query,
                level: 'info',
              });
            },
            didEncounterErrors(requestContext) {
              requestContext.errors.forEach((error) => {
                consultsLogger.log(
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
              consultsLogger.log(responseLog);
            },
          };
        },
      },
    ],
  });

  server.listen({ port: process.env.COUPONS_SERVICE_PORT }).then(({ url }) => {
    console.log(`🚀 coupons-service ready`);
  });
})();
