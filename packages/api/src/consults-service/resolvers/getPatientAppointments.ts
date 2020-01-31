import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { STATUS, APPOINTMENT_TYPE, APPOINTMENT_STATE } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorConsultHoursRepository } from 'doctors-service/repositories/doctorConsultHoursRepository';

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
    rescheduleCount: Int
    isFollowUp: String!
    appointmentState: APPOINTMENT_STATE
    displayId: Int
    isConsultStarted: Boolean
    isSeniorConsultStarted: Boolean
    isJdQuestionsComplete: Boolean
    symptoms: String
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

  type PatientAllAppointmentsResult {
    appointments: [PatinetAppointments!]
  }

  type AppointmentsCount {
    consultsCount: Int
  }

  extend type Query {
    getPatinetAppointments(
      patientAppointmentsInput: PatientAppointmentsInput
    ): PatientAppointmentsResult!
    getPatientFutureAppointmentCount(patientId: String): AppointmentsCount
    getPatientAllAppointments(patientId: String): PatientAllAppointmentsResult!
  }
`;

type PatientAppointmentsResult = {
  patinetAppointments: PatinetAppointments[] | null;
};

type PatientAllAppointmentsResult = {
  appointments: PatinetAppointments[] | null;
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
  rescheduleCount: number;
  bookingDate: Date;
  isFollowUp: Boolean;
  displayId: number;
  isConsultStarted: Boolean;
  isSeniorConsultStarted: Boolean;
  appointmentState: APPOINTMENT_STATE;
  isJdQuestionsComplete: Boolean;
  symptoms: string;
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
  const patinetAppointments = await appts.getPatinetUpcomingAppointments(
    patientAppointmentsInput.patientId
  );

  return { patinetAppointments };
};

const getPatientFutureAppointmentCount: Resolver<
  null,
  { patientId: string },
  ConsultServiceContext,
  { consultsCount: number }
> = async (parent, args, { consultsDb, patientsDb, mobileNumber, doctorsDb }) => {
  //check whether the access is by patient
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.getPatientDetails(args.patientId);
  if (patientData == null) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID);

  if (patientData.mobileNumber !== mobileNumber) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  //get max consult duration
  let maxConsultationMinutes = 0;
  const consultRepository = doctorsDb.getCustomRepository(DoctorConsultHoursRepository);
  const consultationRecord = await consultRepository.getMaxConsultationMinutes();
  if (consultationRecord) {
    maxConsultationMinutes = consultationRecord.maxconsultduration;
  }

  let consultsCount = 0;

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  consultsCount = await appointmentRepo.getPatientFutureAppointmentsCount(
    args.patientId,
    maxConsultationMinutes
  );

  return { consultsCount };
};

const getPatientAllAppointments: Resolver<
  null,
  { patientId: string },
  ConsultServiceContext,
  PatientAllAppointmentsResult
> = async (parent, args, { consultsDb, doctorsDb }) => {
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const appointments = await appts.getPatientAllAppointments(args.patientId);

  return { appointments };
};

export const getPatinetAppointmentsResolvers = {
  PatinetAppointments: {
    doctorInfo(appointments: PatinetAppointments) {
      return { __typename: 'DoctorDetails', id: appointments.doctorId };
    },
  },
  Query: {
    getPatinetAppointments,
    getPatientFutureAppointmentCount,
    getPatientAllAppointments,
  },
};
