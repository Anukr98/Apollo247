import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';

export const paymentTransactionStatusTypeDefs = gql`


  type AppointmentPaymentResponse {
		appointment:AppointmentPaymentDetails
  }
	type AppointmentPaymentDetails {
		paymentRefId: String
   	bankTxnId: String
		amountPaid: Float
		paymentStatus: String
		responseCode: Int
		responseMessage: String
		paymentDateTime: DateTime
		displayId: Int
	}
  extend type Query {
    paymentTransactionStatus(appointmentId: String): AppointmentPaymentResponse
  }
  
`;
type AppointmentID = {
	appointmentId: string;
}
type AppointmentPaymentResponse = {
	appointment: {
		paymentRefId: string;
		bankTxnId: string;
		amountPaid: number;
		paymentStatus: string;
		responseCode: string;
		responseMessage: string;
		paymentDateTime: Date;
		displayId: number;
	}

}

const paymentTransactionStatus: Resolver<
	null,
	{ appointmentId: string; },
	ConsultServiceContext,
	AppointmentPaymentResponse
> = async (parent, args, { consultsDb }) => {
	const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);

	const response = await apptsRepo.findAppointmentPaymentById(args.appointmentId);
	log(
		'consultServiceLogger',
		'payload received',
		'paymentTransactionStatus()',
		`The response received: ${JSON.stringify(response)}`,
		'true'
	);

	if (!response) {
		throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
	}
	const returnResponse = {
		displayId: response.displayId,
		paymentDateTime: response.appointmentPayments[0].paymentDateTime,
		bankTxnId: response.appointmentPayments[0].bankTxnId,
		paymentRefId: response.appointmentPayments[0].paymentRefId,
		responseMessage: response.appointmentPayments[0].responseMessage,
		responseCode: response.appointmentPayments[0].responseCode,
		amountPaid: response.appointmentPayments[0].amountPaid,
		paymentStatus: response.appointmentPayments[0].paymentStatus
	}

	switch (response.appointmentPayments[0].paymentStatus) {
		case 'TXN_SUCCESS':
			returnResponse.paymentStatus = 'PAYMENT_SUCCESS';
			break;
		case 'PENDING':
			returnResponse.paymentStatus = 'PAYMENT_PENDING_PG';
			break;
		case 'TXN_FAILURE':
			returnResponse.paymentStatus = 'PAYMENT_FAILED';
			break;
		default:
			returnResponse.paymentStatus = response.status;
	}

	return { appointment: returnResponse };
};

export const paymentTransactionStatusResolvers = {
	Query: {
		paymentTransactionStatus
	}
};
