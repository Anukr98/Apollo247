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
  id: String
}
  extend type Query {
    getOrderInvoice(patientId: String): AppointmentsResult
  }
`;


type AppointmentsResult = {
  id: string;
};


const getOrderInvoice: Resolver<
  null,
  { patientId: string },
  ConsultServiceContext,
  AppointmentsResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const patientRepo = consultsDb.getCustomRepository(PatientRepository);
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  // const docConsultRep = doctorsDb.getCustomRepository(DoctorRepository);
  // const response = await apptsRepo.getAllAppointmentsByPatientId(args.patientId);
  // console.log('orders Response', JSON.stringify(response, null, 2));
  let result = [];
  // const response = await patientsRepo.findById(args.patientId);
  // console.log('doc Response', JSON.stringify(response, null, 2));
  const patientDetails = await patientRepo.getPatientDetails(args.patientId);
  console.log('patientDetails', patientDetails);
  if (!patientDetails) throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});

  return patientDetails;
};

export const getOrderInvoiceResolvers = {
  Query: {
    getOrderInvoice,
  },
};
