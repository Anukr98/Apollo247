import { Appointment } from 'consults-service/entities';

export const buildAppointment = (attrs: Partial<Appointment> = {}) => {
  const appointment = new Appointment();
  return Object.assign(appointment, attrs);
};
