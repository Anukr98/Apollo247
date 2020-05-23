import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import _ from 'lodash';
import { STATUS, REFUND_STATUS } from 'consults-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

export const consultOrdersTypeDefs = gql`
  type AppointmentsResult {
    appointments: [ApptResponse]
  }

  type ApptResponse {
    displayId: Int
    id: String
    appointmentDateTime: DateTime
    actualAmount: Float
    discountedAmount: Float
    appointmentType: String
    appointmentPayments: [ApptPayment]
    appointmentRefunds: [ApptRefunds]
    status: STATUS
    doctorId: String
    doctor: DoctorResponse
  }
  type DoctorResponse {
    typeId: String
    name: String
  }
  type ApptPayment {
    amountPaid: Float
    bankTxnId: String
    id: String
    paymentRefId: String
    paymentStatus: String
    paymentType: String
    responseMessage: String
  }
  type ApptRefunds {
    refundAmount: Float
    txnTimestamp: Date
    refundStatus: REFUND_STATUS
    refundId: String

}
  extend type Query {
    consultOrders(patientId: String): AppointmentsResult
  }
`;

type ApptResponse = {
  displayId: number;
  id: string;
  appointmentDateTime: Date;
  actualAmount: number;
  discountedAmount: number;
  appointmentType: string;
  appointmentPayments: ApptPayment[];
  appointmentRefunds: ApptRefunds[];
  status: STATUS;
  doctorId: string;
  doctor: DoctorResponse;
};
type DoctorResponse = {
  typeId: string;
  name: string;
};
type AppointmentsResult = {
  appointments: Partial<ApptResponse[]>;
};

type ApptPayment = {
  amountPaid: number;
  bankTxnId: string;
  id: string;
  paymentRefId: string;
  paymentStatus: string;
  paymentType: string;
  responseMessage: string;
};

type ApptRefunds = {
  refundAmount: number;
  txnTimestamp: Date;
  refundStatus: REFUND_STATUS;
  refundId: string;

}

const consultOrders: Resolver<
  null,
  { patientId: string },
  ConsultServiceContext,
  AppointmentsResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const docConsultRep = doctorsDb.getCustomRepository(DoctorRepository);

  const patientRepo = patientsDb.getCustomRepository(PatientRepository);
  const primaryPatientIds = await patientRepo.getLinkedPatientIds(args.patientId);

  const response = await apptsRepo.getAllAppointmentsByPatientId(primaryPatientIds);
  // console.log('appointments Response', JSON.stringify(response, null, 2))

  if (response && response.length > 0) {
    const result = [];
    for (let i = 0; i < response.length; i++) {
      result.push(response[i].doctorId);
    }

    const doc = await docConsultRep.getSearchDoctorsByIds(result);
    // console.log('doc Response', JSON.stringify(doc, null, 2));
    if (doc && doc.length > 0) {
      const output: Partial<ApptResponse[]> = [];
      response.forEach((val) => {
        const obj: ApptResponse = {
          actualAmount: val.actualAmount,
          displayId: val.displayId,
          discountedAmount: val.discountedAmount,
          appointmentDateTime: val.appointmentDateTime,
          appointmentType: val.appointmentType,
          appointmentPayments: val.appointmentPayments,
          appointmentRefunds: val.appointmentRefunds,
          id: val.id,
          doctorId: val.doctorId,
          status: val.status,
          doctor: { typeId: '', name: '' },
        };
        const index = _.findIndex(doc, (key) => key.typeId === val.doctorId);
        if (index !== -1) {
          obj.doctor = doc[index];
          output.push(obj);
        }
      });
      return { appointments: output };
    } else {
      throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
    }
  } else if (response.length == 0) return { appointments: [] };
  else throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
};

export const consultOrdersResolvers = {
  Query: {
    consultOrders,
  },
};
