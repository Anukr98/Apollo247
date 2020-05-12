import '@aph/universal/dist/global';
import { buildFederatedSchema } from '@apollo/federation';
import { ApolloServer } from 'apollo-server';
import 'reflect-metadata';
import {
  validateConsultCouponTypeDefs,
  validateConsultCouponResolvers,
} from 'coupons-service/resolvers/validateConsultCoupon';
import { GatewayHeaders } from 'api-gateway';
import { getConnection } from 'typeorm';
import { CouponServiceContext } from 'coupons-service/couponServiceContext';
import { connect } from 'coupons-service/database/connect';

import { format, differenceInMilliseconds } from 'date-fns';
import { winstonLogger } from 'customWinstonLogger';
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import gql from 'graphql-tag';
import {
  validatePharmaCouponTypeDefs,
  validatePharmaCouponResolvers,
} from 'coupons-service/resolvers/validatePharmaCoupon';
//import fetch from 'node-fetch';

(async () => {
  await connect();

  const couponLogger = winstonLogger.loggers.get('couponServiceLogger');

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
      {
        typeDefs: validateConsultCouponTypeDefs,
        resolvers: validateConsultCouponResolvers,
      },
      {
        typeDefs: validatePharmaCouponTypeDefs,
        resolvers: validatePharmaCouponResolvers,
      },
    ]),
    plugins: [
      /* This plugin is defined in-line. */
      {
        serverWillStart() {
          couponLogger.log('info', 'Server starting up!');
        },
        requestDidStart({ operationName, request }) {
          /* Within this returned object, define functions that respond
             to request-specific lifecycle events. */
          const reqStartTime = new Date();
          const reqStartTimeFormatted = format(reqStartTime, "yyyy-MM-dd'T'HH:mm:ss.SSSX");
          return {
            parsingDidStart(requestContext) {
              couponLogger.log({
                message: 'Request Starting',
                time: reqStartTimeFormatted,
                operation: requestContext.request.query,
                level: 'info',
              });
            },
            didEncounterErrors(requestContext) {
              requestContext.errors.forEach((error) => {
                couponLogger.log('error', `Encountered Error at ${reqStartTimeFormatted}: `, error);
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
              couponLogger.log(responseLog);
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
