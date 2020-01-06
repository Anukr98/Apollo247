import { makeStyles } from '@material-ui/styles';
import { Theme, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import {
  AphTrackSlider,
  AphOnHoldSlider,
  AphDelayedSlider,
  AphDeliveredSlider,
} from '@aph/web-ui-components';
import Scrollbars from 'react-custom-scrollbars';
import {
  GetMedicineOrdersList,
  GetMedicineOrdersListVariables,
  GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList as ordersList,
  GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList_medicineOrdersStatus as statusDetails,
} from 'graphql/types/GetMedicineOrdersList';

import moment from 'moment';
import { useQueryWithSkip } from 'hooks/apolloHooks';
import { GET_MEDICINE_ORDERS_LIST } from 'graphql/profiles';
import { useAllCurrentPatients } from 'hooks/authHooks';
import { MEDICINE_ORDER_STATUS } from 'graphql/types/globalTypes';

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {
      backgroundColor: theme.palette.common.white,
      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
      borderRadius: 5,
      padding: 10,
      display: 'flex',
      alignItems: 'center',
      marginBottom: 10,
      cursor: 'pointer',
      border: 'solid 1px transparent',
      position: 'relative',
    },
    cardSelected: {
      border: 'solid 1px #00b38e',
      '&:before, &:after': {
        left: '100%',
        top: '50%',
        border: 'solid transparent',
        content: '""',
        height: 0,
        width: 0,
        position: 'absolute',
      },
      '&:after': {
        borderColor: 'rgba(255, 255, 255, 0)',
        borderLeftColor: '#fff',
        borderWidth: 7,
        marginTop: -7,
      },
      '&:before': {
        borderColor: 'rgba(0, 179, 142, 0)',
        borderLeftColor: '#00b38e',
        borderWidth: 8,
        marginTop: -8,
      },
    },
    orderListing: {
      paddingLeft: 10,
    },
    orderedItem: {
      display: 'flex',
      alignItems: 'center',
      width: '40%',
    },
    itemImg: {
      paddingRight: 20,
      '& img': {
        verticalAlign: 'middle',
      },
    },
    itemSection: {
      paddingRight: 20,
    },
    itemName: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
    },
    deliveryType: {
      fontSize: 10,
      fontWeight: 500,
      color: '#658f9b',
      marginLeft: -1,
      marginRight: -1,
      '& span': {
        paddingRight: 10,
        paddingLeft: 10,
        borderLeft: '0.5px solid rgba(2,71,91,0.3)',
      },
      '& span:first-child': {
        paddingLeft: 1,
        borderLeft: 0,
      },
    },
    customScroll: {
      paddingLeft: 10,
      paddingRight: 15,
    },
    orderStatusGroup: {
      marginLeft: 'auto',
      paddingLeft: 20,
      width: '25%',
    },
    orderStatus: {
      fontSize: 12,
      fontWeight: 600,
      color: '#02475b',
      lineHeight: '20px',
    },
    statusInfo: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      lineHeight: '20px',
    },
    orderTrackSlider: {
      paddingLeft: 20,
      paddingRight: 20,
      width: '40%',
    },
    orderError: {
      color: '#890000',
    },
    returnAccepted: {
      backgroundColor: '#f0f1ec',
    },
  };
});

function valuetext(value: number) {
  return `${value}`;
}

type OrderCardProps = {
  setOrderAutoId: (orderAutoId: number) => void;
  orderAutoId: number;
};

