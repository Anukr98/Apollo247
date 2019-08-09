import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { STATUS, APPOINTMENT_TYPE } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';

export const getPatinetAppointmentsTypeDefs = gql`
  type PatinetAppointments {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    status: STATUS!
    bookingDate: DateTime
    doctorInfo: DoctorDetails @provides(fields: "id")
  }

  extend type DoctorDetails @key(fields: "id") {
    id: ID! @external
  }

  input PatientAppointmentsInput {
    patientId: ID!
    appointmentDate: Date!
  }

  type PatientAppointmentsResult {
    patinetAppointments: [PatinetAppointments!]
  }

  extend type Query {
    getPatinetAppointments(
      patientAppointmentsInput: PatientAppointmentsInput
    ): PatientAppointmentsResult!
  }
`;

type PatientAppointmentsResult = {
  patinetAppointments: PatinetAppointments[] | null;
};

type PatientAppointmentsInput = {
  patientId: string;
  appointmentDate: Date;
};

type PatinetAppointments = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
  status: STATUS;
  bookingDate: Date;
};

type Doctor = {
  id: string;
  doctorName: string;
};

type AppointmentInputArgs = { patientAppointmentsInput: PatientAppointmentsInput };

const getPatinetAppointments: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  PatientAppointmentsResult
> = async (parent, { patientAppointmentsInput }, { consultsDb, doctorsDb }) => {
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const patinetAppointments = await appts.getPatientDateAppointments(
    patientAppointmentsInput.appointmentDate,
    patientAppointmentsInput.patientId
  );

  return { patinetAppointments };
};

export const getPatinetAppointmentsResolvers = {
  PatinetAppointments: {
    doctorInfo(appointments: PatinetAppointments) {
      return { __typename: 'DoctorDetails', id: appointments.doctorId };
    },
  },
  Query: {
    getPatinetAppointments,
  },
};
