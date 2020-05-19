import { makeStyles } from '@material-ui/styles';
import { History } from 'history';
import { Modal, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { clientRoutes } from 'helpers/clientRoutes';
import { useParams } from 'hooks/routerHooks';
import { useMutation } from 'react-apollo-hooks';
import moment from 'moment';
import { PharmaPaymentStatus_pharmaPaymentStatus as PharmaPaymentDetails } from 'graphql/types/PharmaPaymentStatus';
import { PHRAMA_PAYMENT_STATUS } from 'graphql/medicines';
import { OrderStatusContent } from '../OrderStatusContent';

const useStyles = makeStyles(() => {
  return {
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loader: {
      textAlign: 'center',
      padding: '20px 0',
    },
  };
});

interface PaymentMethods {
  [name: string]: string;
  }

const paymentMethodMap: PaymentMethods = {
  DC : 'DEBIT_CARD',
  CC : 'CREDIT_CARD',
  NB : 'NET_BANKING',
  PPI : 'PAYTM_WALLET',
  EMI : 'CREDIT_CARD_EMI',
  UPI : 'UPI',
  PAYTMCC : 'PAYTM_POSTPAID'
}

interface PaymentStatusProps {
  history: History;
}

export const PaymentStatusModal: React.FC<PaymentStatusProps> = (props) => {
  const classes = useStyles({});
  const params = useParams<{
    orderAutoId: string;
    orderStatus: string;
  }>();

  const [paymentStatusData, setPaymentStatusData] = useState<PharmaPaymentDetails>(null)
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(true);
  const pharmaPayments = useMutation(PHRAMA_PAYMENT_STATUS);

  interface PaymentStatusInterface {
    ctaText: string;
    info: string;
    callbackFunction: () => void;
  }
  interface PaymentStatusType {
    [name: string]: PaymentStatusInterface;
  }
      
  const paymentStatusObj: PaymentStatusType = {
    PAYMENT_PENDING: {
      ctaText: 'GO TO HOME',
      info:
        'Your payment is in progress and this may take a couple of minutes to confirm your booking. We’ll intimate you once your bank confirms the payment.',
      callbackFunction: () => {
        paymentStatusRedirect(clientRoutes.welcome());
      },
    },
    PAYMENT_SUCCESS: {
      ctaText: 'VIEW ORDERS',
      info:
        'Your order has been placed successfully. We will confirm the order in a few minutes.',
      callbackFunction: () => {
        paymentStatusRedirect(clientRoutes.yourOrders());
      },
    },
    PAYMENT_FAILED: {
      ctaText: 'TRY AGAIN',
      info:
        'In case your account has been debited,you should get the refund in 10-14 business days.',
      callbackFunction: () => {
        // paymentStatusRedirect(redirectUrl)
        window && (window.location.href = clientRoutes.yourOrders());
      },
    },
  };
  const handleOnClose = () => {
    paymentStatusRedirect(clientRoutes.medicines());
  };
  const paymentStatusRedirect = (url: string) => {
    props.history && props.history.push && props.history.push(url);
  };

  useEffect(() => {
    if (params.orderAutoId) {
      pharmaPayments({
        variables: {
          orderId: typeof params.orderAutoId === 'string' ? parseInt(params.orderAutoId) : params.orderAutoId
        }
      })
        .then((resp: any) => {
          if (resp && resp.data && resp.data.pharmaPaymentStatus) {
            setPaymentStatusData(resp.data.pharmaPaymentStatus)
          } else {
            // redirect to medicine 
            paymentStatusRedirect(clientRoutes.medicines());
          }
        })
        .catch(() => {
          paymentStatusRedirect(clientRoutes.medicines());
        })
    }
  }, []);

 
  const paymentDetail = paymentStatusData && paymentStatusObj[paymentStatusData.paymentStatus] ? paymentStatusObj[paymentStatusData.paymentStatus] : null;
  return (
    <Modal
      open={showPaymentStatusModal}
      className={classes.modal}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <>
        {!paymentStatusData ? (
          <div className={classes.loader}>
            <CircularProgress />
          </div>
        ) : (
            <OrderStatusContent
              paymentStatus={paymentStatusData.paymentStatus === 'PAYMENT_FAILED'
                ? 'failed'
                : paymentStatusData.paymentStatus === 'PAYMENT_PENDING'
                  ? 'pending'
                  : 'success'}
              paymentInfo={ paymentDetail ? paymentDetail.info : ''}
              orderStatusCallback={paymentDetail ? paymentDetail.callbackFunction : ()=>{}}
              orderId={Number(params.orderAutoId)}
              amountPaid={paymentStatusData.amountPaid}
              paymentType={paymentStatusData.paymentRefId ? 'Prepaid': 'COD'}
              // paymentType={paymentMethodMap[paymentStatusData.paymentType] ?
              //   paymentMethodMap[paymentStatusData.paymentType] : 'PREPAID'}
              paymentRefId={paymentStatusData.paymentRefId}
              paymentDateTime={moment(paymentStatusData.paymentDateTime).format('DD MMMM YYYY[,] LT').replace(/(A|P)(M)/, '$1.$2.')
              .toString()}
              type='ORDER'
              onClose={() => { handleOnClose() }}
              ctaText={paymentDetail ? paymentDetail.ctaText: ''}
            />
          )}
      </>
    </Modal>
  );
};
