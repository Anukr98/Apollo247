import { AphMqMessage, AphMqMessageTypes } from 'AphMqClient';
import fetch from 'node-fetch';
import { SendMail } from 'notifications-service/sendMail';
import { AppointmentPayload, AppointmentResp } from 'types/appointmentTypes';
import { getConnection } from 'typeorm';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { STATUS } from 'consults-service/entities';
import { log } from 'customWinstonLogger';

type TestMessage = AphMqMessage<AphMqMessageTypes.BOOKAPPOINTMENT, AppointmentPayload>;
