import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { Between } from 'typeorm';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { Appointment, STATUS, BOOKINGSOURCE } from 'consults-service/entities';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const getAppointmentOverviewTypeDefs = gql`
  type AppointmentList {
    appointment: Appointment!
  }

  type GetAppointmentOverviewResult {
    appointments: [AppointmentList!]!
    completed: Int
    cancelled: Int
    upcoming: Int
    doctorAway: Int
  }
  type UpdatePaymentOrderIdResult {
    status: Boolean
  }
  input GetAllDoctorAppointmentsInput {
    doctorId: String!
    fromDate: DateTime
    toDate: DateTime
  }
  extend type Query {
    getAppointmentOverview(
      appointmentOverviewInput: GetAllDoctorAppointmentsInput
    ): GetAppointmentOverviewResult!
    getAppointmentByPaymentOrderId(orderId: String): AppointmentList
  }
  extend type Mutation {
    updatePaymentOrderId(
      appointmentId: String
      orderId: String
      source: String
    ): UpdatePaymentOrderIdResult
  }
`;

type AppointmentList = {
  appointment: Appointment;
};
type UpdatePaymentOrderIdResult = {
  status: boolean;
};
type getAppointmentOverviewResult = {
  appointments: AppointmentList[];
  completed: number;
  cancelled: number;
  upcoming: number;
  doctorAway: number;
};
type GetAllDoctorAppointmentsInput = {
  doctorId: string;
  fromDate: Date;
  toDate: Date;
};
type GetAllDoctorAppointmentsInputArgs = {
  appointmentOverviewInput: GetAllDoctorAppointmentsInput;
};

const getRepos = ({ consultsDb, doctorsDb, patientsDb }: ConsultServiceContext) => ({
  apptRepo: consultsDb.getCustomRepository(AppointmentRepository),
  patRepo: patientsDb.getCustomRepository(PatientRepository),
  docRepo: doctorsDb.getCustomRepository(DoctorRepository),
});

const getAppointmentOverview: Resolver<
  null,
  GetAllDoctorAppointmentsInputArgs,
  ConsultServiceContext,
  getAppointmentOverviewResult
> = async (parent, { appointmentOverviewInput }, context) => {
  const { apptRepo } = getRepos(context);
  const doctorId = appointmentOverviewInput.doctorId;
  const fromDate = appointmentOverviewInput.fromDate;
  const toDate = appointmentOverviewInput.toDate;

  const allAppointments = await apptRepo.find({
    where: {
      doctorId,
      appointmentDateTime: Between(fromDate, toDate),
    },
    order: { appointmentDateTime: 'DESC' },
  });
  const completedAppointments = await apptRepo.getCompletedAppointments(
    doctorId,
    fromDate,
    toDate,
    0
  );
  const cannceldAppointments = await apptRepo.getCompletedAppointments(
    doctorId,
    fromDate,
    toDate,
    1
  );
  const doctorAway = await apptRepo.getDoctorAway(doctorId, fromDate, toDate);
  const inNextHour = await apptRepo.getAppointmentsInNextHour(doctorId);

  const appointments = await Promise.all(
    allAppointments.map(async (appointment) => {
      return { appointment };
    })
  );
  const appointmentOverviewOutput = {
    appointments,
    completed: completedAppointments,
    cancelled: cannceldAppointments,
    upcoming: inNextHour,
    doctorAway: doctorAway,
  };
  return appointmentOverviewOutput;
};

const updatePaymentOrderId: Resolver<
  null,
  { appointmentId: string; orderId: string; source: string },
  ConsultServiceContext,
  UpdatePaymentOrderIdResult
> = async (parent, { appointmentId, orderId, source }, context) => {
  if (!appointmentId) throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);
  if (!orderId) throw new AphError(AphErrorMessages.INVALID_ORDER_ID);
  const { apptRepo } = getRepos(context);
  const appointmentDetails = await apptRepo.findById(appointmentId);
  if (!appointmentDetails || appointmentDetails.status !== STATUS.PAYMENT_PENDING)
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);
  appointmentDetails.paymentOrderId = orderId;
  if (source == 'WEB') {
    appointmentDetails.bookingSource = BOOKINGSOURCE.WEB;
  } else {
    appointmentDetails.bookingSource = BOOKINGSOURCE.MOBILE;
  }

  await apptRepo.updateMedmantraStatus(appointmentDetails);
  return { status: true };
};

const getAppointmentByPaymentOrderId: Resolver<
  null,
  { orderId: string },
  ConsultServiceContext,
  AppointmentList
> = async (parent, { orderId }, context) => {
  if (!orderId) throw new AphError(AphErrorMessages.INVALID_ORDER_ID);
  const { apptRepo } = getRepos(context);
  const appointmentDetails = await apptRepo.findByPaymentOrderId(orderId);
  if (!appointmentDetails) throw new AphError(AphErrorMessages.INVALID_ORDER_ID);
  return { appointment: appointmentDetails };
};

export const getAppointmentOverviewResolvers = {
  Query: {
    getAppointmentOverview,
    getAppointmentByPaymentOrderId,
  },
  Mutation: {
    updatePaymentOrderId,
  },
};
