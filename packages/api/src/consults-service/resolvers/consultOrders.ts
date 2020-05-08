import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';
import _ from 'lodash';

export const consultOrdersTypeDefs = gql`
type AppointmentsResult {
  appointments : [ApptResponse]
}
type ApptResponse {
    displayId: Int
    id: String
    appointmentDateTime: DateTime
    actualAmount: Float
    discountedAmount: Float
    appointmentType: String
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
    consultOrders(patientId: String): AppointmentsResult
  }
`;

type ApptResponse = {
  displayId: number;
  id: string;
  appointmentDateTime: Date;
  actualAmount: Number;
  discountedAmount: Number;
  appointmentType: string
  appointmentPayments: appointmentPayment[];
  status: String;
};

type AppointmentsResult = {
  appointments: ApptResponse[];
};

type appointmentPayment = {
  amountPaid: Number;
  bankTxnId: string;
  id: string;
  paymentRefId: string;
  paymentStatus: string;
  paymentType: string;
  responseMessage: string;
}

const consultOrders: Resolver<
  null,
  { patientId: string },
  ConsultServiceContext,
  AppointmentsResult
> = async (parent, args, { consultsDb, doctorsDb }) => {
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const docConsultRep = doctorsDb.getCustomRepository(DoctorRepository);
  const response = await apptsRepo.getAllAppointmentsByPatientId(args.patientId);
  console.log('orders Response', JSON.stringify(response, null, 2));
  let result = [];
  for (let i = 0; i < response.length; i++) {
    result.push(response[i].doctorId);
  }
  const doc = await docConsultRep.getSearchDoctorsByIds(result);
  // console.log('doc Response', JSON.stringify(doc, null, 2));

  if (response && response.length > 0) {
    // let output: any = [];
    response.forEach(val => {
      let obj = val;
      let index = _.findIndex(doc, (key) => key.typeId === val.doctorId);
      if (index !== -1) {
        console.log('index', index);
        // obj.name = doc[index].name;
        // output.push(Object.contains(obj, { name: doc[index].name}))
        // output.push(obj);
      }

    })
    return { appointments: response }
  } else throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
};

export const consultOrdersResolvers = {
  Query: {
    consultOrders,
  },
};
