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
import { DoctorPatientExternalConnectRepository } from 'doctors-service/repositories/DoctorPatientExternalConnectRepository';
import { addHours } from 'date-fns';

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
  type PastAppointmentsCountResult {
    count: Int
    completedCount: Int
    yesCount: Int
    noCount: Int
  }
  extend type Query {
    getAppointmentOverview(
      appointmentOverviewInput: GetAllDoctorAppointmentsInput
    ): GetAppointmentOverviewResult!
    getAppointmentByPaymentOrderId(orderId: String): AppointmentList
    getPastAppointmentsCount(
      doctorId: String!
      patientId: String!
      appointmentId: String
    ): PastAppointmentsCountResult!
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

type PastAppointmentsCountResult = {
  count: number;
  completedCount: number;
  yesCount: number;
  noCount: number;
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
  let completedAppointments = 0;
  let cancelledAppointments = 0;
  let inNextHour = 0;
  const doctorAway = allAppointments.length;

  // updating the count for appointments
  for (let i = 0; i < allAppointments.length; i++) {
    const { status, appointmentDateTime } = allAppointments[i];
    const now = new Date();
    const nextHr = addHours(now, 1);
    if (status && status == STATUS.COMPLETED) {
      completedAppointments++;
    } else if (status && status == STATUS.CANCELLED) {
      cancelledAppointments++;
    }
    if (appointmentDateTime && appointmentDateTime >= now && appointmentDateTime <= nextHr) {
      inNextHour++;
    }
  }
  const appointments = await Promise.all(
    allAppointments.map((appointment) => {
      return { appointment };
    })
  );

  const appointmentOverviewOutput = {
    appointments,
    completed: completedAppointments,
    cancelled: cancelledAppointments,
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
  if (source == BOOKINGSOURCE.WEB) {
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

const getPastAppointmentsCount: Resolver<
  null,
  { doctorId: string; patientId: string; appointmentId: string },
  ConsultServiceContext,
  PastAppointmentsCountResult
> = async (parent, { doctorId, patientId, appointmentId }, context) => {
  if (!doctorId) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  if (!patientId) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  const { apptRepo } = getRepos(context);
  const count = await apptRepo.getAppointmentsCount(doctorId, patientId);
  const completedCount = await apptRepo.getAppointmentsCompleteCount(doctorId, patientId);
  const externalConnectRepo = context.doctorsDb.getCustomRepository(
    DoctorPatientExternalConnectRepository
  );
  let apptId = '';
  if (appointmentId) {
    apptId = appointmentId;
  }
  const yesCount = await externalConnectRepo.findCountDoctorAndPatient(doctorId, patientId);
  const noCount = await externalConnectRepo.findNoCountDoctorAndPatient(
    doctorId,
    patientId,
    apptId
  );
  return { count, completedCount, yesCount, noCount };
};

export const getAppointmentOverviewResolvers = {
  Query: {
    getAppointmentOverview,
    getAppointmentByPaymentOrderId,
    getPastAppointmentsCount,
  },
  Mutation: {
    updatePaymentOrderId,
  },
};
