import { makeStyles } from '@material-ui/styles';
import { History } from 'history';
import { Modal, CircularProgress, Popover, Theme } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { clientRoutes } from 'helpers/clientRoutes';
import { useParams } from 'hooks/routerHooks';
import { useMutation } from 'react-apollo-hooks';
import moment from 'moment';
import { PharmaPaymentStatus_pharmaPaymentStatus as PharmaPaymentDetails } from 'graphql/types/PharmaPaymentStatus';
import { PHRAMA_PAYMENT_STATUS } from 'graphql/medicines';
import { OrderStatusContent } from '../OrderStatusContent';
import { OrderPlaced } from 'components/Cart/OrderPlaced';
import { getPaymentMethodFullName } from 'helpers/commonHelpers';

const useStyles = makeStyles((theme: Theme) => {
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
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    successPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      paddingTop: 36,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 72,
      },
    }
  };
});

interface PaymentStatusProps {
  history: History;
  addToCartRef:any;
}

export const PaymentStatusModal: React.FC<PaymentStatusProps> = (props) => {
  const classes = useStyles({});
  const params = useParams<{
    orderAutoId: string;
    orderStatus: string;
  }>();

  const [paymentStatusData, setPaymentStatusData] = useState<PharmaPaymentDetails>(null)
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(true);
  const [showOrderPopup, setShowOrderPopup] = useState<boolean>(true);
  const pharmaPayments = useMutation(PHRAMA_PAYMENT_STATUS);

  
  const getPaymentStatus = () => {
    if (!paymentStatusData)
      return '';
    else {
      switch (paymentStatusData.paymentStatus) {
        case 'PAYMENT_FAILED':
          return 'failed';
        case 'PAYMENT_PENDING':
          return 'pending';
        case 'PAYMENT_SUCCESS':
          return 'success'
        default: return ''
      }
    }
  }
  interface PaymentStatusInterface {
    ctaText: string;
    info: string;
    callbackFunction: () => void;
  }
  interface PaymentStatusType {
    [name: string]: PaymentStatusInterface;
  }
      
  const paymentStatusObj: PaymentStatusType = {
    pending: {
      ctaText: 'GO TO HOME',
      info:
        'Your payment is in progress and this may take a couple of minutes to confirm your booking. We’ll intimate you once your bank confirms the payment.',
      callbackFunction: () => {
        paymentStatusRedirect(clientRoutes.welcome());
      },
    },
    success: {
      ctaText: 'VIEW ORDERS',
      info:
        'Your order has been placed successfully. We will confirm the order in a few minutes.',
      callbackFunction: () => {
        paymentStatusRedirect(clientRoutes.yourOrders());
      },
    },
    failed: {
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

  const paymentStatus = getPaymentStatus();
  const paymentDetail = paymentStatusData && paymentStatusObj[paymentStatus] ? paymentStatusObj[paymentStatus] : null;

  return (
    <>
      {!paymentStatusData || paymentStatusData.paymentRefId ? (
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
                  paymentStatus={paymentStatus}
                  paymentInfo={paymentDetail ? paymentDetail.info : ''}
                  orderStatusCallback={paymentDetail ? paymentDetail.callbackFunction : () => { }}
                  orderId={Number(params.orderAutoId)}
                  amountPaid={paymentStatusData.amountPaid}
                  // paymentType={paymentStatusData.paymentRefId ? 'Prepaid': 'COD'}
                  paymentType={getPaymentMethodFullName(paymentStatusData.paymentMode)}
                  paymentRefId={paymentStatusData.paymentRefId}
                  paymentDateTime={moment(paymentStatusData.paymentDateTime).utc().format('DD MMMM YYYY[,] LT').replace(/(A|P)(M)/, '$1.$2.')
                    .toString()}
                  type='ORDER'
                  onClose={() => { handleOnClose() }}
                  ctaText={paymentDetail ? paymentDetail.ctaText : ''}
                />
              )}
          </>
        </Modal>) :
        (<Popover
          open={showOrderPopup}
          anchorEl={props.addToCartRef.current}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          classes={{ paper: classes.bottomPopover }}
        >
          <div className={classes.successPopoverWindow}>
            <div className={classes.windowWrap}>
              <div className={classes.mascotIcon}>
                <img src={require('images/ic-mascot.png')} alt="" />
              </div>
              <OrderPlaced setShowOrderPopup={setShowOrderPopup} />
            </div>
          </div>
        </Popover>)
      }</>
  );
};
