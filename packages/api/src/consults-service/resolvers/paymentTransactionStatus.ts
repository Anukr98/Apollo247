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


enum statuses {
	TXN_SUCCESS = 'PAYMENT_SUCCESS',
	PENDING = 'PENDING',
	TXN_FAILURE = 'TXN_FAILURE'

}
type AppointmentPaymentResponse = {
	appointment: AppointmentPaymentDetails

}

type AppointmentPaymentDetails = {
	paymentRefId: string;
	bankTxnId: string;
	amountPaid: number;
	paymentStatus: string;
	responseCode: string;
	responseMessage: string;
	paymentDateTime: Date;
	displayId: number;
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
	const returnResponse: any = {
		displayId: response.displayId,
		paymentStatus: response.status
	}

	if (response.appointmentPayments && response.appointmentPayments[0]) {
		returnResponse.paymentDateTime = response.appointmentPayments[0].paymentDateTime,
			returnResponse.bankTxnId = response.appointmentPayments[0].bankTxnId,
			returnResponse.paymentRefId = response.appointmentPayments[0].paymentRefId,
			returnResponse.responseMessage = response.appointmentPayments[0].responseMessage,
			returnResponse.responseCode = response.appointmentPayments[0].responseCode,
			returnResponse.amountPaid = response.appointmentPayments[0].amountPaid
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
		}
	}

	return { appointment: returnResponse };
};

export const paymentTransactionStatusResolvers = {
	Query: {
		paymentTransactionStatus
	}
};
