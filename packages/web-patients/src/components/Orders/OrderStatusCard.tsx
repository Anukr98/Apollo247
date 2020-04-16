import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, CircularProgress } from '@material-ui/core';
import {
  GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails as orederDetails,
  GetMedicineOrderDetails_getMedicineOrderDetails_MedicineOrderDetails_medicineOrdersStatus as statusDetails,
} from 'graphql/types/GetMedicineOrderDetails';
import moment from 'moment';
import { MEDICINE_ORDER_STATUS } from 'graphql/types/globalTypes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    orderStatusGroup: {
      marginLeft: 12,
    },
    cardGroup: {
      paddingLeft: 34,
      paddingBottom: 8,
      position: 'relative',
      '&:before': {
        position: 'absolute',
        content: '""',
        width: 4,
        top: 0,
        left: 0,
        height: '100%',
        backgroundColor: '#00b38e',
        opacity: 0.2,
        borderRadius: 2,
      },
      '&:last-child': {
        '&:before': {
          display: 'none',
        },
      },
      '&:after': {
        position: 'absolute',
        content: '""',
        width: 8,
        height: 8,
        top: 0,
        left: -2,
        borderRadius: '50%',
        backgroundColor: '#01475b',
      },
    },
    statusCard: {
      backgroundColor: '#eff0eb',
      boxShadow: '0 2px 4px 0 rgba(128, 128, 128, 0.3)',
      borderRadius: 10,
      fontSize: 16,
      fontWeight: 500,
      color: '#01475b',
      padding: 16,
    },
    statusInfo: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      letterSpacing: 0.04,
      paddingTop: 8,
      marginTop: 5,
      borderTop: '0.5px solid rgba(2,71,91,0.3)',
      display: 'flex',
      '& span': {
        opacity: 0.6,
      },
      '& span:last-child': {
        marginLeft: 'auto',
      },
    },
    orderStatusActive: {
      backgroundColor: theme.palette.common.white,
      '& span': {
        opacity: 1,
      },
      '&:before': {
        position: 'absolute',
        content: '""',
        width: 28,
        height: 28,
        top: -4,
        left: -12,
        backgroundImage: 'url(' + require('images/ic_tracker_done.svg') + ')',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'transparent',
        borderRadius: 2,
        zIndex: 2,
      },
    },
    orderStatusCompleted: {
      '&:after': {
        position: 'absolute',
        content: '""',
        width: 4,
        top: 0,
        left: 0,
        height: '100%',
        backgroundColor: '#0087ba',
        zIndex: 1,
      },
    },
    loader: {
      margin: '20px auto',
      textAlign: 'center',
      display: 'block',
    },
  };
});

type OrderStatusCardProps = {
  orderDetailsData: orederDetails | null;
  isLoading: boolean;
};

export const OrderStatusCard: React.FC<OrderStatusCardProps> = (props) => {
  const classes = useStyles({});

  const getSortedstatusList = (statusList: (statusDetails | null)[]) => {
    if (statusList && statusList.length > 0) {
      const filteredStatusList = statusList.filter((status) => status && status.hideStatus);
      return filteredStatusList.sort(
        (a, b) =>
          moment(a && a.statusDate)
            .toDate()
            .getTime() -
          moment(b && b.statusDate)
            .toDate()
            .getTime()
      );
    }
  };

  const orderStatusList =
    props.orderDetailsData &&
    getSortedstatusList(props.orderDetailsData.medicineOrdersStatus || []);

  const statusArray = [
    'CANCELLED',
    'CANCEL_REQUEST',
    'DELIVERED',
    'ITEMS_RETURNED',
    'ORDER_CONFIRMED',
    'ORDER_FAILED',
    'ORDER_INITIATED',
    'ORDER_PLACED',
    'ORDER_VERIFIED',
    'OUT_FOR_DELIVERY',
    'PAYMENT_SUCCESS',
    'PICKEDUP',
    'PRESCRIPTION_CART_READY',
    'PRESCRIPTION_UPLOADED',
    'RETURN_ACCEPTED',
    'RETURN_INITIATED',
  ];

  const completedStatusArray = ['CANCELLED', 'ORDER_FAILED', 'DELIVERED', 'OUT_FOR_DELIVERY'];
  const getStatus = (status: MEDICINE_ORDER_STATUS) => {
    switch (status) {
      case MEDICINE_ORDER_STATUS.CANCELLED:
        return 'Order Cancelled';
      case MEDICINE_ORDER_STATUS.CANCEL_REQUEST:
        return 'Cancel Requested';
      case MEDICINE_ORDER_STATUS.DELIVERED:
        return 'Order Delivered';
      case MEDICINE_ORDER_STATUS.ITEMS_RETURNED:
        return 'Items Returned';
      case MEDICINE_ORDER_STATUS.ORDER_CONFIRMED:
        return 'Order Confirmed';
      case MEDICINE_ORDER_STATUS.ORDER_FAILED:
        return 'Order Failed';
      case MEDICINE_ORDER_STATUS.ORDER_PLACED:
        return 'Order Placed';
      case MEDICINE_ORDER_STATUS.ORDER_VERIFIED:
        return 'Order Verified';
      case MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY:
        return 'Order Shipped';
      case MEDICINE_ORDER_STATUS.PICKEDUP:
        return 'Order Picked Up';
      case MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY:
        return 'Prescription Cart Ready';
      case MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED:
        return 'Prescription Uploaded';
      case MEDICINE_ORDER_STATUS.QUOTE:
        return 'Quote';
      case MEDICINE_ORDER_STATUS.RETURN_ACCEPTED:
        return 'Return Accepted';
      case MEDICINE_ORDER_STATUS.RETURN_INITIATED:
        return 'Return Requested';
      case MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS:
        return 'Payment Success';
      case MEDICINE_ORDER_STATUS.ORDER_INITIATED:
        return 'Order Initiated';
      case MEDICINE_ORDER_STATUS.PAYMENT_FAILED:
        return 'Payment Failed';
      case MEDICINE_ORDER_STATUS.READY_AT_STORE:
        return 'Ready At Store';
      case 'TO_BE_DELIVERED' as any:
        return 'Expected Order Delivery';
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item sm={12} xs={12}>
        <div className={classes.orderStatusGroup}>
          {props.isLoading ? (
            <div className={classes.loader}>
              <CircularProgress />
            </div>
          ) : (
            orderStatusList &&
            orderStatusList.map(
              (statusInfo) =>
                statusInfo && (
                  <div id={statusInfo.id} className={classes.cardGroup}>
                    <div
                      className={`${classes.statusCard} ${
                        statusInfo.orderStatus &&
                        completedStatusArray.includes(statusInfo.orderStatus)
                          ? `${classes.orderStatusCompleted}${classes.orderStatusActive}`
                          : classes.orderStatusActive
                      }`}
                    >
                      {statusInfo.orderStatus && getStatus(statusInfo.orderStatus)}
                      <div className={classes.statusInfo}>
                        <span>{moment(new Date(statusInfo.statusDate)).format('DD MMM YYYY')}</span>
                        <span>{moment(new Date(statusInfo.statusDate)).format('hh:mm a')}</span>
                      </div>
                    </div>
                  </div>
                )
            )
          )}
        </div>
      </Grid>
    </Grid>
  );
};
