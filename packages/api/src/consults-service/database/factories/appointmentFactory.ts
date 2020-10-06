import {
  Appointment,
  APPOINTMENT_TYPE,
  APPOINTMENT_STATE,
  STATUS,
} from 'consults-service/entities';
import faker from 'faker';
import _random from 'lodash/random';
import { randomEnum } from 'helpers/factoryHelpers';

export const buildAppointment = (attrs: Partial<Appointment> = {}) => {
  const appointment = new Appointment();
  appointment.apolloAppointmentId = _random(1, 99999);
  appointment.appointmentDateTime = faker.date.future(0);
  appointment.appointmentType = randomEnum(APPOINTMENT_TYPE);
  appointment.appointmentState = randomEnum(APPOINTMENT_STATE);
  appointment.bookingDate = faker.date.past(0);
  appointment.displayId = _random(1, 99999);
  appointment.isFollowUp = faker.random.boolean();
  appointment.status = randomEnum(STATUS);
  return Object.assign(appointment, attrs);
};
