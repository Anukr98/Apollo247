import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import React, { useState } from 'react';
import { isRejectedStatus, getStoreName } from 'helpers/commonHelpers';
import { MEDICINE_ORDER_STATUS, MEDICINE_DELIVERY_TYPE } from 'graphql/types/globalTypes';
import {
  getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList as OrdersList,
  getMedicineOrdersOMSList_getMedicineOrdersOMSList_medicineOrdersList_medicineOrdersStatus as StatusDetails,
} from 'graphql/types/getMedicineOrdersOMSList';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import moment from 'moment';
import { AphTrackSlider } from '@aph/web-ui-components';
import { getStatus } from 'helpers/commonHelpers';
import _upperFirst from 'lodash/upperFirst';
import _lowerCase from 'lodash/lowerCase';

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
      [theme.breakpoints.down('xs')]: {
        display: 'block',
        padding: 16,
      },
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
      [theme.breakpoints.down('xs')]: {
        width: '100%',
      },
    },
    itemImg: {
      paddingRight: 20,
      [theme.breakpoints.down('xs')]: {
        paddingRight: 16,
      },
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
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
    },
    orderID: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
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
      [theme.breakpoints.down('xs')]: {
        position: 'absolute',
        right: 6,
        top: 22,
        marginRight: 0,
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
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        display: 'flex',
        paddingLeft: 40,
        paddingRight: 0,
      },
    },
    orderStatus: {
      fontSize: 12,
      fontWeight: 600,
      color: '#02475b',
      lineHeight: '20px',
    },
    orderStatusRejected: {
      fontSize: 12,
      fontWeight: 600,
      color: '#890000',
      lineHeight: '20px',
    },
    statusInfo: {
      fontSize: 12,
      fontWeight: 500,
      color: '#02475b',
      lineHeight: '20px',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 'auto',
      },
    },
    orderTrackSlider: {
      paddingLeft: 20,
      paddingRight: 20,
      width: '40%',
      [theme.breakpoints.down('xs')]: {
        width: '100%',
        paddingLeft: 40,
        paddingRight: 0,
        margin: '8px 0',
      },
    },
    orderError: {
      color: '#890000',
    },
    returnAccepted: {
      backgroundColor: '#f0f1ec',
    },
    noData: {
      fontSize: 14,
      fontWeight: 500,
      color: '#02475b',
      paddingLeft: 20,
      paddingRight: 20,
      textAlign: 'center',
    },
  };
});

interface OrderCardProps {
  orderInfo: OrdersList;
  setShowMobileDetails: (showMobileDetails: boolean) => void;
  orderAutoId: number | null;
  setOrderAutoId: (orderAutoId: number | null) => void;
  // orderStatus: string;
  // sortedList: StatusDetails[];
  setBillNumber: (billNumber: string | null) => void;
  billNumber: string;
}

