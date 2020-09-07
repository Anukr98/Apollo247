import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  STATUS,
  APPOINTMENT_TYPE,
  CaseSheet,
  APPOINTMENT_STATE,
  CONSULTS_RX_SEARCH_FILTER,
} from 'consults-service/entities';
import { MedicineOrders } from 'profiles-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import _ from 'lodash';
//import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';
//import { PatientLabResults, LabTestResults, TestResultFiles } from 'types/labResults';

export const getPatientConsultsAndPrescriptionsTypeDefs = gql`
  enum MEDICINE_DELIVERY_TYPE {
    HOME_DELIVERY
    STORE_PICKUP
  }

  enum MEDICINE_ORDER_TYPE {
    UPLOAD_PRESCRIPTION
    CART_ORDER
  }

  enum CONSULTS_RX_SEARCH_FILTER {
    ONLINE
    PHYSICAL
    PRESCRIPTION
  }

  enum MEDICINE_ORDER_STATUS {
    QUOTE
    ORDER_BILLED
    PAYMENT_SUCCESS
    PAYMENT_PENDING
    PAYMENT_FAILED
    ORDER_INITIATED
    ORDER_PLACED
    ORDER_VERIFIED
    DELIVERED
    CANCELLED
    OUT_FOR_DELIVERY
    PICKEDUP
    RETURN_INITIATED
    ITEMS_RETURNED
    RETURN_ACCEPTED
    PRESCRIPTION_UPLOADED
    ORDER_FAILED
    PRESCRIPTION_CART_READY
    ORDER_CONFIRMED
    CANCEL_REQUEST
    READY_AT_STORE
    PURCHASED_IN_STORE
    PAYMENT_ABORTED
  }

  input PatientConsultsAndOrdersInput {
    patient: ID!
    filter: [CONSULTS_RX_SEARCH_FILTER!]
    offset: Int
    limit: Int
  }

  type ConsultRecord {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    appointmentState: APPOINTMENT_STATE
    hospitalId: ID
    isFollowUp: Boolean
    followUpParentId: ID
    followUpTo: DateTime
    bookingDate: DateTime
    caseSheet: [CaseSheet]
    displayId: Int!
    status: STATUS!
    doctorInfo: DoctorDetails @provides(fields: "id")
  }

  type Medicine {
    medicineSKU: String
    medicineName: String
    price: Float
    quantity: Int
    mrp: Float
    id: ID!
  }

  type MedicineOrderRecord {
    id: ID!
    orderAutoId: Int
    orderDateTime: DateTime
    quoteDateTime: DateTime
    deliveryType: MEDICINE_DELIVERY_TYPE
    currentStatus: MEDICINE_ORDER_STATUS
    orderType: MEDICINE_ORDER_TYPE
    estimatedAmount: Float
    deliveryCharges: Float
    prescriptionImageUrl: String
    prismPrescriptionFileId: String
    shopId: String
    medicineOrderLineItems: [Medicine]
  }

  type PatientConsultsAndOrders {
    consults: [ConsultRecord]
    medicineOrders: [MedicineOrderRecord]
  }

  extend type Query {
    getPatientPastConsultsAndPrescriptions(
      consultsAndOrdersInput: PatientConsultsAndOrdersInput
    ): PatientConsultsAndOrders
    getPatientLabResults(patientId: String!): Boolean
  }
`;

const hasFilter = (type: CONSULTS_RX_SEARCH_FILTER, filter?: CONSULTS_RX_SEARCH_FILTER[]) => {
  if (!filter || filter.length === 0 || (filter && filter.includes(type))) {
    return true;
  }
};

type ConsultRecord = {
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  appointmentState: APPOINTMENT_STATE;
  bookingDate: Date;
  caseSheet?: CaseSheet[];
  displayId: number;
  doctorId: string;
  hospitalId?: string;
  id: string;
  isFollowUp: Boolean;
  followUpParentId: string;
  followUpTo?: Date;
  patientId: string;
  status: STATUS;
};

type PatientConsultsAndOrders = {
  consults: ConsultRecord[] | null;
  medicineOrders: MedicineOrders[] | null;
};

type PatientConsultsAndOrdersInput = {
  patient: string;
  filter?: CONSULTS_RX_SEARCH_FILTER[];
  offset?: number;
  limit?: number;
};

type ConsultsAndOrdersInputArgs = { consultsAndOrdersInput: PatientConsultsAndOrdersInput };

const getPatientPastConsultsAndPrescriptions: Resolver<
  null,
  ConsultsAndOrdersInputArgs,
  ConsultServiceContext,
  PatientConsultsAndOrders
> = async (parent, { consultsAndOrdersInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const { patient, filter, offset, limit } = consultsAndOrdersInput;

  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  let patientAppointments: ConsultRecord[] = [];
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const primaryPatientIds = await patientRepo.getLinkedPatientIds({ patientId: patient });
  if (
    hasFilter(CONSULTS_RX_SEARCH_FILTER.ONLINE, filter) ||
    hasFilter(CONSULTS_RX_SEARCH_FILTER.PHYSICAL, filter)
  ) {
    patientAppointments = await apptsRepo.getPatientPastAppointments(
      primaryPatientIds,
      filter,
      offset,
      limit
    );

    patientAppointments.map(
      (appointment) =>
        (appointment.caseSheet = _.orderBy(
          appointment.caseSheet,
          (caseSheet) => caseSheet.version,
          'desc'
        ))
    );
  }
  return { consults: patientAppointments, medicineOrders: [] };
};

const getPatientLabResults: Resolver<
  null,
  { patientId: string },
  ConsultServiceContext,
  boolean
> = async (parent, args, { mobileNumber, patientsDb }) => {
  /*const patientsRepo = patientsDb.getCustomRepository(PatientRepository);
  //get authtoken for the logged in user mobile number
  const prismAuthToken = await patientsRepo.getPrismAuthToken(mobileNumber);

  if (!prismAuthToken) return false;

  //get users list for the mobile number
  const prismUserList = await patientsRepo.getPrismUsersList(mobileNumber, prismAuthToken);

  const patientDetails = await patientsRepo.findById(args.patientId);
  if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});

  let uhid = '';
  if (patientDetails.primaryUhid) {
    uhid = patientDetails.primaryUhid;
  } else {
    uhid = await patientsRepo.validateAndGetUHID(args.patientId, prismUserList);
  }

  if (!uhid) {
    return false;
  }

  //just call get prism user details with the corresponding uhid
  await patientsRepo.getPrismUsersDetails(uhid, prismAuthToken);
  const labResults = await patientsRepo.getPatientLabResults(uhid, prismAuthToken);
  console.log(labResults); */
  return false;
};

export const getPatientConsultsAndPrescriptionsResolvers = {
  ConsultRecord: {
    doctorInfo(consults: ConsultRecord) {
      return { __typename: 'DoctorDetails', id: consults.doctorId };
    },
  },
  Query: {
    getPatientPastConsultsAndPrescriptions,
    getPatientLabResults,
  },
};
