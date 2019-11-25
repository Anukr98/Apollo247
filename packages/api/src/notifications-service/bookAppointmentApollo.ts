import { AphMqMessage, AphMqMessageTypes } from 'AphMqClient';
import fetch from 'node-fetch';
import { SendMail } from 'notifications-service/sendMail';
import { AppointmentPayload, AppointmentResp } from 'types/appointmentTypes';
import { getConnection } from 'typeorm';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { STATUS } from 'consults-service/entities';
import { format, differenceInMilliseconds } from 'date-fns';
import winston from 'winston';

type TestMessage = AphMqMessage<AphMqMessageTypes.BOOKAPPOINTMENT, AppointmentPayload>;

export const bookAppointmentApollo = {
  book: async function(message: TestMessage) {
    const reqStartTime = new Date();
    const reqStartTimeFormatted = format(reqStartTime, "yyyy-MM-dd'T'HH:mm:ss.SSSX");
    winston.log({
      message: 'External apiRequest Starting',
      time: reqStartTimeFormatted,
      operation:
        'http://apollostage.quad1test.com/Stage_rest_services/api/eDocConsultation/BookConsultationAppointmentIneDoc/CF662D63-D1F5-47F0-9EAF-D305ED82727A',
      level: 'info',
    });
    await fetch(
      'http://apollostage.quad1test.com/Stage_rest_services/api/eDocConsultation/BookConsultationAppointmentIneDoc/CF662D63-D1F5-47F0-9EAF-D305ED82727A',
      {
        method: 'POST',
        body: JSON.stringify(message.payload),
        headers: { 'Content-Type': 'application/json' },
      }
    ).then((apolloResp) => {
      const responseLog = {
        message: 'Request Ended',
        time: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSX"),
        durationInMilliSeconds: differenceInMilliseconds(new Date(), reqStartTime),
        level: 'info',
        response: apolloResp,
      };

      winston.log(responseLog);

      apolloResp.text().then(async (textRes) => {
        const apolloAppointmentResp: AppointmentResp = JSON.parse(textRes);
        console.log(apolloAppointmentResp, 'apollo appt resp');
        if (apolloAppointmentResp.appointmentId > 0) {
          //update appt with status as confirmed
          const appointmentDb = getConnection();
          const appointmentRepo = appointmentDb.getCustomRepository(AppointmentRepository);
          const updateDetails = await appointmentRepo.confirmAppointment(
            message.payload.apptIdPg,
            STATUS.CONFIRMED,
            apolloAppointmentResp.appointmentId
          );
          console.log(updateDetails, 'update details');
          SendMail.send(message);
        } else {
        }
      });
    });
  },
};
