import '@aph/universal/dist/global';
import { buildFederatedSchema } from '@apollo/federation';
import { GatewayHeaders } from 'api-gateway';
import { ApolloServer } from 'apollo-server';
import winston from 'winston';
import { connect } from 'doctors-service/database/connect';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor } from 'doctors-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import {
  delegateFunctionsResolvers,
  delegateFunctionsTypeDefs,
} from 'doctors-service/resolvers/delegateFunctions';
import {
  getAllSpecialtiesResolvers,
  getAllSpecialtiesTypeDefs,
} from 'doctors-service/resolvers/getAllSpecialties';
import {
  getDoctorDetailsResolvers,
  getDoctorDetailsTypeDefs,
} from 'doctors-service/resolvers/getDoctorDetails';
import {
  getDoctorsBySpecialtyAndFiltersTypeDefs,
  getDoctorsBySpecialtyAndFiltersTypeDefsResolvers,
} from 'doctors-service/resolvers/getDoctorsBySpecialtyAndFilters';
import {
  searchDoctorAndSpecialtyByNameResolvers,
  searchDoctorAndSpecialtyByNameTypeDefs,
} from 'doctors-service/resolvers/searchDoctorAndSpecialtyByName';

import { starTeamResolvers, starTeamTypeDefs } from 'doctors-service/resolvers/starTeam';
import {
  saveDoctorDeviceTokenTypeDefs,
  saveDoctorDeviceTokenResolvers,
} from 'doctors-service/resolvers/saveDoctorDeviceToken';
import { GraphQLDateTime, GraphQLTime, GraphQLDate } from 'graphql-iso-date';
import gql from 'graphql-tag';
import 'reflect-metadata';
import { getConnection } from 'typeorm';
import {
  doctorOnlineStatusTypeDefs,
  doctorOnlineStatusResolvers,
} from 'doctors-service/resolvers/doctorOnlineStatus';
import {
  saveDoctorFavouriteMedicineTypeDefs,
  saveDoctorFavouriteMedicineResolver,
} from 'doctors-service/resolvers/doctorsFavouriteMedicines';
import { doctorDataTypeDefs, doctorDataResolvers } from 'doctors-service/resolvers/doctorData';
import {
  blockedCalendarTypeDefs,
  blockedCalendarResolvers,
} from 'doctors-service/resolvers/blockedCalendar';
import { JDTypeDefs, JDResolvers } from 'doctors-service/resolvers/JDAdmin';
import { format, differenceInMilliseconds } from 'date-fns';
import path from 'path';
import { ApiConstants } from 'ApiConstants';
import {
  doctorFavouriteAdviceTypeDefs,
  doctorFavouriteAdviceResolvers,
} from 'doctors-service/resolvers/doctorFavouriteAdvice';
import {
  doctorFavouriteTestTypeDefs,
  doctorFavouriteTestResolvers,
} from 'doctors-service/resolvers/doctorFavouriteTest';

(async () => {
  await connect();

  //configure winston for doctors service
  const logsDirPath = <string>process.env.API_LOGS_DIRECTORY;
  const logsDir = path.resolve(logsDirPath);
  winston.configure({
    transports: [
      new winston.transports.File({
        filename: logsDir + ApiConstants.DOCTORS_SERVICE_ACCESS_LOG_FILE,
        level: 'info',
      }),
      new winston.transports.File({
        filename: logsDir + ApiConstants.DOCTORS_SERVICE_ERROR_LOG_FILE,
        level: 'error',
      }),
    ],
    exitOnError: false, // do not exit on handled exceptions
  });

  const server = new ApolloServer({
    context: async ({ req }) => {
      const headers = req.headers as GatewayHeaders;
      const firebaseUid = headers.firebaseuid;
      const mobileNumber = headers.mobilenumber;
      const doctorsDb = getConnection();
      const consultsDb = getConnection('consults-db');
      const patientsDb = getConnection('patients-db');

      const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
      const doctordata = (await doctorRepository.getDoctorDetails(firebaseUid)) as Doctor;
      const currentUser = doctordata;

      const context: DoctorsServiceContext = {
        firebaseUid,
        mobileNumber,
        doctorsDb,
        consultsDb,
        patientsDb,
        currentUser,
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
        typeDefs: delegateFunctionsTypeDefs,
        resolvers: delegateFunctionsResolvers,
      },
      {
        typeDefs: getDoctorsBySpecialtyAndFiltersTypeDefs,
        resolvers: getDoctorsBySpecialtyAndFiltersTypeDefsResolvers,
      },
      {
        typeDefs: getAllSpecialtiesTypeDefs,
        resolvers: getAllSpecialtiesResolvers,
      },
      {
        typeDefs: searchDoctorAndSpecialtyByNameTypeDefs,
        resolvers: searchDoctorAndSpecialtyByNameResolvers,
      },
      {
        typeDefs: getDoctorDetailsTypeDefs,
        resolvers: getDoctorDetailsResolvers,
      },
      {
        typeDefs: starTeamTypeDefs,
        resolvers: starTeamResolvers,
      },
      {
        typeDefs: saveDoctorDeviceTokenTypeDefs,
        resolvers: saveDoctorDeviceTokenResolvers,
      },
      {
        typeDefs: saveDoctorFavouriteMedicineTypeDefs,
        resolvers: saveDoctorFavouriteMedicineResolver,
      },
      {
        typeDefs: doctorOnlineStatusTypeDefs,
        resolvers: doctorOnlineStatusResolvers,
      },
      {
        typeDefs: blockedCalendarTypeDefs,
        resolvers: blockedCalendarResolvers,
      },
      {
        typeDefs: doctorDataTypeDefs,
        resolvers: doctorDataResolvers,
      },
      {
        typeDefs: JDTypeDefs,
        resolvers: JDResolvers,
      },
      {
        typeDefs: doctorFavouriteAdviceTypeDefs,
        resolvers: doctorFavouriteAdviceResolvers,
      },
      {
        typeDefs: doctorFavouriteTestTypeDefs,
        resolvers: doctorFavouriteTestResolvers,
      },
    ]),
    plugins: [
      /* This plugin is defined in-line. */
      {
        serverWillStart() {
          winston.log('info', 'Server starting up!');
        },
        requestDidStart({ operationName, request }) {
          /* Within this returned object, define functions that respond
             to request-specific lifecycle events. */
          const reqStartTime = new Date();
          const reqStartTimeFormatted = format(reqStartTime, "yyyy-MM-dd'T'HH:mm:ss.SSSX");
          return {
            parsingDidStart(requestContext) {
              winston.log({
                message: 'Request Starting',
                time: reqStartTimeFormatted,
                operation: requestContext.request.query,
                level: 'info',
              });
            },
            didEncounterErrors(requestContext) {
              requestContext.errors.forEach((error) => {
                winston.log('error', `Encountered Error at ${reqStartTimeFormatted}: `, error);
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
              winston.log(responseLog);
            },
          };
        },
      },
    ],
  });

  server.listen({ port: process.env.DOCTORS_SERVICE_PORT }).then(({ url }) => {
    console.log(`🚀 doctors-service ready`);
  });
})();
