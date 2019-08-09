import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { STATUS, APPOINTMENT_TYPE } from 'consults-service/entities/appointment';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const getAppointmentHistoryTypeDefs = gql`
  type AppointmentHistory {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    status: STATUS!
    bookingDate: DateTime
    patientInfo: Patient @provides(fields: "id")
  }

  input AppointmentHistoryInput {
    patientId: ID!
    doctorId: ID!
  }

  extend type Patient @key(fields: "id") {
    id: ID! @external
  }

  type AppointmentResult {
    appointmentsHistory: [AppointmentHistory!]
  }

  type DoctorAppointmentResult {
    appointmentsHistory: [AppointmentHistory]
    newPatientsList: [String]
  }

  extend type Query {
    getAppointmentHistory(appointmentHistoryInput: AppointmentHistoryInput): AppointmentResult!
    getDoctorAppointments(doctorId: String, startDate: Date, endDate: Date): DoctorAppointmentResult
  }
`;

type AppointmentResult = {
  appointmentsHistory: AppointmentHistory[] | null;
};

type AppointmentHistoryInput = {
  patientId: string;
  doctorId: string;
};

type AppointmentHistory = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
  status: STATUS;
  bookingDate: Date;
};

type AppointmentInputArgs = { appointmentHistoryInput: AppointmentHistoryInput };

const getAppointmentHistory: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  AppointmentResult
> = async (parent, { appointmentHistoryInput }, { consultsDb, doctorsDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentsHistory = await appointmentRepo.getPatientAppointments(
    appointmentHistoryInput.doctorId,
    appointmentHistoryInput.patientId
  );
  return { appointmentsHistory };
};

const getDoctorAppointments: Resolver<
  null,
  { doctorId: string; startDate: Date; endDate: Date },
  ConsultServiceContext,
  AppointmentResult
> = async (parent, args, { consultsDb, doctorsDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  let appointmentsHistory, newPatientsList;
  try {
    appointmentsHistory = await appointmentRepo.getDoctorAppointments(
      args.doctorId,
      args.startDate,
      args.endDate
    );

    const uniquePatientIds = appointmentsHistory
      .map((item) => item.patientId)
      .filter((value, index, self) => self.indexOf(value) === index);

    const patientConsult = await appointmentRepo.getDoctorPatientVisitCount(
      args.doctorId,
      uniquePatientIds
    );

    newPatientsList = patientConsult
      .filter((item) => item.count == 1)
      .map((item) => item.appointment_patientId);
  } catch (invalidGrant) {
    throw new AphError(AphErrorMessages.INSUFFICIENT_PRIVILEGES, undefined, { invalidGrant });
  }

  return { appointmentsHistory, newPatientsList };
};

export const getAppointmentHistoryResolvers = {
  AppointmentHistory: {
    patientInfo(appointments: AppointmentHistory) {
      return { __typename: 'Patient', id: appointments.patientId };
    },
  },

  Query: {
    getAppointmentHistory,
    getDoctorAppointments,
  },
};
