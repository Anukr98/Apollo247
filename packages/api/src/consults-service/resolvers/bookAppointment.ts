import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { Appointment, STATUS, APPOINTMENT_TYPE, CaseSheet } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorHospitalRepository } from 'doctors-service/repositories/doctorHospitalRepository';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';

export const bookAppointmentTypeDefs = gql`
  enum STATUS {
    IN_PROGRESS
    CONFIRMED
    CANCELLED
    COMPLETED
    PENDING
    NO_SHOW
  }

  enum APPOINTMENT_TYPE {
    ONLINE
    PHYSICAL
    BOTH
  }

  type AppointmentBooking {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    status: STATUS!
  }

  input BookAppointmentInput {
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
  }

  type BookAppointmentResult {
    appointment: AppointmentBooking
  }

  extend type Mutation {
    bookAppointment(appointmentInput: BookAppointmentInput): BookAppointmentResult!
  }
`;

type BookAppointmentResult = {
  appointment: Appointment;
};

type BookAppointmentInput = {
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
};

type AppointmentBooking = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
  status: STATUS;
};

type AppointmentInputArgs = { appointmentInput: BookAppointmentInput };

const bookAppointment: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  BookAppointmentResult
> = async (parent, { appointmentInput }, { consultsDb, doctorsDb }) => {
  const appointmentAttrs: Omit<AppointmentBooking, 'id'> = {
    ...appointmentInput,
    status: STATUS.PENDING,
  };

  //check if docotr id is valid
  const doctor = doctorsDb.getCustomRepository(DoctorRepository);
  const docDetails = await doctor.findById(appointmentInput.doctorId);
  if (!docDetails) {
    throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  }

  //check if docotr and hospital are matched
  const facilityId = appointmentInput.hospitalId;
  if (facilityId) {
    const doctorHospRepo = doctorsDb.getCustomRepository(DoctorHospitalRepository);
    const docHospital = await doctorHospRepo.findDoctorHospital(
      appointmentInput.doctorId,
      facilityId
    );
    if (!docHospital) {
      throw new AphError(AphErrorMessages.INVALID_FACILITY_ID, undefined, {});
    }
  }

  //check if given appointment datetime is greater than current date time
  if (appointmentInput.appointmentDateTime <= new Date()) {
    throw new AphError(AphErrorMessages.APPOINTMENT_BOOK_DATE_ERROR, undefined, {});
  }

  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const apptCount = await appts.checkIfAppointmentExist(
    appointmentInput.doctorId,
    appointmentInput.appointmentDateTime
  );
  if (apptCount > 0) {
    throw new AphError(AphErrorMessages.APPOINTMENT_EXIST_ERROR, undefined, {});
  }
  const appointment = await appts.saveAppointment(appointmentAttrs);

  //TODO after junior doctor flow.. casesheet creation should be changed.
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const caseSheetAttrs: Partial<CaseSheet> = {
    consultType: appointment.appointmentType,
    doctorId: appointment.doctorId,
    patientId: appointment.patientId,
    appointment: appointment,
  };
  await caseSheetRepo.savecaseSheet(caseSheetAttrs);
  ///////////

  return { appointment };
};

export const bookAppointmentResolvers = {
  Mutation: {
    bookAppointment,
  },
};
