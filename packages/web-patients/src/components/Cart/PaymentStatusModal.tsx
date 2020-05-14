import { makeStyles } from '@material-ui/styles';
import { Modal, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { clientRoutes } from 'helpers/clientRoutes';
import { useParams } from 'hooks/routerHooks';
import { useMutation } from 'react-apollo-hooks';
import moment from 'moment';
import { GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails as orderPaymentDetail } from 'graphql/types/GetMedicineOrderDetails';
import { GET_MEDICINE_ORDER_DETAILS } from 'graphql/profiles';
import { useCurrentPatient } from 'hooks/authHooks';
import { OrderStatusContent } from '../OrderStatusContent';
import { MEDICINE_ORDER_PAYMENT_TYPE } from 'graphql/types/globalTypes';

const useStyles = makeStyles(() => {
  return {
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }, loader: {
      textAlign: 'center',
      padding: '20px 0',
    }
  };
});

interface paymentStatusMap {
  [name: string]: string;
}
const status: paymentStatusMap = {
  success: 'success',
  failed: 'failed',
  pending: 'pending',
};

export const PaymentStatusModal: React.FC = (props) => {
  const classes = useStyles({});
  const params = useParams<{
    orderAutoId: string;
    orderStatus: string;
  }>();

  const [orderData, setOrderData] = useState<orderPaymentDetail>(null);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(true);
  const orderDetails = useMutation(GET_MEDICINE_ORDER_DETAILS);
  const currentPatient = useCurrentPatient();
  const orderPaymentData = orderData &&
    orderData.medicineOrderPayments &&
    orderData.medicineOrderPayments.length ? orderData.medicineOrderPayments[0] : null;
  const paymentStatus = orderPaymentData && orderPaymentData.paymentStatus ?
    orderPaymentData.paymentStatus === 'TXN_SUCCESS' || orderPaymentData.paymentStatus === 'success' ? 'success' :
      orderPaymentData.paymentStatus === 'PENDING' ? 'pending' :
        orderPaymentData.paymentStatus === 'TXN_FAILURE' ? 'failed' : '' : '';
  const paymentFailedInfo = 'In case your account has been debited,you should get the refund in 10-14 business days.';
  const paymentSuccessInfo = 'Your order has been placed successfully. We will confirm the order in a few minutes.';
  const paymentPendingInfo = 'Note : Your payment is in progress and this may take a couple of minutes to confirm your booking. We’ll intimate you once your bank confirms the payment.';
  const getPaymentStatusInfo = () => {
    switch (paymentStatus) {
      case status.success: return paymentSuccessInfo;
      case status.pending: return paymentPendingInfo
      case status.failed: return paymentFailedInfo;
      default: return ''
    }
  }
  const getCtaTxt = () => {
    switch (paymentStatus) {
      case status.success: return 'VIEW ORDERS';
      case status.pending: return 'GO TO HOME'
      case status.failed: return 'TRY AGAIN';
      default: return ''
    }
  }
  const paymentStatusCallback = () => {
    let redirectUrl = '';
    switch (paymentStatus) {
      case status.success: redirectUrl = clientRoutes.yourOrders();
        break;
      case status.pending: redirectUrl = clientRoutes.welcome();
        break;
      case status.failed: redirectUrl = clientRoutes.medicinesCart();
        break;
      default: redirectUrl = clientRoutes.welcome(); break;
    }
    window.location.href = redirectUrl;
  }
  const handleOnClose = () => {
    window.location.href = clientRoutes.medicines();
    // setShowPaymentStatusModal(false)
  }

  useEffect(() => {
    if (params.orderAutoId) {
      orderDetails({
        variables: {
          patientId: currentPatient && currentPatient.id,
          orderAutoId:
            typeof params.orderAutoId === 'string' ? parseInt(params.orderAutoId) : params.orderAutoId,
        },
      })
        .then((res: any) => {
          if (
            res &&
            res.data &&
            res.data.getMedicineOrderDetails &&
            res.data.getMedicineOrderDetails.MedicineOrderDetails
          ) {
            const medicineOrderDetails = res.data.getMedicineOrderDetails.MedicineOrderDetails;
            if (medicineOrderDetails && medicineOrderDetails.medicineOrderPayments && medicineOrderDetails.medicineOrderPayments.length) {
              setOrderData(medicineOrderDetails);
            } else {
              // redirect to medicine 
              window.location.href = clientRoutes.medicines()
            }
          }
        })
        .catch((e) => {
          // Redirect to medicine
          window.location.href = clientRoutes.medicines()
        });
    }
  }, []);

  return (
    <Modal
      open={showPaymentStatusModal}
      className={classes.modal}
      disableBackdropClick
      disableEscapeKeyDown
    >
      <>
        {!orderData ? (
          <div className={classes.loader}>
            <CircularProgress />
          </div>
        ) : (
            <OrderStatusContent
              paymentStatus={paymentStatus}
              paymentInfo={getPaymentStatusInfo()}
              orderStatusCallback={paymentStatusCallback}
              orderId={orderData.orderAutoId}
              amountPaid={orderPaymentData.amountPaid}
              paymentType={MEDICINE_ORDER_PAYMENT_TYPE[orderPaymentData.paymentType]}
              paymentRefId={orderPaymentData.paymentRefId}
              paymentDateTime={moment(orderPaymentData.paymentDateTime).format('DD MMMM YYYY[,] LT')}
              type='ORDER'
              onClose={() => { handleOnClose() }}
              ctaText={getCtaTxt()}
            />
          )}
      </>
    </Modal>
  );
};