export const OrderCard: React.FC<OrderCardProps> = (props) => {
  const classes = useStyles({});
  const { currentPatient } = useAllCurrentPatients();

  const { data, error, loading } = useQueryWithSkip<
    GetMedicineOrdersList,
    GetMedicineOrdersListVariables
  >(GET_MEDICINE_ORDERS_LIST, {
    variables: {
      patientId: currentPatient && currentPatient.id,
    },
  });
  if (loading)
    return (
      <div>
        <CircularProgress />
      </div>
    );
  if (error) return <div>Error :(</div>;

  const getSortedstatusList = (statusList: (statusDetails | null)[]) => {
    if (statusList && statusList.length > 0) {
      const filteredStatusList = statusList.filter((status) => status && status.hideStatus);
      return (
        filteredStatusList.sort(
          (a, b) =>
            moment(b && b.statusDate)
              .toDate()
              .getTime() -
            moment(a && a.statusDate)
              .toDate()
              .getTime()
        ) || []
      );
    }
    return null;
  };

  const getStatus = (status: MEDICINE_ORDER_STATUS) => {
    switch (status) {
      case MEDICINE_ORDER_STATUS.ORDER_INITIATED:
        return 'Order Initiated';
      case MEDICINE_ORDER_STATUS.ORDER_PLACED:
        return 'Order Placed';
      case MEDICINE_ORDER_STATUS.ORDER_VERIFIED:
        return 'Order Verified';
      case MEDICINE_ORDER_STATUS.ORDER_FAILED:
        return 'Order Failed';
      case MEDICINE_ORDER_STATUS.ORDER_CONFIRMED:
        return 'Order Confirmed';
      case MEDICINE_ORDER_STATUS.CANCELLED:
        return 'Order Cancelled';
      case MEDICINE_ORDER_STATUS.CANCEL_REQUEST:
        return 'Order Cancel Requested';
      case MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY:
        return 'Order Out for Delivery';
      case MEDICINE_ORDER_STATUS.DELIVERED:
        return 'Order Deliverd';
      case MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS:
        return 'Order Payment Success';
      case MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED:
        return 'Prescription Uploaded';
      case MEDICINE_ORDER_STATUS.PICKEDUP:
        return 'Order Picked up';
      case MEDICINE_ORDER_STATUS.PRESCRIPTION_CART_READY:
        return 'Prescription Cart Ready';
      case MEDICINE_ORDER_STATUS.RETURN_INITIATED:
        return 'Return Initiated';
      case MEDICINE_ORDER_STATUS.RETURN_ACCEPTED:
        return 'Return Accepted';
      default:
        return 'Order Initiated';
    }
  };

  const getOrderStatus = (status: (statusDetails | null)[]) => {
    const sortedList = getSortedstatusList(status);
    if (sortedList && sortedList.length > 0) {
      const firstSortedData = sortedList[0];
      if (firstSortedData && firstSortedData.orderStatus) {
        return getStatus(firstSortedData.orderStatus);
      }
    }
  };

  const getOrderDeliveryDate = (status: (statusDetails | null)[]) => {
    const sortedList = getSortedstatusList(status);
    if (sortedList && sortedList.length > 0) {
      const firstSortedData = sortedList[0];
      return (
        firstSortedData &&
        moment(new Date(firstSortedData.statusDate)).format('DD MMM YYYY ,hh:mm a')
      );
    }
  };

  if (
    data &&
    data.getMedicineOrdersList &&
    data.getMedicineOrdersList.MedicineOrdersList &&
    data.getMedicineOrdersList.MedicineOrdersList.length > 0
  ) {
    const orderListData = data.getMedicineOrdersList.MedicineOrdersList;

    const firstOrderInfo = orderListData[0];
    if (!props.orderAutoId && firstOrderInfo && firstOrderInfo.orderAutoId) {
      props.setOrderAutoId(firstOrderInfo.orderAutoId);
    }

    return (
      <div className={classes.orderListing}>
        <Scrollbars autoHide={true} autoHeight autoHeightMax={'calc(100vh - 200px)'}>
          <div className={classes.customScroll}>
            {orderListData &&
              orderListData.length > 0 &&
              orderListData.map(
                (orderInfo) =>
                  orderInfo && (
                    <div
                      key={orderInfo.id}
                      className={classes.root}
                      onClick={() => props.setOrderAutoId(orderInfo.orderAutoId || 0)}
                    >
                      <div className={classes.orderedItem}>
                        <div className={classes.itemImg}>
                          <img src={require('images/ic_tablets.svg')} alt="" />
                        </div>
                        <div className={classes.itemSection}>
                          <div className={classes.itemName}>Medicines</div>
                          <div className={classes.deliveryType}>
                            <span>{orderInfo.deliveryType}</span>
                            <span>#{orderInfo.orderAutoId}</span>
                          </div>
                        </div>
                      </div>
                      <div className={classes.orderTrackSlider}>
                        <AphTrackSlider
                          color="primary"
                          defaultValue={80}
                          getAriaValueText={valuetext}
                          min={0}
                          max={360}
                          valueLabelDisplay="off"
                        />
                      </div>
                      <div className={classes.orderStatusGroup}>
                        {orderInfo.medicineOrdersStatus && (
                          <div className={classes.orderStatus}>
                            {getOrderStatus(orderInfo.medicineOrdersStatus)}
                          </div>
                        )}
                        <div className={classes.statusInfo}>
                          {orderInfo.medicineOrdersStatus &&
                            getOrderDeliveryDate(orderInfo.medicineOrdersStatus)}
                        </div>
                      </div>
                    </div>
                  )
              )}
          </div>
        </Scrollbars>
      </div>
    );
  }
  return <p>No Data Found</p>;
};
