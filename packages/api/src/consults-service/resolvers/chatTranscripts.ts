import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import path from 'path';
import fs from 'fs';
import { ApiConstants } from 'ApiConstants';
import Pubnub from 'pubnub';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';

export const chatTranscriptsTypeDefs = gql`
  type GenerateChatTranscriptsResult {
    status: Boolean
  }

  extend type Query {
    generateChatTranscripts(startDate: Date, endDate: Date): GenerateChatTranscriptsResult!
  }
`;

type GenerateChatTranscriptsResult = {
  status: boolean;
};

const generateChatTranscripts: Resolver<
  null,
  { startDate: Date; endDate: Date; docLimit: number; docOffset: number },
  ConsultServiceContext,
  GenerateChatTranscriptsResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  if (!args.startDate || !args.endDate) {
    throw new AphError(AphErrorMessages.INVALID_DATES, undefined, {});
  }
  const pubnub = new Pubnub({
    publishKey: process.env.PUBLISH_KEY ? process.env.PUBLISH_KEY : '',
    subscribeKey: process.env.SUBSCRIBE_KEY ? process.env.SUBSCRIBE_KEY : '',
  });
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const allAppts = await apptRepo.getAllAppointmentsByDates(args.startDate, args.endDate);
  const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const juniorDocs = await docRepo.getAllJuniorDoctors('0', args.docLimit, args.docOffset);
  const juniorDocIds = juniorDocs.map((juniorDoc) => juniorDoc.id);
  const seniorDocs = await docRepo.getAllDoctors('0', args.docLimit, args.docOffset);
  const seniorDocIds = seniorDocs.map((seniorDoc) => seniorDoc.id);
  let assetsDir = path.resolve(ApiConstants.ASSETS_DIR);
  if (process.env.NODE_ENV != ApiConstants.LOCAL) {
    assetsDir = path.resolve(<string>process.env.ASSETS_DIRECTORY);
  }
  const dir = assetsDir + ApiConstants.CHAT_TRANSCRIPTS_PATH;
  allAppts.forEach(async (appt, index, array) => {
    pubnub.history(
      {
        channel: appt.id,
        reverse: true,
        stringifiedTimeToken: true,
        start: 0,
        count: 1000,
      },
      (status, response) => {
        const msgs = response && response.messages;
        let msgString = '';
        if (msgs && msgs.length > 0) {
          msgs.forEach((message, index, array) => {
            const msgText = message.entry.message;
            if (
              msgText !== ApiConstants.VIDEO_CALL_MSG &&
              msgText !== ApiConstants.AUDIO_CALL_MSG &&
              msgText !== ApiConstants.STOP_CALL_MSG &&
              msgText !== ApiConstants.ACCEPT_CALL_MSG &&
              msgText !== ApiConstants.START_CONSULT &&
              msgText !== ApiConstants.START_CONSULT_JR &&
              msgText !== ApiConstants.STOP_CONSULT &&
              msgText !== ApiConstants.TRANSFER_CONSULT &&
              msgText !== ApiConstants.RESCHEDULE_CONSULT &&
              msgText !== ApiConstants.FOLLOW_UP_CONSULT
            ) {
              if (juniorDocIds.indexOf(message.entry.id) > -1) {
                msgString =
                  msgString + ApiConstants.JUNIOR_DOC_TXT + message.entry.message + '\r \n';
              } else if (seniorDocIds.indexOf(message.entry.id) > -1) {
                msgString =
                  msgString + ApiConstants.SENIOR_DOC_TXT + message.entry.message + '\r \n';
              } else {
                msgString = msgString + ApiConstants.PATIENT_TXT + message.entry.message + '\r \n ';
              }
            }
            if (index + 1 === array.length) {
              const fileName = appt.id + '.txt';
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
              }
              const writeStream = fs.createWriteStream(dir + '/' + fileName);
              writeStream.write(msgString);
              writeStream.close();
            }
          });
        }
      }
    );
  });
  return {
    status: true,
  };
};

export const chatTranscriptsResolvers = {
  Query: {
    generateChatTranscripts,
  },
};
