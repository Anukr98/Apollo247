import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { STATUS, APPOINTMENT_TYPE } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';

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
    getDoctorAppointments(startDate: Date, endDate: Date): DoctorAppointmentResult
    getAppointmentData(appointmentId: String): DoctorAppointmentResult
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
  { startDate: Date; endDate: Date },
  ConsultServiceContext,
  AppointmentResult
> = async (parent, args, { consultsDb, doctorsDb, mobileNumber }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  const doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  let appointmentsHistory, newPatientsList;
  try {
    appointmentsHistory = await appointmentRepo.getDoctorAppointments(
      doctordata.id,
      args.startDate,
      args.endDate
    );

    const uniquePatientIds = appointmentsHistory
      .map((item) => item.patientId)
      .filter((value, index, self) => self.indexOf(value) === index);

    const patientConsult = await appointmentRepo.getDoctorPatientVisitCount(
      doctordata.id,
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

const getAppointmentData: Resolver<
  null,
  { appointmentId: string },
  ConsultServiceContext,
  AppointmentResult
> = async (parent, args, { consultsDb, doctorsDb, mobileNumber }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointmentsHistory = await appointmentRepo.findByAppointmentId(args.appointmentId);
  if (appointmentsHistory == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);
  return { appointmentsHistory };
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
    getAppointmentData,
  },
};
