import '@aph/universal/dist/global';
import { buildFederatedSchema } from '@apollo/federation';
import { GatewayHeaders } from 'api-gateway';
import { ApolloServer } from 'apollo-server';
import winston from 'winston';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { connect } from 'consults-service/database/connect';
import {
  createAppointmentSessionResolvers,
  createAppointmentSessionTypeDefs,
} from 'consults-service/resolvers/appointmentSession';
import {
  bookAppointmentResolvers,
  bookAppointmentTypeDefs,
} from 'consults-service/resolvers/bookAppointment';
import {
  makeAppointmentPaymentTypeDefs,
  makeAppointmentPaymentResolvers,
} from 'consults-service/resolvers/makeAppointmentPayment';
import { caseSheetResolvers, caseSheetTypeDefs } from 'consults-service/resolvers/caseSheet';
import {
  getAppointmentHistoryResolvers,
  getAppointmentHistoryTypeDefs,
} from 'consults-service/resolvers/getAppointmentHistory';
import {
  getAvailableSlotsResolvers,
  getAvailableSlotsTypeDefs,
} from 'consults-service/resolvers/getDoctorAvailability';
import {
  getNextAvailableSlotResolvers,
  getNextAvailableSlotTypeDefs,
} from 'consults-service/resolvers/getDoctorNextSlot';
import {
  getPhysicalAvailableSlotsResolvers,
  getPhysicalAvailableSlotsTypeDefs,
} from 'consults-service/resolvers/getDoctorPhysicalAvailability';
import {
  getPatinetAppointmentsResolvers,
  getPatinetAppointmentsTypeDefs,
} from 'consults-service/resolvers/getPatientAppointments';
import {
  transferAppointmentTypeDefs,
  transferAppointmentResolvers,
} from 'consults-service/resolvers/transferAppointment';
import {
  rescheduleAppointmentTypeDefs,
  rescheduleAppointmentResolvers,
} from 'consults-service/resolvers/rescheduleAppointment';
import {
  getPatientConsultsAndPrescriptionsTypeDefs,
  getPatientConsultsAndPrescriptionsResolvers,
} from 'consults-service/resolvers/getPatientPastConsultsAndPrescriptions';
import {
  chooseDoctorTypeDefs,
  chooseDoctorResolvers,
} from 'consults-service/resolvers/chooseDoctor';
import {
  cancelAppointmentTypeDefs,
  cancelAppointmentResolvers,
} from 'consults-service/resolvers/cancelAppointment';
import {
  bookFollowUpAppointmentTypeDefs,
  bookFollowUpAppointmentResolvers,
} from 'consults-service/resolvers/bookFollowUpAppointment';
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';
import gql from 'graphql-tag';
import 'reflect-metadata';
import { getConnection } from 'typeorm';
import {
  consultQueueTypeDefs,
  consultQueueResolvers,
} from 'consults-service/resolvers/consultQueue';
import {
  getAllDoctorAppointmentsTypeDefs,
  getAllDoctorAppointmentsResolvers,
} from 'consults-service/resolvers/getAllDoctorAppointments';
import {
  uploadChatDocumentTypeDefs,
  uploadChatDocumentResolvers,
} from 'consults-service/resolvers/uploadChatDocument';
import {
  appointmentsSummaryTypeDefs,
  appointmentsSummaryResolvers,
} from 'consults-service/resolvers/appointmentsSummary';
import {
  doctorCallNotificationTypeDefs,
  doctorCallNotificationResolvers,
} from 'consults-service/resolvers/doctorCallNotification';
import { format, differenceInMilliseconds } from 'date-fns';

