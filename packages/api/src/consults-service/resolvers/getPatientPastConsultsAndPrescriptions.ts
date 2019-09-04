import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { STATUS, APPOINTMENT_TYPE, CaseSheet, APPOINTMENT_STATE } from 'consults-service/entities';
import { MedicineOrders } from 'profiles-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { MedicineOrdersRepository } from 'profiles-service/repositories/MedicineOrdersRepository';

export const getPatientConsultsAndPrescriptionsTypeDefs = gql`
  enum MEDICINE_DELIVERY_TYPE {
    HOME_DELIVERY
    STORE_PICKUP
  }

  enum MEDICINE_ORDER_TYPE {
    UPLOAD_PRESCRIPTION
    CART_ORDER
  }

  enum MEDICINE_ORDER_STATUS {
    QUOTE
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
  }

  input PatientConsultsAndOrdersInput {
    patient: ID!
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
    medicineSku: String
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
  }
`;

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
  const { patient, offset, limit } = consultsAndOrdersInput;

  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const patientAppointments = await appts.getPatientPastAppointments(patient, offset, limit);
  const medicineOrdersRepo = patientsDb.getCustomRepository(MedicineOrdersRepository);
  const patientMedicineOrders = await medicineOrdersRepo.findByPatientId(patient, offset, limit);
  return { consults: patientAppointments, medicineOrders: patientMedicineOrders };
};

export const getPatientConsultsAndPrescriptionsResolvers = {
  ConsultRecord: {
    doctorInfo(consults: ConsultRecord) {
      return { __typename: 'DoctorDetails', id: consults.doctorId };
    },
  },
  Query: {
    getPatientPastConsultsAndPrescriptions,
  },
};
