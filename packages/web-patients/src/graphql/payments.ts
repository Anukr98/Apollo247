import gql from 'graphql-tag';
export const PAYMENT_TRANSACTION_STATUS = gql`
  query PaymentTransactionStatus($appointmentId: String!) {
    paymentTransactionStatus(appointmentId: $appointmentId) {
      appointment {
        amountPaid
        paymentRefId
        bankTxnId
        displayId
        responseMessage
        paymentDateTime
        paymentStatus
      }
    }
  }
`;