(async () => {
  await connect();

  //configure winston for consults service
  winston.configure({
    transports: [
      new winston.transports.File({ filename: 'access-logs/consults-service.log', level: 'info' }),
      new winston.transports.File({ filename: 'error-logs/consults-service.log', level: 'error' }),
    ],
    exitOnError: false, // do not exit on handled exceptions
  });

  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const firebaseUid = headers.firebaseuid;
      const mobileNumber = headers.mobilenumber;
      const consultsDb = getConnection();
      const doctorsDb = getConnection('doctors-db');
      const patientsDb = getConnection('patients-db');
      const context: ConsultServiceContext = {
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
      {
        typeDefs: bookAppointmentTypeDefs,
        resolvers: bookAppointmentResolvers,
      },
      {
        typeDefs: makeAppointmentPaymentTypeDefs,
        resolvers: makeAppointmentPaymentResolvers,
      },
      {
        typeDefs: getAppointmentHistoryTypeDefs,
        resolvers: getAppointmentHistoryResolvers,
      },
      {
        typeDefs: getPatinetAppointmentsTypeDefs,
        resolvers: getPatinetAppointmentsResolvers,
      },
      {
        typeDefs: createAppointmentSessionTypeDefs,
        resolvers: createAppointmentSessionResolvers,
      },
      {
        typeDefs: getNextAvailableSlotTypeDefs,
        resolvers: getNextAvailableSlotResolvers,
      },
      {
        typeDefs: getPhysicalAvailableSlotsTypeDefs,
        resolvers: getPhysicalAvailableSlotsResolvers,
      },
      {
        typeDefs: caseSheetTypeDefs,
        resolvers: caseSheetResolvers,
      },
      {
        typeDefs: transferAppointmentTypeDefs,
        resolvers: transferAppointmentResolvers,
      },
      {
        typeDefs: rescheduleAppointmentTypeDefs,
        resolvers: rescheduleAppointmentResolvers,
      },
      {
        typeDefs: getPatientConsultsAndPrescriptionsTypeDefs,
        resolvers: getPatientConsultsAndPrescriptionsResolvers,
      },
      {
        typeDefs: chooseDoctorTypeDefs,
        resolvers: chooseDoctorResolvers,
      },
      {
        typeDefs: cancelAppointmentTypeDefs,
        resolvers: cancelAppointmentResolvers,
      },
      {
        typeDefs: bookFollowUpAppointmentTypeDefs,
        resolvers: bookFollowUpAppointmentResolvers,
      },
      {
        typeDefs: consultQueueTypeDefs,
        resolvers: consultQueueResolvers,
      },
      {
        typeDefs: getAllDoctorAppointmentsTypeDefs,
        resolvers: getAllDoctorAppointmentsResolvers,
      },
      {
        typeDefs: uploadChatDocumentTypeDefs,
        resolvers: uploadChatDocumentResolvers,
      },
      {
        typeDefs: appointmentsSummaryTypeDefs,
        resolvers: appointmentsSummaryResolvers,
      },
      {
        typeDefs: doctorCallNotificationTypeDefs,
        resolvers: doctorCallNotificationResolvers,
      },
    ]),
    plugins: [
      /* This plugin is defined in-line. */
      {
        serverWillStart() {
          //winston.log('info', 'Server starting up!');
          console.log('Server starting up!');
        },
        requestDidStart({ operationName, request }) {
          /* Within this returned object, define functions that respond
             to request-specific lifecycle events. */
          const reqStartTime = new Date();
          const reqStartTimeFormatted = format(reqStartTime, "yyyy-MM-dd'T'HH:mm:ss.SSSX");
          console.log(reqStartTimeFormatted);
          return {
            parsingDidStart(requestContext) {
              // winston.log({
              //   message: 'Request Starting',
              //   time: reqStartTimeFormatted,
              //   operation: requestContext.request.query,
              //   level: 'info',
              // });
            },
            didEncounterErrors(requestContext) {
              requestContext.errors.forEach((error) => {
                //winston.log('error', `Encountered Error at ${reqStartTimeFormatted}: `, error);
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
              //winston.log(responseLog);
            },
          };
        },
      },
    ],
  });

  server.listen({ port: process.env.CONSULTS_SERVICE_PORT }).then(({ url }) => {
    console.log(`🚀 consults-service ready`);
  });
})();
