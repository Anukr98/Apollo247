import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { STATUS, APPOINTMENT_TYPE, APPOINTMENT_STATE } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { ApiConstants } from 'ApiConstants';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';

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
    paymentOrderId: String
    couponCode: String
    actualAmount: Float
    discountedAmount: Float
    appointmentPayments: [AppointmentPayment]
    doctorInfo: DoctorDetailsWithStatusExclude @provides(fields: "id")
  }

  extend type DoctorDetailsWithStatusExclude @key(fields: "id") {
    id: ID! @external
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

  type PersonalizedAppointmentResult {
    appointmentDetails: PersonalizedAppointment
  }

  type PersonalizedAppointment {
    id: String
    hospitalLocation: String
    appointmentDateTime: DateTime
    appointmentType: APPOINTMENT_TYPE
    doctorId: String
    doctorDetails: DoctorDetailsWithStatusExclude @provides(fields: "id")
  }

  extend type Query {
    getPatinetAppointments(
      patientAppointmentsInput: PatientAppointmentsInput
    ): PatientAppointmentsResult!
    getPatientFutureAppointmentCount(patientId: String): AppointmentsCount
    getPatientAllAppointments(
      patientId: String
      offset: Int
      limit: Int
    ): PatientAllAppointmentsResult!
    getPatientPersonalizedAppointments(patientUhid: String): PersonalizedAppointmentResult!
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
  paymentOrderId: string;
  couponCode: string;
  actualAmount: number;
  discountedAmount: number;
  appointmentPayments: AppointmentPayment[];
};

type AppointmentPayment = {
  id: string;
  amountPaid: number;
  paymentRefId: string;
  paymentStatus: string;
  paymentDateTime: Date;
  responseCode: string;
  responseMessage: string;
  bankTxnId: string;
  orderId: string;
};

type PersonalizedAppointmentResult = {
  appointmentDetails: PersonalizedAppointment | '';
};

type PersonalizedAppointment = {
  id: string;
  hospitalLocation: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  doctorId: string;
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
> = async (parent, { patientAppointmentsInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const primaryPatientIds = await patientRepo.getLinkedPatientIds(
    patientAppointmentsInput.patientId
  );

  const patinetAppointments = await appts.getPatinetUpcomingAppointments(primaryPatientIds);

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

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const primaryPatientIds = await patientRepo.getLinkedPatientIds(args.patientId);

  const conultsList = await appointmentRepo.getPatinetUpcomingAppointments(primaryPatientIds);

  return { consultsCount: conultsList.length };
};

const getPatientAllAppointments: Resolver<
  null,
  { patientId: string; offset: number; limit: number },
  ConsultServiceContext,
  PatientAllAppointmentsResult
> = async (parent, args, { consultsDb, patientsDb }) => {
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const primaryPatientIds = await patientRepo.getLinkedPatientIds(args.patientId);

  const appointments = await appts.getPatientAllAppointments(
    primaryPatientIds,
    args.offset,
    args.limit
  );

  return { appointments };
};

const getPatientPersonalizedAppointments: Resolver<
  null,
  { patientUhid: string },
  ConsultServiceContext,
  PersonalizedAppointmentResult
> = async (parent, args, { consultsDb, doctorsDb }) => {
  const apptsResp = await fetch(
    process.env.PRISM_GET_OFFLINE_APPOINTMENTS
      ? process.env.PRISM_GET_OFFLINE_APPOINTMENTS + ApiConstants.CURRENT_UHID
      : '',
    {
      method: 'GET',
      headers: {},
    }
  );
  const textRes = await apptsResp.text();
  const offlineApptsList = JSON.parse(textRes);

  let apptDetails: any = '';
  if (offlineApptsList.errorCode == 0) {
    //console.log(offlineApptsList.response, offlineApptsList.response.length);
    let doctorId = '';
    console.log(ApiConstants.DEV_DOC_ID.toString(), process.env.NODE_ENV, 'input data');
    if (process.env.NODE_ENV == 'local') doctorId = ApiConstants.LOCAL_DOC_ID.toString();
    else if (process.env.NODE_ENV == 'development') doctorId = ApiConstants.DEV_DOC_ID.toString();
    else if (process.env.NODE_ENV == 'staging') doctorId = ApiConstants.QA_DOC_ID.toString();
    else offlineApptsList.response[0].doctorid_247;
    doctorId = '74c93b2e-8aab-4b6c-8391-5407f4afb833';
    const apptDetailsOffline: PersonalizedAppointment = {
      id: offlineApptsList.response[0].appointmentid,
      hospitalLocation: offlineApptsList.response[0].location_name,
      appointmentDateTime: new Date(offlineApptsList.response[0].consultedtime),
      appointmentType:
        offlineApptsList.response[0].appointmenttype == 'WALKIN'
          ? APPOINTMENT_TYPE.PHYSICAL
          : APPOINTMENT_TYPE.ONLINE,
      doctorId,
    };
    apptDetails = apptDetailsOffline;
  }
  if (apptDetails == '') throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID);
  return { appointmentDetails: apptDetails };
};

export const getPatinetAppointmentsResolvers = {
  PatinetAppointments: {
    doctorInfo(appointments: PatinetAppointments) {
      return { __typename: 'DoctorDetailsWithStatusExclude', id: appointments.doctorId };
    },
  },

  PersonalizedAppointment: {
    doctorDetails(appointment: PersonalizedAppointment) {
      return { __typename: 'DoctorDetailsWithStatusExclude', id: appointment.doctorId };
    },
  },

  Query: {
    getPatinetAppointments,
    getPatientFutureAppointmentCount,
    getPatientAllAppointments,
    getPatientPersonalizedAppointments,
  },
};
