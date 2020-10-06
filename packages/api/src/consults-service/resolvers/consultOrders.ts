import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import _ from 'lodash';
import { STATUS, REFUND_STATUS, Appointment } from 'consults-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { winstonLogger } from 'customWinstonLogger';

const consultsLogger = winstonLogger.loggers.get('consultServiceLogger');

export const consultOrdersTypeDefs = gql`
  type AppointmentsResult {
    meta: PaginateMetaDataConsultOrders
    appointments: [ApptResponse]
  }

  type PaginateMetaDataConsultOrders {
    total: Int
    pageSize: Int
    pageNo: Int
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
    paymentDateTime: DateTime
  }
  type ApptRefunds {
    refundAmount: Float
    txnTimestamp: Date
    refundStatus: REFUND_STATUS
    refundId: String
  }
  extend type Query {
    consultOrders(patientId: String, pageNo: Int, pageSize: Int): AppointmentsResult
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
  meta: PaginateMetaDataConsultOrders;
  appointments: Partial<ApptResponse[]>;
};

type PaginateMetaDataConsultOrders = {
  total: number | null;
  pageSize: number | null;
  pageNo: number | null;
};

type ApptPayment = {
  amountPaid: number;
  bankTxnId: string;
  id: string;
  paymentRefId: string;
  paymentStatus: string;
  paymentType: string;
  responseMessage: string;
  paymentDateTime: Date;
};

type ApptRefunds = {
  refundAmount: number;
  txnTimestamp: Date;
  refundStatus: REFUND_STATUS;
  refundId: string;
};

const consultOrders: Resolver<
  null,
  { patientId: string; pageNo?: number; pageSize?: number },
  ConsultServiceContext,
  AppointmentsResult
> = async (parent, args, { consultsDb, doctorsDb, patientsDb }) => {
  const { patientId } = args;
  const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const docConsultRep = doctorsDb.getCustomRepository(DoctorRepository);
  const patientRepo = patientsDb.getCustomRepository(PatientRepository);

  const patientDetails = await patientRepo.getPatientDetails(args.patientId);

  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  const primaryPatientIds = await patientRepo.getLinkedPatientIds({ patientDetails });

  // paginated vars
  const { pageNo, pageSize = 10 } = args; //default pageSize = 10
  const paginateParams: { take?: number; skip?: number } = {};

  //pageNo should be greater than 0
  if (pageNo === 0) {
    throw new AphError(AphErrorMessages.PAGINATION_PARAMS_PAGENO_ERROR, undefined, {});
  }
  if (pageNo) {
    paginateParams.take = pageSize;
    paginateParams.skip = pageSize * pageNo - pageSize; //bcoz pageNo. starts from 1 not 0.
  }

  consultsLogger.log('info', `consult orders - PaginateParams: ${JSON.stringify(paginateParams)}`);

  const [response, totalCount] = await apptsRepo.getAllAppointmentsByPatientId(
    primaryPatientIds,
    paginateParams
  );

  consultsLogger.log(
    'info',
    `consult orders - DB query resp length: ${Array.isArray(response) && response.length}`
  );

  const metaResponse = {
    pageNo: pageNo || null,
    pageSize: (Number.isInteger(pageNo) && pageSize) || null,
    total: (Number.isInteger(pageNo) && totalCount) || null,
  };

  /**
   * will use it once web-app use pagination logic...
   */
  // if (response && response.length > 0) {
  //   const output: Partial<ApptResponse[]> = [];
  //   /**
  //    * using cb, attach each appointment doctor details parallely
  //    * which will avoid main thread code blocking....
  //    */
  //   await Promise.all(response.map((appointmentDetails: Appointment) => {
  //     const obj: ApptResponse = {
  //       actualAmount: appointmentDetails.actualAmount,
  //       displayId: appointmentDetails.displayId,
  //       discountedAmount: appointmentDetails.discountedAmount,
  //       appointmentDateTime: appointmentDetails.appointmentDateTime,
  //       appointmentType: appointmentDetails.appointmentType,
  //       appointmentPayments: appointmentDetails.appointmentPayments,
  //       appointmentRefunds: appointmentDetails.appointmentRefunds,
  //       id: appointmentDetails.id,
  //       doctorId: appointmentDetails.doctorId,
  //       status: appointmentDetails.status,
  //       doctor: { typeId: '', name: '' },
  //     };

  //     const { doctorId } = appointmentDetails;
  //     //api
  //     return docConsultRep.getDoctorById(
  //       doctorId,
  //       // attach the resp the way we want....
  //       ({ id, firstName, lastName }) => {
  //         obj.doctor.typeId = id
  //         obj.doctor.name = `${firstName} ${lastName}`.trim()
  //         //also store for the final resp output...
  //         output.push(obj)
  //       }
  //     )
  //   }))

  //   return {
  //     meta: metaResponse,
  //     appointments: output
  //   }
  // }
  // return { meta: metaResponse, appointments: response || [] }

  if (response && response.length > 0) {
    const result = [];
    for (let i = 0; i < response.length; i++) {
      result.push(response[i].doctorId);
    }

    const doc = await docConsultRep.getSearchDoctorsByIds(result);
    if (doc && doc.length > 0) {
      const output: Partial<ApptResponse[]> = [];
      response.forEach((val: Appointment) => {
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
      return {
        meta: metaResponse,
        appointments: output,
      };
    } else {
      throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
    }
  } else if (response.length == 0)
    return {
      meta: metaResponse,
      appointments: [],
    };
  else throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
};

export const consultOrdersResolvers = {
  Query: {
    consultOrders,
  },
};
