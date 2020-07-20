import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { STATUS, APPOINTMENT_TYPE, APPOINTMENT_STATE } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { ApiConstants } from 'ApiConstants';
import { DoctorHospitalRepository } from 'doctors-service/repositories/doctorHospitalRepository';
import { addDays } from 'date-fns';
import { getCache, setCache } from 'profiles-service/database/connectRedis';

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

const REDIS_PATIENT_PASTCONSULT_BY_UHID_PREFIX: string = 'patient:pastconsult:';

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
  appointmentDetails: PersonalizedAppointment;
};

type offlineAppointment = {
  id: string;
  appointmentid: string;
  specialityid: string;
  speciality: string;
  doctorid: string;
  doctorid_247: string;
  uhid: string;
  consultedtime: string;
  appointmenttype: string;
  modeofappointment: string;
  doctor_name: string;
  locationid: string;
  location_name: string;
};

type PersonalizedAppointment = {
  id: string;
  hospitalLocation: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  doctorId: string;
};

type MedmantraApolloDoctor = {
  apolloDoctorId: string;
  medmantraId: string;
};

type AppointmentInputArgs = { patientAppointmentsInput: PatientAppointmentsInput };

const getPatinetAppointments: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  PatientAppointmentsResult
> = async (
  parent,
  { patientAppointmentsInput },
  { consultsDb, doctorsDb, patientsDb, mobileNumber }
) => {
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.checkMobileIdInfo(
    mobileNumber,
    '',
    patientAppointmentsInput.patientId
  );
  if (!patientData) throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS);
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
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
> = async (parent, args, { consultsDb, patientsDb, mobileNumber }) => {
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const patientData = await patientRepo.checkMobileIdInfo(mobileNumber, '', args.patientId);
  if (!patientData) throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS);
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
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
> = async (parent, args, { consultsDb, doctorsDb, patientsDb, mobileNumber }) => {
  const MAX_DAYS_PAST_CONSULT: number = 30;
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const doctorFacilityRepo = doctorsDb.getCustomRepository(DoctorHospitalRepository);
  const apptRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const patientDetails = await patientRepo.findByUhid(args.patientUhid);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }
  if (mobileNumber != patientDetails.mobileNumber) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }
  let uhid = args.patientUhid;
  if (process.env.NODE_ENV == 'local') uhid = ApiConstants.CURRENT_UHID.toString();
  else if (process.env.NODE_ENV == 'dev') uhid = ApiConstants.CURRENT_UHID.toString();
  const offlineApptsList = await getOfflineAppointments(uhid);
  let apptDetails: any = {};

  if (offlineApptsList.errorCode == 0 && offlineApptsList.response.length > 0) {
    const aDateInPast = addDays(new Date(), -1 * MAX_DAYS_PAST_CONSULT);

    /**
     * appointmentsToConsider array contains appointments which
     *  a. has valid consultedtime
     *  b. are after "aDateInPast"
     *
     * This array is sorted on the basis of consultedtime in descending order
     */
    let appointmentsToConsider = offlineApptsList
      .sort(
        (a: offlineAppointment, b: offlineAppointment) =>
          new Date(b.consultedtime).getTime() - new Date(a.consultedtime).getTime()
      )
      .filter(
        (a: offlineAppointment) =>
          !isNaN(new Date(a.consultedtime).getTime()) &&
          new Date(a.consultedtime).getTime() >= aDateInPast.getTime()
      );

    let medMantraIds: string[] = appointmentsToConsider.map((x: offlineAppointment) => x.doctorid);
    let medmantraApolloDoctors: MedmantraApolloDoctor[] = await doctorFacilityRepo.getDoctorIdsByMedMantraIds(
      medMantraIds
    );

    let mapMedMantraApolloDoctor = new Map<string, string>();
    medmantraApolloDoctors.map((x: MedmantraApolloDoctor) =>
      mapMedMantraApolloDoctor.set(x.medmantraId, x.apolloDoctorId)
    );

    for (let appt of appointmentsToConsider) {
      let apptDetailsBooked = undefined;
      let apolloDoctorId = mapMedMantraApolloDoctor.get(appt.doctorid);
      if (mapMedMantraApolloDoctor.has(appt.doctorid)) {
        apptDetailsBooked = await apptRepo.checkIfAppointmentBooked(
          apolloDoctorId || '',
          patientDetails ? appt.uh : '',
          new Date(appt.consultedtime)
        );
        if (apptDetailsBooked == 0) {
          const apptDetailsOffline: PersonalizedAppointment = {
            id: appt.appointmentid,
            hospitalLocation: appt.location_name,
            appointmentDateTime: new Date(appt.consultedtime),
            appointmentType:
              appt.appointmenttype == 'WALKIN'
                ? APPOINTMENT_TYPE.PHYSICAL
                : APPOINTMENT_TYPE.ONLINE,
            doctorId: apolloDoctorId || '',
          };
          apptDetails = apptDetailsOffline;
          break;
        }
      }
    }
  }
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
      return {
        __typename: 'DoctorDetailsWithStatusExclude',
        id: appointment.doctorId ? appointment.doctorId : '',
      };
    },
  },

  Query: {
    getPatinetAppointments,
    getPatientFutureAppointmentCount,
    getPatientAllAppointments,
    getPatientPersonalizedAppointments,
  },
};
async function getOfflineAppointments(uhid: string) {
  let pastConsultFromCache = await getCache(`${REDIS_PATIENT_PASTCONSULT_BY_UHID_PREFIX}${uhid}`);
  let offlineApptsList;
  if (pastConsultFromCache && typeof pastConsultFromCache === 'string') {
    offlineApptsList = JSON.parse(pastConsultFromCache);
  } else {
    const apptsResp = await fetch(
      process.env.PRISM_GET_OFFLINE_APPOINTMENTS
        ? process.env.PRISM_GET_OFFLINE_APPOINTMENTS + uhid
        : '',
      {
        method: 'GET',
        headers: {},
      }
    );
    const textRes = await apptsResp.text();
    setCache(
      `${REDIS_PATIENT_PASTCONSULT_BY_UHID_PREFIX}${uhid}`,
      textRes,
      ApiConstants.CACHE_EXPIRATION_86400
    );
    offlineApptsList = JSON.parse(textRes);
  }
  return offlineApptsList;
}
