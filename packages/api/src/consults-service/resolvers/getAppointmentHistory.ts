import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  STATUS,
  APPOINTMENT_TYPE,
  patientLogSort,
  patientLogType,
  CaseSheet,
  APPOINTMENT_STATE,
} from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { NotificationBinRepository } from 'notifications-service/repositories/notificationBinRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

export const getAppointmentHistoryTypeDefs = gql`
  enum patientLogSort {
    MOST_RECENT
    NUMBER_OF_CONSULTS
    PATIENT_NAME_A_TO_Z
    PATIENT_NAME_Z_TO_A
  }
  enum patientLogType {
    All
    FOLLOW_UP
    REGULAR
  }

  extend type Patient @key(fields: "id") {
    id: ID! @external
  }

  extend type Profile @key(fields: "id") {
    id: ID! @external
  }

  type AppointmentHistory {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentState: APPOINTMENT_STATE
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    status: STATUS!
    bookingDate: DateTime
    caseSheet: [CaseSheet]
    rescheduleCount: Int
    isFollowUp: Boolean
    followUpParentId: String
    displayId: Int
    patientInfo: Patient @provides(fields: "id")
    doctorInfo: DoctorDetailsWithStatusExclude @provides(fields: "id")
    isJdQuestionsComplete: Boolean
    isSeniorConsultStarted: Boolean
    paymentOrderId: String
    couponCode: String
    actualAmount: Float
    discountedAmount: Float
    appointmentPayments: [AppointmentPayment]
  }

  input AppointmentHistoryInput {
    patientId: ID!
    doctorId: ID!
  }

  type AppointmentResult {
    appointmentsHistory: [AppointmentHistory!]
  }

  type DoctorAppointmentResult {
    appointmentsHistory: [AppointmentHistory]
    newPatientsList: [String]
  }

  type AppointmentCount {
    appointmentId: String
    count: Int
  }

  type PatientLog {
    patientid: ID
    consultscount: String
    appointmentids: [String]
    appointmentdatetime: DateTime
    patientInfo: Patient @provides(fields: "id")
    unreadMessagesCount: [AppointmentCount]
  }

  type PatientLogData {
    patientLog: [PatientLog]
    totalResultCount: Int
  }

  extend type Query {
    getAppointmentHistory(appointmentHistoryInput: AppointmentHistoryInput): AppointmentResult!
    getDoctorAppointments(startDate: Date, endDate: Date, doctorId: String): DoctorAppointmentResult
    getAppointmentData(appointmentId: String): DoctorAppointmentResult
    getPatientLog(
      offset: Int
      limit: Int
      sortBy: patientLogSort
      type: patientLogType
      doctorId: ID
      patientName: String
    ): PatientLogData
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
  appointmentState: APPOINTMENT_STATE;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
  status: STATUS;
  bookingDate: Date;
  caseSheet: CaseSheet[];
  rescheduleCount: number;
  isFollowUp: Boolean;
  followUpParentId: string;
  displayId: number;
  isJdQuestionsComplete: Boolean;
  isSeniorConsultStarted: Boolean;
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

type AppointmentInputArgs = { appointmentHistoryInput: AppointmentHistoryInput };

const getAppointmentHistory: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  AppointmentResult
> = async (parent, { appointmentHistoryInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const primaryPatientIds = await patientRepo.getLinkedPatientIds(
    appointmentHistoryInput.patientId
  );
  console.log(primaryPatientIds, 'primary patient ids');
  const appointmentsHistory = await appointmentRepo.getPatientAppointments(
    appointmentHistoryInput.doctorId,
    primaryPatientIds
  );
  return { appointmentsHistory };
};

const getDoctorAppointments: Resolver<
  null,
  { startDate: Date; endDate: Date; doctorId: string },
  ConsultServiceContext,
  AppointmentResult
> = async (parent, args, { consultsDb, doctorsDb, mobileNumber }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  let doctordata;

  if (args.doctorId === undefined || args.doctorId == null) {
    doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  } else {
    doctordata = await doctorRepository.findById(args.doctorId);
  }

  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  let appointmentsHistory, newPatientsList;
  try {
    appointmentsHistory = await appointmentRepo.getDoctorAppointments(
      doctordata.id,
      args.startDate,
      args.endDate
    );

    if (Object.keys(appointmentsHistory).length == 0)
      return { appointmentsHistory, newPatientsList };
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

type AppointmentCount = {
  appointmentId: string;
  count: number;
};

type PatientLog = {
  patientid: string;
  consultscount: string;
  appointmentids: string[];
  appointmentdatetime: Date;
  unreadMessagesCount: AppointmentCount[];
};

type PatientLogData = {
  patientLog: PatientLog[] | null;
  totalResultCount: number;
};

const getPatientLog: Resolver<
  null,
  {
    offset?: number;
    limit?: number;
    sortBy: patientLogSort;
    type: patientLogType;
    doctorId: string;
    patientName: string;
  },
  ConsultServiceContext,
  PatientLogData
> = async (parent, args, { consultsDb, doctorsDb, mobileNumber }) => {
  const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
  let doctordata;
  if (args.doctorId === undefined || args.doctorId == null) {
    doctordata = await doctorRepository.findByMobileNumber(mobileNumber, true);
  } else {
    doctordata = await doctorRepository.findById(args.doctorId);
  }

  if (doctordata == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const totalResultCount = await appointmentRepo.patientLog(
    doctordata.id,
    args.sortBy,
    args.type,
    args.patientName
  );
  const appointmentsHistory = await appointmentRepo.patientLog(
    doctordata.id,
    args.sortBy,
    args.type,
    args.patientName,
    args.offset,
    args.limit
  );
  let patientLog = [];
  if (appointmentsHistory.length) {
    const appointmentIds: string[] = [];
    const patientAppointmentsMapper: { [key: string]: string[] } = {};
    const appointmentMessagesCount: { [key: string]: number } = {};

    appointmentsHistory.map((appointmentsHistory) => {
      patientAppointmentsMapper[appointmentsHistory.patientid] = appointmentsHistory.appointmentids;
      appointmentsHistory.appointmentids.map((appointmentId: string) => {
        appointmentMessagesCount[appointmentId] = 0;
        appointmentIds.push(appointmentId);
      });
    });

    //Getting all the notifications with appointment ids
    const notificationBinRepo = consultsDb.getCustomRepository(NotificationBinRepository);
    const notifications = await notificationBinRepo.getRequiredFieldsByAppointmentIds(
      appointmentIds,
      ['notificationBin.eventId']
    );

    //Mapping the count of messages with appointment ids
    notifications.map((notification) => {
      if (appointmentMessagesCount[notification.eventId] != undefined) {
        appointmentMessagesCount[notification.eventId]++;
      }
    });

    //Mapping the patient id with object containing his appointment id and count of unread messages
    const patientMessagesMapper: { [key: string]: AppointmentCount[] } = {};
    Object.keys(patientAppointmentsMapper).map((patientId) => {
      const appointmentsCount = patientAppointmentsMapper[patientId].map((appointmentId) => {
        return {
          appointmentId,
          count: appointmentMessagesCount[appointmentId],
        };
      });

      patientMessagesMapper[patientId] = appointmentsCount;
    });

    //Appending the appointments and count object to the response
    patientLog = appointmentsHistory.map((appointmentsHistoryItem) => {
      const patientDetails = {
        ...appointmentsHistoryItem,
        unreadMessagesCount: patientMessagesMapper[appointmentsHistoryItem.patientid],
      };
      return patientDetails;
    });
  }
  return {
    patientLog,
    totalResultCount: totalResultCount.length,
  };
};

export const getAppointmentHistoryResolvers = {
  AppointmentHistory: {
    doctorInfo(appointments: AppointmentHistory) {
      return { __typename: 'DoctorDetailsWithStatusExclude', id: appointments.doctorId };
    },

    patientInfo(appointments: AppointmentHistory) {
      return { __typename: 'Patient', id: appointments.patientId };
    },
  },

  PatientLog: {
    patientInfo(appointments: PatientLog) {
      return { __typename: 'Patient', id: appointments.patientid };
    },
  },

  Query: {
    getAppointmentHistory,
    getDoctorAppointments,
    getAppointmentData,
    getPatientLog,
  },
};