export const OrderCard: React.FC<OrderCardProps> = (props) => {
  const classes = useStyles({});
  const {
    orderInfo,
    setOrderAutoId,
    setShowMobileDetails,
    // orderStatus,
    // sortedList,
    setBillNumber,
    billNumber,
    orderAutoId,
  } = props;
  const isSmallScreen = useMediaQuery('(max-width:767px)');

  const getDefaultValue = (status: string) => {
    switch (status) {
      case MEDICINE_ORDER_STATUS.ORDER_INITIATED:
      case MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS:
      case MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED:
        return 60;
      case MEDICINE_ORDER_STATUS.ORDER_PLACED:
        return 120;
      case MEDICINE_ORDER_STATUS.ORDER_VERIFIED:
        return 180;
      case MEDICINE_ORDER_STATUS.ORDER_BILLED:
        return 240;
      case MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY:
        return 280;
      case MEDICINE_ORDER_STATUS.DELIVERED:
      case MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE:
        return 360;
    }
  };

  const isSliderDisabled = (sliderStatus: MEDICINE_ORDER_STATUS) => {
    return (
      sliderStatus === MEDICINE_ORDER_STATUS.CANCELLED ||
      sliderStatus === MEDICINE_ORDER_STATUS.RETURN_ACCEPTED
    );
  };

  // const getOrderStatusDate = (currentStatus: MEDICINE_ORDER_STATUS) => {
  //   if (sortedList && sortedList.length > 0) {
  //     const currentStatusData = sortedList.find((status) => status.orderStatus === currentStatus);
  //     return (
  //       currentStatusData &&
  //       moment(new Date(currentStatusData.statusDate)).format('DD MMM YYYY ,hh:mm a')
  //     );
  //   }
  // };

  // const getDeliveryType = (deliveryType: MEDICINE_DELIVERY_TYPE) => {
  //   switch (deliveryType) {
  //     case MEDICINE_DELIVERY_TYPE.HOME_DELIVERY:
  //       return 'Home Delivery';
  //     case MEDICINE_DELIVERY_TYPE.STORE_PICKUP:
  //       return 'Store Pickup';
  //   }
  // };

  const getSlider = (status: MEDICINE_ORDER_STATUS) => {
    switch (status) {
      case MEDICINE_ORDER_STATUS.DELIVERED:
      case MEDICINE_ORDER_STATUS.ORDER_PLACED:
      case MEDICINE_ORDER_STATUS.ORDER_VERIFIED:
      case MEDICINE_ORDER_STATUS.ORDER_INITIATED:
      case MEDICINE_ORDER_STATUS.RETURN_ACCEPTED:
      case MEDICINE_ORDER_STATUS.CANCELLED:
      case MEDICINE_ORDER_STATUS.OUT_FOR_DELIVERY:
      case MEDICINE_ORDER_STATUS.ORDER_BILLED:
      case MEDICINE_ORDER_STATUS.PAYMENT_SUCCESS:
      case MEDICINE_ORDER_STATUS.PRESCRIPTION_UPLOADED:
      case MEDICINE_ORDER_STATUS.PURCHASED_IN_STORE:
        return (
          <AphTrackSlider
            color="primary"
            value={getDefaultValue(status)}
            getAriaValueText={(value: number) => value.toString()}
            disabled={isSliderDisabled(status)}
            min={0}
            max={360}
            valueLabelDisplay="off"
            step={null}
          />
        );

      default:
        return null;
    }
  };

  const getStorePickupItemName = () => {
    const items = orderInfo ? orderInfo.medicineOrderLineItems : [];
    if (items && items.length > 0) {
      const itemsLength = items.length;
      const text = itemsLength === 2 ? 'item' : 'items';
      const firstMedicineName = _upperFirst(_lowerCase(items[0].medicineName));
      return itemsLength > 1
        ? `${firstMedicineName} + ${itemsLength - 1} ${text}`
        : `${firstMedicineName}`;
    }
  };

  return (
    <div
      key={orderInfo.id}
      className={`${classes.root} ${
        (orderInfo.deliveryType === MEDICINE_DELIVERY_TYPE.HOME_DELIVERY &&
          orderAutoId === orderInfo.orderAutoId) ||
        (orderInfo.deliveryType === MEDICINE_DELIVERY_TYPE.STORE_PICKUP &&
          billNumber === orderInfo.billNumber)
          ? classes.cardSelected
          : ''
      }`}
      onClick={() => {
        if (isSmallScreen) {
          setShowMobileDetails(true);
        }
        if (orderInfo.deliveryType === MEDICINE_DELIVERY_TYPE.HOME_DELIVERY) {
          setOrderAutoId(orderInfo.orderAutoId);
          setBillNumber(null);
        } else {
          setBillNumber(orderInfo.billNumber);
          setOrderAutoId(null);
        }
      }}
    >
      <div className={classes.orderedItem}>
        {orderInfo.deliveryType === MEDICINE_DELIVERY_TYPE.STORE_PICKUP ? (
          <>
            <div className={classes.itemImg}>
              <img src={require('images/ic_basket.svg')} alt="" />
            </div>
            <div className={classes.itemSection}>
              <div className={classes.itemName}>{getStorePickupItemName()}</div>
              <div className={classes.orderID}>#{orderInfo.billNumber}</div>
              <div className={classes.deliveryType}>
                <span>
                  {getStoreName(orderInfo.shopAddress)}
                  {isSmallScreen ? null : ` #${orderInfo.billNumber}`}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={classes.itemImg}>
              <img src={require('images/ic_tablets.svg')} alt="" />
            </div>
            <div className={classes.itemSection}>
              <div className={classes.itemName}>Medicines</div>
              <div className={classes.orderID}>#{orderInfo.orderAutoId}</div>
              <div className={classes.deliveryType}>
                <span>
                  Home Delivery
                  {isSmallScreen ? null : ` #${orderInfo.orderAutoId}`}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      <div className={classes.orderTrackSlider}>{getSlider(orderInfo.currentStatus)}</div>
      <div className={classes.orderStatusGroup}>
        {orderInfo.medicineOrdersStatus && (
          <div
            className={
              isRejectedStatus(orderInfo.currentStatus)
                ? `${classes.orderStatusRejected}`
                : `${classes.orderStatus}`
            }
          >
            {getStatus(orderInfo.currentStatus)}
          </div>
        )}

        <div className={classes.statusInfo}>
          {orderInfo.currentStatus && moment(orderInfo.createdDate).format('D MMM YY, hh:mm A')}
        </div>
      </div>
    </div>
  );
};
