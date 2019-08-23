import '@aph/universal/dist/global';
import {
  Appointment,
  AppointmentSessions,
  CaseSheet,
  MedicinePrescription,
} from 'consults-service/entities/';
import {
  ConsultHours,
  Doctor,
  DoctorAndHospital,
  DoctorBankAccounts,
  DoctorSpecialty,
  Facility,
  Packages,
  StarTeam,
} from 'doctors-service/entities';
import 'reflect-metadata';
import { createConnections } from 'typeorm';

export const connect = async () => {
  return await createConnections([
    {
      entities: [
        Doctor,
        DoctorSpecialty,
        StarTeam,
        DoctorAndHospital,
        Facility,
        ConsultHours,
        DoctorBankAccounts,
        Packages,
      ],
      type: 'postgres',
      host: process.env.DOCTORS_DB_HOST,
      port: parseInt(process.env.DOCTORS_DB_PORT, 10),
      username: process.env.DOCTORS_DB_USER,
      password: process.env.DOCTORS_DB_PASSWORD,
      database: `doctors_${process.env.NODE_ENV}`,
      logging: true,
      synchronize: true,
    },
    {
      name: 'consults-db',
      entities: [Appointment, AppointmentSessions, MedicinePrescription, CaseSheet],
      type: 'postgres',
      host: process.env.CONSULTS_DB_HOST,
      port: parseInt(process.env.CONSULTS_DB_PORT, 10),
      username: process.env.CONSULTS_DB_USER,
      password: process.env.CONSULTS_DB_PASSWORD,
      database: `consults_${process.env.NODE_ENV}`,
      logging: true,
      synchronize: true,
    },
  ]).catch((error) => {
    throw new Error(error);
  });
};
