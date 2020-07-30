import { AphMqMessage, AphMqMessageTypes } from 'AphMqClient';
import { AppointmentPayload } from 'types/appointmentTypes';

type TestMessage = AphMqMessage<AphMqMessageTypes.BOOKAPPOINTMENT, AppointmentPayload>;
