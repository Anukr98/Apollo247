import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';
import _ from 'lodash';

export const getOrderInvoiceTypeDefs = gql`
type AppointmentsResult {
  appointments : [ApptResponse]
  doc: docResponse
  patient: patientDetails
}
type patientDetails {
  uhid: String
  mobileNumber: String
  emailAddress: String
}
type docResponse {
  firstName: String
  lastName: String
  specialization: String
}
type ApptResponse {
    displayId: Int
    id: String
    patientName: String
    appointmentType: String
    appointmentDateTime: DateTime
    actualAmount: Float
    discountedAmount: Float
    appointmentPayments: [appointmentPayment]
    status: String
  }
type appointmentPayment {
  amountPaid: Float
  bankTxnId: String
  id: String
  paymentRefId: String
  paymentStatus: String
  paymentType: String
  responseMessage: String
}
  extend type Query {
    getOrderInvoice(patientId: String, appointmentId: String): AppointmentsResult
  }
`;

type ApptResponse = {
  displayId: number;
  id: string;
  patientName: string;
  appointmentDateTime: Date;
  actualAmount: Number;
  discountedAmount: Number;
  appointmentType: string
  appointmentPayments: appointmentPayment[];
  status: String;
};

type AppointmentsResult = {
  appointments: ApptResponse[];
}

type appointmentPayment = {
  amountPaid: Number;
  bankTxnId: string;
  id: string;
  paymentRefId: string;
  paymentStatus: string;
  paymentType: string;
  responseMessage: string;
}

const getOrderInvoice: Resolver<
  null,
  { patientId: string, appointmentId: string },
  ConsultServiceContext,
  AppointmentsResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const docConsultRep = doctorsDb.getCustomRepository(DoctorRepository);
  const patientsRep = patientsDb.getCustomRepository(PatientRepository);
  const response = await apptsRepo.findByAppointmentId(args.appointmentId);
  console.log('orders Response', JSON.stringify(response, null, 2));

  const patientDetails = await patientsRep.findById(args.patientId);
  console.log('orders Response', JSON.stringify(patientDetails, null, 2));

  const docResponse = await docConsultRep.findDoctorByIdWithoutRelations(response[0].doctorId);
  console.log('doc Response', JSON.stringify(docResponse, null, 2));

  if (response && response.length > 0) {
    return { appointments: response, doc: docResponse, patient: patientDetails }
  } else throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
};

export const getOrderInvoiceResolvers = {
  Query: {
    getOrderInvoice,
  },
};